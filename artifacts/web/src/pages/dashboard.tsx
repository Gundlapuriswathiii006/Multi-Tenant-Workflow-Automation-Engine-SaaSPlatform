import { 
  useGetDashboardStats, 
  useGetExecutionTrend, 
  useGetRecentActivity,
  useGetMe
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Workflow, 
  Users,
  Play
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: trend, isLoading: trendLoading } = useGetExecutionTrend({
    query: {
      queryKey: ["dashboard-trend"],
    }
  });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({
    query: {
      queryKey: ["dashboard-activity"],
    }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name}. Here's what's happening in your workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-7 w-20" /> : (
              <>
                <div className="text-2xl font-bold">{stats?.totalWorkflows || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeWorkflows || 0} active
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Executions (30d)</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-7 w-20" /> : (
              <>
                <div className="text-2xl font-bold">{stats?.totalExecutions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all workflows
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-7 w-20" /> : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.successRate ? `${(stats.successRate * 100).toFixed(1)}%` : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.recentFailures || 0} recent failures
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-7 w-20" /> : (
              <>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active in workspace
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Execution Trend</CardTitle>
            <CardDescription>Executions over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {trendLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : trend && trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFailure" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => format(new Date(val), "MMM d")}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    labelFormatter={(val) => format(new Date(val), "MMM d, yyyy")}
                  />
                  <Area
                    type="monotone"
                    dataKey="successCount"
                    name="Successful"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorSuccess)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="failureCount"
                    name="Failed"
                    stroke="hsl(var(--destructive))"
                    fillOpacity={1}
                    fill="url(#colorFailure)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No execution data available.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>Latest workflow runs</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between space-x-4 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      {exec.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : exec.status === "failure" ? (
                        <XCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <Activity className="h-5 w-5 text-amber-500 animate-pulse" />
                      )}
                      <div>
                        <p className="text-sm font-medium leading-none">{exec.workflowName || `Workflow #${exec.workflowId}`}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(exec.startedAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={exec.status === "success" ? "outline" : exec.status === "failure" ? "destructive" : "secondary"}>
                      {exec.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
