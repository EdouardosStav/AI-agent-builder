import { Step, StepType, StepExecution, PipelineExecution, ExecutionStatus, StepExecutionStatus } from '@/types/pipeline';
import { supabase } from '@/integrations/supabase/client';

// Prompt template system
const PROMPT_TEMPLATES = {
  summarize: (config: Record<string, string>) => {
    const length = config.length || 'medium';
    const style = config.style || 'paragraph';
    return `Create a ${length} summary in ${style} format of the following text:\n\n{{input}}`;
  },
  translate: (config: Record<string, string>) => {
    const language = config.targetLanguage || 'spanish';
    return `Translate the following text to ${language}:\n\n{{input}}`;
  },
  rewrite: (config: Record<string, string>) => {
    const tone = config.tone || 'professional';
    return `Rewrite the following text to sound more ${tone}:\n\n{{input}}`;
  },
  extract: (config: Record<string, string>) => {
    const extractType = config.extractType || 'keywords';
    return `Extract ${extractType} from the following text:\n\n{{input}}`;
  }
};

export interface ExecutionCallbacks {
  onStepStart?: (stepId: string) => void;
  onStepProgress?: (stepId: string, text: string) => void;
  onStepComplete?: (stepId: string, output: string) => void;
  onStepError?: (stepId: string, error: string) => void;
  onPipelineComplete?: (execution: PipelineExecution) => void;
  onPipelineError?: (error: string) => void;
}

export class PipelineExecutor {
  private execution: PipelineExecution | null = null;
  private abortController: AbortController | null = null;

  async executePipeline(
    initialInput: string,
    steps: Step[],
    callbacks?: ExecutionCallbacks
  ): Promise<PipelineExecution> {
    // Initialize execution
    this.execution = {
      id: `exec_${Date.now()}`,
      status: 'running' as ExecutionStatus,
      stepExecutions: steps.map(step => ({
        stepId: step.id,
        status: 'pending' as StepExecutionStatus,
        input: '',
        output: '',
        startTime: undefined,
        endTime: undefined,
        tokensUsed: 0
      })),
      totalTokens: 0,
      startTime: new Date()
    };

    this.abortController = new AbortController();

    try {
      let currentInput = initialInput;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepExecution = this.execution.stepExecutions[i];

        // Update step status to running
        stepExecution.status = 'running';
        stepExecution.input = currentInput;
        stepExecution.startTime = new Date();
        
        callbacks?.onStepStart?.(step.id);

        try {
          // Generate prompt
          const prompt = this.generatePrompt(step, currentInput);
          
          // Execute step via Supabase Edge Function
          const output = await this.executeStep(prompt, step.id, callbacks);
          
          // Update step execution
          stepExecution.output = output;
          stepExecution.status = 'completed';
          stepExecution.endTime = new Date();
          
          callbacks?.onStepComplete?.(step.id, output);
          
          // Pass output to next step
          currentInput = output;
          
        } catch (error) {
          stepExecution.status = 'error';
          stepExecution.error = error instanceof Error ? error.message : 'Unknown error';
          stepExecution.endTime = new Date();
          
          callbacks?.onStepError?.(step.id, stepExecution.error);
          
          // Continue with next steps or stop based on error handling strategy
          throw error;
        }
      }

      // Pipeline completed successfully
      this.execution.status = 'completed';
      this.execution.endTime = new Date();
      
      callbacks?.onPipelineComplete?.(this.execution);
      
      return this.execution;

    } catch (error) {
      this.execution.status = 'error';
      this.execution.endTime = new Date();
      
      const errorMessage = error instanceof Error ? error.message : 'Pipeline execution failed';
      callbacks?.onPipelineError?.(errorMessage);
      
      throw error;
    }
  }

  private generatePrompt(step: Step, input: string): string {
    const template = PROMPT_TEMPLATES[step.type as keyof typeof PROMPT_TEMPLATES];
    const prompt = template(step.config);
    return prompt.replace('{{input}}', input);
  }

  private async executeStep(
    prompt: string,
    stepId: string,
    callbacks?: ExecutionCallbacks
  ): Promise<string> {
    const response = await fetch(
      `https://xdtrnlhfyuyxgjwhuumi.functions.supabase.co/execute-pipeline-step`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdHJubGhmeXV5eGdqd2h1dW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzE2MzUsImV4cCI6MjA2ODM0NzYzNX0.sc8_i9U8GZ1sKUahnB61_mXTvZGJBV9wbUMGieDHx2o`,
        },
        body: JSON.stringify({
          prompt,
          stepId
        }),
        signal: this.abortController?.signal
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullOutput = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk') {
                fullOutput = data.fullOutput;
                callbacks?.onStepProgress?.(stepId, data.chunk);
              } else if (data.type === 'complete') {
                fullOutput = data.output;
                return fullOutput;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              // Skip malformed JSON lines
              console.warn('Failed to parse SSE line:', line);
            }
          }
        }
      }

      return fullOutput;
    } finally {
      reader.releaseLock();
    }
  }

  cancelExecution(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.execution) {
      this.execution.status = 'cancelled';
      this.execution.endTime = new Date();
    }
  }

  getExecution(): PipelineExecution | null {
    return this.execution;
  }
}

// Singleton instance
export const pipelineExecutor = new PipelineExecutor();