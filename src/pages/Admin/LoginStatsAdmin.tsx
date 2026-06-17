import React, { useState, useEffect } from 'react';
import { 
  History, Monitor, Smartphone, Globe, Search, RefreshCw, 
  Trash2, ShieldCheck, UserCheck, CalendarDays, Loader2, AlertCircle 
} from 'lucide-react';

interface LoginLog {
  id: string;
  username: string;
  name: string;
  role: string;
  mobile: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export default function LoginStatsAdmin() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [isPurging, setIsPurging] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/login-logs');
      if (!res.ok) {
        throw new Error(`Failed to load login statistics: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.list)) {
        setLogs(data.list);
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unknown network error. Accessing cache instead.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handlePurge = async () => {
    if (!confirm('🚨 SECURITY CLEARANCE REQUIRED: Are you sure you want to permanently delete all login statistics? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsPurging(true);
      const res = await fetch('/api/login-logs', { method: 'DELETE' });
      if (!res.ok) throw new Error('Action denied');
      setLogs([]);
      alert('All system connection records have been securely shredded!');
    } catch (err: any) {
      alert(`Purge aborted: ${err.message}`);
    } finally {
      setIsPurging(false);
    }
  };

  // Helper to parse OS/Device from User Agent
  const getDeviceDetails = (ua: string) => {
    const lUA = ua.toLowerCase();
    let os = 'Unknown Devices';
    let isMobileDevice = false;

    if (lUA.includes('windows')) os = 'Windows PC';
    else if (lUA.includes('macintosh') || lUA.includes('mac os')) os = 'macOS';
    else if (lUA.includes('iphone')) { os = 'iPhone'; isMobileDevice = true; }
    else if (lUA.includes('android')) { os = 'Android'; isMobileDevice = true; }
    else if (lUA.includes('linux')) os = 'Linux Server/Device';

    return {
      os,
      isMobile: isMobileDevice
    };
  };

  // Helper to format date cleanly
  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: 'Just Now', time: '' };
      
      const formattedDate = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const formattedTime = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      
      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const term = searchQuery.toLowerCase().trim();
    const matchSearch = 
      (log.name || '').toLowerCase().includes(term) ||
      (log.username || '').toLowerCase().includes(term) ||
      (log.ip || '').includes(term) ||
      (log.mobile || '').includes(term);

    const matchRole = selectedRoleFilter === 'all' || log.role === selectedRoleFilter;

    return matchSearch && matchRole;
  });

  // Stats calculation
  const roleCounts = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.role] = (acc[log.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full mb-2">
            <ShieldCheck size={12} />
            <span className="text-[9px] font-black uppercase tracking-wider">Government Compliance Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase">Login Statistics</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time cryptographic audit trail of all user logins, administrative sessions, IP addresses, and physical terminals.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Audit Trail</span>
          </button>
          
          <button 
            type="button"
            onClick={handlePurge}
            disabled={isPurging || logs.length === 0}
            className="flex-grow sm:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>Shred Logs</span>
          </button>
        </div>
      </header>

      {/* Grid Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-black text-slate-900">{logs.length}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Active Sessions</div>
            </div>
            <div className="p-3.5 bg-slate-100 text-slate-700 rounded-2xl">
              <History size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-black text-rose-600">{roleCounts.admin || 0}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Admin Access Runs</div>
            </div>
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-black text-purple-600">{(roleCounts.hod || 0) + (roleCounts.principal || 0)}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">HOD / Principal Logins</div>
            </div>
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
              <UserCheck size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-black text-emerald-600">{roleCounts.volunteer || 0}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Volunteer Connections</div>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <UserCheck size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Main filterable view */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search audit trail by Name, ID, Mobile, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-blue-600 font-medium text-xs sm:text-sm text-slate-800"
              />
            </div>
            
            {/* Role Filter dropdown */}
            <div className="relative">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-4 pr-10 outline-none focus:ring-1 focus:ring-blue-600 font-bold text-xs uppercase tracking-wide text-slate-600 cursor-pointer appearance-none min-w-[150px]"
              >
                <option value="all">📁 All User Roles</option>
                <option value="admin">🔴 Administrators</option>
                <option value="principal">🟢 Principals</option>
                <option value="hod">🟣 HOD Leads</option>
                <option value="volunteer">🔵 Volunteers</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 font-bold">
                ▼
              </div>
            </div>
          </div>

          <div className="text-[10px] sm:text-xs font-black uppercase text-slate-400 shrink-0">
            📊 FILTERED RESULTS: <span className="text-slate-800 font-mono">{filteredLogs.length}</span> entries of <span className="text-slate-800 font-mono">{logs.length}</span>
          </div>
        </div>

        {/* Audit trail list element */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
            <p className="text-slate-400 font-extrabold uppercase tracking-widest text-xs animate-pulse">Scanning Cloud Log Registers...</p>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto p-4 bg-amber-50 rounded-3xl border border-amber-100">
            <AlertCircle className="text-amber-600 w-12 h-12 mb-3" />
            <p className="text-amber-800 font-bold text-sm">Offline Cache Active</p>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">Failed to query live datastores. Logging server has fallen back to dynamic runtime memory mode. Reconnect soon.</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="p-5 bg-slate-50 text-slate-300 rounded-full mb-4">
              <History size={36} />
            </div>
            <p className="text-slate-500 font-extrabold uppercase tracking-widest text-xs">No entries match filters</p>
            <p className="text-slate-400 text-xs mt-2 font-medium leading-relaxed">Try adjusting search parameters, clearing keywords, or wait for active users to authenticate on the app portal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3.5 pl-2 font-extrabold">Active User</th>
                  <th className="pb-3.5 font-extrabold">Account Privilege</th>
                  <th className="pb-3.5 font-extrabold">Connection IP</th>
                  <th className="pb-3.5 font-extrabold">Client OS / Device</th>
                  <th className="pb-3.5 pr-2 font-extrabold text-right">Login Session Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const device = getDeviceDetails(log.userAgent);
                  const timeInfo = formatTimestamp(log.timestamp);
                  
                  // Role Badge Switcher
                  let badgeStyles = "bg-slate-100 text-slate-700";
                  if (log.role === 'admin') badgeStyles = "bg-rose-50 text-rose-700 border border-rose-100";
                  else if (log.role === 'principal') badgeStyles = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                  else if (log.role === 'hod') badgeStyles = "bg-purple-50 text-purple-700 border border-purple-100";
                  else if (log.role === 'volunteer') badgeStyles = "bg-blue-50 text-blue-700 border border-blue-100";

                  const initial = (log.name || 'U').charAt(0).toUpperCase();

                  return (
                    <tr key={log.id} className="border-b border-slate-50 last:border-0 group hover:bg-slate-50/40 transition-all rounded-2xl">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                            log.role === 'admin' ? 'bg-rose-600 text-white' : 
                            log.role === 'principal' ? 'bg-emerald-600 text-white' : 
                            log.role === 'hod' ? 'bg-purple-600 text-white' : 
                            'bg-blue-600 text-white'
                          }`}>
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{log.name || 'System User'}</div>
                            <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mt-0.5">
                              @{log.username} {log.mobile && `• Mob: ${log.mobile}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${badgeStyles}`}>
                          {log.role}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-1.5 font-mono font-extrabold text-xs text-slate-600">
                          <Globe size={11} className="text-slate-400" />
                          <span>{log.ip}</span>
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          {device.isMobile ? (
                            <Smartphone size={13} className="text-slate-400" />
                          ) : (
                            <Monitor size={13} className="text-slate-400" />
                          )}
                          <span title={log.userAgent} className="truncate max-w-[200px]" style={{ cursor: 'help' }}>
                            {device.os}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 pr-2 text-right">
                        <div className="flex flex-col items-end">
                          <div className="text-slate-700 text-xs font-bold font-mono">
                            {timeInfo.time}
                          </div>
                          <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 flex items-center gap-1">
                            <CalendarDays size={10} />
                            <span>{timeInfo.date}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
