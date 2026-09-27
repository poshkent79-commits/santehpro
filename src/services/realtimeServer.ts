import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export interface RealtimeEvent {
  type: string; // e.g. 'article:created', 'article:updated', 'article:deleted', 'service_request:created', etc.
  entity?: string;
  action?: string;
  payload?: any;
  data?: any;
  timestamp?: string;
}

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();
let lastBroadcastEvent: RealtimeEvent | null = null;
let totalBroadcasts = 0;

export function initRealtimeServer(server: HttpServer): WebSocketServer {
  if (wss) return wss;

  wss = new WebSocketServer({
    server,
    path: '/api/ws',
  });

  wss.on('connection', (ws: WebSocket, req) => {
    clients.add(ws);
    console.log(`[WebSocket] Client connected from ${req.socket.remoteAddress}. Active clients: ${clients.size}`);

    // Send initial welcome message and status
    ws.send(JSON.stringify({
      type: 'system:connected',
      payload: {
        message: 'Подключено к серверу реального времени СантехПро',
        activeClients: clients.size,
        serverTime: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (_e) {
        // ignore non-json messages
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WebSocket] Client disconnected. Active clients: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Client error:', err);
      clients.delete(ws);
    });
  });

  // Heartbeat interval to keep connections alive through proxies / nginx
  const heartbeatInterval = setInterval(() => {
    if (!wss) return;
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.ping();
        } catch (_e) {
          clients.delete(client);
        }
      } else {
        clients.delete(client);
      }
    });
  }, 25000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  console.log('⚡ Real-time WebSocket server initialized on path /api/ws');
  return wss;
}

/**
 * Broadcasts an event to all connected users in real time
 */
export function broadcastRealtimeEvent(event: RealtimeEvent) {
  if (!wss || clients.size === 0) return;

  const enrichedEvent: RealtimeEvent = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  lastBroadcastEvent = enrichedEvent;
  totalBroadcasts++;

  const message = JSON.stringify(enrichedEvent);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('[WebSocket] Broadcast error to client:', err);
        clients.delete(client);
      }
    }
  });
}

export function getRealtimeStats() {
  return {
    activeConnections: clients.size,
    totalBroadcasts,
    lastBroadcastEvent,
    path: '/api/ws',
    ready: Boolean(wss),
  };
}
