import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Step } from '@/types/pipeline';

interface SaveWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description?: string) => void;
  steps: Step[];
  loading?: boolean;
}

export function SaveWorkflowDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  steps, 
  loading = false 
}: SaveWorkflowDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Pipeline</DialogTitle>
          <DialogDescription>
            Give your pipeline a name and optional description to save it for later use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Pipeline Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter pipeline name..."
              className="w-full"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this pipeline does..."
              className="w-full"
              rows={3}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            This pipeline contains {steps.length} step{steps.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || loading}
          >
            {loading ? 'Saving...' : 'Save Pipeline'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}