import type { AiProvider, ProviderAdapter, ProviderCapabilities } from '../types';
import { deepseekProvider } from './providers/deepseekProvider';
import { geminiProvider } from './providers/geminiProvider';
import { openaiProvider } from './providers/openaiProvider';

/** Năng lực từng provider — thêm provider mới: thêm 1 dòng ở đây + 1 adapter */
export const CAPABILITIES: Record<AiProvider, ProviderCapabilities> = {
  gemini: { vision: true, imageEdit: true, text: true },
  openai: { vision: true, imageEdit: true, text: true },
  deepseek: { vision: false, imageEdit: false, text: true },
};

const ADAPTERS: Record<AiProvider, ProviderAdapter> = {
  gemini: geminiProvider,
  openai: openaiProvider,
  deepseek: deepseekProvider,
};

export function getAdapter(provider: AiProvider): ProviderAdapter {
  return ADAPTERS[provider];
}

export function getCapabilities(provider: AiProvider): ProviderCapabilities {
  return CAPABILITIES[provider];
}
