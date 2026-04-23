import { chatCompleteJson } from './openai.js';

export interface ExtractedTask {
  task: string;
  due_date: string | null;
  user_id: string;
  note_title: string;
  note_content: string;
  created_at: string;
  modified_at: string;
  source: string;
}

interface TaskExtractionResult {
  tasks: ExtractedTask[];
}

const SYSTEM_PROMPT = `You are a smart AI assistant that extracts actionable tasks from user notes.

Your job is to:
1. Read a user note and identify all actionable tasks or to-dos.
2. For each task, output a structured JSON object with:
   - "task": a concise description of the task
   - "due_date": if a deadline or timeline is mentioned (e.g., "by Friday", "next week"), parse it as an ISO 8601 date; otherwise leave as null
   - "user_id", "note_title", "note_content", "created_at", "modified_at", and "source": use the same values from the input note (do not change or infer)
3. Always return a 'tasks' array that includes each task object even if there is only one. Return an empty 'tasks' array if there are none.

Return JSON: {"tasks": [...]}`;

export async function extractTasks(
  userId: string,
  noteTitle: string,
  noteContent: string,
  createdAt: string,
  modifiedAt: string,
  source: string,
): Promise<ExtractedTask[]> {
  const userContent = JSON.stringify({
    user_id: userId,
    note_title: noteTitle,
    note_content: noteContent,
    created_at: createdAt,
    modified_at: modifiedAt,
    source,
  });

  const result = await chatCompleteJson<TaskExtractionResult>('gpt-4o-mini', SYSTEM_PROMPT, userContent);
  return result.tasks ?? [];
}
