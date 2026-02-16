# Deployment Guide

This guide will help you deploy the DJ Request App to Railway (free hosting with a real URL).

## Quick Deploy to Railway (Recommended)

Railway provides free hosting with:
- ✅ Real URL (like `https://dj-requests.up.railway.app`)
- ✅ Automatic HTTPS
- ✅ Easy deployment from GitHub
- ✅ Free tier available

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "dj-request-app")
3. **Don't** initialize with README (we already have files)
4. Click "Create repository"

### Step 2: Push Your Code to GitHub

Open Terminal and run these commands from the project directory:

```bash
cd "/Users/alexandronakata/Documents/DJ requests"

# Add all files
git add .

# Commit
git commit -m "Initial commit: DJ Request App"

# Add your GitHub repo as remote (replace with your username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/dj-request-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Railway

1. Go to https://railway.app and sign up/login (use GitHub to login)

2. Click **"New Project"**

3. Select **"Deploy from GitHub repo"**

4. Choose your `dj-request-app` repository

5. Railway will automatically detect it's a Node.js app and start deploying

6. Once deployed, click on your project, then click **"Settings"**

7. **Add Environment Variables:**
   - Click "Variables"
   - Add these variables:
     ```
     NODE_ENV=production
     JWT_SECRET=your-super-secret-random-string-here
     PORT=3001
     ```
   - Railway will automatically provide a URL, so no need to set CLIENT_URL

8. **Generate a Domain:**
   - Go to "Settings" tab
   - Under "Networking" → "Public Networking"
   - Click "Generate Domain"
   - You'll get a URL like: `https://dj-requests.up.railway.app`

9. **Update Environment Variable:**
   - Go back to "Variables"
   - Add `CLIENT_URL=https://your-railway-url.railway.app` (use the URL from step 8)

10. **Redeploy:**
    - Railway will automatically redeploy with the new variables

### Step 4: Create Your First DJ Account

Railway doesn't provide direct terminal access for interactive scripts, so you'll need to create your DJ account via the API:

**Option 1: Use curl (from your local terminal)**

```bash
curl -X POST https://your-railway-url.railway.app/api/auth/create-dj \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dj@example.com",
    "password": "yourpassword123",
    "venmo_username": "yourvenmo"
  }'
```

**Option 2: Use the browser console**

1. Open your deployed app URL
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
```javascript
fetch('https://your-railway-url.railway.app/api/auth/create-dj', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dj@example.com',
    password: 'yourpassword123',
    venmo_username: 'yourvenmo'
  })
}).then(r => r.json()).then(console.log)
```

### Step 5: Start Using Your App!

1. Visit your Railway URL (e.g., `https://dj-requests.up.railway.app`)
2. Login with your DJ credentials
3. Create an event
4. Share the QR code - attendees can scan it and access the event directly!

---

## Alternative: Deploy to Render (Another Free Option)

### Quick Steps:

1. Push code to GitHub (same as above)
2. Go to https://render.com and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name:** dj-request-app
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. Add Environment Variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secret`
   - `PORT=3001`
7. Click "Create Web Service"
8. Get your URL from the dashboard
9. Create DJ account using curl or browser console (same as Railway)

---

## Alternative: Deploy to Fly.io

### Quick Steps:

1. Install Fly CLI: `brew install flyctl`
2. Sign up: `fly auth signup`
3. Navigate to project: `cd "/Users/alexandronakata/Documents/DJ requests"`
4. Launch app: `fly launch`
   - Choose app name
   - Choose region
   - Don't add Postgres
   - Don't deploy yet
5. Set secrets:
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set JWT_SECRET=your-secret-key
   ```
6. Deploy: `fly deploy`
7. Get URL: `fly status`
8. Create DJ account via curl or browser console

---

## Updating Your Deployed App

Whenever you make changes to your code:

```bash
# Commit changes
git add .
git commit -m "Your update description"

# Push to GitHub
git push

# Railway/Render will automatically redeploy!
# For Fly.io, run: fly deploy
```

---

## Troubleshooting

### Railway deployment fails:

Check the build logs in Railway dashboard. Common issues:
- Missing dependencies: Make sure `package.json` includes all dependencies
- Build errors: Check that `npm run build` works locally

### Database issues:

Railway uses ephemeral storage - the database will reset if the app restarts. For production, you'd want to:
- Use Railway's Postgres addon (paid)
- Or use a managed database service
- For now, the SQLite file will work but data may be lost on restarts

### WebSocket issues:

Make sure your Railway/Render URL uses `https://` for the web and `wss://` for WebSocket. The app should handle this automatically.

### Can't access the app:

- Check that the domain is generated in Railway/Render
- Check environment variables are set correctly
- Check deployment logs for errors

---

## Cost

- **Railway:** Free tier includes 500 hours/month (enough for a personal project)
- **Render:** Free tier for web services (may spin down after inactivity)
- **Fly.io:** Free tier includes 3 VMs

All are free to start and work great for this app!

---

## Next Steps After Deployment

1. ✅ Login to your deployed app
2. ✅ Create your first event
3. ✅ Test the QR code with your phone
4. ✅ Share the event URL with friends to test
5. ✅ Enjoy your live DJ request app!

Questions? Check the main README.md for more details.
