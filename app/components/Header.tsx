'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import UserMenu from './user-menu';

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Pierwszy rząd - główne linki */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold mr-4">
              Link Manager
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
              <Button variant="gradient" size="gradientSm" asChild>
                <Link href="/">
                  <span>Links</span>
                  <span className="ml-1">🔗</span>
                </Link>
              </Button>
              <Button variant="gradient" size="gradientSm" asChild>
                <Link href="/youtube">
                  <span>YouTube</span>
                  <span className="ml-1">📺</span>
                </Link>
              </Button>
              <Button variant="gradient" size="gradientSm" asChild>
                <Link href="/prompts">
                  <span>Prompts</span>
                  <span className="ml-1">📝</span>
                </Link>
              </Button>
              <Button variant="gradient" size="gradientSm" asChild>
                <a href="https://flux1ai.com/prompt-generator" target="_blank" rel="noopener noreferrer">
                  <span>Flux</span>
                  <span className="ml-1">🧠</span>
                </a>
              </Button>
              <Button variant="gradient" size="gradientSm" asChild>
                <a href="https://edu.gotoit.pl/index.php/pracuj-w-ai-data-science/" target="_blank" rel="noopener noreferrer">
                  <span>Kurs</span>
                  <span className="ml-1">📚</span>
                </a>
              </Button>
              <Button variant="gradient" size="gradientSm" asChild>
                <a href="https://flashcards.imprv.ai/" target="_blank" rel="noopener noreferrer">
                  <span>Powtórki</span>
                  <span className="ml-1">🔄</span>
                </a>
              </Button>
              <Button variant="gradient" size="gradientSm" asChild>
                <a href="https://datachatter.imprv.ai/" target="_blank" rel="noopener noreferrer">
                  <span>Data</span>
                  <span className="ml-1">📊</span>
                </a>
              </Button>
              <Button variant="gradient" size="gradientSm" asChild>
                <a href="https://datachatter.imprv.ai/" target="_blank" rel="noopener noreferrer">
                  <span>Code</span>
                  <span className="ml-1">💻</span>
                </a>
              </Button>
            </nav>
            <UserMenu />
          </div>
        </div>

        {/* Drugi rząd - narzędzia */}
        <div className="flex justify-end mb-4">
          <nav className="flex items-center space-x-2">
            <Button variant="gradient" size="gradientSm" asChild>
              <Link href="/api-keys">
                <span>API</span>
                <span className="ml-1">🔑</span>
              </Link>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <Link href="/github">
                <span>GitHub</span>
                <span className="ml-1">🐙</span>
              </Link>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://ngnix.aihub.ovh/nginx/proxy" target="_blank" rel="noopener noreferrer">
                <span>Nginx</span>
                <span className="ml-1">🌐</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="http://192.168.0.1/admin/" target="_blank" rel="noopener noreferrer">
                <span>Pi-hole</span>
                <span className="ml-1">🛡️</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://dash.aihub.ovh/" target="_blank" rel="noopener noreferrer">
                <span>Homarr</span>
                <span className="ml-1">🏠</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <Link href="/todo">
                <span>To-Do</span>
                <span className="ml-1">✅</span>
              </Link>
            </Button>
          </nav>
        </div>

        {/* Trzeci rząd - AI i narzędzia */}
        <div className="flex justify-end">
          <nav className="flex items-center space-x-2">
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://console.cloud.google.com/auth/clients?invt=AbuDMg&project=n8ndive&supportedpurview=project" target="_blank" rel="noopener noreferrer">
                <span>Google</span>
                <span className="ml-1">☁️</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://console.mistral.ai/build/agents/new" target="_blank" rel="noopener noreferrer">
                <span>Mistral</span>
                <span className="ml-1">🌪️</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">
                <span>Claude</span>
                <span className="ml-1">🤖</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://chat.deepseek.com/" target="_blank" rel="noopener noreferrer">
                <span>Deep</span>
                <span className="ml-1">🔍</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://app.ultravox.ai/" target="_blank" rel="noopener noreferrer">
                <span>Ultravox</span>
                <span className="ml-1">🎙️</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://aistudio.google.com/prompts/new_chat" target="_blank" rel="noopener noreferrer">
                <span>Gemini</span>
                <span className="ml-1">♊</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://rapidtags.io/generator" target="_blank" rel="noopener noreferrer">
                <span>Tags</span>
                <span className="ml-1">🏷️</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://dribbble.com/" target="_blank" rel="noopener noreferrer">
                <span>Dribbble</span>
                <span className="ml-1">🎨</span>
              </a>
            </Button>
            <Button variant="gradient" size="gradientSm" asChild>
              <a href="https://www.riffusion.com/" target="_blank" rel="noopener noreferrer">
                <span>Riff</span>
                <span className="ml-1">🎵</span>
              </a>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}