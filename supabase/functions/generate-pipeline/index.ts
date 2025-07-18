import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PIPELINE_FUNCTION_SCHEMA = {
  name: "generate_pipeline",
  description: "Generate a pipeline configuration based on user goals and requirements",
  parameters: {
    type: "object",
    properties: {
      steps: {
        type: "array",
        description: "Array of pipeline steps to achieve the user's goal",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["summarize", "translate", "rewrite", "extract"],
              description: "The type of processing step"
            },
            config: {
              type: "object",
              description: "Configuration for this step",
              properties: {
                length: {
                  type: "string",
                  enum: ["short", "medium", "long"],
                  description: "For summarize: length of summary"
                },
                style: {
                  type: "string", 
                  enum: ["bullet-points", "paragraph"],
                  description: "For summarize: output style"
                },
                targetLanguage: {
                  type: "string",
                  enum: ["french", "spanish", "german", "italian", "portuguese", "dutch", "chinese", "japanese"],
                  description: "For translate: target language"
                },
                tone: {
                  type: "string",
                  enum: ["casual", "formal", "professional", "friendly"],
                  description: "For rewrite: desired tone"
                },
                extractType: {
                  type: "string",
                  enum: ["keywords", "entities", "both"], 
                  description: "For extract: what to extract"
                }
              }
            }
          },
          required: ["type", "config"]
        }
      },
      suggested_name: {
        type: "string",
        description: "A suggested name for this pipeline"
      },
      explanation: {
        type: "string", 
        description: "Brief explanation of how this pipeline achieves the user's goal"
      }
    },
    required: ["steps", "suggested_name", "explanation"]
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { goal } = await req.json();

    if (!goal) {
      return new Response(
        JSON.stringify({ error: 'Goal is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating pipeline for goal:', goal);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that helps users create text processing pipelines. 

Available step types:
- summarize: Create concise summaries (config: length: short/medium/long, style: bullet-points/paragraph)
- translate: Translate to other languages (config: targetLanguage: french/spanish/german/italian/portuguese/dutch/chinese/japanese)  
- rewrite: Change tone/style (config: tone: casual/formal/professional/friendly)
- extract: Extract information (config: extractType: keywords/entities/both)

When a user describes their goal, analyze it and create a logical sequence of 1-3 steps that will achieve their objective. Always provide a clear explanation of how the pipeline works.

Examples:
- "Make this professional and translate to German" → rewrite(professional) → translate(german)
- "Summarize for social media" → summarize(short, bullet-points) → rewrite(casual)
- "Prepare for LinkedIn post" → rewrite(professional) → summarize(medium, paragraph)

Create practical, efficient pipelines that directly address the user's needs.`
          },
          {
            role: 'user',
            content: `Create a pipeline for this goal: "${goal}"`
          }
        ],
        functions: [PIPELINE_FUNCTION_SCHEMA],
        function_call: { name: "generate_pipeline" },
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.function_call?.arguments) {
      throw new Error('No function call in OpenAI response');
    }

    const pipelineData = JSON.parse(data.choices[0].message.function_call.arguments);
    
    // Validate that we have the required fields
    if (!pipelineData.steps || !Array.isArray(pipelineData.steps)) {
      throw new Error('Invalid pipeline structure: missing steps array');
    }

    // Generate IDs for steps
    const stepsWithIds = pipelineData.steps.map((step: any, index: number) => ({
      id: `step-${Date.now()}-${index}`,
      type: step.type,
      config: step.config || {}
    }));

    const result = {
      steps: stepsWithIds,
      suggested_name: pipelineData.suggested_name || 'Generated Pipeline',
      explanation: pipelineData.explanation || 'Pipeline generated based on your request.'
    };

    console.log('Generated pipeline result:', JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-pipeline function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate pipeline',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});