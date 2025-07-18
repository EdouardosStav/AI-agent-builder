import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Square, RotateCcw, Trash2 } from 'lucide-react';
import { ExecutionStatus } from '@/types/pipeline';
import { Progress } from '@/components/ui/progress';

interface ExecutionControlsProps {
  status: ExecutionStatus;
  progress: number;
  onRun: () => void;
  onCancel: () => void;
  onClear: () => void;
  onRetry: () => void;
  disabled?: boolean;
}

export const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  status,
  progress,
  onRun,
  onCancel,
  onClear,
  onRetry,
  disabled = false
}) => {
  const isRunning = status === 'running';
  const hasResults = status === 'completed' || status === 'error';

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Executing pipeline...';
      case 'completed':
        return 'Pipeline completed successfully';
      case 'error':
        return 'Pipeline execution failed';
      case 'cancelled':
        return 'Pipeline execution cancelled';
      default:
        return 'Ready to run pipeline';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {!isRunning ? (
              <Button
                onClick={onRun}
                disabled={disabled}
                className="min-w-[100px]"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Pipeline
              </Button>
            ) : (
              <Button
                onClick={onCancel}
                variant="destructive"
                className="min-w-[100px]"
                size="sm"
              >
                <Square className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}

            {status === 'error' && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}

            {hasResults && (
              <Button
                onClick={onClear}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
            )}
          </div>

          <div className="text-right">
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};