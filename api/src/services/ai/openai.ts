import OpenAI from 'openai';
import { config } from '../../config.js';

export const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export async function chatComplete(
  model: string,
  systemPrompt: string,
  userContent: string,
): Promise<string> {
  const res = await openai.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  });
  return res.choices[0]?.message?.content ?? '';
}

export async function chatCompleteJson<T>(
  model: string,
  systemPrompt: string,
  userContent: string,
): Promise<T> {
  const res = await openai.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  });
  const text = res.choices[0]?.message?.content ?? '{}';
  return JSON.parse(text) as T;
}
