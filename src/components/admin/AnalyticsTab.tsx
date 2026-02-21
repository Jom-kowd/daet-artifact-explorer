import { useQuery } from "@tanstack/react-query";
import { fetchScanAnalytics, fetchArtifacts } from "@/lib/supabase-helpers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useMemo } from "react";

const COLORS = ["hsl(42, 55%, 55%)", "hsl(15, 60%, 50%)", "hsl(30, 25%, 40%)", "hsl(200, 40%, 50%)", "hsl(140, 40%, 45%)"];

const AnalyticsTab = () => {
  const { data: scans } = useQuery({ queryKey: ["scan-analytics"], queryFn: fetchScanAnalytics });
  const { data: artifacts } = useQuery({ queryKey: ["artifacts"], queryFn: fetchArtifacts });

  const dailyScans = useMemo(() => {
    if (!scans) return [];
    const counts: Record<string, number> = {};
    scans.forEach((s: any) => {
      const day = new Date(s.scanned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts).slice(-14).map(([date, count]) => ({ date, scans: count }));
  }, [scans]);

  const deviceData = useMemo(() => {
    if (!scans) return [];
    const counts: Record<string, number> = {};
    scans.forEach((s: any) => {
      const device = s.device_type || "Unknown";
      counts[device] = (counts[device] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [scans]);

  const topArtifacts = useMemo(() => {
    if (!artifacts) return [];
    return [...artifacts].sort((a: any, b: any) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5).map((a: any) => ({ name: a.name?.substring(0, 20), views: a.view_count || 0 }));
  }, [artifacts]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Scans Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold">Daily QR Scans</h3>
          {dailyScans.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyScans}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 85%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="scans" fill="hsl(42, 55%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No scan data yet</p>
          )}
        </div>

        {/* Device Distribution */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold">Device Distribution</h3>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No device data yet</p>
          )}
        </div>
      </div>

      {/* Top Artifacts */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Most Viewed Artifacts</h3>
        {topArtifacts.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topArtifacts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 85%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="views" fill="hsl(15, 60%, 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">No artifact data yet</p>
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Total scans recorded: <strong>{scans?.length || 0}</strong>
      </div>
    </div>
  );
};

export default AnalyticsTab;
