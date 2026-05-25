import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { Layout } from "@/components/layout";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Workflows from "@/pages/workflows/index";
import WorkflowBuilder from "@/pages/workflows/builder";
import Executions from "@/pages/executions/index";
import Users from "@/pages/users/index";
import Settings from "@/pages/settings/index";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />

          <Route path="/">
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/dashboard">
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/workflows">
            <ProtectedRoute>
              <Layout>
                <Workflows />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/workflows/new">
            <ProtectedRoute>
              <Layout>
                <WorkflowBuilder />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/workflows/:id">
            <ProtectedRoute>
              <Layout>
                <WorkflowBuilder />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/executions">
            <ProtectedRoute>
              <Layout>
                <Executions />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/users">
            <ProtectedRoute requireRole="ORG_ADMIN">
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings">
            <ProtectedRoute requireRole="ORG_ADMIN">
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route>
            <NotFound />
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}
