import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Save, RotateCcw } from 'lucide-react';
import { usePipeline } from '@/hooks/usePipeline';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useToast } from '@/hooks/use-toast';
import { StepTypePanel } from '@/components/pipeline/StepTypePanel';
import { PipelineCanvas } from '@/components/pipeline/PipelineCanvas';
import { InitialInputCard } from '@/components/pipeline/InitialInputCard';
import { ValidationSummary } from '@/components/pipeline/ValidationSummary';
import { SaveWorkflowDialog } from '@/components/pipeline/SaveWorkflowDialog';
import { StepType } from '@/types/pipeline';

export const PipelineBuilder = () => {
  const { toast } = useToast();
  const { saveWorkflow, getWorkflowById } = useWorkflows();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const { workflowId } = useParams<{ workflowId?: string }>();
  
  const {
    pipeline,
    initialInput,
    validationErrors,
    executionStatus,
    stepExecutions,
    executionProgress,
    addStep,
    removeStep,
    updateStepConfig,
    reorderSteps,
    setInitialInput,
    clearPipeline,
    loadPipeline,
    validatePipeline,
    executePipeline,
    cancelExecution,
    clearResults,
    retryExecution,
  } = usePipeline();

  // Load workflow from URL params or AI Assistant
  useEffect(() => {
    if (workflowId) {
      const loadWorkflowData = async () => {
        const workflow = await getWorkflowById(workflowId);
        if (workflow) {
          loadPipeline(workflow.steps, workflow.initial_input);
          toast({
            title: "Workflow Loaded",
            description: `Loaded workflow: ${workflow.name}`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Workflow Not Found",
            description: "The requested workflow could not be loaded.",
          });
        }
      };
      loadWorkflowData();
    } else {
      // Check for AI Assistant generated pipeline in URL params
      const urlParams = new URLSearchParams(location.search);
      const stepsParam = urlParams.get('steps');
      const nameParam = urlParams.get('name');
      
      if (stepsParam) {
        try {
          const steps = JSON.parse(stepsParam);
          loadPipeline(steps, '');
          if (nameParam) {
            toast({
              title: "AI Pipeline Loaded",
              description: `Loaded AI generated pipeline: ${nameParam}`,
            });
          }
        } catch (error) {
          console.error('Error parsing AI pipeline from URL:', error);
        }
      }
    }
  }, [workflowId, location.search, getWorkflowById, loadPipeline, toast]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Handle adding new step from step type panel to canvas
    const activeData = active.data.current;
    if (activeData?.type && over.id === 'pipeline-canvas') {
      addStep(activeData.type as StepType);
      toast({
        title: "Step Added",
        description: `Added ${activeData.type} step to your pipeline.`,
      });
    }
  };

  const handleRunPipeline = async () => {
    if (!validatePipeline() || !initialInput.trim() || pipeline.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot Run Pipeline",
        description: "Please fix all issues before running.",
      });
      return;
    }

    try {
      await executePipeline();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Execution Failed",
        description: "There was an error executing your pipeline.",
      });
    }
  };

  const handleSavePipeline = () => {
    setSaveDialogOpen(true);
  };

  const handleClearPipeline = () => {
    clearPipeline();
    toast({
      title: "Pipeline Cleared",
      description: "Your pipeline has been reset.",
    });
  };

  const handleSaveWorkflow = async (name: string, description?: string) => {
    await saveWorkflow(name, pipeline, initialInput, description);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Pipeline Builder</h1>
                <p className="text-muted-foreground">Design your custom AI pipeline</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleClearPipeline}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" onClick={handleSavePipeline}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  onClick={handleRunPipeline}
                  disabled={pipeline.length === 0 || !initialInput.trim() || validationErrors.length > 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Pipeline
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Validation Summary */}
            <AnimatePresence>
              <ValidationSummary
                validationErrors={validationErrors}
                stepCount={pipeline.length}
                hasInitialInput={!!initialInput.trim()}
              />
            </AnimatePresence>

            {/* Initial Input */}
            <InitialInputCard
              value={initialInput}
              onChange={setInitialInput}
            />

            {/* Step Types Panel */}
            <StepTypePanel onAddStep={addStep} />
            
            {/* Pipeline Canvas */}
            <PipelineCanvas
              steps={pipeline}
              onAddStep={addStep}
              onRemoveStep={removeStep}
              onUpdateStepConfig={updateStepConfig}
              onReorderSteps={reorderSteps}
              validationErrors={validationErrors}
              stepExecutions={stepExecutions}
            />
          </div>
        </div>

        <SaveWorkflowDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          onSave={handleSaveWorkflow}
          steps={pipeline}
        />
      </div>
    </DndContext>
  );
};