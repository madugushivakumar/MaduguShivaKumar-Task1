import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Activity,
  Zap,
} from 'lucide-react';
import healthService from '../../services/healthService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export const HealthStatusCard = () => {
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [latency, setLatency] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      // Primary required endpoint: GET /api/health
      const data = await healthService.getHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealthData(data);

      // Detailed diagnostic status
      try {
        const details = await healthService.getDetailedHealth();
        setDetailedData(details);
      } catch (detErr) {
        console.warn('Detailed health check unavailable:', detErr);
      }

      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      const end = performance.now();
      setLatency(Math.round(end - start));
      setError(
        err.message ||
          'Failed to reach backend API. Make sure the backend server is running on port 5000.'
      );
      setHealthData(null);
      setDetailedData(null);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isHealthy = healthData && healthData.success === true;

  return (
    <div className="paper-card bg-[#FFFFFF] p-6 overflow-hidden relative shadow-paper-sm">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D5CA]/70 pb-5">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isHealthy
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}
          >
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#172033] font-display">
                Backend API Status
              </h3>
              <Badge variant={isHealthy ? 'completed' : 'overdue'}>
                {isHealthy ? 'Operational' : 'Offline / Unreachable'}
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 font-mono">
              Endpoint: <span className="text-[#1557D6] font-semibold">GET /api/health</span>
            </p>
          </div>
        </div>

        <Button
          onClick={fetchHealth}
          loading={loading}
          icon={RefreshCw}
          variant="secondary"
          size="sm"
        >
          {loading ? 'Verifying...' : 'Test Connection'}
        </Button>
      </div>

      {/* Grid Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
        {/* Expected Response payload */}
        <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#D9D5CA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2 font-mono">
            <span>API Response</span>
            <Activity className="w-4 h-4 text-[#94A3B8]" />
          </div>
          {isHealthy ? (
            <div>
              <p className="text-sm font-bold text-[#172033]">
                "{healthData.message}"
              </p>
              <div className="mt-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-[#D9D5CA] text-[#475569] overflow-x-auto">
                {JSON.stringify(healthData, null, 2)}
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-600 font-medium">
              {error || 'No response received.'}
            </p>
          )}
        </div>

        {/* Network & Latency metrics */}
        <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#D9D5CA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2 font-mono">
            <span>Network Latency</span>
            <Zap className="w-4 h-4 text-[#94A3B8]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#172033] font-display">
                {latency !== null ? `${latency}ms` : '--'}
              </span>
              <span className="text-xs text-[#64748B]">round-trip</span>
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              Last checked:{' '}
              <span className="font-medium text-[#172033]">
                {lastChecked || 'Never'}
              </span>
            </p>
          </div>
        </div>

        {/* Database Connectivity Status */}
        <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#D9D5CA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2 font-mono">
            <span>Database Architecture</span>
            <Database className="w-4 h-4 text-[#94A3B8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  detailedData?.services?.database === 'connected'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="text-sm font-bold text-[#172033]">
                {detailedData?.services?.database === 'connected'
                  ? 'PostgreSQL Connected'
                  : 'PostgreSQL Configured'}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              Pool Status:{' '}
              <span className="font-mono text-[#172033] font-bold">
                {detailedData ? `${detailedData.services.dbLatencyMs}ms` : 'Ready'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusCard;
