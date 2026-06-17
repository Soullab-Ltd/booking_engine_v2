import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { createEmptyGuest } from './constants';
import { BookingState, Plan } from './types';
import {
  getAllData,
  EventResponse,
  UIContent,
  AppConfig,
  getAllDataBySlug,
} from './src/services/dataService';

import LandingPage from './components/LandingPage';
import PlanSelection from './components/PlanSelection';
import PlanDetail from './components/PlanDetail';
import GuestForm from './components/GuestForm';
import BookingSummary from './components/BookingSummary';
import PaymentStatus from './components/PaymentStatus';
import DownloadsDashboard from './components/DownloadsDashboard';
import {
  captureMetaAttribution,
  createMetaEventId,
  getStoredMetaAttribution,
  hasTrackedMetaPurchase,
  initMetaPixel,
  markMetaPurchaseTracked,
  trackMetaEvent,
} from './src/utils/metaTracking';


const formatDisplayDate = (dateStr: any) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date).replace(/ /g, '-');
};

const getStringValue = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const normalizeBookingGuest = (guest: any, index: number) => {
  const emptyGuest = createEmptyGuest();
  const parsedAge = Number(
    guest?.age ?? guest?.Age ?? guest?.guestAge ?? guest?.guest_age ?? NaN
  );

  return {
    ...emptyGuest,
    ...guest,
    id: String(
      guest?.id ??
        guest?.guestId ??
        guest?.guest_id ??
        guest?.GuestID ??
        `${index + 1}`
    ),
    name: getStringValue(
      guest?.name,
      guest?.guestName,
      guest?.guest_name,
      guest?.fullName,
      guest?.full_name,
      guest?.GuestName
    ),
    phone: getStringValue(
      guest?.phone,
      guest?.phoneNumber,
      guest?.phone_number,
      guest?.mobile,
      guest?.mobileNumber,
      guest?.mobile_number
    ),
    email: getStringValue(guest?.email, guest?.Email, guest?.emailAddress),
    age: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : emptyGuest.age,
    gender: getStringValue(guest?.gender, guest?.Gender) || emptyGuest.gender,
    city: getStringValue(guest?.city, guest?.City),
    state: getStringValue(guest?.state, guest?.State),
    country: getStringValue(guest?.country, guest?.Country),
    remark: getStringValue(guest?.remark, guest?.remarks, guest?.notes),
    addOns: guest?.addOns || emptyGuest.addOns,
  };
};

const getBookingGuests = (bookingData: any) => {
  const rawGuests = [
    ...(Array.isArray(bookingData?.guests) ? bookingData.guests : []),
    ...(Array.isArray(bookingData?.guestDetails) ? bookingData.guestDetails : []),
    ...(Array.isArray(bookingData?.guest_details) ? bookingData.guest_details : []),
  ];

  const uniqueGuests = rawGuests.filter(
    (guest, index, arr) =>
      index ===
      arr.findIndex((item) => {
        const itemId = String(
          item?.id ?? item?.guestId ?? item?.guest_id ?? item?.GuestID ?? ''
        );
        const guestId = String(
          guest?.id ?? guest?.guestId ?? guest?.guest_id ?? guest?.GuestID ?? ''
        );

        if (itemId && guestId) return itemId === guestId;

        return (
          getStringValue(
            item?.email,
            item?.Email,
            item?.phone,
            item?.phoneNumber,
            item?.mobile
          ) ===
          getStringValue(
            guest?.email,
            guest?.Email,
            guest?.phone,
            guest?.phoneNumber,
            guest?.mobile
          )
        );
      })
  );

  return uniqueGuests.length > 0
    ? uniqueGuests.map(normalizeBookingGuest)
    : [createEmptyGuest()];
};

const getBookingPrimaryGuest = (bookingData: any) => {
  const explicitPrimaryGuest =
    bookingData?.primaryGuest || bookingData?.primary_guest || null;
  const firstGuest =
    (Array.isArray(bookingData?.guests) && bookingData.guests[0]) ||
    (Array.isArray(bookingData?.guestDetails) && bookingData.guestDetails[0]) ||
    (Array.isArray(bookingData?.guest_details) && bookingData.guest_details[0]) ||
    null;

  const source = explicitPrimaryGuest || firstGuest || bookingData || {};

  return {
    name: getStringValue(
      source?.name,
      source?.guestName,
      source?.guest_name,
      source?.fullName,
      source?.full_name,
      bookingData?.primaryGuestName,
      bookingData?.primary_guest_name
    ),
    email: getStringValue(
      source?.email,
      source?.Email,
      source?.emailAddress,
      bookingData?.primaryGuestEmail,
      bookingData?.primary_guest_email
    ),
    phoneNumber: getStringValue(
      source?.phoneNumber,
      source?.phone_number,
      source?.phone,
      source?.mobile,
      source?.mobileNumber,
      source?.mobile_number,
      bookingData?.primaryGuestPhoneNumber,
      bookingData?.primary_guest_phone_number
    ),
  };
};

