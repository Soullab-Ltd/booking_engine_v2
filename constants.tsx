
import React from 'react';
import { EventData, Plan, FoodPreference, Guest } from './types';

export const MOCK_EVENT: EventData = {
  title: "Shreans Daga Foundation: The Quantum Awakening",
  banner: "https://images.unsplash.com/photo-1544161515-4ae6ce6e8584?q=80&w=2000&auto=format&fit=crop",
  date: "Coming Soon 2025",
  time: "06:00 AM Daily",
  venue: "Pyramid Valley International, Bengaluru",
  description: "Join Shreans Daga for a transformative 4-day journey into spiritual science and manifestation. Held at the world-renowned Pyramid Valley, this retreat integrates deep meditation with quantum insights to help you design your destiny."
};

export const MOCK_SCHEDULE = [
  { 
    day: "Day 1", 
    date: "Day One",
    slots: [
      { time: "09:00 AM", title: "Check-in & Registration", desc: "Welcome and orientation at the PVI reception." },
      { time: "11:00 AM", title: "Quantum Intention", desc: "Opening session with Shreans Daga." },
      { time: "01:00 PM", title: "Mindful Lunch", desc: "Sattvic meals at designated dining halls." },
      { time: "04:00 PM", title: "Pyramid Meditation", desc: "Deep meditation inside the Maitreya-Buddha Pyramid." },
      { time: "07:00 PM", title: "Evening Satsang", desc: "Group sharing and frequency alignment." }
    ]
  },
  { 
    day: "Day 2", 
    date: "Day Two",
    slots: [
      { time: "06:00 AM", title: "Sun Salutations", desc: "Morning yoga and breathwork in the valley." },
      { time: "10:00 AM", title: "Spiritual Science", desc: "Decoding the laws of manifestation." },
      { time: "02:30 PM", title: "Silent Contemplation", desc: "Individual practice sessions across the lush campus." },
      { time: "05:00 PM", title: "Workshop: Energy Centers", desc: "Balancing the chakras for physical and mental health." }
    ]
  },
  { 
    day: "Day 3", 
    date: "Day Three",
    slots: [
      { time: "06:30 AM", title: "Inner Silence", desc: "Extended meditation session for deep clarity." },
      { time: "11:00 AM", title: "Manifestation Mastery", desc: "Practical tools for high-vibrational living." },
      { time: "03:00 PM", title: "Nature Walk", desc: "Exploring the healing energies of PVI." },
      { time: "06:00 PM", title: "Sound Healing", desc: "Vibrational therapy for cellular regeneration." }
    ]
  },
  { 
    day: "Day 4", 
    date: "Day Four",
    slots: [
      { time: "07:00 AM", title: "Gratitude Ritual", desc: "Final morning practice and appreciation circle." },
      { time: "10:00 AM", title: "Integration Session", desc: "Planning your spiritual path post-retreat." },
      { time: "12:30 PM", title: "Closing Ceremony", desc: "Final blessings and certification." },
      { time: "02:00 PM", title: "Departure", desc: "Carry the stillness with you." }
    ]
  }
];

export const MOCK_MENTORS = {
  main: {
    name: "Shreans Daga",
    role: "Founder, Shreans Daga Foundation",
    img: "https://images.unsplash.com/photo-1544161515-4ae6ce6e8584?w=600&auto=format&fit=crop",
    bio: "Shreans Daga is a visionary spiritual scientist dedicated to teaching the art of manifestation and high-vibrational living. Having mastered numerous spiritual disciplines, he simplifies complex ancient wisdom into actionable quantum science for the modern world. His mission is to empower individuals to live a life of abundance, joy, and profound inner peace."
  },
  others: [
    {
      name: "Master Dr. Vishwa",
      role: "Pyramid Science Expert",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
      bio: "An expert in the geometry of spiritual spaces, Dr. Vishwa guides seekers in utilizing the unique energy of the Maitreya-Buddha Pyramid for accelerated spiritual growth."
    },
    {
      name: "Sadhvi Meera",
      role: "Bhakti & Meditation Guide",
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop",
      bio: "Sadhvi Meera brings a gentle, heart-centered approach to meditation, focusing on emotional release and deep self-love."
    }
  ]
};

export const MOCK_ROOM_TYPES = [
  {
    name: "PVI Dorms",
    price: 1500,
    desc: "Clean bunk beds in a community setting.",
    img: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&auto=format&fit=crop"
  },
  {
    name: "Deluxe Suite",
    price: 3500,
    desc: "Comfortable attached bathroom suite.",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&auto=format&fit=crop"
  }
];

export const MOCK_INSIGHTS = [
  {
    title: "The Power of the Pyramid",
    text: "Pyramid Valley International houses the world's largest meditation pyramid. Its sacred geometry amplifies cosmic energy, allowing meditators to reach deeper states of consciousness 3 times faster than in conventional spaces.",
    img: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=1200&auto=format&fit=crop"
  },
  {
    title: "Quantum Manifestation",
    text: "Everything is energy. By learning to tune your internal frequency, you can collapse the wave function of possibility into your desired reality. This is the core teaching of the Shreans Daga Foundation.",
    img: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?w=1200&auto=format&fit=crop"
  },
  {
    title: "Sattvic Sustenance",
    text: "Fuel your soul with high-prana meals. Whether at Annadana or Soul Nest, our food is prepared with love and mindfulness to support your energetic transformation.",
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop"
  }
];

