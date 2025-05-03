# 🛣️ Road Trip Planner

A customizable, intelligent road trip planner where users enter a start and end destination along with preferences to generate an optimized trip plan with curated stops, gas stations, and live data like traffic and weather.

---

## 🚀 Features (MVP)

- Input start and end locations
- Choose route preferences (e.g., scenic, food, historical)
- Get a list of suggested stops based on preferences and route

---

## 🔮 Features (Upcoming)

- 🔧 **Vehicle Information Lookup**:
  - Enter by VIN, year/make/model, or license plate
  - Auto-fetch vehicle MPG/fuel economy data

- ⛽ **Fuel Optimization**:
  - Estimate fuel consumption and total trip cost
  - Identify the cheapest gas stations along the route

- 🧭 **Adventure Discovery**:
  - Yelp API integration for top-rated stops (food, services, attractions)
  - Google Things To Do API for popular activities and destinations

- 🌦️ **Live Services**:
  - Real-time traffic monitoring and rerouting
  - Live weather forecasting for the trip and stops

---

## 🧱 Tech Stack

### Core
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Language**: JavaScript (Rust planned for performance-critical modules)
- **Routing API**: OpenRouteService or Google Maps API

### Development Tools
- **Version Control**: Git + GitHub (public repo)
- **Linter**: ESLint
- **Formatter**: Prettier
- **Testing**: Jest (unit) + Cypress (end-to-end)
- **Environment Config**: dotenv

---

## 🌐 API Integrations

| Feature                      | API/Service                          | Status     |
|-----------------------------|--------------------------------------|------------|
| Routing & Directions        | OpenRouteService / Google Maps API   | 🔜 Planned |
| Vehicle Fuel Economy        | FuelEconomy.gov API                  | 🔜 Planned |
| Fuel Prices                 | GasBuddy API / AAA Fuel Finder       | 🔜 Planned |
| Attractions & Reviews       | Yelp Fusion API                      | 🔜 Planned |
| Things to Do                | Google Things To Do API              | 🔜 Planned |
| Weather                     | OpenWeatherMap / WeatherAPI          | 🔜 Planned |
| Traffic                     | Google Maps Traffic API              | 🔜 Planned |

---

## 📁 Project Structure

```
road-trip-planner/
├── client/                     # React frontend
│   ├── public/                 # Static assets
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Page-level views (Home, Planner, etc.)
│       ├── hooks/              # Custom React hooks
│       ├── services/           # Handles API requests
│       ├── styles/             # Global styles and themes
│       └── App.jsx             # App entry point

├── server/                     # Node.js backend
│   ├── controllers/            # Request handlers for each route
│   ├── routes/                 # Express route definitions
│   ├── services/               # Integration logic for third-party APIs
│   ├── utils/                  # Helper functions (e.g., formatting, validation)
│   └── index.js                # Express server entry point

├── shared/                     # Shared logic/types between client and server
├── scripts/                    # Dev scripts or mock data utilities
├── .env                        # Environment variables
├── .gitignore
├── package.json
├── vite.config.js              # Frontend config (Vite)
└── README.md
```

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/road-trip-planner.git
cd road-trip-planner

# Install dependencies
npm install

```
---

## Testing

```bash
# Run unit tests
nmp run test 

# Launch Cypress for E2E
npx cpyress open



