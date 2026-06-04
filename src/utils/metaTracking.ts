const META_PIXEL_SCRIPT_ID = 'meta-pixel-script';
const META_ATTRIBUTION_STORAGE_KEY = 'meta_attribution';
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
  landingUrl: string;
  referrer: string;
  capturedAt: string;
}

declare global {
  interface Window {
    _fbq?: any;
    fbq?: (...args: any[]) => void;
    __META_PIXEL_ID__?: string;
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
  landingUrl: String(data.landingUrl || '').trim(),
  referrer: String(data.referrer || '').trim(),
  capturedAt: String(data.capturedAt || '').trim(),
});

const persistMetaAttribution = (data: Partial<MetaAttributionData>) => {
  const normalized = sanitizeAttributionData(data);
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

  try {
    fromStorage = JSON.parse(
      window.localStorage.getItem(META_ATTRIBUTION_STORAGE_KEY) || '{}'
    );
  } catch {
    fromStorage = {};
  }

  return sanitizeAttributionData({
    ...fromStorage,
    fbclid: getCookie('meta_fbclid') || fromStorage.fbclid,
    fbc: getCookie('_fbc') || fromStorage.fbc,
    fbp: getCookie('_fbp') || fromStorage.fbp,
    externalId: getCookie('meta_external_id') || fromStorage.externalId,
  });
};

export const captureMetaAttribution = () => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const existing = getStoredMetaAttribution();

  const fbclid = params.get('fbclid') || existing.fbclid;
  const fbc = params.get('fbc') || getCookie('_fbc') || (fbclid ? buildFbcFromFbclid(fbclid) : existing.fbc);
  const fbp = params.get('fbp') || getCookie('_fbp') || existing.fbp || createFbpFallback();
  const externalId = params.get('external_id') || existing.externalId;

  persistMetaAttribution({
    ...existing,
    fbclid,
    fbc,
    fbp,
    externalId,
    utmSource: params.get('utm_source') || existing.utmSource,
    utmMedium: params.get('utm_medium') || existing.utmMedium,
    utmCampaign: params.get('utm_campaign') || existing.utmCampaign,
    utmContent: params.get('utm_content') || existing.utmContent,
    utmTerm: params.get('utm_term') || existing.utmTerm,
    landingUrl: existing.landingUrl || window.location.href,
    referrer: existing.referrer || document.referrer,
    capturedAt: existing.capturedAt || new Date().toISOString(),
  });
};

export const initMetaPixel = () => {
  const pixelId = getMetaPixelId();

  if (!pixelId || typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  if (window.fbq) {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
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

  window.fbq?.('init', pixelId);
  window.fbq?.('track', 'PageView');
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
    return;
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );

  if (eventName === 'PageView') {
    window.fbq('track', eventName);
    return;
  }

  if (eventId) {
    window.fbq('track', eventName, cleanedParams, { eventID: eventId });
    return;
  }

  window.fbq('track', eventName, cleanedParams);
};

export const markMetaPurchaseTracked = (eventId: string) => {
  if (!eventId) return;
  window.sessionStorage.setItem(META_PURCHASE_EVENT_STORAGE_KEY, eventId);
};

export const hasTrackedMetaPurchase = (eventId: string) =>
  Boolean(eventId) &&
  window.sessionStorage.getItem(META_PURCHASE_EVENT_STORAGE_KEY) === eventId;
