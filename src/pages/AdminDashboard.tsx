import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QrCode, Plus, Trash2, Pencil, LogOut, Layers, Image, Eye, ClipboardList, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminArtifacts, fetchCategories, uploadArtifactImage, getUserRole, logActivity } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import ActivityLogsTab from "@/components/admin/ActivityLogsTab";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      
      const role = await getUserRole();
      if (role !== "admin" && role !== "staff") { 
        toast({ title: "Access denied", description: "You don't have dashboard privileges.", variant: "destructive" }); 
        navigate("/"); 
        return; 
      }
      setIsAdmin(role === "admin"); // True if admin, False if staff
    };
    check();
  }, [navigate, toast]);

  const { data: artifacts } = useQuery({ queryKey: ["admin_artifacts"], queryFn: fetchAdminArtifacts, enabled: isAdmin !== null });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, enabled: isAdmin !== null });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (isAdmin === null) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4" />View Site</Button></Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="mr-1 h-4 w-4" />Logout</Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Artifacts" value={artifacts?.length || 0} icon={<Layers className="h-5 w-5" />} />
          <StatCard label="Pending Approval" value={artifacts?.filter((a: any) => a.status === 'pending').length || 0} icon={<CheckCircle className="h-5 w-5 text-yellow-500" />} />
          <StatCard label="Total Views" value={artifacts?.reduce((sum: number, a: any) => sum + (a.view_count || 0), 0) || 0} icon={<Eye className="h-5 w-5" />} />
          <StatCard label="Categories" value={categories?.length || 0} icon={<QrCode className="h-5 w-5" />} />
        </div>

        <Tabs defaultValue="artifacts">
          {/* RESPONSIVE TABS: Allows horizontal scrolling on small screens instead of squishing */}
          <div className="w-full overflow-x-auto pb-2 -mb-2">
            <TabsList className="flex w-max min-w-full justify-start md:justify-center">
              <TabsTrigger value="artifacts" className="flex-shrink-0">Artifacts</TabsTrigger>
              {isAdmin && <TabsTrigger value="categories" className="flex-shrink-0">Categories</TabsTrigger>}
              {isAdmin && <TabsTrigger value="analytics" className="flex-shrink-0">Analytics</TabsTrigger>}
              <TabsTrigger value="logs" className="flex-shrink-0"><ClipboardList className="mr-2 h-4 w-4 hidden sm:inline"/> Activity Logs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="artifacts" className="mt-6">
            <ArtifactsTab artifacts={artifacts} categories={categories} isAdmin={!!isAdmin} />
          </TabsContent>
          
          {isAdmin && (
            <>
              <TabsContent value="categories" className="mt-6"><CategoriesTab /></TabsContent>
              <TabsContent value="analytics" className="mt-6"><AnalyticsTab /></TabsContent>
            </>
          )}
          
          <TabsContent value="logs" className="mt-6">
            <ActivityLogsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-museum">
    <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs font-medium uppercase tracking-wider">{label}</span></div>
    <p className="mt-2 font-display text-2xl font-bold">{value}</p>
  </div>
);

