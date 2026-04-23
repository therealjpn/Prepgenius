import { sendTemplate, sendText } from "@/lib/whatsapp/api";
import { whatsappTemplates } from "@/lib/whatsapp/templates";

export async function sendDailyReminder(phone: string, name: string, focus: string, streak: number) {
  return sendTemplate(phone, whatsappTemplates.dailyChallenge, [name, focus, String(streak)]);
}

export async function sendPaymentConfirmation(phone: string, planName: string, expiryDate: string) {
  return sendTemplate(phone, whatsappTemplates.paymentConfirmed, [planName, expiryDate]);
}

export async function sendPlainNotification(phone: string, message: string) {
  return sendText(phone, message);
}
