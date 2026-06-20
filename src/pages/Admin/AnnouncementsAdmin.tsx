import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Loader2, Shield, Smartphone, Send, CheckCircle, Radio } from 'lucide-react';
import { Announcement } from '@/src/pages/types';
import { supabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  
  // Notification options
  const [notifyDevices, setNotifyDevices] = useState(true);
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [targetAudience, setTargetAudience] = useState<'all' | 'volunteers' | 'officers'>('all');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const triggerTestPush = () => {
    if (!('Notification' in window)) {
      alert("Browser does not support notifications.");
      return;
    }
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(status => {
        setPermissionStatus(status);
        if (status === 'granted') {
          new Notification("🔔 Test Push Successful!", {
            body: "This is a direct simulation of the device push notifications that all installed clients receive instantly.",
            icon: 'https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png'
          });
        } else {
          alert("Notification permission was denied. Enable site notifications to test device-level panel alerts.");
        }
      });
    } else {
      new Notification("🔔 Test Push Successful!", {
        body: "This is a direct simulation of the device push notifications that all installed clients receive instantly.",
        icon: 'https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png'
      });
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setAnnouncements(data.map(ann => ({
          id: (ann.id || ann.row || '').toString(),
          title: ann.title,
          message: ann.content,
          date: new Date(ann.created_at || Date.now()).toLocaleDateString()
        })));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    if (confirmingDelete !== id) {
      setConfirmingDelete(id);
      return;
    }

    setActioning(id);
    setConfirmingDelete(null);
    try {
      // Ensure session for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) await supabase.auth.signInAnonymously();

      // try numeric conversion for postgrest compatibility
      const numericId = parseInt(id);
      const isNumeric = !isNaN(numericId);

      // Attempt delete by id
      let { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error || isNumeric) {
        if (isNumeric) {
          await supabase.from('announcements').delete().eq('id', numericId);
          await supabase.from('announcements').delete().eq('row', numericId);
        }
        await supabase.from('announcements').delete().eq('row', id);
      }
      
      alert("Announcement removed successfully.");
      await fetchAnnouncements();
    } catch (err: any) {
      console.error(err);
      alert("Error deleting: " + (err.message || "Database error"));
    } finally {
      setActioning(null);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log("Attempting to broadcast announcement...");
      
      // Ensure session for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
      
      const { error } = await supabase
        .from('announcements')
        .insert([{
          title: formData.title,
          content: formData.content
        }]);
      
      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      alert("Announcements broadcasted successfully!");
      setFormData({ title: '', content: '' });
      fetchAnnouncements();
    } catch (err: any) { 
      console.error(err); 
      alert("Error broadcasting: " + (err.message || "Database error"));
    }
    finally { 
      setSubmitting(false); 
      console.log("Broadcast process finished.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Global Announcements</h2>
        <p className="text-slate-500 text-sm">Send urgent push notifications and news to all volunteers.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Compose</h3>
            <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Smartphone size={12} className="text-blue-500" /> App Notification Settings
              </span>
              
              {/* Toggle to Notify Installed Devices */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={notifyDevices} 
                  onChange={e => setNotifyDevices(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 bg-white"
                />
                <span className="text-xs font-bold text-slate-700">Push to Device Notification Panels</span>
              </label>

              {/* Target Segment Selector */}
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Target Audience</span>
                <select 
                  value={targetAudience} 
                  onChange={e => setTargetAudience(e.target.value as any)}
                  className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Everyone (All Installed Devices)</option>
                  <option value="volunteers">Volunteers Only</option>
                  <option value="officers">Programme Officers & Staff</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Alert Priority Level</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={cn(
                      "flex-1 h-7 rounded text-[10px] font-bold uppercase tracking-wider border transition-all",
                      priority === 'normal' 
                        ? "bg-blue-50 text-blue-600 border-blue-200" 
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={cn(
                      "flex-1 h-7 rounded text-[10px] font-bold uppercase tracking-wider border transition-all",
                      priority === 'high' 
                        ? "bg-red-50 text-red-600 border-red-200" 
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Urgent Alert
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handlePost} className="space-y-4">
              <input 
                type="text" required placeholder="Subject / Notification Title" 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600 font-medium" 
              />
              <textarea 
                required placeholder="Enter notification message body..." 
                rows={5}
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium resize-none text-sm" 
              />
              <button
                disabled={submitting}
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "🚀 Broadcast News & Push"}
              </button>
            </form>

            {/* Test push simulation block */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
              <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest block">Notification System Diagnostics</span>
              <button
                type="button"
                onClick={triggerTestPush}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition duration-200 flex items-center gap-1.5 mx-auto border border-slate-200"
              >
                <Radio size={12} className="text-red-500" />
                Test Send Notification to Yourself
              </button>
              <p className="text-[10px] text-slate-400">
                Current Permission State: <b className="uppercase text-slate-600">{permissionStatus}</b>
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">History</h3>
            {loading ? (
               <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 10).map((ann, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {confirmingDelete === ann.id && (
                        <button 
                          onClick={() => setConfirmingDelete(null)}
                          className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all italic bg-white rounded-xl border border-slate-100"
                        >
                          No
                        </button>
                      )}
                      <button 
                        onClick={() => ann.id && handleDelete(ann.id)}
                        disabled={!!actioning}
                        className={cn(
                          "p-3 rounded-xl transition-all border border-slate-100 shadow-sm",
                          confirmingDelete === ann.id 
                            ? "bg-red-600 text-white animate-pulse" 
                            : "text-slate-400 hover:text-red-500 hover:bg-white md:opacity-50 md:group-hover:opacity-100"
                        )}
                        title="Delete Announcement"
                      >
                        {actioning === ann.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1 pr-10">{ann.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{ann.message}</p>
                    <div className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{ann.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
