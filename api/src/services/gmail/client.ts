import { google, gmail_v1 } from 'googleapis';
import { supabase } from '../../db/client.js';
import { config } from '../../config.js';

function makeOAuth2Client() {
  return new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
  );
}

async function getAuthedClient(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('id', userId)
    .single();

  if (!user?.google_refresh_token) {
    throw new Error(`No Google refresh token for user ${userId}`);
  }

  const auth = makeOAuth2Client();
  auth.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
    expiry_date: user.google_token_expiry ? new Date(user.google_token_expiry).getTime() : undefined,
  });

  // Persist refreshed token if it changes
  auth.on('tokens', async (tokens) => {
    await supabase
      .from('users')
      .update({
        google_access_token: tokens.access_token,
        google_token_expiry: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : undefined,
      })
      .eq('id', userId);
  });

  return auth;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  body: string;
  attachments: Array<{ filename: string; mimeType: string; data: Buffer }>;
  receivedAt: string;
}

function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64(payload.body.data);
  }
  for (const part of payload.parts ?? []) {
    const text = extractBody(part);
    if (text) return text;
  }
  return '';
}

export async function listUnreadMessages(userId: string, maxResults = 50): Promise<string[]> {
  const auth = await getAuthedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults,
  });
  return (res.data.messages ?? []).map((m) => m.id!).filter(Boolean);
}

export async function getMessage(userId: string, messageId: string): Promise<EmailMessage> {
  const auth = await getAuthedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
  const msg = res.data;
  const headers = msg.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';

  const attachments: EmailMessage['attachments'] = [];
  for (const part of msg.payload?.parts ?? []) {
    if (part.filename && part.body?.attachmentId) {
      const attRes = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: part.body.attachmentId,
      });
      if (attRes.data.data) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType ?? 'application/octet-stream',
          data: Buffer.from(attRes.data.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64'),
        });
      }
    }
  }

  return {
    id: msg.id!,
    threadId: msg.threadId!,
    from: getHeader('From'),
    subject: getHeader('Subject'),
    body: extractBody(msg.payload),
    attachments,
    receivedAt: new Date(parseInt(msg.internalDate ?? '0')).toISOString(),
  };
}

export async function addLabel(userId: string, messageId: string, labelId: string): Promise<void> {
  const auth = await getAuthedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { addLabelIds: [labelId] },
  });
}

export async function removeLabel(userId: string, messageId: string, labelId: string): Promise<void> {
  const auth = await getAuthedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { removeLabelIds: [labelId] },
  });
}

export async function markRead(userId: string, messageId: string): Promise<void> {
  const auth = await getAuthedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { removeLabelIds: ['UNREAD'] },
  });
}