const ArtifactsTab = ({ artifacts, categories, isAdmin }: { artifacts: any; categories: any; isAdmin: boolean }) => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category_id: "", description: "", historical_background: "", date_origin: "", location_found: "", display_location: "", condition_status: "Good" });
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const resetForm = () => {
    setForm({ name: "", category_id: "", description: "", historical_background: "", date_origin: "", location_found: "", display_location: "", condition_status: "Good" });
    setFiles(null);
    setEditId(null);
  };

  const openEdit = (artifact: any) => {
    setEditId(artifact.id);
    setForm({
      name: artifact.name || "",
      category_id: artifact.category_id || "",
      description: artifact.description || "",
      historical_background: artifact.historical_background || "",
      date_origin: artifact.date_origin || "",
      location_found: artifact.location_found || "",
      display_location: artifact.display_location || "",
      condition_status: artifact.condition_status || "Good",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        category_id: form.category_id || null,
        status: isAdmin ? 'approved' : 'pending' 
      };
      
      let artifactId = editId;

      if (editId) {
        // FIXED: Added (supabase as any)
        const { error } = await (supabase as any).from("artifacts").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        // FIXED: Added (supabase as any)
        const { data, error } = await (supabase as any).from("artifacts").insert(payload).select("id").single();
        if (error) throw error;
        artifactId = data.id;
        
        const publicUrl = `${window.location.origin}/artifact/${artifactId}`;
        await supabase.from("artifacts").update({ qr_code_url: publicUrl }).eq("id", artifactId);
      }

      if (files && artifactId) {
        for (let i = 0; i < files.length; i++) {
          const url = await uploadArtifactImage(files[i]);
          await supabase.from("artifact_images").insert({ artifact_id: artifactId, image_url: url, display_order: i });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["admin_artifacts"] });
      toast({ title: editId ? "Artifact updated" : (isAdmin ? "Artifact created" : "Artifact submitted for approval!") });
      
      await logActivity(
        editId ? "Edit Artifact" : "Create Artifact", 
        `${editId ? 'Edited' : 'Created'} artifact: ${form.name}`
      );

      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // FIXED: Added (supabase as any) to stop TypeScript errors on 'status'
  const handleApprove = async (id: string, name: string) => {
    await (supabase as any).from("artifacts").update({ status: 'approved' }).eq("id", id);
    await logActivity("Approve Artifact", `Approved artifact: ${name}`);
    queryClient.invalidateQueries({ queryKey: ["admin_artifacts"] });
    toast({ title: "Artifact Approved!" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this artifact?")) return;
    await supabase.from("artifacts").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_artifacts"] });
    toast({ title: "Artifact deleted" });
    await logActivity("Delete Artifact", `Deleted artifact ID: ${id}`);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">All Artifacts</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Artifact</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Edit" : "Add"} Artifact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div><Label>Historical Background</Label><Textarea value={form.historical_background} onChange={(e) => setForm({ ...form, historical_background: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date of Origin</Label><Input value={form.date_origin} onChange={(e) => setForm({ ...form, date_origin: e.target.value })} /></div>
                <div><Label>Location Found</Label><Input value={form.location_found} onChange={(e) => setForm({ ...form, location_found: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Display Location</Label><Input value={form.display_location} onChange={(e) => setForm({ ...form, display_location: e.target.value })} /></div>
                <div><Label>Condition</Label>
                  <Select value={form.condition_status} onValueChange={(v) => setForm({ ...form, condition_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Excellent", "Good", "Fair", "Poor", "Restored"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Images</Label><Input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} /></div>
              
              {!isAdmin && !editId && <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">Note: This artifact will need admin approval before appearing on the public website.</p>}
              
              <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Saving…" : "Save Artifact"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {artifacts?.map((a: any) => (
          <div key={a.id} className={`flex items-center gap-4 rounded-lg border p-4 ${a.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-card border-border'}`}>
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {a.artifact_images?.[0]?.image_url ? (
                <img src={a.artifact_images[0].image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground"><Image className="h-5 w-5" /></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div>
                <p className="font-display font-semibold truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.categories?.name || "Uncategorized"} · {a.view_count} views</p>
              </div>
              {a.status === 'pending' && (
                <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  Pending Approval
                </span>
              )}
            </div>
            
            <div className="hidden md:block">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 mr-2">
                    <QrCode className="h-4 w-4" />
                    View QR
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md flex flex-col items-center p-6">
                  <DialogHeader>
                    <DialogTitle className="text-center font-display mb-2 text-xl">{a.name}</DialogTitle>
                  </DialogHeader>
                  <div className="rounded-xl border-4 border-white bg-white p-4 shadow-lg">
                    <QRCodeSVG value={`${window.location.origin}/artifact/${a.id}`} size={256} level="H" includeMargin={true} />
                  </div>
                  <p className="mt-4 text-center text-sm text-muted-foreground">Right-click the QR code above and select <br/><strong>"Save image as..."</strong> to download clearly.</p>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex gap-1">
              {isAdmin && a.status === 'pending' && (
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 mr-2" onClick={() => handleApprove(a.id, a.name)}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
              )}
              
              {isAdmin && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </>
              )}
            </div>
          </div>
        ))}
        {(!artifacts || artifacts.length === 0) && (
          <div className="py-12 text-center text-muted-foreground">No artifacts yet. Click "Add Artifact" to get started.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
