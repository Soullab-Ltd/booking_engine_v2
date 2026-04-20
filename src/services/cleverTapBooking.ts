import { BookingState, EventData, Guest, Plan } from '../../types';

export const getEventId = (event?: Partial<EventData> | null) =>
  Number(event?.EventID ?? event?.id ?? 0) || 0;

export const getEventName = (event?: Partial<EventData> | null) =>
  String(event?.EventName || event?.title || '').trim();

export const getEventSlug = (event?: Partial<EventData> | null) =>
  String(event?.slug || '').trim();

export const getPlanId = (plan?: Partial<Plan> | null) =>
  Number(plan?.planID ?? plan?.PlanID ?? plan?.id ?? 0) || 0;

export const getPlanName = (plan?: Partial<Plan> | null) =>
  String(plan?.PlanTitle || plan?.title || plan?.PlanName || '').trim();

export const getPlanSubtitle = (plan?: Partial<Plan> | null) =>
  String(plan?.PlanSubtitle || plan?.stayRoomType || '').trim();

export const getPrimaryGuest = (
  bookingState?: Partial<BookingState> | null
): Partial<Guest> | null => bookingState?.guests?.[0] || null;

export const getGuestsCount = (bookingState?: Partial<BookingState> | null) =>
  Number(bookingState?.guests?.length || 0);

export const getSelectedAddonCount = (guests: Array<Partial<Guest>> = []) =>
  guests.reduce((total, guest: any) => {
    return total + Number(guest?.addOns?.selectedAddons?.length || 0);
  }, 0);

export const getExtraStayGuestCount = (guests: Array<Partial<Guest>> = []) =>
  guests.filter((guest: any) => guest?.addOns?.extraStay?.enabled).length;

export const getEligibleKidsCount = (guests: Array<Partial<Guest>> = []) =>
  guests.filter((guest) => {
    const age = Number(guest?.age || 0);
    return age >= 4 && age <= 17;
  }).length;

export const formatPhoneForCleverTap = (phone?: string, country?: string) => {
  const rawPhone = String(phone || '').trim();
  if (!rawPhone) return '';

  if (rawPhone.startsWith('+')) {
    return `+${rawPhone.replace(/[^\d]/g, '')}`;
  }

  const digits = rawPhone.replace(/[^\d]/g, '');
  if (!digits) return '';

  if (String(country || '').trim().toLowerCase() === 'india' && digits.length === 10) {
    return `+91${digits}`;
  }

  return digits;
};

export const getDocumentType = (title?: string) => {
  const normalizedTitle = String(title || '').trim().toLowerCase();

  if (normalizedTitle.includes('ticket')) return 'ticket';
  if (normalizedTitle.includes('invoice')) return 'invoice';
  if (normalizedTitle.includes('certificate')) return 'certificate';

  return 'asset';
};
