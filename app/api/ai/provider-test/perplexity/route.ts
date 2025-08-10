import { NextRequest, NextResponse } from 'next/server';
import { PerplexityProvider } from '@/lib/ai/ai-service';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PPLX_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'PPLX_API_KEY not set' }, { status: 503 });
    }

    const provider = new PerplexityProvider(apiKey);
    const url = new URL(request.url);
    const modelParam = url.searchParams.get('model') || undefined;
    const res = await provider.generateText('Reply with exactly: OK', {
      model: modelParam,
      maxTokens: 10,
      temperature: 0.0,
      systemPrompt: 'Only answer with OK',
      timeout: 15000,
    });

    return NextResponse.json({ ok: true, text: res.text, modelTried: modelParam || null, modelUsed: res.model, provider: res.provider });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}


