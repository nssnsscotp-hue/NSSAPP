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
      color: 'from-amber-400/10 to-orange-500/10 text-amber-600 border-amber-200/80 hover:bg-amber-500/5 hover:border-amber-400 hover:text-amber-700', 
      glow: 'rgba(245, 158, 11, 0.12)',
      desc: 'Top student rankings' 
    },
    { 
      title: 'Performance Meter', 
      href: '/performance', 
      icon: BarChart3, 
      color: 'from-indigo-400/10 to-blue-500/10 text-indigo-600 border-indigo-200/80 hover:bg-indigo-505/5 hover:border-indigo-400 hover:text-indigo-700', 
      glow: 'rgba(79, 70, 229, 0.12)',
      desc: 'NSS work statistics' 
    },
    { 
      title: 'Digital ID Card', 
      href: '/id-card', 
      icon: User, 
      color: 'from-blue-400/10 to-sky-500/10 text-blue-600 border-blue-200/80 hover:bg-blue-500/5 hover:border-blue-400 hover:text-blue-700', 
      glow: 'rgba(37, 99, 235, 0.12)',
      desc: 'Personal verified pass' 
    },
    { 
      title: 'Bulletin Board', 
      href: '/announcements', 
      icon: Bell, 
      color: 'from-orange-400/10 to-amber-500/10 text-orange-600 border-orange-200/80 hover:bg-orange-500/5 hover:border-orange-400 hover:text-orange-700', 
      glow: 'rgba(249, 115, 22, 0.12)',
      desc: 'Official direct orders' 
    },
    { 
      title: 'Resource Library', 
      href: '/resources', 
      icon: Library, 
      color: 'from-emerald-400/10 to-teal-500/10 text-emerald-600 border-emerald-200/80 hover:bg-emerald-500/5 hover:border-emerald-400 hover:text-emerald-700', 
      glow: 'rgba(16, 185, 129, 0.12)',
      desc: 'Camp logs & handouts' 
    },
    { 
      title: 'Alumni Network', 
      href: '/alumni', 
      icon: GraduationCap, 
      color: 'from-purple-400/10 to-fuchsia-500/10 text-purple-600 border-purple-200/80 hover:bg-purple-500/5 hover:border-purple-400 hover:text-purple-700', 
      glow: 'rgba(147, 51, 234, 0.12)',
      desc: 'Graduated volunteers' 
    },
    { 
      title: 'Quiz Hub', 
      href: '/quiz', 
      icon: Flame, 
      color: 'from-rose-400/10 to-red-500/10 text-rose-600 border-rose-200/80 hover:bg-rose-500/5 hover:border-rose-400 hover:text-rose-700', 
      glow: 'rgba(244, 63, 94, 0.12)',
      desc: 'Earn points interactively' 
    },
    { 
      title: 'Attendance Log', 
      href: '/attendance', 
      icon: Calendar, 
      color: 'from-teal-400/10 to-emerald-500/10 text-teal-600 border-teal-200/80 hover:bg-teal-500/5 hover:border-teal-400 hover:text-teal-700', 
      glow: 'rgba(20, 184, 166, 0.12)',
      desc: 'Mark presence on duty' 
    },
    { 
      title: 'Blood Bank', 
      href: '/bloodbank', 
      icon: Heart, 
      color: 'from-red-400/10 to-rose-500/10 text-red-600 border-red-200/80 hover:bg-red-500/5 hover:border-red-400 hover:text-red-700', 
      glow: 'rgba(220, 38, 38, 0.12)',
      desc: 'Emergency blood pool' 
    },
    { 
      title: 'Reporting System', 
      href: '/complaints', 
      icon: MessageSquare, 
      color: 'from-slate-400/10 to-zinc-500/10 text-slate-600 border-slate-200/85 hover:bg-slate-500/5 hover:border-slate-400 hover:text-slate-800', 
      glow: 'rgba(71, 85, 105, 0.12)',
      desc: 'Submit community issues' 
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 18
      }
    }
  };

  const textRevealVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 starry-grid font-sans text-slate-900 pb-24 selection:bg-brand-500 selection:text-white overflow-x-hidden relative animate-fade-in">
      
      {/* Morphing Dynamic Flares and Cinematic Lights */}
      <div className="absolute top-[5vh] left-[5vw] w-96 h-96 bg-brand-400/8 rounded-full blur-3xl organic-blob pointer-events-none -z-10" />
      <div className="absolute top-[40vh] right-[5vw] w-[450px] h-[450px] bg-purple-500/8 rounded-full blur-3xl organic-blob pointer-events-none -z-10 animate-float-delayed" />
      <div className="absolute top-[85vh] left-[15vw] w-[400px] h-[400px] bg-emerald-450/4 rounded-full blur-3xl organic-blob pointer-events-none -z-10 animate-float" />

      {/* Dynamic graphic: Soft glowing mesh vectors in the background responsive layers */}
      <div className="absolute top-[-20%] left-[-15%] w-[90vw] h-[90vw] max-w-[1000px] bg-gradient-to-tr from-brand-300/10 via-purple-300/5 to-transparent -z-10 blur-[150px] rounded-full pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-[35%] right-[-10%] w-[70vw] h-[70vw] max-w-[800px] bg-gradient-to-br from-blue-300/8 via-teal-300/3 to-transparent -z-10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[5%] left-[2%] w-[50vw] h-[50vw] max-w-[500px] bg-gradient-to-tr from-rose-300/5 to-indigo-300/5 -z-10 blur-[120px] rounded-full pointer-events-none" />

      {/* High-Conversion Panoramic Campus Banner Header */}
      <div 
        className="relative w-full h-auto min-h-[140px] sm:min-h-[190px] flex items-center overflow-hidden border-b-4 border-amber-500 select-none shadow-2xl py-4 sm:py-6 bg-slate-950"
        style={{ 
          backgroundImage: "url('https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dynamic Multi-layered Premium Dark Wash to protect text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-black/50 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.45), transparent) pointer-events-none" />
        <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />



        {/* Content Container (Symmetric, responsive flexbox matching Left & Right logos) */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-row items-center justify-between gap-3 sm:gap-6 md:gap-8">
            
            {/* Left Box: Official College Logo Badge */}
            <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white p-1 sm:p-2 bg-gradient-to-br from-white to-slate-50 rounded-xl sm:rounded-[1.3rem] shadow-2xl shrink-0 flex items-center justify-center transform hover:rotate-2 transition-transform duration-300 border border-white/20">
              <img 
                src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" 
                alt="NSS College Ottapalam Emblem" 
                className="w-full h-full object-contain animate-fade-in" 
                referrerPolicy="no-referrer" 
              />
            </div>
            
            {/* Center Box: Unified Stacked Info Aligned Exactly as Requested */}
            <div className="flex-1 text-center space-y-1 sm:space-y-1.5 min-w-0">
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400/90 rounded text-[8px] font-bold uppercase tracking-[0.2em] shadow-sm">
                🏛️ Government Aided Institution • ESTD. 1964
              </span>
              <h1 className="text-base sm:text-3.5xl md:text-4.5xl lg:text-5.5xl font-black tracking-tight text-white uppercase leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                NSS College, Ottapalam
              </h1>
              <h2 className="text-xs sm:text-2xl md:text-3xl lg:text-3.5xl font-extrabold text-slate-100 tracking-wide uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                National Service Scheme
              </h2>
              <p className="text-[10px] sm:text-sm md:text-base font-black text-amber-400 tracking-widest uppercase leading-none">
                Programme Units 36 & 94
              </p>
              <div className="hidden sm:block text-[6.5px] sm:text-[7px] md:text-[7.5px] text-slate-400/90 font-medium uppercase tracking-wider">
                Affiliated to University of Calicut • NAAC Re-accredited with 'A' Grade
              </div>
            </div>

            {/* Right Box: National Service Scheme Emblem */}
            <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white p-1 sm:p-2 bg-gradient-to-br from-white to-slate-50 rounded-xl sm:rounded-[1.3rem] shadow-2xl shrink-0 flex items-center justify-center transform hover:-rotate-2 transition-transform duration-300 border border-white/20">
              <img 
                src="https://i.postimg.cc/Xq7KPnqK/pngkey-com-allu-arjun-png-2479287.png" 
                alt="National Service Scheme Emblem" 
                className="w-full h-full object-contain animate-fade-in" 
                referrerPolicy="no-referrer" 
              />
            </div>

          </div>
        </div>
      </div>

      {/* Elegant Realtime Notice Ticker bar */}
      <div className="bg-slate-950 text-white py-3 border-b border-indigo-950/20 relative z-30 shadow-lg select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-hidden relative w-full">
          
          {emergencyAlerts.length > 0 ? (
            <>
              <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 border border-red-500/20 px-3 py-1 rounded-full shrink-0 shadow-md font-sans mr-4">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white">Live Operations Notice</span>
              </div>
              
              <div className="flex-1 overflow-hidden relative w-full">
                <div className="animate-marquee text-[11px] text-slate-300 font-semibold tracking-wide">
                  <span className="inline-flex items-center gap-12">
                    {emergencyAlerts.map((alert, idx) => (
                      <span key={idx} className="inline-flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0 animate-pulse" />
                        <strong className="text-white uppercase font-black text-[9px] bg-red-600/30 border border-red-500/20 px-2 py-0.5 rounded tracking-widest leading-none">⚠️ High Emergency</strong> 
                        Need <span className="font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{alert.bloodGroup}</span> blood at {alert.venue}. Hotline contact: <strong className="text-white underline decoration-rose-500/80 decoration-2 underline-offset-2">{alert.contact}</strong>
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-hidden relative w-full">
              <div className="animate-marquee text-[11px] text-slate-300 font-semibold tracking-wide py-0.5">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-black uppercase tracking-widest text-[9.5px]">✨ Welcome Note:</span>
                  <span>Welcome to NSS College Ottapalam NSS Portal. NSS Program Units 36 & 94 welcome all volunteers and dynamic change-makers! Join us in our journey of youth leadership, blood donations, environmental restorations, and community welfare.</span>
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 space-y-20">
        
        {/* PREMIUM STARTUP-LEVEL HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left"
          >

            <div className="space-y-4">
              <motion.h1 
                variants={textRevealVariants}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[0.95] uppercase"
              >
                Not Me <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-650 via-indigo-600 to-indigo-800">
                  But You
                </span>
              </motion.h1>
              
              <motion.p 
                variants={textRevealVariants}
                className="text-slate-650 text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold"
              >
                Developing the collective social responsibility of youth. Program Units 36 and 94 at NSS College Ottapalam foster community living, dynamic medical campaigns, instant emergency blood relief, environmental restoration, and civic literacy campaigns with stellar impact.
              </motion.p>
            </div>

            {/* CTA action buttons */}
            <motion.div 
              variants={textRevealVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              {isLoggedIn ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-100/80 p-1.5 rounded-3xl border border-slate-200">
                  <div className="px-5 py-2.5 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Logged In: <strong className="text-indigo-600">{username}</strong> ({userRole})</span>
                  </div>
                  <Link 
                    to="/profile"
                    className="w-full sm:w-auto h-11 px-6 text-xs text-indigo-600 hover:text-indigo-850 font-black uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Go to My Profile</span>
                    <ChevronRight size={14} className="stroke-[3px]" />
                  </Link>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-white hover:to-white hover:text-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 hover:translate-y-[-2px] hover:border-indigo-650 border border-transparent cursor-pointer"
                  >
                    <span>Secure Portal Sign-In</span>
                    <ArrowRight size={14} className="stroke-[3px]" />
                  </Link>
                  <Link 
                    to="/help"
                    className="w-full sm:w-auto h-14 px-8 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-widest rounded-2xl transition flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 cursor-pointer shadow-xs"
                  >
                    <HelpCircle size={15} className="text-slate-500" />
                    <span>NSS Guidelines Portal</span>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Clean Micro-Stats Grid */}
            <motion.div 
              variants={textRevealVariants}
              className="pt-6 sm:pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-left"
            >
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight block">36 / 94</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">Official Units</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono tracking-tight block">110+</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">Acclaimed Volunteers</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight block">Grade A</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">State Rank</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Image Module */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-5 relative group hidden sm:block"
          >
            <div className="absolute -inset-3 bg-gradient-to-r from-brand-650 to-purple-600 rounded-[2.5rem] blur-2xl opacity-15 group-hover:opacity-25 transition duration-1000" />
            
            <div className="relative bg-white p-3 rounded-[2.8rem] border border-slate-200/60 shadow-2xl overflow-hidden hover:scale-[1.01] transition-all duration-500">
              <div className="relative aspect-[4/3] w-full rounded-[2.2rem] overflow-hidden bg-slate-900">
                <img 
                  src="https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg" 
                  alt="NSS College Ottapalam Main Campus Panoramic" 
                  className="w-full h-full object-cover transition-transform duration-[1.8s] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                {/* Embedded live sticker badge */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl text-white flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest">Campus Operations Live</span>
                </div>
              </div>

              {/* Float Glassmorphic Badge */}
              <div className="absolute -bottom-4 -left-4 bg-slate-900/98 backdrop-blur-xl border border-white/10 text-white p-5 rounded-3xl shadow-xl max-w-[260px] space-y-1 select-none pointer-events-none transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-300">National Youth Division</span>
                </div>
                <h4 className="text-xs font-black uppercase tracking-tight">NSS College Ottapalam</h4>
                <p className="text-[9.5px] text-slate-350 leading-normal font-semibold">
                  Recognized as an outstanding model of high-conversion community stewardship.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECURE ROLE-BASED HUB PANEL - Exquisite custom control desk */}
        <AnimatePresence mode="wait">
          {isLoggedIn && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {userRole === 'principal' ? (
                /* Principal Authority Panel */
                <div className="bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-brand-600/5 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        👑 Principal Executive Authority Control
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">College Command & Verification Desk</h3>
                      <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                        Welcome back, <strong>Principal Administration</strong>. Under Calicut University statutes, you have absolute operational oversight of NSS Units 36 and 94. Implement global parameters, verify certified rosters, deploy official campus circular directives, and access verified complaint reports.
                      </p>
                    </div>
                    <Link
                      to="/principal"
                      className="px-7 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Launch Chief Console</span>
                      <ArrowRight size={14} className="stroke-[3px]" />
                    </Link>
                  </div>
                </div>
              ) : userRole === 'hod' ? (
                /* HOD Authority Panel */
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        🎓 Academic Department Oversight
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">Department HOD Portal</h3>
                      <p className="text-slate-500 text-xs sm:text-sm max-w-3xl leading-relaxed">
                        Verify student involvement records, endorse certified volunteer logs, track active community program calendars, and review local attendance registers.
                      </p>
                    </div>
                    <Link
                      to="/hod"
                      className="px-7 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Access Department Desk</span>
                      <ArrowRight size={14} className="stroke-[3px]" />
                    </Link>
                  </div>
                </div>
              ) : userRole === 'admin' ? (
                /* Site Admin Panel */
                <div className="bg-slate-950 border border-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-3xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        🛡️ Site Administrator Account
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Global Management Control Room</h3>
                      <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
                        Configure clinical blood emergency registries, build secured database records, manage portal users, deploy announcements, and issue verification cards.
                      </p>
                    </div>
                    <Link
                      to="/admin"
                      className="px-7 py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Launch Master Console</span>
                      <ArrowRight size={14} className="stroke-[3px]" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Premium Professional Volunteer Hub Layout (Bento Grid) */
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Interactive Workspace</span>
                      <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-1000 tracking-tight">Volunteer Portal Workspace</h3>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider lg:text-right max-w-md">
                      Endorse rosters, check points ledgers, read official manuals, or enroll inside active disaster reliefs.
                    </p>
                  </div>

                  {/* High-fidelity Bento grid */}
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-70px' }}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
                  >
                    {punchCards.map((card) => {
                      const Icon = card.icon;
                      return (
                        <motion.div
                          key={card.title}
                          variants={{
                            hidden: { opacity: 0, scale: 0.95, y: 15 },
                            visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                          }}
                          whileHover={{ y: -6, transition: { duration: 0.2 } }}
                          className="relative group bg-white border border-slate-200/90 rounded-[2rem] p-6 hover:border-brand-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[190px] cursor-pointer"
                        >
                          <Link to={card.href} className="absolute inset-0 z-10" />
                          
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border bg-gradient-to-br transition-all duration-300 group-hover:scale-110", 
                            card.color
                          )}>
                            <Icon size={21} />
                          </div>

                          <div className="space-y-1.5 mt-6 relative z-0">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
                              {card.title}
                            </h4>
                            <p className="text-[10.5px] text-slate-450 font-semibold leading-normal">
                              {card.desc}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <span>Launch Tool</span>
                            <ChevronRight size={10} className="stroke-[3px] group-hover:translate-x-1.5 transition-transform" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* AMRIT VOLUNTEER BLOOD HUB GRID (Ruby Spotlight Card) */}
        <section id="amrit-blood-bank-card" className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-red-650 via-rose-600 to-red-750 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden group"
          >
            {/* Design Gradients and dynamic typography watermark */}
            <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-tr from-white/10 to-transparent -z-10 translate-x-[20%] -translate-y-[20%] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-red-400/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-6 right-6 text-white/5 font-display text-[7rem] sm:text-[10rem] font-black select-none pointer-events-none uppercase tracking-tighter leading-none">
              AMRIT
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
              
              {/* Left Side: Spotlight info */}
              <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.15em] mx-auto lg:mx-0">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-white">🔴 AMRIT CLINICAL COOPERATIVE INITIATIVE</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight italic">
                    Amrit Blood Bank <br />
                    <span className="text-red-100 font-extrabold not-italic text-lg sm:text-2xl tracking-normal capitalize">Secure Emergency Donor Pool</span>
                  </h2>
                  <p className="text-red-50 text-xs sm:text-sm leading-relaxed font-semibold max-w-2xl mx-auto lg:mx-0">
                    A secure, student-coordinated safety matrix organized by National Service Scheme Units 36 and 94 matches local emergencies, protecting verified donor profiles under statutory standards.
                  </p>
                </div>

                {/* Pillars / Features grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-white/8 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-red-250 shrink-0" />
                    <div className="text-left">
                      <span className="text-[9px] font-black uppercase tracking-wide block text-white">Full Privacy</span>
                      <span className="text-[8px] font-semibold text-red-200 block font-sans">Credential Shielding</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/8 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2.5">
                    <Activity size={16} className="text-red-250 shrink-0" />
                    <div className="text-left">
                      <span className="text-[9px] font-black uppercase tracking-wide block text-white">Direct Alerts</span>
                      <span className="text-[8px] font-semibold text-red-200 block font-sans">Immediate Broadcast</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/8 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2.5">
                    <Award size={16} className="text-red-250 shrink-0" />
                    <div className="text-left">
                      <span className="text-[9px] font-black uppercase tracking-wide block text-white">Grade-A Hour</span>
                      <span className="text-[8px] font-semibold text-red-200 block font-sans">NSS points approved</span>
                    </div>
                  </div>
                </div>

                {/* Action button triggers */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    to="/bloodbank"
                    className="w-full sm:w-auto h-12 px-6 bg-white text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-sm hover:translate-y-[-1px] active:scale-[0.98] cursor-pointer"
                  >
                    <Heart size={13} className="fill-current text-red-600 animate-pulse" />
                    <span>Register as Donor</span>
                  </Link>
                  <Link
                    to="/bloodbank"
                    className="w-full sm:w-auto h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:scale-[0.98] cursor-pointer"
                  >
                    <Droplets size={13} className="text-white" />
                    <span>Request Board</span>
                  </Link>
                </div>
              </div>

              {/* Right Side: Visual Interactive Donor Panel mock */}
              <div className="lg:col-span-5 flex justify-center relative">
                <div className="absolute -inset-2 bg-red-400/20 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-500 pointer-events-none" />
                
                <div className="relative bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/15 shadow-lg max-w-sm w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono tracking-widest text-red-200/80 font-black uppercase">COMMUNITY GRID</span>
                    <span className="flex items-center gap-1 bg-red-500/30 px-2 py-0.5 border border-red-500/20 rounded text-[8px] font-black tracking-wider uppercase">
                      <span className="w-1 bg-red-400 rounded-full animate-pulse" /> Live match
                    </span>
                  </div>

                  {/* Grid layout of blood groups */}
                  <div className="grid grid-cols-4 gap-2 select-none">
                    {[
                      { grp: 'A+', count: '14' },
                      { grp: 'B+', count: '22' },
                      { grp: 'O+', count: '41' },
                      { grp: 'AB+', count: '9' },
                      { grp: 'A-', count: '3' },
                      { grp: 'B-', count: '1' },
                      { grp: 'O-', count: '5' },
                      { grp: 'AB-', count: '0' }
                    ].map((group) => {
                      const hasDonors = parseInt(group.count) > 0;
                      return (
                        <div 
                          key={group.grp}
                          className={cn(
                            "aspect-square rounded-xl border flex flex-col items-center justify-center p-2 transition-all duration-350",
                            hasDonors 
                              ? "bg-white/10 hover:bg-white/15 border-white/15 hover:border-white/35 text-white scale-100 hover:scale-[1.03] shadow-xs"
                              : "bg-black/10 border-white/5 text-white/40 opacity-30 cursor-not-allowed"
                          )}
                        >
                          <Droplets size={13} className={cn("mb-0.5", hasDonors ? "text-red-300" : "text-white/20")} />
                          <span className="text-[10px] font-black tracking-tight block leading-none">{group.grp}</span>
                          <span className="text-[6.5px] font-mono font-bold text-red-150 block">{group.count} Active</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-red-950/20 border border-red-500/15 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={11} className="text-red-300" />
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-red-200">Ottapalam Registry</span>
                    </div>
                    <p className="text-[9px] text-red-100/90 leading-normal font-semibold">
                      Our platform automatically routes verified emergency alerts under absolute privacy rules.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* DOUBLE COLUMN FEATURE SECTION - Interactive diaries on left + Announcements feed on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Active Program Diaries (Left Column 60%) */}
          <section className="lg:col-span-7 space-y-8">
            <div className="border-b border-slate-200 pb-4 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Interactive Archives</span>
                <h3 className="text-2xl font-black text-slate-1000 uppercase tracking-tight">Active Program Diaries</h3>
              </div>
              <Link to="/gallery" className="text-brand-600 hover:text-brand-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 group select-none">
                <span>Browse Gallery</span>
                <ArrowRight size={13} className="stroke-[3px] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {highlights.length > 0 ? (
              (() => {
                const activeId = selectedHighlightId || highlights[0]?.id;
                const activeH = highlights.find(h => h.id === activeId) || highlights[0];
                return (
                  <div className="bg-white border border-slate-200/80 p-6 rounded-[2.5rem] space-y-6 shadow-md relative overflow-hidden">
                    
                    {/* Main highlight image frame */}
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeH.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.35 }}
                        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-100 shadow-sm group/img"
                      >
                        <img 
                          src={activeH.image} 
                          alt={activeH.event} 
                          className="w-full h-full object-cover transition-transform duration-[2s] group-hover/img:scale-102"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                        
                        {/* Venue pin */}
                        <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                          <MapPin size={11} className="text-indigo-400" />
                          <span>{activeH.venue}</span>
                        </div>

                        {/* Date badge */}
                        <div className="absolute bottom-4 right-4 bg-brand-600 text-white text-[9.5px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-md border border-brand-400/20">
                          {activeH.date}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Content text metadata */}
                    <div className="space-y-3">
                      <div className="flex">
                        <span className="bg-amber-100 border border-amber-200/50 text-amber-800 text-[8.5px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md">
                          ★ Verified Active Event
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-2xl font-black text-slate-950 uppercase tracking-tight">{activeH.event}</h4>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {activeH.description || "The National Service Scheme works alongside community welfare departments to develop student accountability, lead critical health camps, distribute drinking water, and restore local environments."}
                      </p>
                    </div>

                    {/* Selection carousel of cards on bottom */}
                    <div className="border-t border-slate-100 pt-5 space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.16em]">Select direct diary entry to inspect</p>
                      
                      <div className="flex gap-3 overflow-x-auto pb-2 select-none scrollbar-none snap-x">
                        {highlights.map((h) => (
                          <button
                            key={h.id}
                            onClick={() => setSelectedHighlightId(h.id)}
                            className={cn(
                              "text-left p-3 rounded-2xl border text-[10px] font-black uppercase transition-all duration-300 flex items-center gap-3 shrink-0 min-w-[210px] snap-center cursor-pointer",
                              h.id === activeId 
                                ? "bg-brand-600 border-brand-700 text-white shadow-lg scale-[0.98]" 
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
                              <span className="line-clamp-1 block">{h.event}</span>
                              <span className={cn("text-[8.5px] font-bold block", h.id === activeId ? "text-indigo-200" : "text-slate-400")}>
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
              <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem] text-sm text-slate-400 font-semibold italic">
                Active diaries logs are empty currently.
              </div>
            )}
          </section>

          {/* College Notice Bulletins (Direct Announcements 40%) */}
          <aside className="lg:col-span-5 space-y-8">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Direct Announcements</span>
              <h3 className="text-2xl font-black text-slate-1000 uppercase tracking-tight">College Notice Bulletins</h3>
            </div>

            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((ann, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    key={ann.id || idx} 
                    className="bg-white border border-slate-200 hover:border-brand-200 p-5 rounded-[2rem] transition-all duration-350 flex gap-4 group shadow-xs hover:shadow-md relative overflow-hidden"
                  >
                    <div className="w-1.5 h-1.5 bg-brand-600 rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform duration-300" />
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2.5">
                        <span className="text-[9px] font-mono font-black text-slate-400">{ann.date}</span>
                        <span className="bg-indigo-50 border border-indigo-100/55 text-indigo-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Official Notification</span>
                      </div>
                      <h4 className="font-extrabold text-[13px] text-slate-900 uppercase tracking-tight group-hover:text-brand-600 transition-colors leading-snug">
                        {ann.title}
                      </h4>
                      <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed line-clamp-3">
                        {ann.content}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-14 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem] text-xs text-slate-400 font-semibold italic">
                  No active circular announcements published yet.
                </div>
              )}

              <Link
                to="/announcements"
                className="w-full h-14 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition active:scale-95 shadow-xs cursor-pointer"
              >
                <Bell size={14} className="text-indigo-600" /> 
                <span>Open Digital Notice Cabinet</span>
              </Link>
            </div>
          </aside>

        </div>

        {/* Real leadership team sections */}
        <section className="space-y-8 relative">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-tr from-indigo-500/5 to-transparent -z-10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Institutional Pillar</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">Our Executive Team</h3>
            </div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
              NSS Ottapalam Officers Core
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "Dr. Rajesh R", 
                role: "PRINCIPAL / CHIEF PATRON",
                dept: "Patron & Head of Institution",
                image: "https://i.ibb.co/CKWMvrGV/1000144256.jpg",
                accent: "from-brand-600 to-indigo-800",
                shadow: "shadow-indigo-600/10"
              },
              { 
                name: "Dr. Aparna B", 
                role: "ASST. PROFESSOR ENGLISH / PO", 
                dept: "NSS Programme Officer (Unit 36)",
                image: "https://i.ibb.co/jkrny0qs/1000080292-2.jpg",
                accent: "from-blue-600 to-indigo-700",
                shadow: "shadow-blue-600/10"
              },
              { 
                name: "Dr. Rakhikrishna R", 
                role: "ASST. PROFESSOR PHYSICS / PO", 
                dept: "NSS Programme Officer (Unit 94)",
                image: "https://i.ibb.co/S7yYBqrK/1000080292.jpg",
                accent: "from-rose-650 to-red-700",
                shadow: "shadow-rose-600/10"
              }
            ].map((leader, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-2xl hover:border-brand-300 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[380px]"
              >
                {/* Accent stripe on top */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${leader.accent}`} />
                
                <div className="space-y-6">
                  {/* Portrait photo circular with silver background */}
                  <div className="relative mx-auto w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-slate-200/90 group-hover:scale-[1.03] transition-transform duration-500">
                    <img 
                      src={leader.image} 
                      alt={leader.name} 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-[8.5px] font-black text-brand-600 uppercase tracking-[0.2em] block">
                      {leader.role}
                    </span>
                    <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight leading-none pt-1">
                      {leader.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block pt-1">
                      {leader.dept}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">Verified Board Member</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Real Statistics Table Framework (No fake larping descriptions) */}
        <section className="bg-slate-950 text-white rounded-[2.8rem] p-8 sm:p-12 border border-slate-900 shadow-2xl overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] block">NSS Framework</span>
              <h4 className="text-lg font-black uppercase italic tracking-tight text-white">College Affiliation Metrics</h4>
              <p className="text-[11.5px] text-slate-400 font-semibold max-w-sm pt-1 leading-relaxed">
                Registered operational parameters archived securely in the State of Kerala NSS Registry.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:pl-10 text-center md:text-left space-y-1">
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white block">2 Units</span>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Unit 36 & Unit 94</p>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Independently Tracked</span>
            </div>

            <div className="pt-6 md:pt-0 md:pl-10 text-center md:text-left space-y-1">
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-emerald-400 block">110+</span>
              <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase block">Enrolled Active Students</p>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Calicut University Approved</span>
            </div>

            <div className="pt-6 md:pt-0 md:pl-10 text-center md:text-left space-y-1">
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-amber-400 block">Grade-A</span>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Accreditation status</p>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">State Service Excellence</span>
            </div>
          </div>
        </section>

        {/* FAQs & EXTERNAL PORTAL DIRECTORIES */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-4">
          
          {/* FAQs Handbooks */}
          <div className="md:col-span-8 space-y-8">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Frequently Inquired</span>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">nss handbook & guidelines</h3>
            </div>
            
            <div className="space-y-4">
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
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all duration-300">
                    <button
                      onClick={() => setFaqOpenIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left font-black uppercase text-[11px] tracking-tight text-slate-900 group cursor-pointer"
                    >
                      <span className="group-hover:text-brand-600 transition-colors leading-relaxed">{item.q}</span>
                      <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-300 shrink-0 ml-4", isOpen && "rotate-180 text-brand-600")} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 pt-0 text-[12px] text-slate-500 font-semibold leading-relaxed border-t border-slate-50">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Directories */}
          <div className="md:col-span-4 space-y-8">
            <div>
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">External Directory</span>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Official Portals</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <a 
                href="https://nsscollegeottapalam.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-5 bg-indigo-50 border border-indigo-200/80 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase text-indigo-700 tracking-wider hover:bg-indigo-100/50 hover:border-indigo-300 hover:translate-x-1.5 transition-all duration-300 shadow-xs"
              >
                <span>NSS College Ottapalam Portal</span>
                <Globe size={14} className="text-indigo-650" />
              </a>
              <a 
                href="https://nss.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-5 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase text-slate-700 tracking-wider hover:translate-x-1.5 transition-all duration-300 shadow-xs"
              >
                <span>National NSS Portal Govt.</span>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
              <a 
                href="https://mybharat.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-5 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase text-slate-700 tracking-wider hover:translate-x-1.5 transition-all duration-300 shadow-xs"
              >
                <span>MyBharat Portal Ministry</span>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Modern Professional Footer */}
      <footer className="pt-24 pb-12 bg-slate-950 text-slate-400 border-t border-slate-900 mt-28 relative z-10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5 pb-10">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-14 h-14 bg-white p-1.5 rounded-2xl shadow-xl shrink-0">
                <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="NSS College Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-black text-sm uppercase tracking-wider leading-none">NSS College Ottapalam</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest pt-0.5">National Service Scheme | College Units 36 & 94</p>
                <p className="text-[9.5px] text-slate-600 font-semibold uppercase tracking-wider">Affiliated to Calicut University • NAAC Grade A Accredited</p>
              </div>
            </div>
            
            {/* Social widgets */}
            <div className="flex items-center gap-4">
              <a 
                href="https://maps.app.goo.gl/CdwcxL8c6xBKExyP7?g_st=ac" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg cursor-pointer animate-pulse-subtle"
                title="Locate NSS Office on Google Maps"
              >
                <MapPin size={18} />
              </a>
              <a 
                href="https://www.instagram.com/nss_nsscotp?igsh=eDRsODA4MTFobzYy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
                title="Official Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://chat.whatsapp.com/Brz2cw30s1VCwJjAsot8rg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
                title="Official WhatsApp Directory"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] text-center">
            <span>© 2026 NSS COLLEGE OTTAPALAM DIGITAL HUB. ALL PORTAL INTENTS CONSERVED.</span>
            <span className="text-slate-300">"Not Me But You"</span>
          </div>

        </div>
      </footer>
    </div>
  );
}
