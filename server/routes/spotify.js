import express from 'express';
import axios from 'axios';

const router = express.Router();

// Spotify credentials cache
let spotifyToken = null;
let tokenExpiry = null;

/**
 * Get Spotify access token using client credentials flow
 */
async function getSpotifyToken() {
  // Return cached token if still valid
  if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
    return spotifyToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        },
      }
    );

    spotifyToken = response.data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return spotifyToken;
  } catch (error) {
    console.error('Failed to get Spotify token:', error.message);
    throw new Error('Spotify authentication failed');
  }
}

/**
 * GET /api/spotify/search
 * Search for songs on Spotify
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const token = await getSpotifyToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: q.trim(),
        type: 'track',
        limit: 10,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const tracks = response.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || null,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
    }));

    res.json(tracks);
  } catch (error) {
    if (error.message === 'Spotify credentials not configured') {
      // Return empty results if Spotify is not configured (optional feature)
      return res.json([]);
    }
    next(error);
  }
});

export default router;
