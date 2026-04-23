import axios from 'axios';
import { config } from '../../config.js';

export interface PushoverMessage {
  message: string;
  title?: string;
  priority?: number;
  html?: 1 | 0;
  device?: string;
}

export async function sendPushover(msg: PushoverMessage): Promise<void> {
  await axios.post('https://api.pushover.net/1/messages.json', {
    token: config.PUSHOVER_APP_TOKEN,
    user: config.PUSHOVER_USER_KEY,
    device: msg.device ?? config.PUSHOVER_DEVICE,
    message: msg.message,
    title: msg.title,
    priority: msg.priority ?? 0,
    html: msg.html ?? 1,
  });
}
