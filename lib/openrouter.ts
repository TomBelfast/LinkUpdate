import OpenAI from 'openai';

export const openRouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL,
    'X-Title': process.env.SITE_NAME,
  },
});

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function generateResponse(messages: ChatMessage[], model = 'openai/gpt-3.5-turbo') {
  try {
    const completion = await openRouter.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    throw error;
  }
} 