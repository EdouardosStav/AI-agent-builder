import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { AuthPage } from "@/pages/AuthPage";
import { MyWorkflows } from "@/pages/MyWorkflows";
import { PipelineBuilder } from "@/pages/PipelineBuilder";
import { AIAssistant } from "@/pages/AIAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route 
                path="/dashboard" 
                element={<Navigate to="/pipeline-builder" replace />}
              />
              <Route 
                path="/pipeline-builder/:workflowId?" 
                element={
                  <ProtectedRoute>
                    <PipelineBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-workflows" 
                element={
                  <ProtectedRoute>
                    <MyWorkflows />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assistant" 
                element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
