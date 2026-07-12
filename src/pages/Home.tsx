import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Calendar, User, Heart, MessageSquare, Trophy, School, MapPin, 
  Loader2, BarChart3, Library, GraduationCap, Star, Flame, ArrowRight, 
  Instagram, MessageCircle, ExternalLink, HelpCircle, ChevronDown, 
  HeartHandshake, ChevronRight, ShieldCheck, Award, Info, BookOpen,
  Sparkles, Check, CheckCircle2, Globe, ArrowUpRight, Smartphone, Monitor,
  Droplets, Activity, Image as ImageIcon, ChevronLeft, Phone
} from 'lucide-react';
import { Highlight } from '@/src/pages/types';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebaseClient';
import HomeCountdown from '../components/HomeCountdown';

export default function Home() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [mobileFeedTab, setMobileFeedTab] = useState<'diaries' | 'notices'>('diaries');
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nss_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme((localStorage.getItem('nss_theme') as 'light' | 'dark') || 'light');
    };
    window.addEventListener('nss_theme_updated', handleThemeChange);
    handleThemeChange();
    return () => window.removeEventListener('nss_theme_updated', handleThemeChange);
  }, []);
  
  // Custom states for admin activity gallery widget
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Real-time custom state for dynamic website customization config
  const [webConfig, setWebConfig] = useState<any>(() => {
    const cached = localStorage.getItem('website_config_settings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn("Could not parse cached website settings.");
      }
    }
    return {
      principal: {
        name: "Dr. Rajesh R",
        role: "PRINCIPAL / CHIEF PATRON",
        dept: "Patron & Head of Institution",
        image: "https://i.ibb.co/CKWMvrGV/1000144256.jpg"
      },
      po36: {
        name: "Dr. Aparna B",
        role: "ASST. PROFESSOR ENGLISH / PO",
        dept: "NSS Programme Officer (Unit 36)",
        image: "https://i.ibb.co/jkrny0qs/1000080292-2.jpg"
      },
      po94: {
        name: "Dr. Rakhikrishna R",
        role: "ASST. PROFESSOR PHYSICS / PO",
        dept: "NSS Programme Officer (Unit 94)",
        image: "https://i.ibb.co/S7yYBqrK/1000080292.jpg"
      },
      heroTitle: "Not Me But You",
      heroSubText: "Official NSS Digital Portal",
      heroDesc: "Developing the collective social responsibility of youth. Program Units 36 and 94 at NSS College Ottapalam foster community living, dynamic medical campaigns, instant emergency blood relief, environmental restoration, and civic literacy campaigns with stellar impact.",
      heroImage: "https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg",
      tickerText: "Welcome to NSS College Ottapalam NSS Portal. NSS Program Units 36 & 94 welcome all volunteers and dynamic change-makers! Join us in our journey of youth leadership, blood donations, environmental restorations, and community welfare.",
      collegeName: "NSS College, Ottapalam",
      unitsText: "Programme Units 36 & 94",
      countdownActive: false,
      countdownTitle: "Upcoming NSS Scheduled Camp Setup",
      countdownTarget: "2026-07-10T10:00:00",
      countdownDescription: "Preparations and distribution rosters for the upcoming 7-day special village adoption camp.",
      countdownLocation: "College Seminar Hall",
      countdownEventLink: ""
    };
  });

  const scrollLeftGallery = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRightGallery = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScrollLeft - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 350, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (isGalleryPaused) return;

    const interval = setInterval(() => {
      scrollRightGallery();
    }, 4000);

    return () => clearInterval(interval);
  }, [isGalleryPaused, galleryImages]);

  const fallbackGallery = [
    {
      src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop",
      caption: "NSS Mega Campus Cleaning & Green Drive",
      date: "04 Jun 2026",
      location: "Ottapalam Campus"
    },
    {
      src: "https://images.unsplash.com/photo-1615461066841-6116ecdccd04?q=80&w=800&auto=format&fit=crop",
      caption: "Emergency Medical & Blood Donation Camp",
      date: "28 May 2026",
      location: "Academic Hall"
    },
    {
      src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop",
      caption: "Interactive Literacy Outreach & Study Kits Supply",
      date: "15 May 2026",
      location: "Orphanage Annex"
    },
    {
      src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop",
      caption: "World Environment Day Tree Saplings Initiative",
      date: "05 Jun 2026",
      location: "Municipal Ground"
    },
    {
      src: "https://images.unsplash.com/photo-1469571486040-afbef0cd37bc?q=80&w=800&auto=format&fit=crop",
      caption: "NSS Special Village Survey & Digital Adoption Camp",
      date: "12 Apr 2026",
      location: "Ottapalam Village"
    }
  ];
  
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

        // 4. Live activity gallery is managed below via real-time Firestore onSnapshot listener
      } catch (err) {
        console.error('Home data load failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    const fetchBackupGalleryHome = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Home Supabase gallery read failed, trying local endpoint:', error.message);
          const res = await fetch('/api/public-gallery');
          if (res.ok) {
            const resData = await res.json();
            if (resData.success && resData.list && resData.list.length > 0) {
              setGalleryImages(resData.list.map((item: any) => ({
                id: item.id || item.url,
                src: item.url,
                caption: item.title || 'NSS Activity',
                date: item.date || 'Recent Activity',
                location: item.category || 'Ottapalam Campus',
                rawDate: item.created_at || ''
              })).slice(0, 12));
              return;
            }
          }
          setGalleryImages(fallbackGallery);
          return;
        }
        
        if (data && data.length > 0) {
          setGalleryImages(data.map((x: any) => ({ 
            id: x.id, 
            src: x.url, 
            caption: x.title || 'NSS Activity', 
            date: x.date || 'Recent Activity', 
            location: x.category || 'Ottapalam Campus',
            rawDate: x.created_at || ''
          })).slice(0, 12));
        } else {
          const res = await fetch('/api/public-gallery').catch(() => null);
          if (res && res.ok) {
            const resData = await res.json().catch(() => null);
            if (resData && resData.success && resData.list && resData.list.length > 0) {
              setGalleryImages(resData.list.map((item: any) => ({
                id: item.id || item.url,
                src: item.url,
                caption: item.title || 'NSS Activity',
                date: item.date || 'Recent Activity',
                location: item.category || 'Ottapalam Campus',
                rawDate: item.created_at || ''
              })).slice(0, 12));
              return;
            }
          }
          setGalleryImages(fallbackGallery);
        }
      } catch (err) {
        console.error('Home backup gallery fetch failed:', err);
        setGalleryImages(fallbackGallery);
      }
    };

    // Subscribe to realtime gallery updates (Firestore onSnapshot) across all environments including GitHub Pages
    const galleryQuery = query(collection(db, 'gallery'), orderBy('created_at', 'desc'));
    const unsubscribeGallery = onSnapshot(galleryQuery, (snapshot) => {
      const liveList: any[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        if (item.url) {
          liveList.push({
            id: docSnap.id,
            src: item.url,
            caption: item.title || 'NSS Activity',
            date: item.date || 'Recent Activity',
            location: item.category || 'Ottapalam Campus',
            rawDate: item.created_at || ''
          });
        }
      });

      if (liveList.length === 0) {
        fetchBackupGalleryHome();
      } else {
        // Limit to 12 items for home feed performance page layout
        setGalleryImages(liveList.slice(0, 12));
      }
    }, (error) => {
      console.warn("Firestore gallery subscription failed, using backup fetcher:", error);
      fetchBackupGalleryHome();
    });

    // Subscribe to realtime updates
    const channel = supabase
      .channel('blood_updates_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_emergency_requests' }, () => {
        fetchHomeData();
      })
      .subscribe();

    // Keep website configuration in real-time sync with graceful fallbacks
    let unsubscribeConfig = () => {};
    try {
      const configDocRef = doc(db, 'website_config', 'settings');
      unsubscribeConfig = onSnapshot(configDocRef, (snap) => {
        if (snap.exists()) {
          const val = snap.data();
          const loaded = {
            principal: {
              name: val.principal?.name || "Dr. Rajesh R",
              role: val.principal?.role || "PRINCIPAL / CHIEF PATRON",
              dept: val.principal?.dept || "Patron & Head of Institution",
              image: val.principal?.image || "https://i.ibb.co/CKWMvrGV/1000144256.jpg"
            },
            po36: {
              name: val.po36?.name || "Dr. Aparna B",
              role: val.po36?.role || "ASST. PROFESSOR ENGLISH / PO",
              dept: val.po36?.dept || "NSS Programme Officer (Unit 36)",
              image: val.po36?.image || "https://i.ibb.co/jkrny0qs/1000080292-2.jpg"
            },
            po94: {
              name: val.po94?.name || "Dr. Rakhikrishna R",
              role: val.po94?.role || "ASST. PROFESSOR PHYSICS / PO",
              dept: val.po94?.dept || "NSS Programme Officer (Unit 94)",
              image: val.po94?.image || "https://i.ibb.co/S7yYBqrK/1000080292.jpg"
            },
            heroTitle: val.heroTitle || "Not Me But You",
            heroSubText: val.heroSubText || "Official NSS Digital Portal",
            heroDesc: val.heroDesc || "Developing the collective social responsibility of youth. Program Units 36 and 94 at NSS College Ottapalam foster community living, dynamic medical campaigns, instant emergency blood relief, environmental restoration, and civic literacy campaigns with stellar impact.",
            heroImage: val.heroImage || "https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg",
            tickerText: val.tickerText || "Welcome to NSS College Ottapalam NSS Portal. NSS Program Units 36 & 94 welcome all volunteers and dynamic change-makers! Join us in our journey of youth leadership, blood donations, environmental restorations, and community welfare.",
            collegeName: val.collegeName || "NSS College, Ottapalam",
            unitsText: val.unitsText || "Programme Units 36 & 94",
            countdownActive: val.countdownActive !== undefined ? val.countdownActive : false,
            countdownTitle: val.countdownTitle || "",
            countdownTarget: val.countdownTarget || "",
            countdownDescription: val.countdownDescription || "",
            countdownLocation: val.countdownLocation || "",
            countdownEventLink: val.countdownEventLink || ""
          };
          setWebConfig(loaded);
          localStorage.setItem('website_config_settings', JSON.stringify(loaded));
        }
      }, (error) => {
        console.warn("Website settings config subscription bypassed, using highly-cached localStorage sync:", error);
      });
    } catch (e: any) {
      console.warn("Realtime listener initializer warning:", e.message);
    }

    // Direct listener for local custom actions within pages
    const handleLocalUpdate = () => {
      const cached = localStorage.getItem('website_config_settings');
      if (cached) {
        try {
          setWebConfig(JSON.parse(cached));
        } catch (e) {
          // ignore
        }
      }
    };
    window.addEventListener('website-settings-updated', handleLocalUpdate);

    return () => {
      supabase.removeChannel(channel);
      unsubscribeGallery();
      unsubscribeConfig();
      window.removeEventListener('website-settings-updated', handleLocalUpdate);
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
    { 
      title: 'Sentinel Shield', 
      href: '/drug-report', 
      icon: ShieldCheck, 
      color: 'from-amber-400/10 to-red-500/10 text-amber-500 border-amber-450/40 hover:bg-amber-500/5 hover:border-amber-400 hover:text-amber-500', 
      glow: 'rgba(245, 158, 11, 0.12)',
      desc: 'Report Narcotic/Abuse Cases' 
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
          backgroundImage: `url('${webConfig.heroImage || 'https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg'}')`,
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
                style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}
                referrerPolicy="no-referrer" 
              />
            </div>
            
            {/* Center Box: Unified Stacked Info Aligned Exactly as Requested */}
            <div className="flex-1 text-center space-y-1 sm:space-y-1.5 min-w-0">
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400/90 rounded text-[8px] font-bold uppercase tracking-[0.2em] shadow-sm">
                🏛️ Government Aided Institution • ESTD. 1964
              </span>
              <h1 className="text-base sm:text-3.5xl md:text-4.5xl lg:text-5.5xl font-black tracking-tight text-white uppercase leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {webConfig.collegeName}
              </h1>
              <h2 className="text-xs sm:text-2xl md:text-3xl lg:text-3.5xl font-extrabold text-slate-100 tracking-wide uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                National Service Scheme
              </h2>
              <p className="text-[10px] sm:text-sm md:text-base font-black text-amber-400 tracking-widest uppercase leading-none">
                {webConfig.unitsText}
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
                  <span>{webConfig.tickerText}</span>
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 space-y-20 relative">
        <AnimatePresence mode="wait">
          {webConfig.countdownActive && (
            <HomeCountdown
              active={webConfig.countdownActive}
              title={webConfig.countdownTitle}
              targetDate={webConfig.countdownTarget}
              description={webConfig.countdownDescription}
              location={webConfig.countdownLocation}
              eventLink={webConfig.countdownEventLink}
            />
          )}
        </AnimatePresence>

        {/* SVG DEF FOR FLUID HIGH-FIDELITY INDIAN FLAG WAVE FILTER */}
        <svg className="absolute w-0 h-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="indian-flag-wave" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.024" numOctaves="2" result="noise">
                <animate attributeName="baseFrequency" values="0.012 0.024; 0.02 0.038; 0.012 0.024" dur="7s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        
        {/* EXQUISITE VISUAL DECORATIONS: MORPHING BLOB FLARES & ANIMATED MESH */}
        <div className="absolute top-[10vh] left-[5vw] w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-[8s]" />
        <div className="absolute top-[50vh] right-[5vw] w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-[10s]" />
        <div className="absolute top-[90vh] left-[10vw] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-[140vh] right-[10vw] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-bounce duration-[15s]" />

        {/* HERO SECTION WITH DYNAMIC GRADIENTS & ENTER ANIMATIONS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            <div className="space-y-4 relative group/hero overflow-visible">
              {/* STUNNING INDIAN FLAG FLYING BACKGROUND VECTOR WITH BEAUTIFUL VISIBILITY & WAVE DISTORTION */}
              <div 
                className="absolute -left-3 sm:-left-6 top-[-35px] sm:top-[-50px] w-[320px] sm:w-[560px] h-[170px] sm:h-[300px] opacity-[0.14] pointer-events-none -z-10 select-none overflow-visible transition-all duration-500 group-hover/hero:opacity-[0.22] group-hover/hero:scale-[1.02]"
                style={{ filter: "url(#indian-flag-wave)" }}
              >
                <svg viewBox="0 0 320 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                  <defs>
                    {/* Flagpole metallic gradients */}
                    <linearGradient id="poleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="30%" stopColor="#94a3b8" />
                      <stop offset="50%" stopColor="#f1f5f9" />
                      <stop offset="70%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                    
                    <linearGradient id="goldFinial" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="40%" stopColor="#eab308" />
                      <stop offset="80%" stopColor="#ca8a04" />
                      <stop offset="100%" stopColor="#854d0e" />
                    </linearGradient>

                    {/* Saffron Gradient for realistic fabric sheen */}
                    <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFAD5A" />
                      <stop offset="50%" stopColor="#FF9933" />
                      <stop offset="100%" stopColor="#D8740D" />
                    </linearGradient>

                    {/* White Gradient for realistic fabric sheen */}
                    <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="60%" stopColor="#F8FAFC" />
                      <stop offset="100%" stopColor="#E2E8F0" />
                    </linearGradient>

                    {/* Green Gradient for realistic fabric sheen */}
                    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#19A60B" />
                      <stop offset="50%" stopColor="#128807" />
                      <stop offset="100%" stopColor="#0B5D04" />
                    </linearGradient>

                    {/* Shading/Ripples Overlay to simulate 3D fabric folds */}
                    <linearGradient id="fabricShading" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
                      <stop offset="15%" stopColor="#ffffff" stopOpacity="0.1" />
                      <stop offset="30%" stopColor="#000000" stopOpacity="0.25" />
                      <stop offset="45%" stopColor="#ffffff" stopOpacity="0.15" />
                      <stop offset="60%" stopColor="#000000" stopOpacity="0.2" />
                      <stop offset="75%" stopColor="#ffffff" stopOpacity="0.1" />
                      <stop offset="90%" stopColor="#000000" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
                    </linearGradient>

                    {/* Real shadow filter */}
                    <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
                      <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.22" />
                    </filter>
                  </defs>

                  {/* Golden elegant rope loops on flagpole */}
                  <path d="M 10 32 Q 5 60 10 90 Q 7 120 10 160" fill="none" stroke="#eab308" strokeWidth="1.2" opacity="0.6" strokeDasharray="3,1" />

                  {/* Real flagpole with heavy silver gradients and shiny capital */}
                  <line x1="12" y1="12" x2="12" y2="210" stroke="url(#poleGrad)" strokeWidth="6.5" strokeLinecap="round" />
                  
                  {/* Elegant base stand for pole */}
                  <path d="M 4 206 L 20 206 L 16 212 L 8 212 Z" fill="url(#poleGrad)" opacity="0.9" />

                  {/* Golden spherical finial */}
                  <circle cx="12" cy="11" r="6" fill="url(#goldFinial)" />
                  <circle cx="10" cy="9" r="2.5" fill="#ffffff" opacity="0.5" />

                  {/* Flag group attached to pole */}
                  <g transform="translate(15, 20)" filter="url(#softShadow)">
                    <g>
                      {/* Saffron stripe with custom border-radius & subtle texture */}
                      <rect x="0" y="0" width="265" height="42" fill="url(#saffronGrad)" rx="1.5" />
                      
                      {/* White stripe */}
                      <rect x="0" y="42" width="265" height="42" fill="url(#whiteGrad)" />
                      
                      {/* Green stripe with custom border-radius & subtle texture */}
                      <rect x="0" y="84" width="265" height="42" fill="url(#greenGrad)" rx="1.5" />
                      
                      {/* 3D folds Shading Overlay */}
                      <rect x="0" y="0" width="265" height="126" fill="url(#fabricShading)" style={{ mixBlendMode: 'multiply' }} rx="1.5" pointerEvents="none" />

                      {/* Flag border / outline for realistic fabric edge thickness */}
                      <rect x="0" y="0" width="265" height="126" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.1" rx="1.5" />

                      {/* Highly elegant, fine Navy Ashoka Chakra */}
                      <g transform="translate(132.5, 63)">
                        <circle cx="0" cy="0" r="17" fill="none" stroke="#000080" strokeWidth="1.8" />
                        <circle cx="0" cy="0" r="3" fill="#000080" />
                        {/* Draw 24 Spokes */}
                        {Array.from({ length: 24 }).map((_, spokeIdx) => {
                          const angle = (spokeIdx * 360) / 24;
                          return (
                            <line 
                              key={spokeIdx}
                              x1="0" 
                              y1="0" 
                              x2={17 * Math.cos((angle * Math.PI) / 180)} 
                              y2={17 * Math.sin((angle * Math.PI) / 180)} 
                              stroke="#000080" 
                              strokeWidth="0.8" 
                            />
                          );
                        })}
                        {/* Draw 24 tiny dots between outer edge of spokes */}
                        {Array.from({ length: 24 }).map((_, dotIdx) => {
                          const angle = (dotIdx * 360) / 24 + 7.5;
                          return (
                            <circle 
                              key={dotIdx}
                              cx={15.5 * Math.cos((angle * Math.PI) / 180)}
                              cy={15.5 * Math.sin((angle * Math.PI) / 180)}
                              r="0.6"
                              fill="#000080"
                            />
                          );
                        })}
                      </g>
                    </g>
                  </g>
                </svg>
              </div>

              {/* CLEAN, ELEGANT HERO BADGE */}
              <motion.div 
                variants={textRevealVariants}
                className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200/60 px-4 py-1.5 rounded-2xl select-none"
              >
                <Sparkles className="text-brand-650 w-3.5 h-3.5 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-700">{webConfig.heroSubText}</span>
              </motion.div>

              <motion.h1 
                variants={textRevealVariants}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[0.95] uppercase relative z-10"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-650 via-indigo-600 to-indigo-800 animate-gradient-shift">
                  {webConfig.heroTitle}
                </span>
              </motion.h1>
              
              <motion.p 
                variants={textRevealVariants}
                className="text-slate-650 text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold text-pretty"
              >
                {webConfig.heroDesc}
              </motion.p>
            </div>

            {/* CTA action buttons */}
            <motion.div 
              variants={textRevealVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              {isLoggedIn ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-3xl border border-slate-200 w-full sm:w-auto shadow-sm">
                    <div className="px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs w-full sm:w-auto">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                      <span>Active: <strong className="text-brand-300">{username}</strong> ({userRole})</span>
                    </div>
                    <Link 
                      to="/profile"
                      className="w-full sm:w-auto h-11 px-6 text-xs text-indigo-600 hover:text-indigo-850 font-black uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View Profile Room</span>
                      <ChevronRight size={14} className="stroke-[3px]" />
                    </Link>
                  </div>
                  <Link 
                    to="/drug-report"
                    className="w-full sm:w-auto h-14 px-6 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-550 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 cursor-pointer shadow-md"
                  >
                    <ShieldCheck size={14} />
                    <span>Report Drug Abuse</span>
                  </Link>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-white hover:to-white hover:text-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 hover:translate-y-[-2px] border border-transparent hover:border-indigo-600 cursor-pointer"
                  >
                    <span>Secure Portal Sign-In</span>
                    <ArrowRight size={14} className="stroke-[3px]" />
                  </Link>
                  <Link 
                    to="/drug-report"
                    className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-red-650 to-amber-600 hover:from-red-550 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 cursor-pointer shadow-md"
                  >
                    <ShieldCheck size={15} />
                    <span>Report Drug Abuse</span>
                  </Link>
                  <Link 
                    to="/help"
                    className="w-full sm:w-auto h-14 px-8 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 font-extrabold text-xs uppercase tracking-widest rounded-2xl transition flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <HelpCircle size={15} className="text-slate-500" />
                    <span>NSS Guidelines</span>
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
                <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono tracking-tight block">100+</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">Enrolled Volunteers</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight block">U.O.C</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">University of Calicut</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Image Module */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-5 relative group"
          >
            <div className="absolute -inset-3 bg-gradient-to-r from-brand-650 to-purple-600 rounded-[2.5rem] blur-2xl opacity-15 group-hover:opacity-25 transition duration-1000" />
            
            <div className="relative bg-white p-3 rounded-[2.8rem] border border-slate-200/60 shadow-2xl hover:scale-[1.01] transition-all duration-500">
              <div className="relative aspect-[4/3] w-full rounded-[2.2rem] overflow-hidden bg-slate-900">
                <img 
                  src="https://i.ibb.co/3yvNCYQ6/sl-1-1.jpg" 
                  alt="NSS College Ottapalam Main Campus Panoramic" 
                  className="w-full h-full object-cover transition-transform duration-[1.8s] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                {/* Embedded live status indicator */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl text-white flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest">Campus Operations Live</span>
                </div>
              </div>

              {/* Float Glassmorphic Badge */}
              <div className="absolute -bottom-4 -left-4 bg-slate-950/95 backdrop-blur-xl border border-white/10 text-white p-5 rounded-3xl shadow-xl max-w-[260px] space-y-1 select-none pointer-events-none transform transition-transform duration-500 group-hover:translate-y-[-4px]">
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
                        Welcome back, <strong>Principal Administration</strong>. Under University of Calicut statutes, you have absolute operational oversight of NSS Units 36 and 94. Implement global parameters, verify certified rosters, deploy official campus circular directives, and access verified complaint reports.
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
        <section id="amrit-blood-bank-card" className="relative select-none">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-red-650 via-rose-500 to-red-700 text-white rounded-3xl p-5 sm:p-7 shadow-lg overflow-hidden group"
          >
            {/* Design Gradients and dynamic typography watermark */}
            <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-tr from-white/10 to-transparent -z-10 translate-x-[20%] -translate-y-[20%] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-1/2 -left-1/4 w-[400px] h-[400px] bg-red-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-4 right-4 text-white/5 font-display text-[4rem] sm:text-[6rem] font-black select-none pointer-events-none uppercase tracking-tighter leading-none">
              AMRIT
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
              
              {/* Left Side: Spotlight info */}
              <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[8.5px] font-black uppercase tracking-[0.15em] mx-auto lg:mx-0">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-white">🔴 AMRIT CLINICAL COOPERATIVE INITIATIVE</span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight italic">
                    Amrit Blood Bank: <span className="text-red-100 font-extrabold not-italic text-sm sm:text-base tracking-normal capitalize">Secure Emergency Donor Pool</span>
                  </h2>
                  <p className="text-red-50 text-[11px] leading-relaxed font-semibold max-w-2xl mx-auto lg:mx-0">
                    A secure, student-coordinated safety matrix organized by Units 36 and 94 to match local emergencies, protecting verified donor profiles under statutory standards.
                  </p>
                </div>

                {/* Horizontal pillars/badges list to reduce vertical length */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-0.5">
                  <div className="px-2.5 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-1.5 text-[9px] font-bold">
                    <ShieldCheck size={12} className="text-red-200" />
                    <span>Credential Shielding</span>
                  </div>
                  <div className="px-2.5 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-1.5 text-[9px] font-bold">
                    <Activity size={12} className="text-red-200" />
                    <span>Immediate Alerts</span>
                  </div>
                  <div className="px-2.5 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-1.5 text-[9px] font-bold">
                    <Award size={12} className="text-red-200" />
                    <span>NSS Points Approved</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Action CTA & Status with elegant minimalist layout instead of bulky grid */}
              <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-end gap-3.5 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
                <div className="text-center lg:text-right space-y-0.5">
                  <span className="text-[10px] font-mono tracking-widest text-red-200/80 font-black uppercase">OTTAPALAM REGISTRY</span>
                  <div className="text-xl font-black font-mono tracking-tight text-white leading-none">100+ ACTIVE DONORS</div>
                  <p className="text-[8.5px] text-red-100 font-semibold uppercase tracking-wider">Verified clinical response units</p>
                </div>

                <div className="flex flex-row items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    to="/bloodbank"
                    className="flex-1 sm:flex-initial h-10 px-4 bg-white text-red-650 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest rounded-lg transition duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:translate-y-[-1px] active:scale-[0.98] cursor-pointer"
                  >
                    <Heart size={11} className="fill-current text-red-600 animate-pulse" />
                    <span>Register</span>
                  </Link>
                  <Link
                    to="/bloodbank"
                    className="flex-1 sm:flex-initial h-10 px-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-lg transition duration-200 flex items-center justify-center gap-1.5 hover:translate-y-[-1px] active:scale-[0.98] cursor-pointer"
                  >
                    <Droplets size={11} className="text-white" />
                    <span>Request Board</span>
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* HIGH-FIDELITY DRUG-FREE CAMPUS / SENTINEL SHIELD GENERAL HOMEPAGE SECTION */}
        <section id="drug-sentinel-shield-section" className="relative select-none">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2.5rem] p-8 md:p-10 border border-amber-500/15 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden shadow-2xl"
          >
            {/* Visual glowing blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-60 h-60 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  🔴 DRUG-FREE SENTINEL SHIELD LINE
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-white">
                    Substance & Abuse Prevention Sentinel
                  </h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Protecting NSS College campus together. Report suspected drug activity, possession, or general abuse cases completely anonymously. Our direct Red-Line Sentinel encrypts your details with <strong>zero IP records</strong> or credentials required.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto justify-end shrink-0">
                <Link
                  to="/drug-report"
                  className="h-13 px-6 bg-gradient-to-r from-red-650 to-amber-500 hover:from-red-550 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] btn-tactile cursor-pointer animate-pulse-subtle"
                >
                  <ShieldCheck size={16} />
                  <span>Report Anonymously</span>
                </Link>
                
                <a
                  href="tel:14408"
                  className="h-13 px-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 btn-tactile cursor-pointer"
                >
                  <Phone size={14} className="text-amber-500" />
                  <span>Counseling Hotline</span>
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* PUBLIC SAFETY AND CIVIL EMERGENCY DIRECTORY HUB HERO SPOTLIGHT */}
        <section id="public-safety-emergency-hub-section" className="relative select-none">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2.5rem] p-8 md:p-10 border border-red-500/15 bg-gradient-to-br from-rose-950 via-slate-900 to-zinc-950 text-white overflow-hidden shadow-2xl"
          >
            {/* Visual glowing elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span>🚨 CENTRAL EMERGENCY & WELFARE SYSTEMS</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white leading-none">
                    Public Emergency & Safety Hub
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                    Connecting 112, 101, and all critical statutory helplines. Browse cyber crime coordination guides, women safety act factsheets, mental health counseling circles, or taluk government official rosters. Accessible publicly for collective community welfare.
                  </p>
                </div>

                {/* Micro helpline indicators */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2 text-[10px] font-bold text-slate-350">
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
                    <strong>112</strong> Central SOS
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
                    <strong>1091</strong> Women Line
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
                    <strong>1930</strong> Cyber Cell
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
                    <strong>14416</strong> Tele-MANAS
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto justify-end shrink-0">
                <Link
                  to="/emergency"
                  className="h-13 px-8 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-550 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] btn-tactile cursor-pointer animate-pulse-subtle shadow-red-500/10"
                >
                  <HeartHandshake size={16} />
                  <span>Launch Public safety Hub</span>
                </Link>
                
                <Link
                  to="/sos"
                  className="h-13 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 btn-tactile cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-red-500 animate-pulse" />
                  <span>SOS Response Panel</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* LIVE ACTIVITY SNAPSHOT GALLERY CAROUSEL */}
        <section className="space-y-6 relative select-none">
          <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">Visual Activity Stream</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">Active Program Gallery</h3>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              {/* Browse full gallery link */}
              <Link 
                to="/gallery" 
                className="text-xs font-black uppercase tracking-wider text-brand-600 hover:text-indigo-650 transition-colors flex items-center gap-1.5 group py-2"
              >
                <span>Launch Full Grid</span>
                <ArrowRight size={13} className="stroke-[3.5px] group-hover:translate-x-1.5 transition-transform duration-350" />
              </Link>
              
              {/* Manual scrolling micro controllers */}
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={scrollLeftGallery}
                  className="w-10 h-10 rounded-full border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-900 transition flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft size={16} className="stroke-[2.5]" />
                </button>
                <button 
                  onClick={scrollRightGallery}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-900 transition flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                  aria-label="Scroll Right"
                >
                  <ChevronRight size={16} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrolling Deck */}
          <div className="relative group/deck">
            <div 
              ref={scrollContainerRef}
              onMouseEnter={() => setIsGalleryPaused(true)}
              onMouseLeave={() => setIsGalleryPaused(false)}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory pointer-events-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {(galleryImages.length > 0 ? galleryImages : fallbackGallery).map((pic, idx) => (
                <div 
                  key={idx}
                  className="w-[290px] sm:w-[350px] shrink-0 bg-white border border-slate-200 hover:border-brand-200 transition-all duration-350 snap-start flex flex-col justify-between group/card relative rounded-[2rem] p-4 shadow-sm hover:shadow-md"
                >
                  {/* Aspect video img wrap */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-100 shadow-xs mb-4">
                    <img 
                      src={pic.src || pic.url} 
                      alt={pic.caption || pic.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-108"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark overlay protective layer inside the glass box */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                    {/* Category overlay label */}
                    {pic.location && (
                      <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/10">
                        {pic.location}
                      </span>
                    )}

                    {/* Date label overlay */}
                    {pic.date && (
                      <span className="absolute bottom-3 right-3 bg-brand-650 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                        {pic.date}
                      </span>
                    )}

                    {/* View overlay icon */}
                    <div className="absolute inset-0 bg-brand-700/10 backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link 
                        to="/gallery" 
                        className="p-3 bg-white rounded-full text-brand-650 shadow-md transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300"
                        title="View Full Size Image"
                      >
                        <ImageIcon size={16} />
                      </Link>
                    </div>
                  </div>

                  {/* Caption & Location metadata info */}
                  <div className="space-y-1.5 px-1.5 pb-1">
                    <h4 className="text-[12.5px] font-black text-slate-950 uppercase tracking-tight line-clamp-1 group-hover/card:text-brand-650 transition-colors">
                      {pic.caption || pic.title}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed line-clamp-2">
                      Organized and published directly by the Admin Officers core to demonstrate verified social stewardship.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint overlay for scrolling */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-full bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none group-hover/deck:opacity-0 transition-opacity" />
          </div>
        </section>

        {/* MOBILE FEED TAB CONTROL: Best-in-law mobile touch interaction for responsive clarity */}
        <div className="lg:hidden flex p-1.5 bg-slate-100 rounded-2xl border border-slate-250/60 select-none">
          <button
            onClick={() => setMobileFeedTab('diaries')}
            className={cn(
              "flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-[14px] transition-all duration-300 flex items-center justify-center gap-2",
              mobileFeedTab === 'diaries'
                ? "bg-white text-brand-650 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <BookOpen size={13} className={mobileFeedTab === 'diaries' ? "text-brand-650" : "text-slate-400"} />
            <span>Program Diaries</span>
          </button>
          <button
            onClick={() => setMobileFeedTab('notices')}
            className={cn(
              "flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-[14px] transition-all duration-300 flex items-center justify-center gap-2",
              mobileFeedTab === 'notices'
                ? "bg-white text-brand-650 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Bell size={13} className={mobileFeedTab === 'notices' ? "text-brand-650 animate-bounce" : "text-slate-400"} />
            <span>Notice Bulletins</span>
          </button>
        </div>

        {/* DOUBLE COLUMN FEATURE SECTION - Interactive diaries on left + Announcements feed on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-4 lg:mt-0">
          
          {/* Active Program Diaries (Left Column 60%) */}
          <section className={cn("lg:col-span-7 space-y-8", mobileFeedTab === 'diaries' ? 'block' : 'hidden lg:block')}>
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
          <aside className={cn("lg:col-span-5 space-y-8", mobileFeedTab === 'notices' ? 'block' : 'hidden lg:block')}>
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
                name: webConfig.principal.name, 
                role: webConfig.principal.role,
                dept: webConfig.principal.dept,
                image: webConfig.principal.image,
                accent: "from-brand-600 to-indigo-800",
                shadow: "shadow-indigo-600/10"
              },
              { 
                name: webConfig.po36.name, 
                role: webConfig.po36.role, 
                dept: webConfig.po36.dept,
                image: webConfig.po36.image,
                accent: "from-blue-600 to-indigo-700",
                shadow: "shadow-blue-600/10"
              },
              { 
                name: webConfig.po94.name, 
                role: webConfig.po94.role, 
                dept: webConfig.po94.dept,
                image: webConfig.po94.image,
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
                className={cn(
                  "group bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full min-h-[410px] md:min-h-[420px]",
                  i === 0 ? "hover:border-amber-400" : i === 1 ? "hover:border-indigo-400" : "hover:border-rose-400"
                )}
              >
                {/* Accent stripe on top */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${leader.accent}`} />
                
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  {/* Portrait photo circular with custom color-coded ring matching their NSS station */}
                  <div className={cn(
                    "relative mx-auto w-36 h-36 rounded-full border-4 border-white shadow-xl shadow-slate-200/90 group-hover:scale-[1.04] transition-transform duration-500 ring-4 ring-offset-2 overflow-hidden",
                    i === 0 ? "ring-amber-500/80" : i === 1 ? "ring-indigo-600/80" : "ring-rose-600/80"
                  )}>
                    <img 
                      src={leader.image} 
                      alt={leader.name} 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="text-center space-y-1.5">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-0.5 rounded-md inline-block leading-none",
                      i === 0 ? "text-amber-700 bg-amber-50" : i === 1 ? "text-indigo-700 bg-indigo-50" : "text-rose-700 bg-rose-50"
                    )}>
                      {leader.role}
                    </span>
                    <h4 className="font-black text-xl text-slate-950 uppercase tracking-tight leading-tight pt-1">
                      {leader.name}
                    </h4>
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest block pt-0.5 leading-normal">
                      {leader.dept}
                    </span>
                  </div>
                </div>


              </motion.div>
            ))}
          </div>
        </section>

        {/* Real Statistics Table Framework (No fake larping descriptions) */}
        <section className="bg-slate-950 text-white rounded-[2.8rem] p-8 sm:p-12 border border-slate-900 shadow-2xl overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
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
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-emerald-400 block">100+</span>
              <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase block">Enrolled Active Students</p>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">University of Calicut Approved</span>
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
                  a: "NSS College Ottapalam's Unit 36 and Unit 94 are affiliated under the University of Calicut NSS Cell. They operate strictly matching the guidelines issued by the Ministry of Youth Affairs & Sports, India." 
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
                <img 
                  src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" 
                  alt="NSS College Logo" 
                  className="w-full h-full object-contain" 
                  style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-black text-sm uppercase tracking-wider leading-none">NSS College Ottapalam</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest pt-0.5">National Service Scheme | College Units 36 & 94</p>
                <p className="text-[9.5px] text-slate-600 font-semibold uppercase tracking-wider">Affiliated to University of Calicut • NAAC Grade A Accredited</p>
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
