const META_PIXEL_SCRIPT_ID = 'meta-pixel-script';
const META_ATTRIBUTION_STORAGE_KEY = 'meta_attribution';
const BOOKING_ATTRIBUTION_STORAGE_KEY = 'booking_attribution';
const META_PURCHASE_EVENT_STORAGE_KEY = 'meta_last_purchase_event_id';
const META_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

type MetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'Purchase';

type MetaEventParams = Record<string, string | number | boolean | string[] | undefined>;

export interface MetaAttributionData {
  fbclid: string;
  fbc: string;
  fbp: string;
  externalId: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  agentCode: string;
  agentName: string;
  landingUrl: string;
  referrer: string;
  capturedAt: string;
}

declare global {
  interface Window {
    _fbq?: any;
    fbq?: (...args: any[]) => void;
    __META_PIXEL_ID__?: string;
    getBookingAttribution?: () => Partial<MetaAttributionData> & {
      pixelEventId?: string;
      source?: string;
    };
  }
}

const getMetaPixelId = (): string => {
  const env = (import.meta as any)?.env || {};
  return String(
    env.VITE_META_PIXEL_ID ||
      window.__META_PIXEL_ID__ ||
      ''
  ).trim();
};

const getCookieDomain = () => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return '';
  }

  if (hostname.endsWith('.shreansdaga.org') || hostname === 'shreansdaga.org') {
    return '.shreansdaga.org';
  }

  return '';
};

const setCookie = (name: string, value: string, maxAgeSeconds = META_COOKIE_MAX_AGE_SECONDS) => {
  if (!value) return;

  const domain = getCookieDomain();
  const encoded = encodeURIComponent(value);
  const domainPart = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${domainPart}`;
};

const getCookie = (name: string): string => {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&')}=([^;]*)`)
  );

  return match ? decodeURIComponent(match[1]) : '';
};

const sanitizeAttributionData = (
  data: Partial<MetaAttributionData>
): MetaAttributionData => ({
  fbclid: String(data.fbclid || '').trim(),
  fbc: String(data.fbc || '').trim(),
  fbp: String(data.fbp || '').trim(),
  externalId: String(data.externalId || '').trim(),
  utmSource: String(data.utmSource || '').trim(),
  utmMedium: String(data.utmMedium || '').trim(),
  utmCampaign: String(data.utmCampaign || '').trim(),
  utmContent: String(data.utmContent || '').trim(),
  utmTerm: String(data.utmTerm || '').trim(),
  agentCode: String((data as any).agentCode || '').trim(),
  agentName: String((data as any).agentName || '').trim(),
  landingUrl: String(data.landingUrl || '').trim(),
  referrer: String(data.referrer || '').trim(),
  capturedAt: String(data.capturedAt || '').trim(),
});

const persistMetaAttribution = (data: Partial<MetaAttributionData>) => {
  const normalized = sanitizeAttributionData(data);
  window.localStorage.setItem(BOOKING_ATTRIBUTION_STORAGE_KEY, JSON.stringify(normalized));
  window.localStorage.setItem(META_ATTRIBUTION_STORAGE_KEY, JSON.stringify(normalized));

  if (normalized.fbclid) setCookie('meta_fbclid', normalized.fbclid);
  if (normalized.fbc) setCookie('_fbc', normalized.fbc);
  if (normalized.fbp) setCookie('_fbp', normalized.fbp);
  if (normalized.externalId) setCookie('meta_external_id', normalized.externalId);
};

const buildFbcFromFbclid = (fbclid: string): string => {
  if (!fbclid) return '';
  return `fb.1.${Date.now()}.${fbclid}`;
};

const createFbpFallback = () => {
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `fb.1.${Date.now()}.${randomPart}`;
};

export const getStoredMetaAttribution = (): MetaAttributionData => {
  let fromStorage: Partial<MetaAttributionData> = {};
  const bootstrapAttribution =
    typeof window.getBookingAttribution === 'function'
      ? window.getBookingAttribution()
      : {};

  try {
    fromStorage = JSON.parse(
      window.localStorage.getItem(BOOKING_ATTRIBUTION_STORAGE_KEY) ||
      window.localStorage.getItem(META_ATTRIBUTION_STORAGE_KEY) ||
      '{}'
    );
  } catch {
    fromStorage = {};
  }

  return sanitizeAttributionData({
    ...bootstrapAttribution,
    ...fromStorage,
    fbclid: getCookie('meta_fbclid') || fromStorage.fbclid || bootstrapAttribution.fbclid,
    fbc: getCookie('_fbc') || fromStorage.fbc || bootstrapAttribution.fbc,
    fbp: getCookie('_fbp') || fromStorage.fbp || bootstrapAttribution.fbp,
    externalId:
      getCookie('meta_external_id') ||
      fromStorage.externalId ||
      bootstrapAttribution.externalId,
  });
};

