// 主要的生成器入口文件，匯入所有生成器
import { generateFallbackReview } from './generators/fallback-generator.ts';
import { generateWithOpenAI } from './generators/openai-generator.ts';
import { generateWithPerplexity } from './generators/perplexity-generator.ts';

// 重新導出所有生成器，以便其他文件可以從這一個文件導入
export {
  generateFallbackReview,
  generateWithOpenAI,
  generateWithPerplexity
};