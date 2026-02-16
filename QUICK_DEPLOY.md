# 🚀 Quick Deploy Instructions

Follow these steps to deploy your DJ Request App and get a real URL with working QR codes!

---

## Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `dj-request-app` (or whatever you prefer)
3. Make it **Public** or **Private** (your choice)
4. **Don't** check "Initialize this repository with a README"
5. Click **"Create repository"**

---

## Step 2: Push Your Code to GitHub

Copy and paste these commands into your Terminal (one at a time):

```bash
# Navigate to your project
cd "/Users/alexandronakata/Documents/DJ requests"

# Add GitHub as remote (REPLACE with your actual GitHub username!)
git remote add origin https://github.com/YOUR_USERNAME/dj-request-app.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

**Important:** Replace `YOUR_USERNAME` with your actual GitHub username!

---

## Step 3: Deploy to Railway

### 3.1 Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub

### 3.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your `dj-request-app` repository
4. Railway will automatically start deploying! ⏳

### 3.3 Add Environment Variables

1. Click on your project in Railway
2. Go to the **"Variables"** tab
3. Click **"New Variable"** and add these one by one:

   ```
   NODE_ENV = production
   JWT_SECRET = your-super-secret-random-string-change-this
   PORT = 3001
   ```

   **Important:** Change `JWT_SECRET` to something random and secure!

### 3.4 Generate Your Public URL

1. Stay in your project, go to **"Settings"** tab
2. Scroll down to **"Networking"**
3. Under **"Public Networking"**, click **"Generate Domain"**
4. You'll get a URL like: `https://dj-request-app-production.up.railway.app`
5. **Copy this URL!** You'll need it next.

### 3.5 Add CLIENT_URL Variable

1. Go back to **"Variables"** tab
2. Add one more variable:
   ```
   CLIENT_URL = https://your-railway-url.up.railway.app
   ```
   (Use the URL you just got in step 3.4)

3. Railway will automatically redeploy with the new variables

---

## Step 4: Create Your First DJ Account

Since the app is deployed, we need to create a DJ account via the API.

**Option 1: Using Terminal (easiest)**

Replace `YOUR_RAILWAY_URL` with your actual Railway URL, then run:

```bash
curl -X POST https://YOUR_RAILWAY_URL/api/auth/create-dj \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dj@example.com",
    "password": "yourpassword123",
    "venmo_username": "yourvenmo"
  }'
```

**Option 2: Using Browser Console**

1. Open your Railway URL in a browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Paste this code (replace the URL and credentials):

```javascript
fetch('https://YOUR_RAILWAY_URL/api/auth/create-dj', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dj@example.com',
    password: 'yourpassword123',
    venmo_username: 'yourvenmo'
  })
}).then(r => r.json()).then(console.log)
```

If successful, you'll see: `✅ DJ account created successfully!`

---

## Step 5: Start Using Your App! 🎉

1. **Visit your Railway URL** (e.g., `https://dj-request-app-production.up.railway.app`)

2. **Login** with the credentials you just created

3. **Create an event:**
   - Click "Create New Event"
   - Fill in event details
   - Click "Create Event"

4. **Share the QR code:**
   - Download the QR code
   - Share it on social media, print it, or send to attendees
   - When they scan it, they'll go directly to your event!

5. **Manage requests in real-time:**
   - Mark songs as played, skipped, or pinned
   - Toggle queue visibility
   - See upvotes update live

---

## 🎯 Test It Out!

1. On your computer: Open the DJ dashboard at your Railway URL
2. On your phone: Scan the QR code or visit the event URL
3. Submit a song request from your phone
4. Watch it appear instantly in the DJ dashboard!
5. Upvote it and see the number change in real-time

---

## 📱 Sharing Your Event

Attendees can access your event in two ways:

1. **Scan QR Code** - Opens directly to the event page
2. **Visit URL directly** - Share the event URL link

No signup required for attendees - they just scan and request!

---

## 🔄 Making Updates

When you make changes to your code:

```bash
cd "/Users/alexandronakata/Documents/DJ requests"
git add .
git commit -m "Your update description"
git push
```

Railway will automatically detect the push and redeploy! 🚀

---

## ⚠️ Important Notes

- **Free Tier Limits:** Railway free tier includes 500 hours/month (plenty for events!)
- **Database:** SQLite file may reset on Railway restarts. For production use, consider Railway's PostgreSQL addon.
- **Keep Your JWT_SECRET Safe:** Never share it publicly or commit it to GitHub

---

## 🆘 Need Help?

- Check Railway logs: Project → Deployments → Click on latest deployment → View logs
- Check browser console: F12 → Console tab for frontend errors
- Verify environment variables are set correctly in Railway

---

## ✅ You're Done!

Your DJ Request App is now live with:
- ✅ Real public URL
- ✅ Working QR codes
- ✅ Real-time updates
- ✅ Professional event management

Enjoy your events! 🎵🎉