const STEP_LOADING_COPY: Record<number, string> = {
  2: 'Loading plans...',
  3: 'Loading plan details...',
  4: 'Preparing guest form...',
  5: 'Preparing booking summary...',
  6: 'Fetching payment status...',
  7: 'Loading downloads dashboard...',
};

const PAYMENT_STATUS_POLL_INTERVAL_MS = 3000;
const PAYMENT_STATUS_POLL_TIMEOUT_MS = 3 * 60 * 1000;
const RAZORPAY_CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';
const BOOKING_API_BASE_URL = 'https://bookingapi.thriive.in/bookings';
const LAST_BOOKING_STORAGE_PREFIX = 'booking_engine:last_booking';

const isMobileBrowser = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const getLastBookingStorageKey = (eventIdentifier: string) =>
  `${LAST_BOOKING_STORAGE_PREFIX}:${eventIdentifier}`;

const getStoredBookingId = (eventIdentifier: string) => {
  if (typeof window === 'undefined' || !eventIdentifier) {
    return '';
  }

  try {
    return window.sessionStorage.getItem(getLastBookingStorageKey(eventIdentifier)) || '';
  } catch (error) {
    console.warn('Unable to read session booking id:', error);
    return '';
  }
};

const storeBookingId = (eventIdentifier: string, bookingId: string | number) => {
  if (typeof window === 'undefined' || !eventIdentifier || !bookingId) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getLastBookingStorageKey(eventIdentifier),
      String(bookingId)
    );
  } catch (error) {
    console.warn('Unable to store session booking id:', error);
  }
};

const loadRazorpayCheckoutScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Payment checkout is only available in the browser.'));
      return;
    }

    if ((window as any).Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_SCRIPT}"]`
    ) as HTMLScriptElement | null;

    const handleScriptLoad = () => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      reject(new Error('Razorpay checkout did not load correctly.'));
    };

    const handleScriptError = () => {
      reject(new Error('We could not load Razorpay checkout right now.'));
    };

    if (existingScript) {
      existingScript.addEventListener('load', handleScriptLoad, { once: true });
      existingScript.addEventListener('error', handleScriptError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = handleScriptLoad;
    script.onerror = handleScriptError;
    document.body.appendChild(script);
  });

