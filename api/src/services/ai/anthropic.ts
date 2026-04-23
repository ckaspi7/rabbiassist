import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config.js';

export const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

export async function claudeComplete(
  model: string,
  systemPrompt: string,
  userContent: string,
  maxTokens = 1024,
): Promise<string> {
  const res = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });
  const block = res.content[0];
  return block.type === 'text' ? block.text : '';
}
