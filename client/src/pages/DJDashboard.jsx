import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Calendar, Clock, TrendingUp, LogOut, Settings } from 'lucide-react';

export default function DJDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { dj, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner message="Loading events..." />;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">DJ Dashboard</h1>
            <p className="mt-1 text-gray-400">Welcome back, {dj?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-purple-900/30 px-4 py-2 text-gray-300 transition-colors hover:bg-zinc-800 hover:border-purple-800/50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* Create Event Button */}
        <button
          onClick={() => navigate('/create-event')}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-4 font-semibold text-white transition-all hover:bg-purple-700 active:scale-95 md:w-auto"
        >
          <Plus className="h-6 w-6" />
          Create New Event
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="rounded-lg bg-zinc-900 border border-purple-900/30 p-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-purple-600" />
            <h2 className="mb-2 text-xl font-semibold text-gray-300">No events yet</h2>
            <p className="text-gray-400">Create your first event to start collecting song requests</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/dj/event/${event.slug}`)}
                className="cursor-pointer rounded-lg bg-zinc-900 border border-purple-900/30 p-6 transition-all hover:bg-zinc-800 hover:border-purple-800/50 hover:scale-105 active:scale-95"
              >
                {/* Status Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      event.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {event.status === 'active' ? 'Active' : 'Ended'}
                  </span>
                  {event.queue_visible && event.status === 'active' && (
                    <span className="text-xs text-gray-400">Queue Visible</span>
                  )}
                </div>

                {/* Event Info */}
                <h3 className="mb-2 text-xl font-semibold">{event.name}</h3>

                <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.date)}
                </div>

                {/* Genre Tags */}
                {event.genre_tags && event.genre_tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {event.genre_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-purple-900/40 px-2 py-1 text-xs text-purple-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-purple-900/30 pt-4 text-sm">
                  <span className="text-gray-400">
                    <Clock className="inline h-4 w-4 mr-1" />
                    {new Date(event.created_at * 1000).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  {event.status === 'ended' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/analytics/${event.slug}`);
                      }}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Analytics
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
