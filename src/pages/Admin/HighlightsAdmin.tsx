import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Plus, Trash2, Loader2, Calendar, MapPin, Clock } from 'lucide-react';
import { Highlight } from '@/src/pages/types';
import { supabase } from '@/src/lib/supabase';

export default function HighlightsAdmin() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    venue: '',
    description: '',
    image_url: 'https://picsum.photos/seed/nss/800/600'
  });

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setHighlights(data.map(h => ({
          id: h.id,
          event: h.event_name,
          date: h.event_date,
          venue: h.venue || '',
          description: h.description || '',
          image: h.image_url
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log("Attempting to publish highlight...");

      // Ensure session for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
      
      const { error } = await supabase
        .from('highlights')
        .insert([{
          event_name: formData.event_name,
          event_date: formData.event_date,
          venue: formData.venue,
          description: formData.description,
          image_url: formData.image_url
        }]);
      
      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      alert("Highlight published successfully!");
      setFormData({ 
        event_name: '', 
        event_date: '', 
        venue: '',
        description: '',
        image_url: 'https://picsum.photos/seed/nss/800/600'
      });
      fetchHighlights();
    } catch (err: any) {
      console.error(err);
      alert("Error publishing highlight: " + (err.message || "Database error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("handleDelete triggered for id:", id);
    if (!confirm("Delete this highlight?")) return;
    try {
      // Ensure session for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, signing in anonymously for delete...");
        await supabase.auth.signInAnonymously();
      }

      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Supabase Delete Error:", error);
        throw error;
      }
      
      alert("Highlight deleted successfully.");
      fetchHighlights();
    } catch (err: any) {
      console.error(err);
      alert("Error deleting highlight: " + (err.message || "Database error"));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Highlights</h2>
          <p className="text-slate-500 text-sm">Create and remove events featured on the homepage.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              New Highlight
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                type="text" required placeholder="Event Name" 
                value={formData.event_name} onChange={e => setFormData({...formData, event_name: e.target.value})}
                className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium" 
              />
              <input 
                type="date" required 
                value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})}
                className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium" 
              />
              <input 
                type="text" required placeholder="Venue" 
                value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})}
                className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium" 
              />
              <textarea 
                placeholder="Description" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium resize-none" 
              />
              <button
                disabled={submitting}
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "🚀 Publish Highlight"}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6">Published Highlights</h3>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="animate-spin text-slate-300" size={32} />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading...</p>
              </div>
            ) : highlights.length > 0 ? (
              <div className="space-y-3">
                {highlights.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{h.event}</h4>
                        <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">{h.description}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={10} /> {h.date}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {h.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(h.id)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all border border-slate-100 md:border-transparent md:hover:border-slate-100 shadow-sm md:opacity-100"
                      title="Delete Highlight"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 italic text-sm">No highlights published yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
