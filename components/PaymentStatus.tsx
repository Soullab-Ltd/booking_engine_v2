
import React, { useEffect, useState } from 'react';
import { BookingState, EventData } from '../types';
import { 
  CheckCircle, 
  ArrowRight, 
  Download, 
  Mail, 
  FileText,
  Calendar,
  Ticket,
  X,
  FileCheck,
  ShieldCheck,
  Flower2,
  Clock,
  Sparkles
} from 'lucide-react';

interface PaymentStatusProps {
  success: boolean;
  bookingState: BookingState;
  event: EventData;
  ui: any;
  onDashboard: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  success,
  bookingState,
  event,
  ui,
  onDashboard,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const statusUi = ui?.status || ui?.payment?.status || {};
  const successUi = statusUi?.success || {};
  const failedUi = statusUi?.failed || {};
  const guests = bookingState?.guests || [];
  const firstGuest = guests[0];
  const selectedPlan = bookingState?.plan || bookingState?.selectedPlan || null;

  useEffect(() => {
    if (success) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!success) {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-12">
          <X className="w-12 h-12" />
        </div>

        <h2 className="text-4xl font-black mb-4 tracking-tighter text-stone-900">
          {failedUi?.title || "Payment Failed"}
        </h2>

        <p className="text-stone-500 mb-8 font-medium">
          {failedUi?.desc || "We couldn’t complete your payment."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
          >
            {failedUi?.cta || "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 w-full animate-fadeIn pb-32">
      <div className="text-center mb-12">
        <div className="w-28 h-28 bg-emerald-100 text-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-200 relative">
          <CheckCircle className="w-14 h-14" />
          {showConfetti && (
            <div className="absolute -inset-4 pointer-events-none">
              <div className="absolute top-0 left-0 animate-ping opacity-20">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="absolute bottom-0 right-0 animate-bounce opacity-20">
                <Flower2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          )}
        </div>

        <h2 className="text-5xl font-black mb-3 tracking-tighter text-stone-900">
          {successUi?.title || "Payment Successful"}
        </h2>

        <p className="text-stone-500 text-lg font-medium">
          {successUi?.desc || "Your booking has been confirmed."}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <span className="flex items-center gap-2 bg-teal-50 text-teal-700 px-5 py-2.5 rounded-2xl font-bold text-sm border border-teal-100/50 shadow-sm">
            <Mail className="w-4 h-4" />
            {successUi?.emailSent || "Confirmation sent to"} {firstGuest?.email || ""}
          </span>

          {bookingState?.is80GRequired && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl max-w-sm animate-slideUp">
              <p className="flex items-center justify-center gap-2 text-amber-700 font-black text-[10px] uppercase tracking-widest mb-1">
                <FileCheck className="w-4 h-4" />
                {successUi?.taxReceipt?.title || "80G Receipt"}
              </p>
              <p className="text-[10px] text-amber-600 font-medium leading-tight">
                {successUi?.taxReceipt?.desc || "It will be shared after verification."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-stone-100 overflow-hidden border border-stone-100 mb-10">
        <div className="bg-stone-900 p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Ticket className="w-40 h-40" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">
                  Booking ID
                </span>
                <p className="text-2xl font-mono font-bold">
                  #ZEN-2025-Q{Math.floor(100 + Math.random() * 900)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">
                  Reserved On
                </span>
                <p className="text-lg font-bold">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <h3 className="text-3xl font-black mb-2">
              {selectedPlan?.title || selectedPlan?.PlanTitle || "Selected Plan"}
            </h3>

            <div className="flex flex-wrap gap-4 mt-4">
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/5">
                <Calendar className="w-4 h-4 text-teal-400" /> {event?.date || ""}
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/5">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Fully Confirmed
              </span>
            </div>
          </div>
        </div>

        <div className="p-10">
          <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-6">
            Downloadable Documents
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-between p-5 rounded-2xl border-2 border-stone-50 hover:border-teal-100 hover:bg-teal-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-50 rounded-xl group-hover:bg-white transition-all">
                  <Ticket className="w-5 h-5 text-teal-700" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-stone-900">E-Ticket PDF</span>
                  <span className="block text-[9px] text-stone-400 font-bold uppercase">
                    Ready to download
                  </span>
                </div>
              </div>
              <Download className="w-4 h-4 text-stone-300 group-hover:text-teal-700" />
            </button>

            <button className="flex items-center justify-between p-5 rounded-2xl border-2 border-stone-50 hover:border-teal-100 hover:bg-teal-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-50 rounded-xl group-hover:bg-white transition-all">
                  <FileText className="w-5 h-5 text-teal-700" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-stone-900">Invoice PDF</span>
                  <span className="block text-[9px] text-stone-400 font-bold uppercase">
                    Tax Compliant
                  </span>
                </div>
              </div>
              <Download className="w-4 h-4 text-stone-300 group-hover:text-teal-700" />
            </button>

            {bookingState?.is80GRequired && (
              <div className="col-span-1 sm:col-span-2 p-5 rounded-2xl bg-amber-50/50 border-2 border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black text-stone-900">80G Receipt</span>
                    <span className="block text-[9px] text-stone-500 font-bold uppercase">
                      Will be emailed 2-3 days post-event
                    </span>
                  </div>
                </div>
                <span className="text-[8px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-md uppercase tracking-widest">
                  Processing
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onDashboard}
          className="w-full bg-teal-700 text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-teal-800 transition-all shadow-xl shadow-teal-100 hover:scale-[1.01] active:scale-[0.99] group"
        >
          {successUi?.cta || "Go to Dashboard"}{" "}
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default PaymentStatus;
