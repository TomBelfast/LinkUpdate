/**
 * Test Suite for AI Provider Cost Estimation
 * Tests cost calculation accuracy and optimization
 */

import {
  OpenAIProvider,
  AnthropicProvider,
  GoogleAIProvider,
} from '@/lib/ai/ai-service';

describe('Cost Estimation Tests', () => {
  describe('OpenAI Cost Estimation', () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
      provider = new OpenAIProvider('test-key');
    });

    test('should estimate GPT-4 costs correctly', async () => {
      const prompt = 'This is a test prompt with exactly twenty words to test the cost estimation accuracy of the system.';
      
      const estimate = await provider.estimateCost(prompt, {
        model: 'gpt-4',
        maxTokens: 150,
      });

      expect(estimate.estimatedCost).toBeGreaterThan(0);
      expect(estimate.currency).toBe('USD');
      expect(estimate.inputTokens).toBeGreaterThan(0);
      expect(estimate.outputTokens).toBe(150);
      
      // GPT-4 should be more expensive than GPT-3.5
      const gpt35Estimate = await provider.estimateCost(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 150,
      });
      
      expect(estimate.estimatedCost).toBeGreaterThan(gpt35Estimate.estimatedCost);
    });

    test('should handle different token amounts', async () => {
      const shortPrompt = 'Short';
      const longPrompt = 'This is a much longer prompt that contains significantly more words and should therefore result in higher token counts and consequently higher estimated costs for the API call.';

      const shortEstimate = await provider.estimateCost(shortPrompt);
      const longEstimate = await provider.estimateCost(longPrompt);

      expect(longEstimate.estimatedCost).toBeGreaterThan(shortEstimate.estimatedCost);
      expect(longEstimate.inputTokens).toBeGreaterThan(shortEstimate.inputTokens);
    });

    test('should handle invalid models gracefully', async () => {
      await expect(provider.estimateCost('test', { model: 'invalid-model' })).rejects.toThrow('Unknown model: invalid-model');
    });
  });

  describe('Anthropic Cost Estimation', () => {
    let provider: AnthropicProvider;

    beforeEach(() => {
      provider = new AnthropicProvider('test-key');
    });

    test('should estimate Claude costs correctly', async () => {
      const prompt = 'Test prompt for Claude cost estimation';
      
      const opusEstimate = await provider.estimateCost(prompt, {
        model: 'claude-3-opus',
        maxTokens: 100,
      });

      const haikuEstimate = await provider.estimateCost(prompt, {
        model: 'claude-3-haiku',
        maxTokens: 100,
      });

      expect(opusEstimate.estimatedCost).toBeGreaterThan(0);
      expect(haikuEstimate.estimatedCost).toBeGreaterThan(0);
      
      // Opus should be more expensive than Haiku
      expect(opusEstimate.estimatedCost).toBeGreaterThan(haikuEstimate.estimatedCost);
    });

    test('should default to haiku model', async () => {
      const estimate = await provider.estimateCost('test prompt');
      expect(estimate.estimatedCost).toBeGreaterThan(0);
    });
  });

  describe('Google AI Cost Estimation', () => {
    let provider: GoogleAIProvider;

    beforeEach(() => {
      provider = new GoogleAIProvider('test-key');
    });

    test('should estimate Gemini costs correctly', async () => {
      const prompt = 'Test prompt for Gemini cost estimation';
      
      const estimate = await provider.estimateCost(prompt, {
        model: 'gemini-pro',
        maxTokens: 200,
      });

      expect(estimate.estimatedCost).toBeGreaterThan(0);
      expect(estimate.currency).toBe('USD');
      expect(estimate.inputTokens).toBeGreaterThan(0);
      expect(estimate.outputTokens).toBe(200);
    });

    test('should be cost-effective compared to other providers', async () => {
      const prompt = 'Compare costs across providers';
      const options = { maxTokens: 100 };

      const openai = new OpenAIProvider('test');
      const anthropic = new AnthropicProvider('test');
      const google = new GoogleAIProvider('test');

      const [openaiEstimate, anthropicEstimate, googleEstimate] = await Promise.all([
        openai.estimateCost(prompt, { ...options, model: 'gpt-3.5-turbo' }),
        anthropic.estimateCost(prompt, { ...options, model: 'claude-3-haiku' }),
        google.estimateCost(prompt, { ...options, model: 'gemini-pro' }),
      ]);

      // Google should generally be the most cost-effective
      expect(googleEstimate.estimatedCost).toBeLessThanOrEqual(openaiEstimate.estimatedCost);
      expect(googleEstimate.estimatedCost).toBeLessThanOrEqual(anthropicEstimate.estimatedCost);
    });
  });

  describe('Cost Optimization Scenarios', () => {
    test('should identify most cost-effective option', async () => {
      const prompt = 'Find the cheapest option for this request';
      const options = { maxTokens: 150 };

      const providers = [
        new OpenAIProvider('test'),
        new AnthropicProvider('test'), 
        new GoogleAIProvider('test'),
      ];

      const estimates = await Promise.all([
        providers[0].estimateCost(prompt, { ...options, model: 'gpt-3.5-turbo' }),
        providers[1].estimateCost(prompt, { ...options, model: 'claude-3-haiku' }),
        providers[2].estimateCost(prompt, { ...options, model: 'gemini-pro' }),
      ]);

      const costs = estimates.map(est => est.estimatedCost);
      const minCost = Math.min(...costs);
      const cheapestIndex = costs.indexOf(minCost);

      expect(cheapestIndex).toBeGreaterThanOrEqual(0);
      expect(cheapestIndex).toBeLessThan(providers.length);
      
      // Google should generally be cheapest
      expect(cheapestIndex).toBe(2); // GoogleAI provider index
    });

    test('should calculate ROI for different models', async () => {
      const simplePrompt = 'Simple task';
      const complexPrompt = 'This is a very complex task that requires detailed analysis and comprehensive response with multiple steps and considerations.';

      const openai = new OpenAIProvider('test');
      
      const [simpleGpt35, complexGpt35, complexGpt4] = await Promise.all([
        openai.estimateCost(simplePrompt, { model: 'gpt-3.5-turbo' }),
        openai.estimateCost(complexPrompt, { model: 'gpt-3.5-turbo' }),
        openai.estimateCost(complexPrompt, { model: 'gpt-4' }),
      ]);

      // Cost should scale with complexity
      expect(complexGpt35.estimatedCost).toBeGreaterThan(simpleGpt35.estimatedCost);
      
      // GPT-4 premium should be justified for complex tasks
      const costRatio = complexGpt4.estimatedCost / complexGpt35.estimatedCost;
      expect(costRatio).toBeGreaterThan(1);
      expect(costRatio).toBeLessThan(10); // Should be reasonable premium
    });
  });

  describe('Token Estimation Accuracy', () => {
    test('should estimate tokens consistently across providers', async () => {
      const testPrompts = [
        'Short',
        'This is a medium length prompt with several words.',
        'This is a much longer prompt that contains significantly more content and should result in a proportionally higher token count estimation across all providers for consistency testing.',
      ];

      const providers = [
        new OpenAIProvider('test'),
        new AnthropicProvider('test'),
        new GoogleAIProvider('test'),
      ];

      for (const prompt of testPrompts) {
        const estimates = await Promise.all([
          providers[0].estimateCost(prompt),
          providers[1].estimateCost(prompt),
          providers[2].estimateCost(prompt),
        ]);

        const tokenCounts = estimates.map(est => est.inputTokens);
        
        // Token estimates should be similar across providers (within 50% variance)
        const maxTokens = Math.max(...tokenCounts);
        const minTokens = Math.min(...tokenCounts);
        const variance = (maxTokens - minTokens) / minTokens;
        
        expect(variance).toBeLessThan(0.5); // Less than 50% variance
      }
    });

    test('should handle edge cases', async () => {
      const edgeCases = [
        '', // Empty string
        ' ', // Single space
        '🚀🌟💡', // Emojis
        'Café résumé naïve', // Accented characters
        '中文测试', // Non-Latin characters
      ];

      const provider = new OpenAIProvider('test');

      for (const testCase of edgeCases) {
        const estimate = await provider.estimateCost(testCase);
        
        expect(estimate.inputTokens).toBeGreaterThanOrEqual(0);
        expect(estimate.estimatedCost).toBeGreaterThanOrEqual(0);
        expect(estimate.currency).toBe('USD');
      }
    });
  });
});