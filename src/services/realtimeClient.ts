import { useState, useEffect, useCallback, useRef } from 'react';

export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface RealtimePayload {
  type: string;
  entity?: string;
  action?: string;
  payload?: any;
  timestamp?: string;
}

type EventCallback = (event: RealtimePayload) => void;

class RealtimeClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<(status: RealtimeStatus) => void> = new Set();
  private status: RealtimeStatus = 'disconnected';
  private reconnectTimeout: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private pingInterval: any = null;

  constructor() {
    // Lazy connect on first call or browser mount
  }

  public getStatus(): RealtimeStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: RealtimeStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private setStatus(status: RealtimeStatus) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('connecting');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('⚡ [WebSocket] Connected to realtime server');
        this.setStatus('connected');
        this.reconnectAttempts = 0;

        // Periodic ping
        clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };

      this.socket.onmessage = (event) => {
        try {
          const data: RealtimePayload = JSON.parse(event.data);
          this.emit(data.type, data);
          this.emit('*', data);
        } catch (_err) {
          // ignore non-json messages
        }
      };

      this.socket.onclose = () => {
        this.setStatus('disconnected');
        clearInterval(this.pingInterval);
        this.scheduleReconnect();
      };

      this.socket.onerror = (_err) => {
        this.setStatus('error');
      };
    } catch (err) {
      console.warn('[WebSocket] Connection note:', err);
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WebSocket] Max reconnect attempts reached');
      return;
    }

    clearTimeout(this.reconnectTimeout);
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      console.log(`[WebSocket] Attempting reconnect (${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  public subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Auto connect on first listener
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect();
    }

    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  private emit(eventType: string, data: RealtimePayload) {
    const specific = this.listeners.get(eventType);
    if (specific) {
      specific.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[WebSocket] Listener error:', e);
        }
      });
    }

    // Also notify wildcard if not already '*'
    if (eventType !== '*') {
      const wild = this.listeners.get('*');
      if (wild) {
        wild.forEach((cb) => {
          try {
            cb(data);
          } catch (e) {
            console.error('[WebSocket] Wildcard listener error:', e);
          }
        });
      }
    }
  }

  public disconnect() {
    clearTimeout(this.reconnectTimeout);
    clearInterval(this.pingInterval);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('disconnected');
  }
}

export const realtimeClient = new RealtimeClient();

/**
 * React hook to listen to real-time events and observe sync status
 */
export function useRealtimeSync(eventFilter?: string, onEvent?: (event: RealtimePayload) => void) {
  const [status, setStatus] = useState<RealtimeStatus>(realtimeClient.getStatus());
  const [lastEvent, setLastEvent] = useState<RealtimePayload | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    realtimeClient.connect();
    const unsubStatus = realtimeClient.onStatusChange(setStatus);

    let unsubEvent: (() => void) | undefined;
    if (eventFilter) {
      unsubEvent = realtimeClient.subscribe(eventFilter, (event) => {
        setLastEvent(event);
        if (onEventRef.current) {
          onEventRef.current(event);
        }
      });
    }

    return () => {
      unsubStatus();
      if (unsubEvent) unsubEvent();
    };
  }, [eventFilter]);

  const triggerReconnect = useCallback(() => {
    realtimeClient.disconnect();
    realtimeClient.connect();
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    lastEvent,
    triggerReconnect,
  };
}
