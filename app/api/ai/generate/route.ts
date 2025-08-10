/**
 * AI Generation API Endpoint
 * Provides intelligent text generation with cost optimization and fallback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrchestrator, AIOptions } from '@/lib/ai/ai-service';

interface GenerateRequest {
  prompt: string;
  options?: AIOptions;
}

interface GenerateResponse {
  success: boolean;
  data?: {
    text: string;
    model: string;
    provider: string;
    tokensUsed?: number;
    cost?: number;
    responseTime: number;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await request.json();
    
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Validate prompt length (prevent abuse)
    if (body.prompt.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Prompt too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    // Create orchestrator with available providers
    const orchestrator = createOrchestrator();

    // Generate text with options
    const response = await orchestrator.generateText(body.prompt, {
      maxTokens: body.options?.maxTokens || 150,
      temperature: body.options?.temperature || 0.7,
      model: body.options?.model,
      systemPrompt: body.options?.systemPrompt,
      timeout: body.options?.timeout || 30000, // 30s timeout
    });

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('[AI API] Generation failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Handle specific error types
    if (errorMessage.includes('No AI providers available')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI services temporarily unavailable. Please try again later.' 
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        },
        { status: 429 }
      );
    }

    if (errorMessage.includes('Cost') && errorMessage.includes('exceeds')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request would exceed cost limits. Please try a shorter prompt.' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    // Health check endpoint
    const orchestrator = createOrchestrator();
    const healthMap = await orchestrator.getProviderHealth();

    const healthStatus = Object.fromEntries(healthMap);
    const availableProviders = Object.values(healthStatus).filter(h => h.available).length;

    return NextResponse.json({
      success: true,
      status: availableProviders > 0 ? 'healthy' : 'unhealthy',
      providers: healthStatus,
      availableCount: availableProviders,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[AI API] Health check failed:', error);

    return NextResponse.json(
      { 
        success: false, 
        status: 'error', 
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}