const clearAutopayParamsFromUrl = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  let didChange = false;

  if (url.searchParams.has('autopay')) {
    url.searchParams.delete('autopay');
    didChange = true;
  }

  if (url.searchParams.get('view') === 'payment') {
    url.searchParams.set('view', 'dashboard');
    didChange = true;
  }

  if (didChange) {
    window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}`);
  }
};

const waitForTransitionFrame = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.setTimeout(resolve, 120);
    });
  });

const scrollViewportToTop = () => {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
};

const getBookingAtgDetails = (bookingData: any) => {
  const atgDetails = bookingData?.atgDetails || bookingData?.atg_details || null;

  if (!atgDetails) {
    return {
      isAtgRequested: false,
      panNumber: '',
      aadharNumber: '',
      panFileUrl: '',
      aadharFileUrl: '',
      atgDetails: null,
    };
  }

  return {
    isAtgRequested: Boolean(
      bookingData?.isAtgRequested ??
        bookingData?.is_atg_requested ??
        atgDetails?.panNumber ??
        atgDetails?.aadharNumber
    ),
    panNumber: String(atgDetails?.panNumber || '').trim(),
    aadharNumber: String(atgDetails?.aadharNumber || '').trim(),
    panFileUrl: String(atgDetails?.panFileUrl || atgDetails?.pan_file_url || '').trim(),
    aadharFileUrl: String(
      atgDetails?.aadharFileUrl || atgDetails?.aadhar_file_url || ''
    ).trim(),
    atgDetails,
  };
};

const getBookingPresentationState = (bookingData: any) => {
  const bookingStatusRaw = getStringValue(
    bookingData?.bookingConfirmationStatus,
    bookingData?.booking_confirmation_status,
    bookingData?.bookingStatus,
    bookingData?.booking_status
  );
  const verificationStatusRaw = getStringValue(
    bookingData?.verificationStatus,
    bookingData?.verification_status,
    bookingData?.couponVerificationStatus,
    bookingData?.coupon_verification_status,
    bookingData?.idVerificationStatus,
    bookingData?.id_verification_status
  );
  const backendPaymentStatusRaw = getStringValue(
    bookingData?.paymentStatus,
    bookingData?.payment_status,
    bookingData?.status
  );

  const bookingStatus = bookingStatusRaw.toLowerCase();
  const verificationStatus = verificationStatusRaw.toLowerCase();
  const backendPaymentStatus = backendPaymentStatusRaw.toLowerCase();
  const isExplicitlyConfirmed =
    bookingStatus === 'confirmed' || bookingStatus.includes('confirm');
  const isFailed =
    bookingStatus.includes('cancel') ||
    bookingStatus.includes('fail') ||
    backendPaymentStatus.includes('fail') ||
    backendPaymentStatus.includes('cancel');

  if (isFailed) {
    return {
      paymentResult: 'FAILED' as const,
      bookingStatus: 'FAILED' as const,
      bookingStatusLabel: 'Payment Failed',
      bookingStatusMessage:
        'Your payment could not be completed. Please try again or contact support if the amount was debited.',
      backendPaymentStatus: backendPaymentStatusRaw || bookingStatusRaw,
    };
  }

  const hasCouponCode = Boolean(
    getStringValue(bookingData?.couponCode, bookingData?.coupon_code)
  );
  const hasUploadedVerificationProof = Boolean(
    getStringValue(
      bookingData?.couponIdProofUrl,
      bookingData?.coupon_id_proof_url,
      bookingData?.couponProofUrl,
      bookingData?.coupon_proof_url
    )
  );

  const isPending =
    !isExplicitlyConfirmed ||
    bookingStatus.includes('pending') ||
    verificationStatus.includes('pending') ||
    verificationStatus.includes('review') ||
    verificationStatus.includes('verify') ||
    backendPaymentStatus.includes('pending') ||
    backendPaymentStatus.includes('processing') ||
    backendPaymentStatus.includes('authorized') ||
    (hasCouponCode && hasUploadedVerificationProof && !isExplicitlyConfirmed);

  if (isPending) {
    return {
      paymentResult: 'PENDING' as const,
      bookingStatus: 'PENDING' as const,
      bookingStatusLabel: 'Pending Verification',
      bookingStatusMessage:
        'Your payment was received. Booking will be confirmed after admin confirms the verification process.',
      backendPaymentStatus: backendPaymentStatusRaw || bookingStatusRaw,
    };
  }

  return {
    paymentResult: 'SUCCESS' as const,
    bookingStatus: 'CONFIRMED' as const,
    bookingStatusLabel: 'Fully Confirmed',
    bookingStatusMessage:
      'Your booking is confirmed. Your confirmation, invoice, and ticket will be shared with you shortly.',
    backendPaymentStatus: backendPaymentStatusRaw || bookingStatusRaw,
  };
};

type PaymentConfirmationDetails = {
  paymentId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paymentSyncStatus?: 'synced' | 'pending' | 'failed';
  paymentSyncMessage?: string;
  backendPaymentStatus?: string;
  metaPurchaseEventId?: string;
};

const App: React.FC = () => {
  const hasTrackedViewContentRef = useRef<string>('');
  const [data, setData] = useState<{
    eventData: EventResponse;
    plans: Plan[];
    uiContent: UIContent;
    config: AppConfig;
    addons?: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [stepLoadingMessage, setStepLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [bookingState, setBookingState] = useState<BookingState>({
    currentStep: 2, // Starts at Plan Selection
    selectedPlan: null,
    guests: [createEmptyGuest()],
    discounts: { type: 'NONE', amount: 0 },
    is80GRequired: false,
    taxInfo: { panNumber: '', fullName: '', address: '' },
    bookingId: undefined,
  });

  const [paymentResult, setPaymentResult] = useState<'SUCCESS' | 'PENDING' | 'FAILED' | null>(null);
  const hasLocalPaymentSuccessRef = useRef(false);
  const hasAttemptedAutoPayRef = useRef(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  useEffect(() => {
    captureMetaAttribution();
    initMetaPixel();
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🚀 Starting data fetch...');

        const urlParams = new URLSearchParams(window.location.search);
        const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
        const eventId = urlParams.get('id');
        const bookingIdFromUrl = urlParams.get('booking');
        const view = urlParams.get('view');
        const eventIdentifier = slug || eventId || '44';
        const sessionBookingId = bookingIdFromUrl
          ? ''
          : getStoredBookingId(eventIdentifier);
        const effectiveBookingId = bookingIdFromUrl || sessionBookingId || null;

        let allData;

        if (slug) {
          allData = await getAllDataBySlug(slug, effectiveBookingId);
        } else {
          allData = await getAllData(eventId || '44', effectiveBookingId);
        }
        console.log('✅ API Response:', allData);

        // --- BUG FIX: SCHEDULE SAFETY CHECK ---
        if (allData && allData.eventData) {
          if (!allData.eventData.schedules) {
            console.warn("⚠️ Schedule not found in backend, initializing empty array.");
            allData.eventData.schedules = [];
          }
        }

        // ✅ FRONTEND FIX: Filter out the Kids Plan from the main listing
        // We exclude plans that are marked as Special or have the 'Kid' tag
        const filteredPlans = (allData?.plans || []).filter(plan => 
          plan.isSpecialPlan !== 1 && 
          plan.isSpecialPlan !== true && 
          plan.tag !== 'Kid'
        );

        setData({
          ...allData,
          plans: filteredPlans, // Set only the filtered main plans
          addons:
            allData?.addons ||
            allData?.eventData?.addons ||
            [],
        });

          const bookingAtgDetails = getBookingAtgDetails(allData?.bookingData);

	        if (effectiveBookingId) {
            const bookingPresentation = getBookingPresentationState(allData?.bookingData);
            storeBookingId(eventIdentifier, effectiveBookingId);
	          setBookingState((prev) => ({
	            ...prev,
              currentStep: view === 'payment' ? 6 : 7,
	            bookingId: effectiveBookingId,
              selectedPlan: allData?.bookingData?.plan || prev.selectedPlan,
              guests: getBookingGuests(allData?.bookingData),
              primaryGuest: getBookingPrimaryGuest(allData?.bookingData),
              primaryGuestName: getBookingPrimaryGuest(allData?.bookingData).name,
              primaryGuestEmail: getBookingPrimaryGuest(allData?.bookingData).email,
              primaryGuestPhoneNumber:
                getBookingPrimaryGuest(allData?.bookingData).phoneNumber,
              is80GRequired: bookingAtgDetails.isAtgRequested,
              taxInfo: {
                ...prev.taxInfo,
                panNumber: bookingAtgDetails.panNumber,
                aadharNumber: bookingAtgDetails.aadharNumber,
                panFile: bookingAtgDetails.panFileUrl,
                aadharFile: bookingAtgDetails.aadharFileUrl,
              },
              atgDetails: bookingAtgDetails.atgDetails || undefined,
              panNumber: bookingAtgDetails.panNumber,
              aadharNumber: bookingAtgDetails.aadharNumber,
              panFileUrl: bookingAtgDetails.panFileUrl,
              aadharFileUrl: bookingAtgDetails.aadharFileUrl,
	            ticketUrl: allData?.bookingData?.ticketUrl || '',
	            invoiceUrl: allData?.bookingData?.invoiceUrl || '',
	            completionCertificateUrl:
              allData?.bookingData?.completionCertificateUrl || '',
              bookingStatus: bookingPresentation.bookingStatus,
              bookingStatusLabel: bookingPresentation.bookingStatusLabel,
              bookingStatusMessage: bookingPresentation.bookingStatusMessage,
              backendPaymentStatus: bookingPresentation.backendPaymentStatus,
              paymentId: getStringValue(
                allData?.bookingData?.paymentId,
                allData?.bookingData?.payment_id
              ),
            additionalAssets: allData?.bookingData?.additionalAssets || [],
          }));

          setPaymentResult((prev) => {
            if (hasLocalPaymentSuccessRef.current && prev === 'SUCCESS') {
              return 'SUCCESS';
            }

            return bookingPresentation.paymentResult;
          });
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load event data. Please ensure the URL is correct.');
      } finally {
        console.log('🏁 Data fetch completed');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const launchRetryCheckout = async (bookingId: string | number) => {
    if (!data) {
      throw new Error('Event data is still loading. Please try again.');
    }

    const responseRaw = await fetch(`${BOOKING_API_BASE_URL}/${bookingId}/razorpay/resume`, {
      method: 'POST',
    });

    const responseText = await responseRaw.text();
    const response = responseText ? JSON.parse(responseText) : {};

    if (!responseRaw.ok) {
      throw new Error(
        response?.message || 'We could not reopen your payment session. Please try again.'
      );
    }

    const razorpay = response?.razorpay || {};
    const orderId = String(razorpay?.orderId || response?.orderId || '').trim();
    const key = String(razorpay?.key || response?.key || '').trim();

    if (!orderId || !key) {
      throw new Error('The retry payment session is incomplete. Please try again.');
    }

    await loadRazorpayCheckoutScript();

    const RazorpayCheckout = (window as any).Razorpay;
    if (!RazorpayCheckout) {
      throw new Error('Razorpay checkout is unavailable right now.');
    }

    const eventName = String(
      data.eventData.event?.EventName || data.eventData.event?.title || 'Event Booking'
    ).trim();
    const planTitle = String(
      bookingState.selectedPlan?.PlanTitle ||
        bookingState.selectedPlan?.PlanName ||
        bookingState.selectedPlan?.title ||
        'Selected Plan'
    ).trim();
    await new Promise<void>((resolve, reject) => {
      const razorpayInstance = new RazorpayCheckout({
        key,
        order_id: orderId,
        amount: Number(razorpay?.amount || 0),
        currency: String(razorpay?.currency || 'INR').trim(),
        name: eventName,
        description: planTitle ? `${planTitle} booking` : `${eventName} booking`,
        prefill: {
          name: String(razorpay?.prefill?.name || bookingState.primaryGuestName || '').trim(),
          email: String(razorpay?.prefill?.email || bookingState.primaryGuestEmail || '').trim(),
          contact: String(
            razorpay?.prefill?.contact || bookingState.primaryGuestPhoneNumber || ''
          ).trim(),
        },
        notes: {
          booking_id: String(bookingId),
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment was cancelled before completion.'));
          },
        },
        handler: () => {
          resolve();
        },
        theme: {
          color: '#0f766e',
        },
      });

      razorpayInstance.on('payment.failed', (paymentFailure: any) => {
        const failureReason =
          paymentFailure?.error?.description ||
          paymentFailure?.error?.reason ||
          paymentFailure?.error?.step ||
          'Payment failed. Please try again.';
        reject(new Error(String(failureReason)));
      });

      try {
        razorpayInstance.open();
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unable to open Razorpay checkout.'));
      }
    });
  };

  const retryBookingPayment = async (source: 'manual' | 'autopay') => {
    if (!bookingState.bookingId || isRetryingPayment) {
      return;
    }

    try {
      setIsRetryingPayment(true);
      setBookingState((prev) => ({
        ...prev,
        paymentSyncStatus: 'pending',
        paymentSyncMessage:
          source === 'autopay'
            ? 'Opening Razorpay checkout on your phone...'
            : 'Reopening your payment session...',
      }));
      await launchRetryCheckout(bookingState.bookingId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment retry failed.';
      setBookingState((prev) => ({
        ...prev,
        paymentSyncStatus: 'failed',
        paymentSyncMessage: message,
      }));
    } finally {
      setIsRetryingPayment(false);
    }
  };

  useEffect(() => {
    if (
      bookingState.currentStep !== 6 ||
      paymentResult !== 'PENDING' ||
      !bookingState.bookingId ||
      !data
    ) {
      return;
    }

    const eventId = Number(
      data?.eventData?.event?.EventID ||
        data?.eventData?.event?.id ||
        new URLSearchParams(window.location.search).get('id') ||
        0
    );

    if (!eventId) {
      return;
    }

    let isCancelled = false;
    const startedAt = Date.now();

    const refreshBookingStatus = async () => {
      while (!isCancelled && Date.now() - startedAt < PAYMENT_STATUS_POLL_TIMEOUT_MS) {
        try {
          const allData = await getAllData(String(eventId), String(bookingState.bookingId));
          const bookingPresentation = getBookingPresentationState(allData?.bookingData);
          const bookingAtgDetails = getBookingAtgDetails(allData?.bookingData);
          const primaryGuest = getBookingPrimaryGuest(allData?.bookingData);

          if (isCancelled) {
            return;
          }

          setPaymentResult(bookingPresentation.paymentResult);
          setBookingState((prev) => ({
            ...prev,
            guests: getBookingGuests(allData?.bookingData),
            primaryGuest,
            primaryGuestName: primaryGuest.name,
            primaryGuestEmail: primaryGuest.email,
            primaryGuestPhoneNumber: primaryGuest.phoneNumber,
            is80GRequired: bookingAtgDetails.isAtgRequested || prev.is80GRequired,
            taxInfo: {
              ...prev.taxInfo,
              panNumber: bookingAtgDetails.panNumber || prev.taxInfo.panNumber,
              aadharNumber:
                bookingAtgDetails.aadharNumber || prev.taxInfo.aadharNumber || '',
              panFile: bookingAtgDetails.panFileUrl || prev.taxInfo.panFile || '',
              aadharFile:
                bookingAtgDetails.aadharFileUrl || prev.taxInfo.aadharFile || '',
            },
            atgDetails: bookingAtgDetails.atgDetails || prev.atgDetails,
            panNumber: bookingAtgDetails.panNumber || prev.panNumber || '',
            aadharNumber: bookingAtgDetails.aadharNumber || prev.aadharNumber || '',
            panFileUrl: bookingAtgDetails.panFileUrl || prev.panFileUrl || '',
            aadharFileUrl: bookingAtgDetails.aadharFileUrl || prev.aadharFileUrl || '',
            paymentId:
              getStringValue(
                allData?.bookingData?.paymentId,
                allData?.bookingData?.payment_id
              ) || prev.paymentId || '',
            ticketUrl:
              allData?.bookingData?.ticketUrl ||
              allData?.bookingData?.ticket_url ||
              prev.ticketUrl ||
              '',
            invoiceUrl:
              allData?.bookingData?.invoiceUrl ||
              allData?.bookingData?.invoice_url ||
              prev.invoiceUrl ||
              '',
            completionCertificateUrl:
              allData?.bookingData?.completionCertificateUrl ||
              allData?.bookingData?.completion_certificate_url ||
              prev.completionCertificateUrl ||
              '',
            bookingStatus: bookingPresentation.bookingStatus,
            bookingStatusLabel: bookingPresentation.bookingStatusLabel,
            bookingStatusMessage: bookingPresentation.bookingStatusMessage,
            backendPaymentStatus: bookingPresentation.backendPaymentStatus,
            additionalAssets: allData?.bookingData?.additionalAssets || [],
            paymentSyncStatus:
              bookingPresentation.paymentResult === 'SUCCESS' ? 'synced' : prev.paymentSyncStatus,
            paymentSyncMessage:
              bookingPresentation.paymentResult === 'SUCCESS'
                ? ''
                : prev.paymentSyncMessage || 'Waiting for live payment confirmation from Razorpay.',
          }));

          if (bookingPresentation.paymentResult !== 'PENDING') {
            return;
          }
        } catch (pollError) {
          console.warn('Booking status refresh failed:', pollError);
        }

        await new Promise((resolve) =>
          window.setTimeout(resolve, PAYMENT_STATUS_POLL_INTERVAL_MS)
        );
      }
    };

    void refreshBookingStatus();

    return () => {
      isCancelled = true;
    };
  }, [bookingState.bookingId, bookingState.currentStep, data, paymentResult]);

  useEffect(() => {
    if (
      hasAttemptedAutoPayRef.current ||
      bookingState.currentStep !== 6 ||
      !bookingState.bookingId ||
      !data ||
      !isMobileBrowser()
    ) {
      return;
    }

    const url = new URL(window.location.href);
    const shouldAutopay = url.searchParams.get('autopay') === '1';
    const paymentStatus = String(bookingState.backendPaymentStatus || '').trim().toLowerCase();
    if (
      !shouldAutopay ||
      hasLocalPaymentSuccessRef.current ||
      paymentResult === 'SUCCESS' ||
      !['pending', 'failed'].includes(paymentStatus)
    ) {
      return;
    }

    hasAttemptedAutoPayRef.current = true;
    void retryBookingPayment('autopay');
  }, [
    bookingState.backendPaymentStatus,
    bookingState.bookingId,
    bookingState.currentStep,
    data,
    paymentResult,
  ]);

  useEffect(() => {
    const plan = bookingState.selectedPlan;
    const planKey = String(plan?.planID || plan?.PlanID || plan?.id || '').trim();

    if (bookingState.currentStep !== 3 || !planKey || hasTrackedViewContentRef.current === planKey) {
      return;
    }

    trackMetaEvent('ViewContent', {
      content_name: plan?.PlanTitle || plan?.PlanName || plan?.title || 'Selected Plan',
      content_ids: [planKey],
      content_type: 'product',
      value: Number(plan?.OfferPrice || plan?.discountedPrice || plan?.PlanPrice || 0),
      currency: 'INR',
    });

    hasTrackedViewContentRef.current = planKey;
  }, [bookingState.currentStep, bookingState.selectedPlan]);

  useEffect(() => {
    if (bookingState.currentStep !== 6 || paymentResult !== 'SUCCESS') {
      return;
    }

    const eventId =
      String(bookingState.metaPurchaseEventId || '').trim() ||
      createMetaEventId('purchase');

    if (hasTrackedMetaPurchase(eventId)) {
      return;
    }

    const primaryGuest = bookingState.guests?.[0];
    const attribution = getStoredMetaAttribution();
    const planIdentifier = String(
      bookingState.selectedPlan?.planID ||
        bookingState.selectedPlan?.PlanID ||
        bookingState.selectedPlan?.id ||
        ''
    ).trim();

    trackMetaEvent(
      'Purchase',
      {
        value: Number(
          bookingState.selectedPlan?.OfferPrice ||
            bookingState.selectedPlan?.discountedPrice ||
            bookingState.selectedPlan?.PlanPrice ||
            0
        ),
        currency: 'INR',
        content_name:
          bookingState.selectedPlan?.PlanTitle ||
          bookingState.selectedPlan?.PlanName ||
          bookingState.selectedPlan?.title ||
          'Selected Plan',
        content_ids: planIdentifier ? [planIdentifier] : undefined,
        content_type: 'product',
        order_id: String(bookingState.bookingId || bookingState.paymentId || eventId),
        num_items: Number(bookingState.guests?.length || 1),
        event_source_url: window.location.href,
        external_id:
          attribution.externalId ||
          primaryGuest?.email ||
          primaryGuest?.phone ||
          '',
      },
      eventId
    );

    markMetaPurchaseTracked(eventId);

    if (!bookingState.metaPurchaseEventId) {
      setBookingState((prev) => ({
        ...prev,
        metaPurchaseEventId: eventId,
      }));
    }
  }, [bookingState, paymentResult]);

  const moveToStep = async (nextStepValue: number) => {
    setStepLoadingMessage(STEP_LOADING_COPY[nextStepValue] || 'Loading...');
    await waitForTransitionFrame();
    setBookingState((prev) => ({ ...prev, currentStep: nextStepValue }));
    scrollViewportToTop();
    window.setTimeout(() => setStepLoadingMessage(''), 220);
  };

  const nextStep = () => moveToStep(bookingState.currentStep + 1);

  const prevStep = () => moveToStep(Math.max(2, bookingState.currentStep - 1));

  const selectPlan = async (plan: Plan) => {
    setStepLoadingMessage(STEP_LOADING_COPY[3]);
    await waitForTransitionFrame();
    setBookingState((prev) => ({
      ...prev,
      selectedPlan: plan,
      currentStep: 3,
    }));
    scrollViewportToTop();
    window.setTimeout(() => setStepLoadingMessage(''), 220);
  };

 const handlePayment = async (
  success: boolean,
  bookingId?: string | number,
  paymentDetails?: PaymentConfirmationDetails
 ) => {
 if (success) {
    hasLocalPaymentSuccessRef.current = true;
    clearAutopayParamsFromUrl();
    setStepLoadingMessage(STEP_LOADING_COPY[6]);
    setPaymentResult('SUCCESS');
    setBookingState((prev) => ({
      ...prev,
      bookingId: bookingId ?? prev.bookingId,
      paymentId: paymentDetails?.paymentId || prev.paymentId || '',
      razorpayPaymentId:
        paymentDetails?.razorpayPaymentId || prev.razorpayPaymentId || '',
      razorpayOrderId:
        paymentDetails?.razorpayOrderId || prev.razorpayOrderId || '',
      razorpaySignature:
        paymentDetails?.razorpaySignature || prev.razorpaySignature || '',
      paymentSyncStatus:
        paymentDetails?.paymentSyncStatus || prev.paymentSyncStatus || 'pending',
      paymentSyncMessage:
        paymentDetails?.paymentSyncMessage || prev.paymentSyncMessage || '',
      backendPaymentStatus:
        paymentDetails?.backendPaymentStatus || prev.backendPaymentStatus || 'paid',
      metaPurchaseEventId:
        paymentDetails?.metaPurchaseEventId || prev.metaPurchaseEventId || '',
      bookingStatus: prev.bookingStatus || 'CONFIRMED',
      bookingStatusLabel: prev.bookingStatusLabel || 'Payment Received',
      bookingStatusMessage:
        prev.bookingStatusMessage ||
        'Your Razorpay payment was successful. We are finalizing your booking details.',
      currentStep: 6,
    }));
    window.setTimeout(() => setStepLoadingMessage(''), 220);

    if (!bookingId) {
      return;
    }

    storeBookingId(selectedEventId.toString(), bookingId);

    try {
      const allData = await getAllData(
        selectedEventId.toString(),
        String(bookingId)
      );
      const bookingPresentation = getBookingPresentationState(allData?.bookingData);
      setPaymentResult((prev) => {
        if (hasLocalPaymentSuccessRef.current && prev === 'SUCCESS') {
          return 'SUCCESS';
        }

        return bookingPresentation.paymentResult;
      });

      const bookingAtgDetails = getBookingAtgDetails(allData?.bookingData);

	    setBookingState((prev) => ({
	      ...prev,
	      bookingId: bookingId ?? prev.bookingId,
        guests: getBookingGuests(allData?.bookingData),
        primaryGuest: getBookingPrimaryGuest(allData?.bookingData),
        primaryGuestName: getBookingPrimaryGuest(allData?.bookingData).name,
        primaryGuestEmail: getBookingPrimaryGuest(allData?.bookingData).email,
        primaryGuestPhoneNumber:
          getBookingPrimaryGuest(allData?.bookingData).phoneNumber,
        is80GRequired: bookingAtgDetails.isAtgRequested || prev.is80GRequired,
        taxInfo: {
          ...prev.taxInfo,
          panNumber: bookingAtgDetails.panNumber || prev.taxInfo.panNumber,
          aadharNumber:
            bookingAtgDetails.aadharNumber || prev.taxInfo.aadharNumber || '',
          panFile: bookingAtgDetails.panFileUrl || prev.taxInfo.panFile || '',
          aadharFile:
            bookingAtgDetails.aadharFileUrl || prev.taxInfo.aadharFile || '',
        },
        atgDetails: bookingAtgDetails.atgDetails || prev.atgDetails,
        panNumber: bookingAtgDetails.panNumber || prev.panNumber || '',
        aadharNumber: bookingAtgDetails.aadharNumber || prev.aadharNumber || '',
        panFileUrl: bookingAtgDetails.panFileUrl || prev.panFileUrl || '',
        aadharFileUrl: bookingAtgDetails.aadharFileUrl || prev.aadharFileUrl || '',

	      // ✅ IMPORTANT: map both cases
	      ticketUrl:
        allData?.bookingData?.ticketUrl ||
        allData?.bookingData?.ticket_url ||
        '',

      invoiceUrl:
        allData?.bookingData?.invoiceUrl ||
        allData?.bookingData?.invoice_url ||
        '',

      completionCertificateUrl:
        allData?.bookingData?.completionCertificateUrl ||
        allData?.bookingData?.completion_certificate_url ||
        '',
      bookingStatus: bookingPresentation.bookingStatus,
      bookingStatusLabel: bookingPresentation.bookingStatusLabel,
      bookingStatusMessage: bookingPresentation.bookingStatusMessage,
      backendPaymentStatus: bookingPresentation.backendPaymentStatus,

      additionalAssets:
        allData?.bookingData?.additionalAssets || [],

      currentStep: 6,
    }));
    } catch (refreshError) {
      console.warn('Booking refresh after payment failed:', refreshError);
      setBookingState((prev) => ({
        ...prev,
        paymentSyncStatus:
          prev.paymentSyncStatus === 'synced' ? 'synced' : 'pending',
        paymentSyncMessage:
          prev.paymentSyncMessage ||
          'Payment was received. We are still refreshing your booking details.',
      }));
    }
  } else {
    hasLocalPaymentSuccessRef.current = false;
    setPaymentResult('FAILED');
    setBookingState((prev) => ({ ...prev, currentStep: 5 }));
    setStepLoadingMessage('');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--theme)] animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-bold">Loading Experience...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center">
          <h2 className="text-2xl font-black text-stone-900 mb-4">Oops!</h2>
          <p className="text-stone-500 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-stone-900 text-white px-8 py-3 rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

 const selectedEventId = Number(
  data?.eventData?.event?.EventID ||
  data?.eventData?.event?.id ||
  new URLSearchParams(window.location.search).get('id') ||
  0
);

const selectedPlanId = Number(
  (bookingState.selectedPlan as any)?.planID ||
  (bookingState.selectedPlan as any)?.PlanID ||
  (bookingState.selectedPlan as any)?.id ||
  0
);

const isPlanSelectionLoading =
  stepLoadingMessage === STEP_LOADING_COPY[2] ||
  (bookingState.currentStep === 2 && !(data?.plans || []).length);

  const renderStep = () => {
    switch (bookingState.currentStep) {
      case 1:
        return (
          <LandingPage
            event={data.eventData.event}
            schedules={data.eventData.schedules || []}
            mentors={data.eventData.mentors}
            plans={data.plans}
            insights={data.eventData.insights}
            ui={data.uiContent.landingPage}
            onProceed={nextStep}
          />
        );

      case 2:
       return (() => {
  console.log(
    'Plans passed to UI:',
    (data.plans || []).map((p: any) => ({
      title: p.PlanTitle,
      sequence: p.sequence,
    }))
  );

  return (
    <PlanSelection
      plans={data.plans}
      ui={data.uiContent.planSelection}
      onSelect={selectPlan}
      onBack={() => {}}
      isLoading={isPlanSelectionLoading}
    />
  );
})();

      case 3:
        return (
          <PlanDetail
            plan={bookingState.selectedPlan!}
            onProceed={(apiGuests) => {
              setBookingState((p) => ({
                ...p,
                guestsPayload: apiGuests,
              }));
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 4:
        return (
        <GuestForm
  guests={bookingState.guests}
  setGuests={(g) => setBookingState((p) => ({ ...p, guests: g }))}
  ui={data.uiContent.guestForm}
  roomTypes={data.plans || []}
  addons={data.addons || []}
  selectedEventId={selectedEventId}
  selectedPlanId={selectedPlanId}
  eventEndDate={
    data?.eventData?.event?.endDate ||
    data?.eventData?.event?.EndDate ||
    data?.eventData?.event?.eventEndDate ||
    data?.eventData?.event?.EventEndDate ||
    ''
  }
  onProceed={nextStep}
  onBack={prevStep}
/>
        );

      case 5:
        return (
          <BookingSummary
            bookingState={{ ...bookingState, plan: bookingState.selectedPlan }}
            setBookingState={setBookingState}
            ui={data.uiContent.bookingSummary}
            event={data.eventData.event}
            onConfirm={handlePayment}
            onBack={prevStep}
          />
        );

case 6:
        return (
          <PaymentStatus
            status={paymentResult}
            bookingState={bookingState}
            event={{ 
              ...data.eventData.event, 
              displayDate: `${formatDisplayDate(data.eventData.event.EventStartDate)} — ${formatDisplayDate(data.eventData.event.EventEndDate)}` 
            }}
            ui={data.uiContent.bookingSummary}
            onDashboard={() => setBookingState(prev => ({ ...prev, currentStep: 7 }))}
            onRetry={() => void retryBookingPayment('manual')}
            isRetrying={isRetryingPayment}
          />
        );

      case 7:
        return (
          <DownloadsDashboard
            bookingState={bookingState}
            // Inject the formatted date here as well
            event={{ 
              ...data.eventData.event, 
              displayDate: `${formatDisplayDate(data.eventData.event.EventStartDate)} — ${formatDisplayDate(data.eventData.event.EventEndDate)}` 
            }}
            ui={data.uiContent.bookingSummary}
          />
        );

        
      default:
        return (
          <PlanSelection
            plans={data.plans}
            ui={data.uiContent.planSelection}
            onSelect={selectPlan}
            onBack={() => {}}
            isLoading={isPlanSelectionLoading}
          />
        );
    }
  };

  const renderedStep = renderStep();

  return (
    <div className="min-h-screen bg-stone-50">
      {stepLoadingMessage ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-stone-900/35 backdrop-blur-[2px]">
          <div className="rounded-[28px] border border-stone-100 bg-white px-8 py-6 text-center shadow-2xl">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--theme)]" />
            <p className="text-sm font-black text-stone-900">{stepLoadingMessage}</p>
          </div>
        </div>
      ) : null}

      {bookingState.currentStep >= 2 && bookingState.currentStep < 6 && (
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            {bookingState.currentStep > 2 ? (
              <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
            ) : <div className="w-10" />}

            <div className="flex space-x-2">
              {[2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                    s <= bookingState.currentStep ? 'bg-[var(--theme)]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="w-10" />
          </div>
        </header>
      )}

      <main className="w-full overflow-x-hidden">{renderedStep}</main>

      <footer className="py-6 text-center text-gray-400 text-[10px] uppercase tracking-widest border-t bg-white">
        © 2026 Shreans Daga Foundation. Built for {data.eventData.event?.EventName || 'this event'}
        <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">
          Support: <a href="tel:9867666444" className="text-[var(--theme)] hover:underline">9867666444</a>
        </p>
      </footer>

      {/* Global WhatsApp Floating Button */}
      <a
        href="https://wa.me/919867666444?text=I%20need%20help%20with%20my%20booking"
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-4 right-4 z-[999] flex items-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 active:scale-95 hover:scale-110 sm:bottom-8 sm:right-8"
        aria-label="Contact Support on WhatsApp"
      >
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-500 ease-in-out group-hover:max-w-xs group-hover:pl-5 sm:inline-block">
          Chat with us
        </span>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] sm:h-14 sm:w-14">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current sm:h-8 sm:w-8" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </div>
      </a>
    </div>
  );
};

export default App;
