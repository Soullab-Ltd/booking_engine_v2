
import React from 'react';
import { Plan } from '../types';
import { Check, Sparkles } from 'lucide-react';

interface PlanSelectionProps {
  plans: Plan[];
  ui: any;
  onSelect: (plan: Plan) => void;
  onBack: () => void;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({ plans, ui, onSelect, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full animate-fadeIn">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-stone-900 mb-2">{ui.title}</h2>
        <p className="text-stone-600"></p>
      </div>

      <div className="grid gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className="bg-white rounded-3xl overflow-hidden shadow-md border border-stone-100 flex flex-col md:flex-row hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="w-full md:w-72 h-56 md:h-auto overflow-hidden relative">
              <img src={plan.thumbnail} alt={plan.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                <span className="bg-teal-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3 h-3" /> {ui.badge}
                </span>
              </div>
            </div>
            <div className="flex-1 p-6 md:p-8 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-stone-900 mb-1">{plan.title}</h3>
                  <p className="text-stone-500 text-sm font-medium">{plan.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 mb-6">
                {plan.amenities.slice(0, 4).map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500" /> {amenity}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-end justify-between pt-6 border-t border-stone-50">
                <div>
                  <span className="text-stone-400 line-through text-sm font-bold">₹{plan.discountedPrice.toLocaleString()}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-stone-900">₹{plan.finalPrice.toLocaleString()}</span>
                    <span className="text-xs text-emerald-600 font-bold">{plan.gstDetails}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onSelect(plan)}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-2xl font-black transition-all transform hover:scale-105 shadow-lg shadow-teal-100"
                >
                  {ui.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSelection;
