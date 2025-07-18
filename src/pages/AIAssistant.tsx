import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Workflow, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Step } from '@/types/pipeline';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pipeline?: {
    steps: Step[];
    name: string;
    explanation: string;
  };
}

const PRESET_TEMPLATES = [
  {
    title: "LinkedIn Post Optimizer",
    description: "Make content professional and concise for LinkedIn",
    prompt: "Make this content professional and optimize it for LinkedIn posting"
  },
  {
    title: "Product Description Generator", 
    description: "Create engaging product descriptions with key features",
    prompt: "Rewrite this as an engaging product description and extract key features"
  },
  {
    title: "Content Localization",
    description: "Adapt content for different markets and languages",
    prompt: "Make this content more formal and translate it to Spanish"
  },
  {
    title: "Social Media Prep",
    description: "Optimize content for social media platforms",
    prompt: "Summarize this content for social media and make it more casual"
  }
];

export const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generatePipeline = async (userGoal: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-pipeline', {
        body: { goal: userGoal }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error generating pipeline:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await generatePipeline(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: result.explanation || 'I\'ve generated a pipeline based on your request.',
        timestamp: new Date(),
        pipeline: {
          steps: result.steps || [],
          name: result.suggested_name || 'Generated Pipeline',
          explanation: result.explanation || ''
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate pipeline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemplate = (prompt: string) => {
    setInput(prompt);
  };

  const handleUsePipeline = (pipeline: NonNullable<ChatMessage['pipeline']>) => {
    const searchParams = new URLSearchParams({
      steps: JSON.stringify(pipeline.steps),
      name: pipeline.name
    });
    navigate(`/pipeline-builder?${searchParams}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">
          Describe what you want to achieve, and I'll create the perfect pipeline for you.
        </p>
      </div>

      {/* Preset Templates */}
      {messages.length === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick Start Templates
            </CardTitle>
            <CardDescription>
              Try these popular pipeline templates to get started quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_TEMPLATES.map((template, index) => (
                <Card key={index} className="cursor-pointer hover:bg-accent transition-colors" 
                      onClick={() => handleUseTemplate(template.prompt)}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <div className="space-y-4 mb-6 min-h-[300px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  {message.type === 'assistant' ? (
                    <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                  ) : null}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Pipeline Preview */}
                    {message.pipeline && (
                      <div className="mt-4 p-4 bg-background/10 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Workflow className="h-4 w-4" />
                            💡 Suggested Pipeline: {message.pipeline.name}
                          </h4>
                          <Button 
                            size="sm" 
                            onClick={() => handleUsePipeline(message.pipeline!)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Use This Pipeline
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {message.pipeline.steps.map((step, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {index + 1}. {step.type}
                              {Object.keys(step.config).length > 0 && (
                                <span className="text-xs opacity-75">
                                  ({Object.entries(step.config).map(([key, value]) => 
                                    `${key}: ${value}`).join(', ')})
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Generating your pipeline...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you want to achieve... (e.g., 'Make this sound more professional and translate to Italian')"
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};