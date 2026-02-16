import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Download, TrendingUp, Users, Music, SkipForward } from 'lucide-react';

export default function Analytics() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      const [eventData, analyticsData] = await Promise.all([
        eventsAPI.getBySlug(slug),
        eventsAPI.getAnalytics(slug),
      ]);
      setEvent(eventData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportJSON = () => {
    const data = { event, analytics };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-analytics.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!analytics?.topSongs) return;

    const headers = ['Song', 'Artist', 'Upvotes', 'Requester'];
    const rows = analytics.topSongs.map(s => [
      s.song_name,
      s.artist,
      s.upvotes,
      s.requester_name,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-top-songs.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner message="Loading analytics..." />;
  if (!event || !analytics) return <div className="p-8 text-center">Data not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="mt-1 text-gray-400">Event Analytics</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportJSON}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700"
            >
              <Download className="h-5 w-5" />
              JSON
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700"
            >
              <Download className="h-5 w-5" />
              CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-800 p-6">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-venmo" />
              <div>
                <div className="text-3xl font-bold">{analytics.totalRequests}</div>
                <div className="text-sm text-gray-400">Total Requests</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-800 p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-3xl font-bold">{analytics.uniqueRequesters}</div>
                <div className="text-sm text-gray-400">Unique Attendees</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-800 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <div>
                <div className="text-3xl font-bold">{analytics.played}</div>
                <div className="text-sm text-gray-400">Songs Played ({analytics.playedPercentage}%)</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-800 p-6">
            <div className="flex items-center gap-3">
              <SkipForward className="h-8 w-8 text-red-400" />
              <div>
                <div className="text-3xl font-bold">{analytics.skipped}</div>
                <div className="text-sm text-gray-400">Songs Skipped ({analytics.skippedPercentage}%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Songs */}
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Top 10 Most Requested Songs</h2>

          {analytics.topSongs.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No data available</p>
          ) : (
            <div className="space-y-2">
              {analytics.topSongs.map((song, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-gray-700 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-venmo/20 font-bold text-venmo">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{song.song_name}</div>
                      <div className="text-sm text-gray-400">{song.artist}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-venmo">{song.upvotes}</div>
                    <div className="text-xs text-gray-400">upvotes</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Average Upvotes */}
        <div className="mt-6 rounded-lg bg-gray-800 p-6 text-center">
          <div className="text-4xl font-bold text-venmo">{analytics.avgUpvotes}</div>
          <div className="mt-2 text-gray-400">Average Upvotes per Request</div>
        </div>
      </div>
    </div>
  );
}
