import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  CheckCircle, ArrowRight, Mail, Ticket, X, 
  ShieldCheck, Flower2, Sparkles, FileText, Download, Calendar 
} from 'lucide-react';
import { BookingState, EventData } from '../types';

interface PaymentStatusProps {
  success: boolean;
  bookingState: BookingState;
  event: EventData;
  ui: any;
  bookingId: string | null;
  onDashboard: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ success, bookingState, event, ui, bookingId, onDashboard }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // --- PDF GENERATION LOGIC ---
  const downloadPDF = async (type: 'ticket' | 'invoice') => {
    setIsDownloading(type);
    const element = document.getElementById(`${type}-template`);
    if (!element) return;

    // Temporarily show the hidden template for capturing
    element.style.display = 'block';
    
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${type}_${bookingId || 'booking'}.pdf`);
    
    element.style.display = 'none';
    setIsDownloading(null);
  };

  if (!success) return <div className="p-20 text-center">Payment Failed</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 w-full animate-fadeIn pb-32">
      {/* Hidden Templates for PDF Generation */}
      <div id="ticket-template" style={{ display: 'none', width: '800px', padding: '40px', background: 'white' }}>
         <img src={event.banner} style={{ width: '100%', borderRadius: '20px', marginBottom: '20px' }} />
         <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>{event.title} - E-TICKET</h1>
         <p style={{ color: '#666' }}>Booking ID: #{bookingId}</p>
         <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ fontWeight: 'bold' }}>Guests:</h3>
            {bookingState.guests.map(g => <p key={g.id}>{g.name} ({g.email})</p>)}
         </div>
         <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Date: {event.date}</p>
      </div>

      <div id="invoice-template" style={{ display: 'none', width: '800px', padding: '40px', background: 'white' }}>
         <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Tax Invoice</h1>
         <p>Booking ID: #{bookingId}</p>
         <hr style={{ margin: '20px 0' }} />
         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
               <h3 style={{ fontWeight: 'bold' }}>Event:</h3>
               <p>{event.title}</p>
            </div>
            <img src={event.banner} style={{ width: '150px', borderRadius: '10px' }} />
         </div>
         <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
            <thead>
               <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
               </tr>
            </thead>
            <tbody>
               <tr><td style={{ padding: '10px' }}>Base Plan x {bookingState.guests.length}</td><td style={{ padding: '10px', textAlign: 'right' }}>₹{(bookingState.selectedPlan?.finalPrice || 0) * bookingState.guests.length}</td></tr>
               <tr><td style={{ padding: '10px' }}>Add-ons & Services</td><td style={{ padding: '10px', textAlign: 'right' }}>Included</td></tr>
               <tr style={{ fontWeight: 'bold' }}><td style={{ padding: '10px' }}>Total Paid</td><td style={{ padding: '10px', textAlign: 'right' }}>₹{bookingState.guests.length * (bookingState.selectedPlan?.finalPrice || 0)}</td></tr>
            </tbody>
          </table>
      </div>

      {/* Visible UI */}
      <div className="text-center mb-12">
        <div className="w-28 h-28 bg-emerald-100 text-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner relative">
          <CheckCircle className="w-14 h-14" />
        </div>
        <h2 className="text-5xl font-black mb-3 tracking-tighter text-stone-900">Success!</h2>
        <p className="text-stone-500 text-lg font-medium">Booking confirmed for {bookingState.guests[0]?.email}</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-stone-100 mb-10">
        <div className="bg-stone-900 p-10 text-white relative">
             <div className="flex justify-between items-start mb-10">
               <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Booking ID</span>
                 <p className="text-2xl font-mono font-bold">#{bookingId || 'PROCESSING'}</p>
               </div>
               <div className="text-right">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Status</span>
                 <p className="text-lg font-bold text-emerald-400 uppercase tracking-tighter">Confirmed</p>
               </div>
             </div>
             <h3 className="text-3xl font-black">{event.title}</h3>
        </div>
        
        <div className="p-10">
          <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-6">Downloads</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TICKET DOWNLOAD BUTTON */}
            <button 
              onClick={() => downloadPDF('ticket')}
              disabled={isDownloading === 'ticket'}
              className="flex items-center justify-between p-5 rounded-2xl border-2 border-stone-50 hover:border-teal-100 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-50 rounded-xl"><Ticket className="w-5 h-5 text-teal-700" /></div>
                <div>
                  <span className="block text-xs font-black text-stone-900">E-Ticket PDF</span>
                  <span className="block text-[9px] text-stone-400 font-bold uppercase">{isDownloading === 'ticket' ? 'Generating...' : 'Download'}</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-stone-300" />
            </button>

            {/* INVOICE DOWNLOAD BUTTON */}
            <button 
              onClick={() => downloadPDF('invoice')}
              disabled={isDownloading === 'invoice'}
              className="flex items-center justify-between p-5 rounded-2xl border-2 border-stone-50 hover:border-teal-100 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-50 rounded-xl"><FileText className="w-5 h-5 text-teal-700" /></div>
                <div>
                  <span className="block text-xs font-black text-stone-900">Invoice PDF</span>
                  <span className="block text-[9px] text-stone-400 font-bold uppercase">{isDownloading === 'invoice' ? 'Generating...' : 'Download'}</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-stone-300" />
            </button>
          </div>
        </div>
      </div>

      <button onClick={onDashboard} className="w-full bg-teal-700 text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-teal-800 transition-all shadow-xl">
        Go to Dashboard <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PaymentStatus;