import { env } from "@/lib/config/env";

const baseUrl = env.WHATSAPP_PHONE_NUMBER_ID
  ? `https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`
  : null;

async function sendWhatsApp(payload: Record<string, unknown>) {
  if (!baseUrl || !env.WHATSAPP_ACCESS_TOKEN) {
    return { ok: true, demo: true, payload };
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("WhatsApp API request failed");
  }

  return response.json();
}

export function sendText(to: string, body: string) {
  return sendWhatsApp({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body }
  });
}

export function sendButtons(
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>
) {
  return sendWhatsApp({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.map((button) => ({
          type: "reply",
          reply: button
        }))
      }
    }
  });
}

export function sendList(
  to: string,
  body: string,
  buttonText: string,
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>
) {
  return sendWhatsApp({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body },
      action: {
        button: buttonText,
        sections
      }
    }
  });
}

export function sendReaction(to: string, messageId: string, emoji: string) {
  return sendWhatsApp({
    messaging_product: "whatsapp",
    to,
    type: "reaction",
    reaction: {
      message_id: messageId,
      emoji
    }
  });
}

export function sendTemplate(to: string, templateName: string, parameters: string[]) {
  return sendWhatsApp({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "en"
      },
      components: [
        {
          type: "body",
          parameters: parameters.map((text) => ({
            type: "text",
            text
          }))
        }
      ]
    }
  });
}

