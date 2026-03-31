
import React, { useState } from 'react';
import { Guest, FoodPreference } from '../types';
import { createEmptyGuest, MOCK_ROOM_TYPES } from '../constants';
import { 
  UserPlus, 
  Trash2, 
  Info, 
  X, 
  ChevronRight, 
  PlusCircle, 
  AlertTriangle, 
  Calendar,
  BedDouble,
  Clock,
  CheckCircle2,
  Utensils,
  MapPin,
  Sparkles,
  ArrowRight,
  Minus,
  Baby,
  Flower2,
  Wind,
  Sun
} from 'lucide-react';


const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", 
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];


interface GuestFormProps {
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  ui: any;
  roomTypes: any[];
  onProceed: () => void;
  onBack: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({ guests, setGuests, ui, roomTypes, onProceed, onBack }) => {
  const [showAddOnInfo, setShowAddOnInfo] = useState<string | null>(null);
  const [agePricingModal, setAgePricingModal] = useState<{show: boolean, affectedGuestIds: string[]}>({ 
    show: false, 
    affectedGuestIds: [] 
  });

  const updateGuest = (id: string, updates: any) => {
    setGuests(guests.map(g => {
      if (g.id === id) {
        if (updates.addOns) {
          const newAddOns = {
            ...g.addOns,
            ...updates.addOns,
            extraStay: {
              ...g.addOns.extraStay,
              ...(updates.addOns.extraStay || {})
            }
          };
          return { ...g, addOns: newAddOns };
        }
        return { ...g, ...updates };
      }
      return g;
    }));
  };

  const addGuest = () => {
    setGuests([...guests, createEmptyGuest()]);
  };

  const removeGuest = (id: string) => {
    if (guests.length > 1) {
      setGuests(guests.filter(g => g.id !== id));
    }
  };

  const handleProceedClick = () => {
    const juniorGuests = guests.filter(g => g.age > 0 && g.age < 18).map(g => g.id);
    if (juniorGuests.length > 0) {
      setAgePricingModal({ show: true, affectedGuestIds: juniorGuests });
    } else {
      onProceed();
    }
  };

  const calculateEndDate = (startDate: string, days: number) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const isValid = guests.every(g => g.name && g.email && g.phone && g.age > 0);

  const getInfoContent = (type: string) => {
    return ui.modals[type];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full animate-fadeIn pb-40">
      {/* Header Area */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">{ui.header.title}</h2>
          <p className="text-stone-600 font-medium text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700" /> {ui.header.subtitle}
          </p>
        </div>
        <button 
          onClick={addGuest}
          className="flex items-center gap-2 bg-teal-700 text-white px-5 py-2 rounded-xl font-bold hover:bg-teal-800 transition-all shadow-md active:scale-95 text-xs"
        >
          <PlusCircle className="w-4 h-4" /> {ui.header.addGuest}
        </button>
      </div>

      <div className="space-y-6">
        {guests.map((guest, index) => (
          <div key={guest.id} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-stone-900 text-white rounded-lg flex items-center justify-center font-black text-sm">
                  {index + 1}
                </span>
                <h3 className="font-black text-stone-800 uppercase tracking-widest text-[10px]">{ui.guestCard.label} {index + 1}</h3>
              </div>
              {guests.length > 1 && (
                <button 
                  onClick={() => removeGuest(guest.id)}
                  className="text-stone-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">{ui.guestCard.fields.name}</label>
                <input 
                  type="text" 
                  value={guest.name}
                  onChange={e => updateGuest(guest.id, { name: e.target.value })}
                  placeholder={ui.guestCard.fields.namePlaceholder}
                  className="w-full px-4 py-2 rounded-xl border-2 border-stone-100 bg-stone-50 focus:bg-white focus:border-teal-700 outline-none transition-all font-bold text-stone-900 text-sm placeholder:text-stone-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">{ui.guestCard.fields.phone}</label>
                <input 
                  type="tel" 
                  value={guest.phone}
                  onChange={e => updateGuest(guest.id, { phone: e.target.value })}
                  placeholder={ui.guestCard.fields.phonePlaceholder}
                  className="w-full px-4 py-2 rounded-xl border-2 border-stone-100 bg-stone-50 focus:bg-white focus:border-teal-700 outline-none transition-all font-bold text-stone-900 text-sm placeholder:text-stone-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">{ui.guestCard.fields.email}</label>
                <input 
                  type="email" 
                  value={guest.email}
                  onChange={e => updateGuest(guest.id, { email: e.target.value })}
                  placeholder={ui.guestCard.fields.emailPlaceholder}
                  className="w-full px-4 py-2 rounded-xl border-2 border-stone-100 bg-stone-50 focus:bg-white focus:border-teal-700 outline-none transition-all font-bold text-stone-900 text-sm placeholder:text-stone-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">{ui.guestCard.fields.age}</label>
                <input 
                  type="number" 
                  value={guest.age || ''}
                  onChange={e => updateGuest(guest.id, { age: parseInt(e.target.value) || 0 })}
                  placeholder={ui.guestCard.fields.agePlaceholder}
                  className="w-full px-4 py-2 rounded-xl border-2 border-stone-100 bg-stone-50 focus:bg-white focus:border-teal-700 outline-none transition-all font-bold text-stone-900 text-sm placeholder:text-stone-300"
                />
              </div>



              <div className="space-y-1">
    <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">Gender</label>
    <div className="flex gap-2">
      {['Male', 'Female', 'Prefer not to say'].map(gender => (
        <label key={gender} className={`flex-1 flex items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all font-bold text-[10px] text-center ${guest.gender === gender ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'bg-stone-100 border-stone-100 text-stone-600 hover:border-stone-300'}`}>
          <input 
            type="radio" 
            name={`gender-${guest.id}`} 
            checked={guest.gender === gender}
            onChange={() => updateGuest(guest.id, { gender })}
            className="hidden" 
          />
          {gender}
        </label>
      ))}
    </div>
  </div>


              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">{ui.guestCard.fields.food}</label>
                <div className="flex gap-2">
                  {[FoodPreference.REGULAR, FoodPreference.JAIN].map(pref => (
                    <label key={pref} className={`flex-1 flex items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all font-bold text-[11px] ${guest.foodPreference === pref ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'bg-stone-100 border-stone-100 text-stone-600 hover:border-stone-300'}`}>
                      <input 
                        type="radio" 
                        name={`food-${guest.id}`} 
                        checked={guest.foodPreference === pref}
                        onChange={() => updateGuest(guest.id, { foodPreference: pref })}
                        className="hidden" 
                      />
                      {pref}
                    </label>
                  ))}
                </div>
              </div>


  <div className="space-y-1">
    <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">City</label>
    <input 
      type="text" 
      value={guest.city}
      onChange={e => updateGuest(guest.id, { city: e.target.value })}
      placeholder="e.g. Mumbai"
      className="w-full px-4 py-2 rounded-xl border-2 border-stone-100 bg-stone-50 focus:bg-white focus:border-teal-700 outline-none transition-all font-bold text-stone-900 text-sm placeholder:text-stone-300"
    />
  </div>

  <div className="space-y-1">
    <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">State</label>
    <select 
      value={guest.state}
      onChange={e => updateGuest(guest.id, { state: e.target.value })}
      className="w-full px-4 py-2 rounded-xl border-2 border-stone-100 bg-stone-50 focus:bg-white focus:border-teal-700 outline-none transition-all font-bold text-stone-900 text-sm appearance-none cursor-pointer"
    >
      <option value="" disabled>Select State</option>
      {INDIAN_STATES.map(state => (
        <option key={state} value={state}>{state}</option>
      ))}
    </select>
  </div>





              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-0.5">{ui.guestCard.fields.travel}</label>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <label key={val ? 'y' : 'n'} className={`flex-1 flex items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all font-bold text-[11px] ${guest.travelAssistance === val ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'bg-stone-100 border-stone-100 text-stone-600 hover:border-stone-300'}`}>
                      <input 
                        type="radio" 
                        name={`assist-${guest.id}`} 
                        checked={guest.travelAssistance === val}
                        onChange={() => updateGuest(guest.id, { travelAssistance: val })}
                        className="hidden" 
                      />
                      {val ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhancements */}
            <div className="mt-8 pt-6 border-t border-stone-100">
               <h4 className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <CheckCircle2 className="w-3.5 h-3.5" /> {ui.guestCard.addons.label}
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${guest.addOns.foodPass ? 'bg-teal-50 border-teal-500' : 'bg-white border-stone-100 hover:border-teal-100'}`}>
                    <input 
                      type="checkbox" 
                      checked={guest.addOns.foodPass}
                      onChange={e => updateGuest(guest.id, { addOns: { ...guest.addOns, foodPass: e.target.checked } })}
                      className="w-4 h-4 rounded-md accent-teal-700" 
                    />
                    <div className="flex-1">
                       <p className="font-bold text-stone-900 text-xs flex items-center justify-between">
                         {ui.guestCard.addons.foodPass} 
                         <button onClick={(e) => { e.preventDefault(); setShowAddOnInfo('food'); }}><Info className="w-3.5 h-3.5 text-teal-500" /></button>
                       </p>
                       <p className="text-[9px] font-bold text-emerald-600 uppercase">₹2,500 Base</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${guest.addOns.adventurePass ? 'bg-teal-50 border-teal-500' : 'bg-white border-stone-100 hover:border-teal-100'}`}>
                    <input 
                      type="checkbox" 
                      checked={guest.addOns.adventurePass}
                      onChange={e => updateGuest(guest.id, { addOns: { ...guest.addOns, adventurePass: e.target.checked } })}
                      className="w-4 h-4 rounded-md accent-teal-700" 
                    />
                    <div className="flex-1">
                       <p className="font-bold text-stone-900 text-xs flex items-center justify-between">
                         {ui.guestCard.addons.adventurePass}
                         <button onClick={(e) => { e.preventDefault(); setShowAddOnInfo('adventure'); }}><Info className="w-3.5 h-3.5 text-teal-500" /></button>
                       </p>
                       <p className="text-[9px] font-bold text-emerald-600 uppercase">₹5,000 Base</p>
                    </div>
                  </label>
               </div>
            </div>

            {/* Extra Stay Logic */}
            <div className="mt-6 bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <label className="flex items-center gap-3 cursor-pointer group mb-4">
                <input 
                  type="checkbox" 
                  checked={guest.addOns.extraStay.enabled}
                  onChange={e => updateGuest(guest.id, { addOns: { ...guest.addOns, extraStay: { ...guest.addOns.extraStay, enabled: e.target.checked } } })}
                  className="w-5 h-5 rounded-md accent-teal-700" 
                />
                <div className="flex-1">
                   <span className="block font-black text-sm text-stone-900">{ui.guestCard.addons.extraStay}</span>
                </div>
                <button onClick={(e) => { e.preventDefault(); setShowAddOnInfo('stay'); }} className="p-1 hover:bg-stone-200 rounded-lg"><Info className="w-4 h-4 text-teal-500" /></button>
              </label>

              {guest.addOns.extraStay.enabled && (
                <div className="animate-slideUp space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {roomTypes.map((room) => (
                      <label key={room.name} className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all cursor-pointer ${guest.addOns.extraStay.type === room.name ? 'border-teal-700 bg-white ring-2 ring-teal-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                        <input 
                          type="radio" 
                          name={`room-${guest.id}`} 
                          checked={guest.addOns.extraStay.type === room.name}
                          onChange={() => updateGuest(guest.id, { addOns: { ...guest.addOns, extraStay: { ...guest.addOns.extraStay, type: room.name } } })}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                          <img src={room.img} className="w-full h-full object-cover" alt={room.name} />
                        </div>
                        <div className="min-w-0">
                           <h5 className="font-bold text-stone-900 text-[9px] truncate">{room.name}</h5>
                           <p className="text-teal-700 font-black text-[8px]">₹{room.price}/nt</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-teal-700" /> {ui.guestCard.extraStay.startDate}
                        </label>
                        <input 
                          type="date"
                          value={guest.addOns.extraStay.startDate}
                          onChange={e => updateGuest(guest.id, { addOns: { ...guest.addOns, extraStay: { ...guest.addOns.extraStay, startDate: e.target.value } } })}
                          className="w-full bg-white border-2 border-stone-100 rounded-lg px-3 py-2 text-xs font-bold text-stone-900 focus:border-teal-700 outline-none"
                        />
                     </div>

                     <div className="sm:w-32 space-y-1">
                        <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-teal-700" /> {ui.guestCard.extraStay.duration}
                        </label>
                        <div className="flex items-center justify-between bg-white border-2 border-stone-100 rounded-lg px-2 py-1.5">
                           <button 
                             onClick={() => updateGuest(guest.id, { addOns: { ...guest.addOns, extraStay: { ...guest.addOns.extraStay, days: Math.max(1, guest.addOns.extraStay.days - 1) } } })}
                             className="text-stone-400 hover:text-teal-700 font-black"
                           ><Minus className="w-4 h-4" /></button>
                           <span className="font-black text-xs text-stone-900">{guest.addOns.extraStay.days}nt</span>
                           <button 
                             onClick={() => updateGuest(guest.id, { addOns: { ...guest.addOns, extraStay: { ...guest.addOns.extraStay, days: guest.addOns.extraStay.days + 1 } } })}
                             className="text-stone-400 hover:text-teal-700 font-black"
                           ><PlusCircle className="w-4 h-4" /></button>
                        </div>
                     </div>

                     <div className="flex-[1.2] bg-teal-700 px-4 py-2.5 rounded-xl text-white flex flex-col justify-center">
                        <span className="text-[8px] font-black text-teal-200 uppercase tracking-widest mb-1">{ui.guestCard.extraStay.periodLabel}</span>
                        <div className="flex items-center gap-2 text-[10px] font-black">
                           <span>{formatDateShort(guest.addOns.extraStay.startDate)}</span>
                           <ArrowRight className="w-3 h-3 text-teal-300" />
                           <span>{calculateEndDate(guest.addOns.extraStay.startDate || '', guest.addOns.extraStay.days)}</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-black text-stone-700 uppercase tracking-widest ml-1 mb-2 block">{ui.guestCard.remark}</label>
              <textarea 
                value={guest.remark}
                onChange={e => updateGuest(guest.id, { remark: e.target.value })}
                placeholder={ui.guestCard.remarkPlaceholder}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-100 bg-stone-50 focus:bg-white focus:border-teal-700 outline-none transition-all resize-none font-bold text-stone-900 text-sm placeholder:text-stone-300"
              />
            </div>
          </div>
        ))}

        <button 
          onClick={addGuest}
          className="w-full py-10 rounded-3xl border-2 border-dashed border-stone-300 flex flex-col items-center gap-3 text-stone-400 hover:text-teal-700 hover:border-teal-400 hover:bg-stone-50 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-white shadow-sm">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em]">{ui.addPartner}</span>
        </button>
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-6 z-[100] shadow-2xl">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button 
            onClick={onBack}
            className="flex-1 bg-white border-2 border-stone-100 py-3.5 rounded-xl font-black text-stone-500 hover:bg-stone-50 transition-all uppercase tracking-widest text-[11px]"
          >
            {ui.footer.back}
          </button>
          <button 
            disabled={!isValid}
            onClick={handleProceedClick}
            className="flex-[2] bg-teal-700 disabled:bg-stone-200 text-white py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 hover:bg-teal-800 transition-all shadow-lg active:scale-95 group"
          >
            {ui.footer.proceed} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Info Modals */}
      {showAddOnInfo && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-sm w-full shadow-2xl animate-scaleUp">
             <div className="h-40 relative">
               <img src={getInfoContent(showAddOnInfo)!.img} className="w-full h-full object-cover" alt="" />
               <button onClick={() => setShowAddOnInfo(null)} className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl p-2 rounded-xl text-white hover:bg-white/40 transition-all">
                 <X className="w-4 h-4" />
               </button>
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
             </div>
             <div className="p-8">
                <h3 className="text-xl font-black text-stone-900 mb-4 tracking-tighter">{getInfoContent(showAddOnInfo)!.title}</h3>
                <p className="text-stone-500 font-medium leading-relaxed mb-8 text-xs">
                   {getInfoContent(showAddOnInfo)!.desc}
                </p>
                <button 
                  onClick={() => setShowAddOnInfo(null)}
                  className="w-full bg-stone-900 text-white py-3 rounded-xl font-black text-sm hover:bg-black transition-all"
                >
                  Okay
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Junior Pricing Pop-up */}
      {agePricingModal.show && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[210] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-sm w-full shadow-2xl animate-scaleUp">
             <div className="h-40 relative">
               <img src={getInfoContent('junior')!.img} className="w-full h-full object-cover" alt="" />
               <button onClick={() => setAgePricingModal({ show: false, affectedGuestIds: [] })} className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl p-2 rounded-xl text-white hover:bg-white/40 transition-all">
                 <X className="w-4 h-4" />
               </button>
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
             </div>
             <div className="p-8">
                <h3 className="text-xl font-black text-stone-900 mb-4 tracking-tighter">{getInfoContent('junior')!.title}</h3>
                <p className="text-stone-500 font-medium leading-relaxed mb-8 text-xs">
                   {getInfoContent('junior')!.desc}
                </p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      setAgePricingModal({ show: false, affectedGuestIds: [] });
                      onProceed();
                    }}
                    className="w-full bg-teal-700 text-white py-3 rounded-xl font-black text-sm hover:bg-teal-800 transition-all"
                  >
                    {getInfoContent('junior')!.cta}
                  </button>
                  <button 
                    onClick={() => {
                      setAgePricingModal({ show: false, affectedGuestIds: [] });
                      onProceed();
                    }}
                    className="w-full bg-stone-100 text-stone-400 py-3 rounded-xl font-black text-xs hover:bg-stone-200"
                  >
                    {getInfoContent('junior')!.back}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestForm;
