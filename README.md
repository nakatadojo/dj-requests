# DJ Song Request App

A real-time web application that lets event attendees submit and upvote song requests via QR code, with a live DJ dashboard for managing requests.

## 🚀 Quick Deploy

**Want to deploy this right now?** → See **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** for step-by-step instructions to get a live URL with working QR codes in under 10 minutes!

## Features

- **Attendee Features:**
  - Scan QR code or visit event URL to submit song requests
  - Upvote requests in real-time (one vote per song)
  - View live queue when DJ enables visibility
  - Tip the DJ via Venmo integration
  - Duplicate song detection with auto-upvote

- **DJ Features:**
  - Create and manage events
  - View live request queue with real-time updates
  - Mark songs as played, skip, or pin to "play next"
  - Manage block list of banned songs
  - Toggle queue visibility for attendees
  - Post-event analytics and data export
  - Generate QR codes for easy event access

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express + SQLite + WebSocket
- **Authentication:** JWT for DJ accounts
- **Real-time:** WebSocket for live updates

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd dj-request-app
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. Create your first DJ account:
   ```bash
   npm run create-dj
   ```
   Follow the prompts to enter email, password, and optional Venmo username.

4. Start the development servers:
   ```bash
   npm run dev
   ```

5. Open your browser:
   - DJ Dashboard: http://localhost:5173
   - Event pages will be at: http://localhost:5173/event/{slug}

## Usage

### For DJs

1. Login at http://localhost:5173
2. Create a new event with name, date, and optional genre tags
3. Share the QR code or event URL with attendees
4. Manage requests in real-time from the live queue view
5. Mark songs as played, skip, or pin to top
6. End the event to view analytics

### For Attendees

1. Scan the QR code or visit the event URL
2. Submit song requests with song name, artist, and optional display name
3. Upvote existing requests
4. Tip the DJ via Venmo (if configured)

## Project Structure

```
/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express + SQLite)
├── .env             # Environment variables
└── package.json     # Root package.json with workspaces
```

## Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run create-dj` - Create a new DJ account
- `npm run build` - Build frontend for production
- `npm start` - Start production server

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=3001
JWT_SECRET=your-secret-key-here
DB_PATH=./server/db/requests.db
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed deployment instructions including:
- Railway (recommended - free tier available)
- Render (free tier)
- Fly.io (free tier)

Or use the **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** for fastest deployment to Railway.

## License

MIT
