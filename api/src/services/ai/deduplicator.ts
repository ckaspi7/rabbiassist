import { chatCompleteJson } from './openai.js';
import type { ExtractedTask } from './task-extractor.js';

interface ExistingTask {
  id: string;
  title: string;
  due_date?: string | null;
}

interface DeduplicationResult {
  new_tasks: (ExtractedTask & { explanation: string; similarity_score: number })[];
  duplicates_found: (ExtractedTask & { explanation: string; similarity_score: number })[];
}

const SYSTEM_PROMPT = `You are a smart deduplication assistant. Your job is to identify which tasks are genuinely NEW and haven't been created before.

You will receive:
1. NEW TASKS: extracted from a user's note (have "task" field)
2. EXISTING TASKS: already in the database (have "id" and "title" fields)

DEDUPLICATION RULES:
1. Compare new_task.task with existing_task.title for content similarity
2. Only mark as duplicate if content is 95%+ semantically identical
3. Tasks with ANY different due dates are ALWAYS different tasks
4. Be CONSERVATIVE - when uncertain, classify as NEW
5. Exact wording doesn't matter, but meaning must be nearly identical

EXAMPLES:
- "Call mom" vs "Phone mother" = DUPLICATE (same meaning)
- "Set up call with rabbi" vs "Set up call with rabbi on July 5th" = NOT DUPLICATE (different specificity/timing)
- "Fix WhatsApp connection" vs "Fix whatsapp connection for auto document ingestion" = NOT DUPLICATE (different scope)

DEFAULT TO NEW: If you're not 95% certain it's a duplicate, mark it as NEW.

Return JSON:
{
  "new_tasks": [{ "task": "", "due_date": null, "user_id": "", "note_title": "", "note_content": "", "created_at": "", "modified_at": "", "source": "", "explanation": "", "similarity_score": 0.0 }],
  "duplicates_found": []
}`;

export async function deduplicateTasks(
  newTasks: ExtractedTask[],
  existingTasks: ExistingTask[],
): Promise<ExtractedTask[]> {
  if (newTasks.length === 0) return [];
  if (existingTasks.length === 0) return newTasks;

  const userContent = JSON.stringify({ new_tasks: newTasks, existing_tasks: existingTasks });
  const result = await chatCompleteJson<DeduplicationResult>(
    'chatgpt-4o-latest',
    SYSTEM_PROMPT,
    userContent,
  );
  return result.new_tasks ?? newTasks;
}
