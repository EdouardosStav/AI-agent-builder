import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ValidationError } from '@/types/pipeline';

interface ValidationSummaryProps {
  validationErrors: ValidationError[];
  stepCount: number;
  hasInitialInput: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validationErrors,
  stepCount,
  hasInitialInput,
}) => {
  const hasErrors = validationErrors.length > 0;
  const isEmpty = stepCount === 0;
  const missingInput = !hasInitialInput;

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your pipeline is empty. Add some steps to get started!
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (missingInput) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Add some initial input text to process through your pipeline.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (hasErrors) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Your pipeline has configuration errors that need to be fixed.</span>
              <Badge variant="destructive">{validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}</Badge>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Alert className="border-success text-success">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Pipeline is ready to run!</span>
            <Badge variant="secondary">{stepCount} step{stepCount !== 1 ? 's' : ''}</Badge>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};