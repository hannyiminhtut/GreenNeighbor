# GreenNeighbor

**GreenNeighbor** is an AI-assisted smart waste management platform that helps
communities report, confirm, and collect waste. It combines location-aware
reporting, AI image verification, duplicate detection, collection workflows,
rewards, notifications, leaderboards, and staff PDF reports in one responsive
web application.

The product subtitle is **Smart Waste Management System**.

## Current working state

The following features are implemented in the current codebase:

- Web3Auth login using the Sapphire Devnet configuration and Ethereum Sepolia.
- Automatic user lookup or creation from the authenticated email.
- A redesigned, responsive GreenNeighbor header and Report Waste interface.
- Waste-photo upload to Cloudinary through a server-side API route.
- Gemini verification of the reported waste type, quantity, and confidence.
- OpenStreetMap location search, reverse geocoding, browser geolocation, and
  precise map-point selection.
- Nearby duplicate-candidate lookup and Gemini image comparison.
- Waste-case grouping so multiple reports can confirm one physical waste pile.
- Recent community reports with Myanmar-time formatting.
- Collection-task list, search, pagination, filters, and map visualization.
- Protection that prevents users from collecting waste they reported.
- Rule-based collector recommendation with an optional Gemini explanation.
- AI verification of collection-completion photos.
- Reward points, transaction history, redemption, notifications, and a
  leaderboard.
- Staff-only PDF reports generated with Puppeteer.
- Jest coverage for the PDF report API and rendering helpers.

## Main user workflow

### Report waste

1. Sign in through Web3Auth.
2. Upload a clear image of the waste.
3. Verify the image with Gemini.
4. Search for an address or select a point on OpenStreetMap.
5. Submit the report.
6. The image is stored in Cloudinary, nearby reports are checked for
   duplicates, and the report is attached to a new or existing waste case.
7. Reporting points, a transaction, and a notification are created.

### Collect waste

1. Open an available collection task.
2. Start collection; the task is assigned to the current collector.
3. Upload a completion photo.
4. Gemini checks whether the waste type and quantity match the report.
5. A successful verification completes the task and awards collector points.

## Application routes

| Route | Purpose |
|---|---|
| `/` | Dashboard and platform overview |
| `/report` | Verify and submit waste reports |
| `/collect` | Browse, map, accept, and verify collection tasks |
| `/rewards` | View balance, transactions, and redeemable rewards |
| `/leaderboard` | Community ranking |
| `/download` | Staff-only PDF report downloads |
| `/login` | Login guidance |
| `/unauthorized` | Access-denied page |

## API routes

| Endpoint | Purpose |
|---|---|
| `POST /api/verify-waste` | Verify report or collection images with Gemini |
| `POST /api/report-images` | Validate and upload report images to Cloudinary |
| `POST /api/detect-duplicate` | Compare a new image with nearby report images |
| `POST /api/dispatch-explanation` | Explain a rule-based collector recommendation |
| `GET /api/reports/download?type=...` | Generate a staff PDF report |

## Technology stack

- Next.js 14 App Router, React 18, and TypeScript
- Tailwind CSS, Radix UI, and Lucide icons
- Web3Auth
- Neon PostgreSQL and Drizzle ORM
- Google Gemini (`gemini-3.6-flash`)
- Cloudinary image storage
- Leaflet, React Leaflet, OpenStreetMap, and Nominatim
- Puppeteer PDF generation
- Jest and Testing Library

## Database model

- `users` — identity, role, and creation date
- `waste_cases` — one physical waste pile with coordinates and case status
- `reports` — individual reports, AI result, location, image URL, and case link
- `rewards` — user reward totals and reward metadata
- `collected_wastes` — verified collection records
- `notifications` — unread/read user messages
- `transactions` — earned and redeemed point history

## Local setup

### Requirements

- Node.js 20 LTS or newer
- npm 10 or newer
- PostgreSQL database (Neon is supported)
- Web3Auth project credentials
- Google Gemini API key
- Cloudinary account credentials

### Installation

```bash
git clone https://github.com/diaskalana/smart-waste-management-system.git
cd smart-waste-management-system
npm ci
```

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID=your_web3auth_client_id
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`DATABASE_URL`, `GEMINI_API_KEY`, and all Cloudinary credentials are
server-only. Do not expose them with a `NEXT_PUBLIC_` prefix.

Create or update the schema:

```bash
npm run db:push
```

Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npx tsc --noEmit
npx jest --runInBand
npm run build
```

The current Jest suite contains four passing tests covering PDF request
validation and report-rendering helpers.

## Current operational notes

- External services require valid credentials and network access.
- Public Nominatim is queried only after a user initiates search, reverse
  geocoding, or location confirmation; it is not used as continuous
  autocomplete.
- Duplicate detection first narrows candidates by distance, then compares up
  to three safe Cloudinary images with Gemini.
- Dispatch selection is deterministic and rule-based. Gemini explains the
  chosen result but does not replace the matching rules.
- Reward persistence is implemented in the application database; Web3Auth is
  used for authentication, not for on-chain reward settlement.
- Staff report access depends on the user role stored in the database.

## Contributors

- Weerasinghe C.D.
- Dias D.D.K.S.
- Sandeepa K.B.A.R.

Contributions through focused pull requests are welcome.
