import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Plus, Search, Trash2, Loader2, Save, X, Droplets, MapPin, AlertCircle, Phone, Megaphone } from 'lucide-react';
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

export default function BloodAdmin() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    count: '1 Unit',
    venue: '',
    contact: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blood_emergency_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setRequests(data.map(r => ({
          bloodGroup: r.blood_group,
          count: r.units_required,
          venue: r.hospital_venue,
          contact: r.contact_number,
          status: r.status as 'active' | 'resolved',
          row: r.id
        })));
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setActioning('saving');
    try {
      const { error } = await supabase
        .from('blood_emergency_requests')
        .insert([{
          blood_group: formData.bloodGroup,
          units_required: formData.count,
          hospital_venue: formData.venue,
          contact_number: formData.contact,
          status: 'active'
        }]);

      if (error) throw error;
      
      alert("Broadcast Active");
      setIsAdding(false);
      setFormData({ bloodGroup: 'A+', count: '1 Unit', venue: '', contact: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Broadcast failed");
    } finally {
      setActioning(null);
    }
  };

  const handleStatus = async (id: any, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'resolved' : 'active';
    setActioning(`status-${id}`);
    try {
      const { error } = await supabase
        .from('blood_emergency_requests')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Remove this alert?")) return;
    setActioning(`delete-${id}`);
    try {
      const { error } = await supabase
        .from('blood_emergency_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Emergency Ticker Control</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage life-saving alerts displayed on the homepage ticker.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-full md:w-auto h-12 px-6 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/20"
        >
          {isAdding ? <X size={18} /> : <Megaphone size={18} />}
          {isAdding ? 'Cancel' : 'New Broadcast'}
        </button>
      </header>

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
                    Broadcast Live Ticker
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
            <div key={i} className={cn(
              "p-8 rounded-[2.5rem] border transition-all relative overflow-hidden",
              r.status === 'active' ? "bg-white border-red-100 shadow-xl shadow-red-600/5 shadow-red-600/5 animate-pulse-slow" : "bg-slate-50 border-slate-200 opacity-60"
            )}>
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
                    className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center font-black text-[10px]"
                    title="Toggle Status"
                  >
                    {r.status === 'active' ? 'End' : 'Live'}
                  </button>
                  <button 
                    onClick={() => handleDelete(r.row)}
                    className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl text-white relative z-10">
                <Phone size={14} className="text-red-400" />
                <span className="text-xs font-black uppercase tracking-widest">{r.contact}</span>
              </div>
              
              {r.status === 'active' && <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-red-600/5 blur-2xl rounded-full" />}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400 italic font-medium border-2 border-dashed border-slate-200 rounded-[2.5rem]">No pending blood requests.</div>
        )}
      </div>
    </div>
  );
}
