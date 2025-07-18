import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Bot, Workflow, Zap } from 'lucide-react';

export const HomePage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/pipeline-builder" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Bot className="h-16 w-16 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          Build Custom AI Pipelines
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Create multi-step AI workflows like summarize → translate → rewrite with our visual pipeline builder
        </p>
        
        <div className="flex justify-center space-x-4 mb-12">
          <Button size="lg" asChild>
            <a href="/auth">Get Started</a>
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <Workflow className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Visual Pipeline Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Drag and drop AI steps to create powerful workflows without coding
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Multiple AI Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Combine summarize, translate, rewrite, and extract operations seamlessly
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Bot className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get help building workflows with natural language instructions
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};