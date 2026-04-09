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
} from 'lucide-react';

interface BookingSummaryProps {
  bookingState: BookingState;
  event: EventData;
  ui: any;
  config: any;
  onConfirm: (success: boolean, bookingId?: string | number) => void;
  onBack: () => void;
}

const getSafeId = (obj: any, keys: string[]): number => {
  for (const key of keys) {
    const rawValue = obj?.[key];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      const parsed = Number(rawValue);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return 0;
};

const BookingSummary: React.FC<BookingSummaryProps> = ({
  bookingState,
  event,
  ui,
  config,
  onConfirm,
  onBack,
}) => {
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [customCodeInput, setCustomCodeInput] = useState('');
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [customCodeError, setCustomCodeError] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToRefund, setAgreedToRefund] = useState(false);

  const [atgRequested, setAtgRequested] = useState(false);
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

  // --- New states for Coupon ID Logic ---
  const [couponFile, setCouponFile] = useState<File | null>(null);
  const [showCouponIdModal, setShowCouponIdModal] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<any | null>(null);

  const selectedEventId = useMemo(
    () => getSafeId(event, ['EventID', 'id']),
    [event]
  );

  const selectedPlanId = useMemo(
    () => getSafeId(bookingState.selectedPlan, ['planID', 'PlanID', 'id']),
    [bookingState.selectedPlan]
  );

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        if (!selectedEventId || !selectedPlanId) {
          console.warn('❌ Invalid IDs for coupon fetch', {
            selectedEventId,
            selectedPlanId,
            event,
            selectedPlan: bookingState.selectedPlan,
          });
          setAvailableCoupons([]);
          return;
        }

        const res = await fetch(
          `http://localhost:8081/coupons/applicable?eventId=${selectedEventId}&planId=${selectedPlanId}`
        );

        if (res.ok) {
          const data = await res.json();
          setAvailableCoupons(Array.isArray(data) ? data : []);
        } else {
          console.error('Coupon fetch failed:', res.status);
          setAvailableCoupons([]);
        }
      } catch (err) {
        console.error('API Error:', err);
        setAvailableCoupons([]);
      }
    };

    fetchCoupons();
  }, [selectedEventId, selectedPlanId, event, bookingState.selectedPlan]);

  const handleCheckCustomCode = async () => {
    if (!customCodeInput.trim()) return;

    setIsCheckingCode(true);
    setCustomCodeError('');

    try {
      if (!selectedEventId || !selectedPlanId) {
        throw new Error('Invalid event or plan');
      }

      const res = await fetch(
        `http://localhost:8081/coupons/validate?code=${customCodeInput
          .trim()
          .toUpperCase()}&eventId=${selectedEventId}&planId=${selectedPlanId}`
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Invalid coupon code');
      }

      const validatedCoupon = await res.json();

      setAvailableCoupons((prev) => {
        const exists = prev.find((c) => c.id === validatedCoupon.id);
        return exists ? prev : [validatedCoupon, ...prev];
      });

      // Instead of setAppliedCoupon, we use the new handler
      handleApplyCouponClick(validatedCoupon);
      setCustomCodeInput('');
    } catch (err: any) {
      setCustomCodeError(err.message);
    } finally {
      setIsCheckingCode(false);
    }
  };

  // --- Logic to check if Modal is needed ---
  const handleApplyCouponClick = (coupon: any) => {
    // Debug Log - Check your browser console
    console.log("Coupon Object:", coupon);

    if (appliedCoupon?.id === coupon.id) {
      setAppliedCoupon(null);
      setCouponFile(null); // Clear file if coupon is removed
      return;
    }

    // Comprehensive check for the flag (string "1", number 1, or boolean true)
    const needsId = coupon.requires_id_upload == 1 || 
                    coupon.requires_id_upload === true || 
                    String(coupon.requires_id_upload).toLowerCase() === 'true';

    if (needsId && !couponFile) {
      console.log("Opening ID Modal for:", coupon.code);
      setPendingCoupon(coupon);
      setShowCouponIdModal(true);
    } else {
      setAppliedCoupon(coupon);
    }
  };

  const confirmPendingCoupon = () => {
    if (couponFile) {
      setAppliedCoupon(pendingCoupon);
      setShowCouponIdModal(false);
      setPendingCoupon(null);
    }
  };

  const getGuestAddOnTotal = (guest: Guest) => {
    let total = 0;

    if ((guest as any).addOns?.selectedAddons) {
      (guest as any).addOns.selectedAddons.forEach((addon: any) => {
        total += Number(addon.price || 0);
      });
    }

    if ((guest as any).addOns?.extraStay?.enabled) {
      total +=
        Number((guest as any).addOns?.extraStay?.price || 0) *
        Number((guest as any).addOns?.extraStay?.days || 0);
    }

    return total;
  };

  const getGuestBreakdown = (guest: Guest, basePrice: number) => {
    const isKidsPlan =
      guest.isKidsPlanOpted || (guest.age >= 4 && guest.age <= 7);

    let displayBasePrice = basePrice;
    let baseLabel = 'BASE';

    if (guest.age <= 3) {
      displayBasePrice = 0;
      baseLabel = 'INFANT (FREE)';
    } else if (isKidsPlan) {
      displayBasePrice = 10000;
      baseLabel = 'KIDS EXPLORER PLAN';
    }

    const names = [baseLabel];
    const prices = [displayBasePrice.toLocaleString()];

    if ((guest as any).addOns?.selectedAddons) {
      (guest as any).addOns.selectedAddons.forEach((addon: any) => {
        names.push(addon.title.toUpperCase());
        prices.push(Number(addon.price || 0).toLocaleString());
      });
    }

    if ((guest as any).addOns?.extraStay?.enabled) {
      names.push('EXTRA STAY');
      const stayPrice =
        Number((guest as any).addOns?.extraStay?.price || 0) *
        Number((guest as any).addOns?.extraStay?.days || 0);
      prices.push(stayPrice.toLocaleString());
    }

    return {
      label: names.join(' + '),
      values: prices.join(' + '),
      guestTotal: displayBasePrice + getGuestAddOnTotal(guest),
    };
  };

  const totals = useMemo(() => {
    if (!bookingState || !bookingState.guests) {
      return {
        basePrice: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        discount: 0,
        gstRate: 0,
      };
    }

    const defaultPlanPrice =
      (bookingState.plan as any)?.OfferPrice ?? 
      (bookingState.plan as any)?.discountedPrice ?? 
      (bookingState.plan as any)?.finalPrice ??
      (bookingState.plan as any)?.PlanPrice ?? 
      0;

    const planGstType = (bookingState.plan as any)?.gstType;
    const planGstRate = (bookingState.plan as any)?.gstRate || 0;

    const subtotal = bookingState.guests.reduce((sum, g) => {
      let guestBase = defaultPlanPrice;

      if (g.age <= 3) {
        guestBase = 0;
      } else if (g.age >= 4 && g.age <= 7) {
        guestBase = 10000;
      } else if (g.age >= 8 && g.age <= 17 && g.isKidsPlanOpted) {
        guestBase = 10000;
      }

      return sum + guestBase + getGuestAddOnTotal(g);
    }, 0);

    let discount = 0;
    if (appliedCoupon) {
      const needsId = appliedCoupon.requires_id_upload == 1 || 
                      appliedCoupon.requires_id_upload === true ||
                      String(appliedCoupon.requires_id_upload).toLowerCase() === 'true';
      
      // If ID is required but no file is in our separate couponFile state, discount is 0
      if (needsId && !couponFile) {
        discount = 0;
      } else {
        const type = appliedCoupon.discountType || appliedCoupon.discount_type;
        discount =
          type === 'PERCENTAGE'
            ? (subtotal * Number(appliedCoupon.value)) / 100
            : Number(appliedCoupon.value);
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);

    const tax =
      planGstType === 'exclusive' && planGstRate > 0
        ? discountedSubtotal * (planGstRate / 100)
        : 0;

    return {
      basePrice: defaultPlanPrice,
      subtotal,
      tax,
      discount,
      total: discountedSubtotal + tax,
      gstRate: planGstRate,
    };
  }, [bookingState, config, appliedCoupon, couponFile]);

  const isFormValid = useMemo(() => {
    if (!agreedToTerms || !agreedToRefund) return false;

    // Check if ID is needed for applied coupon
    const needsCouponId = appliedCoupon?.requires_id_upload == 1 || 
                          appliedCoupon?.requires_id_upload === true || 
                          String(appliedCoupon?.requires_id_upload).toLowerCase() === 'true';
                          
    if (needsCouponId && !couponFile) return false;

    if (atgRequested) {
      const hasPan = atgData.pan.length === 10;
      const hasAadhar = atgData.aadhar.length >= 12;
      const hasFiles = atgFiles.pan !== null && atgFiles.aadhar !== null;

      if (!hasPan || !hasAadhar || !hasFiles) return false;
    }

    return true;
  }, [agreedToTerms, agreedToRefund, atgRequested, atgData, atgFiles, appliedCoupon, couponFile]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setCouponError('');

    try {
      if (!selectedEventId) {
        throw new Error('Invalid event selected');
      }

      if (!selectedPlanId) {
        throw new Error('Invalid plan selected');
      }

      const payload = {
        eventId: selectedEventId,
        planId: selectedPlanId,
        startDate: new Date(
          bookingState.guests[0]?.addOns?.extraStay?.startDate || Date.now()
        ).toISOString(),
        endDate: new Date().toISOString(),
        guestsCount: bookingState.guests.length,
        grossAmount: Math.round(totals.subtotal),
        discountAmount: Math.round(totals.discount),
        totalAmount: Math.round(totals.total),
        finalAmount: Math.round(totals.total),
        couponCode: appliedCoupon?.code || null,
        appliedDiscountId: appliedCoupon ? String(appliedCoupon.id) : null,
        paymentId: 'MOCK_PAY_' + Date.now(),
        isAtgRequested: atgRequested ? 1 : 0,
        panNumber: atgData.pan,
        aadharNumber: atgData.aadhar,
        guests: bookingState.guests.map((g) => ({
          name: g.name,
          email: g.email,
          phoneNumber: g.phone,
          gender: g.gender,
          state: g.state,
          city: g.city,
          country: g.country,
          age: Number(g.age),
          isKidsPlanOpted: g.isKidsPlanOpted ? 1 : 0,
          food_prefs: g.foodPreference,
          travel_asst: g.travelAssistance ? 'Yes' : 'No',
          remarks: g.remark || '',
          id_image_url: '',
        })),
        bookingAddons: bookingState.guests.flatMap((g: any) => 
          (g.addOns?.selectedAddons || []).map((a: any) => ({
            guest_ref_id: g.id,
            addon_id: Number(a.addonId),
            title: a.title,
            type: a.type,
            quantity: 1,
            unit_price: Number(a.price),
            total_amount: Number(a.price)
          }))
        ),
        stays: bookingState.guests
          .filter((g: any) => g.addOns?.extraStay?.enabled)
          .map((g: any) => ({
            guest_ref_id: g.id,
            plan_id: Number(g.addOns.extraStay.planId),
            plan_name: g.addOns.extraStay.type,
            start_date: g.addOns.extraStay.startDate,
            days: Number(g.addOns.extraStay.days),
            price_per_night: Number(g.addOns.extraStay.price),
            total_amount: Number(g.addOns.extraStay.price) * Number(g.addOns.extraStay.days)
          }))
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      
      // ATG Files
      if (atgFiles.pan) formData.append('panFile', atgFiles.pan);
      if (atgFiles.aadhar) formData.append('aadharFile', atgFiles.aadhar);
      
      // Separate Coupon Proof
      if (couponFile) formData.append('couponIdFile', couponFile);

      const responseRaw = await fetch('http://localhost:8081/bookings', {
        method: 'POST',
        body: formData,
      });

      if (!responseRaw.ok) {
        throw new Error('Server responded with an error');
      }

      const response = await responseRaw.json();

      const bId =
        response.bookingId ||
        response.data?.bookingId ||
        response.booking_id;

      if (bId) {
        setTimeout(() => onConfirm(true, bId), 2000);
      } else {
        onConfirm(false);
      }
    } catch (err: any) {
      console.error('❌ Payment Error:', err);
      setCouponError('Submission Error: ' + err.message);
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
            src={(event as any).banner}
            className="w-full h-full object-cover brightness-75"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent flex items-end p-8 text-white">
            <h2 className="text-3xl font-black">
              {(event as any).title || (event as any).EventName}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 p-8">
            <h4 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-teal-700" /> Review Billing
            </h4>
            <div className="border border-stone-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-stone-50">
                  {bookingState.guests.map((g: any, idx: number) => {
                    const breakdown = getGuestBreakdown(g, totals.basePrice);
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-5 align-top">
                          <span className="font-black text-stone-900">
                            {g.name}
                          </span>
                          <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1 italic">
                            {breakdown.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right align-top">
                          <span className="font-black text-stone-800 text-base">
                            ₹{breakdown.guestTotal.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-teal-600/70 font-bold mt-1">
                            {breakdown.values}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="bg-stone-50/50">
                    <td className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      Subtotal
                    </td>
                    <td className="px-6 py-4 text-right font-black text-stone-900 text-lg">
                      ₹{totals.subtotal.toLocaleString()}
                    </td>
                  </tr>

                  {totals.discount > 0 ? (
                    <tr className="bg-emerald-50/50">
                      <td className="px-6 py-4 font-black text-emerald-700 uppercase italic text-xs flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Coupon Discount (
                        {appliedCoupon?.code})
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-700 text-lg">
                        - ₹{totals.discount.toLocaleString()}
                      </td>
                    </tr>
                  ) : appliedCoupon && (appliedCoupon.requires_id_upload == 1 || appliedCoupon.requires_id_upload === true || String(appliedCoupon.requires_id_upload).toLowerCase() === "true") && (
                    <tr className="bg-amber-50/50">
                      <td colSpan={2} className="px-6 py-3 font-black text-amber-700 uppercase text-[10px] flex items-center gap-2 leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0" /> 
                        <span>Please click 'Apply' and upload proof to activate your {appliedCoupon.code} discount.</span>
                      </td>
                    </tr>
                  )}

                  <tr className="bg-white">
                    {totals.gstRate === 0 ||
                    (bookingState.plan as any)?.gstType === 'inclusive' ? (
                      <td
                        colSpan={2}
                        className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-left"
                      >
                        Prices inclusive of GST
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">
                          GST ({totals.gstRate}%)
                        </td>
                        <td className="px-6 py-4 text-right font-black text-stone-500 text-base">
                          ₹{totals.tax.toLocaleString()}
                        </td>
                      </>
                    )}
                  </tr>

                  <tr className="bg-stone-900 text-white font-black">
                    <td className="px-6 py-6 text-base uppercase tracking-wider">
                      Total Payable
                    </td>
                    <td className="px-6 py-6 text-right text-3xl text-teal-400">
                      ₹{totals.total.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black uppercase tracking-tight text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-700" /> Exclusive Offers
              </h4>
              {availableCoupons.length > 0 && (
                <span className="bg-teal-50 text-teal-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
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
                  onClick={handleCheckCustomCode}
                  disabled={isCheckingCode || !customCodeInput.trim()}
                  className="bg-stone-900 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:bg-stone-200 disabled:text-stone-400"
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

            <div className="grid grid-cols-1 gap-4">
              {availableCoupons.length > 0 ? (
                availableCoupons.map((coupon: any) => (
                  <div
                    key={coupon.id}
                    className={`p-5 rounded-[24px] border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      appliedCoupon?.id === coupon.id
                        ? 'border-teal-700 bg-teal-50/30 shadow-sm'
                        : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          appliedCoupon?.id === coupon.id
                            ? 'bg-teal-700 text-white'
                            : 'bg-white text-stone-400 shadow-sm'
                        }`}
                      >
                        <Tag className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-stone-900 uppercase tracking-tighter">
                            {coupon.code}
                          </span>
                          <span className="text-[10px] font-black text-teal-600 bg-white px-2 py-0.5 rounded-md border border-teal-100">
                            {(coupon.discountType || coupon.discount_type) ===
                            'PERCENTAGE'
                              ? `${Math.round(coupon.value)}% OFF`
                              : `₹${coupon.value} OFF`}
                          </span>
                        </div>
                        
                        {(coupon.requires_id_upload == 1 || coupon.requires_id_upload === true || String(coupon.requires_id_upload).toLowerCase() === "true") && (
                          <p className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" /> Identity Proof Required
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
                        appliedCoupon?.id === coupon.id
                          ? 'bg-stone-900 text-white shadow-lg'
                          : 'bg-white border-2 border-stone-200 text-stone-600 hover:border-teal-700 hover:text-teal-700'
                      }`}
                    >
                      {appliedCoupon?.id === coupon.id ? 'Remove' : 'Apply'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-stone-100 rounded-[24px]">
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest italic text-center w-full">
                    No active offers available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 p-8 space-y-4">
            <h4 className="text-sm font-black uppercase tracking-tight text-stone-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" /> Policy
              Agreements
            </h4>

            <div className="space-y-4">
              <label className="flex items-start gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-stone-300 text-teal-700 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-stone-600 leading-relaxed">
                  I accept the{' '}
                  <a
                    href="https://shreansdaga.org/terms-and-conditions/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 underline hover:text-teal-900"
                  >
                    terms and conditions
                  </a>{' '}
                  for this event.
                </span>
              </label>

              <label className="flex items-start gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToRefund}
                  onChange={(e) => setAgreedToRefund(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-stone-300 text-teal-700 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-stone-600 leading-relaxed">
                  I accept the{' '}
                  <a
                    href="https://shreansdaga.org/refund-cancellation-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 underline hover:text-teal-900"
                  >
                    refund policy
                  </a>{' '}
                  for this event.
                </span>
              </label>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-stone-50 transition-all text-left">
            <label className="flex cursor-pointer items-center gap-4 p-6 hover:bg-stone-100/50">
              <input
                type="checkbox"
                checked={atgRequested}
                onChange={(e) => setAtgRequested(e.target.checked)}
                className="h-6 w-6 rounded-lg border-2 border-stone-300 accent-teal-700 cursor-pointer"
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

            {atgRequested && (
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
                      className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 p-4 text-sm font-bold outline-none focus:border-teal-700"
                      value={atgData.pan}
                      onChange={(e) =>
                        setAtgData({
                          ...atgData,
                          pan: e.target.value.toUpperCase(),
                        })
                      }
                    />
                    <input
                      type="file"
                      id="pan-upload"
                      className="hidden"
                      onChange={(e) =>
                        setAtgFiles({
                          ...atgFiles,
                          pan: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <label
                      htmlFor="pan-upload"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-3 text-[11px] font-black uppercase text-stone-400 hover:border-teal-300 transition-all"
                    >
                      {atgFiles.pan ? `✅ Attached` : '📎 Attach PAN Copy'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 text-left">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">
                      Aadhar Card Details
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012"
                      maxLength={12}
                      className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 p-4 text-sm font-bold outline-none focus:border-teal-700"
                      value={atgData.aadhar}
                      onChange={(e) =>
                        setAtgData({
                          ...atgData,
                          aadhar: e.target.value,
                        })
                      }
                    />
                    <input
                      type="file"
                      id="aadhar-upload"
                      className="hidden"
                      onChange={(e) =>
                        setAtgFiles({
                          ...atgFiles,
                          aadhar: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <label
                      htmlFor="aadhar-upload"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-3 text-[11px] font-black uppercase text-stone-400 hover:border-teal-300 transition-all"
                    >
                      {atgFiles.aadhar ? `✅ Attached` : '📎 Attach Aadhar Copy'}
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
                  {bookingState.guests.length} Person(s)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5" /> Plan
                </span>
                <span className="text-xs font-black text-stone-900 uppercase tracking-tighter truncate max-w-[120px] text-right">
                  {(bookingState.plan as any)?.PlanTitle || 'Standard Plan'}
                </span>
              </div>
              <hr className="border-stone-200 border-dashed" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-black text-stone-900 uppercase tracking-tight">
                  Total Payable
                </span>
                <span className="text-xl font-black text-teal-700">
                  ₹{totals.total.toLocaleString()}
                </span>
              </div>
              <p className="text-[9px] font-bold text-stone-400 text-center uppercase tracking-widest">
                {totals.gstRate === 0 ||
                (bookingState.plan as any)?.gstType === 'inclusive'
                  ? 'Inclusive of all taxes'
                  : `Includes ${totals.gstRate}% GST`}
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing || !isFormValid}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl disabled:bg-stone-100 disabled:text-stone-300 transition-all active:scale-95 group"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />{' '}
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
                    {appliedCoupon?.requires_id_upload ? 'ID Proof Missing' : 'Form Incomplete'}
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

      {/* --- Identity Verification Modal --- */}
      {showCouponIdModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-900/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl animate-scaleUp">
            <div className="bg-teal-700 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tighter">Identity Verification</h3>
                <p className="text-[10px] font-bold uppercase text-teal-100 opacity-80">Required for {pendingCoupon?.code}</p>
              </div>
              <button 
                onClick={() => { setShowCouponIdModal(false); setPendingCoupon(null); setCouponFile(null); }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                   <UploadCloud className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-xs text-stone-500 font-medium leading-relaxed">
                  To apply this exclusive offer, please upload a valid identity proof (College ID / Govt ID).
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="file"
                  id="modal-coupon-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) setCouponFile(file);
                  }}
                />
                <label
                  htmlFor="modal-coupon-upload"
                  className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-[11px] font-black uppercase transition-all ${couponFile ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-stone-200 text-stone-400'}`}
                >
                  {couponFile ? `✅ ${couponFile.name}` : '📎 Select Identification File'}
                </label>
              </div>

              <button
                onClick={confirmPendingCoupon}
                disabled={!couponFile}
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