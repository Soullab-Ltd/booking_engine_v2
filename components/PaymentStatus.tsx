import React, { useEffect, useState } from 'react';
import { BookingState, EventData } from '../types';
import { 
  CheckCircle, 
  ArrowRight, 
  Mail, 
  Ticket, 
  X, 
  FileCheck, 
  ShieldCheck, 
  Flower2, 
  Clock, 
  Sparkles,
  FileText,
  Download,
  Calendar
} from 'lucide-react';

interface PaymentStatusProps {
  success: boolean;
  bookingState: BookingState;
  event: EventData;
  ui: any;
  onDashboard: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ success, bookingState, event, ui, onDashboard }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // SAFETY GUARD: If App.tsx passes ui.bookingSummary as 'ui', 
  // we extract the payment object safely.
  const paymentUI = ui?.payment || {};
  const statusUI = paymentUI?.status || {
      success: { title: "Success!", desc: "Booking confirmed.", emailSent: "Email sent to", cta: "Go to Dashboard" },
      failed: { title: "Payment Failed", desc: "Please try again.", cta: "Retry" }
  };

  useEffect(() => {
    if (success) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!success) return (
    <div className="max-w-md mx-auto py-24 px-6 text-center animate-fadeIn">
      <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-12">
        <X className="w-12 h-12" />
      </div>
      <h2 className="text-4xl font-black mb-4 tracking-tighter text-stone-900">{statusUI.failed.title}</h2>
      <p className="text-stone-50 mb-8 font-medium">{statusUI.failed.desc}</p>
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
        >
          {statusUI.failed.cta}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 w-full animate-fadeIn pb-32">
      <div className="text-center mb-12">
        <div className="w-28 h-28 bg-emerald-100 text-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner relative">
          <CheckCircle className="w-14 h-14" />
          {showConfetti && (
            <div className="absolute -inset-4 pointer-events-none">
               <div className="absolute top-0 left-0 animate-ping opacity-20"><Sparkles className="w-8 h-8 text-emerald-400" /></div>
               <div className="absolute bottom-0 right-0 animate-bounce opacity-20"><Flower2 className="w-6 h-6 text-emerald-400" /></div>
            </div>
          )}
        </div>
        <h2 className="text-5xl font-black mb-3 tracking-tighter text-stone-900">{statusUI.success.title}</h2>
        <p className="text-stone-500 text-lg font-medium">{statusUI.success.desc}</p>
        
        <div className="mt-8 flex flex-col items-center gap-3">
           <span className="flex items-center gap-2 bg-teal-50 text-teal-700 px-5 py-2.5 rounded-2xl font-bold text-sm border border-teal-100/50 shadow-sm">
             <Mail className="w-4 h-4" /> {statusUI.success.emailSent} {bookingState.guests[0]?.email}
           </span>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-stone-100 overflow-hidden border border-stone-100 mb-10">
        <div className="bg-stone-900 p-10 text-white relative">
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-10">
               <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Booking ID</span>
                 <p className="text-2xl font-mono font-bold">#ZEN-CONFIRMED</p>
               </div>
               <div className="text-right">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Reserved On</span>
                 <p className="text-lg font-bold">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
               </div>
             </div>
             <h3 className="text-3xl font-black mb-2">{bookingState.selectedPlan?.title}</h3>
             <div className="flex flex-wrap gap-4 mt-4">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/5"><Calendar className="w-4 h-4 text-teal-400" /> {event.date}</span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/5"><ShieldCheck className="w-4 h-4 text-teal-400" /> Fully Confirmed</span>
             </div>
          </div>
        </div>
        
        <div className="p-10">
          <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-6">Documents</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-stone-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <Ticket className="w-5 h-5 text-teal-700" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-stone-900">E-Ticket PDF</span>
                  <span className="block text-[9px] text-stone-400 font-bold uppercase">Ready</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-stone-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <FileText className="w-5 h-5 text-teal-700" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-stone-900">Invoice PDF</span>
                  <span className="block text-[9px] text-stone-400 font-bold uppercase">Generated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onDashboard}
        className="w-full bg-teal-700 text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-teal-800 transition-all shadow-xl shadow-teal-100 group"
      >
        {statusUI.success.cta} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default PaymentStatus;