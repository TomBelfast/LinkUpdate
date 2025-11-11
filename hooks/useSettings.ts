import { useState, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_SYSTEM_PROMPTS } from '@/lib/constants/storage';

interface ChatSettings {
  selectedModel: string;
  systemPrompt: string;
  messages: any[];
  systemPrompts: string[];
  isArenaMode: boolean;
  arenaModels: string[];
}

export function useSettings() {
  const [settings, setSettings] = useState<ChatSettings>(() => {
    if (typeof window === 'undefined') {
      return {
        selectedModel: '',
        systemPrompt: DEFAULT_SYSTEM_PROMPTS[0],
        messages: [],
        systemPrompts: DEFAULT_SYSTEM_PROMPTS,
        isArenaMode: false,
        arenaModels: []
      };
    }

    const savedModel = localStorage.getItem('selectedModel');
    const savedPrompt = localStorage.getItem('systemPrompt');
    const savedMessages = localStorage.getItem('messages');
    const savedPrompts = localStorage.getItem('systemPrompts');
    
    return {
      selectedModel: savedModel || '',
      systemPrompt: savedPrompt || DEFAULT_SYSTEM_PROMPTS[0] || '',
      messages: savedMessages ? JSON.parse(savedMessages) : [],
      systemPrompts: savedPrompts ? JSON.parse(savedPrompts) : DEFAULT_SYSTEM_PROMPTS,
      isArenaMode: false,
      arenaModels: []
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedModel', settings.selectedModel);
      localStorage.setItem('systemPrompt', settings.systemPrompt);
      localStorage.setItem('messages', JSON.stringify(settings.messages));
      localStorage.setItem('systemPrompts', JSON.stringify(settings.systemPrompts));
    }
  }, [settings]);

  return { settings, setSettings };
} 