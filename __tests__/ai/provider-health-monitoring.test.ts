/**
 * Test Suite for AI Provider Health Monitoring
 * Tests health checks, availability detection, and monitoring
 */

import {
  OpenAIProvider,
  AnthropicProvider,
  GoogleAIProvider,
  ProviderHealth,
} from '@/lib/ai/ai-service';

import { vi } from 'vitest';

// Mock the actual API clients to control test behavior
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      models: {
        list: vi.fn(),
      },
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
  };
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn(),
      }),
    })),
  };
});

describe('Provider Health Monitoring', () => {
  describe('OpenAI Health Monitoring', () => {
    let provider: OpenAIProvider;
    let mockOpenAI: any;

    beforeEach(() => {
      const OpenAIConstructor = await import('openai');
      mockOpenAI = {
        models: {
          list: vi.fn(),
        },
      };
      vi.mocked(OpenAIConstructor.default).mockImplementation(() => mockOpenAI);
      
      provider = new OpenAIProvider('test-key');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    test('should report healthy when API is available', async () => {
      mockOpenAI.models.list.mockResolvedValue({ data: [] });

      const health = await provider.checkHealth();

      expect(health.available).toBe(true);
      expect(health.latency).toBeGreaterThan(0);
      expect(health.errorRate).toBe(0);
      expect(mockOpenAI.models.list).toHaveBeenCalled();
    });

    test('should report unhealthy when API fails', async () => {
      mockOpenAI.models.list.mockRejectedValue(new Error('API Error'));

      const health = await provider.checkHealth();

      expect(health.available).toBe(false);
      expect(health.latency).toBeGreaterThan(0);
      expect(health.errorRate).toBe(1);
    });

    test('should measure latency accurately', async () => {
      // Simulate slow API response
      mockOpenAI.models.list.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );

      const startTime = Date.now();
      const health = await provider.checkHealth();
      const actualLatency = Date.now() - startTime;

      expect(health.latency).toBeGreaterThan(95); // Allow small margin
      expect(health.latency).toBeLessThan(actualLatency + 50); // Upper bound
    });

    test('should determine availability correctly', async () => {
      // Test available scenario
      mockOpenAI.models.list.mockResolvedValue({ data: [] });
      let isAvailable = await provider.isAvailable();
      expect(isAvailable).toBe(true);

      // Test unavailable scenario
      mockOpenAI.models.list.mockRejectedValue(new Error('Network error'));
      isAvailable = await provider.isAvailable();
      expect(isAvailable).toBe(false);
    });

    test('should handle timeout scenarios', async () => {
      // Simulate very slow response (over 5s timeout)
      mockOpenAI.models.list.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 6000))
      );

      const isAvailable = await provider.isAvailable();
      expect(isAvailable).toBe(false); // Should timeout and be considered unavailable
    }, 10000);
  });

  describe('Anthropic Health Monitoring', () => {
    let provider: AnthropicProvider;
    let mockAnthropic: any;

    beforeEach(() => {
      const AnthropicConstructor = require('@anthropic-ai/sdk').default;
      mockAnthropic = {
        messages: {
          create: jest.fn(),
        },
      };
      AnthropicConstructor.mockImplementation(() => mockAnthropic);
      
      provider = new AnthropicProvider('test-key');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should perform health check with minimal request', async () => {
      mockAnthropic.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'test response' }],
        usage: { input_tokens: 1, output_tokens: 2 },
      });

      const health = await provider.checkHealth();

      expect(health.available).toBe(true);
      expect(health.errorRate).toBe(0);
      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-haiku',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
    });

    test('should handle rate limiting', async () => {
      mockAnthropic.messages.create.mockRejectedValue(new Error('Rate limit exceeded'));

      const health = await provider.checkHealth();

      expect(health.available).toBe(false);
      expect(health.errorRate).toBe(1);
    });
  });

  describe('Google AI Health Monitoring', () => {
    let provider: GoogleAIProvider;
    let mockGoogle: any;
    let mockModel: any;

    beforeEach(() => {
      const GoogleConstructor = require('@google/generative-ai').GoogleGenerativeAI;
      mockModel = {
        generateContent: jest.fn(),
      };
      mockGoogle = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };
      GoogleConstructor.mockImplementation(() => mockGoogle);
      
      provider = new GoogleAIProvider('test-key');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should check health using generateContent', async () => {
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => 'test response',
        },
      });

      const health = await provider.checkHealth();

      expect(health.available).toBe(true);
      expect(mockGoogle.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-pro' });
      expect(mockModel.generateContent).toHaveBeenCalledWith('test');
    });

    test('should handle authentication errors', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('Invalid API key'));

      const health = await provider.checkHealth();

      expect(health.available).toBe(false);
      expect(health.errorRate).toBe(1);
    });
  });

  describe('Health Monitoring Integration', () => {
    test('should track error rates over time', async () => {
      const provider = new OpenAIProvider('test-key');
      const mockOpenAI = require('openai').default();

      // Simulate intermittent failures
      let callCount = 0;
      mockOpenAI.models.list.mockImplementation(() => {
        callCount++;
        if (callCount % 3 === 0) {
          return Promise.reject(new Error('Intermittent failure'));
        }
        return Promise.resolve({ data: [] });
      });

      // Perform multiple health checks
      const healthChecks = await Promise.allSettled([
        provider.checkHealth(),
        provider.checkHealth(),
        provider.checkHealth(),
        provider.checkHealth(),
        provider.checkHealth(),
      ]);

      const failedChecks = healthChecks.filter(result => 
        result.status === 'fulfilled' && !result.value.available
      ).length;

      const errorRate = failedChecks / healthChecks.length;
      expect(errorRate).toBeGreaterThan(0);
      expect(errorRate).toBeLessThan(1);
    });

    test('should compare latency across providers', async () => {
      const providers = [
        new OpenAIProvider('test'),
        new AnthropicProvider('test'),
        new GoogleAIProvider('test'),
      ];

      // Mock different latencies
      const mockOpenAI = require('openai').default();
      const mockAnthropic = require('@anthropic-ai/sdk').default();
      const mockGoogle = require('@google/generative-ai').GoogleGenerativeAI();

      mockOpenAI.models.list.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );

      mockAnthropic.messages.create.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          content: [{ type: 'text', text: 'test' }],
          usage: { input_tokens: 1, output_tokens: 1 },
        }), 200))
      );

      mockGoogle.getGenerativeModel().generateContent.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          response: { text: () => 'test' },
        }), 150))
      );

      const healthResults = await Promise.all(
        providers.map(provider => provider.checkHealth())
      );

      // Verify latency measurements
      expect(healthResults[0].latency).toBeLessThan(healthResults[1].latency); // OpenAI < Anthropic
      expect(healthResults[1].latency).toBeGreaterThan(healthResults[2].latency); // Anthropic > Google
    });

    test('should handle concurrent health checks', async () => {
      const provider = new OpenAIProvider('test-key');
      const mockOpenAI = require('openai').default();

      mockOpenAI.models.list.mockResolvedValue({ data: [] });

      // Perform multiple concurrent health checks
      const concurrentChecks = Array(10).fill(null).map(() => provider.checkHealth());
      const results = await Promise.all(concurrentChecks);

      // All should succeed
      expect(results.every(result => result.available)).toBe(true);
      expect(mockOpenAI.models.list).toHaveBeenCalledTimes(10);
    });

    test('should provide health monitoring statistics', async () => {
      const provider = new OpenAIProvider('test-key');
      const mockOpenAI = require('openai').default();

      // Mock mixed results
      let successCount = 0;
      mockOpenAI.models.list.mockImplementation(() => {
        successCount++;
        if (successCount <= 7) {
          return Promise.resolve({ data: [] });
        } else {
          return Promise.reject(new Error('Failure'));
        }
      });

      const healthChecks: ProviderHealth[] = [];
      for (let i = 0; i < 10; i++) {
        try {
          const health = await provider.checkHealth();
          healthChecks.push(health);
        } catch (error) {
          // Handle any unexpected errors
        }
      }

      const availableCount = healthChecks.filter(h => h.available).length;
      const averageLatency = healthChecks.reduce((sum, h) => sum + h.latency, 0) / healthChecks.length;
      const totalErrorRate = healthChecks.reduce((sum, h) => sum + h.errorRate, 0) / healthChecks.length;

      expect(availableCount).toBe(7);
      expect(averageLatency).toBeGreaterThan(0);
      expect(totalErrorRate).toBeCloseTo(0.3); // 3/10 failures
    });
  });
});