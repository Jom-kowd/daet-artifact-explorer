import { supabase } from "@/integrations/supabase/client";

export async function fetchArtifacts() {
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
