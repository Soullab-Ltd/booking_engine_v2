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

const readSupportAttributionStorage = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return (
      window.sessionStorage.getItem(SUPPORT_ATTRIBUTION_STORAGE_KEY) ||
      window.localStorage.getItem(SUPPORT_ATTRIBUTION_STORAGE_KEY) ||
      ''
    );
  } catch {
    return '';
  }
};

const removeLegacyLocalSupportAttribution = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(SUPPORT_ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
};

export const getStoredSupportAttribution = (): SupportAttributionData => {
  if (typeof window === 'undefined') {
    return getEmptySupportAttribution();
  }

  try {
    const raw = readSupportAttributionStorage();
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
    try {
      window.sessionStorage.removeItem(SUPPORT_ATTRIBUTION_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
    removeLegacyLocalSupportAttribution();
    return;
  }

  try {
    window.sessionStorage.setItem(
      SUPPORT_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(normalized)
    );
  } catch {
    // Ignore storage write failures.
  }
  removeLegacyLocalSupportAttribution();
};

export const clearSupportAttribution = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(SUPPORT_ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
  removeLegacyLocalSupportAttribution();
};

export const resolveSupportAttributionFromUrl = async (): Promise<SupportAttributionData | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = new URL(window.location.href);
  const token = String(url.searchParams.get(SUPPORT_SESSION_QUERY_KEY) || '').trim();
  const existing = getStoredSupportAttribution();

  if (!token) {
    return existing.supportSessionToken ? existing : null;
  }

  if (existing.supportSessionToken) {
    if (existing.supportSessionToken === token) {
      return existing;
    }

    // Lock the first valid support session for this browser session so
    // mid-journey URL edits cannot steal or drop attribution.
    return existing;
  }

  try {
    const response = await fetch(
      `${BOOKING_API_BASE_URL}/support/sessions/${encodeURIComponent(token)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      clearSupportAttribution();
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
    return resolved;
  } catch {
    return null;
  }
};
