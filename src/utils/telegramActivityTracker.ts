/**
 * High-Value Payment & Drop-Off Alert Sentinel
 * Focuses exclusively on high-priority business events:
 * 1. Payment Abandoned (User reached payment / Razorpay modal, but cancelled or exited)
 * 2. Payment Succeeded (New confirmed booking)
 */

const TELEGRAM_BOT_TOKEN = "8602770209:AAFB1UoKo2ezApFaBM-RZ18vDMN4iPCpI7Y";
const TELEGRAM_CHAT_ID = "8646569158";

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

export const notifyHighPriorityEvent = (payload: HighPriorityAlertPayload) => {
  if (typeof window === "undefined") return;

  // Ignore if no phone was entered (not a viable lead yet)
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

  let title = "";
  let statusDetail = "";

  if (payload.type === "PAYMENT_ABANDONED") {
    title = "🚨 <b>PAYMENT ABANDONED (HIGH-INTENT LEAD)</b>";
    statusDetail = "⚠️ <b>Dropped off at Razorpay:</b> User opened payment gateway but cancelled/closed without paying.";
  } else if (payload.type === "STEP_BACK_FROM_PAYMENT") {
    title = "⚠️ <b>DROPPED OFF AT CHECKOUT REVIEW</b>";
    statusDetail = "⬅️ <b>Clicked Back / Hesitated:</b> User completed guest form, reached final price review, but returned back.";
  } else if (payload.type === "PAYMENT_FAILED") {
    title = "🔴 <b>PAYMENT FAILED AT GATEWAY</b>";
    statusDetail = `❌ <b>Gateway Error:</b> ${payload.reason || "Card/UPI transaction declined"}`;
  } else if (payload.type === "PAYMENT_SUCCESS") {
    title = "🎉 <b>NEW BOOKING CONFIRMED & PAID!</b>";
    statusDetail = `✅ <b>Booking #${payload.bookingId || "CONFIRMED"}</b> - Payment successfully received via Razorpay.`;
  }

  const message = 
`${title}

👤 <b>Customer:</b> ${payload.guestName || "Guest"}
📞 <b>Phone:</b> <code>${payload.guestPhone || "N/A"}</code>
📧 <b>Email:</b> ${payload.guestEmail || "N/A"}
🏨 <b>Selected Plan:</b> ${payload.planName || "Retreat Plan"} (₹${payload.amount || "N/A"})
📍 <b>Ad Source:</b> ${utmSource} (<i>${utmCampaign}</i>)
🏷️ <b>Agent:</b> <code>${agentCode}</code>

${statusDetail}
💡 <i>Target for immediate sales/support follow-up!</i>`;

  // Asynchronously dispatch to Telegram
  try {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML"
      }),
      keepalive: true
    }).catch((err) => console.warn("[Telegram Alert] Notice:", err));
  } catch (e) {
    console.warn("[Telegram Alert] Error:", e);
  }
};

// Compatibility export
export const trackTelegramActivity = (args: any) => {
  // Only trigger on high-value actions to keep Telegram clean
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
