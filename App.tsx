import React, { useState, useEffect } from 'react';
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

const STEP_LOADING_COPY: Record<number, string> = {
  2: 'Loading plans...',
  3: 'Loading plan details...',
  4: 'Preparing guest form...',
  5: 'Preparing booking summary...',
  6: 'Fetching payment status...',
  7: 'Loading downloads dashboard...',
};

const waitForTransitionFrame = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.setTimeout(resolve, 120);
    });
  });

const App: React.FC = () => {
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

  const [paymentResult, setPaymentResult] = useState<'SUCCESS' | 'FAILED' | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🚀 Starting data fetch...');

       const urlParams = new URLSearchParams(window.location.search);
const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
const eventId = urlParams.get('id');
const bookingIdFromUrl = urlParams.get('booking');
const view = urlParams.get('view');

let allData;

if (slug) {
  allData = await getAllDataBySlug(slug, bookingIdFromUrl);
} else {
  allData = await getAllData(eventId || '44', bookingIdFromUrl);
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

        if (bookingIdFromUrl) {
          setBookingState((prev) => ({
            ...prev,
            bookingId: bookingIdFromUrl,
            ticketUrl: allData?.bookingData?.ticketUrl || '',
            invoiceUrl: allData?.bookingData?.invoiceUrl || '',
            completionCertificateUrl:
              allData?.bookingData?.completionCertificateUrl || '',
            additionalAssets: allData?.bookingData?.additionalAssets || [],
          }));

          setPaymentResult('SUCCESS');
        }

        if (bookingIdFromUrl && view === 'dashboard') {
          setBookingState((prev) => ({
            ...prev,
            currentStep: 7,
          }));
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

  const moveToStep = async (nextStepValue: number) => {
    setStepLoadingMessage(STEP_LOADING_COPY[nextStepValue] || 'Loading...');
    await waitForTransitionFrame();
    setBookingState((prev) => ({ ...prev, currentStep: nextStepValue }));
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
    window.setTimeout(() => setStepLoadingMessage(''), 220);
  };

 const handlePayment = async (success: boolean, bookingId?: string | number) => {
  if (success) {
    setStepLoadingMessage(STEP_LOADING_COPY[6]);
    setPaymentResult('SUCCESS');

    // ✅ FETCH BOOKING DATA AGAIN
    const allData = await getAllData(
      selectedEventId.toString(),
      String(bookingId)
    );

    setBookingState((prev) => ({
      ...prev,
      bookingId: bookingId ?? prev.bookingId,

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

      additionalAssets:
        allData?.bookingData?.additionalAssets || [],

      currentStep: 6,
    }));
    window.setTimeout(() => setStepLoadingMessage(''), 220);
  } else {
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
        return paymentResult === 'SUCCESS' ? (
          <PaymentStatus
            success={true}
            bookingId={bookingState.bookingId}
            bookingState={bookingState}
            // Inject the formatted date here
            event={{ 
              ...data.eventData.event, 
              displayDate: `${formatDisplayDate(data.eventData.event.EventStartDate)} — ${formatDisplayDate(data.eventData.event.EventEndDate)}` 
            }}
            ui={data.uiContent.bookingSummary}
            onDashboard={() => setBookingState(prev => ({ ...prev, currentStep: 7 }))}
          />
        ) : (
          <div className="text-center py-20 font-bold text-red-500">Payment Failed. Please try again.</div>
        );

      case 7:
        return (
          <DownloadsDashboard
            bookingState={bookingState}
            bookingId={bookingState.bookingId}
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
          Support: <a href="tel:987666444" className="text-[var(--theme)] hover:underline">987666444</a>
        </p>
      </footer>

      {/* Global WhatsApp Floating Button */}
      <a
        href="https://wa.me/91987666444?text=I%20need%20help%20with%20my%20booking"
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
