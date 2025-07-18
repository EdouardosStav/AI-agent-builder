import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface InitialInputCardProps {
  value: string;
  onChange: (value: string) => void;
}

export const InitialInputCard: React.FC<InitialInputCardProps> = ({
  value,
  onChange,
}) => {
  const characterCount = value.length;
  const maxCharacters = 5000;

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Initial Input</CardTitle>
        <CardDescription>
          Enter the text you want to process through your pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="initial-input">Your text</Label>
          <Textarea
            id="initial-input"
            placeholder="Paste or type your text here... This will be processed through each step in your pipeline."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[120px] resize-y"
            maxLength={maxCharacters}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {value.trim() ? `${value.trim().split(/\s+/).length} words` : '0 words'}
            </span>
            <span className={characterCount > maxCharacters * 0.9 ? 'text-warning' : ''}>
              {characterCount}/{maxCharacters} characters
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};