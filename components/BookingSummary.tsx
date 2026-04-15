import React, { useState, useMemo, useEffect } from 'react';
import { BookingState, Guest, EventData } from '../types';
import {
  CreditCard,
  ChevronLeft,
  Heart,
  Sparkles,
  Tag,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Ticket,
  UploadCloud,
  X,
  FileText,
} from 'lucide-react';

interface BookingSummaryProps {
  bookingState: BookingState;
  setBookingState: React.Dispatch<React.SetStateAction<BookingState>>;
  event: EventData;
  ui: any;
  onConfirm: (success: boolean, bookingId?: string | number) => void;
  onBack: () => void;
}

const KIDS_PLAN_PRICE = 10000;

const getSafeId = (obj: any, keys: string[]): number => {
  for (const key of keys) {
    const rawValue = obj?.[key];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      const parsed = Number(rawValue);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return 0;
};

const normalizeBooleanFlag = (value: any): boolean => {
  return Boolean(
    value === true ||
      value === 1 ||
      value === '1' ||
      String(value).toLowerCase() === 'true'
  );
};

const getCouponId = (coupon: any): string => {
  return String(coupon?.id ?? coupon?.couponId ?? '');
};

const getCouponCode = (coupon: any): string => {
  return String(coupon?.code ?? coupon?.couponCode ?? '');
};

const isPlanSoldOut = (plan: any): boolean => {
  if (plan?.isSoldOut === true) return true;
  if (plan?.isSoldOut === false) return false;

  const availableRooms = Number(
    plan?.availableRooms ?? plan?.inventory?.availableRooms
  );

  if (!Number.isNaN(availableRooms)) {
    return availableRooms <= 0;
  }

  return Number(plan?.remainingInventory ?? 0) <= 0;
};

const formatFieldLabel = (field: string): string => {
  return field
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getActionableBookingErrorMessage = (
  responseText: string,
  status: number
): string => {
  const trimmedText = String(responseText || '').trim();
  let parsed: any = null;

  try {
    parsed = trimmedText ? JSON.parse(trimmedText) : null;
  } catch {
    parsed = null;
  }

  const rawMessage =
    parsed?.message ||
    parsed?.error ||
    parsed?.details?.message ||
    trimmedText;

  const validationErrors = Array.isArray(parsed?.errors)
    ? parsed.errors
    : Array.isArray(parsed?.details?.errors)
    ? parsed.details.errors
    : [];

  const fieldErrors = validationErrors
    .map((item: any) => {
      const field = String(item?.field || item?.path || '').trim();
      const message = String(item?.message || item?.msg || '').trim();

      if (!field && !message) return '';
      if (!field) return message;
      if (!message) return `${formatFieldLabel(field)} is invalid.`;

      return `${formatFieldLabel(field)}: ${message}`;
    })
    .filter(Boolean);

  if (fieldErrors.length > 0) {
    return fieldErrors.join(' ');
  }

  const normalizedMessage = String(rawMessage || '').toLowerCase();

  if (normalizedMessage.includes('duplicate') || normalizedMessage.includes('already exists')) {
    return 'This booking looks like it was already submitted. Please wait a moment and check your booking status before trying again.';
  }

  if (
    normalizedMessage.includes('coupon') &&
    (normalizedMessage.includes('invalid') ||
      normalizedMessage.includes('expired') ||
      normalizedMessage.includes('not applicable'))
  ) {
    return 'The selected coupon could not be applied. Please remove it or try another valid coupon.';
  }

  if (
    normalizedMessage.includes('inventory') ||
    normalizedMessage.includes('availability') ||
    normalizedMessage.includes('sold out')
  ) {
    return 'This plan or add-on is no longer available in the requested quantity. Please go back and review availability.';
  }

  if (normalizedMessage.includes('guest')) {
    return rawMessage || 'Please review the guest details and correct any missing or invalid fields.';
  }

  if (status >= 500) {
    return 'We could not complete your booking right now. Please try again in a moment or contact support if the issue continues.';
  }

  if (rawMessage) {
    return rawMessage;
  }

  return 'We could not submit your booking. Please review your details and try again.';
};

const getIsoDateString = (value: any, label: string): string => {
  const raw = String(value || '').trim();

  if (!raw) {
    throw new Error(`${label} is missing. Please refresh the page and try again.`);
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} is invalid. Please refresh the page and try again.`);
  }

  return parsed.toISOString();
};

const BookingSummary: React.FC<BookingSummaryProps> = ({
  bookingState,
  setBookingState,
  event,
  ui,
  onConfirm,
  onBack,
}) => {
  const eventBanner =
    (event as any)?.banner ||
    'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1600&auto=format&fit=crop';
  const eventDescription =
    String((event as any)?.description || '').trim() ||
    'Event details will be updated soon. Please review your plan, guests, and booking details before payment.';

  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [customCodeInput, setCustomCodeInput] = useState('');
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [customCodeError, setCustomCodeError] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToRefund, setAgreedToRefund] = useState(false);

  const [is80GRequired, setIs80GRequired] = useState(false);
  const [atgData, setAtgData] = useState({ pan: '', aadhar: '' });
  const [atgFiles, setAtgFiles] = useState<{
    pan: File | null;
    aadhar: File | null;
  }>({
    pan: null,
    aadhar: null,
  });

  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  const [showCouponIdModal, setShowCouponIdModal] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<any | null>(null);

  const guests = bookingState?.guests || [];
  const couponIdProof = (bookingState as any)?.couponIdProof || null;
  const couponIdProofUrl = (bookingState as any)?.couponIdProofUrl || '';

  const selectedEventId = useMemo(
    () => getSafeId(event, ['EventID', 'id']),
    [event]
  );

  const selectedPlanId = useMemo(
    () =>
      getSafeId(
        (bookingState as any)?.selectedPlan || (bookingState as any)?.plan,
        ['planID', 'PlanID', 'id']
      ),
    [bookingState]
  );

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        if (!selectedEventId || !selectedPlanId) {
          setAvailableCoupons([]);
          return;
        }

        const res = await fetch(
          `http://localhost:4000/coupons/applicable?eventId=${selectedEventId}&planId=${selectedPlanId}`
        );

        if (!res.ok) {
          setAvailableCoupons([]);
          return;
        }

        const data = await res.json();
        const couponList = Array.isArray(data) ? data : [];
        setAvailableCoupons(couponList);

        const existingCode = String(
          (bookingState as any)?.couponCode || ''
        ).trim();

        if (existingCode) {
          const matched = couponList.find(
            (coupon: any) =>
              getCouponCode(coupon).toUpperCase() === existingCode.toUpperCase()
          );

          if (matched) {
            setAppliedCoupon((prev: any) => {
              if (
                prev &&
                getCouponCode(prev).toUpperCase() === existingCode.toUpperCase()
              ) {
                return prev;
              }
              return matched;
            });
          } else {
            setAppliedCoupon(null);
            setBookingState((prev: any) => ({
              ...prev,
              couponCode: '',
              appliedDiscountId: null,
              couponIdProof: null,
              couponIdProofUrl: '',
            }));
          }
        } else {
          setAppliedCoupon(null);
        }
      } catch (err) {
        console.error('Coupon fetch error:', err);
        setAvailableCoupons([]);
      }
    };

    fetchCoupons();
  }, [selectedEventId, selectedPlanId, (bookingState as any)?.couponCode]);

  const couponRequiresIdUpload = useMemo(() => {
    return normalizeBooleanFlag(
      appliedCoupon?.requiresIdUpload ?? appliedCoupon?.requires_id_upload
    );
  }, [appliedCoupon]);

  const onlyStudentOrService = useMemo(() => {
    return normalizeBooleanFlag(
      appliedCoupon?.onlyStudentOrService ??
        appliedCoupon?.only_student_or_service
    );
  }, [appliedCoupon]);
  const getCanonicalPlanPrice = (bookingState: any) => {
  const selectedPlan = bookingState?.selectedPlan || bookingState?.plan || {};

  return Math.max(0, Number(selectedPlan?.OfferPrice || 0));
};
 const defaultPlanPrice = useMemo(() => {
  return getCanonicalPlanPrice(bookingState);
}, [bookingState]);
  const selectedPlanTitle =
    (bookingState as any)?.plan?.PlanTitle ||
    (bookingState as any)?.plan?.PlanName ||
    (bookingState as any)?.selectedPlan?.PlanTitle ||
    (bookingState as any)?.selectedPlan?.PlanName ||
    'Standard Plan';

  const getGuestBasePrice = (guest: Guest | any, planPrice: number) => {
    const age = Number(guest?.age || 0);
    const isKidsPlanOpted = Boolean(guest?.isKidsPlanOpted);

    if (age <= 0) return 0;
    if (age <= 3) return 0;
    if (age >= 4 && age <= 7) return KIDS_PLAN_PRICE;
    if (age >= 8 && age <= 17 && isKidsPlanOpted) return KIDS_PLAN_PRICE;

    return planPrice;
  };

  const getGuestPricingLabel = (guest: Guest | any) => {
    const age = Number(guest?.age || 0);
    const isKidsPlanOpted = Boolean(guest?.isKidsPlanOpted);

    if (age <= 0) return 'Not selected';
    if (age <= 3) return 'Infant (Free)';
    if (age >= 4 && age <= 7) return 'Kids Explorer Plan';
    if (age >= 8 && age <= 17 && isKidsPlanOpted) return 'Kids Explorer Plan';
    if (age >= 8 && age <= 17) return 'Regular Plan';
    return 'Regular Plan';
  };

  const pricingBreakdown = useMemo(() => {
    let planTotal = 0;
    let addonsTotal = 0;
    let stayTotal = 0;

    const guestPricingDetails = guests.map((guest: any, index: number) => {
  const basePrice = getGuestBasePrice(guest, defaultPlanPrice);

  const actualPlanName =
    (bookingState as any)?.selectedPlan?.PlanTitle ||
    (bookingState as any)?.selectedPlan?.PlanName ||
    (bookingState as any)?.plan?.PlanTitle ||
    (bookingState as any)?.plan?.PlanName ||
    'Selected Plan';

  planTotal += basePrice;

  const addons: { id: string; title: string; price: number }[] = [];
  const stays: { id: string; title: string; price: number }[] = [];

  const selectedAddons = guest?.addOns?.selectedAddons || [];

  selectedAddons.forEach((addon: any, addonIndex: number) => {
    const unitPrice = Number(addon?.price || 0);
    const quantity = Number(addon?.quantity || 1);

    let addonTotal = 0;

    if (addon?.isPricePerNight) {
      const nights = Number(guest?.addOns?.extraStay?.days || 1);
      addonTotal = unitPrice * quantity * nights;
    } else {
      addonTotal = unitPrice * quantity;
    }

    addons.push({
      id: String(addon?.addonId || `${guest?.id || index}-${addonIndex}`),
      title: addon?.title || 'Add-on',
      price: addonTotal,
    });

    addonsTotal += addonTotal;
  });

  if (guest?.addOns?.extraStay?.enabled) {
    const days = Number(guest?.addOns?.extraStay?.days || 1);
    const pricePerNight = Number(
      guest?.addOns?.extraStay?.price ??
        guest?.addOns?.extraStay?.pricePerNight ??
        0
    );

    const extraStayAmount = days * pricePerNight;

    stays.push({
      id: `stay-${guest?.id || index}`,
      title: guest?.addOns?.extraStay?.type
        ? `Extra Stay - ${guest.addOns.extraStay.type}`
        : 'Extra Stay',
      price: extraStayAmount,
    });

    stayTotal += extraStayAmount;
  }

  return {
    guestId: String(guest?.id ?? index),
    guestName: guest?.name || `Guest ${index + 1}`,
    age: Number(guest?.age || 0),
    pricingLabel: actualPlanName,
    basePrice,
    addons,
    stays,
  };
});

    const grossAmount = planTotal + addonsTotal + stayTotal;

    let discountAmount = 0;

    if (appliedCoupon) {
      const uploadedFile = couponIdProof;
      const uploadedUrl = couponIdProofUrl;

      if (
        (couponRequiresIdUpload || onlyStudentOrService) &&
        !uploadedFile &&
        !uploadedUrl
      ) {
        discountAmount = 0;
      } else {
        const discountType =
          appliedCoupon?.discountType || appliedCoupon?.discount_type;

        if (discountType === 'PERCENTAGE') {
          discountAmount =
            (grossAmount * Number(appliedCoupon?.value || 0)) / 100;
        } else {
          discountAmount = Number(appliedCoupon?.value || 0);
        }
      }
    }

    discountAmount = Math.min(discountAmount, grossAmount);

    const totalAmount = Math.max(grossAmount - discountAmount, 0);

    return {
      guestPricingDetails,
      planTotal,
      addonsTotal,
      stayTotal,
      grossAmount,
      discountAmount,
      totalAmount,
    };
  }, [
    guests,
    defaultPlanPrice,
    appliedCoupon,
    couponRequiresIdUpload,
    onlyStudentOrService,
    couponIdProof,
    couponIdProofUrl,
  ]);

  useEffect(() => {
    setBookingState((prev: any) => ({
      ...prev,
      guestsCount: guests.length,
      grossAmount: pricingBreakdown.grossAmount,
      discountAmount: pricingBreakdown.discountAmount,
      totalAmount: pricingBreakdown.totalAmount,
      addOnsAmount: pricingBreakdown.addonsTotal,
      stayAmount: pricingBreakdown.stayTotal,
      finalAmount: pricingBreakdown.totalAmount,
      couponCode: appliedCoupon ? getCouponCode(appliedCoupon) : '',
      appliedDiscountId: appliedCoupon ? getCouponId(appliedCoupon) : null,
    }));
  }, [
    guests.length,
    pricingBreakdown.grossAmount,
    pricingBreakdown.discountAmount,
    pricingBreakdown.totalAmount,
    pricingBreakdown.addonsTotal,
    pricingBreakdown.stayTotal,
    appliedCoupon,
    setBookingState,
  ], [is80GRequired, setBookingState]);

  const handleCheckCustomCode = async () => {
    if (!customCodeInput.trim()) return;

    setIsCheckingCode(true);
    setCustomCodeError('');

    try {
      if (!selectedEventId || !selectedPlanId) {
        throw new Error('Invalid event or plan');
      }

      const code = customCodeInput.trim().toUpperCase();

      const res = await fetch(
        `http://localhost:4000/coupons/validate?code=${code}&eventId=${selectedEventId}&planId=${selectedPlanId}`
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Invalid coupon code');
      }

      const validatedCoupon = data;

      setAvailableCoupons((prev) => {
        const exists = prev.find(
          (coupon: any) => getCouponId(coupon) === getCouponId(validatedCoupon)
        );
        return exists ? prev : [validatedCoupon, ...prev];
      });

      handleApplyCouponClick(validatedCoupon);
      setCustomCodeInput('');
    } catch (err: any) {
      setCustomCodeError(err?.message || 'Failed to validate coupon');
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleCouponIdUpload = (file: File | null) => {
    if (!file) return;

    setBookingState((prev: any) => ({
      ...prev,
      couponIdProof: file,
    }));
  };

  const handleApplyCouponClick = (coupon: any) => {
    const currentCouponId = getCouponId(appliedCoupon);
    const nextCouponId = getCouponId(coupon);

    const isSameCoupon =
      currentCouponId !== '' &&
      nextCouponId !== '' &&
      currentCouponId === nextCouponId;

    if (isSameCoupon) {
      setAppliedCoupon(null);
      setPendingCoupon(null);
      setShowCouponIdModal(false);

      setBookingState((prev: any) => ({
        ...prev,
        couponCode: '',
        appliedDiscountId: null,
        couponIdProof: null,
        couponIdProofUrl: '',
      }));

      return;
    }

    const requiresId = normalizeBooleanFlag(
      coupon?.requiresIdUpload ?? coupon?.requires_id_upload
    );

    const existingProof =
      (bookingState as any)?.couponIdProof ||
      (bookingState as any)?.couponIdProofUrl;

    if (requiresId && !existingProof) {
      setPendingCoupon(coupon);
      setShowCouponIdModal(true);
      return;
    }

    setAppliedCoupon(coupon);

    setBookingState((prev: any) => ({
      ...prev,
      couponCode: getCouponCode(coupon),
      appliedDiscountId: getCouponId(coupon) || null,
    }));
  };

  const confirmPendingCoupon = () => {
    const uploadedFile = (bookingState as any)?.couponIdProof;
    const uploadedUrl = (bookingState as any)?.couponIdProofUrl;

    if (!uploadedFile && !uploadedUrl) return;
    if (!pendingCoupon) return;

    setAppliedCoupon(pendingCoupon);

    setBookingState((prev: any) => ({
      ...prev,
      couponCode: getCouponCode(pendingCoupon),
      appliedDiscountId: getCouponId(pendingCoupon) || null,
    }));

    setShowCouponIdModal(false);
    setPendingCoupon(null);
  };

  const isFormValid = useMemo(() => {
    if (!agreedToTerms || !agreedToRefund) return false;

    const uploadedFile = couponIdProof;
    const uploadedUrl = couponIdProofUrl;

    if (
      (couponRequiresIdUpload || onlyStudentOrService) &&
      !uploadedFile &&
      !uploadedUrl
    ) {
      return false;
    }

    if (is80GRequired) {
      const hasPan = atgData.pan.length === 10;
      const hasAadhar = atgData.aadhar.length >= 12;
      const hasFiles = atgFiles.pan !== null && atgFiles.aadhar !== null;

      if (!hasPan || !hasAadhar || !hasFiles) return false;
    }

    return true;
  }, [
    agreedToTerms,
    agreedToRefund,
    is80GRequired,
    atgData,
    atgFiles,
    couponRequiresIdUpload,
    onlyStudentOrService,
    couponIdProof,
    couponIdProofUrl,
  ]);

const handlePayment = async () => {
  setIsProcessing(true);
  setCouponError('');

  try {
    if (!selectedEventId) throw new Error('Invalid event selected');
    if (!selectedPlanId) throw new Error('Invalid plan selected');
    if (isPlanSoldOut((bookingState as any)?.selectedPlan || (bookingState as any)?.plan)) {
      throw new Error('This plan is sold out. Please go back and choose another available plan.');
    }

    const guestsPayload = guests.map((g: any) => ({
      id: String(g.id || '').trim(),
      name: String(g.name || '').trim(),
      email: String(g.email || '').trim(),
      phoneNumber: String(g.phone || g.phoneNumber || '').trim(),
      gender: String(g.gender || '').trim(),
      state: String(g.state || '').trim(),
      city: String(g.city || '').trim(),
      country: String(g.country || '').trim(),
      age: Number(g.age || 0),
      isKidsPlanOpted: Boolean(g.isKidsPlanOpted),
      foodPrefs: String(g.foodPreference || g.foodPrefs || 'Regular').trim(),
      travelAsst:
        g.travelAssistance === true || g.travelAsst === 'Yes' ? 'Yes' : 'No',
      remarks: String(g.remark || g.remarks || '').trim(),
      idImageUrl: String(g.idImageUrl || '').trim(),
    }));

    for (const [index, g] of guestsPayload.entries()) {
      if (!g.name) throw new Error(`Guest ${index + 1}: name is required`);
      if (!g.email) throw new Error(`Guest ${index + 1}: email is required`);
      if (!g.phoneNumber) throw new Error(`Guest ${index + 1}: phone number is required`);
      if (!g.gender) throw new Error(`Guest ${index + 1}: gender is required`);
      if (!Number.isFinite(g.age) || g.age < 1 || g.age > 120) {
        throw new Error(`Guest ${index + 1}: invalid age`);
      }

      if ('EventID' in (g as any) || 'EventName' in (g as any) || 'banner' in (g as any)) {
        throw new Error(`Guest ${index + 1}: invalid event data found in guest payload`);
      }
    }

    const bookingAddonsPayload = guests.flatMap((g: any) =>
      (g.addOns?.selectedAddons || []).map((a: any) => ({
        guest_ref_id: g.id,
        addon_id: Number(a.addonId),
        title: String(a.title || '').trim(),
        type: String(a.type || '').trim(),
        quantity: Number(a.quantity || 1),
        unit_price: Number(a.price || 0),
        total_amount: Number(a.price || 0) * Number(a.quantity || 1),
      }))
    );

    const staysPayload = guests
      .filter((g: any) => g.addOns?.extraStay?.enabled)
      .map((g: any) => ({
        guest_ref_id: g.id,
        plan_id: Number(g.addOns.extraStay.planId),
        plan_name: String(g.addOns.extraStay.type || '').trim(),
        room_type: String(g.addOns.extraStay.type || '').trim(),
        start_date: g.addOns.extraStay.startDate,
        end_date: g.addOns.extraStay.endDate || null,
        days: Number(g.addOns.extraStay.days || 1),
        price_per_night: Number(g.addOns.extraStay.price || 0),
        total_amount:
          Number(g.addOns.extraStay.price || 0) *
          Number(g.addOns.extraStay.days || 1),
      }));

    const resolvedStartDate =
      staysPayload[0]?.start_date ||
      (bookingState as any)?.startDate ||
      (event as any)?.startDate ||
      (event as any)?.EventStartDate;

    const resolvedEndDate =
      staysPayload[0]?.end_date ||
      (bookingState as any)?.endDate ||
      (event as any)?.endDate ||
      (event as any)?.EventEndDate ||
      resolvedStartDate;

    const payload = {
      eventId: selectedEventId,
      planId: selectedPlanId,
      startDate: getIsoDateString(resolvedStartDate, 'Start date'),
      endDate: getIsoDateString(resolvedEndDate, 'End date'),
      guestsCount: guestsPayload.length,
      grossAmount: Math.round(pricingBreakdown.grossAmount),
      discountAmount: Math.round(pricingBreakdown.discountAmount),
      totalAmount: Math.round(pricingBreakdown.totalAmount),
      finalAmount: Math.round(pricingBreakdown.totalAmount),
      addOnsAmount: Math.round(pricingBreakdown.addonsTotal),
      stayAmount: Math.round(pricingBreakdown.stayTotal),
      couponCode: appliedCoupon ? getCouponCode(appliedCoupon) : null,
      appliedDiscountId: appliedCoupon ? getCouponId(appliedCoupon) : null,
      paymentId: 'MOCK_PAY_' + Date.now(),
      isAtgRequested: is80GRequired ? 1 : 0,
      panNumber: atgData.pan || '',
      aadharNumber: atgData.aadhar || '',
      guests: guestsPayload,
      bookingAddons: bookingAddonsPayload,
      stays: staysPayload,
    };

    console.log('🚀 FINAL BOOKING PAYLOAD:', JSON.stringify(payload, null, 2));

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    if (atgFiles.pan) formData.append('panFile', atgFiles.pan);
    if (atgFiles.aadhar) formData.append('aadharFile', atgFiles.aadhar);

    if ((bookingState as any)?.couponIdProof) {
      formData.append('couponIdProofFile', (bookingState as any).couponIdProof);
    }

    const responseRaw = await fetch('http://localhost:4000/bookings', {
      method: 'POST',
      body: formData,
    });

    const responseText = await responseRaw.text();

    if (!responseRaw.ok) {
      console.error('❌ Booking API error response:', responseText);
      throw new Error(
        getActionableBookingErrorMessage(responseText, responseRaw.status)
      );
    }

    const response = JSON.parse(responseText);

    const bookingId =
      response?.bookingId ||
      response?.data?.bookingId ||
      response?.booking_id;

    if (bookingId) {
      setTimeout(() => onConfirm(true, bookingId), 1500);
    } else {
      onConfirm(false);
    }
  } catch (err: any) {
    console.error('Payment Error:', err);
    setCouponError(
      err?.message || 'We could not submit your booking. Please try again.'
    );
    setIsProcessing(false);
  }
};

  if (!bookingState || !bookingState.guests) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full animate-fadeIn pb-32 text-left">
      <div className="mb-10 bg-white rounded-[32px] overflow-hidden shadow-sm border border-stone-100">
        <div className="h-48 relative">
          <img
            src={eventBanner}
            className="w-full h-full object-cover brightness-75"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent flex items-end p-8 text-white">
            <div>
              <h2 className="text-3xl font-black">
                {(event as any).title || (event as any).EventName}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium text-stone-100/90 line-clamp-2">
                {eventDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 p-8">
            <h4 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-[var(--theme)]" /> Review Billing
            </h4>

            <div className="border border-stone-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-stone-50">
                  {pricingBreakdown.guestPricingDetails.map((guest) => {
                    const addonStayLabelParts = [
                      guest.pricingLabel.toUpperCase(),
                      ...guest.addons.map((addon) => addon.title.toUpperCase()),
                      ...guest.stays.map((stay) => stay.title.toUpperCase()),
                    ];

                    const addonStayValueParts = [
                      guest.basePrice.toLocaleString(),
                      ...guest.addons.map((addon) => addon.price.toLocaleString()),
                      ...guest.stays.map((stay) => stay.price.toLocaleString()),
                    ];

                    const guestTotal =
                      guest.basePrice +
                      guest.addons.reduce((sum, item) => sum + item.price, 0) +
                      guest.stays.reduce((sum, item) => sum + item.price, 0);

                    return (
                      <tr key={guest.guestId}>
                        <td className="px-6 py-5 align-top">
                          <span className="font-black text-stone-900">
                            {guest.guestName}
                          </span>
                          <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1 italic">
                            {addonStayLabelParts.join(' + ')}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right align-top">
                          <span className="font-black text-stone-800 text-base">
                            ₹{guestTotal.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-[var(--theme)]/70 font-bold mt-1">
                            {addonStayValueParts.join(' + ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="bg-stone-50/50">
                    <td className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      Plan Amount
                    </td>
                    <td className="px-6 py-4 text-right font-black text-stone-900">
                      ₹{pricingBreakdown.planTotal.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="bg-stone-50/50">
                    <td className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      Add-ons Amount
                    </td>
                    <td className="px-6 py-4 text-right font-black text-stone-900">
                      ₹{pricingBreakdown.addonsTotal.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="bg-stone-50/50">
                    <td className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      Stay Amount
                    </td>
                    <td className="px-6 py-4 text-right font-black text-stone-900">
                      ₹{pricingBreakdown.stayTotal.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="bg-stone-50/50">
                    <td className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      Gross Amount
                    </td>
                    <td className="px-6 py-4 text-right font-black text-stone-900 text-lg">
                      ₹{pricingBreakdown.grossAmount.toLocaleString()}
                    </td>
                  </tr>

                  {pricingBreakdown.discountAmount > 0 ? (
                    <tr className="bg-emerald-50/50">
                      <td className="px-6 py-4 font-black text-emerald-700 uppercase italic text-xs flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        Discount Applied ({getCouponCode(appliedCoupon)})
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-700 text-lg">
                        - ₹{pricingBreakdown.discountAmount.toLocaleString()}
                      </td>
                    </tr>
                  ) : appliedCoupon &&
                    (couponRequiresIdUpload || onlyStudentOrService) &&
                    !couponIdProof &&
                    !couponIdProofUrl ? (
                    <tr className="bg-amber-50/50">
                      <td
                        colSpan={2}
                        className="px-6 py-3 font-black text-amber-700 uppercase text-[10px] flex items-center gap-2 leading-relaxed"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>
                          Please upload ID proof to activate your{' '}
                          {getCouponCode(appliedCoupon)} discount.
                        </span>
                      </td>
                    </tr>
                  ) : null}

                  <tr className="bg-stone-900 text-white font-black">
                    <td className="px-6 py-6 text-base uppercase tracking-wider">
                      Total Payable
                    </td>
                    <td className="px-6 py-6 text-right text-3xl text-teal-400">
                      ₹{pricingBreakdown.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black uppercase tracking-tight text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--theme)]" /> Exclusive Offers
              </h4>

              {availableCoupons.length > 0 && (
                <span className="bg-teal-50 text-[var(--theme)] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {availableCoupons.length} Savings Found
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div
                className={`flex items-center gap-2 p-1.5 rounded-2xl border-2 transition-all ${
                  customCodeError
                    ? 'border-red-200 bg-red-50'
                    : 'border-stone-100 bg-stone-50 focus-within:border-teal-600 focus-within:bg-white'
                }`}
              >
                <div className="pl-3">
                  <Ticket
                    className={`w-5 h-5 ${
                      customCodeError ? 'text-red-400' : 'text-stone-400'
                    }`}
                  />
                </div>

                <input
                  type="text"
                  value={customCodeInput}
                  onChange={(e) => {
                    setCustomCodeInput(e.target.value.toUpperCase());
                    setCustomCodeError('');
                  }}
                  placeholder="HAVE A PROMO CODE? ENTER HERE"
                  className="flex-1 bg-transparent border-none outline-none font-black text-xs tracking-tighter text-stone-900 placeholder:text-stone-300 py-3"
                />

                <button
                  type="button"
                  onClick={handleCheckCustomCode}
                  disabled={isCheckingCode || !customCodeInput.trim()}
                  className="bg-stone-900 hover:bg-[var(--theme)] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {isCheckingCode ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {customCodeError && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {customCodeError}
                </p>
              )}
            </div>

            {couponIdProofUrl && !couponIdProof && (
              <div className="rounded-xl border border-amber-200 bg-white p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Existing ID Proof
                </p>

                <img
                  src={couponIdProofUrl}
                  alt="Existing ID Proof"
                  className="max-h-72 w-full max-w-md rounded-lg border object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />

                <a
                  href={couponIdProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-indigo-600 underline"
                >
                  View Full File
                </a>
              </div>
            )}

            {couponIdProof && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <FileText size={16} />
                  <span>{couponIdProof.name}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {availableCoupons.length > 0 ? (
                availableCoupons.map((coupon: any) => {
                  const requiresId = normalizeBooleanFlag(
                    coupon?.requiresIdUpload ?? coupon?.requires_id_upload
                  );

                  const isCouponApplied =
                    getCouponId(appliedCoupon) !== '' &&
                    getCouponId(appliedCoupon) === getCouponId(coupon);

                  return (
                    <div
                      key={getCouponId(coupon) || getCouponCode(coupon)}
                      className={`p-5 rounded-[24px] border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                        isCouponApplied
                          ? 'border-[var(--theme)] bg-teal-50/30 shadow-sm'
                          : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            isCouponApplied
                              ? 'bg-[var(--theme)] text-white'
                              : 'bg-white text-stone-400 shadow-sm'
                          }`}
                        >
                          <Tag className="w-6 h-6" />
                        </div>

                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-900 uppercase tracking-tighter">
                              {getCouponCode(coupon)}
                            </span>
                            <span className="text-[10px] font-black text-[var(--theme)] bg-white px-2 py-0.5 rounded-md border border-teal-100">
                              {(coupon.discountType || coupon.discount_type) ===
                              'PERCENTAGE'
                                ? `${Math.round(Number(coupon.value || 0))}% OFF`
                                : `₹${coupon.value} OFF`}
                            </span>
                          </div>

                          {requiresId && (
                            <p className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              Identity Proof Required
                            </p>
                          )}

                          <p className="text-stone-500 text-[11px] font-medium truncate mt-0.5">
                            {coupon.description || coupon.title}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyCouponClick(coupon)}
                        className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                          isCouponApplied
                            ? 'bg-stone-900 text-white shadow-lg'
                            : 'bg-white border-2 border-stone-200 text-stone-600 hover:border-[var(--theme)] hover:text-[var(--theme)]'
                        }`}
                      >
                        {isCouponApplied ? 'Remove' : 'Apply'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-stone-100 rounded-[24px]">
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest italic text-center w-full">
                    No active offers available
                  </p>
                </div>
              )}
            </div>
          </div>

        
          <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-stone-50 transition-all text-left">
            <label className="flex cursor-pointer items-center gap-4 p-6 hover:bg-stone-100/50">
              <input
                type="checkbox"
                checked={is80GRequired}
                onChange={(e) => setIs80GRequired(e.target.checked)}
                className="h-6 w-6 rounded-lg border-2 border-stone-300 accent-[var(--theme)] cursor-pointer"
              />
              <div className="flex-1 text-left">
                <h4 className="text-sm font-black uppercase tracking-tight text-stone-900">
                  Request 80G Tax Exemption
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Requires valid PAN & Aadhar documents
                </p>
              </div>
            </label>

            {is80GRequired && (
              <div className="border-t border-stone-200 bg-white p-6 animate-slideUp">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-3 text-left">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">
                      PAN Card Details
                    </label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 p-4 text-sm font-bold outline-none focus:border-[var(--theme)]"
                      value={atgData.pan}
                      onChange={(e) =>
                        setAtgData((prev) => ({
                          ...prev,
                          pan: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                    <input
                      type="file"
                      id="pan-upload"
                      className="hidden"
                      onChange={(e) =>
                        setAtgFiles((prev) => ({
                          ...prev,
                          pan: e.target.files?.[0] || null,
                        }))
                      }
                    />
                    <label
                      htmlFor="pan-upload"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-3 text-[11px] font-black uppercase text-stone-400 hover:border-teal-300 transition-all"
                    >
                      {atgFiles.pan ? '✅ Attached' : '📎 Attach PAN Copy'}
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 text-left">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">
                      Aadhar Card Details
                    </label>
                    <input
                      type="text"
                      placeholder="123456789012"
                      maxLength={12}
                      className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 p-4 text-sm font-bold outline-none focus:border-[var(--theme)]"
                      value={atgData.aadhar}
                      onChange={(e) =>
                        setAtgData((prev) => ({
                          ...prev,
                          aadhar: e.target.value.replace(/\D/g, ''),
                        }))
                      }
                    />
                    <input
                      type="file"
                      id="aadhar-upload"
                      className="hidden"
                      onChange={(e) =>
                        setAtgFiles((prev) => ({
                          ...prev,
                          aadhar: e.target.files?.[0] || null,
                        }))
                      }
                    />
                    <label
                      htmlFor="aadhar-upload"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-3 text-[11px] font-black uppercase text-stone-400 hover:border-teal-300 transition-all"
                    >
                      {atgFiles.aadhar ? '✅ Attached' : '📎 Attach Aadhar Copy'}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-stone-100 lg:sticky lg:top-24 space-y-6">
            <div className="space-y-1 text-left">
              <h3 className="text-xl font-black uppercase tracking-tighter text-stone-900">
                Checkout Summary
              </h3>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Final review before payment
              </p>
            </div>

            <div className="bg-stone-50 rounded-3xl p-5 space-y-4 border border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Guests
                </span>
                <span className="text-xs font-black text-stone-900 uppercase tracking-tighter">
                  {guests.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5" /> Plan
                </span>
                <span className="text-xs font-black text-stone-900 uppercase tracking-tighter truncate max-w-[140px] text-right">
                  {selectedPlanTitle}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Plan Price
                </span>
                <span className="text-xs font-black text-stone-900">
                  ₹{defaultPlanPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Plan Amount
                </span>
                <span className="text-xs font-black text-stone-900">
                  ₹{pricingBreakdown.planTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Add-ons Amount
                </span>
                <span className="text-xs font-black text-stone-900">
                  ₹{pricingBreakdown.addonsTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Stay Amount
                </span>
                <span className="text-xs font-black text-stone-900">
                  ₹{pricingBreakdown.stayTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Gross Amount
                </span>
                <span className="text-xs font-black text-stone-900">
                  ₹{pricingBreakdown.grossAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Discount Applied
                </span>
                <span className="text-xs font-black text-emerald-700">
                  - ₹{pricingBreakdown.discountAmount.toLocaleString()}
                </span>
              </div>

              <hr className="border-stone-200 border-dashed" />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-black text-stone-900 uppercase tracking-tight">
                  Total Payable
                </span>
                <span className="text-xl font-black text-[var(--theme)]">
                  ₹{pricingBreakdown.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-stone-100 bg-white p-5">
              <h4 className="text-sm font-black uppercase tracking-tight text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--theme)]" /> Policy Agreements
              </h4>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-stone-300 text-[var(--theme)] focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-stone-600 leading-relaxed">
                  I accept the{' '}
                  <a
                    href="https://shreansdaga.org/terms-and-conditions/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--theme)] underline hover:text-teal-900"
                  >
                    terms and conditions
                  </a>
                  .
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToRefund}
                  onChange={(e) => setAgreedToRefund(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-stone-300 text-[var(--theme)] focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-stone-600 leading-relaxed">
                  I accept the{' '}
                  <a
                    href="https://shreansdaga.org/refund-cancellation-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--theme)] underline hover:text-teal-900"
                  >
                    refund policy
                  </a>
                  .
                </span>
              </label>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing || !isFormValid}
              className="w-full bg-[var(--theme)] hover:bg-[var(--theme-dark)] text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl disabled:bg-stone-100 disabled:text-stone-300 transition-all active:scale-95 group"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  <span className="uppercase tracking-widest text-xs">
                    Confirm & Pay
                  </span>
                </>
              )}
            </button>

            <div className="pt-2 space-y-2.5 text-left">
              <div className="flex items-center gap-2">
                {agreedToTerms && agreedToRefund ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-stone-300" />
                )}
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    agreedToTerms && agreedToRefund
                      ? 'text-emerald-600'
                      : 'text-stone-400'
                  }`}
                >
                  Policy Acceptance
                </span>
              </div>

              {isFormValid ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    Form Complete
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-stone-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {(couponRequiresIdUpload || onlyStudentOrService) &&
                    !couponIdProof &&
                    !couponIdProofUrl
                      ? 'ID Proof Missing'
                      : !agreedToTerms || !agreedToRefund
                      ? 'Accept Policies'
                      : 'Form Incomplete'}
                  </span>
                </div>
              )}
            </div>

            {couponError && (
              <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-500 text-[10px] font-bold text-center leading-tight">
                  {couponError}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-12 flex items-center gap-2 text-stone-400 hover:text-stone-900 font-black text-xs uppercase tracking-widest transition-colors"
      >
        <ChevronLeft className="w-5 h-5" /> Back
      </button>

      {showCouponIdModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-900/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl animate-scaleUp">
            <div className="bg-[var(--theme)] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tighter">
                  Identity Verification
                </h3>
                <p className="text-[10px] font-bold uppercase text-teal-100 opacity-80">
                  Required for {getCouponCode(pendingCoupon)}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCouponIdModal(false);
                  setPendingCoupon(null);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-[var(--theme)]" />
                </div>

                <p className="text-xs text-stone-500 font-medium leading-relaxed">
                  To apply this exclusive offer, please upload a valid identity proof
                  (College ID / Govt ID).
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="file"
                  id="modal-coupon-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleCouponIdUpload(file);
                  }}
                />

                <label
                  htmlFor="modal-coupon-upload"
                  className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-[11px] font-black uppercase transition-all ${
                    couponIdProof || couponIdProofUrl
                      ? 'border-[var(--theme)] bg-teal-50 text-[var(--theme)]'
                      : 'border-stone-200 text-stone-400'
                  }`}
                >
                  {couponIdProof
                    ? `✅ ${couponIdProof.name}`
                    : couponIdProofUrl
                    ? '✅ Existing ID Proof Attached'
                    : '📎 Select Identification File'}
                </label>
              </div>

              <button
                onClick={confirmPendingCoupon}
                disabled={!couponIdProof && !couponIdProofUrl}
                className="w-full rounded-2xl bg-stone-900 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all disabled:bg-stone-200 disabled:text-stone-400"
              >
                Verify & Apply Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
