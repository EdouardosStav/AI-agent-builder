import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, AlertCircle, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Step, StepType, ValidationError, StepExecution, STEP_TYPES, LANGUAGE_OPTIONS, TONE_OPTIONS, LENGTH_OPTIONS, STYLE_OPTIONS, EXTRACT_OPTIONS } from '@/types/pipeline';

interface StepCardProps {
  step: Step;
  index: number;
  onRemove: (stepId: string) => void;
  onConfigChange: (stepId: string, config: Record<string, string>) => void;
  validationErrors: ValidationError[];
  stepExecution?: StepExecution;
}

export const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  onRemove,
  onConfigChange,
  validationErrors,
  stepExecution,
}) => {
  const [showResults, setShowResults] = React.useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stepErrors = validationErrors.filter(error => error.stepId === step.id);
  const hasErrors = stepErrors.length > 0;
  const stepInfo = STEP_TYPES[step.type];

  const getStatusBadge = () => {
    if (!stepExecution) return null;
    
    switch (stepExecution.status) {
      case 'running':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Pending
          </Badge>
        );
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    onConfigChange(step.id, { [key]: value });
  };

  const renderConfigInputs = () => {
    switch (step.type) {
      case 'summarize':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`length-${step.id}`}>Length</Label>
              <Select value={step.config.length} onValueChange={(value) => handleConfigChange('length', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {LENGTH_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Style</Label>
              <RadioGroup 
                value={step.config.style} 
                onValueChange={(value) => handleConfigChange('style', value)}
                className="flex flex-col space-y-2 mt-2"
              >
                {STYLE_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`style-${option.value}-${step.id}`} />
                    <Label htmlFor={`style-${option.value}-${step.id}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );
      
      case 'translate':
        const targetLanguageError = stepErrors.find(e => e.field === 'targetLanguage');
        return (
          <div>
            <Label htmlFor={`language-${step.id}`}>Target Language</Label>
            <Select value={step.config.targetLanguage} onValueChange={(value) => handleConfigChange('targetLanguage', value)}>
              <SelectTrigger className={targetLanguageError ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {targetLanguageError && (
              <p className="text-sm text-destructive mt-1">{targetLanguageError.message}</p>
            )}
          </div>
        );
      
      case 'rewrite':
        const toneError = stepErrors.find(e => e.field === 'tone');
        return (
          <div>
            <Label htmlFor={`tone-${step.id}`}>Tone</Label>
            <Select value={step.config.tone} onValueChange={(value) => handleConfigChange('tone', value)}>
              <SelectTrigger className={toneError ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {toneError && (
              <p className="text-sm text-destructive mt-1">{toneError.message}</p>
            )}
          </div>
        );
      
      case 'extract':
        const extractTypeError = stepErrors.find(e => e.field === 'extractType');
        return (
          <div>
            <Label htmlFor={`extract-${step.id}`}>Extract Type</Label>
            <Select value={step.config.extractType} onValueChange={(value) => handleConfigChange('extractType', value)}>
              <SelectTrigger className={extractTypeError ? 'border-destructive' : ''}>
                <SelectValue placeholder="What to extract" />
              </SelectTrigger>
              <SelectContent>
                {EXTRACT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {extractTypeError && (
              <p className="text-sm text-destructive mt-1">{extractTypeError.message}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`${hasErrors ? 'border-destructive' : 'border-border'} ${isDragging ? 'shadow-lg' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="cursor-grab active:cursor-grabbing p-1"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{stepInfo.icon}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{index + 1}. {stepInfo.label}</h4>
                    {hasErrors ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{stepInfo.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(step.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {renderConfigInputs()}
            
            {stepErrors.length > 0 && (
              <div className="text-sm text-red-600 space-y-1">
                {stepErrors.map((error, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Step Execution Results */}
            {stepExecution && (stepExecution.output || stepExecution.error) && (
              <Collapsible open={showResults} onOpenChange={setShowResults}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <span className="text-sm font-medium">
                      {stepExecution.status === 'error' ? 'Error Details' : 'Results'}
                    </span>
                    {showResults ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className={`p-3 rounded-md text-sm ${
                    stepExecution.status === 'error' 
                      ? 'bg-red-50 border border-red-200 text-red-800' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    {stepExecution.status === 'error' ? (
                      <div>
                        <p className="font-medium mb-1">Error:</p>
                        <p>{stepExecution.error}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium mb-2">Output:</p>
                        <p className="whitespace-pre-wrap">{stepExecution.output}</p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};