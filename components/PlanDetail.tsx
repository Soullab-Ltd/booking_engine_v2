
import React from 'react';
import { Plan } from '../types';
import { 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Map, 
  Coffee, 
  Users, 
  Wifi, 
  Sun, 
  Wind, 
  Bed, 
  Sparkles, 
  ConciergeBell, 
  Cloud,
  DoorOpen,
  Utensils,
  ChevronLeft,
  Heart,
  Flower2
} from 'lucide-react';

interface PlanDetailProps {
  plan: Plan;
  onProceed: () => void;
  onBack: () => void;
}

const AmenityIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  if (n.includes('wifi')) return <Wifi className="w-6 h-6" />;
  if (n.includes('heating') || n.includes('floor')) return <Sun className="w-6 h-6" />;
  if (n.includes('spa')) return <Heart className="w-6 h-6" />;
  if (n.includes('bed')) return <Bed className="w-6 h-6" />;
  if (n.includes('meal') || n.includes('banquet')) return <Utensils className="w-6 h-6" />;
  if (n.includes('view') || n.includes('riverside')) return <Wind className="w-6 h-6" />;
  if (n.includes('concierge') || n.includes('support')) return <ConciergeBell className="w-6 h-6" />;
  if (n.includes('meditation') || n.includes('altar')) return <Flower2 className="w-6 h-6" />;
  if (n.includes('private entry') || n.includes('deck')) return <DoorOpen className="w-6 h-6" />;
  return <CheckCircle className="w-6 h-6" />;
};

// const getPlanImage = (plan: any) => {
//   return (
//     plan.images?.find((img: any) => img.isMain)?.imageUrl ||
//     plan.images?.find((img: any) => img.isThumbnail)?.imageUrl ||
//     plan.images?.[0]?.imageUrl ||
//     "https://via.placeholder.com/1200x600?text=No+Image"
//   );
// };
const PlanDetail: React.FC<PlanDetailProps> = ({ plan, onProceed, onBack }) => {
  return (
    <div className="animate-fadeIn pb-32 bg-white">
      {/* Immersive Hero */}
      <div className="relative h-[450px] w-full overflow-hidden">
        <img 
          src={plan.thumbnail} 
          alt={plan.PlanName} 
          className="w-full h-full object-cover brightness-75 scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-black/20 to-transparent" />
        <div className="absolute top-8 left-8">
           <button 
             onClick={onBack}
             className="bg-white/20 backdrop-blur-xl hover:bg-white/40 text-white p-3 rounded-2xl transition-all border border-white/20 flex items-center gap-2 font-black text-xs uppercase tracking-widest"
           >
             <ChevronLeft className="w-4 h-4" /> Back
           </button>
        </div>
        <div className="absolute bottom-12 left-0 right-0">
          <div className="max-w-7xl mx-auto px-8">
            <span className="bg-teal-700 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-lg mb-4 inline-block shadow-lg">
              Accommodation Tier
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
              {plan.PlanTitle}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          {/* Detailed Overview */}
          <section className="animate-slideUp">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-1 rounded-full bg-teal-700"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-teal-700">Plan Details</h2>
            </div>
            <p className="text-2xl text-stone-700 leading-relaxed font-medium">
              {plan.fullDescription}
            </p>
          </section>

          {/* Amenities Grid */}
          <section>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-1 rounded-full bg-teal-700"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-teal-700">Amenities</h2>
            </div>
           <div className="grid grid-cols-2 gap-y-3 mb-6">
              {plan.amenities.slice(0, 4).map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-2 text-sm text-stone-600 font-medium"
                >
                  <AmenityIcon name={amenity.title} />
                  <span>{amenity.title}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Support Badge */}
          <div className="p-10 bg-stone-900 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-stone-100">
             <div className="w-20 h-20 bg-teal-700 rounded-3xl flex items-center justify-center shrink-0 shadow-lg">
                <Heart className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-xl font-black mb-2">Customer Support</h3>
                <p className="text-teal-200 leading-relaxed font-medium">
                  Please contact our customer support @ for any queries.
                </p>
             </div>
          </div>
        </div>

        {/* Sticky Pricing Card */}
        <div className="lg:col-span-4 relative">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-stone-50 sticky top-24 overflow-hidden group">
            <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-stone-50 rounded-full opacity-50 transition-transform group-hover:scale-150 duration-700"></div>
            
            <h3 className="text-xs font-black text-stone-300 uppercase tracking-widest mb-8">Selected Plan</h3>
            
            <div className="space-y-6 mb-12">
               <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-400">Price</span>
                  <span className="text-lg font-bold text-stone-400 line-through">₹ {plan.finalPrice.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-teal-700 uppercase tracking-tighter">Retreat Offering</span>
                  <div className="text-right">
                    <span className="text-5xl font-black text-stone-900">₹ {plan.discountedPrice.toLocaleString()}</span>
                    <p className="text-[10px] font-black text-teal-600 mt-1 uppercase tracking-widest">{plan.gstDetails}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-stone-50 mb-12">
               <div className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                  <ShieldCheck className="w-5 h-5 text-teal-500" />
                  Flat Rs 10000 for kids aged 17 years and below!
               </div>
               <div className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                  <Flower2 className="w-5 h-5 text-teal-400" />
                  Pure Veg meals included
               </div>
            </div>
            
            <button 
              onClick={onProceed}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-teal-100 flex items-center justify-center gap-3 group active:scale-95"
            >
              Book Now! <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <p className="text-center mt-6 text-[10px] text-stone-400 font-black uppercase tracking-widest">
              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
