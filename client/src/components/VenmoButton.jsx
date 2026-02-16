export default function VenmoButton({ venmoUsername }) {
  if (!venmoUsername) return null;

  const handleClick = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const venmoUrl = isMobile
      ? `venmo://paycharge?txn=pay&recipients=${venmoUsername}`
      : `https://venmo.com/${venmoUsername}`;

    window.open(venmoUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-lg bg-venmo px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 active:scale-95"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.83 4.17c.93 1.48 1.37 3.19 1.37 5.16 0 6.19-5.27 13.42-9.58 17.67h-6.4L1.59 2.83h5.56l1.8 17.52c2.32-3.47 5.35-9.45 5.35-13.42 0-1.37-.23-2.49-.69-3.45l5.22-.31z"/>
      </svg>
      Tip the DJ
    </button>
  );
}
