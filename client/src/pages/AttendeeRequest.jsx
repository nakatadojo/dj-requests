import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { eventsAPI, requestsAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSession } from '../hooks/useSession';
import LoadingSpinner from '../components/LoadingSpinner';
import VenmoButton from '../components/VenmoButton';
import { Music, ThumbsUp, Clock } from 'lucide-react';

export default function AttendeeRequest() {
  const { slug } = useParams();
  const sessionId = useSession();

  const [event, setEvent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    song_name: '',
    artist: '',
    requester_name: '',
  });

  const loadEvent = async () => {
    try {
      const data = await eventsAPI.getBySlug(slug);
      setEvent(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await requestsAPI.getForEvent(slug);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
    loadRequests();
  }, [slug]);

  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'queue:update' || data.type === 'request:added') {
      loadRequests();
    }
    if (data.type === 'visibility:toggle') {
      loadEvent();
    }
  }, []);

  useWebSocket(slug, handleWebSocketMessage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId) return;

    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      const result = await requestsAPI.submit(slug, {
        ...formData,
        session_id: sessionId,
      });

      if (result.isDuplicate) {
        setMessage({ type: 'info', text: result.message });
      } else {
        setMessage({ type: 'success', text: 'Request submitted successfully!' });
        setFormData({ song_name: '', artist: '', requester_name: '' });
      }

      loadRequests();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (requestId) => {
    if (!sessionId) return;

    try {
      await requestsAPI.upvote(requestId, sessionId);
      loadRequests();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const hasUpvoted = (request) => {
    return request.upvoter_sessions?.includes(sessionId);
  };

  if (loading) return <LoadingSpinner message="Loading event..." />;
  if (!event) return <div className="p-8 text-center">Event not found</div>;
  if (event.status !== 'active') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Event Ended</h1>
          <p className="text-gray-400">This event is no longer accepting requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-purple-600/20 p-4">
            <Music className="h-12 w-12 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">{event.name}</h1>
          <p className="mt-2 text-gray-400">
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          {event.genre_tags && event.genre_tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {event.genre_tags.map((tag, idx) => (
                <span key={idx} className="rounded-full bg-purple-900/40 px-3 py-1 text-sm text-purple-300">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Venmo Button */}
        {event.venmo_username && (
          <div className="mb-6 flex justify-center">
            <VenmoButton venmoUsername={event.venmo_username} />
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg bg-zinc-900 border border-purple-900/30 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Request a Song</h2>

          {message.text && (
            <div
              className={`mb-4 rounded-lg border p-3 text-sm ${
                message.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="song_name" className="mb-2 block text-sm font-medium text-gray-300">
              Song Name *
            </label>
            <input
              type="text"
              id="song_name"
              value={formData.song_name}
              onChange={(e) => setFormData({ ...formData, song_name: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 border border-purple-900/30 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter song title"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="artist" className="mb-2 block text-sm font-medium text-gray-300">
              Artist *
            </label>
            <input
              type="text"
              id="artist"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 border border-purple-900/30 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter artist name"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="requester_name" className="mb-2 block text-sm font-medium text-gray-300">
              Your Name (optional)
            </label>
            <input
              type="text"
              id="requester_name"
              value={formData.requester_name}
              onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 border border-purple-900/30 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Anonymous"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 active:scale-95"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        {/* Live Queue */}
        {event.queue_visible && (
          <div className="rounded-lg bg-zinc-900 border border-purple-900/30 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Live Queue</h2>

            {requests.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No requests yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-lg bg-zinc-800 border border-purple-900/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{request.song_name}</h3>
                        <p className="text-sm text-gray-400">{request.artist}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {request.requester_name} • <Clock className="inline h-3 w-3" />{' '}
                          {new Date(request.created_at * 1000).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUpvote(request.id)}
                        disabled={hasUpvoted(request)}
                        className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
                          hasUpvoted(request)
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-700 hover:bg-zinc-600 border border-purple-900/30'
                        } disabled:cursor-not-allowed`}
                      >
                        <ThumbsUp className={`h-5 w-5 ${hasUpvoted(request) ? 'upvote-animation' : ''}`} />
                        <span className="text-sm font-bold">{request.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
