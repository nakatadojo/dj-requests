# Getting Started with DJ Request App

## Prerequisites

You'll need to install Node.js (version 18 or higher) to run this application.

### Install Node.js

**Option 1: Using Homebrew (Recommended for macOS)**
```bash
brew install node
```

**Option 2: Download from nodejs.org**
Visit https://nodejs.org/ and download the LTS version for your operating system.

**Verify Installation:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

## Installation Steps

### 1. Install Dependencies

First, install the root dependencies and both client and server dependencies:

```bash
# From the project root directory
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Create Your First DJ Account

Before you can use the app, you need to create a DJ account:

```bash
npm run create-dj
```

You'll be prompted to enter:
- **Email:** Your login email
- **Password:** At least 6 characters
- **Venmo Username (optional):** Your Venmo handle (without the @)

Example:
```
Email: dj@example.com
Password: mypassword123
Venmo Username (optional, press Enter to skip): myvenmo
```

The script will confirm when your account is created successfully.

### 3. Start the Development Servers

Start both the backend server and frontend development server:

```bash
npm run dev
```

This will start:
- **Backend API:** http://localhost:3001
- **Frontend App:** http://localhost:5173

### 4. Login to the DJ Dashboard

1. Open your browser to http://localhost:5173
2. Login with the credentials you created
3. You'll be redirected to the DJ Dashboard

---

## How to Use the App

### For DJs

#### Creating an Event

1. From the Dashboard, click **"Create New Event"**
2. Fill in the event details:
   - **Event Name:** e.g., "Friday Night Party"
   - **Date:** Select the event date
   - **Genre Tags (optional):** e.g., "Hip Hop, R&B, Pop"
   - **Venmo Username (optional):** Your Venmo handle for tips
   - **Queue Visibility:** Toggle whether attendees can see the queue
3. Click **"Create Event"**

#### Managing the Live Queue

After creating an event, you'll see the **Live Queue View** with:

- **QR Code:** Download or share for attendees to scan
- **Event URL:** Copy and share the link
- **Request Queue:** All song requests sorted by upvotes
- **Queue Visibility Toggle:** Show/hide queue from attendees
- **Action Buttons for Each Request:**
  - **Pin:** Move to top of queue (play next)
  - **Played:** Mark as played and remove from queue
  - **Skip:** Remove without playing
- **Search:** Filter requests by song, artist, or requester name

#### Managing Block List

1. From the Dashboard or Live View, click **"Manage Block List"**
2. Add song patterns to block (e.g., "Baby Shark")
3. Blocked songs cannot be requested at any of your events
4. Pattern matching is case-insensitive and partial (blocks any song containing the text)

#### Viewing Analytics

1. End an event by clicking **"End Event"** in the Live View
2. You'll be redirected to the **Analytics** page
3. View metrics like:
   - Total requests
   - Unique attendees
   - Songs played vs skipped
   - Top 10 most requested songs
   - Average upvotes per request
4. Export data as JSON or CSV

### For Attendees

1. **Scan the QR code** or visit the event URL shared by the DJ
2. You'll see the event page with:
   - Event name and date
   - Genre tags (if set by DJ)
   - **Tip the DJ** button (if Venmo is configured)
3. **Submit a request:**
   - Enter song name (required)
   - Enter artist (required)
   - Enter your name (optional, defaults to "Anonymous")
   - Click **"Submit Request"**
4. **Upvote existing requests** (if queue is visible):
   - Click the thumbs up button
   - You can only upvote once per song
5. **Duplicate detection:**
   - If you request a song that's already in the queue, your upvote will be automatically added instead

---

## Features

### Real-Time Updates

The app uses WebSocket connections to provide live updates:
- New requests appear instantly
- Upvote counts update in real-time
- Queue visibility changes propagate immediately
- No page refresh needed

### Duplicate Prevention

When an attendee submits a song that's already requested:
- The app detects duplicates using fuzzy matching (case-insensitive)
- Automatically upvotes the existing request
- Shows a friendly message to the attendee

### Session-Based Upvoting

- Each attendee gets a unique session ID (stored in browser)
- Can only upvote each song once
- Session persists across page reloads
- No login required for attendees

### QR Code Sharing

- Auto-generated QR code for each event
- Downloadable as PNG
- One-click URL copying
- Mobile-optimized scanning

### Venmo Integration

- DJ sets Venmo username in event or profile
- Attendees see "Tip the DJ" button
- Mobile: Opens Venmo app directly
- Desktop: Opens Venmo website
- No payment processing on our end (just deep linking)

---

## Project Structure

```
/Users/alexandronakata/Documents/DJ requests/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                  # Express backend
│   ├── db/                 # Database and schema
│   ├── routes/             # API routes
│   ├── middleware/         # Auth and error handling
│   ├── utils/              # Helper functions
│   ├── scripts/            # CLI scripts
│   └── server.js           # Main server file
├── .env                     # Environment variables
├── package.json            # Root package.json
└── README.md
```

---

## Environment Variables

The `.env` file in the root directory contains:

```env
PORT=3001                                    # Backend server port
JWT_SECRET=your-secret-key-change-this      # Change this in production!
DB_PATH=./server/db/requests.db             # SQLite database path
CLIENT_URL=http://localhost:5173            # Frontend URL
NODE_ENV=development                         # Environment
```

**⚠️ Important:** Change the `JWT_SECRET` before deploying to production!

---

## Common Commands

```bash
# Start development servers (client + server)
npm run dev

# Create a new DJ account
npm run create-dj

# Build for production
npm run build

# Start production server
npm start

# Start server only (development)
npm run server:dev

# Start client only (development)
npm run client:dev
```

---

## Troubleshooting

### Port Already in Use

If you see an error about port 3001 or 5173 being in use:

```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues

If you encounter database errors, try deleting and recreating:

```bash
rm server/db/requests.db
npm run server:dev  # This will recreate the database
```

### WebSocket Connection Issues

Make sure both client and server are running:
- Server: http://localhost:3001
- Client: http://localhost:5173
- WebSocket: ws://localhost:3001/ws

### Module Not Found Errors

Reinstall dependencies:

```bash
# Root dependencies
npm install

# Client dependencies
cd client && npm install && cd ..

# Server dependencies (if using workspaces, this may not be needed)
cd server && npm install && cd ..
```

---

## Next Steps

1. **Test the App:**
   - Create your first event
   - Open the event URL in a different browser/incognito window
   - Submit requests as an attendee
   - Manage the queue as the DJ

2. **Customize:**
   - Update the `.env` file with your own secrets
   - Modify the dark theme colors in `tailwind.config.js`
   - Add your logo or branding

3. **Deploy (Future):**
   - The app is ready to deploy to platforms like Railway, Fly.io, or your own VPS
   - Remember to set production environment variables
   - Use a proper domain name for the event URLs

---

## Support

If you encounter any issues:

1. Check the browser console for errors (F12)
2. Check the server logs in your terminal
3. Verify all dependencies are installed
4. Make sure Node.js version is 18 or higher

Happy DJing! 🎵
