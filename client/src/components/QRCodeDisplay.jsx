import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function QRCodeDisplay({ eventSlug }) {
  const [copied, setCopied] = useState(false);

  const eventUrl = `${window.location.origin}/event/${eventSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 512, 512);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event-${eventSlug}-qr.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="mb-4 text-lg font-semibold">Share Event</h3>

      {/* QR Code */}
      <div className="mb-4 flex justify-center rounded-lg bg-white p-6">
        <QRCodeSVG
          id="qr-code-svg"
          value={eventUrl}
          size={200}
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Event URL */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={eventUrl}
          readOnly
          className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-200"
        />
        <button
          onClick={copyToClipboard}
          className="rounded-lg bg-gray-700 p-2 transition-colors hover:bg-gray-600"
          title="Copy URL"
        >
          {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
        </button>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadQR}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-venmo px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
      >
        <Download className="h-5 w-5" />
        Download QR Code
      </button>

      <p className="mt-4 text-center text-sm text-gray-400">
        Attendees can scan this QR code or visit the URL to submit requests
      </p>
    </div>
  );
}
