const SUPPORT_ATTRIBUTION_STORAGE_KEY = 'booking_engine:support_attribution';
const SUPPORT_SESSION_QUERY_KEY = 'support_session';
const BOOKING_API_BASE_URL = 'https://bookingapi.thriive.in/bookings';

export interface SupportAttributionData {
  supportSessionToken: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  eventId: number | null;
  capturedAt: string;
}

const getEmptySupportAttribution = (): SupportAttributionData => ({
  supportSessionToken: '',
  agentId: '',
  agentName: '',
  agentEmail: '',
  eventId: null,
  capturedAt: '',
});

const sanitizeSupportAttribution = (value: Partial<SupportAttributionData> | null | undefined) => ({
  supportSessionToken: String(value?.supportSessionToken || '').trim(),
  agentId: String(value?.agentId || '').trim(),
  agentName: String(value?.agentName || '').trim(),
  agentEmail: String(value?.agentEmail || '').trim(),
  eventId: (() => {
    const rawEventId = value?.eventId;
    if (rawEventId === null || rawEventId === undefined) {
      return null;
    }

    const parsedEventId = Number(rawEventId);
    return Number.isFinite(parsedEventId) ? parsedEventId : null;
  })(),
  capturedAt: String(value?.capturedAt || '').trim(),
});

export const getStoredSupportAttribution = (): SupportAttributionData => {
  if (typeof window === 'undefined') {
    return getEmptySupportAttribution();
  }

  try {
    const raw = window.localStorage.getItem(SUPPORT_ATTRIBUTION_STORAGE_KEY);
    if (!raw) {
      return getEmptySupportAttribution();
    }

    return sanitizeSupportAttribution(JSON.parse(raw));
  } catch {
    return getEmptySupportAttribution();
  }
};

export const persistSupportAttribution = (value: Partial<SupportAttributionData>) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized = sanitizeSupportAttribution(value);

  if (!normalized.supportSessionToken) {
    window.localStorage.removeItem(SUPPORT_ATTRIBUTION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SUPPORT_ATTRIBUTION_STORAGE_KEY, JSON.stringify(normalized));
};

export const clearSupportAttribution = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SUPPORT_ATTRIBUTION_STORAGE_KEY);
};

const removeSupportSessionFromUrl = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has(SUPPORT_SESSION_QUERY_KEY)) {
    return;
  }

  url.searchParams.delete(SUPPORT_SESSION_QUERY_KEY);
  window.history.replaceState({}, document.title, url.toString());
};

export const resolveSupportAttributionFromUrl = async (): Promise<SupportAttributionData | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = new URL(window.location.href);
  const token = String(url.searchParams.get(SUPPORT_SESSION_QUERY_KEY) || '').trim();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${BOOKING_API_BASE_URL}/support/sessions/${encodeURIComponent(token)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      clearSupportAttribution();
      removeSupportSessionFromUrl();
      return null;
    }

    const payload = await response.json();
    const resolved = sanitizeSupportAttribution({
      supportSessionToken: token,
      agentId: payload?.agentId || '',
      agentName: payload?.agentName || '',
      agentEmail: payload?.agentEmail || '',
      eventId: payload?.eventId ?? null,
      capturedAt: new Date().toISOString(),
    });

    persistSupportAttribution(resolved);
    removeSupportSessionFromUrl();
    return resolved;
  } catch {
    return null;
  }
};
