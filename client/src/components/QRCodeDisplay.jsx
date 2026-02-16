import { QRCodeCanvas } from 'qrcode.react';
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
    const canvas = document.getElementById('qr-code-canvas');

    // Create a new canvas with white background
    const downloadCanvas = document.createElement('canvas');
    const ctx = downloadCanvas.getContext('2d');

    downloadCanvas.width = 512;
    downloadCanvas.height = 512;

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 512, 512);

    // Draw the QR code
    ctx.drawImage(canvas, 0, 0, 512, 512);

    // Download
    downloadCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-${eventSlug}-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="mb-4 text-lg font-semibold">Share Event</h3>

      {/* QR Code */}
      <div className="mb-4 flex justify-center rounded-xl bg-white p-8">
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}>
          <QRCodeCanvas
            id="qr-code-canvas"
            value={eventUrl}
            size={220}
            level="H"
            includeMargin={true}
            marginSize={2}
            fgColor="#000000"
            bgColor="#ffffff"
            imageSettings={{
              excavate: true,
            }}
          />
        </div>
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
