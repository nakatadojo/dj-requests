import { Download, Copy, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function QRCodeDisplay({ eventSlug }) {
  const [copied, setCopied] = useState(false);
  const [QRCodeStyling, setQRCodeStyling] = useState(null);
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);

  const eventUrl = `${window.location.origin}/event/${eventSlug}`;

  // Dynamically import qr-code-styling (client-side only)
  useEffect(() => {
    const loadQRCodeStyling = async () => {
      try {
        const module = await import('qr-code-styling');
        setQRCodeStyling(() => module.default);
      } catch (error) {
        console.error('Failed to load qr-code-styling:', error);
      }
    };

    loadQRCodeStyling();
  }, []);

  // Initialize QR code with rounded dots
  useEffect(() => {
    if (!QRCodeStyling || !qrRef.current) return;

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 240,
        height: 240,
        data: eventUrl,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H'
        },
        dotsOptions: {
          color: '#000000',
          type: 'rounded' // Rounded dots like your reference image!
        },
        cornersSquareOptions: {
          color: '#000000',
          type: 'extra-rounded' // Rounded corner squares
        },
        cornersDotOptions: {
          color: '#000000',
          type: 'dot' // Round corner dots
        },
        backgroundOptions: {
          color: '#ffffff'
        }
      });

      // Clear any existing content
      qrRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrRef.current);
    } else {
      qrCodeInstance.current.update({ data: eventUrl });
    }
  }, [QRCodeStyling, eventUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = async () => {
    if (qrCodeInstance.current) {
      // Download using qr-code-styling's built-in method
      qrCodeInstance.current.download({
        name: `event-${eventSlug}-qr`,
        extension: 'png'
      });
    }
  };

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="mb-4 text-lg font-semibold">Share Event</h3>

      {/* QR Code */}
      <div className="mb-4 flex justify-center rounded-xl bg-white p-8">
        <div
          ref={qrRef}
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
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
