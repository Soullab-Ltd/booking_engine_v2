/**
 * Telegram Live User Activity Tracker for Soullab Booking Engine
 * Broadcasts real-time visitor journeys (UTM source, plan choices, back-and-forth navigation, and lead captures)
 * directly to the Telegram bot (@SoullabAlertsBot)
 */

const TELEGRAM_BOT_TOKEN = "8602770209:AAFB1UoKo2ezApFaBM-RZ18vDMN4iPCpI7Y";
const TELEGRAM_CHAT_ID = "8646569158";

const SESSION_TIMELINE_KEY = "soullab_booking_timeline";
const LAST_DISPATCH_TIME_KEY = "soullab_last_telegram_dispatch";

export interface ActivityEvent {
  time: string;
  action: string;
}

export interface UserJourneyPayload {
  eventName?: string;
  planName?: string;
  planPrice?: string | number;
  guestName?: string;
  guestPhone?: string;
  actionSummary: string;
  status: string;
}

const getStoredTimeline = (): ActivityEvent[] => {
  try {
    const raw = sessionStorage.getItem(SESSION_TIMELINE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const recordTimelineEvent = (action: string): ActivityEvent[] => {
  const current = getStoredTimeline();
  const newEvent: ActivityEvent = {
    time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
    action
  };
  const updated = [...current, newEvent].slice(-8); // Keep last 8 actions
  try {
    sessionStorage.setItem(SESSION_TIMELINE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const trackTelegramActivity = (payload: UserJourneyPayload) => {
  if (typeof window === "undefined") return;

  const timeline = recordTimelineEvent(payload.actionSummary);

  // Extract attribution from stored meta/booking attribution or URL params
  let utmSource = "Direct / Organic";
  let utmCampaign = "None";
  let agentCode = "None";

  try {
    const params = new URLSearchParams(window.location.search);
    utmSource = params.get("utm_source") || "Direct / Organic";
    utmCampaign = params.get("utm_campaign") || "None";
    agentCode = params.get("agent") || params.get("agent_code") || params.get("ref") || "None";
  } catch {}

  const timelineText = timeline
    .map((item, idx) => `${idx + 1}. <code>[${item.time}]</code> ${item.action}`)
    .join("\n");

  const message = 
`👀 <b>LIVE USER ACTIVITY ON BOOKING ENGINE</b>
🎪 <b>Event:</b> ${payload.eventName || "A Quantum Leap (14–18 Oct @ Pyramid Valley)"}
📍 <b>Traffic Source:</b> ${utmSource} (<i>${utmCampaign}</i>)
🏷️ <b>Agent/Ref:</b> <code>${agentCode}</code>

👤 <b>Lead Info Captured:</b>
• <b>Name:</b> ${payload.guestName || "Visitor (Filling Form...)"}
• <b>Phone:</b> <code>${payload.guestPhone || "Not entered yet"}</code>

🔄 <b>Back &amp; Forth Journey:</b>
${timelineText}

⚡ <b>Current Activity Status:</b> <i>${payload.status}</i>`;

  // Asynchronously dispatch to Telegram API
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
    }).catch((err) => console.warn("[Telegram Tracker] Non-blocking dispatch notice:", err));
  } catch (e) {
    console.warn("[Telegram Tracker] Dispatch error:", e);
  }
};
