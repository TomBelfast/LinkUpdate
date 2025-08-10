/**
 * AI Cost Estimation API Endpoint
 * Provides cost estimates for different AI providers before generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrchestrator, AIOptions } from '@/lib/ai/ai-service';

interface EstimateRequest {
  prompt: string;
  options?: AIOptions;
}

interface EstimateResponse {
  success: boolean;
  data?: {
    estimates: Record<string, {
      inputTokens: number;
      outputTokens: number;
      estimatedCost: number;
      currency: string;
    }>;
    cheapest: {
      provider: string;
      cost: number;
    };
    total: {
      providers: number;
      lowestCost: number;
      highestCost: number;
      averageCost: number;
    };
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<EstimateResponse>> {
  try {
    const body: EstimateRequest = await request.json();
    
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Validate prompt length
    if (body.prompt.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Prompt too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    // Create orchestrator with available providers
    const orchestrator = createOrchestrator();

    // Get cost estimates from all providers
    const estimatesMap = await orchestrator.estimateCosts(body.prompt, {
      maxTokens: body.options?.maxTokens || 150,
      model: body.options?.model,
    });

    if (estimatesMap.size === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No AI providers available for cost estimation' 
        },
        { status: 503 }
      );
    }

    // Convert Map to Object for JSON response
    const estimates: Record<string, any> = {};
    const costs: number[] = [];
    let cheapestProvider = '';
    let lowestCost = Infinity;

    for (const [provider, estimate] of estimatesMap) {
      estimates[provider] = estimate;
      costs.push(estimate.estimatedCost);
      
      if (estimate.estimatedCost < lowestCost) {
        lowestCost = estimate.estimatedCost;
        cheapestProvider = provider;
      }
    }

    // Calculate statistics
    const highestCost = Math.max(...costs);
    const averageCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

    const responseData = {
      estimates,
      cheapest: {
        provider: cheapestProvider,
        cost: lowestCost,
      },
      total: {
        providers: estimatesMap.size,
        lowestCost,
        highestCost,
        averageCost: Math.round(averageCost * 10000) / 10000, // Round to 4 decimal places
      },
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('[AI API] Cost estimation failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Cost estimation failed: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Quick cost comparison for different prompt sizes
    const testPrompts = [
      { name: 'short', text: 'Hello, world!' },
      { name: 'medium', text: 'Write a short paragraph about artificial intelligence and its impact on modern technology.' },
      { name: 'long', text: 'Write a comprehensive analysis of artificial intelligence, covering its history, current applications, future potential, ethical considerations, and impact on various industries including healthcare, finance, education, and transportation.' },
    ];

    const orchestrator = createOrchestrator();
    const results: Record<string, any> = {};

    for (const prompt of testPrompts) {
      try {
        const estimates = await orchestrator.estimateCosts(prompt.text, {
          maxTokens: 150,
        });

        const costs: number[] = [];
        const providers: Record<string, any> = {};

        for (const [provider, estimate] of estimates) {
          providers[provider] = {
            cost: estimate.estimatedCost,
            tokens: estimate.inputTokens + estimate.outputTokens,
          };
          costs.push(estimate.estimatedCost);
        }

        results[prompt.name] = {
          promptLength: prompt.text.length,
          providers,
          summary: {
            cheapest: Math.min(...costs),
            mostExpensive: Math.max(...costs),
            average: costs.reduce((sum, cost) => sum + cost, 0) / costs.length,
          },
        };

      } catch (error) {
        results[prompt.name] = {
          error: error instanceof Error ? error.message : 'Failed to estimate',
        };
      }
    }

    return NextResponse.json({
      success: true,
      costComparison: results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[AI API] Cost comparison failed:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: 'Cost comparison failed' 
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