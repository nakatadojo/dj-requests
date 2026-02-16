import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    genre_tags: '',
    venmo_username: '',
    queue_visible: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Parse genre tags (comma-separated)
      const genre_tags_array = formData.genre_tags
        ? formData.genre_tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const eventData = {
        name: formData.name,
        date: formData.date,
        genre_tags: genre_tags_array,
        venmo_username: formData.venmo_username || null,
        queue_visible: formData.queue_visible,
      };

      const event = await eventsAPI.create(eventData);
      navigate(`/dj/event/${event.slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <h1 className="mb-8 text-3xl font-bold">Create New Event</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-lg bg-gray-800 p-6 md:p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Event Name */}
          <div className="mb-6">
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Event Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-venmo"
              placeholder="Friday Night Vibes"
              required
            />
          </div>

          {/* Date */}
          <div className="mb-6">
            <label htmlFor="date" className="mb-2 block text-sm font-medium">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-venmo"
                required
              />
            </div>
          </div>

          {/* Genre Tags */}
          <div className="mb-6">
            <label htmlFor="genre_tags" className="mb-2 block text-sm font-medium">
              Genre/Vibe Tags (optional)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="genre_tags"
                name="genre_tags"
                value={formData.genre_tags}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-venmo"
                placeholder="Hip Hop, R&B, Pop (comma-separated)"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">Helps attendees know what to request</p>
          </div>

          {/* Venmo Username */}
          <div className="mb-6">
            <label htmlFor="venmo_username" className="mb-2 block text-sm font-medium">
              Venmo Username (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                id="venmo_username"
                name="venmo_username"
                value={formData.venmo_username}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 px-4 py-3 pl-8 focus:outline-none focus:ring-2 focus:ring-venmo"
                placeholder="yourvenmo"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">Enables tip button for attendees</p>
          </div>

          {/* Queue Visibility */}
          <div className="mb-8">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="queue_visible"
                checked={formData.queue_visible}
                onChange={handleChange}
                className="h-5 w-5 rounded bg-gray-700 text-venmo focus:ring-2 focus:ring-venmo"
              />
              <span className="text-sm font-medium">Queue visible to attendees</span>
            </label>
            <p className="ml-8 mt-1 text-xs text-gray-400">
              When enabled, attendees can see all requests and upvotes in real-time
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-venmo px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
