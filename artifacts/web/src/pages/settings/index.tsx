import { useGetMe, useGetTenant, useUpdateTenant } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TenantUpdatePlan } from "@workspace/api-client-react/src/generated/api.schemas";

const settingsSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  plan: z.enum(["free", "pro", "enterprise"]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { data: user } = useGetMe();
  
  const { data: tenant, isLoading } = useGetTenant(user?.tenantId || 0, {
    query: {
      enabled: !!user?.tenantId
    }
  });

  const updateMutation = useUpdateTenant();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      plan: "free",
    },
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (tenant && !initialized.current) {
      form.reset({
        name: tenant.name,
        plan: tenant.plan as any,
      });
      initialized.current = true;
    }
  }, [tenant, form]);

  const onSubmit = (data: SettingsFormValues) => {
    if (!user?.tenantId) return;
    
    updateMutation.mutate({ 
      tenantId: user.tenantId, 
      data: { name: data.name, plan: data.plan as TenantUpdatePlan } 
    }, {
      onSuccess: () => {
        toast({ title: "Settings saved successfully" });
      },
      onError: (err: any) => {
        toast({ title: "Failed to save settings", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization preferences and billing.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Organization Profile
            </CardTitle>
            <CardDescription>
              Update your organization's information.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Plan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free (Up to 5 active workflows)</SelectItem>
                          <SelectItem value="pro">Pro (Unlimited workflows, priority support)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (Custom limits, dedicated resources)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t border-border bg-muted/20 px-6 py-4">
                <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
                  {updateMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
}
