import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Step } from '@/types/pipeline';
import { useToast } from '@/hooks/use-toast';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
  initial_input: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadWorkflows = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      console.log('🔍 Raw workflow data from Supabase:', data);
      
      const processedWorkflows = (data || []).map(item => {
        console.log('🔍 Processing workflow item:', item);
        console.log('🔍 Raw steps data:', item.steps);
        console.log('🔍 Initial input:', item.initial_input);
        
        return {
          ...item,
          steps: item.steps as unknown as Step[],
          initial_input: item.initial_input || ''
        };
      });
      
      console.log('🔍 Processed workflows:', processedWorkflows);
      setWorkflows(processedWorkflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWorkflow = async (name: string, steps: Step[], initialInput: string, description?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save workflows",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          name,
          description,
          steps: steps as any,
          initial_input: initialInput,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Workflow "${name}" saved successfully!`,
      });

      await loadWorkflows(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWorkflow = async (id: string, name: string, steps: Step[], initialInput: string, description?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .update({
          name,
          description,
          steps: steps as any,
          initial_input: initialInput,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Workflow "${name}" updated successfully!`,
      });

      await loadWorkflows(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow deleted successfully!",
      });

      await loadWorkflows(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadWorkflows();
    }
  }, [user]);

  const getWorkflowById = useCallback(async (id: string): Promise<Workflow | null> => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      return {
        ...data,
        steps: data.steps as unknown as Step[],
        initial_input: data.initial_input || ''
      };
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  return {
    workflows,
    loading,
    saveWorkflow,
    updateWorkflow,
    deleteWorkflow,
    loadWorkflows,
    getWorkflowById,
  };
}