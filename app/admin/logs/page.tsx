// app/admin/logs/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Search,
  RotateCw,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Clock,
  Database,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  url: string;
  ip: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  cookies: Record<string, string>;
  body: any;
  rawBody: string | null;
  parseError: string | null;
  files: any[];
  response: {
    statusCode: number;
    headers: Record<string, string>;
    duration: number;
    body: string;
  };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copySection, setCopySection] = useState<string | null>(null);

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (methodFilter !== "ALL") params.append("method", methodFilter);
      
      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      
      // Filter status codes client-side for advanced statuses
      let filteredData = data;
      if (statusFilter !== "ALL") {
        filteredData = data.filter((log: LogEntry) => {
          const status = log.response.statusCode;
          if (statusFilter === "2XX") return status >= 200 && status < 300;
          if (statusFilter === "3XX") return status >= 300 && status < 400;
          if (statusFilter === "4XX") return status >= 400 && status < 500;
          if (statusFilter === "5XX") return status >= 500;
          return true;
        });
      }

      setLogs(filteredData);
      
      // Keep selection or default to first if none selected
      if (filteredData.length > 0) {
        if (!selectedLog || !filteredData.find((l: LogEntry) => l.id === selectedLog.id)) {
          setSelectedLog(filteredData[0]);
        } else {
          // Update selected log with fresh data if it exists
          const updated = filteredData.find((l: LogEntry) => l.id === selectedLog.id);
          if (updated) setSelectedLog(updated);
        }
      } else {
        setSelectedLog(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load request logs.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Handle Search and filters change
  useEffect(() => {
    fetchLogs(true);
  }, [search, methodFilter, statusFilter]);

  // Handle Auto Refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        fetchLogs(false);
      }, 3000);
    } else {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    }

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [autoRefresh, search, methodFilter, statusFilter, selectedLog]);

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all API logs?")) return;
    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear logs");
      toast.success("API logs successfully cleared.");
      setLogs([]);
      setSelectedLog(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear API logs.");
    }
  };

  const handleCopyText = (text: string, id: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopySection(section);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
      setCopySection(null);
    }, 2000);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "text-[#4dabf7] bg-[#4dabf7]/10 border-[#4dabf7]/20";
      case "POST":
        return "text-[#40c057] bg-[#40c057]/10 border-[#40c057]/20";
      case "PUT":
        return "text-[#ffd43b] bg-[#ffd43b]/10 border-[#ffd43b]/20";
      case "DELETE":
        return "text-[#ff6b6b] bg-[#ff6b6b]/10 border-[#ff6b6b]/20";
      default:
        return "text-muted bg-elevated border-border";
    }
  };

  const getStatusClass = (status: number) => {
    if (status >= 500) return "text-[#ff6b6b] bg-[#ff6b6b]/10 border-[#ff6b6b]/20";
    if (status >= 400) return "text-[#ffd43b] bg-[#ffd43b]/10 border-[#ffd43b]/20";
    if (status >= 300) return "text-[#da77f2] bg-[#da77f2]/10 border-[#da77f2]/20";
    if (status >= 200) return "text-[#40c057] bg-[#40c057]/10 border-[#40c057]/20";
    return "text-muted bg-elevated border-border";
  };

  // Convert log details to a copyable cURL request
  const getCurlString = (log: LogEntry) => {
    let curl = `curl -X ${log.method} "${log.url}"`;
    Object.entries(log.headers).forEach(([k, v]) => {
      // Ignore some standard headers
      if (!["host", "content-length", "connection", "accept-encoding"].includes(k.toLowerCase())) {
        curl += ` \\\n  -H "${k}: ${v}"`;
      }
    });
    if (log.rawBody) {
      curl += ` \\\n  -d '${log.rawBody.replace(/'/g, "'\\''")}'`;
    }
    return curl;
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 flex-shrink-0">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-3">
            <Terminal className="text-gold" />
            WooCommerce API Logs
          </h1>
          <p className="text-xs text-muted">
            Monitor and debug WooCommerce API payloads, endpoints, and credentials syncing with Desktop POS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-[var(--radius-btn)] border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              autoRefresh
                ? "bg-[#40c057]/10 border-[#40c057]/30 text-[#40c057]"
                : "bg-surface border-border text-muted hover:text-ink"
            }`}
          >
            <RefreshCw size={12} className={autoRefresh ? "animate-spin" : ""} />
            {autoRefresh ? "Live Polling" : "Paused"}
          </button>

          {/* Trigger Refresh */}
          <button
            onClick={() => fetchLogs(true)}
            className="p-1.5 rounded-[var(--radius-btn)] border border-border bg-surface text-muted hover:text-ink cursor-pointer"
            title="Force refresh logs"
          >
            <RotateCw size={14} />
          </button>

          {/* Clear Logs */}
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="px-3 py-1.5 rounded-[var(--radius-btn)] bg-crimson/15 border border-crimson/30 text-crimson hover:bg-crimson/25 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={13} />
            Clear logs
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 text-muted" size={14} />
          <input
            type="text"
            placeholder="Search logs by path, query, headers, body..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-[var(--radius-btn)] border border-border bg-surface text-ink placeholder:text-faint focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-[var(--radius-btn)] border border-border bg-surface text-ink focus:outline-none focus:border-gold transition-colors"
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-[var(--radius-btn)] border border-border bg-surface text-ink focus:outline-none focus:border-gold transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="2XX">2xx Success</option>
            <option value="3XX">3xx Redirect</option>
            <option value="4XX">4xx Client Error</option>
            <option value="5XX">5xx Server Error</option>
          </select>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-grow">
        
        {/* Left Side: Request Live Listener list */}
        <div className="lg:col-span-5 border border-border bg-surface rounded-[var(--radius-card)] flex flex-col min-h-0">
          <div className="p-3 border-b border-border text-[11px] font-bold text-muted uppercase tracking-wider bg-void/10 flex-shrink-0 flex justify-between items-center">
            <span>Live Listener ({logs.length} logged)</span>
            {logs.length > 0 && <span className="text-[10px] lowercase text-gold">click log to inspect</span>}
          </div>
          
          <div className="flex-grow overflow-y-auto divide-y divide-border/40">
            {loading && logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
                <RotateCw className="animate-spin text-gold" size={24} />
                <span className="text-xs">Loading requests...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted gap-2 text-center px-4">
                <Database size={24} className="text-faint" />
                <span className="text-xs font-bold text-ink">No requests captured yet</span>
                <span className="text-[10px] text-muted">Send calls to /wp-json/wc/v3 or sync Desktop POS.</span>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 text-xs cursor-pointer transition-all hover:bg-elevated/40 flex items-start gap-3 relative ${
                    selectedLog?.id === log.id
                      ? "bg-elevated/70 border-l-2 border-gold pl-2.5"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  {/* Method badge */}
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono border uppercase flex-shrink-0 ${getMethodBadgeClass(log.method)}`}>
                    {log.method}
                  </span>

                  {/* Path and query */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-mono font-bold text-ink truncate break-all" title={log.path}>
                      {log.path}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted">
                      <span>IP: {log.ip}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Response Code & Latency */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded font-mono border ${getStatusClass(log.response.statusCode)}`}>
                      {log.response.statusCode}
                    </span>
                    <span className="text-[9px] text-muted font-mono flex items-center gap-0.5">
                      <Clock size={8} />
                      {log.response.duration}ms
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Log Inspector Panel */}
        <div className="lg:col-span-7 border border-border bg-surface rounded-[var(--radius-card)] flex flex-col min-h-0">
          <div className="p-3 border-b border-border text-[11px] font-bold text-muted uppercase tracking-wider bg-void/10 flex-shrink-0 flex justify-between items-center">
            <span>Payload & Headers Inspector</span>
            {selectedLog && (
              <span className="font-mono text-[10px] text-faint select-all uppercase">
                ID: {selectedLog.id}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!selectedLog ? (
              <div className="flex flex-col items-center justify-center py-32 text-muted gap-2 text-center h-full">
                <Terminal size={32} className="text-faint" />
                <span className="text-xs">Select a request from the sidebar to inspect payload details</span>
              </div>
            ) : (
              <div className="space-y-6 text-xs text-ink">
                
                {/* Method + Path Header card */}
                <div className="p-4 rounded-lg bg-void/40 border border-border/80 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded font-mono border uppercase ${getMethodBadgeClass(selectedLog.method)}`}>
                      {selectedLog.method}
                    </span>
                    <span className="font-mono text-ink font-bold break-all select-all flex-1 text-sm">
                      {selectedLog.path}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] border-t border-border/40 pt-3 text-muted">
                    <div>
                      <span className="block font-bold text-faint uppercase">Status</span>
                      <span className={`inline-block font-mono font-bold mt-1 px-1.5 py-0.5 rounded border text-[10px] ${getStatusClass(selectedLog.response.statusCode)}`}>
                        {selectedLog.response.statusCode}
                      </span>
                    </div>
                    <div>
                      <span className="block font-bold text-faint uppercase">Latency</span>
                      <span className="block font-mono font-bold mt-1 text-gold">{selectedLog.response.duration} ms</span>
                    </div>
                    <div>
                      <span className="block font-bold text-faint uppercase">Client IP</span>
                      <span className="block font-mono font-bold mt-1 select-all">{selectedLog.ip}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-faint uppercase">Timestamp</span>
                      <span className="block font-mono mt-1 text-ink">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex gap-2 pt-2 border-t border-border/30">
                    <button
                      onClick={() => handleCopyText(selectedLog.url, selectedLog.id, "url")}
                      className="px-2.5 py-1 rounded bg-elevated hover:bg-elevated/80 border border-border text-[10px] font-bold text-muted hover:text-ink flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedId === selectedLog.id && copySection === "url" ? <Check size={10} className="text-[#40c057]" /> : <Copy size={10} />}
                      Copy URL
                    </button>
                    <button
                      onClick={() => handleCopyText(getCurlString(selectedLog), selectedLog.id, "curl")}
                      className="px-2.5 py-1 rounded bg-elevated hover:bg-elevated/80 border border-border text-[10px] font-bold text-muted hover:text-ink flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedId === selectedLog.id && copySection === "curl" ? <Check size={10} className="text-[#40c057]" /> : <Copy size={10} />}
                      Copy as cURL
                    </button>
                  </div>
                </div>

                {/* Query Parameters Section */}
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-xs text-gold uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight size={10} />
                    Query Params ({Object.keys(selectedLog.query).length})
                  </h4>
                  {Object.keys(selectedLog.query).length === 0 ? (
                    <p className="text-[10px] text-muted italic">No query string parameters.</p>
                  ) : (
                    <div className="overflow-x-auto rounded border border-border bg-void/10 p-2">
                      <table className="min-w-full font-mono text-[11px] text-left">
                        <tbody>
                          {Object.entries(selectedLog.query).map(([k, v]) => (
                            <tr key={k} className="border-b border-border/20 last:border-0 hover:bg-void/40">
                              <td className="py-1 pr-4 font-bold text-gold select-all">{k}</td>
                              <td className="py-1 text-ink select-all break-all">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Request Headers Section */}
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-xs text-gold uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight size={10} />
                    Request Headers ({Object.keys(selectedLog.headers).length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto rounded border border-border bg-void/10 p-2">
                    <table className="min-w-full font-mono text-[11px] text-left">
                      <tbody>
                        {Object.entries(selectedLog.headers).map(([k, v]) => (
                          <tr key={k} className="border-b border-border/20 last:border-0 hover:bg-void/40">
                            <td className="py-1 pr-4 font-bold text-[#da77f2] select-all">{k}</td>
                            <td className="py-1 text-ink select-all break-all">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Request Body Payload Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-bold text-xs text-gold uppercase tracking-wider flex items-center gap-1">
                      <ArrowRight size={10} />
                      Request Body (Payload)
                    </h4>
                    {selectedLog.rawBody && (
                      <button
                        onClick={() => handleCopyText(selectedLog.rawBody || "", selectedLog.id, "req-body")}
                        className="text-[10px] font-bold text-muted hover:text-ink flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === selectedLog.id && copySection === "req-body" ? <Check size={10} className="text-[#40c057]" /> : <Copy size={10} />}
                        Copy raw body
                      </button>
                    )}
                  </div>
                  {!selectedLog.rawBody ? (
                    <p className="text-[10px] text-muted italic">Empty body (no payload sent).</p>
                  ) : (
                    <pre className="rounded border border-border bg-void/80 p-3 overflow-x-auto text-[11px] font-mono text-ink max-h-60 select-text">
                      {typeof selectedLog.body === "object"
                        ? JSON.stringify(selectedLog.body, null, 2)
                        : selectedLog.rawBody}
                    </pre>
                  )}
                </div>

                {/* Response payload section */}
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-bold text-xs text-gold uppercase tracking-wider flex items-center gap-1">
                      <ArrowRight size={10} />
                      Response Payload
                    </h4>
                    {selectedLog.response.body && (
                      <button
                        onClick={() => handleCopyText(selectedLog.response.body, selectedLog.id, "res-body")}
                        className="text-[10px] font-bold text-muted hover:text-ink flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === selectedLog.id && copySection === "res-body" ? <Check size={10} className="text-[#40c057]" /> : <Copy size={10} />}
                        Copy response
                      </button>
                    )}
                  </div>
                  {!selectedLog.response.body ? (
                    <p className="text-[10px] text-muted italic">Empty response body.</p>
                  ) : (
                    <pre className="rounded border border-border bg-void/80 p-3 overflow-x-auto text-[11px] font-mono text-ink max-h-60 select-text">
                      {(() => {
                        try {
                          const parsed = JSON.parse(selectedLog.response.body);
                          return JSON.stringify(parsed, null, 2);
                        } catch {
                          return selectedLog.response.body;
                        }
                      })()}
                    </pre>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
