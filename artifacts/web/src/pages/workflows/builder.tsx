import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { 
  useGetWorkflow, 
  useCreateWorkflow, 
  useUpdateWorkflow, 
  useExecuteWorkflow,
  getGetWorkflowQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  GripVertical,
  Zap,
  GitMerge,
  Box
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkflowInputTriggerType } from "@workspace/api-client-react/src/generated/api.schemas";

type Node = {
  id: string;
  type: "trigger" | "condition" | "action";
  label: string;
  config: any;
};

type Edge = {
  id: string;
  source: string;
  target: string;
};

export default function WorkflowBuilder() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isNew = !params.id || params.id === "new";
  const workflowId = isNew ? 0 : parseInt(params.id!);

  const { data: workflow, isLoading: isFetching } = useGetWorkflow(workflowId, {
    query: { enabled: !isNew }
  });

  const createMutation = useCreateWorkflow();
  const updateMutation = useUpdateWorkflow();
  const executeMutation = useExecuteWorkflow();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<WorkflowInputTriggerType>("manual");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const initializedRef = useRef(false);

  useEffect(() => {
    if (workflow && !initializedRef.current) {
      setName(workflow.name);
      setDescription(workflow.description || "");
      setTriggerType(workflow.triggerType as WorkflowInputTriggerType);
      setNodes(workflow.nodes as Node[]);
      setEdges(workflow.edges as Edge[]);
      initializedRef.current = true;
    }
  }, [workflow]);

  // If new, set default nodes
  useEffect(() => {
    if (isNew && nodes.length === 0) {
      setNodes([
        { id: "node-1", type: "trigger", label: "Manual Trigger", config: {} }
      ]);
    }
  }, [isNew, nodes]);

  const handleAddNode = (type: "condition" | "action") => {
    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type,
      label: type === "condition" ? "Check Condition" : "Perform Action",
      config: {}
    };
    
    const lastNodeId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;
    
    setNodes([...nodes, newNode]);
    
    if (lastNodeId) {
      setEdges([...edges, {
        id: `edge-${lastNodeId}-${newId}`,
        source: lastNodeId,
        target: newId
      }]);
    }
  };

  const handleRemoveNode = (id: string) => {
    // Only allow removing if it's not the first trigger node
    if (nodes[0]?.id === id) {
      toast({ title: "Cannot remove trigger node", variant: "destructive" });
      return;
    }
    
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(e => e.source !== id && e.target !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    const payload = {
      name,
      description,
      triggerType,
      nodes,
      edges
    };

    if (isNew) {
      createMutation.mutate({ data: payload }, {
        onSuccess: (res) => {
          toast({ title: "Workflow created" });
          setLocation(`/workflows/${res.id}`);
        },
        onError: (err: any) => {
          toast({ title: "Failed to create", description: err.message, variant: "destructive" });
        }
      });
    } else {
      updateMutation.mutate({ workflowId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Workflow saved" });
          queryClient.invalidateQueries({ queryKey: getGetWorkflowQueryKey(workflowId) });
        },
        onError: (err: any) => {
          toast({ title: "Failed to save", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  const handleRun = () => {
    if (isNew) {
      toast({ title: "Save workflow first", variant: "destructive" });
      return;
    }
    executeMutation.mutate({ workflowId, data: {} }, {
      onSuccess: () => {
        toast({ title: "Execution started" });
      },
      onError: (err: any) => {
        toast({ title: "Failed to run", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isFetching) {
    return <div className="p-8">Loading builder...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-muted/10">
      <header className="flex-none flex items-center justify-between px-6 py-4 bg-background border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/workflows")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Workflow Name" 
              className="h-8 text-lg font-bold border-transparent hover:border-input focus-visible:border-input px-2 w-64 bg-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <Button variant="secondary" onClick={handleRun} disabled={executeMutation.isPending}>
              <Play className="h-4 w-4 mr-2" />
              Run Now
            </Button>
          )}
          <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Settings */}
        <aside className="w-80 flex-none bg-background border-r border-border p-6 overflow-y-auto">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6">Workflow Settings</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select value={triggerType} onValueChange={(v: any) => setTriggerType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Trigger</SelectItem>
                  <SelectItem value="scheduled">Scheduled (Cron)</SelectItem>
                  <SelectItem value="api_event">API Webhook</SelectItem>
                  <SelectItem value="user_registered">User Registered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="What does this workflow do?"
                className="resize-none h-24"
              />
            </div>
          </div>
        </aside>

        {/* Main Canvas Area (Simplified step builder) */}
        <main className="flex-1 overflow-y-auto p-12 bg-dot-pattern flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-6">
            {nodes.map((node, index) => (
              <div key={node.id} className="relative">
                {/* Arrow connecting to previous node */}
                {index > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border" />
                )}
                
                <Card className={`
                  relative border-2 shadow-sm transition-all
                  ${node.type === 'trigger' ? 'border-primary/50' : ''}
                  ${node.type === 'condition' ? 'border-amber-500/50' : ''}
                  ${node.type === 'action' ? 'border-blue-500/50' : ''}
                `}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="cursor-move text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    
                    <div className={`
                      h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0
                      ${node.type === 'trigger' ? 'bg-primary' : ''}
                      ${node.type === 'condition' ? 'bg-amber-500' : ''}
                      ${node.type === 'action' ? 'bg-blue-500' : ''}
                    `}>
                      {node.type === 'trigger' ? <Zap className="h-5 w-5" /> : null}
                      {node.type === 'condition' ? <GitMerge className="h-5 w-5" /> : null}
                      {node.type === 'action' ? <Box className="h-5 w-5" /> : null}
                    </div>

                    <div className="flex-1">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        {node.type}
                      </div>
                      <Input 
                        value={node.label}
                        onChange={(e) => {
                          const newNodes = [...nodes];
                          newNodes[index].label = e.target.value;
                          setNodes(newNodes);
                        }}
                        className="h-8 border-transparent hover:border-input focus-visible:border-input px-2 -ml-2"
                      />
                    </div>

                    {index > 0 && (
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleRemoveNode(node.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Add Node Controls */}
            <div className="pt-8 pb-12 flex justify-center gap-4">
              <Button variant="outline" className="border-dashed" onClick={() => handleAddNode("condition")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
              <Button variant="outline" className="border-dashed" onClick={() => handleAddNode("action")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Add grid dot pattern via simple inline style */}
      <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(hsl(var(--border)) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}
