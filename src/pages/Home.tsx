import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Calendar, User, Heart, MessageSquare, Image, Trophy, School, MapPin, Loader2, BarChart3, Library, GraduationCap, Star, Sparkles, ArrowRight, Instagram, MessageCircle, Globe, ExternalLink } from 'lucide-react';
import { GAS_URLS } from '@/src/lib/constants';
import { Highlight } from '@/src/pages/types';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

export default function Home() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const username = localStorage.getItem('name') || localStorage.getItem('user') || 'Volunteer';

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // Ensure session for RLS
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await supabase.auth.signInAnonymously();
        }

        // 1. Fetch Highlights
        const { data: highlightsData } = await supabase
          .from('highlights')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (highlightsData) {
          setHighlights(highlightsData.map(h => ({
            id: (h.id || h.row || Math.random().toString()).toString(),
            event: h.event_name || h.event || 'Untitled',
            venue: h.venue || 'N/A',
            date: h.event_date || h.date || new Date().toLocaleDateString(),
            image: h.image_url || h.image || 'https://picsum.photos/seed/nss/800/600',
            description: h.description || ''
          })));
        }

        // 2. Fetch Emergency Alerts
        const { data: alertsData } = await supabase
          .from('blood_emergency_requests')
          .select('*')
          .eq('status', 'active');
        
        if (alertsData) {
          setEmergencyAlerts(alertsData.map(a => ({
            bloodGroup: a.blood_group,
            venue: a.hospital_venue,
            contact: a.contact_number,
            status: a.status
          })));
        }
      } catch (err) {
        console.error('Home data load failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    // Subscribe to realtime blood requests
    const channel = supabase
      .channel('blood_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_emergency_requests' }, () => {
        fetchHomeData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const punchCards = [
    { title: 'Leaderboard', href: '/leaderboard', icon: Trophy, color: 'bg-yellow-500', shadow: 'shadow-yellow-500/20' },
    { title: 'My Performance', href: '/performance', icon: BarChart3, color: 'bg-blue-600', shadow: 'shadow-blue-600/20' },
    { title: 'Digital ID', href: '/id-card', icon: User, color: 'bg-indigo-600', shadow: 'shadow-indigo-600/20' },
    { title: 'Announcements', href: '/announcements', icon: Bell, color: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
    { title: 'Resources', href: '/resources', icon: Library, color: 'bg-emerald-600', shadow: 'shadow-emerald-600/20' },
    { title: 'Alumni Network', href: '/alumni', icon: GraduationCap, color: 'bg-purple-600', shadow: 'shadow-purple-600/20' },
    { title: 'Attendance', href: '/attendance', icon: Calendar, color: 'bg-cyan-600', shadow: 'shadow-cyan-600/20' },
    { title: 'Blood Bank', href: '/bloodbank', icon: Heart, color: 'bg-red-600', shadow: 'shadow-red-600/20' },
    { title: 'Complaints', href: '/complaints', icon: MessageSquare, color: 'bg-slate-600', shadow: 'shadow-slate-600/20' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Emergency Blood Ticker - Enhanced Glassy Design */}
      <div className="bg-slate-950 text-white py-4 overflow-hidden border-b border-white/5 shadow-2xl relative z-20">
        <div className="absolute inset-0 bg-linear-to-r from-red-600/20 via-transparent to-red-600/20 pointer-events-none" />
        
        <div className="flex px-4 md:px-8 max-w-7xl mx-auto items-center mb-0 relative z-10">
          <div className="flex items-center gap-2 mr-6 shrink-0">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute inset-0" />
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full relative" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-red-500">Live Alert</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <motion.div 
              initial={{ x: "0%" }}
              animate={{ x: "-50%" }}
              transition={{ 
                duration: 25, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="inline-flex items-center gap-16 whitespace-nowrap"
            >
              {[1, 2].map((group) => (
                <div key={group} className="flex items-center gap-16">
                  {emergencyAlerts.length > 0 ? emergencyAlerts.map((alert, idx) => (
                    <div key={`${group}-${idx}`} className="flex items-center gap-4">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase italic tracking-widest shadow-lg rotate-[-2deg]">
                        Urgent
                      </span>
                      <span className="text-sm font-black uppercase italic tracking-tighter text-slate-100 flex items-center gap-3">
                        <span className="text-red-500 text-lg">●</span>
                        {alert.bloodGroup} Required @ <span className="text-white border-b border-red-500/30">{alert.venue}</span>
                        <span className="text-slate-500 mx-2">|</span>
                        Contact: <span className="text-brand-400">{alert.contact}</span>
                      </span>
                    </div>
                  )) : (
                    <div className="flex items-center gap-12">
                      <div className="flex items-center gap-4">
                        <span className="bg-brand-600 text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase italic tracking-widest shadow-lg rotate-[-2deg]">
                          Broadcast
                        </span>
                        <span className="text-sm font-black uppercase italic tracking-tighter text-slate-100">
                          NSS Units 36 & 94 Digital Operations Center <span className="text-brand-500">Online</span>
                        </span>
                      </div>
                      <span className="text-slate-800 font-black italic opacity-20">/ / / /</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black uppercase italic tracking-tighter text-slate-300">
                          Centralized Impact Tracking Active
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          
          {/* Main Content Area */}
          <section className="lg:col-span-8 space-y-12 md:space-y-20">
            {/* College Photo Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
            >
              <img 
                src="https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg" 
                alt="College Banner" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent flex items-end p-8 md:p-12">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-brand-300 uppercase tracking-[0.4em] italic drop-shadow-md">NSS Units 36 & 94</span>
                  <p className="text-white text-lg md:text-xl font-black uppercase italic tracking-widest drop-shadow-md">Building Impact at NSS College Ottapalam</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="relative"
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-brand-600" />
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.4em] italic">Live Portal 2026</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.9] uppercase italic tracking-tighter mb-8">
                Not Me <br /> 
                <span className="text-brand-600">But You.</span>
              </h2>
              
              <div className="pro-card p-8 md:p-12 border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                 <div className="relative z-10">
                   <h4 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3 uppercase italic tracking-tight">
                     Welcome, {username} <Sparkles className="text-brand-500" size={24} />
                   </h4>
                   <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
                     You are connected to the central command of Units 36 & 94. 
                     Sync your milestones, track impact, and respond to live campaigns across the campus.
                   </p>
                 </div>
                 
                 <div className="mt-12 flex items-center gap-6">
                    <div className="flex -space-x-3">
                      <img src="https://i.postimg.cc/26p0PBCZ/1000144256.jpg" className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl object-cover" alt="V" />
                      <img src="https://i.postimg.cc/C1ycWfw8/1000080292.jpg" className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl object-cover" alt="V" />
                      <div className="w-14 h-14 rounded-2xl border-4 border-white bg-brand-600 flex items-center justify-center text-[11px] font-black text-white shadow-xl">
                        +110
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Volunteers in Unit</p>
                 </div>
              </div>
            </motion.div>

            {/* Bento Grid Navigation */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8"
            >
              {punchCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    to={card.href}
                    className="pro-card pro-card-hover p-8 h-full flex flex-col items-center justify-center text-center group"
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110", 
                      card.color, 
                      "text-white shadow-xl"
                    )}>
                      <card.icon size={28} />
                    </div>
                    <h4 className="font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-slate-900 group-hover:text-brand-600 transition-colors">{card.title}</h4>
                  </Link>
                </motion.div>
              ))}
            </motion.div>


          </section>

          {/* Side Panels Area */}
          <aside className="lg:col-span-4 space-y-10 md:space-y-12">
            {/* Unit Stats Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="pro-card p-10 bg-slate-900 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center p-2 border border-white/10">
                  <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter italic">Unit Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic tracking-[0.2em]">Operational</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {[
                  { label: 'Total Force', value: '110+', color: 'text-brand-400' },
                  { label: 'Impact Grade', value: 'Grade A', color: 'text-emerald-400' },
                  { label: 'Achievements', value: '200+', color: 'text-yellow-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest tracking-[0.2em] mb-1">{stat.label}</span>
                    <span className={cn("text-2xl font-black italic tracking-tighter", stat.color)}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/bloodbank" 
                className="mt-12 block w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-brand-600/30 transition-all text-center text-[10px] uppercase tracking-[0.25em] italic"
              >
                Join Donor Wing
              </Link>
            </motion.div>

            {/* Highlights Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="pro-heading text-lg text-slate-900 underline decoration-brand-500 underline-offset-8">Unit Feed</h3>
                <span className="pro-label">April 2026</span>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-200" size={32} /></div>
                ) : (
                  highlights.slice(0, 4).map((h, i) => (
                    <motion.div 
                      key={h.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="pro-card p-6 border-slate-100 hover:border-brand-200 group cursor-pointer"
                    >
                      <div className="text-[9px] font-black uppercase text-brand-500 mb-2 tracking-[0.2em]">{h.date}</div>
                      <h4 className="font-black text-sm text-slate-900 leading-snug line-clamp-2 uppercase italic tracking-tight group-hover:text-brand-600 transition-colors">{h.event}</h4>
                      <div className="mt-4 flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                          <MapPin size={12} className="text-brand-400" /> {h.venue}
                        </div>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-600" />
                      </div>
                    </motion.div>
                  ))
                )}
                <Link 
                  to="/calendar" 
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  <Calendar size={16} /> View Full Timeline
                </Link>
              </div>
            </div>

            {/* Official Portals Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="pro-heading text-lg text-slate-900 underline decoration-brand-500 underline-offset-8">Official Portals</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <a 
                  href="https://nss.gov.in/en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="pro-card p-5 border-slate-100 hover:border-brand-200 group flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase italic tracking-tight text-slate-900">National NSS</h4>
                      <p className="text-[10px] font-medium text-slate-400">Official Government Portal</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                </a>

                <a 
                  href="https://mybharat.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="pro-card p-5 border-slate-100 hover:border-brand-200 group flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <Star size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase italic tracking-tight text-slate-900">MyBharat Portal</h4>
                      <p className="text-[10px] font-medium text-slate-400">Volunteer Opportunities</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="mt-40 pt-32 pb-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-20 pb-24">
            <div className="lg:col-span-2 space-y-10">
               <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white p-2 rounded-2xl">
                  <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" className="w-full h-full object-contain" alt="Logo" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h5 className="font-black text-3xl tracking-tighter uppercase italic leading-none">NSS <span className="text-brand-500">DIGITAL CELL</span></h5>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">Units 36 & 94 | College Ottapalam</p>
                </div>
               </div>
               <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                 Transforming the spirit of social service into a digital-first movement. Empowering volunteers with data, recognition, and real-time connectivity.
               </p>
            </div>
            
            <div className="space-y-8">
               <h6 className="pro-label text-white">Quick Access</h6>
               <ul className="space-y-5 text-sm font-bold uppercase tracking-widest text-slate-500">
                  <li><Link to="/leaderboard" className="hover:text-brand-400 transition-colors italic">Leaderboard</Link></li>
                  <li><Link to="/bloodbank" className="hover:text-brand-400 transition-colors italic">Blood Bank</Link></li>
                  <li><Link to="/id-card" className="hover:text-brand-400 transition-colors italic">Digital ID</Link></li>
                  <li><Link to="/performance" className="hover:text-brand-400 transition-colors italic">Performance</Link></li>
               </ul>
            </div>

            <div className="space-y-8">
               <h6 className="pro-label text-white">Social Influence</h6>
               <div className="flex gap-4">
                  <a 
                    href="https://www.instagram.com/nss_nsscotp?igsh=eDRsODA4MTFobzYy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-600 transition-all duration-500"
                    title="Official Instagram"
                  >
                    <Instagram size={24} />
                  </a>
                  <a 
                    href="https://chat.whatsapp.com/Brz2cw30s1VCwJjAsot8rg" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-600 transition-all duration-500"
                    title="WhatsApp Group"
                  >
                    <MessageCircle size={24} />
                  </a>
               </div>
            </div>
          </div>
          
          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">© 2026 NSS Digital Infrastructure Cell</p>
             <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">
                <span className="hover:text-white cursor-pointer">Privacy Protocol</span>
                <span className="hover:text-white cursor-pointer">Unit Bylaws</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
