import { useEffect, useRef, useState } from 'react';

// Auto-detect WebSocket URL based on current location
const getWebSocketURL = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  // In production, use wss:// for https and ws:// for http
  if (import.meta.env.MODE === 'production') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  // Development fallback
  return 'ws://localhost:3001/ws';
};

const WS_URL = getWebSocketURL();

export function useWebSocket(eventSlug, onMessage) {
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const onMessageRef = useRef(onMessage);
  const [connected, setConnected] = useState(false);

  // Keep callback ref current without triggering reconnect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!eventSlug) return;

    let intentionalClose = false;

    const connect = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);

        ws.current.send(JSON.stringify({
          type: 'subscribe',
          eventSlug,
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);

        // Auto-reconnect after 3 seconds unless we intentionally closed
        if (!intentionalClose) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    // Cleanup on unmount
    return () => {
      intentionalClose = true;
      clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [eventSlug]);

  return { connected };
}
