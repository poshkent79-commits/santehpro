import { useState, useEffect, useCallback } from 'react';
import { useRealtimeSync } from './realtimeClient';

export interface TimeWebCloudClientConfig {
  apiUrl: string;
  apiToken: string;
  serverId: string;
  projectName: string;
  syncMode: 'realtime' | 'interval' | 'manual';
  syncIntervalSeconds: number;
  conflictStrategy: 'timestamp' | 'timeweb_wins' | 'local_wins';
  autoBackup: boolean;
  backupRetentionDays: number;
  environmentName: string;
  ipAddress?: string;
  sshPort?: number;
  databaseHost?: string;
  status: 'connected' | 'syncing' | 'standby' | 'error';
  lastSyncTime: string;
  lastPingMs: number;
}

export interface TimeWebSyncLogItem {
  id: string;
  timestamp: string;
  entity: 'articles' | 'specialists' | 'service_requests' | 'users' | 'media' | 'questions' | 'settings';
  action: 'create' | 'update' | 'delete' | 'status' | 'bulk_sync' | 'backup' | 'restore';
  recordId?: string;
  status: 'success' | 'pending' | 'error';
  latencyMs: number;
  details: string;
  payloadSummary?: string;
}

export function useTimeWebSync() {
  const [config, setConfig] = useState<TimeWebCloudClientConfig | null>(null);
  const [logs, setLogs] = useState<TimeWebSyncLogItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [pingMs, setPingMs] = useState<number>(24);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());
  const [status, setStatus] = useState<'connected' | 'syncing' | 'standby' | 'error'>('connected');

  // Load configuration and status from backend
  const refreshConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/timeweb/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setStatus(data.status || 'connected');
        setPingMs(data.lastPingMs || 24);
        if (data.lastSyncTime) setLastSyncTime(data.lastSyncTime);
      }
    } catch (err) {
      console.warn('[TimeWeb Client] Failed to fetch config:', err);
    }
  }, []);

  // Load audit logs from backend
  const refreshLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/timeweb/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('[TimeWeb Client] Failed to fetch sync logs:', err);
    }
  }, []);

  // Test live connection to TimeWeb Cloud
  const testConnection = useCallback(async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/timeweb/ping', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPingMs(data.latencyMs || 22);
        setStatus('connected');
        setLastSyncTime(new Date().toISOString());
        await refreshLogs();
        return { success: true, latencyMs: data.latencyMs, message: data.message };
      }
      return { success: false, message: 'Сервер вернул ошибку при пинге' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Ошибка сети' };
    } finally {
      setIsTesting(false);
    }
  }, [refreshLogs]);

  // Trigger full sync now
  const triggerFullSync = useCallback(async () => {
    setIsSyncing(true);
    setStatus('syncing');
    try {
      const res = await fetch('/api/timeweb/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatus('connected');
        setLastSyncTime(new Date().toISOString());
        await refreshLogs();
        return { success: true, data };
      }
      setStatus('error');
      return { success: false, message: 'Ошибка при синхронизации' };
    } catch (err: any) {
      setStatus('error');
      return { success: false, message: err.message || 'Ошибка сети' };
    } finally {
      setIsSyncing(false);
    }
  }, [refreshLogs]);

  // Save new configuration
  const saveConfig = useCallback(async (newConfig: Partial<TimeWebCloudClientConfig>) => {
    try {
      const res = await fetch('/api/timeweb/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setStatus(data.status || 'connected');
        await refreshLogs();
        return { success: true, config: data };
      }
      return { success: false, message: 'Не удалось сохранить настройки' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Ошибка сети' };
    }
  }, [refreshLogs]);

  // Clear sync logs
  const clearLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/timeweb/logs', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[TimeWeb Client] Failed to clear logs:', err);
      return false;
    }
  }, []);

  // Listen to WebSocket events for real-time synchronization updates
  useRealtimeSync('*', (event) => {
    if (event.type === 'timeweb:synced' && event.payload) {
      setLogs((prev) => [event.payload, ...prev.slice(0, 99)]);
      setLastSyncTime(event.payload.timestamp || new Date().toISOString());
      if (event.payload.latencyMs) {
        setPingMs(event.payload.latencyMs);
      }
    } else if (event.type === 'timeweb:config_updated') {
      refreshConfig();
    }
  });

  // Initial load
  useEffect(() => {
    refreshConfig();
    refreshLogs();

    // Periodic ping every 30 seconds to keep live metrics up-to-date
    const interval = setInterval(() => {
      refreshConfig();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshConfig, refreshLogs]);

  return {
    config,
    logs,
    status,
    pingMs,
    lastSyncTime,
    isSyncing,
    isTesting,
    refreshConfig,
    refreshLogs,
    testConnection,
    triggerFullSync,
    saveConfig,
    clearLogs,
  };
}
