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
      artistIds: track.artists.map(a => a.id),
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

/**
 * Fetch genres for given artist IDs from Spotify API
 */
export async function getArtistGenres(artistIds) {
  if (!artistIds || artistIds.length === 0) return [];

  try {
    const token = await getSpotifyToken();
    const ids = artistIds.slice(0, 50).join(','); // Spotify max 50

    const response = await axios.get('https://api.spotify.com/v1/artists', {
      params: { ids },
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const genres = new Set();
    for (const artist of response.data.artists) {
      if (artist && artist.genres) {
        artist.genres.forEach(g => genres.add(g.toLowerCase()));
      }
    }
    return [...genres];
  } catch (error) {
    console.error('Failed to fetch artist genres:', error.message);
    return [];
  }
}

export default router;
