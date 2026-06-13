import React, { useState, useEffect } from 'react';
import { 
  db 
} from '@/src/lib/firebaseClient';
import { 
  collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy
} from 'firebase/firestore';
import { 
  motion, AnimatePresence 
} from 'motion/react';
import { 
  ShieldAlert, Clock, CheckCircle, Search, Filter, MessageSquare, 
  Trash2, FileText, ImageIcon, Video, Calendar, MapPin, 
  ChevronRight, AlertTriangle, RefreshCw, X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function DrugReportsAdmin() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  
  // Admin action states
  const [adminReply, setAdminReply] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Load drug_reports collection in real-time from Firestore
  useEffect(() => {
    setLoading(true);
    const reportsRef = collection(db, 'drug_reports');
    // Order by creation time decreasing
    const q = query(reportsRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      setReports(list);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync selected report after reports list updates
  useEffect(() => {
    if (selectedReport) {
      const updated = reports.find(r => r.id === selectedReport.id);
      if (updated) {
        setSelectedReport(updated);
        setAdminReply(updated.adminComment || '');
      } else {
        setSelectedReport(null);
      }
    }
  }, [reports]);

  // Update administrative Status & Comment
  const handleUpdateStatus = async (status: 'Unread' | 'Investigating' | 'Resolved') => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      const docRef = doc(db, 'drug_reports', selectedReport.id);
      await updateDoc(docRef, {
        status,
        adminComment: adminReply,
        updatedAt: new Date().toISOString()
      });
      // Done
    } catch (err) {
      console.error(err);
      alert("Failed to update status settings.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete/Clear document
  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm("Verify: Are you absolutely sure you want to delete this drug report case permanently from the secure archives? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'drug_reports', reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to purge documentation.");
    }
  };

  // Helper formatting values
  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'high': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'medium': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-150';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-750 border-green-200';
      case 'investigating': return 'bg-cyan-100 text-cyan-750 border-cyan-200';
      default: return 'bg-amber-100 text-amber-750 border-amber-200 animate-pulse';
    }
  };

  // Filters logic
  const filteredReports = reports.filter(r => {
    const textCombo = (r.details + ' ' + r.specificLocation + ' ' + r.id + ' ' + r.type).toLowerCase();
    const matchesSearch = textCombo.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesRisk = riskFilter === 'all' || r.riskLevel?.toLowerCase() === riskFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Calculate aggregated states
  const totalCount = reports.length;
  const criticalCount = reports.filter(r => r.riskLevel?.toLowerCase() === 'critical').length;
  const pendingCount = reports.filter(r => r.status?.toLowerCase() !== 'resolved').length;
  const resolvedCount = reports.filter(r => r.status?.toLowerCase() === 'resolved').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase">Emergency Safety Portal</span>
          <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            Sentinel Shield Reports <span className="text-sm font-bold bg-[#EF4444]/10 text-[#EF4444] px-2 py-0.5 rounded-full border border-[#EF4444]/20">{totalCount} total</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">Review, monitor, and investigate substance abuse & campus safety submissions completely anonymously.</p>
        </div>
      </header>

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-slate-50 text-slate-600">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Total Reports</div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 animate-pulse">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Critical Alarms</div>
            <div className="text-2xl font-black text-rose-600 tracking-tighter">{criticalCount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">In Investigation</div>
            <div className="text-2xl font-black text-amber-600 tracking-tighter">{pendingCount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Cases Resolved</div>
            <div className="text-2xl font-black text-emerald-600 tracking-tighter">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Direct layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Listing & searching filters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 shadow-sm space-y-5">
            
            {/* Search Header and Input */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between">
              
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query Report ID, type, or locations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-5 bg-slate-50 border border-slate-150 rounded-xl outline-none text-xs font-bold text-slate-700 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filtering widgets select */}
              <div className="flex items-center gap-3">
                <div className="relative min-w-[110px]">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full h-11 pl-4 pr-8 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[11px] font-black uppercase tracking-wider text-slate-600 appearance-none cursor-pointer"
                  >
                    <option value="all">S: All Status</option>
                    <option value="unread">Unread</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="relative min-w-[110px]">
                  <select
                    value={riskFilter}
                    onChange={e => setRiskFilter(e.target.value)}
                    className="w-full h-11 pl-4 pr-8 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[11px] font-black uppercase tracking-wider text-slate-600 appearance-none cursor-pointer"
                  >
                    <option value="all">R: All Risks</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

            </div>

            {/* List Containers */}
            {loading ? (
              <div className="text-center py-20 space-y-3">
                <RefreshCw size={36} className="animate-spin text-slate-300 mx-auto" />
                <p className="text-xs uppercase font-black tracking-widest text-slate-400 animate-pulse">Consulting Secure Server...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-150 rounded-2xl bg-slate-50/50">
                <ShieldAlert size={40} className="text-slate-300 mx-auto mb-3" />
                <h4 className="font-extrabold uppercase text-slate-700 tracking-tight">Zero Dossier Matches</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-bold leading-normal">No anonymous reports match the filtering attributes or queries specified.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    layoutId={`case-${report.id}`}
                    onClick={() => {
                      setSelectedReport(report);
                      setAdminReply(report.adminComment || '');
                    }}
                    className={cn(
                      "p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4",
                      selectedReport?.id === report.id
                        ? "bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-500/10 shadow-md"
                        : "bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-sm"
                    )}
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-black text-slate-500 tracking-tighter uppercase">{report.id}</span>
                        <div className="h-3 w-px bg-slate-200" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/5 border border-[#2563EB]/10 px-2 py-0.5 rounded-full">
                          {report.type}
                        </span>
                        <div className="h-3 w-px bg-slate-200" />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", getRiskColor(report.riskLevel))}>
                          {report.riskLevel || 'Low'} Risk
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-705 line-clamp-1 italic text-slate-700">
                        "{report.details}"
                      </p>

                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-wrap">
                        <span className="flex items-center gap-1"><MapPin size={11} /> {report.location || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Calendar size={11} /> {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}</span>
                        {report.evidenceUrl && <span className="flex items-center gap-1 text-[#D97706]"><ImageIcon size={11} /> Attached Evidence</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                      <span className={cn("px-2.5 py-1 text-[8.5px] uppercase font-black tracking-widest border rounded-full", getStatusBadge(report.status))}>
                        {report.status || 'Unread'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReport(report.id);
                        }}
                        className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Purge Report"
                      >
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight size={14} className="text-slate-350" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Action Detail Panel Drawer */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedReport ? (
              <motion.div
                key={selectedReport.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-md space-y-6 text-left relative"
              >
                
                {/* Visual Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-150 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-indigo-600">{selectedReport.id}</span>
                      <span className={cn("px-2 py-0.5 text-[8px] uppercase font-black tracking-widest border rounded-full", getStatusBadge(selectedReport.status))}>
                        {selectedReport.status || 'Unread'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">Report Details</h3>
                  </div>
                  
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Substantive summary info metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Substance category</span>
                    <span className="font-black text-slate-800 uppercase italic text-[11px]">{selectedReport.type}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block font-bold">Risk Urgency Level</span>
                    <span className={cn("font-black uppercase text-[11px] block ", selectedReport.riskLevel === 'Critical' ? 'text-rose-600' : 'text-amber-600')}>{selectedReport.riskLevel || 'Low'} Risk</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Primary Territory</span>
                    <span className="font-bold text-slate-700">{selectedReport.location}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Timeline Urgency</span>
                    <span className="font-bold text-slate-700">{selectedReport.timeline}</span>
                  </div>
                </div>

                {/* Specific Location Details hint */}
                {selectedReport.specificLocation && (
                  <div className="space-y-1.5 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-amber-700">
                      <MapPin size={11} /> Specific Location Hint
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-normal">{selectedReport.specificLocation}</p>
                  </div>
                )}

                {/* Full description block text */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Report Description</span>
                  <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs font-bold font-mono whitespace-pre-wrap leading-relaxed border border-slate-950">
                    "{selectedReport.details}"
                  </div>
                </div>

                {/* Evidence visualization if attached */}
                {selectedReport.evidenceUrl ? (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Secure Attached Evidence (File)</span>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                      {selectedReport.evidenceType === 'video' ? (
                        <video
                          src={selectedReport.evidenceUrl}
                          controls
                          className="w-full max-h-[220px] object-contain"
                        />
                      ) : (
                        <img
                          src={selectedReport.evidenceUrl}
                          alt="Submited Evidence"
                          className="w-full max-h-[220px] object-contain cursor-zoom-in"
                          onClick={() => {
                            const w = window.open();
                            if (w) {
                              w.document.write(`<img src="${selectedReport.evidenceUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                            }
                          }}
                        />
                      )}
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[8.5px] font-black uppercase tracking-widest text-slate-400">
                        {selectedReport.evidenceType === 'video' ? 'Video dossier' : 'Evidence Photo'} • Click to view full
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-150 text-center text-xs text-slate-400 font-bold bg-slate-50/50">
                    No attachment files supporting this report.
                  </div>
                )}

                {/* Status custom adjustments actions center */}
                <div className="border-t border-slate-150 pt-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Persistent Admin Vetting Comments</label>
                    <textarea
                      placeholder="Add case reviews, actions taken, or supportive details. These comments sync with administrative dashboard logs."
                      rows={3}
                      value={adminReply}
                      onChange={e => setAdminReply(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl text-xs font-bold placeholder:text-slate-300 text-slate-700 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('Investigating')}
                      className="flex-1 min-w-[90px] h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all text-center flex items-center justify-center"
                    >
                      Investigate
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('Resolved')}
                      className="flex-1 min-w-[90px] h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all text-center flex items-center justify-center"
                    >
                      Resolve Case
                    </button>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-slate-100/50 border border-dashed border-slate-200 rounded-[2rem] p-12 text-center h-full flex flex-col items-center justify-center min-h-[350px]">
                <ShieldAlert size={48} className="text-slate-300 mb-3" />
                <h4 className="font-extrabold uppercase text-slate-600 tracking-tight">Select a dossier</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-bold leading-normal">
                  Click on any listed report in the Left feed to view full details, examine file evidence, and sync update comments.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
