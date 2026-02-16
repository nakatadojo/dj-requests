import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    is_recurring: false,
    genre_tags: '',
    venmo_username: '',
    queue_visible: true,
    requests_per_hour: 0,
    rate_limit_message: '',
    cover_image_url: '',
    instagram_handle: '',
    twitter_handle: '',
    tiktok_handle: '',
    website_url: '',
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
        date: formData.is_recurring ? null : formData.date,
        is_recurring: formData.is_recurring,
        genre_tags: genre_tags_array,
        venmo_username: formData.venmo_username || null,
        queue_visible: formData.queue_visible,
        requests_per_hour: parseInt(formData.requests_per_hour) || 0,
        rate_limit_message: formData.rate_limit_message || null,
        cover_image_url: formData.cover_image_url || null,
        instagram_handle: formData.instagram_handle || null,
        twitter_handle: formData.twitter_handle || null,
        tiktok_handle: formData.tiktok_handle || null,
        website_url: formData.website_url || null,
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

          {/* Recurring Event Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleChange}
                className="h-5 w-5 rounded bg-gray-700 text-venmo focus:ring-2 focus:ring-venmo"
              />
              <span className="text-sm font-medium">Recurring Event (no specific date)</span>
            </label>
            <p className="ml-8 mt-1 text-xs text-gray-400">
              For ongoing venues - toggle on/off when you're playing
            </p>
          </div>

          {/* Date - only show for non-recurring events */}
          {!formData.is_recurring && (
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
          )}

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

          {/* Cover Image URL */}
          <div className="mb-6">
            <label htmlFor="cover_image_url" className="mb-2 block text-sm font-medium">
              Cover Image URL (optional)
            </label>
            <input
              type="url"
              id="cover_image_url"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              className="w-full rounded-lg bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-venmo"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-2 text-xs text-gray-400">Mobile-friendly cover image for the event page</p>
          </div>

          {/* Social Links */}
          <div className="mb-6 rounded-lg bg-gray-700/50 border border-gray-600 p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-400">Social Links (optional)</h3>
            <p className="mb-4 text-xs text-gray-400">Display your social media between the request form and queue</p>

            <div className="space-y-3">
              {/* Instagram */}
              <div>
                <label htmlFor="instagram_handle" className="mb-1 block text-xs font-medium text-gray-300">
                  Instagram Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    id="instagram_handle"
                    name="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-700 px-4 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="yourusername"
                  />
                </div>
              </div>

              {/* Twitter/X */}
              <div>
                <label htmlFor="twitter_handle" className="mb-1 block text-xs font-medium text-gray-300">
                  Twitter/X Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    id="twitter_handle"
                    name="twitter_handle"
                    value={formData.twitter_handle}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-700 px-4 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="yourusername"
                  />
                </div>
              </div>

              {/* TikTok */}
              <div>
                <label htmlFor="tiktok_handle" className="mb-1 block text-xs font-medium text-gray-300">
                  TikTok Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    id="tiktok_handle"
                    name="tiktok_handle"
                    value={formData.tiktok_handle}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-700 px-4 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="yourusername"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website_url" className="mb-1 block text-xs font-medium text-gray-300">
                  Website URL
                </label>
                <input
                  type="url"
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Queue Visibility */}
          <div className="mb-6">
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

          {/* Rate Limiting */}
          <div className="mb-6 rounded-lg bg-gray-700/50 border border-gray-600 p-4">
            <h3 className="mb-3 text-sm font-semibold text-purple-400">Request Rate Limiting</h3>

            <div className="mb-4">
              <label htmlFor="requests_per_hour" className="mb-2 block text-sm font-medium">
                Max Requests Per User (per hour)
              </label>
              <input
                type="number"
                id="requests_per_hour"
                name="requests_per_hour"
                value={formData.requests_per_hour}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="0 = unlimited"
              />
              <p className="mt-2 text-xs text-gray-400">Set to 0 for unlimited requests. Recommended: 3-5 per hour</p>
            </div>

            {formData.requests_per_hour > 0 && (
              <div>
                <label htmlFor="rate_limit_message" className="mb-2 block text-sm font-medium">
                  Rate Limit Message
                </label>
                <textarea
                  id="rate_limit_message"
                  name="rate_limit_message"
                  value={formData.rate_limit_message}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="You've reached the request limit. Please wait before submitting another song."
                />
                <p className="mt-2 text-xs text-gray-400">This message shows when users exceed the limit</p>
              </div>
            )}
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
