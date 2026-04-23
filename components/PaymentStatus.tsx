import React, { useEffect, useState } from 'react';
import { BookingState, EventData } from '../types';
import {
  CheckCircle,
  ArrowRight,
  Mail,
  X,
  ShieldCheck,
  Flower2,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface PaymentStatusProps {
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | null;
  bookingState: BookingState;
  event: EventData;
  ui: any;
  onDashboard: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  bookingState,
  event,
  ui,
  onDashboard,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const paymentUI = ui?.payment || {};
  const defaultStatusUI = {
    success: {
      title: 'Success!',
      desc: 'Booking confirmed.',
      emailSent: 'Email sent to',
      cta: 'Go to Dashboard',
    },
    pending: {
      title: 'Booking Pending',
      desc: 'Your payment was received and the booking is awaiting admin verification.',
      emailSent: 'Updates will be sent to',
      cta: 'Go to Dashboard',
    },
    failed: {
      title: 'Payment Failed',
      desc: 'Please try again.',
      cta: 'Retry',
    },
  };
  const statusUI = {
    ...defaultStatusUI,
    ...(paymentUI?.status || {}),
    success: {
      ...defaultStatusUI.success,
      ...(paymentUI?.status?.success || {}),
    },
    pending: {
      ...defaultStatusUI.pending,
      ...(paymentUI?.status?.pending || {}),
    },
    failed: {
      ...defaultStatusUI.failed,
      ...(paymentUI?.status?.failed || {}),
    },
  };

  useEffect(() => {
    if (status === 'SUCCESS') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'FAILED') {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-12">
          <X className="w-12 h-12" />
        </div>

        <h2 className="text-4xl font-black mb-4 tracking-tighter text-stone-900">
          {statusUI.failed.title}
        </h2>

        <p className="text-stone-500 mb-8 font-medium">
          {statusUI.failed.desc}
        </p>

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
  }

  const isPending = status === 'PENDING';
  const activeStatusUI = isPending ? statusUI.pending : statusUI.success;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 w-full animate-fadeIn pb-32">
      <div className="text-center mb-12">
        <div
          className={`w-28 h-28 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner relative ${
            isPending ? 'bg-amber-100 text-amber-500' : 'bg-teal-100 text-teal-500'
          }`}
        >
          <CheckCircle className="w-14 h-14" />
          {showConfetti && !isPending && (
            <div className="absolute -inset-4 pointer-events-none">
              <div className="absolute top-0 left-0 animate-ping opacity-20">
                <Sparkles className="w-8 h-8 text-teal-400" />
              </div>
              <div className="absolute bottom-0 right-0 animate-bounce opacity-20">
                <Flower2 className="w-6 h-6 text-teal-400" />
              </div>
            </div>
          )}
        </div>

        <h2 className="text-5xl font-black mb-3 tracking-tighter text-stone-900">
          {activeStatusUI.title}
        </h2>

        <p className="text-stone-500 text-lg font-medium">
          {activeStatusUI.desc}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <span
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm border shadow-sm ${
              isPending
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-teal-50 text-[var(--theme)] border-teal-100/50'
            }`}
          >
            <Mail className="w-4 h-4" />
            {activeStatusUI.emailSent} {bookingState.guests[0]?.email}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-stone-100 overflow-hidden border border-stone-100 mb-10">
        <div className="bg-stone-900 p-10 text-white relative">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">
                  Booking ID
                </span>
                <p className="text-2xl font-mono font-bold">
                  #{bookingState.bookingId || 'ZEN-CONFIRMED'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">
                  Reserved On
                </span>
                <p className="text-lg font-bold">
                  {new Date().toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})}
                </p>
              </div>
            </div>

            <h3 className="text-3xl font-black mb-2">
              {bookingState.selectedPlan?.title}
            </h3>

            <div className="flex flex-wrap gap-4 mt-4">
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/5">
                <Calendar className="w-4 h-4 text-teal-400" /> {event.date.split(/ to | - | — /).map(d => {
    const date = new Date(d.trim());
    return isNaN(date.getTime()) ? d : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace(/ /g, '-');
  }).join(' — ')}
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />{' '}
                {bookingState.bookingStatusLabel ||
                  (isPending ? 'Pending Verification' : 'Fully Confirmed')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-10">
          {bookingState.paymentId ? (
            <div className="mb-6 rounded-3xl border border-stone-100 bg-stone-50 p-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-stone-500">
                Payment Reference
              </h4>
              <p className="mt-2 break-all font-mono text-base font-black text-stone-900">
                {bookingState.paymentId}
              </p>
            </div>
          ) : null}

          {bookingState.paymentSyncStatus === 'pending' &&
          bookingState.paymentSyncMessage ? (
            <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-amber-700">
                Payment Sync Pending
              </h4>
              <p className="mt-2 text-sm font-medium leading-relaxed text-amber-900">
                {bookingState.paymentSyncMessage}
              </p>
            </div>
          ) : null}

          <div
            className={`rounded-3xl border p-6 ${
              isPending
                ? 'bg-amber-50 border-amber-200'
                : 'bg-teal-50 border-teal-100'
            }`}
          >
            <h4 className="text-lg font-black text-stone-900 mb-2">
              {isPending ? 'Verification In Progress' : 'Thank you for registering'}
            </h4>
            <p className="text-sm font-medium text-stone-600 leading-relaxed">
              {bookingState.bookingStatusMessage ||
                (isPending
                  ? 'Your payment is complete. Booking will be confirmed after admin confirms the verification process.'
                  : 'Your confirmation, invoice, and ticket will be sent to you via email within the next 48 hours.')}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onDashboard}
        className="w-full bg-[var(--theme)] text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-[var(--theme-dark)] transition-all shadow-xl shadow-[var(--theme-light)] group"
      >
        {activeStatusUI.cta}
        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default PaymentStatus;
