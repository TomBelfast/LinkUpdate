import { NextResponse } from 'next/server';
import { PerplexityProvider } from '@/lib/ai/ai-service';

export async function GET() {
  try {
    const apiKey = process.env.PPLX_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'PPLX_API_KEY not set' }, { status: 503 });
    }

    const provider = new PerplexityProvider(apiKey);
    const res = await provider.generateText('Reply with exactly: OK', {
      model: 'sonar-small-online',
      maxTokens: 10,
      temperature: 0.0,
      systemPrompt: 'Only answer with OK',
      timeout: 15000,
    });

    return NextResponse.json({ ok: true, text: res.text, model: res.model, provider: res.provider });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}


