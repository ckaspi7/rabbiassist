import axios from 'axios';
import { config } from '../../config.js';

const BASE = `https://graph.facebook.com/v21.0/${config.WHATSAPP_PHONE_NUMBER_ID}`;
const HEADERS = { Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}` };

export async function getMediaUrl(mediaId: string): Promise<string> {
  const res = await axios.get<{ url: string }>(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: HEADERS,
  });
  return res.data.url;
}

export async function downloadMedia(mediaUrl: string): Promise<Buffer> {
  const res = await axios.get<Buffer>(mediaUrl, {
    headers: HEADERS,
    responseType: 'arraybuffer',
  });
  return Buffer.from(res.data);
}

export async function sendTextMessage(recipientPhone: string, text: string): Promise<void> {
  await axios.post(
    `${BASE}/messages`,
    {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'text',
      text: { body: text },
    },
    { headers: HEADERS },
  );
}
