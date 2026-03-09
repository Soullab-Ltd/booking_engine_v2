import React, { useState, useMemo } from 'react';
import { BookingState, DiscountInfo, Guest, EventData } from '../types';
import { createBooking } from '../src/services/dataService';
import { CreditCard, ChevronLeft, Heart } from 'lucide-react';

interface BookingSummaryProps {
  bookingState: BookingState;
  event: EventData;
  ui: any;
  config: any;
  onConfirm: () => void;
  onBack: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ bookingState, event, ui, config, onConfirm, onBack }) => {
  const [expandedGuests, setExpandedGuests] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
    const tax = subtotal * (config?.TAX_RATE || 0.18);
    return { basePrice, subtotal, tax, total: subtotal + tax };
  }, [bookingState, config]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setCouponError('');

    try {
      const payload = {
        eventId: Number(event.id), // Dynamic ID from backend fetch
        planId: Number(bookingState.selectedPlan?.id?.toString().replace('p', '')) || 1,
        startDate: new Date(bookingState.guests[0]?.addOns?.extraStay?.startDate || Date.now()).toISOString(),
        endDate: new Date().toISOString(),
        guestsCount: bookingState.guests.length,
        grossAmount: Math.round(totals.subtotal),
        discountAmount: 0,
        totalAmount: Math.round(totals.total),
        paymentId: "MOCK_PAY_" + Date.now(),
        guests: bookingState.guests.map(g => ({
          name: g.name,
          email: g.email,
          phone_number: g.phone,
          age: Number(g.age),
          gender: "Male",
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

      const response = await createBooking(payload);

      if (response.bookingId) {
        // Simulated 2-second delay for processing effect
        setTimeout(() => {
          onConfirm();
        }, 2000);
      }
    } catch (err: any) {
      setCouponError("Submission Error: " + err.message);
      setIsProcessing(false);
    }
  };

  if (!bookingState || !bookingState.guests) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full animate-fadeIn pb-32">
      <div className="mb-10 bg-white rounded-[32px] overflow-hidden shadow-sm border border-stone-100">
        <div className="h-48 relative">
          <img src={event.banner} className="w-full h-full object-cover brightness-75" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent flex items-end p-8 text-white">
            <h2 className="text-3xl font-black">{event.title}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 p-8">
            <h4 className="text-lg font-bold flex items-center gap-2 mb-6"><Heart className="w-5 h-5 text-teal-700" /> Review Billing</h4>
            <div className="border border-stone-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-stone-50">
                  {bookingState.guests.map((g) => (
                    <tr key={g.id}>
                      <td className="px-6 py-4 font-bold">{g.name}<span className="block text-[10px] text-stone-400 font-normal">Base + Add-ons</span></td>
                      <td className="px-6 py-4 text-right">₹{(totals.basePrice + getGuestAddOnTotal(g)).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50/50">
                    <td className="px-6 py-3 text-xs font-bold text-stone-500 uppercase">Subtotal</td>
                    <td className="px-6 py-3 text-right font-bold">₹{totals.subtotal.toLocaleString()}</td>
                  </tr>
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
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-stone-100 sticky top-24">
            <h3 className="text-xl font-black mb-8">Confirm Booking</h3>
            <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl disabled:bg-stone-200">
              {isProcessing ? <><div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <><CreditCard className="w-6 h-6" /> Confirm & Pay</>}
            </button>
            {couponError && <p className="text-red-500 text-[10px] mt-4 font-bold text-center">{couponError}</p>}
          </div>
        </div>
      </div>
      <button onClick={onBack} className="mt-12 flex items-center gap-2 text-stone-400 hover:text-stone-900 font-black text-xs uppercase"><ChevronLeft className="w-5 h-5" /> Back</button>
    </div>
  );
};

export default BookingSummary;