export type StepType = 'summarize' | 'translate' | 'rewrite' | 'extract';

export interface Step {
  id: string;
  type: StepType;
  config: Record<string, string>;
}

export interface Pipeline {
  id?: string;
  name: string;
  steps: Step[];
  initialInput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StepConfig {
  summarize: {
    length: 'short' | 'medium' | 'long';
    style: 'bullet-points' | 'paragraph';
  };
  translate: {
    targetLanguage: 'french' | 'spanish' | 'german' | 'italian' | 'portuguese' | 'dutch' | 'chinese' | 'japanese';
  };
  rewrite: {
    tone: 'casual' | 'formal' | 'professional' | 'friendly';
  };
  extract: {
    extractType: 'keywords' | 'entities' | 'both';
  };
}

export interface ValidationError {
  stepId: string;
  field: string;
  message: string;
}

export const STEP_TYPES = {
  summarize: {
    label: 'Summarize',
    description: 'Create a concise summary of the text',
    icon: '📝',
  },
  translate: {
    label: 'Translate',
    description: 'Translate text to another language',
    icon: '🌐',
  },
  rewrite: {
    label: 'Rewrite',
    description: 'Rewrite text with a different tone',
    icon: '✍️',
  },
  extract: {
    label: 'Extract',
    description: 'Extract keywords or entities from text',
    icon: '🔍',
  },
} as const;

export const LANGUAGE_OPTIONS = [
  { value: 'french', label: 'French' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'dutch', label: 'Dutch' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
] as const;

export const TONE_OPTIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
] as const;

export const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
] as const;

export const STYLE_OPTIONS = [
  { value: 'bullet-points', label: 'Bullet Points' },
  { value: 'paragraph', label: 'Paragraph' },
] as const;

export const EXTRACT_OPTIONS = [
  { value: 'keywords', label: 'Keywords' },
  { value: 'entities', label: 'Entities' },
  { value: 'both', label: 'Both' },
] as const;

// Execution-related types
export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'error' | 'cancelled';
export type StepExecutionStatus = 'pending' | 'running' | 'completed' | 'error';

export interface StepExecution {
  stepId: string;
  status: StepExecutionStatus;
  input: string;
  output: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  tokensUsed?: number;
}

export interface PipelineExecution {
  id: string;
  status: ExecutionStatus;
  stepExecutions: StepExecution[];
  totalTokens: number;
  startTime: Date;
  endTime?: Date;
}