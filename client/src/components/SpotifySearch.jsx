import { useState, useEffect, useRef } from 'react';
import { Search, Music2 } from 'lucide-react';

export default function SpotifySearch({ onSelectSong }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Spotify search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSong = (track) => {
    onSelectSong({
      song_name: track.name,
      artist: track.artist,
      albumArt: track.albumArt,
      spotifyUrl: track.spotifyUrl,
    });
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <label className="mb-2 block text-sm font-medium text-gray-300">
        Search for a song *
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-gray-500" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="w-full rounded-lg bg-zinc-800 border border-purple-900/30 pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          placeholder="Search song or artist..."
          autoComplete="off"
        />

        {loading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-lg bg-zinc-800 border border-purple-900/30 shadow-2xl max-h-96 overflow-y-auto">
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelectSong(track)}
              className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-zinc-700 border-b border-purple-900/20 last:border-b-0"
            >
              {track.albumArt ? (
                <img
                  src={track.albumArt}
                  alt={track.album}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-purple-900/40">
                  <Music2 className="h-6 w-6 text-purple-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-white">{track.name}</p>
                <p className="truncate text-sm text-gray-400">{track.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-lg bg-zinc-800 border border-purple-900/30 p-4 text-center text-gray-400">
          No songs found. Try a different search.
        </div>
      )}
    </div>
  );
}
