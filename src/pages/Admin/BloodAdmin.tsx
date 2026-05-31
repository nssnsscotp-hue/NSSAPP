import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Plus, Search, Trash2, Loader2, Save, X, Droplets, 
  MapPin, AlertCircle, Phone, Megaphone, Download, Filter, 
  User, ChevronRight, CheckCircle2, Award, Sparkles 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

interface EmergencyRequest {
  bloodGroup: string;
  count: string;
  venue: string;
  contact: string;
  status: 'active' | 'resolved';
  row: string;
}

interface Donor {
  id: string;
  full_name: string;
  blood_group: string;
  mobile: string;
  unit: string;
  created_at: string;
}

export default function BloodAdmin() {
  const [activeTab, setActiveTab] = useState<'tickers' | 'donors'>('tickers');
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  
  // Interactive matchmaking drawer
  const [matchingRequest, setMatchingRequest] = useState<EmergencyRequest | null>(null);

  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    count: '1 Unit',
    venue: '',
    contact: '',
  });

  // Always fetch both upon mount so matchmaking has comprehensive metrics
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchDonors()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      let reqList: any[] = [];
      try {
        const { data, error } = await supabase
          .from('blood_emergency_requests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data && data.length > 0) {
          reqList = data.map(r => ({
            bloodGroup: r.blood_group,
            count: r.units_required || "1 Unit",
            venue: r.hospital_venue,
            contact: r.contact_number,
            status: r.status as 'active' | 'resolved',
            row: r.id || r.row
          }));
        } else {
          throw new Error("No cloud requests found");
        }
      } catch (cloudErr) {
        console.warn("Supabase requests fetch failed, matching local database:", cloudErr);
        const res = await fetch('/api/blood-emergency-requests');
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.list) {
            reqList = resData.list.map((r: any) => ({
              bloodGroup: r.blood_group,
              count: r.units_required || "1 Unit",
              venue: r.hospital_venue,
              contact: r.contact_number,
              status: r.status as 'active' | 'resolved',
              row: r.id
            }));
          }
        }
      }
      setRequests(reqList);
    } catch (err) {
      console.error("Failed to fetch requests comprehensively", err);
    }
  };

  const fetchDonors = async () => {
    try {
      let donorList: any[] = [];
      try {
        const { data, error } = await supabase
          .from('blood_donors')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data && data.length > 0) {
          donorList = data;
        } else {
          throw new Error("No cloud donors listed");
        }
      } catch (cloudDonorsErr) {
        console.warn("Supabase blood donors fetch failed, matching local database:", cloudDonorsErr);
        const res = await fetch('/api/blood-donors');
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.list) {
            donorList = resData.list;
          }
        }
      }
      setDonors(donorList);
    } catch (err) {
      console.error("Failed to fetch donors comprehensively", err);
    }
  };

  const downloadCSV = () => {
    const headers = ['Full Name', 'Blood Group', 'Mobile', 'Unit', 'Registered At'];
    const rows = donors.map(d => [
      `"${d.full_name}"`,
      d.blood_group,
      d.mobile,
      d.unit,
      new Date(d.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `blood_donors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteDonor = async (id: string) => {
    if (confirmingDelete !== `donor-${id}`) {
      setConfirmingDelete(`donor-${id}`);
      return;
    }

    setActioning(`donor-${id}`);
    setConfirmingDelete(null);
    try {
      let cloudDeleted = false;

      // Try Supabase delete
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) await supabase.auth.signInAnonymously();

        const { error } = await supabase.from('blood_donors').delete().eq('id', id);
        if (!error) cloudDeleted = true;
      } catch (supabaseErr) {
        console.warn("Supabase delete failed, carrying on locally:", supabaseErr);
      }

      // Replicate to Local backup API
      const localRes = await fetch(`/api/blood-donors/${id}`, {
        method: 'DELETE'
      });

      if (!localRes.ok && !cloudDeleted) {
        throw new Error("Both database pipelines returned deletion errors.");
      }

      alert("Donor record removed.");
      await fetchDonors();
    } catch (err) {
      console.error(err);
      alert("Failed to delete record.");
    } finally {
      setActioning(null);
    }
  };

  const filteredDonors = donors.filter(d => {
    const matchesSearch = d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || d.mobile.includes(searchTerm);
    const matchesFilter = filterGroup === 'All' || d.blood_group === filterGroup;
    return matchesSearch && matchesFilter;
  });

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setActioning('saving');
    try {
      let isUploadedToCloud = false;

      // Try Supabase upload
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) await supabase.auth.signInAnonymously();

        const { error } = await supabase
          .from('blood_emergency_requests')
          .insert([{
            blood_group: formData.bloodGroup,
            units_required: formData.count,
            hospital_venue: formData.venue,
            contact_number: formData.contact,
            status: 'active'
          }]);

        if (!error) {
          isUploadedToCloud = true;
        } else {
          console.error("Cloud insert error:", error.message);
        }
      } catch (supabaseErr) {
        console.warn("Supabase broadcast write error, relying on local storage replication:", supabaseErr);
      }

      // Replicate to physical local server storage
      const localRes = await fetch('/api/blood-emergency-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_group: formData.bloodGroup,
          units_required: formData.count,
          hospital_venue: formData.venue,
          contact_number: formData.contact
        })
      });

      if (!localRes.ok && !isUploadedToCloud) {
        throw new Error("Both databases failed to record the emergency request ticker.");
      }
      
      alert("Emergency Alert Broadcast Released!");
      setIsAdding(false);
      setFormData({ bloodGroup: 'A+', count: '1 Unit', venue: '', contact: '' });
      await fetchRequests();
    } catch (err: any) {
      console.error(err);
      alert("Broadcast failed: " + err.message);
    } finally {
      setActioning(null);
    }
  };

  const handleStatus = async (id: any, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'resolved' : 'active';
    setActioning(`status-${id}`);
    try {
      let isCloudPatched = false;

      // Try editing Supabase first
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) await supabase.auth.signInAnonymously();

        const { error } = await supabase
          .from('blood_emergency_requests')
          .update({ status: newStatus })
          .eq('id', id);
        
        if (!error) isCloudPatched = true;
      } catch (supabaseErr) {
        console.warn("Cloud update did not record status, carrying on locally:", supabaseErr);
      }

      // Sync into local backup endpoint
      const localRes = await fetch(`/api/blood-emergency-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!localRes.ok && !isCloudPatched) {
        throw new Error("Database status flags were unable to resolve.");
      }

      await fetchRequests();
    } catch (err: any) {
      console.error(err);
      alert("Failed to update status: " + err.message);
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id: any) => {
    if (!id) return;
    
    if (confirmingDelete !== `alert-${id}`) {
      setConfirmingDelete(`alert-${id}`);
      return;
    }

    setActioning(`delete-${id}`);
    setConfirmingDelete(null);
    const idStr = id.toString();
    const numericId = parseInt(idStr);
    const isNumeric = !isNaN(numericId);

    try {
      let isCloudDeleted = false;

      // Try cloud deletion
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) await supabase.auth.signInAnonymously();

        const { error } = await supabase
          .from('blood_emergency_requests')
          .delete()
          .eq('id', id);
        
        if (!error) {
          isCloudDeleted = true;
        } else {
          if (isNumeric) {
            await supabase.from('blood_emergency_requests').delete().eq('id', numericId);
            await supabase.from('blood_emergency_requests').delete().eq('row', numericId);
          } else {
            await supabase.from('blood_emergency_requests').delete().eq('row', id);
          }
          isCloudDeleted = true;
        }
      } catch (supabaseErr) {
        console.warn("Cloud deletion failed, continuing locally:", supabaseErr);
      }

      // Replicate to Local fallback deletion
      const localRes = await fetch(`/api/blood-emergency-requests/${id}`, {
        method: 'DELETE'
      });

      if (!localRes.ok && !isCloudDeleted) {
        throw new Error("Local and remote storage deletes both failed.");
      }
      
      alert("Alert removed successfully.");
      await fetchRequests();
    } catch (err: any) {
      console.error(err);
      alert("Error removing alert: " + (err.message || "Database connection error"));
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* MATCHMAKER SLIDE-OVER PANEL DRAWER */}
      <AnimatePresence>
        {matchingRequest && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setMatchingRequest(null)} />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10"
            >
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="text-red-600 animate-pulse" size={24} />
                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Matching Donors</h3>
                  </div>
                  <button 
                    onClick={() => setMatchingRequest(null)}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition text-slate-500"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Request Context Box */}
                <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-red-600 uppercase tracking-widest">{matchingRequest.bloodGroup} Requested</span>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-black">{matchingRequest.count} Required</span>
                  </div>
                  <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <MapPin size={12} className="text-red-500" /> {matchingRequest.venue}
                  </div>
                </div>

                {/* Matchmaking lists */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Available Donors Matrix ({donors.filter(d => d.blood_group === matchingRequest.bloodGroup).length})
                  </span>

                  {donors.filter(d => d.blood_group === matchingRequest.bloodGroup).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 font-bold space-y-2">
                      <AlertCircle size={28} className="mx-auto text-amber-500" />
                      <p className="text-sm">No exact registered matches</p>
                      <p className="text-[10px] text-slate-400 normal-case leading-relaxed font-semibold">
                        Consider contacting standard emergency desks or posting of surrounding sub-circles in public chat boards.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {donors
                        .filter(d => d.blood_group === matchingRequest.bloodGroup)
                        .map(donor => (
                          <div 
                            key={donor.id}
                            className="bg-white border border-slate-150 p-4 rounded-2xl flex items-center justify-between hover:border-red-200 transition duration-350 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-black text-xs">
                                {donor.full_name.charAt(0)}
                              </div>
                              <div>
                                <span className="text-xs font-black text-slate-800 block">{donor.full_name}</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mt-0.5">Unit {donor.unit}</span>
                              </div>
                            </div>

                            <a 
                              href={`tel:${donor.mobile}`}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 shadow transition cursor-pointer"
                            >
                              <Phone size={10} /> Contact
                            </a>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Close Footer drawer */}
              <div className="p-4 border-t bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => setMatchingRequest(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Blood Bank Command</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage donor archives and emergency broadcast tickers.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('tickers')}
            className={cn(
              "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'tickers' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Tickers
          </button>
          <button 
            onClick={() => setActiveTab('donors')}
            className={cn(
              "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'donors' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Donors ({donors.length})
          </button>
        </div>
      </header>

      {activeTab === 'tickers' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergency Broadcast</p>
                <p className="text-sm font-bold text-slate-900">Current active alerts on homepage</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="h-10 px-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all flex items-center gap-2"
            >
              {isAdding ? <X size={16} /> : <Plus size={16} />}
              {isAdding ? 'Cancel' : 'New Alert'}
            </button>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-xl shadow-red-600/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-6 flex items-center gap-2 italic">
                    <AlertCircle size={14} /> Send Emergency Alert
                  </h3>
                  <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Blood Group</label>
                      <select 
                        value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Requirements</label>
                      <input 
                        type="text" required placeholder="e.g. 2 Units"
                        value={formData.count} onChange={e => setFormData({...formData, count: e.target.value})}
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hospital / Venue</label>
                      <input 
                        type="text" required placeholder="e.g. Ottapalam Hospital"
                        value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})}
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Details</label>
                      <input 
                        type="text" required placeholder="Phone number"
                        value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs"
                      />
                    </div>
                    <div className="lg:col-span-4 flex justify-end">
                       <button 
                        disabled={actioning === 'saving'}
                        type="submit"
                        className="h-12 px-8 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all flex items-center gap-2"
                      >
                        {actioning === 'saving' ? <Loader2 className="animate-spin" size={16} /> : <Megaphone size={16} />}
                        Launch Ticker
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-200" size={32} /></div>
            ) : requests.length > 0 ? (
              requests.map((r, i) => (
                <div key={r.row || i} className={cn(
                  "p-6 sm:p-8 rounded-[2.5rem] border transition-all relative overflow-hidden",
                  r.status === 'active' ? "bg-white border-red-100 shadow-xl shadow-red-600/5 transition-all" : "bg-slate-50 border-slate-200 opacity-60"
                )}>
                  {confirmingDelete === `alert-${r.row}` && (
                    <button 
                      onClick={() => setConfirmingDelete(null)}
                      className="absolute top-8 right-32 h-10 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all italic z-20"
                    >
                      Cancel
                    </button>
                  )}
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border",
                        r.status === 'active' ? "bg-red-600 text-white border-red-500" : "bg-slate-200 text-slate-400 border-slate-300"
                      )}>
                        {r.bloodGroup}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase italic tracking-tighter">{r.count} required</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <MapPin size={10} className="text-red-500" /> {r.venue}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatus(r.row, r.status)}
                        disabled={!!actioning}
                        className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center font-black text-[10px]"
                        title="Toggle Resolution Stat"
                      >
                        {actioning === `status-${r.row}` ? <Loader2 size={14} className="animate-spin" /> : (r.status === 'active' ? 'End' : 'Live')}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(r.row);
                        }}
                        disabled={!!actioning}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all flex items-center justify-center",
                          confirmingDelete === `alert-${r.row}` 
                            ? "bg-red-600 text-white animate-pulse" 
                            : "bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white"
                        )}
                        title="Delete Alert Broadcast"
                      >
                        {actioning === `delete-${r.row}` ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Operational Coordination Board & Matchmaker button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
                    <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl text-white flex-1 select-all">
                      <Phone size={14} className="text-red-400" />
                      <span className="text-xs font-black uppercase tracking-widest">{r.contact}</span>
                    </div>

                    {r.status === 'active' && (
                      <button
                        onClick={() => setMatchingRequest(r)}
                        className="px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-500/15"
                      >
                        <Sparkles size={13} />
                        Match Donors
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 italic font-medium border-2 border-dashed border-slate-200 rounded-[2.5rem]">No pending blood requests.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search donors by name or mobile..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs"
              />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                <div className="p-1.5 bg-white text-slate-400 rounded-lg shadow-sm">
                  <Filter size={14} />
                </div>
                <select 
                  value={filterGroup} 
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none pr-4 cursor-pointer"
                >
                  {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button 
                onClick={downloadCSV}
                className="h-12 px-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-red-600/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Donor Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Group</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Info</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-8 py-4"><div className="h-4 bg-slate-100 rounded-lg w-full" /></td>
                      </tr>
                    ))
                  ) : filteredDonors.length > 0 ? (
                    filteredDonors.map((d) => (
                      <tr key={d.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-black text-xs">
                              {d.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{d.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{new Date(d.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black tracking-widest uppercase">
                            {d.blood_group}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-blue-650 font-bold text-xs select-all">
                            <Phone size={12} className="text-slate-400" />
                            {d.mobile}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 w-fit px-3 py-1 rounded-full">{d.unit || 'Unit 36'}</p>
                        </td>
                        <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                          {confirmingDelete === `donor-${d.id}` && (
                            <button 
                              onClick={() => setConfirmingDelete(null)}
                              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 italic mr-2"
                            >
                              No
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteDonor(d.id)}
                            disabled={actioning === `donor-${d.id}`}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              confirmingDelete === `donor-${d.id}` 
                                ? "bg-red-600 text-white animate-pulse" 
                                : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                            )}
                          >
                            {actioning === `donor-${d.id}` ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <Droplets size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No donors found matching criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
