import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blocklistAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Plus, Trash2, Ban } from 'lucide-react';

export default function BlockList() {
  const [blockedSongs, setBlockedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPattern, setNewPattern] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadBlockList();
  }, []);

  const loadBlockList = async () => {
    try {
      const data = await blocklistAPI.getAll();
      setBlockedSongs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPattern.trim()) return;

    try {
      await blocklistAPI.add(newPattern);
      setNewPattern('');
      loadBlockList();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this pattern from block list?')) return;

    try {
      await blocklistAPI.remove(id);
      loadBlockList();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading block list..." />;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Block List</h1>
          <p className="mt-2 text-gray-400">
            Block specific songs from being requested at your events
          </p>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="mb-6 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold">Add Song Pattern</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="pattern" className="mb-2 block text-sm font-medium">
              Song Pattern (partial match)
            </label>
            <input
              type="text"
              id="pattern"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="w-full rounded-lg bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-venmo"
              placeholder='e.g., "baby shark" or "friday"'
            />
            <p className="mt-2 text-xs text-gray-400">
              Blocks any song containing this text (case-insensitive)
            </p>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-venmo px-6 py-3 font-semibold text-white hover:bg-blue-600 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Add Pattern
          </button>
        </form>

        {/* Blocked Songs List */}
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold">Blocked Patterns</h2>

          {blockedSongs.length === 0 ? (
            <div className="py-8 text-center">
              <Ban className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">No blocked patterns yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedSongs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-gray-700 p-4"
                >
                  <div>
                    <div className="font-medium">{item.song_pattern}</div>
                    <div className="text-xs text-gray-400">
                      Added{' '}
                      {new Date(item.created_at * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-lg bg-red-600 p-2 transition-colors hover:bg-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
