import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';
import { StepCard } from './StepCard';
import { Step, StepType, ValidationError, StepExecution } from '@/types/pipeline';

interface PipelineCanvasProps {
  steps: Step[];
  onAddStep: (type: StepType, position?: number) => void;
  onRemoveStep: (stepId: string) => void;
  onUpdateStepConfig: (stepId: string, config: Record<string, string>) => void;
  onReorderSteps: (oldIndex: number, newIndex: number) => void;
  validationErrors: ValidationError[];
  stepExecutions?: Record<string, StepExecution>;
}

const DropZone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'pipeline-canvas',
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] rounded-lg border-2 border-dashed transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
    >
      {children}
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-96 text-center">
    <div className="text-muted-foreground mb-4">
      <div className="text-4xl mb-2">🚀</div>
      <h3 className="text-lg font-medium mb-2">Start Building Your Pipeline</h3>
      <p className="text-sm max-w-md">
        Drag step types from the left panel or click them to add steps to your pipeline.
        Create workflows like: Summarize → Translate → Rewrite
      </p>
    </div>
  </div>
);

const PipelineConnector: React.FC = () => (
  <div className="flex justify-center py-2">
    <div className="flex items-center space-x-2 text-muted-foreground">
      <div className="w-4 h-px bg-border"></div>
      <ArrowDown className="h-4 w-4" />
      <div className="w-4 h-px bg-border"></div>
    </div>
  </div>
);

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  steps,
  onAddStep,
  onRemoveStep,
  onUpdateStepConfig,
  onReorderSteps,
  validationErrors,
  stepExecutions,
}) => {
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

    // Handle reordering existing steps
    if (active.id !== over.id && steps.find(step => step.id === active.id)) {
      const oldIndex = steps.findIndex(step => step.id === active.id);
      const newIndex = steps.findIndex(step => step.id === over.id);
      onReorderSteps(oldIndex, newIndex);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Handle adding new step from step type panel
    const activeData = active.data.current;
    if (activeData?.type && over.id === 'pipeline-canvas') {
      // We'll handle this in drag end to avoid multiple additions
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Pipeline Canvas</CardTitle>
        <CardDescription>
          Your AI workflow - drag steps to reorder, configure each step below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <DropZone>
            {steps.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="p-4">
                <SortableContext
                  items={steps.map(step => step.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {steps.map((step, index) => (
                      <motion.div key={step.id} layout>
                        <StepCard
                          step={step}
                          index={index}
                          onRemove={onRemoveStep}
                          onConfigChange={onUpdateStepConfig}
                          validationErrors={validationErrors}
                          stepExecution={stepExecutions?.[step.id]}
                        />
                        {index < steps.length - 1 && <PipelineConnector />}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </div>
            )}
          </DropZone>
        </DndContext>
      </CardContent>
    </Card>
  );
};