import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize, Music } from 'lucide-react';

export default function TVDisplay() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await eventsAPI.getBySlug(slug);
        setEvent(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadEvent();
  }, [slug]);

  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'now:playing') {
      setNowPlaying(data.song);
    }
  }, []);

  useWebSocket(slug, handleWebSocketMessage);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const eventUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/event/${slug}`
    : '';

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-white overflow-hidden"
    >
      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-6 right-6 z-10 rounded-lg bg-white/10 p-3 backdrop-blur-sm hover:bg-white/20 transition-colors"
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        <Maximize className="h-6 w-6" />
      </button>

      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="flex w-full max-w-7xl items-center justify-between gap-16">
          {/* Left Side - Event Info + Now Playing */}
          <div className="flex-1 text-center">
            {/* Event Banner */}
            {event.cover_image_url ? (
              <img
                src={event.cover_image_url}
                alt={event.name}
                className="mx-auto mb-8 max-h-64 rounded-2xl object-cover shadow-2xl"
              />
            ) : (
              <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-purple-600/20">
                <Music className="h-16 w-16 text-purple-500" />
              </div>
            )}

            <h1 className="mb-4 text-5xl font-bold">{event.name}</h1>

            {event.is_recurring && (
              <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-green-500/20 px-6 py-2 border border-green-500/30">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-lg font-semibold text-green-400">Live Now</span>
              </div>
            )}

            {/* Now Playing */}
            {nowPlaying ? (
              <div className="mt-8 animate-fade-in">
                <p className="mb-4 text-lg font-medium text-purple-400 uppercase tracking-widest">Now Playing</p>
                <div className="mx-auto max-w-md rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-600/20 border border-purple-500/30 p-8 shadow-2xl">
                  {nowPlaying.albumArt && (
                    <img
                      src={nowPlaying.albumArt}
                      alt={nowPlaying.song_name}
                      className="mx-auto mb-6 h-64 w-64 rounded-xl object-cover shadow-lg"
                    />
                  )}
                  <h2 className="text-3xl font-bold">{nowPlaying.song_name}</h2>
                  <p className="mt-2 text-xl text-gray-400">{nowPlaying.artist}</p>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-lg text-gray-600">Scan the QR code to request a song</p>
              </div>
            )}
          </div>

          {/* Right Side - QR Code */}
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-2xl">
              <QRCodeSVG
                value={eventUrl}
                size={280}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-center text-lg text-gray-400">
              Scan to request a song
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
