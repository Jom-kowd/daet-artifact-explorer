import { useQuery } from "@tanstack/react-query";
import { fetchActivityLogs } from "@/lib/supabase-helpers";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ActivityLogsTab = () => {
  const { data: logs, isLoading } = useQuery({ queryKey: ["activity_logs"], queryFn: fetchActivityLogs });
  const [filter, setFilter] = useState<"all" | "admin-login" | "staff-login">("all");

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading logs...</div>;

  // FIX IS HERE: Added ": any" to log
  const filteredLogs = logs?.filter((log: any) => {
    if (filter === "admin-login") return log.role === "admin" && log.action === "Login";
    if (filter === "staff-login") return log.role === "staff" && log.action === "Login";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All Activity</Button>
        <Button variant={filter === "admin-login" ? "default" : "outline"} size="sm" onClick={() => setFilter("admin-login")}>Admin Logins</Button>
        <Button variant={filter === "staff-login" ? "default" : "outline"} size="sm" onClick={() => setFilter("staff-login")}>Staff Logins</Button>
      </div>

      <ScrollArea className="h-[500px] rounded-md border bg-card p-4">
        <div className="space-y-4">
          {filteredLogs?.map((log: any) => (
            <div key={log.id} className="flex justify-between border-b pb-2 text-sm">
              <div>
                <span className="font-semibold text-primary">[{log.action}]</span>
                <span className="ml-2 font-medium">{log.user_email}</span>
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{log.role}</span>
                <p className="mt-1 text-muted-foreground">{log.details}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          {!filteredLogs?.length && <p className="text-center text-muted-foreground">No logs found.</p>}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActivityLogsTab;