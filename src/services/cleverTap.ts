const CLEVERTAP_SCRIPT_ID = 'clevertap-web-sdk';
const CLEVERTAP_SCRIPT_SRC =
  'https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js';
const CLEVERTAP_PLACEHOLDER_ACCOUNT_ID = 'CLEVERTAP_ACCOUNT_ID';
const DEFAULT_DEDUPE_WINDOW_MS = 1500;

type CleverTapScalar = string | number | boolean | Date;

type CleverTapProps = Record<string, unknown>;

interface CleverTapTrackOptions {
  dedupeKey?: string;
  dedupeWindowMs?: number;
}

interface CleverTapQueue {
  account: Array<unknown>;
  event: Array<unknown>;
  notifications: Array<unknown>;
  onUserLogin: Array<unknown>;
  privacy: Array<unknown>;
  profile: Array<unknown>;
}

declare global {
  interface Window {
    __cleverTapConfigured__?: boolean;
    clevertap?: CleverTapQueue;
  }
}

const dedupeTimestamps = new Map<string, number>();

const getConfig = () => {
  const accountId = String(
    import.meta.env.VITE_CLEVERTAP_ACCOUNT_ID || ''
  ).trim();
  const region = String(import.meta.env.VITE_CLEVERTAP_REGION || '').trim();

  return {
    accountId,
    region,
    enabled:
      accountId.length > 0 && accountId !== CLEVERTAP_PLACEHOLDER_ACCOUNT_ID,
  };
};

const ensureQueue = (): CleverTapQueue | null => {
  if (typeof window === 'undefined') return null;

  if (window.clevertap) {
    return window.clevertap;
  }

  const queue: CleverTapQueue = {
    account: [],
    event: [],
    notifications: [],
    onUserLogin: [],
    privacy: [],
    profile: [],
  };

  window.clevertap = queue;
  return queue;
};

const shouldSkipForDedupe = ({
  dedupeKey,
  dedupeWindowMs = DEFAULT_DEDUPE_WINDOW_MS,
}: CleverTapTrackOptions) => {
  if (!dedupeKey) return false;

  const now = Date.now();
  const lastTrackedAt = dedupeTimestamps.get(dedupeKey);

  if (lastTrackedAt && now - lastTrackedAt < dedupeWindowMs) {
    return true;
  }

  dedupeTimestamps.set(dedupeKey, now);
  return false;
};

const isScalarValue = (value: unknown): value is CleverTapScalar =>
  value instanceof Date ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

const sanitizeScalarValue = (value: unknown): CleverTapScalar | null => {
  if (value === null || value === undefined) return null;
  if (isScalarValue(value)) return value;

  if (Array.isArray(value)) {
    const flattened = value
      .map((item) => sanitizeScalarValue(item))
      .filter((item): item is CleverTapScalar => item !== null)
      .map((item) => (item instanceof Date ? item.toISOString() : String(item)))
      .join(', ');

    return flattened || null;
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const sanitizeProps = (props: CleverTapProps = {}) => {
  const sanitized: Record<string, CleverTapScalar> = {};

  Object.entries(props).forEach(([key, value]) => {
    const normalizedKey = String(key || '').trim();
    if (!normalizedKey) return;

    const normalizedValue = sanitizeScalarValue(value);
    if (normalizedValue === null) return;

    sanitized[normalizedKey] = normalizedValue;
  });

  return sanitized;
};

const sanitizeChargedItems = (items: CleverTapProps[] = []) =>
  items
    .map((item) => sanitizeProps(item))
    .filter((item) => Object.keys(item).length > 0);

export const isCleverTapEnabled = () => getConfig().enabled;

export const initializeCleverTap = () => {
  const config = getConfig();
  if (!config.enabled || typeof document === 'undefined') {
    return false;
  }

  const cleverTap = ensureQueue();
  if (!cleverTap) return false;

  if (!window.__cleverTapConfigured__) {
    if (config.region) {
      cleverTap.account.push({ id: config.accountId }, config.region);
    } else {
      cleverTap.account.push({ id: config.accountId });
    }

    cleverTap.privacy.push({ optOut: false });
    cleverTap.privacy.push({ useIP: false });
    window.__cleverTapConfigured__ = true;
  }

  if (!document.getElementById(CLEVERTAP_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = CLEVERTAP_SCRIPT_ID;
    script.type = 'text/javascript';
    script.async = true;
    script.src = CLEVERTAP_SCRIPT_SRC;
    document.head.appendChild(script);
  }

  return true;
};

export const trackCleverTapEvent = (
  eventName: string,
  props: CleverTapProps = {},
  options: CleverTapTrackOptions = {}
) => {
  const normalizedEventName = String(eventName || '').trim();
  if (!normalizedEventName) return false;
  if (shouldSkipForDedupe(options)) return false;
  if (!initializeCleverTap()) return false;

  const sanitizedProps = sanitizeProps(props);
  const cleverTap = ensureQueue();
  if (!cleverTap) return false;

  if (Object.keys(sanitizedProps).length > 0) {
    cleverTap.event.push(normalizedEventName, sanitizedProps);
  } else {
    cleverTap.event.push(normalizedEventName);
  }

  return true;
};

export const identifyCleverTapUser = (
  profile: CleverTapProps,
  options: CleverTapTrackOptions = {}
) => {
  if (shouldSkipForDedupe(options)) return false;
  if (!initializeCleverTap()) return false;

  const sanitizedProfile = sanitizeProps(profile);
  if (Object.keys(sanitizedProfile).length === 0) return false;

  const cleverTap = ensureQueue();
  if (!cleverTap) return false;

  cleverTap.onUserLogin.push({ Site: sanitizedProfile });
  return true;
};

export const updateCleverTapProfile = (
  profile: CleverTapProps,
  options: CleverTapTrackOptions = {}
) => {
  if (shouldSkipForDedupe(options)) return false;
  if (!initializeCleverTap()) return false;

  const sanitizedProfile = sanitizeProps(profile);
  if (Object.keys(sanitizedProfile).length === 0) return false;

  const cleverTap = ensureQueue();
  if (!cleverTap) return false;

  cleverTap.profile.push({ Site: sanitizedProfile });
  return true;
};

export const pushCleverTapChargedEvent = (
  chargeDetails: CleverTapProps,
  items: CleverTapProps[] = [],
  options: CleverTapTrackOptions = {}
) => {
  if (shouldSkipForDedupe(options)) return false;
  if (!initializeCleverTap()) return false;

  const sanitizedDetails = sanitizeProps(chargeDetails);
  const sanitizedItems = sanitizeChargedItems(items);
  const cleverTap = ensureQueue();

  if (!cleverTap) return false;

  cleverTap.event.push('Charged', {
    ...sanitizedDetails,
    Items: sanitizedItems,
  });

  return true;
};
