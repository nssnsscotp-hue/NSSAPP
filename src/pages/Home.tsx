import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Calendar, User, Heart, MessageSquare, Trophy, School, MapPin, 
  Loader2, BarChart3, Library, GraduationCap, Star, Flame, ArrowRight, 
  Instagram, MessageCircle, ExternalLink, HelpCircle, ChevronDown, 
  HeartHandshake, ChevronRight, ShieldCheck, Award, Info, BookOpen,
  Sparkles, Check, CheckCircle2, Globe, ArrowUpRight, Smartphone, Monitor,
  Droplets, Activity
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
          await supabase.auth.signInAnonymously().catch(() => {});
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
            image: h.image_url || h.image || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop',
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
      .channel('blood_updates_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_emergency_requests' }, () => {
        fetchHomeData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const punchCards = [
    { 
      title: 'Leaderboard', 
      href: '/leaderboard', 
      icon: Trophy, 
      color: 'bg-amber-500 text-amber-700 border-amber-200/60 hover:bg-amber-500/5', 
      desc: 'Top student rankings' 
    },
    { 
      title: 'Performance Meter', 
      href: '/performance', 
      icon: BarChart3, 
      color: 'bg-indigo-500 text-indigo-700 border-indigo-200/60 hover:bg-indigo-500/5', 
      desc: 'NSS work statistics' 
    },
    { 
      title: 'Digital ID Card', 
      href: '/id-card', 
      icon: User, 
      color: 'bg-blue-500 text-blue-700 border-blue-200/60 hover:bg-blue-500/5', 
      desc: 'Personal verified pass' 
    },
    { 
      title: 'Bulletin Board', 
      href: '/announcements', 
      icon: Bell, 
      color: 'bg-orange-500 text-orange-700 border-orange-200/60 hover:bg-orange-500/5', 
      desc: 'Official direct orders' 
    },
    { 
      title: 'Resource Library', 
      href: '/resources', 
      icon: Library, 
      color: 'bg-emerald-500 text-emerald-700 border-emerald-200/60 hover:bg-emerald-500/5', 
      desc: 'Camp logs & handouts' 
    },
    { 
      title: 'Alumni Network', 
      href: '/alumni', 
      icon: GraduationCap, 
      color: 'bg-purple-500 text-purple-700 border-purple-200/60 hover:bg-purple-500/5', 
      desc: 'Graduated volunteers' 
    },
    { 
      title: 'Quiz Hub', 
      href: '/quiz', 
      icon: Flame, 
      color: 'bg-rose-500 text-rose-700 border-rose-200/60 hover:bg-rose-500/5', 
      desc: 'Earn points interactively' 
    },
    { 
      title: 'Attendance Log', 
      href: '/attendance', 
      icon: Calendar, 
      color: 'bg-teal-500 text-teal-700 border-teal-200/60 hover:bg-teal-500/5', 
      desc: 'Mark presence on duty' 
    },
    { 
      title: 'Blood Bank', 
      href: '/bloodbank', 
      icon: Heart, 
      color: 'bg-red-500 text-red-700 border-red-200/60 hover:bg-red-500/5', 
      desc: 'Emergency blood pool' 
    },
    { 
      title: 'Reporting System', 
      href: '/complaints', 
      icon: MessageSquare, 
      color: 'bg-slate-500 text-slate-700 border-slate-200/60 hover:bg-slate-500/5', 
      desc: 'Submit community issues' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-slate-900 pb-24 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative">
      {/* Dynamic graphic: Glowing architectural matrix background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[800px] bg-gradient-to-tr from-indigo-300/10 via-purple-300/5 to-transparent -z-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] bg-gradient-to-br from-blue-300/10 via-teal-300/5 to-transparent -z-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[40vw] h-[40vw] max-w-[400px] bg-gradient-to-tr from-pink-300/5 to-transparent -z-10 blur-[100px] rounded-full pointer-events-none" />

      {/* Elegant high-Contrast Bulletin Notice Ticker */}
      <div className="bg-slate-950 text-white py-3.5 border-b border-indigo-950/20 relative z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 border border-red-500/20 px-3.5 py-1 rounded-full shrink-0 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Live Operations Notice</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative w-full">
            <div className="animate-marquee text-xs text-slate-300 font-semibold tracking-wide">
              {emergencyAlerts.length > 0 ? (
                <span className="inline-flex items-center gap-12">
                  {emergencyAlerts.map((alert, idx) => (
                    <span key={idx} className="inline-flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0 animate-pulse" />
                      <strong className="text-white uppercase font-black text-[9px] bg-red-600/30 border border-red-500/20 px-2 py-0.5 rounded tracking-widest leading-none">⚠️ High Emergency</strong> 
                      Need <span className="font-extrabold text-red-400 text-xs sm:text-sm bg-red-500/10 px-2 py-0.5 rounded">{alert.bloodGroup}</span> blood at {alert.venue}. Hotline contact: <strong className="text-white underline decoration-rose-500/80 decoration-2 underline-offset-2">{alert.contact}</strong>
                    </span>
                  ))}
                  <span className="text-slate-600 font-bold">•</span>
                  <span className="text-indigo-300">⚡ University accredited Grade-A digital framework active. Sign-in to confirm your local camp points ledger updates.</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-6 text-slate-200">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded text-[9.5px]">
                    <Sparkles size={11} className="text-indigo-400" /> System Live
                  </span>
                  <span>⚡ Registered Volunteers with Units 36 and 94, please access the portal workspace to input camp hours metrics.</span>
                  <span className="text-indigo-800 font-bold">•</span>
                  <span>⚡ Calicut University affliated Grade-A National Service Scheme wing operations active on campus.</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-8 md:pt-12 space-y-12 sm:space-y-16">
        
        {/* NEW HIGH-END HYBRID HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero: Stunning Typography, Integrated Metrics & Action Triggers */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm mx-auto lg:mx-0">
              <Award size={13} className="text-indigo-600 animate-pulse" /> Affiliated to Calicut University
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[0.95] select-none uppercase">
                Not Me <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 relative">
                  But You
                </span>
              </h1>
              
              <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Developing the collective social responsibility of youth since 1969. Program Units 36 and 94 at NSS College Ottapalam foster community living, regular medical camps, immediate emergency blood relief, environmental restoration, and civic literacy campaigns.
              </p>
            </div>

            {/* CTA action group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isLoggedIn ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Active Session:</span>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Logged in as {userRole}</span>
                  </div>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:translate-y-[-2px] cursor-pointer"
                  >
                    <span>Secure Portal Sign-In</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link 
                    to="/help"
                    className="w-full sm:w-auto h-14 px-8 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-extrabold text-xs uppercase tracking-widest rounded-2xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <HelpCircle size={15} className="text-slate-500" />
                    <span>NSS Help & Guidelines</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Micro-Stats for beautiful layout layout */}
            <div className="pt-6 sm:pt-8 border-t border-slate-200/60 grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight block">94/36</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">Welfare Units</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono tracking-tight block">110+</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">Volunteers</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight block">Grade A</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">State Rating</span>
              </div>
            </div>

          </div>

          {/* Right Hero: Gorgeous Interactive Frame of Panoramic Campus with Overlap badges */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000" />
            
            <div className="relative bg-white p-3 rounded-[2.5rem] border border-slate-200/60 shadow-2xl overflow-hidden">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full rounded-[2rem] overflow-hidden bg-slate-950">
                <img 
                  src="https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg" 
                  alt="NSS College Ottapalam Main Campus Panoramic" 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Embedded dynamic weather/status sticker */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest">Campus Live</span>
                </div>
              </div>

              {/* Overlapping Glassmorphic Stat Sticker */}
              <div className="absolute -bottom-6 -left-4 sm:left-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white p-5 rounded-3xl shadow-2xl max-w-xs space-y-1.5 select-none hidden sm:block transform group-hover:translate-y-[-4px] transition-transform duration-500">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">National Youth Division</span>
                </div>
                <h4 className="text-xs font-black uppercase tracking-tight text-white">NSS College Ottapalam</h4>
                <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                  Accredited by the Technical Directorate as a Grade-A model of social integration.
                </p>
              </div>

            </div>
          </div>

        </section>

        {/* SECURE ROLE-BASED HUB PANEL - Centered control deck for logged-in authorities */}
        <AnimatePresence>
          {isLoggedIn && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {userRole === 'principal' ? (
                /* Principal Authority Panel */
                <div className="bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        👑 Top College Authority Account
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Principal Administration Hub</h3>
                      <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                        Welcome, <strong>Dr. NSS Principal</strong>. You have absolute administrative control over NSS College Ottapalam. Explore total verification logs of Units 36 and 94, filter attendance records by department or specific programs, and publish official announcements/pin active program diaries directly from your board room.
                      </p>
                    </div>
                    <Link
                      to="/principal"
                      className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:translate-y-[-2px] flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Enter Principal Panel</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : userRole === 'hod' ? (
                /* HOD Authority Panel */
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        🎓 Department Authority Account
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">HOD Dashboard Portal</h3>
                      <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                        Assess and track real-time NSS volunteer registrations and active community work lists specifically corresponding to your academic department and units.
                      </p>
                    </div>
                    <Link
                      to="/hod"
                      className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:translate-y-[-2px] flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Enter HOD Panel</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : userRole === 'admin' ? (
                /* Site Admin Panel */
                <div className="bg-slate-950 border border-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        🛡️ Site Administrator
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Admin Control Room</h3>
                      <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                        Oversee global database schema states, verify clinical blood repositories, generate volunteer QR code IDs, verify registered files, and manage complaints files.
                      </p>
                    </div>
                    <Link
                      to="/admin"
                      className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:translate-y-[-2px] flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Enter Admin Panel</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Redesigned Premium Standard Volunteer Hub Dashboard (Immaculate Bento Card Grid) */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Interactive Workspace</p>
                      <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Volunteer Operations Hub</h3>
                    </div>
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Drill down into clinical records, verify attendance logs or earn activity points
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {punchCards.map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <Link
                          key={card.title}
                          to={card.href}
                          className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col items-center justify-between text-center hover:border-indigo-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group min-h-[170px]"
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110", 
                            card.color
                          )}>
                            <Icon size={20} />
                          </div>
                          <div className="space-y-1 mt-3">
                            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {card.title}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium leading-tight">
                              {card.desc}
                            </p>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 group-hover:translate-x-1 transition-transform inline-flex lg:hidden items-center gap-1 mt-2.5">
                            Open <ChevronRight size={10} />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* AMRIT BLOOD BANK SPOTLIGHT BANNER/CARD */}
        <section id="amrit-blood-bank-card" className="relative bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-red-600/10 overflow-hidden group">
          {/* Subtle background glows and graphic accents */}
          <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-tr from-white/10 to-transparent -z-10 translate-x-[20%] -translate-y-[20%] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-8 right-8 text-white/5 font-mono text-9xl font-black select-none pointer-events-none uppercase tracking-tighter">
            AMRIT
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left side info block */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.15em] mx-auto lg:mx-0">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                <span className="text-white">🔴 AMRIT COOPERATIVE INITIATIVE</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none italic">
                  Amrit Blood Bank <br />
                  <span className="text-red-100 font-extrabold not-italic text-2xl sm:text-3xl tracking-normal capitalize">Secure Emergency Donor Pool</span>
                </h2>
                <p className="text-red-50 text-xs sm:text-sm md:text-base leading-relaxed font-semibold max-w-2xl mx-auto lg:mx-0">
                  A private, student-led life protection framework coordinated by National Service Scheme Units 36 and 94. We maintain an immediate-response blood directory for Ottapalam Taluk Hospital and local emergencies, assuring absolute donor credential shielding.
                </p>
              </div>

              {/* Three key pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={20} className="text-red-200 shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wide block text-white">Full Privacy</span>
                    <span className="text-[9px] font-semibold text-red-200 block">Shielded Directory</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center gap-3">
                  <Activity size={20} className="text-red-200 shrink-0 border-none" />
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wide block text-white">Direct Alerts</span>
                    <span className="text-[9px] font-semibold text-red-200 block">Immediate Broadcast</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center gap-3">
                  <Award size={20} className="text-red-200 shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wide block text-white">Grade-A Hours</span>
                    <span className="text-[9px] font-semibold text-red-200 block">NSS Certified Points</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/bloodbank"
                  className="w-full sm:w-auto h-14 px-8 bg-white text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest rounded-2xl transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:translate-y-[-2px] cursor-pointer"
                >
                  <Heart size={14} className="fill-current text-red-600 animate-pulse" />
                  <span>Join as Blood Donor</span>
                </Link>
                <Link
                  to="/bloodbank"
                  className="w-full sm:w-auto h-14 px-8 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition duration-300 flex items-center justify-center gap-2 hover:translate-y-[-2px] cursor-pointer"
                >
                  <Droplets size={14} className="text-white" />
                  <span>Emergency Request Blood</span>
                </Link>
              </div>
            </div>

            {/* Right side interactive graphic deck */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="absolute -inset-4 bg-red-400/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-500 pointer-events-none" />
              
              <div className="relative bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 shadow-xl max-w-sm w-full space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-red-200/80 font-black uppercase">GRID STATUS</span>
                  <span className="flex items-center gap-1 bg-red-500/30 px-2 py-0.5 rounded text-[8.5px] font-black tracking-wider uppercase border border-red-500/20">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" /> Active Matcher
                  </span>
                </div>

                {/* Blood Grid Visual */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'A+', active: true },
                    { label: 'B+', active: true },
                    { label: 'O+', active: true },
                    { label: 'AB+', active: true },
                    { label: 'A-', active: true },
                    { label: 'B-', active: false },
                    { label: 'O-', active: true },
                    { label: 'AB-', active: false }
                  ].map((bg, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 transition-all duration-300 cursor-default select-none",
                        bg.active 
                          ? "bg-white/10 hover:bg-red-500/40 border-white/20 hover:border-red-400 text-white scale-100 hover:scale-105 shadow-md shadow-black/5"
                          : "bg-black/10 border-white/5 text-white/40 opacity-40"
                      )}
                    >
                      <Droplets size={16} className={cn("mb-1", bg.active ? "text-red-300" : "text-white/25")} />
                      <span className="text-[10px] font-black tracking-tight">{bg.label}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-red-900/30 border border-red-500/20 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-red-300" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-red-200">Ottapalam Community Registry</span>
                  </div>
                  <p className="text-[10px] text-red-100/90 leading-normal font-semibold">
                    Our platform automatically matches requests against this secure pool under strict privacy policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Double Column Feature Grid: Interactive logs on left + Official notice feed on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Highlights Module (Left Column 60%) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Interactive Archives</p>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Program Diaries</h3>
              </div>
              <Link to="/gallery" className="text-indigo-600 hover:text-indigo-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 group select-none">
                <span>Browse Full Gallery</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {highlights.length > 0 ? (
              (() => {
                const activeId = selectedHighlightId || highlights[0]?.id;
                const activeH = highlights.find(h => h.id === activeId) || highlights[0];
                return (
                  <div className="bg-white border border-slate-200/80 p-6 rounded-[2.5rem] space-y-6 shadow-md relative overflow-hidden">
                    
                    {/* Media Frame wrapper */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-100 shadow-md group/img">
                      <img 
                        src={activeH.image} 
                        alt={activeH.event} 
                        className="w-full h-full object-cover transition-transform duration-[1s] group-hover/img:scale-102"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      
                      {/* Venue label */}
                      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                        <MapPin size={11} className="text-indigo-400" />
                        <span>{activeH.venue}</span>
                      </div>

                      {/* Date tag badge */}
                      <div className="absolute bottom-4 right-4 bg-indigo-600 text-white text-[9.5px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-lg border border-indigo-400/20">
                        {activeH.date}
                      </div>
                    </div>

                    {/* Metadata text */}
                    <div className="space-y-2.5">
                      <span className="bg-amber-100 border border-amber-200/60 text-amber-800 text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md">
                        ★ Verified Active Event
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">{activeH.event}</h4>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {activeH.description || "National Service Scheme works closely with local governing departments to run health camps, water distribution points and environmental awareness modules."}
                      </p>
                    </div>

                    {/* Choose activity slider with premium hover magnification */}
                    <div className="border-t border-slate-150 pt-5 space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Select a direct entry to inspect</p>
                      
                      <div className="flex gap-3 overflow-x-auto pb-1.5 select-none scrollbar-none snap-x">
                        {highlights.map((h) => (
                          <button
                            key={h.id}
                            onClick={() => setSelectedHighlightId(h.id)}
                            className={cn(
                              "text-left p-3 rounded-2xl border text-[10px] font-extrabold uppercase transition-all duration-300 flex items-center gap-3 shrink-0 min-w-[210px] snap-center cursor-pointer",
                              h.id === activeId 
                                ? "bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-600/25 scale-[0.99]" 
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                            )}
                          >
                            <img 
                              src={h.image} 
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-black/10" 
                              alt="" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="space-y-0.5">
                              <span className="line-clamp-1 font-black">{h.event}</span>
                              <span className={cn("text-[8px] font-bold block", h.id === activeId ? "text-indigo-200" : "text-slate-400")}>
                                {h.date}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()
            ) : (
              <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem] text-sm text-slate-400 font-medium">
                No active highlights posted. Administrative council logs are empty.
              </div>
            )}
          </section>

          {/* Official Bulletin Board Column 40% */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Direct Announcements</p>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">College Notice Bulletins</h3>
            </div>

            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((ann, idx) => (
                  <div 
                    key={ann.id || idx} 
                    className="bg-white border border-slate-200 hover:border-indigo-200 p-5 rounded-[2rem] transition-all duration-300 flex gap-4 group shadow-sm hover:shadow-md relative overflow-hidden"
                  >
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform duration-350" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between gap-2.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400">{ann.date}</span>
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Official Decree</span>
                      </div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-snug">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem] text-xs text-slate-400 font-medium italic">
                  No active announcements published recently.
                </div>
              )}

              <Link
                to="/announcements"
                className="w-full h-14 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer"
              >
                <Bell size={14} className="text-indigo-600" /> 
                <span>Open Digital Notice Cabinet</span>
              </Link>
            </div>
          </aside>

        </div>

        {/* Real-world Leadership & Patronage Profiles with corrected photos & elegant aesthetic alignments */}
        <section className="space-y-8 relative">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-tr from-indigo-500/5 to-transparent -z-10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Institutional Pillar</p>
              <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight">Our Executive team</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              NSS Programme Officers Committee
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                name: "Dr. Rajesh R", 
                role: "PRINCIPAL / CHIEF PATRON",
                dept: "Patron & Head of Institution",
                image: "https://i.ibb.co/CKWMvrGV/1000144256.jpg",
                accent: "from-indigo-600 to-indigo-800",
                shadow: "shadow-indigo-600/10"
              },
              { 
                name: "Dr. Aparna B", 
                role: "ASST. PROFESSOR ENGLISH / PO", 
                dept: "NSS Programme Officer (Unit 36)",
                image: "https://i.ibb.co/jkrny0qs/1000080292-2.jpg",
                accent: "from-blue-600 to-blue-800",
                shadow: "shadow-blue-600/10"
              },
              { 
                name: "Dr. Rakhikrishna R", 
                role: "ASST. PROFESSOR PHYSICS / PO", 
                dept: "NSS Programme Officer (Unit 94)",
                image: "https://i.ibb.co/S7yYBqrK/1000080292.jpg",
                accent: "from-rose-600 to-rose-800",
                shadow: "shadow-rose-600/10"
              }
            ].map((leader, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={cn(
                  "group bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                )}
              >
                {/* Decorative border layout stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${leader.accent}`} />
                
                <div className="space-y-5">
                  {/* Portrait with premium framing & drop shadow controls */}
                  <div className="relative mx-auto w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-slate-200/80 group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={leader.image} 
                      alt={leader.name} 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="text-center space-y-1.5">
                    <span className="text-[8.5px] font-black text-indigo-600 uppercase tracking-[0.2em] block leading-none">
                      {leader.role}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">
                      {leader.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block leading-relaxed">
                      {leader.dept}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-center items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-[9.5px] font-mono font-bold uppercase text-slate-500">Verified Board Member</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Real Statistics Table Framework (No fake larping descriptions) */}
        <section className="bg-slate-950 text-white rounded-[2.5rem] p-8 sm:p-10 md:p-12 border border-slate-900 shadow-2xl overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block">NSS Framework</span>
              <h4 className="text-lg font-black uppercase italic tracking-tight text-white">College Affiliation metrics</h4>
              <p className="text-xs text-slate-400 font-semibold max-w-sm mt-2 leading-relaxed">
                Registered metrics logged securely within the state administration database archives.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:pl-10 text-center md:text-left space-y-1">
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white block">2 Units</span>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Unit 36 & Unit 94</p>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Independently Verified</span>
            </div>

            <div className="pt-6 md:pt-0 md:pl-10 text-center md:text-left space-y-1">
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-emerald-400 block">110+</span>
              <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase">Enrolled Active Students</p>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Calicut University Approved</span>
            </div>

            <div className="pt-6 md:pt-0 md:pl-10 text-center md:text-left space-y-1">
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-amber-400 block">Grade-A</span>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Accreditation Class</p>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">State Service standard</span>
            </div>
          </div>
        </section>

        {/* FAQs & External Portal Gateways Layout */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pt-4">
          
          {/* FAQ Accordion Side */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Frequently Inquired</p>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">nss handbook & guidelines</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { 
                  q: "What is the core philosophy and motto of NSS?", 
                  a: "The National Service Scheme operates under the core motto 'Not Me But You'. It insists on democratic community living and stresses that an individual's welfare is strictly intertwined with the collective welfare of the society." 
                },
                { 
                  q: "Under which administrative body are these units registered?", 
                  a: "NSS College Ottapalam's Unit 36 and Unit 94 are affiliated under the Calicut University NSS Cell. They operate strictly matching the guidelines issued by the Ministry of Youth Affairs & Sports, India." 
                },
                {
                  q: "How do volunteers accumulate activity points?",
                  a: "Volunteers accumulate points through direct involvement in blood donation campaigns, dynamic cleaning camps, community survey registries, and official seminars. These are certified by Program Officers and mapped into the digital ID."
                }
              ].map((item, i) => {
                const isOpen = faqOpenIndex === i;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-350">
                    <button
                      onClick={() => setFaqOpenIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left font-extrabold uppercase text-[10.5px] tracking-tight text-slate-900 group cursor-pointer"
                    >
                      <span className="group-hover:text-indigo-600 transition-colors leading-relaxed">{item.q}</span>
                      <ChevronDown size={15} className={cn("text-slate-400 transition-transform duration-300 shrink-0 ml-4", isOpen && "rotate-180 text-indigo-600")} />
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-50">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Resources Portal Side */}
          <div className="md:col-span-4 space-y-6">
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">External Directory</p>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Official Portals</h3>
            </div>

            <div className="space-y-3">
              <a 
                href="https://nsscollegeottapalam.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-indigo-50 border border-indigo-200/80 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase text-indigo-700 tracking-wider hover:bg-indigo-100/50 hover:border-indigo-300 hover:translate-x-1 transition-all duration-300"
              >
                <span>NSS College Ottapalam Website</span>
                <Globe size={13} className="text-indigo-600" />
              </a>
              <a 
                href="https://nss.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase text-slate-700 tracking-wider hover:translate-x-1 transition-all duration-300"
              >
                <span>National NSS Portal Govt.</span>
                <ExternalLink size={13} className="text-slate-400" />
              </a>
              <a 
                href="https://mybharat.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase text-slate-700 tracking-wider hover:translate-x-1 transition-all duration-300"
              >
                <span>MyBharat Portal Ministry</span>
                <ExternalLink size={13} className="text-slate-400" />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Modern High-End Footer */}
      <footer className="pt-20 pb-12 bg-slate-950 text-slate-400 border-t border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5 pb-10">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-14 h-14 bg-white p-1.5 rounded-2xl shadow-xl">
                <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="NSS College Logo Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-black text-sm uppercase tracking-wider leading-none">NSS College Ottapalam</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">National Service Scheme | College Units 36 & 94</p>
                <p className="text-[9px] text-slate-600 font-medium">Affiliated to Calicut University, NAAC Grade A Accredited</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/nss_nsscotp?igsh=eDRsODA4MTFobzYy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
                title="Official Instagram Handle"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://chat.whatsapp.com/Brz2cw30s1VCwJjAsot8rg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
                title="NSS General Whatsapp Directory Link"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] text-center">
            <span>© 2026 NSS COLLEGE OTTAPALAM DIGITAL HUB. ALL PORTAL INTENTS CONSERVED.</span>
            <span className="text-slate-400">"Not Me But You"</span>
          </div>

        </div>
      </footer>
    </div>
  );
}
