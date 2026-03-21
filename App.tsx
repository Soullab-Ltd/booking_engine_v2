import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import { createEmptyGuest } from './constants';
import { BookingState, Guest, Plan } from './types';
import { getAllData, EventResponse, UIContent, AppConfig } from './src/services/dataService';

import LandingPage from './components/LandingPage';
import PlanSelection from './components/PlanSelection';
import PlanDetail from './components/PlanDetail';
import GuestForm from './components/GuestForm';
import BookingSummary from './components/BookingSummary';
import PaymentStatus from './components/PaymentStatus';
import DownloadsDashboard from './components/DownloadsDashboard';

const App: React.FC = () => {
  const [data, setData] = useState<{
    eventData: EventResponse;
    plans: Plan[];
    uiContent: UIContent;
    config: AppConfig;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookingState, setBookingState] = useState<BookingState>({
    currentStep: 1,
    selectedPlan: null,
    guests: [createEmptyGuest()],
    discounts: { type: 'NONE', amount: 0 },
    is80GRequired: false,
    taxInfo: { panNumber: "", fullName: "", address: "" },
    bookingId: undefined
  });

  const [paymentResult, setPaymentResult] = useState<'SUCCESS' | 'FAILED' | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      console.log("🚀 Starting data fetch...");

      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('id') || '41';

      console.log("📌 Event ID:", eventId);

      const allData = await getAllData(eventId);

      console.log("✅ API Response:", allData);

      setData(allData);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError('Failed to load event data. Please ensure the URL is correct.');
    } finally {
      console.log("🏁 Data fetch completed");
      setLoading(false);
    }
  };

  loadData();
}, []);

  const nextStep = () => setBookingState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  const prevStep = () => setBookingState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));

  const selectPlan = (plan: Plan) => {
    setBookingState(prev => ({ ...prev, selectedPlan: plan, currentStep: 3 }));
  };

  const handlePayment = (success: boolean, bookingId?: string | number) => {
  if (success) {
    setPaymentResult('SUCCESS');
    setBookingState(prev => ({
      ...prev,
      bookingId: bookingId ?? prev.bookingId,
      currentStep: 6
    }));
  } else {
    setPaymentResult('FAILED');
    setBookingState(prev => ({ ...prev, currentStep: 5 }));
  }
};

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
        <p className="text-stone-600 font-bold">Loading Experience...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center">
        <h2 className="text-2xl font-black text-stone-900 mb-4">Oops!</h2>
        <p className="text-stone-500 mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-stone-900 text-white px-8 py-3 rounded-xl">Retry</button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (bookingState.currentStep) {
      case 1:
        return <LandingPage
    event={data.eventData.event}
    schedules={data.eventData.schedules}
    mentors={data.eventData.mentors}
      plans={data.plans} 
    insights={data.eventData.insights}
    ui={data.uiContent.landingPage}
    onProceed={nextStep}
  />;
      case 2:
        return <PlanSelection plans={data.plans} ui={data.uiContent.planSelection} onSelect={selectPlan} onBack={prevStep} />;
      case 3:
        return <PlanDetail plan={bookingState.selectedPlan!} onProceed={(apiGuests) => {
  setBookingState((p) => ({
    ...p,
    guestsPayload: apiGuests
  }));
  nextStep();
}}  onBack={prevStep} />;
      case 4:
        return <GuestForm guests={bookingState.guests} setGuests={(g) => setBookingState(p => ({...p, guests: g}))} ui={data.uiContent.guestForm} roomTypes={data.config.ROOM_TYPES || []} onProceed={nextStep} onBack={prevStep} />;
      case 5:
      return (
        <BookingSummary
          bookingState={{ ...bookingState, plan: bookingState.selectedPlan }}
          ui={data.uiContent.bookingSummary}
          config={data.config}
          event={data.eventData.event}
          onConfirm={handlePayment}
          onBack={prevStep}
        />
      );
      case 6:
        return paymentResult === 'SUCCESS' 
          ? <PaymentStatus success={true}  bookingId={bookingState.bookingId} bookingState={bookingState} event={data.eventData.event} ui={data.uiContent.bookingSummary} onDashboard={() => setBookingState(prev => ({ ...prev, currentStep: 7 }))} />
          : <div className="text-center py-20">Payment Failed. Please try again.</div>;
      case 7:
        return <DownloadsDashboard bookingState={bookingState} event={data.eventData.event} ui={data.uiContent.bookingSummary} />;
      default:
        return <LandingPage event={data.eventData.event} schedule={data.eventData.schedule} mentors={data.eventData.mentors} insights={data.eventData.insights} ui={data.uiContent.landingPage} onProceed={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {bookingState.currentStep > 1 && bookingState.currentStep < 6 && (
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-6 h-6 text-gray-600" /></button>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-300 ${s <= bookingState.currentStep ? 'bg-teal-700' : 'bg-gray-200'}`} />
              ))}
            </div>
            <div className="w-10" />
          </div>
        </header>
      )}
      <main className="flex-1 w-full overflow-x-hidden">{renderStep()}</main>
      <footer className="py-6 <text-center text-gray-400 text-[10px] uppercase tracking-widest border-t bg-white">
        © 2025 EventBook Pro. Built for {data.eventData.EventName}
      </footer>
    </div>
  );
};

export default App;