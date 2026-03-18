# Car Flip Tracker — Project Progress

## What This App Is
A full-stack web app built for my dad who flips used cars as a hobby.
He buys damaged cars at IAA auctions, repairs them, and sells on Facebook Marketplace.
He donates 35% of profits to church work.

## Deployed URLs
- **Frontend (Vercel):** https://car-flip-tracker.vercel.app
- **Backend (Railway):** https://car-flip-tracker-production.up.railway.app
- **GitHub:** https://github.com/nicklohmann/car-flip-tracker

## Tech Stack (PERN)
- **Frontend:** React + Vite, React Router, Axios
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Image Storage:** Cloudinary
- **APIs Used:**
  - NHTSA (VIN decoder — free, no key needed)
  - Anthropic Claude API (AI damage estimation from photos)
- **Deployed on:** Railway (backend + DB) + Vercel (frontend)

## Project Structure
```
car-flip-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CarList.jsx      # Home page, lists all cars
│   │   │   ├── CarDetail.jsx    # Individual car page
│   │   │   ├── AddCar.jsx       # Add new car form
│   │   │   └── Dashboard.jsx    # Completed flips & profit summary
│   │   ├── api.js               # Axios instance with base URL
│   │   ├── styles.css           # Global dark theme styles
│   │   └── main.jsx             # Router setup
├── server/                 # Express backend
│   ├── routes/
│   │   ├── cars.js         # CRUD routes for cars
│   │   ├── parts.js        # CRUD routes for parts
│   │   ├── images.js       # Cloudinary image upload
│   │   └── estimate.js     # Anthropic AI damage estimation
│   ├── index.js            # Express app entry point
│   └── .env                # Environment variables (not in git)
├── SCHEMA.md               # Database schema documentation
└── PROGRESS.md             # This file
```

## Database Schema

### cars table
- id, make, model, year, vin, mileage
- drivetrain (AWD/FWD), title_status, damage_type
- kbb_trade_in, kbb_private, iaa_acv
- repair_estimate, contingency, labor_hours, labor_rate
- iaa_fees, tax_reg_insurance, actual_bid, iaa_cost
- status (evaluating/active/sold/passed)
- sold_price, sold_date, sold_platform
- images (TEXT array of Cloudinary URLs)
- notes (TEXT)

### parts table
- id, car_id (foreign key), part_name, vendor, cost

## Features Built
- [x] VIN decoder — paste VIN, auto-fills make/model/year/drivetrain via NHTSA API
- [x] Add car form with live bid calculator (95% KBB trade-in formula)
- [x] Photo upload to Cloudinary
- [x] AI damage estimator — uploads photos to Claude API, returns parts list with costs
- [x] Parts tracker — add/remove parts per car, running total updates financials
- [x] Edit car — update any field after saving
- [x] Notes field — for auction observations
- [x] Status tracking — evaluating → active → sold → passed
- [x] Church donation calculator — 35% of profit shown on detail and dashboard
- [x] Completed flips dashboard — total profit, donations, flip history
- [x] Dark theme UI — automotive/utilitarian aesthetic
- [x] Deployed to Railway + Vercel

## Environment Variables Needed
### server/.env
```
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
DB_NAME=car_flip_tracker
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ANTHROPIC_API_KEY=
```

### client/.env
```
VITE_API_URL=http://localhost:5000
```

## How to Run Locally
```bash
# Terminal 1 — Backend
cd server
node index.js

# Terminal 2 — Frontend
cd client
npm run dev
```

## What's Left / Ideas for Later
- [ ] Price range warning — flag cars outside $5k-$10k sweet spot
- [ ] Preferred models quick filter (Equinox, Escape, Trax, Traverse, Ecosport)
- [ ] Authentication — login so only dad can access it
- [ ] Sell price entry when marking a car as sold
- [ ] Mobile optimization — make it easier to use on phone at auctions
- [ ] Parts templates — pre-load common parts by damage type
- [ ] car-part.com quick link — opens pre-searched for the car's make/model/year

## Dad's Formula (for reference)
- Target sell price = KBB good trade-in × 0.95 (rebuilt title discount)
- Max bid = Target sell price - repair estimate - contingency - IAA fees - tax/reg/insurance
- Church donation = profit × 0.35
- Sweet spot: sell price $5,000 - $10,000
- Preferred models: Chevy Trax, Equinox, Traverse / Ford Ecosport, Escape
- Prefers AWD over FWD (easier to sell)