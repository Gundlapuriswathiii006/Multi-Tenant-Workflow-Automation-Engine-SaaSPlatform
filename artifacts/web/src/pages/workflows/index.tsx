import { useListWorkflows, useDeleteWorkflow, useToggleWorkflow, getListWorkflowsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Play,
  Activity,
  Workflow as WorkflowIcon,
  Power,
  PowerOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Workflows() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: workflows, isLoading } = useListWorkflows();
  const deleteMutation = useDeleteWorkflow();
  const toggleMutation = useToggleWorkflow();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      deleteMutation.mutate({ workflowId: id }, {
        onSuccess: () => {
          toast({ title: "Workflow deleted" });
          queryClient.invalidateQueries({ queryKey: getListWorkflowsQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "Error deleting workflow", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  const handleToggle = (id: number) => {
    toggleMutation.mutate({ workflowId: id }, {
      onSuccess: () => {
        toast({ title: "Workflow status updated" });
        queryClient.invalidateQueries({ queryKey: getListWorkflowsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Error updating workflow", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Build and manage your automated processes.
          </p>
        </div>
        <Button onClick={() => setLocation("/workflows/new")} className="shrink-0 shadow-sm shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Executions</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : workflows && workflows.length > 0 ? (
              workflows.map((workflow) => (
                <TableRow key={workflow.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground border border-border">
                        <WorkflowIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        {workflow.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                            {workflow.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                      {workflow.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {workflow.triggerType.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>{workflow.executionCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {workflow.lastExecutedAt ? format(new Date(workflow.lastExecutedAt), "MMM d, yyyy HH:mm") : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setLocation(`/workflows/${workflow.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setLocation(`/workflows/${workflow.id}`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(workflow.id)}>
                            {workflow.status === "active" ? (
                              <><PowerOff className="mr-2 h-4 w-4" /> Disable</>
                            ) : (
                              <><Power className="mr-2 h-4 w-4" /> Enable</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(workflow.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No workflows found. Create your first workflow to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
