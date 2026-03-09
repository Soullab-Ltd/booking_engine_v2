
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ArrowRight, ShieldCheck, Zap, Heart, Camera, Sun, Wind, Cloud, Info, Star, Users, Sprout, Sparkles, Flower2, Navigation } from 'lucide-react';
import { EventData } from '../types';
import { MOCK_SCHEDULE, MOCK_MENTORS, MOCK_INSIGHTS } from '../constants';

interface LandingPageProps {
  event: EventData;
  schedule: any[];
  mentors: any;
  insights: any[];
  ui: any;
  onProceed: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ event, schedule, mentors, insights, ui, onProceed }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  return (
    <div className="flex flex-col animate-fadeIn bg-white overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-[600px] md:h-[850px] w-full overflow-hidden">
        <img 
          src={event.banner} 
          alt={event.title} 
          className="w-full h-full object-cover scale-105 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-20 w-full text-white">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-2xl">
                <span className="inline-block bg-teal-700 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-lg mb-6 shadow-xl shadow-teal-900/40">
                  {ui.hero.badge}
                </span>
                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-teal-200">
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                    <Calendar className="w-4 h-4" /> {event.date}
                  </span>
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                    <MapPin className="w-4 h-4" /> {event.venue}
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                <button 
                  onClick={onProceed}
                  className="bg-white text-stone-900 px-10 py-5 rounded-[24px] font-black text-lg flex items-center gap-3 hover:bg-teal-700 hover:text-white transition-all shadow-2xl hover:scale-110 active:scale-95 group"
                >
                  {ui.hero.cta} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-32">
            
            {/* Description Section */}
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-1 rounded-full bg-teal-700"></div>
                 <h2 className="text-xs font-black uppercase tracking-[0.3em] text-teal-700">{ui.about.label}</h2>
               </div>
               <p className="text-3xl text-stone-800 font-bold tracking-tight leading-tight">
                 {event.description}
               </p>
            </section>

            {/* Alternating Insight Sections */}
            <div className="space-y-32">
              {insights.map((insight: any, idx: number) => (
                <section key={idx} className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center animate-slideUp`}>
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-1 rounded-full bg-teal-700"></div>
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-teal-700">Insight {idx + 1}</h2>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tighter leading-tight">
                      {insight.title}
                    </h3>
                    <p className="text-lg text-stone-500 leading-relaxed font-medium">
                      {insight.text}
                    </p>
                  </div>
                  <div className="flex-1 w-full h-[400px] rounded-[40px] overflow-hidden shadow-2xl grayscale-[30%] hover:grayscale-0 transition-all duration-700">
                    <img src={insight.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={insight.title} />
                  </div>
                </section>
              ))}
            </div>

            {/* Itinerary Section - Tabbed Interface */}
            <section id="schedule" className="bg-stone-50 -mx-6 px-6 py-24 md:rounded-[60px] border border-stone-100">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-teal-700 mb-4">{ui.schedule.label}</h2>
                  <h3 className="text-5xl font-black tracking-tighter text-stone-900">{ui.schedule.title}</h3>
                </div>
                
                {/* Day Filter / Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {schedule.map((dayData: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDayIndex(idx)}
                      className={`min-w-[100px] px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all duration-300 border-2 ${
                        activeDayIndex === idx 
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-200 scale-105' 
                        : 'bg-white text-stone-400 border-stone-100 hover:border-teal-100 hover:text-teal-700'
                      }`}
                    >
                      Day {idx + 1}
                      <span className={`block text-[9px] font-bold mt-1 ${activeDayIndex === idx ? 'text-teal-400' : 'text-stone-300'}`}>
                        {dayData.date}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Active Day Content */}
                <div key={activeDayIndex} className="animate-fadeIn space-y-6">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-black text-teal-100 uppercase tracking-tighter">{schedule[activeDayIndex].day}</span>
                    <div className="h-px bg-teal-100 flex-1"></div>
                    <span className="text-sm font-bold text-teal-400">{ui.schedule.location}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {schedule[activeDayIndex].slots.map((slot: any, sIdx: number) => (
                      <div key={sIdx} className="bg-white p-6 rounded-[28px] border border-stone-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all group">
                        <div className="md:w-32 shrink-0 flex items-center md:justify-center">
                          <span className="text-sm font-black text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl">{slot.time}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-black text-stone-900 mb-1 group-hover:text-teal-700 transition-colors">{slot.title}</h4>
                          <p className="text-stone-500 text-sm font-medium">{slot.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Mentors Section */}
            <section className="space-y-24">
               <div className="text-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-teal-700 mb-4">{ui.mentors.label}</h3>
                  <h2 className="text-5xl font-black tracking-tighter text-stone-900">{ui.mentors.title}</h2>
               </div>

               {/* Main Mentor */}
               <div className="bg-stone-900 rounded-[50px] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-700/20 rounded-full blur-3xl -m-32"></div>
                  <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                     <div className="w-full lg:w-80 h-96 rounded-[40px] overflow-hidden border-8 border-white/10 shadow-2xl shrink-0">
                        <img src={mentors.main.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={mentors.main.name} />
                     </div>
                     <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-teal-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                           <Heart className="w-4 h-4 fill-current" />
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter">{mentors.main.name}</h3>
                        <p className="text-teal-200 text-sm font-bold uppercase tracking-widest">{mentors.main.role}</p>
                        <p className="text-lg text-teal-100/80 leading-relaxed font-medium">
                           {mentors.main.bio}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Others Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mentors.others.map((mentor: any, idx: number) => (
                    <div key={idx} className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm hover:shadow-2xl hover:border-teal-100 transition-all group">
                       <div className="flex items-center gap-6 mb-8">
                          <div className="w-24 h-24 rounded-[28px] overflow-hidden border-4 border-stone-50 shadow-md shrink-0">
                             <img src={mentor.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={mentor.name} />
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-stone-900">{mentor.name}</h4>
                             <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mt-1">{mentor.role}</p>
                          </div>
                       </div>
                       <p className="text-sm text-stone-500 leading-relaxed font-medium">
                          {mentor.bio}
                       </p>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* Sidebar CTA */}
          <aside className="lg:col-span-4 relative">
            <div className="sticky top-24 space-y-8">
              <div className="bg-stone-900 rounded-[40px] p-10 text-white shadow-2xl shadow-stone-100 overflow-hidden relative border border-white/10 group">
                <div className="absolute top-0 right-0 -m-8 w-48 h-48 bg-teal-700/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-6 leading-tight">{ui.sidebar.title}</h3>
                  <div className="space-y-6 mb-10">
                    {ui.sidebar.features.map((feature: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                           {fIdx === 0 ? <Zap className="w-5 h-5 text-teal-400" /> : fIdx === 1 ? <Flower2 className="w-5 h-5 text-teal-400" /> : <MapPin className="w-5 h-5 text-teal-400" />}
                         </div>
                         <p className="text-sm font-bold">{feature}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={onProceed}
                    className="w-full bg-teal-700 hover:bg-teal-600 text-white py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-teal-900/40 flex items-center justify-center gap-3 group"
                  >
                    {ui.sidebar.cta} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-center mt-6 text-stone-50 uppercase tracking-widest font-black">{ui.sidebar.footer}</p>
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-8 border border-stone-100 shadow-sm text-center">
                 <div className="flex justify-center -space-x-4 mb-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-stone-200 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/150?u=sdf${i}`} alt="" />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-white bg-teal-700 flex items-center justify-center text-[10px] font-black text-white shadow-sm">{ui.sidebar.community.count}</div>
                 </div>
                 <h4 className="text-sm font-black text-stone-900 mb-1">{ui.sidebar.community.title}</h4>
                 <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{ui.sidebar.community.subtitle}</p>
              </div>

              <button className="w-full bg-stone-50 border-2 border-stone-100 py-4 rounded-3xl text-stone-600 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all">
                <Navigation className="w-4 h-4" /> {ui.sidebar.mapsCta}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
