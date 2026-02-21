import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CategoriesTab = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("categories").insert({ name: name.trim() });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setName("");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    toast({ title: "Category added" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    toast({ title: "Category deleted" });
  };

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <Input placeholder="New category name…" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="max-w-xs" />
        <Button onClick={handleAdd} disabled={loading} size="sm"><Plus className="mr-1 h-4 w-4" />Add</Button>
      </div>
      <div className="space-y-2">
        {categories?.map((cat: any) => (
          <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <span className="font-medium">{cat.name}</span>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {(!categories || categories.length === 0) && (
          <p className="py-8 text-center text-sm text-muted-foreground">No categories yet. Add one above.</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesTab;
