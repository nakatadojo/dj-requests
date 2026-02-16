import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { eventsAPI, requestsAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSession } from '../hooks/useSession';
import LoadingSpinner from '../components/LoadingSpinner';
import VenmoButton from '../components/VenmoButton';
import SpotifySearch from '../components/SpotifySearch';
import { Music, ThumbsUp, Clock, X, CheckCircle, Music2 } from 'lucide-react';

export default function AttendeeRequest() {
  const { slug } = useParams();
  const sessionId = useSession();

  const [event, setEvent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [canCloseModal, setCanCloseModal] = useState(false);

  const [formData, setFormData] = useState({
    song_name: '',
    artist: '',
    requester_name: '',
    albumArt: null,
  });

  const [selectedSong, setSelectedSong] = useState(null);
  const [upvotedRequests, setUpvotedRequests] = useState(new Set());

  const loadEvent = async () => {
    try {
      const data = await eventsAPI.getBySlug(slug);
      setEvent(data);
    } catch (err) {
      console.error(err);
      setEvent(null);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await requestsAPI.getForEvent(slug);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRequests([]);
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

    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      const result = await requestsAPI.submit(slug, formData);

      if (result.isDuplicate) {
        setMessage({ type: 'info', text: result.message });
      } else {
        // Show success modal
        setShowSuccessModal(true);
        setCanCloseModal(false);
        setFormData({ song_name: '', artist: '', requester_name: '', albumArt: null });
        setSelectedSong(null);

        // Enable close button after 5 seconds
        setTimeout(() => {
          setCanCloseModal(true);
        }, 5000);
      }

      loadRequests();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    if (canCloseModal) {
      setShowSuccessModal(false);
      setCanCloseModal(false);
    }
  };

  const handleUpvote = async (requestId) => {
    // Prevent double-clicking
    if (upvotedRequests.has(requestId)) {
      setMessage({ type: 'error', text: 'You have already upvoted this song' });
      return;
    }

    // Optimistically mark as upvoted
    setUpvotedRequests(prev => new Set([...prev, requestId]));

    try {
      await requestsAPI.upvote(requestId);
      loadRequests();
    } catch (err) {
      // If failed, remove from local upvoted set
      setUpvotedRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setMessage({ type: 'error', text: err.message });
      // Still reload to get updated state from server
      setTimeout(() => loadRequests(), 500);
    }
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

          {/* Spotify Search */}
          <div className="mb-4">
            <SpotifySearch
              onSelectSong={(song) => {
                setSelectedSong(song);
                setFormData({
                  ...formData,
                  song_name: song.song_name,
                  artist: song.artist,
                  albumArt: song.albumArt,
                });
              }}
            />
          </div>

          {/* Selected Song Display */}
          {selectedSong && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-purple-900/20 border border-purple-600/30 p-4">
              {selectedSong.albumArt ? (
                <img
                  src={selectedSong.albumArt}
                  alt={selectedSong.song_name}
                  className="h-16 w-16 rounded object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-purple-900/40">
                  <Music2 className="h-8 w-8 text-purple-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-white">{selectedSong.song_name}</p>
                <p className="text-sm text-gray-400">{selectedSong.artist}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedSong(null);
                  setFormData({ ...formData, song_name: '', artist: '', albumArt: null });
                }}
                className="rounded-full bg-zinc-800 p-2 text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

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
            disabled={submitting || !selectedSong}
            className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {submitting ? 'Submitting...' : selectedSong ? 'Submit Request' : 'Search for a song first'}
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
                        disabled={upvotedRequests.has(request.id)}
                        className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
                          upvotedRequests.has(request.id)
                            ? 'bg-purple-600 text-white cursor-not-allowed'
                            : 'bg-zinc-700 hover:bg-zinc-600 border border-purple-900/30 active:scale-95'
                        }`}
                      >
                        <ThumbsUp className={`h-5 w-5 ${upvotedRequests.has(request.id) ? 'fill-current' : ''}`} />
                        <span className="text-sm font-bold">{request.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-md rounded-lg bg-zinc-900 border border-purple-600/50 p-8 shadow-2xl">
              {/* Close button (only shows after 5 seconds) */}
              {canCloseModal && (
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 rounded-full bg-zinc-800 p-2 text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-green-500/20 p-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </div>

              {/* Success Message */}
              <h3 className="mb-3 text-center text-2xl font-bold text-white">
                Request Submitted!
              </h3>
              <p className="mb-6 text-center text-gray-300">
                Your song request has been sent to the DJ. Thanks for contributing to the vibe!
              </p>

              {/* Venmo Button in Modal */}
              {event.venmo_username && (
                <div className="space-y-3">
                  <p className="text-center text-sm text-gray-400">
                    Want to support the DJ?
                  </p>
                  <div className="flex justify-center">
                    <VenmoButton venmoUsername={event.venmo_username} />
                  </div>
                </div>
              )}

              {/* Timer indicator (optional visual feedback) */}
              {!canCloseModal && (
                <p className="mt-6 text-center text-xs text-gray-500">
                  You can close this in a few seconds...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
