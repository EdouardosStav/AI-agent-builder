import { useState, useCallback, useMemo } from 'react';
import { Step, StepType, ValidationError, PipelineExecution, ExecutionStatus, StepExecution } from '@/types/pipeline';
import { pipelineExecutor, ExecutionCallbacks } from '@/lib/executePipeline';

export interface UsePipelineReturn {
  pipeline: Step[];
  initialInput: string;
  validationErrors: ValidationError[];
  execution: PipelineExecution | null;
  executionStatus: ExecutionStatus;
  stepExecutions: Record<string, StepExecution>;
  executionProgress: number;
  addStep: (type: StepType, position?: number) => void;
  removeStep: (stepId: string) => void;
  updateStepConfig: (stepId: string, config: Record<string, string>) => void;
  reorderSteps: (oldIndex: number, newIndex: number) => void;
  setInitialInput: (input: string) => void;
  clearPipeline: () => void;
  loadPipeline: (steps: Step[], input?: string) => void;
  validatePipeline: () => boolean;
  validatePipelineSteps: (steps: Step[]) => boolean;
  executePipeline: () => Promise<void>;
  cancelExecution: () => void;
  clearResults: () => void;
  retryExecution: () => Promise<void>;
}

const generateStepId = () => `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getDefaultConfig = (type: StepType): Record<string, string> => {
  switch (type) {
    case 'summarize':
      return { length: 'medium', style: 'paragraph' };
    case 'translate':
      return { targetLanguage: '' };
    case 'rewrite':
      return { tone: '' };
    case 'extract':
      return { extractType: '' };
    default:
      return {};
  }
};

const validateStep = (step: Step): ValidationError[] => {
  const errors: ValidationError[] = [];

  switch (step.type) {
    case 'translate':
      if (!step.config.targetLanguage) {
        errors.push({
          stepId: step.id,
          field: 'targetLanguage',
          message: 'Target language is required',
        });
      }
      break;
    case 'rewrite':
      if (!step.config.tone) {
        errors.push({
          stepId: step.id,
          field: 'tone',
          message: 'Tone is required',
        });
      }
      break;
    case 'extract':
      if (!step.config.extractType) {
        errors.push({
          stepId: step.id,
          field: 'extractType',
          message: 'Extract type is required',
        });
      }
      break;
  }

  return errors;
};

export const usePipeline = (): UsePipelineReturn => {
  const [pipeline, setPipeline] = useState<Step[]>([]);
  const [initialInput, setInitialInputState] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [execution, setExecution] = useState<PipelineExecution | null>(null);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle');
  const [stepExecutions, setStepExecutions] = useState<Record<string, StepExecution>>({});

  const validatePipelineSteps = useCallback((steps: Step[]): boolean => {
    const errors: ValidationError[] = [];
    steps.forEach(step => {
      errors.push(...validateStep(step));
    });
    setValidationErrors(errors);
    return errors.length === 0;
  }, []);

  const addStep = useCallback((type: StepType, position?: number) => {
    const newStep: Step = {
      id: generateStepId(),
      type,
      config: getDefaultConfig(type),
    };

    setPipeline(prev => {
      const newPipeline = [...prev];
      if (position !== undefined) {
        newPipeline.splice(position, 0, newStep);
      } else {
        newPipeline.push(newStep);
      }
      validatePipelineSteps(newPipeline);
      return newPipeline;
    });
  }, [validatePipelineSteps]);

  const removeStep = useCallback((stepId: string) => {
    setPipeline(prev => {
      const newPipeline = prev.filter(step => step.id !== stepId);
      validatePipelineSteps(newPipeline);
      return newPipeline;
    });
  }, [validatePipelineSteps]);

  const updateStepConfig = useCallback((stepId: string, config: Record<string, string>) => {
    setPipeline(prev => {
      const newPipeline = prev.map(step =>
        step.id === stepId ? { ...step, config: { ...step.config, ...config } } : step
      );
      validatePipelineSteps(newPipeline);
      return newPipeline;
    });
  }, [validatePipelineSteps]);

  const reorderSteps = useCallback((oldIndex: number, newIndex: number) => {
    setPipeline(prev => {
      const newPipeline = [...prev];
      const [removed] = newPipeline.splice(oldIndex, 1);
      newPipeline.splice(newIndex, 0, removed);
      return newPipeline;
    });
  }, []);

  const setInitialInput = useCallback((input: string) => {
    setInitialInputState(input);
  }, []);

  const clearPipeline = useCallback(() => {
    setPipeline([]);
    setInitialInputState('');
    setValidationErrors([]);
    clearResults();
  }, []);

  const loadPipeline = useCallback((steps: Step[], input?: string) => {
    console.log('🔍 loadPipeline called with steps:', steps);
    console.log('🔍 loadPipeline called with input:', input);
    console.log('🔍 Steps type:', typeof steps);
    console.log('🔍 Steps length:', steps?.length);
    console.log('🔍 Steps array check:', Array.isArray(steps));
    
    setPipeline(steps);
    if (input !== undefined) {
      setInitialInputState(input);
    }
    setValidationErrors([]);
    clearResults();
  }, []);

  const validatePipeline = useCallback(() => {
    return validatePipelineSteps(pipeline);
  }, [pipeline, validatePipelineSteps]);

  // Execution-related functions
  const executePipeline = useCallback(async () => {
    if (!validatePipeline() || !initialInput.trim()) {
      return;
    }

    setExecutionStatus('running');
    setStepExecutions({});

    const callbacks: ExecutionCallbacks = {
      onStepStart: (stepId: string) => {
        setStepExecutions(prev => ({
          ...prev,
          [stepId]: {
            stepId,
            status: 'running',
            input: '',
            output: '',
            startTime: new Date()
          }
        }));
      },
      onStepProgress: (stepId: string, text: string) => {
        setStepExecutions(prev => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            output: text
          }
        }));
      },
      onStepComplete: (stepId: string, output: string) => {
        setStepExecutions(prev => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            status: 'completed',
            output,
            endTime: new Date()
          }
        }));
      },
      onStepError: (stepId: string, error: string) => {
        setStepExecutions(prev => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            status: 'error',
            error,
            endTime: new Date()
          }
        }));
      },
      onPipelineComplete: (pipelineExecution: PipelineExecution) => {
        setExecution(pipelineExecution);
        setExecutionStatus('completed');
      },
      onPipelineError: (error: string) => {
        setExecutionStatus('error');
        console.error('Pipeline execution failed:', error);
      }
    };

    try {
      await pipelineExecutor.executePipeline(initialInput, pipeline, callbacks);
    } catch (error) {
      setExecutionStatus('error');
      console.error('Pipeline execution failed:', error);
    }
  }, [pipeline, initialInput, validatePipeline]);

  const cancelExecution = useCallback(() => {
    pipelineExecutor.cancelExecution();
    setExecutionStatus('cancelled');
  }, []);

  const clearResults = useCallback(() => {
    setExecution(null);
    setExecutionStatus('idle');
    setStepExecutions({});
  }, []);

  const retryExecution = useCallback(async () => {
    clearResults();
    await executePipeline();
  }, [clearResults, executePipeline]);

  // Calculate execution progress
  const executionProgress = useMemo(() => {
    if (pipeline.length === 0) return 0;
    
    const completedSteps = Object.values(stepExecutions).filter(
      exec => exec.status === 'completed'
    ).length;
    
    return (completedSteps / pipeline.length) * 100;
  }, [stepExecutions, pipeline.length]);

  return {
    pipeline,
    initialInput,
    validationErrors,
    execution,
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
    validatePipelineSteps,
    executePipeline,
    cancelExecution,
    clearResults,
    retryExecution,
  };
};