import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mysql from 'mysql2/promise';
import { createOrchestrator } from '@/lib/ai/ai-service';

async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.PPLX_API_KEY) {
      return NextResponse.json({ error: 'Perplexity API not configured' }, { status: 503 });
    }

    const repositoryId = parseInt(params.id);
    if (isNaN(repositoryId)) {
      return NextResponse.json({ error: 'Invalid repository ID' }, { status: 400 });
    }

    const connection = await getConnection();
    try {
      // Resolve user id
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',[session.user.email]
      );
      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const userId = (users[0] as any).id;

      // Fetch repository
      const [repos] = await connection.execute(
        'SELECT * FROM github_repositories WHERE id = ? AND user_id = ?',[repositoryId, userId]
      );
      if (!Array.isArray(repos) || repos.length === 0) {
        return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
      }
      const repo = (repos as any[])[0];

      // Build prompt
      const prompt = `Provide a concise, plain-language description (max 80 words) of the GitHub repository below, focusing on what it does and typical use cases. Avoid marketing fluff.\n\nName: ${repo.name}\nFull name: ${repo.full_name}\nURL: ${repo.html_url}\nLanguage: ${repo.language || 'unknown'}\nTopics: ${repo.topics || 'none'}\nExisting description: ${repo.description || 'none'}`;

      const orchestrator = createOrchestrator();
      const response = await orchestrator.generateText(prompt, {
        model: 'llama-3.1-sonar-small-128k-online',
        temperature: 0.3,
        maxTokens: 180,
        systemPrompt: 'You are a concise technical assistant. Output a single paragraph without headings.',
        timeout: 25000,
      });

      const aiDescription = (response.text || '').trim();
      if (!aiDescription) {
        return NextResponse.json({ error: 'Empty AI response' }, { status: 502 });
      }

      // Update repository with AI description
      await connection.execute(
        `UPDATE github_repositories 
         SET ai_description = ?, ai_description_provider = ?, ai_description_model = ?, ai_description_updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [aiDescription, response.provider, response.model, repositoryId, userId]
      );

      return NextResponse.json({
        success: true,
        description: aiDescription,
        provider: response.provider,
        model: response.model,
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error generating repository description:', error);
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}


