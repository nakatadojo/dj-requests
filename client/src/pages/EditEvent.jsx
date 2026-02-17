import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI, uploadAPI } from '../utils/api';
import { ArrowLeft, Calendar, Tag, Upload, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EditEvent() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    loadEvent();
  }, [slug]);

  const loadEvent = async () => {
    try {
      const event = await eventsAPI.getBySlug(slug);
      setFormData({
        name: event.name || '',
        date: event.date || '',
        is_recurring: Boolean(event.is_recurring),
        genre_tags: Array.isArray(event.genre_tags) ? event.genre_tags.join(', ') : '',
        venmo_username: event.venmo_username || '',
        queue_visible: Boolean(event.queue_visible),
        requests_per_hour: event.requests_per_hour || 0,
        rate_limit_message: event.rate_limit_message || '',
        cover_image_url: event.cover_image_url || '',
        instagram_handle: event.instagram_handle || '',
        twitter_handle: event.twitter_handle || '',
        tiktok_handle: event.tiktok_handle || '',
        website_url: event.website_url || '',
      });
      if (event.cover_image_url) {
        setCoverPreview(event.cover_image_url);
      }
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Upload cover image first if a new one was selected
      let coverImageUrl = formData.cover_image_url;
      if (coverImage) {
        coverImageUrl = await uploadImage();
      }

      // Parse genre tags (comma-separated)
      const genre_tags_array = formData.genre_tags
        ? formData.genre_tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const eventData = {
        name: formData.name,
        date: formData.is_recurring ? '2099-01-01' : formData.date,
        genre_tags: genre_tags_array,
        venmo_username: formData.venmo_username || null,
        queue_visible: formData.queue_visible,
        requests_per_hour: parseInt(formData.requests_per_hour) || 0,
        rate_limit_message: formData.rate_limit_message || null,
        cover_image_url: coverImageUrl || null,
        instagram_handle: formData.instagram_handle || null,
        twitter_handle: formData.twitter_handle || null,
        tiktok_handle: formData.tiktok_handle || null,
        website_url: formData.website_url || null,
      };

      await eventsAPI.update(slug, eventData);
      setSuccess('Event updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const RECOMMENDED_WIDTH = 800;
  const RECOMMENDED_HEIGHT = 400;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width !== RECOMMENDED_WIDTH || img.height !== RECOMMENDED_HEIGHT) {
        setError(`Image must be exactly ${RECOMMENDED_WIDTH}x${RECOMMENDED_HEIGHT}px (2:1 ratio). Your image is ${img.width}x${img.height}px.`);
        setCoverImage(null);
        setCoverPreview(formData.cover_image_url || '');
        return;
      }

      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
      setError('');
    };
    img.src = URL.createObjectURL(file);
  };

  const handleImageRemove = () => {
    setCoverImage(null);
    setCoverPreview('');
    setFormData(prev => ({ ...prev, cover_image_url: '' }));
  };

  const uploadImage = async () => {
    if (!coverImage) return null;

    try {
      const data = await uploadAPI.uploadCover(coverImage);
      return data.url;
    } catch (err) {
      setError('Failed to upload cover image');
      throw err;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!formData) {
    return <div className="p-8 text-center">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <button
          onClick={() => navigate(`/dj/event/${slug}`)}
          className="mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Event
        </button>

        <h1 className="mb-8 text-3xl font-bold">Edit Event</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-lg bg-gray-800 p-6 md:p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-green-400 text-sm">
              {success}
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
          </div>

          {/* Cover Image Upload */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Cover Image (optional)
            </label>

            {coverPreview ? (
              <div className="relative">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full rounded-lg object-cover"
                  style={{ maxHeight: '200px' }}
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="cover_upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-700/50 px-4 py-8 transition-colors hover:border-venmo hover:bg-gray-700"
              >
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                <span className="mb-1 text-sm font-medium text-gray-300">Click to upload cover image</span>
                <span className="text-xs text-gray-400">PNG, JPG, GIF, WebP up to 5MB</span>
                <span className="mt-2 text-xs font-semibold text-venmo">
                  Required: 800x400px (2:1 ratio)
                </span>
                <input
                  type="file"
                  id="cover_upload"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Social Links */}
          <div className="mb-6 rounded-lg bg-gray-700/50 border border-gray-600 p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-400">Social Links (optional)</h3>

            <div className="space-y-3">
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

              <div>
                <label htmlFor="website_url" className="mb-1 block text-xs font-medium text-gray-300">
                  Website / Booking URL
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
              <p className="mt-2 text-xs text-gray-400">Set to 0 for unlimited requests</p>
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
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-venmo px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
