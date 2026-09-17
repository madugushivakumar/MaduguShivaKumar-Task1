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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
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
              <h3 className="text-lg font-bold text-slate-900">Backend API Status</h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isHealthy
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isHealthy ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Operational</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Offline / Unreachable</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Endpoint: <span className="text-indigo-600 font-semibold">GET /api/health</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all shadow-sm shadow-indigo-100 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Verifying...' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Grid Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
        {/* Expected Response payload */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>API Response</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          {isHealthy ? (
            <div>
              <p className="text-sm font-semibold text-slate-900">
                "{healthData.message}"
              </p>
              <div className="mt-2 text-xs font-mono bg-white p-2 rounded border border-slate-200 text-slate-600">
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
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Network Latency</span>
            <Zap className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {latency !== null ? `${latency}ms` : '--'}
              </span>
              <span className="text-xs text-slate-500">round-trip</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Last checked:{' '}
              <span className="font-medium text-slate-700">
                {lastChecked || 'Never'}
              </span>
            </p>
          </div>
        </div>

        {/* Database Connectivity Status */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Database Architecture</span>
            <Database className="w-4 h-4 text-slate-400" />
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
              <span className="text-sm font-semibold text-slate-900">
                {detailedData?.services?.database === 'connected'
                  ? 'PostgreSQL Connected'
                  : 'PostgreSQL Configured'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Pool Status:{' '}
              <span className="font-mono text-slate-700">
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