export const MOCK_PLANS: Plan[] = [
  {
    id: "pA",
    title: "Plan A: PVI Dorms",
    thumbnail: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop",
    description: "4 Days and 3 Nights - Dorm Accommodation (1 bed per person).",
    fullDescription: "Stay in our clean, community-focused PVI Dorms. This plan is perfect for budget-conscious seekers who enjoy the energy of a group setting. Meals are served at the traditional Annadana hall.",
    discountedPrice: 9000,
    finalPrice: 7000,
    gstDetails: "Inclusive of GST",
    amenities: ["1 Bunk bed (1 Guest)", "192 sqft Space", "Common Bathroom", "Hot water (Fixed time)", "Meals at Annadana", "Free WiFi in Public Area", "Parking Available"]
  },
  {
    id: "pB",
    title: "Plan B: Deluxe Rooms",
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    description: "4 Days and 3 Nights - 1 Bed for 2 Guests with attached bath.",
    fullDescription: "Upgrade to Deluxe Rooms for more privacy and attached facilities. These rooms are perfect for couples or friends traveling together. Daily housekeeping and consistent hot water in the mornings.",
    discountedPrice: 22000,
    finalPrice: 19000,
    gstDetails: "Inclusive of GST",
    amenities: ["1 Bed (2 Guests)", "Attached Bathroom", "192 sqft Space", "Daily Housekeeping", "Morning Hot Water", "Meals at Annadana", "Free WiFi in Public Area", "Parking Available"]
  },
  {
    id: "pC",
    title: "Plan C: Premium Triple",
    thumbnail: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
    description: "4 Days and 3 Nights - Premium Triple Occupancy at Soul Nest.",
    fullDescription: "Experience the premium hospitality of PVI at Soul Nest. With triple occupancy, this room offers 3 single beds, 24/7 hot/cold water, and WiFi directly in the room. Meals are served at the exclusive Soul Nest dining.",
    discountedPrice: 25000,
    finalPrice: 21000,
    gstDetails: "Inclusive of GST",
    amenities: ["3 Single Beds", "Premium Bathroom Essentials", "Elevator Access", "24hr Hot/Cold Water", "Meals at Soul Nest", "Free WiFi in Room", "Swimming Pool Access"]
  },
  {
    id: "pD",
    title: "Plan D: Premium Double",
    thumbnail: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop",
    description: "4 Days and 3 Nights - King Size Bed for 2 Guests.",
    fullDescription: "The Premium Double plan offers a spacious King Size bed for couples or partners seeking the highest level of comfort. Includes premium amenities, in-room tea/coffee maker, and access to all luxury facilities at Soul Nest.",
    discountedPrice: 48000,
    finalPrice: 40000,
    gstDetails: "Inclusive of GST",
    amenities: ["King Size Bed", "Premium Bathroom Essentials", "Elevator Access", "Tea/Coffee Maker", "Meals at Soul Nest", "In-room High-speed WiFi", "Swimming Pool Access"]
  },
  {
    id: "pE",
    title: "Plan E: Premium Single",
    thumbnail: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop",
    description: "4 Days and 3 Nights - Private King Size Bed for 1 Guest.",
    fullDescription: "For the ultimate solitary retreat, Plan E offers private single occupancy in our Premium King rooms. Enjoy total seclusion and luxury, with all the high-end amenities of Soul Nest at your disposal.",
    discountedPrice: 48000,
    finalPrice: 40000,
    gstDetails: "Inclusive of GST",
    amenities: ["Private King Bed", "Solitary Premium Stay", "Elevator Access", "Tea/Coffee Maker", "Meals at Soul Nest", "In-room High-speed WiFi", "Swimming Pool Access"]
  }
];

export const MOCK_COUPONS = [
  { name: "Early Seeker Discount", code: "SDFEARLY", discount: 5, description: "For early registrations." },
  { name: "Group Manifestation", code: "POWER3", discount: 10, description: "Register 3 or more seekers." }
];

export const createEmptyGuest = (): Guest => ({
  id: Math.random().toString(36).substr(2, 9),
  name: "",
  phone: "",
  email: "",
  age: 0,
  foodPreference: FoodPreference.REGULAR,
  travelAssistance: false,
  addOns: {
    foodPass: false,
    adventurePass: false,
    extraStay: {
      enabled: false,
      days: 1,
      type: "PVI Dorms",
      startDate: new Date().toISOString().split('T')[0]
    }
  },
  remark: ""
});

export const TAX_RATE = 0.18;
export const STUDENT_DISCOUNT_PERCENT = 0.10;
export const SERVICE_DISCOUNT_PERCENT = 0.15;
