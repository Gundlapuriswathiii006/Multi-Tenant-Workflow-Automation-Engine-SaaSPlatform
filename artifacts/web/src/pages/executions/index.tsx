import { useListExecutions, useRetryExecution, getListExecutionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, Activity, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ListExecutionsStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Executions() {
  const [statusFilter, setStatusFilter] = useState<ListExecutionsStatus | "all">("all");
  const { data: executions, isLoading } = useListExecutions({
    query: {
      queryKey: ["executions", statusFilter],
    }
  }); // Note: The schema might not support passing the parameter directly, but we assume it does based on instructions. The generated types might need options object. Wait, useListExecutions signature: useListExecutions(params?: ListExecutionsParams, options?: ...)
  
  // Actually, let's just use the client side filtering if the hook doesn't support params nicely or we can pass it to query.
  // Wait, looking at the API types, useListExecutions doesn't take params as first arg in some versions. Let's just fetch all and client-side filter if unsure, or try to pass.
  // The schema has `ListExecutionsParams` { status?: ListExecutionsStatus, workflowId?: number, limit?: number }.
  // Let's just fetch without params to be safe and filter client-side for this demo, or pass it as first param if it exists.
  
  const retryMutation = useRetryExecution();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRetry = (id: number) => {
    retryMutation.mutate({ executionId: id }, {
      onSuccess: () => {
        toast({ title: "Execution retry initiated" });
        queryClient.invalidateQueries({ queryKey: getListExecutionsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Error retrying execution", description: err.message, variant: "destructive" });
      }
    });
  };

  const filteredExecutions = executions?.filter(ex => {
    if (statusFilter === "all") return true;
    return ex.status === statusFilter;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executions</h1>
          <p className="text-muted-foreground mt-1">
            View logs and history of all workflow runs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
              <SelectItem value="running">Running</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Error Message</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredExecutions && filteredExecutions.length > 0 ? (
              filteredExecutions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {execution.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : execution.status === "failure" ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
                      )}
                      <Badge variant={execution.status === "success" ? "outline" : execution.status === "failure" ? "destructive" : "secondary"}>
                        {execution.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {execution.workflowName || `Workflow #${execution.workflowId}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(execution.startedAt), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {execution.durationMs ? `${(execution.durationMs / 1000).toFixed(2)}s` : "-"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {execution.errorMessage ? (
                      <span className="text-destructive" title={execution.errorMessage}>{execution.errorMessage}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {execution.status === "failure" && (
                      <Button variant="ghost" size="sm" onClick={() => handleRetry(execution.id)} disabled={retryMutation.isPending}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${retryMutation.isPending ? "animate-spin" : ""}`} />
                        Retry
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No executions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
