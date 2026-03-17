import React from 'react';
import { Calendar, MapPin, ArrowRight, Sparkles, Clock } from 'lucide-react';

interface EventDiscoveryProps {
  events: any[];
  onSelect: (id: number) => void;
}

const EventDiscovery: React.FC<EventDiscoveryProps> = ({ events, onSelect }) => {
  return (
    <div className="min-h-screen bg-[#F9F8F6] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[1px] w-8 bg-teal-700"></div>
            <span className="text-teal-700 font-black text-[10px] uppercase tracking-[0.4em]">Experience Portal</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-stone-900 leading-none">
            Live <span className="text-stone-400 font-light italic">Experiences</span>
          </h1>
        </header>

        {events.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-stone-200">
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">No active events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <div 
                key={event.EventID}
                onClick={() => onSelect(event.EventID)}
                className="group cursor-pointer bg-white rounded-[32px] p-3 border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Smaller Image Aspect Ratio */}
                <div className="aspect-[4/3] rounded-[24px] overflow-hidden relative mb-5 shadow-inner bg-stone-100">
                  <img 
                    src={event.bannerImage || "https://picsum.photos/seed/event/800/600"} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt={event.EventName}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 p-3 rounded-full text-white">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-teal-700 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" /> Live
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3">
                  {/* Meta Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-stone-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {event.EventStartDate ? new Date(event.EventStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {event.time || 'Schedule TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-stone-900 leading-snug mb-4 group-hover:text-teal-800 transition-colors line-clamp-1">
                    {event.EventName}
                  </h3>
                  
                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                    <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase tracking-tight truncate max-w-[140px]">
                      <MapPin className="w-3 h-3 text-teal-600/50" /> 
                      {event.Location || event.venue || 'Venue TBD'}
                    </div>
                    <span className="text-[9px] font-black text-teal-700 uppercase tracking-tighter group-hover:underline">
                      Book Now
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDiscovery;