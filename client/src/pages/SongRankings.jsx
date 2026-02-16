import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, Music2, Copy, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function SongRankings() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [hotSongs, setHotSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'hot'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRankings();
  }, [slug]);

  const loadRankings = async () => {
    try {
      const token = localStorage.getItem('dj_token');

      // Load both rankings and hot songs
      const [rankingsRes, hotRes] = await Promise.all([
        fetch(`${API_BASE_URL}/events/${slug}/song-rankings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/events/${slug}/hot-songs?minUpvotes=3`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (rankingsRes.ok) {
        const rankingsData = await rankingsRes.json();
        setRankings(rankingsData);
      }

      if (hotRes.ok) {
        const hotData = await hotRes.json();
        setHotSongs(hotData);
      }
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyDownloadList = () => {
    const songs = activeTab === 'hot' ? hotSongs : rankings;
    const text = songs
      .map((song) => `${song.song_name} - ${song.artist}`)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToCSV = () => {
    const songs = activeTab === 'hot' ? hotSongs : rankings;
    const csv = [
      ['Song Name', 'Artist', 'Total Upvotes', 'Request Count'],
      ...songs.map((song) => [
        song.song_name,
        song.artist,
        song.total_upvotes,
        song.request_count,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `song-rankings-${slug}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const displaySongs = activeTab === 'hot' ? hotSongs : rankings;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <button
          onClick={() => navigate(`/dj/event/${slug}`)}
          className="mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Event
        </button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Song Rankings</h1>
            <p className="mt-2 text-gray-400">
              See what people are requesting - download songs you don't have yet
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-500" />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Songs ({rankings.length})
          </button>
          <button
            onClick={() => setActiveTab('hot')}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              activeTab === 'hot'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Hot Songs ({hotSongs.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={copyDownloadList}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-700"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy List
              </>
            )}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-purple-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Rankings List */}
        {displaySongs.length === 0 ? (
          <div className="rounded-lg bg-gray-800 p-8 text-center">
            <Music2 className="mx-auto mb-3 h-12 w-12 text-gray-600" />
            <p className="text-gray-400">No songs requested yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displaySongs.map((song, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-750"
              >
                {/* Rank */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-600/20 font-bold text-purple-400">
                  {idx + 1}
                </div>

                {/* Song Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{song.song_name}</h3>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-purple-400">{song.total_upvotes}</div>
                    <div className="text-xs text-gray-500">Upvotes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-400">{song.request_count}</div>
                    <div className="text-xs text-gray-500">Requests</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hot Songs Info */}
        {activeTab === 'hot' && (
          <div className="mt-6 rounded-lg bg-purple-900/20 border border-purple-600/30 p-4">
            <h3 className="mb-2 font-semibold text-purple-400">What are "Hot Songs"?</h3>
            <p className="text-sm text-gray-400">
              These are songs with 3+ upvotes or requested multiple times. These are the ones you
              should prioritize downloading for your Serato hot folder or library.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
