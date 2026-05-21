import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Calendar, User, Heart, MessageSquare, Trophy, School, MapPin, 
  Loader2, BarChart3, Library, GraduationCap, Star, Flame, ArrowRight, 
  Instagram, MessageCircle, ExternalLink, HelpCircle, ChevronDown, 
  HeartHandshake, ChevronRight, ShieldCheck, Award, Info, BookOpen
} from 'lucide-react';
import { Highlight } from '@/src/pages/types';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

export default function Home() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('name') || localStorage.getItem('user') || 'Volunteer';
  const userRole = localStorage.getItem('role') || 'volunteer';

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // Ensure anonymous session for database read operations
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await supabase.auth.signInAnonymously();
        }

        // 1. Fetch live Highlights
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

        // 2. Fetch Active Emergency Requests (No dummy counts, just the real alerts)
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

        // 3. Fetch announcements for homepage notice board feed
        const { data: announcementsData } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (announcementsData) {
          setAnnouncements(announcementsData.map(a => ({
            id: (a.id || a.row || Math.random().toString()).toString(),
            title: a.title || 'Official Notification',
            content: a.content || a.message || '',
            date: a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) : 'Recent'
          })));
        }
      } catch (err) {
        console.error('Home data load failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    // Subscribe to realtime updates
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
    { title: 'Leaderboard', href: '/leaderboard', icon: Trophy, color: 'bg-amber-600 text-amber-600 hover:border-amber-200 hover:bg-amber-50/50' },
    { title: 'Performance Meter', href: '/performance', icon: BarChart3, color: 'bg-indigo-600 text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50' },
    { title: 'Digital ID Card', href: '/id-card', icon: User, color: 'bg-blue-600 text-blue-600 hover:border-blue-200 hover:bg-blue-50/50' },
    { title: 'Bulletin Board', href: '/announcements', icon: Bell, color: 'bg-orange-600 text-orange-600 hover:border-orange-200 hover:bg-orange-50/50' },
    { title: 'Resource Hub', href: '/resources', icon: Library, color: 'bg-emerald-600 text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50' },
    { title: 'Alumni Network', href: '/alumni', icon: GraduationCap, color: 'bg-purple-600 text-purple-600 hover:border-purple-200 hover:bg-purple-50/50' },
    { title: 'NSS Quiz Hub', href: '/quiz', icon: Flame, color: 'bg-rose-600 text-rose-600 hover:border-rose-200 hover:bg-rose-50/50' },
    { title: 'Attendance Log', href: '/attendance', icon: Calendar, color: 'bg-teal-600 text-teal-600 hover:border-teal-200 hover:bg-teal-50/50' },
    { title: 'Blood Directory', href: '/bloodbank', icon: Heart, color: 'bg-red-600 text-red-600 hover:border-red-200 hover:bg-red-50/50' },
    { title: 'Reporting System', href: '/complaints', icon: MessageSquare, color: 'bg-slate-600 text-slate-600 hover:border-slate-200 hover:bg-slate-50/50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 pb-24 selection:bg-blue-100 selection:text-blue-900 relative">
      {/* Absolute top glowing background decor for premium look */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent -z-10 blur-3xl rounded-full" />

      {/* Notice Ticker Banner */}
      <div className="bg-slate-900 text-white py-3 overflow-hidden border-b border-slate-800 shadow-md relative z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0 bg-red-600/10 border border-red-500/20 px-2.5 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Notice Bulletin</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center gap-12 whitespace-nowrap text-xs text-slate-300 font-medium">
              {emergencyAlerts.length > 0 ? (
                emergencyAlerts.map((alert, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5">
                    🚨 <strong className="text-white uppercase font-black tracking-wider bg-red-600/30 px-1.5 py-0.5 rounded text-[10px]">Urgent Blood</strong> Need: {alert.bloodGroup} Blood at {alert.venue}. Hub Contact: <strong className="text-red-400 font-bold underline">{alert.contact}</strong>
                  </span>
                ))
              ) : (
                <span className="animate-marquee inline-block pl-4">
                  Welcome to the National Service Scheme (NSS) Digital Portal | NSS College Ottapalam Units 36 & 94. Log in under the secure portal to mark attendance or audit reports.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 sm:pt-10 md:pt-12 space-y-12">
        
        {/* Top Header Section : Custom Identity Column */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-slate-200/80 p-2.5 rounded-2xl flex items-center justify-center shadow-xs transform hover:rotate-3 transition-transform">
              <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="NSS Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Units 36 & 94</span>
                <span className="bg-slate-200/80 border border-slate-300 text-slate-800 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1">
                  <School size={10} /> Affiliated to Calicut University
                </span>
              </div>
              <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight italic mt-1.5">
                NSS College Ottapalam
              </h1>
            </div>
          </div>

          {/* Clean and Simple Login CTA - Perfectly aligned without awkward giant bulging */}
          <div className="flex items-center gap-3 shrink-0">
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <span>Portal Login</span>
                <ArrowRight size={13} className="text-blue-400" />
              </Link>
            ) : (
              <div className="flex items-center gap-3 bg-white border border-slate-200/80 pl-3.5 pr-2 py-1.5 rounded-xl shadow-xs">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Logged In</p>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight mt-1">{username}</p>
                </div>
                <Link
                  to={userRole === 'admin' ? '/admin' : userRole === 'hod' ? '/hod' : '/profile'}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center transition"
                >
                  Dashboard
                </Link>
              </div>
            )}
            <Link
              to="/sos"
              className="inline-flex items-center justify-center w-10 h-10 bg-red-50 border border-red-100 rounded-xl text-red-600 hover:bg-red-100 transition-all shadow-sm"
              title="Emergency SOS Alerts"
            >
              <Heart size={16} className="animate-pulse" />
            </Link>
          </div>
        </header>

        {/* Hero Section: Sophisticated Graphic Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200/65 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-100/40 relative overflow-hidden">
          {/* Subtle backdrop circle glow */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Award size={12} className="text-blue-600 animate-spin-slow" /> Government Registered Social Cell
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.95] uppercase italic font-sans">
              Not Me <br />
              <span className="text-blue-600 font-black relative">
                But You.
                <span className="absolute left-0 bottom-1 w-full h-1.5 bg-blue-100 -z-10 skew-x-12" />
              </span>
            </h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Driven by democratic living and selfless public services, the National Service Scheme units 36 & 94 at NSS College Ottapalam bridge physical knowledge with community rehabilitation. From regional clinical camps to water literacy drives, we build leaders through direct community actions.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link 
                to="/gallery" 
                className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition flex items-center gap-2 group shadow-sm"
              >
                <span>Browse Gallery</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link 
                to="/help" 
                className="h-12 px-6 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-widest rounded-xl transition flex items-center gap-1.5"
              >
                <HelpCircle size={14} />
                <span>Learn Operations</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1" />

          {/* Right Banner Showcase Card - Styled elegantly and professionally */}
          <div className="lg:col-span-4 relative">
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border-4 border-white transform rotate-1 hover:rotate-0 transition-all duration-300">
              <img 
                src="https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg" 
                alt="NSS College Ottapalam Main Campus" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Ottapalam, Palakkad</span>
                <h4 className="font-extrabold text-sm uppercase tracking-tight mt-1">Our Heritage Site Campus</h4>
              </div>
            </div>
            
            {/* Small active badge overlap */}
            <div className="absolute -bottom-3 -left-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase leading-none">NSS State Rating</p>
                <p className="text-xs font-black text-slate-800 uppercase mt-0.5">Grade-A accredited</p>
              </div>
            </div>
          </div>
        </section>

        {/* Portal Directories Section (Shown clearly for easier structural clicks) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <p className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Self Service Portal</p>
              <h3 className="text-xl font-black uppercase text-slate-900">Volunteer Operations Grid</h3>
            </div>
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Secure authentication needed for logging attendance or audit records
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {punchCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.href}
                  className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-slate-300 transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-sm group h-32"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2.5 shadow-sm group-hover:scale-105 transition-transform", card.color.split(' ')[0])}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
                    {card.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Two-Column split: Live Highlight Slider vs Official Bulletins Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Highlights Module (Left Column 60%) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Interactive Logs</p>
                <h3 className="text-lg font-black text-slate-900 uppercase">Active Program Diaries</h3>
              </div>
              <Link to="/gallery" className="text-blue-600 hover:text-blue-700 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                <span>View Full Gallery</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {highlights.length > 0 ? (
              (() => {
                const activeId = selectedHighlightId || highlights[0]?.id;
                const activeH = highlights.find(h => h.id === activeId) || highlights[0];
                return (
                  <div className="bg-white border border-slate-200/70 p-5 rounded-2xl space-y-5">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                      <img 
                        src={activeH.image} 
                        alt={activeH.event} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                        📍 {activeH.venue}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                        {activeH.date}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-black text-slate-900 uppercase">{activeH.event}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {activeH.description || "The National Service Scheme team takes up direct regional operations matching emergency campaigns across Palakkad districts."}
                      </p>
                    </div>

                    {/* Timeline slider items list */}
                    <div className="border-t border-slate-100 pt-3.5 space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Choose activity file to preview</p>
                      <div className="flex gap-2 overflow-x-auto pb-1 select-none scrollbar-thin">
                        {highlights.map((h) => (
                          <button
                            key={h.id}
                            onClick={() => setSelectedHighlightId(h.id)}
                            className={cn(
                              "text-left p-2 rounded-xl border text-[10px] font-bold uppercase transition-all flex items-center gap-2 shrink-0 min-w-[200px]",
                              h.id === activeId 
                                ? "bg-blue-50/50 border-blue-200 text-blue-700" 
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                            )}
                          >
                            <img src={h.image} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" referrerPolicy="no-referrer" />
                            <span className="line-clamp-1">{h.event}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl text-xs text-slate-400 font-medium">
                No active highlights posted. Highlights can be managed in the administration cabinet panels.
              </div>
            )}
          </section>

          {/* Official Bulletin Notices Module (Right Column 40%) */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Circular Feed</p>
              <h3 className="text-lg font-black text-slate-900 uppercase">Official Announcements</h3>
            </div>

            <div className="space-y-3.5">
              {announcements.length > 0 ? (
                announcements.map((ann, idx) => (
                  <div key={ann.id || idx} className="bg-white border border-slate-200/60 p-4.5 rounded-2xl hover:border-blue-200 transition-all flex gap-3.5 group relative">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400">{ann.date}</span>
                        <span className="bg-slate-100 border border-slate-200/80 text-slate-500 text-[8px] font-bold uppercase px-1.5 py-0.2 rounded">Press</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-tight group-hover:text-blue-700 transition-colors leading-snug">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white border border-dashed border-slate-100 rounded-2xl text-[11px] text-slate-400 italic">
                  No active bulletins published recently.
                </div>
              )}

              <Link
                to="/announcements"
                className="w-full h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Bell size={13} className="text-blue-600" /> 
                <span>Open Public Notifications Cell</span>
              </Link>
            </div>
          </aside>
        </div>

        {/* Leadership & Patronage Profiles - Perfectly updated with correct titles and names */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Institutional Pillar</p>
              <h3 className="text-xl font-black text-slate-900 uppercase">NSS Administrative Secretariat</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { 
                name: "Shri. Rajesh R", 
                role: "PRINCIPAL",
                dept: "Patron & Head of Institution",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", // professional placeholder or neutral
                desc: "Leading intellectual transformations, managing university liaison, and supervising general campus disciplines." 
              },
              { 
                name: "Dr. Aparna B", 
                role: "ASST. PROFESSOR ENGLISH", 
                dept: "NSS Programme Officer (Unit 36)",
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", 
                desc: "Directing Unit 36 affairs, coordinating calendar events, academic volunteer placements, and welfare activities." 
              },
              { 
                name: "Dr. Rakhikrishna R", 
                role: "ASST. PROFESSOR PHYSICS", 
                dept: "NSS Programme Officer (Unit 94)",
                avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", 
                desc: "Managing Unit 94 actions, supervising local liaison, administering medical campaigns and public safety systems." 
              }
            ].map((leader, i) => (
              <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-black text-lg">
                      {leader.name.split(' ').pop()?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block leading-none">{leader.role}</span>
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase mt-1">{leader.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{leader.dept}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    {leader.desc}
                  </p>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                  <span>Authorized Signature</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <ShieldCheck size={11} /> Registered State Cell
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Professional Metrics Card (No fake metrics, real counts estimates) */}
        <section className="bg-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Unit Framework</span>
              <h4 className="text-xl font-black uppercase italic leading-none">Statistical Balance Table</h4>
              <p className="text-[11px] text-slate-400 font-semibold max-w-[190px]">
                Providing absolute structural transparency across our active cadres.
              </p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-8 space-y-1">
              <span className="text-[28px] font-black tracking-tight text-white leading-none">2 Units</span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Actively Audited (36 & 94)</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-8 space-y-1">
              <span className="text-[28px] font-black tracking-tight text-emerald-400 leading-none">110+</span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Enrolled Cadres</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-8 space-y-1">
              <span className="text-[28px] font-black tracking-tight text-sky-400 leading-none">Grade-A</span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">State Affiliation Level</p>
            </div>
          </div>
        </section>

        {/* FAQs and External Directories */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          
          {/* FAQ Column */}
          <div className="md:col-span-8 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Frequently Asked Guidelines</h3>
            <div className="space-y-2.5">
              {[
                { 
                  q: "What is the core NSS motto?", 
                  a: "The core motto is 'Not Me But You'. It underlines democratic living and insists that one's welfare depends on the welfare of society as a whole." 
                },
                { 
                  q: "Under which university is NSS College affiliated?", 
                  a: "NSS College Ottapalam is affiliated under Calicut University. The NSS units operate strictly under the central rules of the University NSS Cell." 
                },
                {
                  q: "How to register as an HOD or volunteer?",
                  a: "Department Heads can register securely inside the HOD registration section in the admin panel. Once approved, login allows HODs to view their department roster attendance directly."
                }
              ].map((item, i) => {
                const isOpen = faqOpenIndex === i;
                return (
                  <div key={i} className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
                    <button
                      onClick={() => setFaqOpenIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left font-extrabold uppercase text-[10px] tracking-tight text-slate-900 group"
                    >
                      <span className="group-hover:text-blue-600 transition-colors">{item.q}</span>
                      <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-[11px] text-slate-500 font-bold leading-relaxed border-t border-slate-50">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Links Column */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">External Authorities</h3>
            <div className="space-y-2">
              <a 
                href="https://nss.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3.5 bg-white border border-slate-200/65 rounded-xl flex items-center justify-between text-[11px] font-black uppercase text-slate-700 tracking-wider hover:border-blue-200 hover:-translate-x-0.5 transition"
              >
                <span>National NSS Portal</span>
                <ExternalLink size={12} className="text-slate-400" />
              </a>
              <a 
                href="https://mybharat.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3.5 bg-white border border-slate-200/65 rounded-xl flex items-center justify-between text-[11px] font-black uppercase text-slate-700 tracking-wider hover:border-blue-200 hover:-translate-x-0.5 transition"
              >
                <span>MyBharat Portal</span>
                <ExternalLink size={12} className="text-slate-400" />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Details */}
      <footer className="pt-16 pb-10 bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white p-1.5 rounded-xl">
                <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="NSS Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-wider leading-snug">NSS COLLEGE OTTAPALAM</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">National Service Scheme | Welfare Cells 36 & 94</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href="https://www.instagram.com/nss_nsscotp?igsh=eDRsODA4MTFobzYy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition"
                title="Instagram Handle"
              >
                <Instagram size={17} />
              </a>
              <a 
                href="https://chat.whatsapp.com/Brz2cw30s1VCwJjAsot8rg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition"
                title="Official Whatsapp Directory"
              >
                <MessageCircle size={17} />
              </a>
            </div>
          </div>
          
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <span>© 2026 NSS COLLEGE OTTAPALAM DIGITAL HUB. ALL RIGHTS RESERVED.</span>
            <span className="text-slate-400 tracking-[0.2em]">"Not Me But You"</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
