import { CustomerType } from '../types.ts';
import { generateWithOpenAI } from './openai-generator.ts';
import { generateWithPerplexity } from './perplexity-generator.ts';
import { openAIApiKey, perplexityApiKey } from '../config.ts';

export interface AIGenerationResult {
  review: string;
  provider: string;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

/**
 * Generates a review with automatic fallback between AI providers.
 * Primary provider is chosen based on available API keys (OpenAI preferred).
 * If primary fails, automatically retries with the secondary provider.
 * If both fail, throws a clear error.
 */
export async function generateWithFallback(
  systemPrompt: string,
  selectedStyle: string,
  customerType: CustomerType,
  wordCountHint?: string
): Promise<AIGenerationResult> {
  type ProviderEntry = {
    name: string;
    generate: () => Promise<string>;
  };

  // Build ordered provider list based on available keys
  const providers: ProviderEntry[] = [];

  if (openAIApiKey) {
    providers.push({
      name: 'OpenAI',
      generate: () => generateWithOpenAI(systemPrompt, selectedStyle, customerType, openAIApiKey!, wordCountHint),
    });
  }
  if (perplexityApiKey) {
    providers.push({
      name: 'Perplexity',
      generate: () => generateWithPerplexity(systemPrompt, selectedStyle, customerType, perplexityApiKey!, wordCountHint),
    });
  }

  if (providers.length === 0) {
    throw new Error('無可用的 AI API 金鑰：請設置 OPENAI_API_KEY 或 PERPLEXITY_API_KEY');
  }

  // Try each provider in order
  const errors: { provider: string; error: string }[] = [];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const isFallback = i > 0;

    try {
      if (isFallback) {
        console.log(`主要 AI (${providers[0].name}) 失敗，自動切換到備援 AI (${provider.name})...`);
      }

      const review = await provider.generate();

      return {
        review,
        provider: provider.name,
        fallbackUsed: isFallback,
        fallbackReason: isFallback
          ? `${providers[0].name} 失敗: ${errors[0]?.error || 'unknown'}`
          : undefined,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`${provider.name} 生成失敗:`, errorMsg);
      errors.push({ provider: provider.name, error: errorMsg });
    }
  }

  // All providers failed
  const summary = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
  throw new Error(`所有 AI provider 均失敗 — ${summary}`);
}
