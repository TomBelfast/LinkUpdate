import { useState, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_SYSTEM_PROMPTS } from '@/lib/constants/storage';
import type { ChatSettings } from '@/lib/types/chat';

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

    const savedSettings = localStorage.getItem(STORAGE_KEYS.CHAT_SETTINGS);
    return savedSettings ? JSON.parse(savedSettings) : {
      selectedModel: localStorage.getItem(STORAGE_KEYS.MODEL) || '',
      systemPrompt: localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPTS[0],
      messages: JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]'),
      systemPrompts: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMPTS_LIST) || JSON.stringify(DEFAULT_SYSTEM_PROMPTS)),
      isArenaMode: false,
      arenaModels: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings };
} 