export const captureMetaAttribution = () => {
  const bootstrapAttribution =
    typeof window.getBookingAttribution === 'function'
      ? window.getBookingAttribution()
      : {};
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const existing = getStoredMetaAttribution();
  const currentReferrer = String(document.referrer || '').trim();
  const currentUtmSource = String(params.get('utm_source') || '').trim();
  const currentUtmMedium = String(params.get('utm_medium') || '').trim();
  const currentUtmCampaign = String(params.get('utm_campaign') || '').trim();
  const currentUtmContent = String(params.get('utm_content') || '').trim();
  const currentUtmTerm = String(params.get('utm_term') || '').trim();
  const currentAgentCode = String(
    params.get('agent_code') ||
      params.get('agent') ||
      params.get('support_agent') ||
      params.get('ref') ||
      existing.agentCode ||
      bootstrapAttribution.agentCode ||
      ''
  ).trim();
  const currentAgentName = String(
    params.get('agent_name') ||
      params.get('support_name') ||
      existing.agentName ||
      bootstrapAttribution.agentName ||
      ''
  ).trim();
  const fbclid = params.get('fbclid') || existing.fbclid || bootstrapAttribution.fbclid || '';
  const fbc =
    params.get('fbc') ||
    getCookie('_fbc') ||
    existing.fbc ||
    bootstrapAttribution.fbc ||
    (fbclid ? buildFbcFromFbclid(fbclid) : '');
  const fbp =
    params.get('fbp') ||
    getCookie('_fbp') ||
    existing.fbp ||
    bootstrapAttribution.fbp ||
    createFbpFallback();
  const externalId =
    params.get('external_id') || existing.externalId || bootstrapAttribution.externalId || '';

  persistMetaAttribution({
    ...existing,
    ...bootstrapAttribution,
    fbclid,
    fbc,
    fbp,
    externalId,
    utmSource: currentUtmSource,
    utmMedium: currentUtmMedium,
    utmCampaign: currentUtmCampaign,
    utmContent: currentUtmContent,
    utmTerm: currentUtmTerm,
    agentCode: currentAgentCode,
    agentName: currentAgentName,
    landingUrl: window.location.href,
    referrer: currentReferrer,
    capturedAt: new Date().toISOString(),
  });
};

export const initMetaPixel = () => {
  const pixelId = getMetaPixelId();

  if (!pixelId || typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('[Meta Pixel] Initialization skipped', {
      hasPixelId: Boolean(pixelId),
      hasWindow: typeof window !== 'undefined',
      hasDocument: typeof document !== 'undefined',
    });
    return false;
  }

  if (window.fbq) {
    console.log('[Meta Pixel] Reusing existing pixel instance', {
      pixelId,
      url: window.location.href,
    });
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    console.log('[Meta Pixel] PageView fired during re-init', {
      pixelId,
      url: window.location.href,
    });
    return true;
  }

  ((f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: Node) => {
    if (f.fbq) return;
    n = f.fbq = function () {
      if (n.callMethod) {
        n.callMethod.apply(n, arguments);
      } else {
        n.queue.push(arguments);
      }
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    t.id = META_PIXEL_SCRIPT_ID;
    s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  const fbq = window.fbq;
  fbq?.('init', pixelId);
  fbq?.('track', 'PageView');
  console.log('[Meta Pixel] Initialized and fired PageView', {
    pixelId,
    url: window.location.href,
  });
  return true;
};

export const createMetaEventId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const trackMetaEvent = (
  eventName: MetaEventName,
  params: MetaEventParams = {},
  eventId?: string
) => {
  const pixelId = getMetaPixelId();
  if (!pixelId || typeof window.fbq !== 'function') {
    console.warn('[Meta Pixel] Event skipped', {
      eventName,
      eventId: eventId || null,
      hasPixelId: Boolean(pixelId),
      hasFbq: typeof window.fbq === 'function',
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
    return;
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );

  if (eventName === 'PageView') {
    window.fbq('track', eventName);
    console.log('[Meta Pixel] Event fired', {
      eventName,
      pixelId,
      url: window.location.href,
    });
    return;
  }

  if (eventId) {
    window.fbq('track', eventName, cleanedParams, { eventID: eventId });
    console.log('[Meta Pixel] Event fired', {
      eventName,
      pixelId,
      eventId,
      params: cleanedParams,
      url: window.location.href,
    });
    return;
  }

  window.fbq('track', eventName, cleanedParams);
  console.log('[Meta Pixel] Event fired', {
    eventName,
    pixelId,
    params: cleanedParams,
    url: window.location.href,
  });
};

export const trackMetaCustomEvent = (
  eventName: string,
  params: MetaEventParams = {},
  eventId?: string
) => {
  const normalizedEventName = String(eventName || '').trim();
  const pixelId = getMetaPixelId();

  if (!normalizedEventName || !pixelId || typeof window.fbq !== 'function') {
    console.warn('[Meta Pixel] Custom event skipped', {
      eventName: normalizedEventName || null,
      eventId: eventId || null,
      hasPixelId: Boolean(pixelId),
      hasFbq: typeof window.fbq === 'function',
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
    return;
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );

  if (eventId) {
    window.fbq('trackCustom', normalizedEventName, cleanedParams, { eventID: eventId });
  } else {
    window.fbq('trackCustom', normalizedEventName, cleanedParams);
  }

  console.log('[Meta Pixel] Custom event fired', {
    eventName: normalizedEventName,
    pixelId,
    eventId: eventId || null,
    params: cleanedParams,
    url: window.location.href,
  });
};

export const markMetaPurchaseTracked = (eventId: string) => {
  if (!eventId) return;
  window.sessionStorage.setItem(META_PURCHASE_EVENT_STORAGE_KEY, eventId);
};

export const hasTrackedMetaPurchase = (eventId: string) =>
  Boolean(eventId) &&
  window.sessionStorage.getItem(META_PURCHASE_EVENT_STORAGE_KEY) === eventId;
