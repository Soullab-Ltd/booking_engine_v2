import React, { useEffect, useMemo } from 'react';
import { BookingState, EventData } from '../types';
import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  FileText,
  Ticket,
  Compass,
  ShieldCheck,
  Clock,
  Wind,
  Flower2,
  User,
  type LucideIcon,
} from 'lucide-react';
import { trackCleverTapEvent } from '../src/services/cleverTap';
import {
  getDocumentType,
  getEventId,
  getEventName,
  getPlanName,
} from '../src/services/cleverTapBooking';

interface DownloadsDashboardProps {
  bookingState: BookingState;
  bookingId?: string | number;
  event: EventData;
  ui: any;
}

interface DashboardUi {
  dashboard?: {
    title?: string;
    desc?: string;
    downloads?: {
      title?: string;
    };
  };
}

interface DashboardLinkSource {
  title?: string;
  label?: string;
  url?: string;
  link?: string;
}

interface DashboardLink {
  title: string;
  url: string;
}

interface DashboardAsset {
  title?: string;
  status?: string;
  size?: string;
  description?: string;
  url?: string;
}

interface DashboardDocument {
  title: string;
  icon: LucideIcon;
  status: string;
  size: string;
  desc: string;
  url: string;
}

interface DashboardBookingState extends BookingState {
  event?: {
    title?: string;
    EventName?: string;
  } | null;
  plan?: {
    title?: string;
    PlanTitle?: string;
    PlanName?: string;
  } | null;
  ticketUrl?: string;
  ticket_url?: string;
  invoiceUrl?: string;
  invoice_url?: string;
  completionCertificateUrl?: string;
  completion_certificate_url?: string;
  additionalAssets?: DashboardAsset[];
  otherInfoLinks?: DashboardLinkSource[];
  termsUrl?: string;
  refundPolicyUrl?: string;
  faqsUrl?: string;
  codeOfConductUrl?: string;
}

interface DashboardEventData extends EventData {
  eventDate?: string;
  location?: string;
  Venue?: string;
  otherInfoLinks?: DashboardLinkSource[];
  additionalLinks?: DashboardLinkSource[];
  termsUrl?: string;
  refundPolicyUrl?: string;
  faqsUrl?: string;
  codeOfConductUrl?: string;
}

