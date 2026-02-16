# Spotify Integration Setup

Your DJ Request App now uses Spotify to validate song requests! This prevents inappropriate submissions and ensures only real songs can be requested.

## What's Included

- ✅ Spotify song search with autocomplete
- ✅ Album artwork display
- ✅ Real-time search results (debounced)
- ✅ Only verified Spotify tracks can be submitted
- ✅ Prevents fake/inappropriate song requests

## How to Set Up Spotify

### 1. Create a Spotify App

1. Go to [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (or create one)
3. Click "Create app"
4. Fill in the details:
   - **App name**: DJ Request App
   - **App description**: Song request system for DJs
   - **Redirect URI**: Leave blank (we're using Client Credentials flow)
   - **Which API/SDKs are you planning to use**: Web API
5. Click "Save"

### 2. Get Your Credentials

1. In your app dashboard, click "Settings"
2. You'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "View client secret" and copy it

### 3. Add to Railway

1. Go to your Railway project
2. Click on your service → Variables tab
3. Add these environment variables:

```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

4. Click "Deploy" or wait for auto-deployment

## How It Works

**For Attendees:**
1. They search for a song (e.g., "Blinding Lights")
2. Real Spotify results appear with album art
3. They select the actual song from the list
4. Song name and artist are auto-filled from Spotify
5. Submit button is disabled until they select a real song

**Benefits:**
- ✅ No more fake song requests
- ✅ No inappropriate text in song fields
- ✅ Real album artwork for visual appeal
- ✅ Accurate song names and artist names
- ✅ Professional user experience

## Optional: Fallback Mode

If you don't configure Spotify credentials, the search will return empty results but won't break the app. However, **it's highly recommended** to set this up to prevent abuse!

## Testing

Once deployed with Spotify credentials:
1. Go to any active event's attendee page
2. Start typing a song name in the search box
3. You should see real Spotify results with album art
4. Select a song and submit!

---

**Need help?** Check the [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
