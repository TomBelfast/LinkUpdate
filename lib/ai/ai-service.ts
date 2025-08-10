/**
 * AI Provider Abstraction Layer
 * Provides intelligent routing between AI providers with cost optimization and fallback
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ========================
// Core Types & Interfaces
// ========================

export interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  systemPrompt?: string;
  timeout?: number;
}

export interface AIResponse {
  text: string;
  model: string;
  provider: string;
  tokensUsed?: number;
  cost?: number;
  responseTime: number;
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  currency: string;
}

export interface ProviderHealth {
  available: boolean;
  latency: number;
  errorRate: number;
  rateLimitRemaining?: number;
}

export interface AIProvider {
  readonly name: string;
  readonly models: string[];
  
  generateText(prompt: string, options?: AIOptions): Promise<AIResponse>;
  estimateCost(prompt: string, options?: AIOptions): Promise<CostEstimate>;
  checkHealth(): Promise<ProviderHealth>;
  isAvailable(): Promise<boolean>;
}

// ===================
// OpenAI Provider
// ===================

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  readonly models = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  
  private client: OpenAI;
  private readonly costPerToken = {
    'gpt-4': { input: 0.00003, output: 0.00006 },
    'gpt-4-turbo': { input: 0.00001, output: 0.00003 },
    'gpt-3.5-turbo': { input: 0.0000015, output: 0.000002 },
  };

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Allow for testing environment
    });
  }

  async generateText(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const model = options.model || 'gpt-3.5-turbo';
      
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
          { role: 'user' as const, content: prompt }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      });

      const responseTime = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;
      const cost = this.calculateCost(model, response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0);

      return {
        text: response.choices[0]?.message?.content || '',
        model,
        provider: this.name,
        tokensUsed,
        cost,
        responseTime,
      };
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async estimateCost(prompt: string, options: AIOptions = {}): Promise<CostEstimate> {
    const model = options.model || 'gpt-3.5-turbo';
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = options.maxTokens || 150;
    
    const costs = this.costPerToken[model as keyof typeof this.costPerToken];
    if (!costs) {
      throw new Error(`Unknown model: ${model}`);
    }
    
    const estimatedCost = (inputTokens * costs.input) + (outputTokens * costs.output);
    
    return {
      inputTokens,
      outputTokens,
      estimatedCost,
      currency: 'USD',
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      // Simple health check with minimal API call
      await this.client.models.list();
      const latency = Date.now() - startTime;
      
      return {
        available: true,
        latency,
        errorRate: 0,
      };
    } catch (error) {
      return {
        available: false,
        latency: Date.now() - startTime,
        errorRate: 1,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.available && health.latency < 5000; // 5s timeout
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costs = this.costPerToken[model as keyof typeof this.costPerToken];
    if (!costs) return 0;
    
    return (inputTokens * costs.input) + (outputTokens * costs.output);
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }
}

// ========================
// Perplexity Provider (OpenAI-compatible)
// ========================

export class PerplexityProvider implements AIProvider {
  readonly name = 'perplexity';
  readonly models = [
    'sonar-small-online',
    'sonar-medium-online',
    'sonar-large-online',
    'sonar-small',
    'sonar-medium',
    'llama-3.1-8b-instruct',
    'llama-3.1-70b-instruct'
  ];

  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.PPLX_API_KEY,
      baseURL: 'https://api.perplexity.ai',
    });
  }

  async generateText(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const envModel = process.env.PPLX_MODEL;
      const candidateModels = [
        options.model,
        envModel,
        'sonar-small-online',
        'sonar-medium-online',
        'sonar-small',
        'sonar-medium',
        'llama-3-8b-instruct',
        'llama-3-70b-instruct',
      ].filter(Boolean) as string[];

      let lastError: any = null;
      for (const model of candidateModels) {
        try {
          const response = await this.client.chat.completions.create({
            model,
            messages: [
              ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
              { role: 'user' as const, content: prompt }
            ],
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature ?? 0.7,
          });

          const responseTime = Date.now() - startTime;
          const tokensUsed = response.usage?.total_tokens || 0;

          return {
            text: response.choices[0]?.message?.content || '',
            model,
            provider: this.name,
            tokensUsed,
            cost: 0,
            responseTime,
          };
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || '';
          if (msg.includes('Invalid model')) {
            continue; // try next candidate
          }
          throw err;
        }
      }
      // If all failed
      throw new Error(`Perplexity API Error: ${lastError?.message || 'All candidate models failed'}`);
    } catch (error) {
      throw new Error(`Perplexity API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async estimateCost(prompt: string, options: AIOptions = {}): Promise<CostEstimate> {
    // Public cenniki są zmienne; zwracamy 0 jako neutralną wartość
    return {
      inputTokens: Math.ceil(prompt.length / 4),
      outputTokens: options.maxTokens || 150,
      estimatedCost: 0,
      currency: 'USD',
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      await this.client.chat.completions.create({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });

      const latency = Date.now() - startTime;
      return { available: true, latency, errorRate: 0 };
    } catch (_) {
      return { available: false, latency: Date.now() - startTime, errorRate: 1 };
    }
  }

  async isAvailable(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.available && health.latency < 5000;
  }
}

// =====================
// Anthropic Provider
// =====================

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  readonly models = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
  
  private client: Anthropic;
  private readonly costPerToken = {
    'claude-3-opus': { input: 0.000015, output: 0.000075 },
    'claude-3-sonnet': { input: 0.000003, output: 0.000015 },
    'claude-3-haiku': { input: 0.00000025, output: 0.00000125 },
  };

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true, // Allow for testing environment
    });
  }

  async generateText(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const model = options.model || 'claude-3-haiku';
      
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseTime = Date.now() - startTime;
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      const cost = this.calculateCost(model, response.usage.input_tokens, response.usage.output_tokens);

      return {
        text: response.content[0]?.type === 'text' ? response.content[0].text : '',
        model,
        provider: this.name,
        tokensUsed,
        cost,
        responseTime,
      };
    } catch (error) {
      throw new Error(`Anthropic API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async estimateCost(prompt: string, options: AIOptions = {}): Promise<CostEstimate> {
    const model = options.model || 'claude-3-haiku';
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = options.maxTokens || 150;
    
    const costs = this.costPerToken[model as keyof typeof this.costPerToken];
    if (!costs) {
      throw new Error(`Unknown model: ${model}`);
    }
    
    const estimatedCost = (inputTokens * costs.input) + (outputTokens * costs.output);
    
    return {
      inputTokens,
      outputTokens,
      estimatedCost,
      currency: 'USD',
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      // Simple health check with minimal API call
      await this.client.messages.create({
        model: 'claude-3-haiku',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      
      const latency = Date.now() - startTime;
      
      return {
        available: true,
        latency,
        errorRate: 0,
      };
    } catch (error) {
      return {
        available: false,
        latency: Date.now() - startTime,
        errorRate: 1,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.available && health.latency < 5000; // 5s timeout
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costs = this.costPerToken[model as keyof typeof this.costPerToken];
    if (!costs) return 0;
    
    return (inputTokens * costs.input) + (outputTokens * costs.output);
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }
}

// ===================
// Google AI Provider
// ===================

export class GoogleAIProvider implements AIProvider {
  readonly name = 'google';
  readonly models = ['gemini-pro', 'gemini-pro-vision'];
  
  private client: GoogleGenerativeAI;
  private readonly costPerToken = {
    'gemini-pro': { input: 0.00000025, output: 0.0000005 },
    'gemini-pro-vision': { input: 0.00000025, output: 0.0000005 },
  };

  constructor(apiKey?: string) {
    this.client = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_AI_API_KEY || '');
  }

  async generateText(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const model = options.model || 'gemini-pro';
      const genModel = this.client.getGenerativeModel({ model });
      
      const response = await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        },
      });

      const responseTime = Date.now() - startTime;
      const text = response.response.text();
      const tokensUsed = response.response.usageMetadata?.totalTokenCount || 0;
      const cost = this.calculateCost(model, 
        response.response.usageMetadata?.promptTokenCount || 0,
        response.response.usageMetadata?.candidatesTokenCount || 0
      );

      return {
        text,
        model,
        provider: this.name,
        tokensUsed,
        cost,
        responseTime,
      };
    } catch (error) {
      throw new Error(`Google AI API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async estimateCost(prompt: string, options: AIOptions = {}): Promise<CostEstimate> {
    const model = options.model || 'gemini-pro';
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = options.maxTokens || 150;
    
    const costs = this.costPerToken[model as keyof typeof this.costPerToken];
    if (!costs) {
      throw new Error(`Unknown model: ${model}`);
    }
    
    const estimatedCost = (inputTokens * costs.input) + (outputTokens * costs.output);
    
    return {
      inputTokens,
      outputTokens,
      estimatedCost,
      currency: 'USD',
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      const genModel = this.client.getGenerativeModel({ model: 'gemini-pro' });
      await genModel.generateContent('test');
      
      const latency = Date.now() - startTime;
      
      return {
        available: true,
        latency,
        errorRate: 0,
      };
    } catch (error) {
      return {
        available: false,
        latency: Date.now() - startTime,
        errorRate: 1,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.available && health.latency < 5000; // 5s timeout
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costs = this.costPerToken[model as keyof typeof this.costPerToken];
    if (!costs) return 0;
    
    return (inputTokens * costs.input) + (outputTokens * costs.output);
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }
}

// =================
// AI Orchestrator
// =================

export interface OrchestrationStrategy {
  costOptimized: boolean;
  fallbackEnabled: boolean;
  maxRetries: number;
  preferredProvider?: string;
  maxCostPerRequest?: number;
}

export class AIOrchestrator {
  private providers: Map<string, AIProvider> = new Map();
  private strategy: OrchestrationStrategy;
  private healthCache = new Map<string, { health: ProviderHealth; timestamp: number }>();
  
  constructor(
    providers: AIProvider[] = [],
    strategy: OrchestrationStrategy = {
      costOptimized: true,
      fallbackEnabled: true,
      maxRetries: 3,
      maxCostPerRequest: 0.10, // $0.10 max per request
    }
  ) {
    providers.forEach(provider => {
      this.providers.set(provider.name, provider);
    });
    this.strategy = strategy;
  }

  addProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  removeProvider(providerName: string): void {
    this.providers.delete(providerName);
  }

  async generateText(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const availableProviders = await this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    // Select optimal provider based on strategy
    const selectedProvider = await this.selectProvider(availableProviders, prompt, options);
    
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.strategy.maxRetries) {
      try {
        const response = await selectedProvider.generateText(prompt, options);
        
        // Validate cost constraint
        if (response.cost && this.strategy.maxCostPerRequest && 
            response.cost > this.strategy.maxCostPerRequest) {
          throw new Error(`Cost ${response.cost} exceeds maximum ${this.strategy.maxCostPerRequest}`);
        }
        
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        attempts++;
        
        if (this.strategy.fallbackEnabled && attempts < this.strategy.maxRetries) {
          // Try next available provider
          const nextProvider = availableProviders[attempts % availableProviders.length];
          if (nextProvider && nextProvider !== selectedProvider) {
            continue;
          }
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }

    throw new Error(`All providers failed after ${attempts} attempts. Last error: ${lastError?.message}`);
  }

  async estimateCosts(prompt: string, options: AIOptions = {}): Promise<Map<string, CostEstimate>> {
    const estimates = new Map<string, CostEstimate>();
    
    for (const [name, provider] of this.providers) {
      try {
        const estimate = await provider.estimateCost(prompt, options);
        estimates.set(name, estimate);
      } catch (error) {
        console.warn(`Failed to estimate cost for ${name}:`, error);
      }
    }
    
    return estimates;
  }

  async getProviderHealth(): Promise<Map<string, ProviderHealth>> {
    const healthMap = new Map<string, ProviderHealth>();
    
    for (const [name, provider] of this.providers) {
      try {
        const health = await this.getCachedHealth(name, provider);
        healthMap.set(name, health);
      } catch (error) {
        healthMap.set(name, {
          available: false,
          latency: 0,
          errorRate: 1,
        });
      }
    }
    
    return healthMap;
  }

  private async getAvailableProviders(): Promise<AIProvider[]> {
    const available: AIProvider[] = [];
    
    for (const provider of this.providers.values()) {
      try {
        if (await provider.isAvailable()) {
          available.push(provider);
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} availability check failed:`, error);
      }
    }
    
    return available;
  }

  private async selectProvider(
    availableProviders: AIProvider[], 
    prompt: string, 
    options: AIOptions
  ): Promise<AIProvider> {
    // If preferred provider is specified and available
    if (this.strategy.preferredProvider) {
      const preferred = availableProviders.find(p => p.name === this.strategy.preferredProvider);
      if (preferred) {
        return preferred;
      }
    }

    // Cost-optimized selection
    if (this.strategy.costOptimized && availableProviders.length > 1) {
      const costEstimates = await Promise.allSettled(
        availableProviders.map(async (provider) => {
          const estimate = await provider.estimateCost(prompt, options);
          return { provider, estimate };
        })
      );

      const validEstimates = costEstimates
        .filter((result): result is PromiseFulfilledResult<{ provider: AIProvider; estimate: CostEstimate }> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
        .sort((a, b) => a.estimate.estimatedCost - b.estimate.estimatedCost);

      if (validEstimates.length > 0) {
        return validEstimates[0].provider;
      }
    }

    // Default: return first available provider
    return availableProviders[0];
  }

  private async getCachedHealth(name: string, provider: AIProvider): Promise<ProviderHealth> {
    const cached = this.healthCache.get(name);
    const cacheAge = Date.now() - (cached?.timestamp || 0);
    
    // Use cached health if less than 30 seconds old
    if (cached && cacheAge < 30000) {
      return cached.health;
    }
    
    const health = await provider.checkHealth();
    this.healthCache.set(name, { health, timestamp: Date.now() });
    
    return health;
  }
}

// ==================
// Factory Functions
// ==================

export function createOpenAIProvider(apiKey?: string): OpenAIProvider {
  return new OpenAIProvider(apiKey);
}

export function createAnthropicProvider(apiKey?: string): AnthropicProvider {
  return new AnthropicProvider(apiKey);
}

export function createGoogleAIProvider(apiKey?: string): GoogleAIProvider {
  return new GoogleAIProvider(apiKey);
}

export function createOrchestrator(providers: AIProvider[] = []): AIOrchestrator {
  // Only create default providers if we have empty providers array and API keys are available
  if (providers.length === 0) {
    const defaultProviders = [];
    
    if (process.env.OPENAI_API_KEY) {
      defaultProviders.push(createOpenAIProvider());
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      defaultProviders.push(createAnthropicProvider());
    }
    
    if (process.env.GOOGLE_AI_API_KEY) {
      defaultProviders.push(createGoogleAIProvider());
    }
    
    if (process.env.PPLX_API_KEY) {
      defaultProviders.push(new PerplexityProvider());
    }
    
    return new AIOrchestrator(defaultProviders);
  }
  
  return new AIOrchestrator(providers);
}

// Default export
export default AIOrchestrator;