const getOrdinal = (day: number) => {
  if (day > 3 && day < 21) return 'th';

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const getValidDate = (value: string | Date | undefined | null) => {
  if (!value) return null;

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatFullDate = (date: string | Date | undefined | null) => {
  const validDate = getValidDate(date);
  if (!validDate) return '';

  const day = validDate.getDate();
  const suffix = getOrdinal(day);
  const month = validDate.toLocaleString('en-IN', { month: 'long' });
  const year = validDate.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
};

const formatFullDateRange = (range: string) => {
  if (!range) return '';

  const [start, end] = range.split(' to ');
  if (!start || !end) return formatFullDate(range) || range;

  const formattedStart = formatFullDate(start);
  const formattedEnd = formatFullDate(end);

  if (!formattedStart || !formattedEnd) return range;

  return `${formattedStart} to ${formattedEnd}`;
};

const normalizeLink = (
  item?: DashboardLinkSource | null
): DashboardLink | null => {
  const title = item?.title || item?.label || '';
  const url = item?.url || item?.link || '';

  if (!title || !url || url === '#') return null;

  return { title, url };
};

const DownloadsDashboard: React.FC<DownloadsDashboardProps> = ({
  bookingState,
  event,
  ui,
}) => {
  const booking = bookingState as DashboardBookingState;
  const eventData = event as DashboardEventData;
  const dashboardUi = ui as DashboardUi | undefined;

  const bookingDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    []
  );

  const primaryGuest = useMemo(() => {
    return booking.guests?.[0] || null;
  }, [booking.guests]);

  const eventName =
    eventData.title ||
    eventData.EventName ||
    booking.event?.title ||
    booking.event?.EventName ||
    'Event Name';

  const eventDate = useMemo(() => {
    const rawRange =
      eventData.date || eventData.eventDate || eventData.startDate || '';

    if (!rawRange) return '';

    return rawRange.includes(' to ')
      ? formatFullDateRange(rawRange)
      : formatFullDate(rawRange);
  }, [eventData.date, eventData.eventDate, eventData.startDate]);

  const venue =
    eventData.venue ||
    eventData.location ||
    eventData.Venue ||
    '';

  const planName =
    booking.plan?.title ||
    booking.plan?.PlanTitle ||
    booking.plan?.PlanName ||
    booking.selectedPlan?.title ||
    booking.selectedPlan?.PlanTitle ||
    booking.selectedPlan?.PlanName ||
    'Plan Name';

  const documents = useMemo<DashboardDocument[]>(() => {
    const items: DashboardDocument[] = [];
    const ticketUrl = booking.ticketUrl || booking.ticket_url;
    const invoiceUrl = booking.invoiceUrl || booking.invoice_url;
    const certificateUrl =
      booking.completionCertificateUrl ||
      booking.completion_certificate_url;

    if (ticketUrl) {
      items.push({
        title: 'Confirmed Ticket PDF',
        icon: Ticket,
        status: 'Ready',
        size: '1.4 MB',
        desc: 'Your entry pass',
        url: ticketUrl,
      });
    }

    if (invoiceUrl) {
      items.push({
        title: 'Invoice PDF',
        icon: FileText,
        status: 'Ready',
        size: '920 KB',
        desc: 'Detailed payment breakdown',
        url: invoiceUrl,
      });
    }

    if (certificateUrl) {
      items.push({
        title: 'Completion Certificate',
        icon: FileText,
        status: 'Ready',
        size: '--',
        desc: 'Participation certificate',
        url: certificateUrl,
      });
    }

    (booking.additionalAssets || []).forEach((asset) => {
      items.push({
        title: asset.title || 'Untitled Document',
        icon: FileText,
        status: asset.status || 'Ready',
        size: asset.size || '--',
        desc: asset.description || '',
        url: asset.url || '#',
      });
    });

    return items;
  }, [
    booking.additionalAssets,
    booking.completionCertificateUrl,
    booking.completion_certificate_url,
    booking.invoiceUrl,
    booking.invoice_url,
    booking.ticketUrl,
    booking.ticket_url,
  ]);

  const otherInfoLinks = useMemo(() => {
    const adminLinks = Array.isArray(booking.otherInfoLinks)
      ? booking.otherInfoLinks
      : Array.isArray(eventData.otherInfoLinks)
      ? eventData.otherInfoLinks
      : Array.isArray(eventData.additionalLinks)
      ? eventData.additionalLinks
      : [];

    const normalizedAdminLinks = adminLinks
      .map((item) => normalizeLink(item))
      .filter((item): item is DashboardLink => item !== null);

    const fallbackLinks = [
      {
        title: 'T&C',
        url:
          eventData.termsUrl ||
          booking.termsUrl ||
          'https://shreansdaga.org/terms-and-conditions/',
      },
      {
        title: 'Refund Policy',
        url:
          eventData.refundPolicyUrl ||
          booking.refundPolicyUrl ||
          'https://shreansdaga.org/refund-cancellation-policy/',
      },
      {
        title: 'FAQs',
        url:
          eventData.faqsUrl ||
          booking.faqsUrl ||
          '#',
      },
      {
        title: 'Code of Conduct',
        url:
          eventData.codeOfConductUrl ||
          booking.codeOfConductUrl ||
          '#',
      },
    ].filter((item): item is DashboardLink => item.url !== '#');

    return normalizedAdminLinks.length > 0
      ? normalizedAdminLinks
      : fallbackLinks;
  }, [
    booking.codeOfConductUrl,
    booking.faqsUrl,
    booking.otherInfoLinks,
    booking.refundPolicyUrl,
    booking.termsUrl,
    eventData.additionalLinks,
    eventData.codeOfConductUrl,
    eventData.faqsUrl,
    eventData.otherInfoLinks,
    eventData.refundPolicyUrl,
    eventData.termsUrl,
  ]);

  const baseTrackingProps = () => ({
    event_id: getEventId(event),
    event_name: getEventName(event),
    booking_id: bookingState.bookingId ? String(bookingState.bookingId) : '',
  });

  useEffect(() => {
    trackCleverTapEvent(
      'downloads_dashboard_viewed',
      {
        ...baseTrackingProps(),
        plan_name: getPlanName(
          (bookingState as any)?.selectedPlan || (bookingState as any)?.plan
        ),
        guests_count: bookingState.guests?.length || 0,
        documents_count: documents.length,
      },
      {
        dedupeKey: `downloads_dashboard_viewed:${bookingState.bookingId || 'na'}`,
        dedupeWindowMs: 60000,
      }
    );
  }, [bookingState, documents.length, event]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 w-full animate-fadeIn pb-32">
      <div className="mb-12">
        <h2 className="text-5xl font-black text-stone-900 mb-3 tracking-tighter">
          {dashboardUi?.dashboard?.title || 'Your Booking Dashboard'}
        </h2>
        <p className="text-stone-500 font-medium text-lg max-w-2xl leading-relaxed">
          {dashboardUi?.dashboard?.desc ||
            'Everything you need for your booking is here.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-stone-50 rounded-full -m-40 transition-transform duration-1000 group-hover:scale-110"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-teal-50 text-[var(--theme)] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-teal-100/50">
                    <ShieldCheck className="w-3.5 h-3.5" /> Booking Confirmed
                  </div>

                  <h3 className="text-4xl font-black tracking-tighter text-stone-900">
                    {eventName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {eventDate && (
                      <span className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase tracking-tight">
                        <Calendar className="w-4 h-4 text-[var(--theme)]" /> {eventDate}
                      </span>
                    )}
                    {venue && (
                      <span className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase tracking-tight">
                        <MapPin className="w-4 h-4 text-[var(--theme)]" /> {venue}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">
                    Booking ID
                  </p>
                  <p className="text-xl font-mono font-black text-stone-900">
                    #{booking.bookingId || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-stone-50">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                      Primary Guest
                    </span>
                    <div className="bg-stone-50 rounded-[24px] p-5 border border-stone-100">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                          <User className="w-5 h-5 text-[var(--theme)]" />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <p className="text-lg font-black text-stone-900 break-words">
                            {primaryGuest?.name || '-'}
                          </p>
                          <p className="text-sm text-stone-500 break-all">
                            {primaryGuest?.email || '-'}
                          </p>
                          <p className="text-sm text-stone-500">
                            {primaryGuest?.phone ||
                              primaryGuest?.phoneNumber ||
                              '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                      Event Name
                    </span>
                    <span className="text-xl font-black text-stone-900">
                      {eventName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                      Plan Name
                    </span>
                    <span className="text-xl font-black text-stone-900">
                      {planName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                      No. of Guests
                    </span>
                    <span className="text-xl font-black text-stone-900">
                      {booking.guests?.length || 0}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                      Booking Date
                    </span>
                    <span className="text-xl font-black text-stone-900">
                      {bookingDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                      <span className="text-xl font-black text-stone-900">
                        Active
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                      Venue
                    </span>
                    <span className="text-base font-black text-stone-900">
                      {venue || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <h3 className="text-2xl font-black text-stone-900 flex items-center gap-3">
                <FileText className="w-7 h-7 text-[var(--theme)]" />{' '}
                {dashboardUi?.dashboard?.downloads?.title || 'Documents'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {documents.map((doc, idx) => {
                const Icon = doc.icon;
                const isPending = doc.status.includes('days');

                return (
                  <div
                    key={`${doc.title}-${doc.url}-${idx}`}
                    onClick={() => {
                      if (!doc.url || doc.url === '#') return;

                      trackCleverTapEvent('document_opened', {
                        ...baseTrackingProps(),
                        document_title: doc.title,
                        document_type: getDocumentType(doc.title),
                        document_status: doc.status,
                      });

                      window.open(doc.url, '_blank');
                    }}
                    className={`group bg-white p-6 rounded-[32px] border-2 border-stone-50 shadow-sm hover:shadow-xl hover:border-teal-100/50 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                      isPending ? 'opacity-70 grayscale' : ''
                    }`}
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-16 h-16 rounded-[24px] bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-[var(--theme-light)] group-hover:text-[var(--theme)] transition-all shadow-inner">
                        <Icon className="w-8 h-8" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-stone-900 truncate pr-4">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight mt-0.5 line-clamp-1">
                          {doc.desc}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                              doc.status === 'Ready'
                                ? 'bg-teal-50 text-[var(--theme)]'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {doc.status}
                          </span>
                          {doc.size !== '--' && (
                            <span className="text-[9px] font-bold text-stone-300">
                              {doc.size}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isPending && (
                      <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-stone-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-stone-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-stone-200">
            <div className="absolute top-0 right-0 -m-12 w-48 h-48 bg-[var(--theme)]/20 rounded-full blur-3xl"></div>

            <h4 className="text-xl font-black mb-8 flex items-center gap-3">
              <Compass className="w-6 h-6 text-teal-400" /> Contact & Support
            </h4>

            <div className="space-y-8 relative z-10">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                    Contact us / Whatsapp
                  </p>
                  <a
                    href="tel:+919867666444"
                    className="font-bold text-sm hover:text-teal-300 transition-colors"
                    onClick={() =>
                      trackCleverTapEvent('support_phone_clicked', {
                        ...baseTrackingProps(),
                        support_phone: '+919867666444',
                        placement: 'dashboard',
                      })
                    }
                  >
                    +91 9867666444
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                    Email us
                  </p>
                  <a
                    href="mailto:info@shreansdaga.org"
                    className="font-bold text-sm break-all hover:text-teal-300 transition-colors"
                    onClick={() =>
                      trackCleverTapEvent('support_email_clicked', {
                        ...baseTrackingProps(),
                        support_email: 'info@shreansdaga.org',
                        placement: 'dashboard',
                      })
                    }
                  >
                    info@shreansdaga.org
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                    Weather Notice
                  </p>
                  <p className="font-bold text-sm">Expect Cool Evenings</p>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Carry suitable clothing for the evening.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-[40px] p-8 border border-stone-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Flower2 className="w-6 h-6 text-[var(--theme)]" />
              </div>
              <div>
                <h5 className="text-sm font-black text-stone-900">Other Info</h5>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">
                  Important links
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {otherInfoLinks.length > 0 ? (
                otherInfoLinks.map((item, index) => (
                  <a
                    key={`${item.title}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackCleverTapEvent('other_info_link_clicked', {
                        ...baseTrackingProps(),
                        link_title: item.title,
                        link_url: item.url,
                      })
                    }
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 border border-stone-100 hover:border-teal-200 hover:bg-[var(--theme-light)]/40 transition-all"
                  >
                    <span className="text-sm font-bold text-stone-700">
                      {item.title}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-[var(--theme)]">
                      Open
                    </span>
                  </a>
                ))
              ) : (
                <div className="rounded-2xl bg-white px-4 py-4 border border-stone-100">
                  <span className="text-sm font-bold text-stone-500">
                    No additional links available
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadsDashboard;
