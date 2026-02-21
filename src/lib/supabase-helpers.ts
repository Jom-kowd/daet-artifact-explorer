import { supabase } from "@/integrations/supabase/client";

// For the Public Gallery: Only gets APPROVED artifacts
export async function fetchArtifacts() {
  // Added "as any" to supabase to stop the infinite TypeScript loop
  const { data, error } = await (supabase as any)
    .from("artifacts")
    .select("*, categories(name), artifact_images(*)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return data;
}

// For the Admin Dashboard: Gets ALL artifacts (including pending ones)
export async function fetchAdminArtifacts() {
  const { data, error } = await supabase
    .from("artifacts")
    .select("*, categories(name), artifact_images(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchArtifact(id: string) {
  const { data, error } = await supabase
    .from("artifacts")
    .select("*, categories(name), artifact_images(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function logQrScan(artifactId: string) {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone/i.test(ua);
  const browser = /Chrome/i.test(ua) ? "Chrome" : /Firefox/i.test(ua) ? "Firefox" : /Safari/i.test(ua) ? "Safari" : "Other";

  await supabase.from("qr_scans").insert({
    artifact_id: artifactId,
    device_type: isMobile ? "Mobile" : "Desktop",
    browser,
    user_agent: ua,
  });
}

export async function incrementViewCount(artifactId: string) {
  await supabase.rpc("increment_view_count", { artifact_uuid: artifactId });
}

export async function fetchScanAnalytics() {
  const { data, error } = await supabase
    .from("qr_scans")
    .select("*")
    .order("scanned_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadArtifactImage(file: File) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("artifact-images")
    .upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("artifact-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function checkIsAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

// Get the current user's role
export const getUserRole = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();
    
  return data?.role || null;
};

// Insert a new activity log
export const logActivity = async (action: string, details: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const role = await getUserRole();

  // Added "as any" to bypass the TypeScript warning
  await supabase.from("activity_logs" as any).insert({
    user_id: session.user.id,
    user_email: session.user.email,
    role: role || 'unknown',
    action: action,
    details: details
  });
};

// Fetch activity logs
export const fetchActivityLogs = async () => {
  // Added "as any" to bypass the TypeScript warning
  const { data, error } = await supabase
    .from("activity_logs" as any)
    .select("*")
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return data;
};