import { FastifyPluginAsync } from 'fastify';
import { getMediaUrl, downloadMedia, sendTextMessage } from '../../services/whatsapp/client.js';
import { processWhatsappDocument } from '../../services/storage/whatsapp-docs.js';
import { config } from '../../config.js';

interface WhatsappWebhookBody {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          id: string;
          type: string;
          from: string;
          document?: { id: string; filename: string; mime_type: string };
        }>;
      };
    }>;
  }>;
}

const whatsappRoutes: FastifyPluginAsync = async (fastify) => {
  // Webhook verification (GET)
  fastify.get('/webhooks/whatsapp', async (request, reply) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } =
      request.query as Record<string, string>;
    if (mode === 'subscribe' && token === config.WHATSAPP_VERIFY_TOKEN) {
      return reply.send(challenge);
    }
    return reply.status(403).send({ error: 'Forbidden' });
  });

  // Incoming message handler (POST)
  fastify.post<{ Body: WhatsappWebhookBody }>('/webhooks/whatsapp', async (request, reply) => {
    const messages =
      request.body?.entry?.[0]?.changes?.[0]?.value?.messages ?? [];

    for (const msg of messages) {
      if (msg.type !== 'document' || !msg.document) continue;

      try {
        const mediaUrl = await getMediaUrl(msg.document.id);
        const data = await downloadMedia(mediaUrl);

        await processWhatsappDocument({
          data,
          mimeType: msg.document.mime_type,
          filename: msg.document.filename,
          messageId: msg.id,
          phoneNumber: msg.from,
        });

        await sendTextMessage(msg.from, `✅ Document received: ${msg.document.filename}`);
      } catch (err) {
        fastify.log.error(err, `Failed to process WhatsApp document from ${msg.from}`);
      }
    }

    return reply.status(200).send({ status: 'ok' });
  });
};

export default whatsappRoutes;
