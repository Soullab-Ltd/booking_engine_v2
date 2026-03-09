
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'eventsbooking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mock data from the SQL dump provided by the user
const MOCK_DB = {
  events: [
    { EventID: 1, EventName: 'Adventure Camp 2026', EventStartDate: '2026-03-10', EventEndDate: '2026-03-15', Location: 'Lonavala', EventType: 'Adventure', bannerImage: 'https://picsum.photos/seed/adventure/1200/600' },
    { EventID: 2, EventName: 'Wellness Retreat', EventStartDate: '2026-04-01', EventEndDate: '2026-04-05', Location: 'Goa', EventType: 'Wellness', bannerImage: 'https://picsum.photos/seed/wellness/1200/600' }
  ],
  plans: [
    { planID: 24, PlanTitle: 'Premium Wedding Package', PlanSubtitle: 'Best for 500 Guests', PlanPrice: 250000, OfferPrice: 225000, PlanDescription: 'Includes decoration, catering and photography', bannerImage: 'https://picsum.photos/seed/wedding/800/600', gstType: 'exclusive', gstRate: 18 },
    { planID: 27, PlanTitle: 'Child Plan Example', PlanSubtitle: 'Perfect for kids', PlanPrice: 5000, OfferPrice: 4500, PlanDescription: 'This is a child plan with parent plans.', bannerImage: 'https://picsum.photos/seed/child/800/600', gstType: 'exclusive', gstRate: 5 },
    { planID: 31, PlanTitle: 'Family Deluxe Plan', PlanSubtitle: 'Comfort for the whole family', PlanPrice: 25000, OfferPrice: 21000, PlanDescription: 'Includes catering and decoration', bannerImage: 'https://picsum.photos/seed/family/800/600', gstType: 'exclusive', gstRate: 12 }
  ],
  event_plans: [
    { plan_id: 24, event_id: 1 },
    { plan_id: 27, event_id: 1 },
    { plan_id: 31, event_id: 1 }
  ],
  icons: [
    { id: 1, Title: 'Swimming Pool', PlanID: 31 },
    { id: 2, Title: 'Kids Play Area', PlanID: 31 },
    { id: 3, Title: 'Free Breakfast', PlanID: 31 },
    { id: 7, Title: 'Trekking', PlanID: 3 },
    { id: 8, Title: 'Campfire', PlanID: 3 }
  ]
};

// API Routes
app.get('/api/event/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  try {
    const [rows]: any = await pool.execute(
      'SELECT * FROM Events WHERE EventID = ? AND is_deleted = 0',
      [eventId]
    );

    if (rows.length === 0) throw new Error('Not found');
    const event = rows[0];
    res.json({
      id: event.EventID,
      title: event.EventName,
      banner: event.bannerImage,
      date: `${event.EventStartDate} to ${event.EventEndDate}`,
      time: "06:00 AM Daily",
      venue: event.Location,
      description: event.EventType + " Event"
    });
  } catch (error) {
    // Fallback to Mock Data for Preview
    const mockEvent = MOCK_DB.events.find(e => e.EventID === eventId);
    if (mockEvent) {
      res.json({
        id: mockEvent.EventID,
        title: mockEvent.EventName,
        banner: mockEvent.bannerImage,
        date: `${mockEvent.EventStartDate} to ${mockEvent.EventEndDate}`,
        time: "06:00 AM Daily",
        venue: mockEvent.Location,
        description: mockEvent.EventType + " Event"
      });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  }
});

app.get('/api/event/:id/plans', async (req, res) => {
  const eventId = parseInt(req.params.id);
  try {
    const [plans]: any = await pool.execute(`
      SELECT p.* 
      FROM Plans p
      JOIN event_plans ep ON p.planID = ep.plan_id
      WHERE ep.event_id = ? AND p.isActive = 1
    `, [eventId]);

    const planIds = plans.map((p: any) => p.planID);
    const [icons]: any = planIds.length > 0 ? await pool.execute(
      `SELECT * FROM PlanDetailIcons WHERE PlanID IN (${planIds.join(',')})`
    ) : [[]];

    const formattedPlans = plans.map((p: any) => {
      const planIcons = icons
        .filter((icon: any) => icon.PlanID === p.planID)
        .map((icon: any) => icon.Title);

      return {
        id: p.planID.toString(),
        title: p.PlanTitle,
        thumbnail: p.bannerImage || `https://picsum.photos/seed/plan${p.planID}/800/600`,
        description: p.PlanSubtitle || (p.PlanDescription ? p.PlanDescription.substring(0, 100) : ""),
        fullDescription: p.PlanDescription,
        discountedPrice: p.PlanPrice,
        finalPrice: p.OfferPrice || p.PlanPrice,
        gstDetails: p.gstType === 'inclusive' ? 'Inclusive of GST' : `+ ${p.gstRate}% GST`,
        amenities: planIcons.length > 0 ? planIcons : ["Standard Amenities"]
      };
    });

    res.json(formattedPlans);
  } catch (error) {
    // Fallback to Mock Data for Preview
    const mockPlanIds = MOCK_DB.event_plans
      .filter(ep => ep.event_id === eventId)
      .map(ep => ep.plan_id);
    
    const mockPlans = MOCK_DB.plans.filter(p => mockPlanIds.includes(p.planID));
    
    const formattedPlans = mockPlans.map((p: any) => {
      const planIcons = MOCK_DB.icons
        .filter((icon: any) => icon.PlanID === p.planID)
        .map((icon: any) => icon.Title);

      return {
        id: p.planID.toString(),
        title: p.PlanTitle,
        thumbnail: p.bannerImage || `https://picsum.photos/seed/plan${p.planID}/800/600`,
        description: p.PlanSubtitle || (p.PlanDescription ? p.PlanDescription.substring(0, 100) : ""),
        fullDescription: p.PlanDescription,
        discountedPrice: p.PlanPrice,
        finalPrice: p.OfferPrice || p.PlanPrice,
        gstDetails: p.gstType === 'inclusive' ? 'Inclusive of GST' : `+ ${p.gstRate}% GST`,
        amenities: planIcons.length > 0 ? planIcons : ["Standard Amenities"]
      };
    });

    res.json(formattedPlans);
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
