/**
 * DUAL DELIVERY NOTIFICATION DISPATCHER (TELEGRAM + WHATSAPP)
 * Target: Soullab Booking Engine
 * Broadcasts critical business events simultaneously to:
 * 1. Telegram Bot (@SoullabAlertsBot)
 * 2. WhatsApp Gateway (+91 8850630321 / Customer Support)
 */

const TELEGRAM_BOT_TOKEN = "8602770209:AAFB1UoKo2ezApFaBM-RZ18vDMN4iPCpI7Y";
const TELEGRAM_CHAT_ID = "8646569158";

// Configurable WhatsApp Gateway (UltraMsg / Green-API / Custom Webhook)
const WHATSAPP_RECIPIENT = "918850630321";
const ULTRAMSG_INSTANCE_ID = ""; // Fill when UltraMsg instance is created
const ULTRAMSG_TOKEN = "";       // Fill when UltraMsg token is created

export interface HighPriorityAlertPayload {
  type: "PAYMENT_ABANDONED" | "STEP_BACK_FROM_PAYMENT" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED";
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  planName?: string;
  amount?: string | number;
  bookingId?: string | number;
  reason?: string;
}

const cleanPhone = (phoneRaw?: string): string => {
  if (!phoneRaw) return "";
  const digits = phoneRaw.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  return digits;
};

export const notifyHighPriorityEvent = (payload: HighPriorityAlertPayload) => {
  if (typeof window === "undefined") return;

  // Ignore if no phone was entered (unless it is a confirmed booking)
  if (!payload.guestPhone && payload.type !== "PAYMENT_SUCCESS") {
    return;
  }

  let utmSource = "Direct / Organic";
  let utmCampaign = "None";
  let agentCode = "None";

  try {
    const params = new URLSearchParams(window.location.search);
    utmSource = params.get("utm_source") || "Direct / Organic";
    utmCampaign = params.get("utm_campaign") || "None";
    agentCode = params.get("agent") || params.get("agent_code") || params.get("ref") || "None";
  } catch {}

  const rawPhone = payload.guestPhone || "";
  const cleanedCustomerPhone = cleanPhone(rawPhone);

  // 1-Click WhatsApp Direct Chat Link for Support Agent to message customer instantly
  const prefilledCustomerMessage = encodeURIComponent(
    `Hi ${payload.guestName || "there"}, I noticed you were registering for A Quantum Leap retreat at Pyramid Valley. Did you have any questions or need help with your ${payload.planName || "booking"}?`
  );
  const oneClickChatUrl = cleanedCustomerPhone ? `https://wa.me/${cleanedCustomerPhone}?text=${prefilledCustomerMessage}` : "";

  let title = "";
  let statusDetail = "";

  if (payload.type === "PAYMENT_ABANDONED") {
    title = "🚨 <b>PAYMENT ABANDONED (HIGH-INTENT LEAD)</b>";
    statusDetail = "⚠️ <b>Dropped off at Razorpay:</b> User opened payment modal but cancelled/closed without paying.";
  } else if (payload.type === "STEP_BACK_FROM_PAYMENT") {
    title = "⚠️ <b>DROPPED OFF AT CHECKOUT REVIEW</b>";
    statusDetail = "⬅️ <b>Clicked Back / Hesitated:</b> User completed guest form, reached final price review, but returned back.";
  } else if (payload.type === "PAYMENT_FAILED") {
    title = "🔴 <b>PAYMENT FAILED AT GATEWAY</b>";
    statusDetail = `❌ <b>Gateway Error:</b> ${payload.reason || "Transaction declined"}`;
  } else if (payload.type === "PAYMENT_SUCCESS") {
    title = "🎉 <b>NEW BOOKING CONFIRMED & PAID!</b>";
    statusDetail = `✅ <b>Booking #${payload.bookingId || "CONFIRMED"}</b> - Payment received via Razorpay.`;
  }

  // Telegram HTML Message
  const telegramMessage = 
`${title}

👤 <b>Customer:</b> ${payload.guestName || "Guest"}
📞 <b>Phone:</b> <code>${payload.guestPhone || "N/A"}</code>
📧 <b>Email:</b> ${payload.guestEmail || "N/A"}
🏨 <b>Plan:</b> ${payload.planName || "Retreat Plan"} (₹${payload.amount || "N/A"})
📍 <b>Source:</b> ${utmSource} (<i>${utmCampaign}</i>)
🏷️ <b>Agent:</b> <code>${agentCode}</code>

${statusDetail}
${oneClickChatUrl ? `\n👉 <a href="${oneClickChatUrl}"><b>Click Here to WhatsApp Customer Directly</b></a>` : ""}
💡 <i>Target for immediate support follow-up!</i>`;

  // Plain Text Message for WhatsApp
  const whatsappMessage = 
`${title.replace(/<[^>]+>/g, "")}

👤 Customer: ${payload.guestName || "Guest"}
📞 Phone: ${payload.guestPhone || "N/A"}
📧 Email: ${payload.guestEmail || "N/A"}
🏨 Plan: ${payload.planName || "Retreat Plan"} (₹${payload.amount || "N/A"})
📍 Source: ${utmSource} (${utmCampaign})
🏷️ Agent: ${agentCode}

${statusDetail.replace(/<[^>]+>/g, "")}
${oneClickChatUrl ? `
👉 1-Click WhatsApp Customer: ${oneClickChatUrl}` : ""}`;

  // ==========================================
  // 1. DISPATCH TO TELEGRAM
  // ==========================================
  try {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: "HTML",
        disable_web_page_preview: false
      }),
      keepalive: true
    }).catch((err) => console.warn("[Telegram Dual Delivery] Notice:", err));
  } catch (e) {
    console.warn("[Telegram Dual Delivery] Error:", e);
  }

  // ==========================================
  // 2. DISPATCH TO WHATSAPP (Via UltraMsg / Gateway if configured)
  // ==========================================
  if (ULTRAMSG_INSTANCE_ID && ULTRAMSG_TOKEN) {
    try {
      fetch(`https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: ULTRAMSG_TOKEN,
          to: `+${WHATSAPP_RECIPIENT}`,
          body: whatsappMessage
        }),
        keepalive: true
      }).catch((err) => console.warn("[WhatsApp Dual Delivery] Notice:", err));
    } catch (e) {
      console.warn("[WhatsApp Dual Delivery] Error:", e);
    }
  }
};

export const trackTelegramActivity = (args: any) => {
  if (args.status && args.status.toLowerCase().includes("hesitat") && args.guestPhone) {
    notifyHighPriorityEvent({
      type: "STEP_BACK_FROM_PAYMENT",
      guestName: args.guestName,
      guestPhone: args.guestPhone,
      planName: args.planName,
      reason: args.actionSummary
    });
  }
};
