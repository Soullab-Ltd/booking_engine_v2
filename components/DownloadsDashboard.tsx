
import React, { useMemo } from 'react';
import { BookingState, EventData } from '../types';
import { 
  Download, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  Ticket, 
  Map, 
  ShoppingBag, 
  Bed,
  ChevronRight,
  ClipboardList,
  Navigation,
  Backpack,
  Compass,
  FileSearch,
  BookOpen,
  Send,
  Sparkles,
  ShieldCheck,
  Clock,
  // Added missing icons used in the component
  Wind,
  Flower2
} from 'lucide-react';

interface DownloadsDashboardProps {
  bookingState: BookingState;
  event: EventData;
  ui: any;
}

const DownloadsDashboard: React.FC<DownloadsDashboardProps> = ({ bookingState, event, ui }) => {
  const bookingDate = useMemo(() => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), []);

  const documents = [
    { title: "Confirmed Ticket PDF", icon: Ticket, status: "Ready", size: "1.4 MB", desc: "Your entry pass to the sanctuary" },
    { title: "Invoice PDF", icon: FileText, status: "Ready", size: "920 KB", desc: "Detailed payment breakdown" },
    { title: "Event Brochure", icon: BookOpen, status: "Ready", size: "5.2 MB", desc: "Full retreat guide & protocols" },
    { title: "Stay/Room Details", icon: Bed, status: "Ready", size: "640 KB", desc: "Cottage allocation & amenities" },
    { title: "Venue Map & Directions", icon: Compass, status: "Ready", size: "3.1 MB", desc: "Coordinates for Silent Valley" },
    { title: "Packing Checklist", icon: Backpack, status: "Ready", size: "1.1 MB", desc: "Essential items for the 5-day stay" },
  ];

  if (bookingState.is80GRequired) {
    documents.push({ 
      title: "80G Receipt", 
      icon: ShieldCheck, 
      status: "Download in 2-3 days", 
      size: "--", 
      desc: "Post-event verification required" 
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 w-full animate-fadeIn pb-32">
      <div className="mb-12">
        <h2 className="text-5xl font-black text-stone-900 mb-3 tracking-tighter">{ui?.dashboard?.title}</h2>
        <p className="text-stone-500 font-medium text-lg max-w-2xl leading-relaxed">
          {ui.dashboard.desc} <a href="mailto:support@retreat.co" className="text-teal-700 underline font-bold underline-offset-4 decoration-teal-700/30 hover:decoration-teal-700 transition-all">[Contact Support]</a>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Detailed Summary Card */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-stone-50 rounded-full -m-40 transition-transform duration-1000 group-hover:scale-110"></div>
            
            <div className="relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-teal-100/50">
                      <Sparkles className="w-3.5 h-3.5" /> Guest Profile Confirmed
                    </div>
                    <h3 className="text-4xl font-black tracking-tighter text-stone-900">{bookingState.plan?.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                       <span className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase tracking-tight"><Calendar className="w-4 h-4 text-teal-600" /> {event.date}</span>
                       <span className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase tracking-tight"><MapPin className="w-4 h-4 text-teal-600" /> {event.venue}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Booking ID</p>
                    <p className="text-xl font-mono font-black text-stone-900">#SDF-7294-A</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 pt-10 border-t border-stone-50">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">No. of Guests</span>
                    <span className="text-xl font-black text-stone-900 flex items-center gap-2">
                       {bookingState.guests.length} <span className="text-[10px] text-stone-400 font-bold">Guests</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Plan Selected</span>
                    <span className="text-xl font-black text-stone-900">{bookingState.plan?.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Booking Date</span>
                    <span className="text-xl font-black text-stone-900">{bookingDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Status</span>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-xl font-black text-stone-900">Active</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Downloads Section */}
          <section>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
               <h3 className="text-2xl font-black text-stone-900 flex items-center gap-3">
                  <Download className="w-7 h-7 text-teal-600" /> {ui.dashboard.downloads.title}
               </h3>
               <button className="w-full sm:w-auto bg-stone-900 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg group">
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> {ui.dashboard.downloads.cta}
               </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {documents.map((doc, idx) => (
                <div 
                  key={idx} 
                  className={`group bg-white p-6 rounded-[32px] border-2 border-stone-50 shadow-sm hover:shadow-xl hover:border-teal-100/50 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${doc.status.includes('days') ? 'opacity-70 grayscale' : ''}`}
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-[24px] bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-teal-50 group-hover:text-teal-700 transition-all shadow-inner">
                      <doc.icon className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-stone-900 truncate pr-4">{doc.title}</h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight mt-0.5 line-clamp-1">{doc.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${doc.status === 'Ready' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                           {doc.status}
                         </span>
                         {doc.size !== '--' && <span className="text-[9px] font-bold text-stone-300">{doc.size}</span>}
                      </div>
                    </div>
                  </div>
                  {doc.status === 'Ready' && (
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-all shadow-sm">
                       <Download className="w-5 h-5" />
                    </div>
                  )}
                  {doc.status.includes('days') && (
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center">
                       <Clock className="w-5 h-5 text-stone-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Support & Logistics Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-stone-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-stone-200">
             <div className="absolute top-0 right-0 -m-12 w-48 h-48 bg-teal-700/20 rounded-full blur-3xl"></div>
             
             <h4 className="text-xl font-black mb-8 flex items-center gap-3">
                <Compass className="w-6 h-6 text-teal-400" /> {ui.dashboard.logistics.title}
             </h4>
             <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0"><Navigation className="w-5 h-5 text-teal-400" /></div>
                   <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Check-in Time</p>
                      <p className="font-bold text-sm">01:30 PM (Strictly Observed)</p>
                      <p className="text-[10px] text-stone-500 mt-1">Please arrive 15 mins prior.</p>
                   </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-teal-400" /></div>
                   <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Emergency contact</p>
                      <p className="font-bold text-sm">+91 98765 43210</p>
                      <p className="text-[10px] text-stone-500 mt-1"></p>
                   </div>
                </div>

                <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0"><Wind className="w-5 h-5 text-teal-400" /></div>
                   <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Weather Notice</p>
                      <p className="font-bold text-sm">Expect Cool Evenings</p>
                      <p className="text-[10px] text-stone-500 mt-1">Temperature drops to 12°C at night.</p>
                   </div>
                </div>
             </div>
             
             <button className="w-full mt-12 bg-white text-stone-900 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal-50 transition-all shadow-xl active:scale-95">
                {ui.dashboard.logistics.cta} <Navigation className="w-4 h-4" />
             </button>
          </div>

          <div className="bg-stone-50 rounded-[40px] p-8 border border-stone-100 flex items-center justify-between group cursor-pointer hover:bg-white transition-all">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                   <Flower2 className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                   <h5 className="text-sm font-black text-stone-900">Pre-Retreat Prep</h5>
                   <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight"></p>
                </div>
             </div>
             <ChevronRight className="w-5 h-5 text-stone-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadsDashboard;
