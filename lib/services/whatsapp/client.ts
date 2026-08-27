/**
 * Thin adapter over the WhatsApp Business Cloud API (system.md #21).
 * Kept isolated from business logic on purpose: nothing outside this file
 * knows about Graph API request shapes, so swapping providers later only
 * touches this module.
 */
export type WhatsAppSendResult =
  | { ok: true; providerMessageId: string }
  | { ok: false; error: string };

export async function sendWhatsAppText(toPhone: string, body: string): Promise<WhatsAppSendResult> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!apiUrl || !token || !phoneNumberId) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[WhatsApp:DEV] -> ${toPhone}: ${body}`);
      return { ok: true, providerMessageId: `dev-${Date.now()}` };
    }
    return { ok: false, error: "WHATSAPP_NOT_CONFIGURED" };
  }

  try {
    const res = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhone,
        type: "text",
        text: { body },
      }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error?.message ?? "UNKNOWN_ERROR" };

    return { ok: true, providerMessageId: data.messages?.[0]?.id ?? "unknown" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "NETWORK_ERROR" };
  }
}
