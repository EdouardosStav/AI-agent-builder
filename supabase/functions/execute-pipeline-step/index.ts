import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from 'https://esm.sh/openai@latest';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, stepId } = await req.json();
    
    console.log(`Executing step ${stepId} with prompt:`, prompt);

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that processes text according to specific instructions. Be concise and follow the instructions exactly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    let fullOutput = '';
    
    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullOutput += content;
              
              // Send chunk to client
              const data = JSON.stringify({
                type: 'chunk',
                stepId,
                chunk: content,
                fullOutput
              });
              
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }
          
          // Send completion event
          const completionData = JSON.stringify({
            type: 'complete',
            stepId,
            output: fullOutput,
            tokensUsed: 0 // OpenAI streaming doesn't provide token count
          });
          
          controller.enqueue(new TextEncoder().encode(`data: ${completionData}\n\n`));
          controller.close();
          
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            stepId,
            error: error.message
          });
          
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in execute-pipeline-step function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        output: ''
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});