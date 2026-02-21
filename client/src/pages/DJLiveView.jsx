import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, requestsAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { ArrowLeft, Eye, EyeOff, Search, PlayCircle, SkipForward, Pin, Ban, TrendingUp, Settings, Bell, BellOff } from 'lucide-react';

export default function DJLiveView() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');

  const loadEvent = async () => {
    try {
      const eventData = await eventsAPI.getBySlug(slug);
      setEvent(eventData);
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

    // Auto-request notification permission on load and persist
    if ('Notification' in window) {
      const currentPerm = Notification.permission;
      setNotificationPermission(currentPerm);

      if (currentPerm === 'default') {
        Notification.requestPermission().then((perm) => {
          setNotificationPermission(perm);
          if (perm === 'granted') {
            localStorage.setItem('dj_notifications', 'enabled');
          }
        });
      } else if (currentPerm === 'granted') {
        localStorage.setItem('dj_notifications', 'enabled');
      }
    }
  }, [slug]);

  const sendNotification = useCallback((data) => {
    const req = data.request || data;
    const songName = req.song_name || 'New song';
    const artist = req.artist || '';
    const requester = req.requester_name || 'Someone';

    // Send browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Song Request!', {
        body: `${requester} requested "${songName}" by ${artist}`,
        icon: '/favicon.ico',
        tag: `request-${Date.now()}`,
      });
    }
  }, []);

  // WebSocket handler
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'request:added') {
      sendNotification(data);
      loadRequests();
    }
    if (data.type === 'queue:update') {
      loadRequests();
    }
    if (data.type === 'visibility:toggle') {
      loadEvent();
    }
  }, [sendNotification]);

  useWebSocket(slug, handleWebSocketMessage);

  const toggleVisibility = async () => {
    try {
      await eventsAPI.update(slug, { queue_visible: !event.queue_visible });
      loadEvent();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEventStatus = async () => {
    // Convert to boolean in case it's 0/1 from database
    const isCurrentlyVisible = Boolean(event.visible);
    const newVisible = !isCurrentlyVisible;
    const action = newVisible ? 'activate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${action} this event?`)) return;

    try {
      await eventsAPI.update(slug, { visible: newVisible });
      loadEvent();
    } catch (err) {
      console.error(err);
      alert('Failed to update event status: ' + err.message);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      await requestsAPI.updateStatus(requestId, status);
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const endEvent = async () => {
    if (!confirm('Are you sure you want to end this event?')) return;

    try {
      await eventsAPI.end(slug);
      navigate(`/analytics/${slug}`);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter(r =>
    r.song_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requester_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading event..." />;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="flex gap-2">
            {event.is_recurring && (
              <button
                onClick={toggleEventStatus}
                className={`rounded-lg px-4 py-2 font-semibold ${
                  event.visible
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {event.visible ? 'Deactivate' : 'Activate'}
              </button>
            )}
            <button
              onClick={() => navigate(`/dj/event/${slug}/edit`)}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 font-semibold hover:bg-gray-600"
            >
              <Settings className="h-5 w-5" />
              Edit
            </button>
            <button
              onClick={endEvent}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-700"
            >
              End Event
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Queue */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <div className="flex gap-2">
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    notificationPermission === 'granted'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-yellow-600/20 text-yellow-400 cursor-pointer'
                  }`}
                  title={notificationPermission === 'granted' ? 'Notifications active' : 'Click to enable notifications'}
                  onClick={() => {
                    if (notificationPermission !== 'granted' && 'Notification' in window) {
                      Notification.requestPermission().then((perm) => setNotificationPermission(perm));
                    }
                  }}
                >
                  {notificationPermission === 'granted' ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                </div>
                <button
                  onClick={() => navigate(`/dj/event/${slug}/rankings`)}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 hover:bg-purple-700"
                >
                  <TrendingUp className="h-5 w-5" />
                  Rankings
                </button>
                <button
                  onClick={toggleVisibility}
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700"
                >
                  {event.queue_visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  {event.queue_visible ? 'Hide Queue' : 'Show Queue'}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-gray-800 px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-venmo"
              />
            </div>

            {/* Requests List */}
            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="rounded-lg bg-gray-800 p-12 text-center">
                  <p className="text-gray-400">
                    {requests.length === 0 ? 'No requests yet' : 'No matching requests'}
                  </p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`rounded-lg bg-gray-800 p-4 ${
                      request.status === 'pinned' ? 'border-2 border-venmo' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{request.song_name}</h3>
                        <p className="text-sm text-gray-400">{request.artist}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Requested by {request.requester_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-venmo">{request.upvotes}</div>
                          <div className="text-xs text-gray-400">votes</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'pinned')}
                        disabled={request.status === 'pinned'}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Pin className="h-4 w-4" />
                        {request.status === 'pinned' ? 'Pinned' : 'Pin'}
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'played')}
                        className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1 text-sm hover:bg-green-700"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Played
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'skipped')}
                        className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
                      >
                        <SkipForward className="h-4 w-4" />
                        Skip
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QRCodeDisplay eventSlug={slug} />

            <div className="rounded-lg bg-gray-800 p-4">
              <h3 className="mb-3 font-semibold">Quick Actions</h3>
              <button
                onClick={() => navigate('/blocklist')}
                className="flex w-full items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 hover:bg-gray-600"
              >
                <Ban className="h-5 w-5" />
                Manage Block List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
