import { WebSocketServer } from 'ws';

let wss;

/**
 * Initialize WebSocket server
 */
export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');

    // Store event slug for this connection
    ws.eventSlug = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // Handle subscription to event
        if (data.type === 'subscribe' && data.eventSlug) {
          ws.eventSlug = data.eventSlug;
          console.log(`Client subscribed to event: ${data.eventSlug}`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('✓ WebSocket server initialized');
}

/**
 * Broadcast message to all clients subscribed to a specific event
 */
export function broadcastToEvent(eventSlug, message) {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.eventSlug === eventSlug && client.readyState === 1) { // 1 = OPEN
      client.send(JSON.stringify(message));
    }
  });
}

/**
 * Broadcast queue update to event subscribers
 */
export function broadcastQueueUpdate(eventSlug) {
  broadcastToEvent(eventSlug, {
    type: 'queue:update',
    timestamp: Date.now(),
  });
}

/**
 * Broadcast visibility toggle to event subscribers
 */
export function broadcastVisibilityToggle(eventSlug, visible) {
  broadcastToEvent(eventSlug, {
    type: 'visibility:toggle',
    visible,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast new request to event subscribers
 */
export function broadcastNewRequest(eventSlug, request) {
  broadcastToEvent(eventSlug, {
    type: 'request:added',
    request,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast played request to event subscribers
 */
export function broadcastRequestPlayed(eventSlug, requestId) {
  broadcastToEvent(eventSlug, {
    type: 'request:played',
    requestId,
    timestamp: Date.now(),
  });
}
