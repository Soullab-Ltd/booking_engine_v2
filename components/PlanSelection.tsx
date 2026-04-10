import React from 'react';
import { Plan } from '../types';
import { Check } from 'lucide-react';

interface PlanSelectionProps {
  plans: Plan[];
  ui: any;
  onSelect: (plan: Plan) => void;
  onBack: () => void;
}

const getThumbnailImage = (plan: any) => {
  return (
    plan.images?.find((img: any) => Number(img.isThumbnail) === 1)?.imageUrl ||
    plan.images?.find((img: any) => Number(img.isMain) === 1)?.imageUrl ||
    plan.images?.[0]?.imageUrl ||
    plan.thumbnail ||
    plan.bannerImage ||
    'https://via.placeholder.com/1200x600?text=No+Image'
  );
};

const PlanSelection: React.FC<PlanSelectionProps> = ({ plans, ui, onSelect, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full animate-fadeIn">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-stone-900 mb-2">{ui.title}</h2>
        <p className="text-stone-600"></p>
      </div>

      <div className="grid gap-8">
        {plans.map((plan: any) => {
          const amenities = plan.amenities || plan.icons || [];
          const planTitle = plan.PlanTitle || plan.title || plan.PlanName || 'Plan';
          const planSubtitle = plan.stayRoomType || plan.PlanSubtitle || '';
          const planDescription = plan.PlanDescription || plan.description || '';
          const finalPrice = Number(plan.finalPrice || plan.PlanPrice || 0);
          const discountedPrice = Number(
            plan.discountedPrice || plan.OfferPrice || plan.finalPrice || plan.PlanPrice || 0
          );

          return (
            <div
              key={plan.planID || plan.id}
              className="bg-white rounded-3xl overflow-hidden shadow-md border border-stone-100 flex flex-col md:flex-row hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="w-full md:w-72 h-56 md:h-auto overflow-hidden relative">
                <img
                  src={getThumbnailImage(plan)}
                  alt={planTitle}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="flex-1 p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-stone-900 mb-1">{planTitle}</h3>

                    {planSubtitle ? (
                      <p className="text-stone-500 text-sm font-medium whitespace-pre-line mb-2">
                        {planSubtitle}
                      </p>
                    ) : null}

                    <p className="text-stone-500 text-sm font-medium whitespace-pre-line">
                      {planDescription}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 mb-6">
                  {amenities.slice(0, 4).map((amenity: any) => {
                    const amenityTitle = amenity.Title || amenity.title || '';
                    const amenityIcon = amenity.IconUrl || amenity.iconUrl || '';

                    return (
                      <div
                        key={amenity.id}
                        className="flex items-center gap-2 text-sm text-stone-600 font-medium"
                      >
                        {amenityIcon ? (
                          <img
                            src={amenityIcon}
                            alt={amenityTitle}
                            className="w-4 h-4 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Check className="w-4 h-4 text-teal-500" />
                        )}
                        <span>{amenityTitle}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto flex items-end justify-between pt-6 border-t border-stone-50">
                  <div>
                    <span className="text-stone-400 line-through text-sm font-bold">
                      ₹{finalPrice.toLocaleString()}
                    </span>

                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-black text-stone-900">
                        ₹{discountedPrice.toLocaleString()}
                      </span>

                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                        / person
                      </span>

                      <span className="text-xs text-teal-600 font-bold">
                        {plan.gstDetails || ''}
                      </span>
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
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelection;