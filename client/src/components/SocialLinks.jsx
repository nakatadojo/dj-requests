import { Instagram, Twitter, Music2, CalendarCheck } from 'lucide-react';

export default function SocialLinks({ instagram_handle, twitter_handle, tiktok_handle, website_url, venmo_username }) {
  const hasSocials = instagram_handle || twitter_handle || tiktok_handle || website_url;

  if (!hasSocials && !venmo_username) return null;

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-3">
      {/* Venmo Button */}
      {venmo_username && (
        <button
          onClick={() => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
              window.location.href = `venmo://paycharge?txn=pay&recipients=${venmo_username}`;
            } else {
              window.open(`https://venmo.com/${venmo_username}`, '_blank');
            }
          }}
          className="flex items-center gap-2 rounded-lg bg-venmo px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 active:scale-95"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.83 4.17c.93 1.48 1.37 3.19 1.37 5.16 0 6.19-5.27 13.42-9.58 17.67h-6.4L1.59 2.83h5.56l1.8 17.52c2.32-3.47 5.35-9.45 5.35-13.42 0-1.37-.23-2.49-.69-3.45l5.22-.31z"/>
          </svg>
          Tip the DJ
        </button>
      )}

      {/* Instagram */}
      {instagram_handle && (
        <a
          href={`https://instagram.com/${instagram_handle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105 active:scale-95"
        >
          <Instagram className="h-5 w-5" />
          Instagram
        </a>
      )}

      {/* Twitter/X */}
      {twitter_handle && (
        <a
          href={`https://twitter.com/${twitter_handle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-900 active:scale-95 border border-gray-700"
        >
          <Twitter className="h-5 w-5" />
          Twitter/X
        </a>
      )}

      {/* TikTok */}
      {tiktok_handle && (
        <a
          href={`https://tiktok.com/@${tiktok_handle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-900 active:scale-95 border border-pink-500"
        >
          <Music2 className="h-5 w-5 text-pink-500" />
          TikTok
        </a>
      )}

      {/* Book Me */}
      {website_url && (
        <a
          href={website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700 active:scale-95"
        >
          <CalendarCheck className="h-5 w-5" />
          Book Me
        </a>
      )}
    </div>
  );
}
