import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { StepType, STEP_TYPES } from '@/types/pipeline';

interface DraggableStepTypeProps {
  type: StepType;
  onAddStep: (type: StepType) => void;
}

const DraggableStepType: React.FC<DraggableStepTypeProps> = ({ type, onAddStep }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `step-type-${type}`,
    data: { type },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const stepInfo = STEP_TYPES[type];

  return (
    <Button
      ref={setNodeRef}
      style={style}
      variant="outline"
      className={`w-full justify-start min-h-[5rem] px-6 py-4 transition-all duration-200 hover:bg-accent group ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onAddStep(type)}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center space-x-4 w-full">
        <span className="text-3xl group-hover:scale-110 transition-transform">{stepInfo.icon}</span>
        <div className="flex items-center space-x-3">
          <Plus className="h-5 w-5 text-primary" />
          <span className="font-medium text-lg">{stepInfo.label}</span>
        </div>
      </div>
    </Button>
  );
};

interface StepTypePanelProps {
  onAddStep: (type: StepType) => void;
}

export const StepTypePanel: React.FC<StepTypePanelProps> = ({ onAddStep }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step Types</CardTitle>
        <CardDescription>Drag steps to build your pipeline or click to add</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {(Object.keys(STEP_TYPES) as StepType[]).map((type) => (
          <DraggableStepType
            key={type}
            type={type}
            onAddStep={onAddStep}
          />
        ))}
      </CardContent>
    </Card>
  );
};