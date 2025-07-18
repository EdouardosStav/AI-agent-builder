import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Trash2, 
  Play, 
  Edit, 
  Plus,
  Workflow as WorkflowIcon,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useWorkflows, Workflow } from '@/hooks/useWorkflows';
import { usePipeline } from '@/hooks/usePipeline';

export function MyWorkflows() {
  const navigate = useNavigate();
  const { workflows, loading, deleteWorkflow } = useWorkflows();
  const { loadPipeline } = usePipeline();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLoadWorkflow = (workflow: Workflow) => {
    navigate(`/pipeline-builder/${workflow.id}`);
  };

  const handleDeleteWorkflow = async (id: string) => {
    setDeletingId(id);
    await deleteWorkflow(id);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Workflows</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Workflows</h1>
          <p className="text-muted-foreground">
            Manage your saved AI pipeline workflows
          </p>
        </div>
        <Button onClick={() => navigate('/pipeline-builder')}>
          <Plus className="h-4 w-4 mr-2" />
          New Pipeline
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card className="text-center p-12">
          <WorkflowIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No workflows yet</CardTitle>
          <CardDescription className="mb-4">
            Create your first AI pipeline workflow to get started
          </CardDescription>
          <Button onClick={() => navigate('/pipeline-builder')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Pipeline
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{workflow.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {workflow.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Updated {format(new Date(workflow.updated_at), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleLoadWorkflow(workflow)}
                    className="flex-1"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Load
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={deletingId === workflow.id}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{workflow.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}