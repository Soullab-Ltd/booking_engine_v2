import React, { useState, useMemo, useEffect } from 'react';
import { BookingState, DiscountInfo, Guest, EventData } from '../types';
import { createBooking } from '../src/services/dataService';
import { CreditCard, ChevronLeft, Heart, Sparkles, Tag } from 'lucide-react';

interface BookingSummaryProps {
  bookingState: BookingState;
  event: EventData;
  ui: any;
  config: any;
  onConfirm: (success: boolean, bookingId?: string | number) => void;
  onBack: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ bookingState, event, ui, config, onConfirm, onBack }) => {
  const [expandedGuests, setExpandedGuests] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [atgRequested, setAtgRequested] = React.useState(false);
const [atgData, setAtgData] = React.useState({ pan: '', aadhar: '' });
const [atgFiles, setAtgFiles] = React.useState<{ pan: File | null; aadhar: File | null }>({ 
  pan: null, 
  aadhar: null 
});
const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);



React.useEffect(() => {
  const fetchCoupons = async () => {
    try {
      const eId = event.id;
      // We clean the plan ID (removing 'p' if it exists) to match the DB
      const pId = bookingState.selectedPlan?.id?.toString().replace(/[^\d]/g, '');
      
      const res = await fetch(`http://localhost:8081/coupons/applicable?eventId=${eId}&planId=${pId}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableCoupons(data);
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  };
  fetchCoupons();
}, [event.id, bookingState.selectedPlan]);




  const getGuestAddOnTotal = (guest: Guest) => {
    let total = 0;
    if (guest.addOns.foodPass) total += config?.ADDONS?.FOOD_PASS || 2500;
    if (guest.addOns.adventurePass) total += config?.ADDONS?.ADVENTURE_PASS || 5000;
    if (guest.addOns.extraStay.enabled && config?.ROOM_TYPES) {
      const room = config.ROOM_TYPES.find((r: any) => r.name === guest.addOns.extraStay.type);
      if (room) total += room.price * guest.addOns.extraStay.days;
    }
    return total;
  };

  const totals = useMemo(() => {
    if (!bookingState || !bookingState.guests) return { basePrice: 0, subtotal: 0, tax: 0, total: 0 };
    const basePrice = bookingState.plan?.finalPrice || 0;
    const totalAddOns = bookingState.guests.reduce((sum, g) => sum + getGuestAddOnTotal(g), 0);


const subtotal = (basePrice * bookingState.guests.length) + totalAddOns;

  let discount = 0;
  if (appliedCoupon) {
    // Logic: If PERCENTAGE, divide by 100. If FLAT, just take the value.
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * Number(appliedCoupon.value)) / 100;
    } else {
      discount = Number(appliedCoupon.value);
    }
  }

  // New subtotal after discount
  const discountedSubtotal = Math.max(0, subtotal - discount);
  
  // Tax is now calculated on the LOWER price
  const tax = discountedSubtotal * (config?.TAX_RATE || 0.18);
  
  return { 
    basePrice, 
    subtotal, 
    tax, 
    discount, 
    total: discountedSubtotal + tax 
  };
  }, [bookingState, config, appliedCoupon]);

const handlePayment = async () => {
  setIsProcessing(true);
  setCouponError('');

  try {
    const payload = {
      eventId: Number(event.id),
      planId: Number(bookingState.selectedPlan?.id?.toString().replace(/[^\d]/g, '')) || 1,
      startDate: new Date(bookingState.guests[0]?.addOns?.extraStay?.startDate || Date.now()).toISOString(),
      endDate: new Date().toISOString(),
      guestsCount: bookingState.guests.length,
      
      // Updated Amounts
      grossAmount: Math.round(totals.subtotal),
      discountAmount: Math.round(totals.discount), 
      totalAmount: Math.round(totals.total),
      finalAmount: Math.round(totals.total),
      
      // Coupon Details
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      appliedDiscountId: appliedCoupon ? String(appliedCoupon.id) : null,
      
      paymentId: "MOCK_PAY_" + Date.now(),
      
      // ATG Info
      isAtgRequested: atgRequested ? 1 : 0,
      panNumber: atgData.pan,
      aadharNumber: atgData.aadhar,

      guests: bookingState.guests.map(g => ({
        name: g.name,
        email: g.email,
        phoneNumber: g.phone,
        gender: g.gender,
        state: g.state,
        city: g.city,
        age: Number(g.age),
        food_prefs: g.foodPreference,
        travel_asst: g.travelAssistance ? "Yes" : "No",
        remarks: g.remark || "",
        id_image_url: ""
      })),
      addon: {
        adultPassQty: bookingState.guests.filter(g => g.addOns.foodPass).length,
        kidPassQty: 0,
        adultSeasonQty: bookingState.guests.filter(g => g.addOns.adventurePass).length,
      }
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    if (atgFiles.pan) formData.append('panFile', atgFiles.pan);
    if (atgFiles.aadhar) formData.append('aadharFile', atgFiles.aadhar);

    const responseRaw = await fetch('http://localhost:8081/bookings', {
      method: 'POST',
      body: formData,
    });

    if (!responseRaw.ok) throw new Error('Server responded with an error');

    const response = await responseRaw.json();
    const bId = response.bookingId || response.data?.bookingId || response.booking_id;

    if (bId) {
      setTimeout(() => {
        onConfirm(true, bId);
      }, 2000);
    } else {
      onConfirm(false);
    }
  } catch (err: any) {
    setCouponError("Submission Error: " + err.message);
    setIsProcessing(false);
  }
};

  if (!bookingState || !bookingState.guests) return <div className="p-20 text-center">Loading...</div>;

  return (
  <div className="max-w-5xl mx-auto px-4 py-12 w-full animate-fadeIn pb-32 text-left">
    {/* Banner Header */}
    <div className="mb-10 bg-white rounded-[32px] overflow-hidden shadow-sm border border-stone-100">
      <div className="h-48 relative">
        <img src={event.banner} className="w-full h-full object-cover brightness-75" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent flex items-end p-8 text-white">
          <h2 className="text-3xl font-black">{event.title}</h2>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* LEFT COLUMN - Span 8 */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* SECTION 1: Review Billing (Top) */}
        <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 p-8">
          <h4 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-teal-700" /> Review Billing
          </h4>
          <div className="border border-stone-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-stone-50">
                {bookingState.guests.map((g: any) => (
                  <tr key={g.id}>
                    <td className="px-6 py-4 font-bold">{g.name}<span className="block text-[10px] text-stone-400 font-normal">Base + Add-ons</span></td>
                    <td className="px-6 py-4 text-right">₹{(totals.basePrice + getGuestAddOnTotal(g)).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-stone-50/50">
                  <td className="px-6 py-3 text-xs font-bold text-stone-500 uppercase">Subtotal</td>
                  <td className="px-6 py-3 text-right font-bold">₹{totals.subtotal.toLocaleString()}</td>
                </tr>

                {/* DYNAMIC DISCOUNT ROW */}
                {totals.discount > 0 && (
                  <tr className="bg-emerald-50/50">
                    <td className="px-6 py-4 font-black text-emerald-700 uppercase italic text-xs">
                      <span className="flex items-center gap-2"><Tag className="w-3 h-3" /> Coupon Discount ({appliedCoupon?.code})</span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-700">- ₹{totals.discount.toLocaleString()}</td>
                  </tr>
                )}

                <tr className="bg-white">
                  <td className="px-6 py-3 text-xs font-bold text-stone-400 uppercase">GST (18%)</td>
                  <td className="px-6 py-3 text-right font-bold text-stone-500">₹{totals.tax.toLocaleString()}</td>
                </tr>
                <tr className="bg-stone-900 text-white font-black">
                  <td className="px-6 py-5">Total Payable</td>
                  <td className="px-6 py-5 text-right text-2xl text-teal-400">₹{totals.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: EXCLUSIVE OFFERS (Middle) */}
        <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-black uppercase tracking-tight text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-700" /> Exclusive Offers
            </h4>
            {availableCoupons.length > 0 && (
              <span className="bg-teal-50 text-teal-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                {availableCoupons.length} Savings Found
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {availableCoupons.length > 0 ? (
              availableCoupons.map((coupon: any) => (
                <div 
                  key={coupon.id} 
                  className={`p-5 rounded-[24px] border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    appliedCoupon?.id === coupon.id 
                    ? 'border-teal-700 bg-teal-50/30' 
                    : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${appliedCoupon?.id === coupon.id ? 'bg-teal-700 text-white' : 'bg-white text-stone-400 shadow-sm'}`}>
                      <Tag className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-stone-900 uppercase tracking-tighter">{coupon.code}</span>
                        <span className="text-[10px] font-black text-teal-600 bg-white px-2 py-0.5 rounded-md border border-teal-100">
                           {coupon.discountType === 'PERCENTAGE' || coupon.discount_type === 'PERCENTAGE' 
                              ? `${Math.round(coupon.value)}% OFF` 
                              : `₹${coupon.value} OFF`}
                        </span>
                      </div>
                      <p className="text-stone-500 text-[11px] font-medium truncate mt-0.5">{coupon.description || coupon.title}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(appliedCoupon?.id === coupon.id ? null : coupon)}
                    className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                      appliedCoupon?.id === coupon.id
                      ? 'bg-stone-900 text-white shadow-lg'
                      : 'bg-white border-2 border-stone-200 text-stone-600 hover:border-teal-700 hover:text-teal-700 shadow-sm'
                    }`}
                  >
                    {appliedCoupon?.id === coupon.id ? 'Remove' : 'Apply'}
                  </button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center border-2 border-dashed border-stone-100 rounded-[24px]">
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest italic">No coupons available for this selection</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: ATG FORM (Bottom) */}
        <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-stone-50 transition-all">
          <label className="flex cursor-pointer items-center gap-4 p-6 hover:bg-stone-100/50">
            <input 
              type="checkbox" 
              checked={atgRequested}
              onChange={(e) => setAtgRequested(e.target.checked)}
              className="h-6 w-6 rounded-lg border-2 border-stone-300 accent-teal-700 cursor-pointer"
            />
            <div className="flex-1 text-left">
              <h4 className="text-sm font-black uppercase tracking-tight text-stone-900">Request 80G Tax Exemption</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Requires valid PAN & Aadhar documents</p>
            </div>
          </label>

          {atgRequested && (
            <div className="border-t border-stone-200 bg-white p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-3 text-left">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">PAN Card Details</label>
                  <input 
                    type="text" 
                    placeholder="ABCDE1234F"
                    className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 p-4 text-sm font-bold outline-none"
                    value={atgData.pan}
                    onChange={e => setAtgData({...atgData, pan: e.target.value.toUpperCase()})}
                  />
                  <input type="file" id="pan-upload" className="hidden" onChange={e => setAtgFiles({...atgFiles, pan: e.target.files?.[0] || null})} />
                  <label htmlFor="pan-upload" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-3 text-[11px] font-black uppercase text-stone-400">
                    {atgFiles.pan ? `✅ Attached` : '📎 Attach PAN Copy'}
                  </label>
                </div>

                <div className="flex flex-col gap-3 text-left">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">Aadhar Card Details</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012"
                    className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 p-4 text-sm font-bold outline-none"
                    value={atgData.aadhar}
                    onChange={e => setAtgData({...atgData, aadhar: e.target.value})}
                  />
                  <input type="file" id="aadhar-upload" className="hidden" onChange={e => setAtgFiles({...atgFiles, aadhar: e.target.files?.[0] || null})} />
                  <label htmlFor="aadhar-upload" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-3 text-[11px] font-black uppercase text-stone-400">
                    {atgFiles.aadhar ? `✅ Attached` : '📎 Attach Aadhar Copy'}
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-4">
        <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-stone-100 lg:sticky lg:top-24">
          <h3 className="text-xl font-black mb-8 text-left">Confirm Booking</h3>
          <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl disabled:bg-stone-200 transition-all">
            {isProcessing ? 'Processing...' : <><CreditCard className="w-6 h-6" /> Confirm & Pay</>}
          </button>
          {couponError && <p className="text-red-500 text-[10px] mt-4 font-bold text-center">{couponError}</p>}
        </div>
      </div>
    </div>

    <button onClick={onBack} className="mt-12 flex items-center gap-2 text-stone-400 hover:text-stone-900 font-black text-xs uppercase">
      <ChevronLeft className="w-5 h-5" /> Back
    </button>
  </div>
);
};

export default BookingSummary;
