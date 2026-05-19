import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, Download, CheckCircle, Clock } from 'lucide-react';
import { Program } from '@/src/pages/types';
import { supabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';

export default function AttendanceAdmin() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    status: 'Active'
  });

  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setPrograms(data.map(p => ({
          ProgramID: p.id,
          ProgramName: p.name,
          Status: p.status,
          Code: p.code
        })));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      // Ensure session for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) await supabase.auth.signInAnonymously();

      const { error } = await supabase
        .from('programs')
        .insert([{
          id: formData.id,
          name: formData.name,
          code: formData.code,
          status: formData.status
        }]);

      if (error) throw error;
      setStatus({ type: 'success', msg: "Program created successfully!" });
      setFormData({ id: '', name: '', code: '', status: 'Active' });
      fetchPrograms();
    } catch (err: any) { 
      console.error(err); 
      setStatus({ type: 'error', msg: "Failed: " + (err.message || "Unknown error") });
    }
    finally { setSubmitting(false); }
  };

  const closeProgram = async (pId: string) => {
    if (!confirm("Close this program for attendance?")) return;
    setStatus(null);
    try {
      // Ensure session for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) await supabase.auth.signInAnonymously();

      const { error } = await supabase
        .from('programs')
        .update({ status: 'Closed' })
        .eq('id', pId);
      
      if (error) throw error;
      setStatus({ type: 'success', msg: "Program closed." });
      fetchPrograms();
    } catch (err: any) { 
      console.error(err); 
      setStatus({ type: 'error', msg: "Failed to close: " + (err.message || "Unknown error") });
    }
  };

  const exportData = () => {
    // For now, this could point to a supabase edge function or simply a CSV export logic
    alert("Export feature will be implemented via Supabase dashboard exports or a custom CSV utility.");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Control</h2>
          <p className="text-slate-500 text-sm">Manage program attendance codes and export data.</p>
        </div>
        <button 
          onClick={exportData}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        >
          <Download size={18} />
          Export All
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Create Program</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              {status && (
                <div className={cn(
                  "p-3 rounded-xl text-xs font-bold flex items-center gap-2",
                  status.type === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                )}>
                  {status.type === 'success' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {status.msg}
                </div>
              )}
              <input 
                type="text" required placeholder="Program ID (e.g. CAMP01)" 
                value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})}
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600 font-medium" 
              />
              <input 
                type="text" required placeholder="Display Name" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600 font-medium" 
              />
              <input 
                type="text" required placeholder="5-Digit Security Code" 
                maxLength={5}
                value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600 font-bold text-center tracking-[0.5em]" 
              />
              <select 
                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600 font-bold"
              >
                <option>Active</option>
                <option>Closed</option>
              </select>
              <button
                disabled={submitting}
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/10 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "Save Program"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Active Systems</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></div>
              ) : programs.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                   <div className="flex items-center gap-5">
                      <div className={cn(
                        "p-3 rounded-xl shadow-sm border border-white",
                        p.Status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"
                      )}>
                         <Calendar size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight">{p.ProgramName}</h4>
                        <div className="flex items-center gap-4 mt-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {p.ProgramID}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-1.5 rounded">CODE: {p.Code}</span>
                        </div>
                      </div>
                   </div>
                   {p.Status === 'Active' ? (
                     <button 
                      onClick={() => closeProgram(p.ProgramID)}
                      className="px-4 py-2 bg-white text-orange-600 text-xs font-black uppercase tracking-widest rounded-lg border border-orange-100 hover:bg-orange-600 hover:text-white transition-all"
                     >
                        Close Portal
                     </button>
                   ) : (
                     <div className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5">
                       <Clock size={10} /> Finished
                     </div>
                   )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
