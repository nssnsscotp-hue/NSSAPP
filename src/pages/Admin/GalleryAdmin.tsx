import React, { useState, useEffect } from 'react';
import { 
  Plus, Image as ImageIcon, Trash2, Loader2, 
  Send, Calendar, Type, Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  date: string;
  category: string;
}

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  // Form State
  const [newItem, setNewItem] = useState({
    url: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Activity'
  });

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setItems(data.map(x => ({ 
          id: x.id, 
          url: x.url, 
          title: x.title, 
          date: x.date, 
          category: x.category 
        })));
      }
    } catch (err) { console.error('Gallery fetch failed', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGallery(); }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.url || !newItem.title) {
      alert("Missing Data: Image URL and Title are mandatory.");
      return;
    }

    setSubmitting(true);
    try {
      // Ensure session for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) await supabase.auth.signInAnonymously();

      const { error } = await supabase
        .from('gallery')
        .insert([{
          url: newItem.url.trim(),
          title: newItem.title.trim(),
          date: newItem.date,
          category: newItem.category
        }]);
      
      if (error) throw error;

      alert("Success! Image published to activity gallery.");
      setNewItem({ url: '', title: '', date: new Date().toISOString().split('T')[0], category: 'Activity' });
      fetchGallery();
    } catch (err) { 
      alert("Error publishing: Check your connection.");
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    if (confirmingDelete !== id) {
      setConfirmingDelete(id);
      return;
    }

    setDeleting(id);
    setConfirmingDelete(null);
    const numericId = parseInt(id);
    const isNumeric = !isNaN(numericId);

    try {
      // Ensure session for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) await supabase.auth.signInAnonymously();

      // Attempt delete by id
      let { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);
      
      if (error || isNumeric) {
        if (isNumeric) {
          await supabase.from('gallery').delete().eq('id', numericId);
          await supabase.from('gallery').delete().eq('row', numericId);
        }
        await supabase.from('gallery').delete().eq('row', id);
      }
      
      alert("Activity removed successfully.");
      await fetchGallery();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete record: " + (err.message || "Database error"));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <ImageIcon className="text-emerald-600" size={32} /> Gallery Studio
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest">Curate and publish activity highlights.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Publisher */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 italic sticky top-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <Plus size={16} /> New Activity Card
            </h3>

            <form onSubmit={handlePublish} className="space-y-6">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Image URL</label>
                 <div className="relative">
                   <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="url" required placeholder="https://i.postimg.cc/..." 
                    value={newItem.url} onChange={e => setNewItem({...newItem, url: e.target.value})}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-xs" 
                  />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Activity Title</label>
                 <div className="relative">
                   <Type size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" required placeholder="e.g. Mega Blood Donation" 
                    value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-xs" 
                  />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
                   <div className="relative">
                     <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                      type="date" required 
                      value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-xs" 
                    />
                   </div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                   <select 
                    value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-[10px] uppercase tracking-widest"
                   >
                     <option>Activity</option>
                     <option>Achievement</option>
                     <option>Camp</option>
                     <option>Meeting</option>
                   </select>
                 </div>
               </div>

               {newItem.url && (
                 <div className="pt-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Preview</p>
                   <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                     <img src={newItem.url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   </div>
                 </div>
               )}

               <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
               >
                 {submitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Publish to Gallery</>}
               </button>
            </form>
          </div>
        </div>

        {/* Right: Management */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" size={40} /></div>
            ) : items.length > 0 ? items.map((item) => (
              <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="aspect-video relative">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 h-6 px-3 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center">
                    {item.category}
                  </div>
                </div>
                <div className="p-5 flex justify-between items-center italic">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-bold text-slate-900 leading-tight line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {confirmingDelete === item.id && (
                      <button 
                        onClick={() => setConfirmingDelete(null)}
                        className="text-[10px] font-black uppercase text-slate-400"
                      >
                        No
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={!!deleting}
                      className={cn(
                        "p-3 rounded-xl transition-all",
                        confirmingDelete === item.id 
                          ? "bg-red-600 text-white animate-pulse" 
                          : "text-slate-200 hover:text-red-500 hover:bg-red-50 group-hover:text-slate-400"
                      )}
                    >
                      {deleting === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 italic text-slate-400 text-center">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">No activities published yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
