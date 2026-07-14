import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogOut, LogIn, Home, Bell, User, ShieldAlert, Heart, MessageSquare, Image, HelpCircle, Trophy, Contact, BarChart3, Library, GraduationCap, Calendar, Info, Sun, Moon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';
  const [unreadCount, setUnreadCount] = useState(0);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nss_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nss_theme', theme);
    window.dispatchEvent(new Event('nss_theme_updated'));
  }, [theme]);

  useEffect(() => {
    const updateCount = () => {
      const count = parseInt(localStorage.getItem('nss_unread_notif_count') || '0', 10);
      setUnreadCount(count);
    };

    updateCount();
    window.addEventListener('nss_notifications_updated', updateCount);
    return () => {
      window.removeEventListener('nss_notifications_updated', updateCount);
    };
  }, []);

  // Set count to 0 when user opens/views announcements page
  useEffect(() => {
    if (location.pathname === '/announcements') {
      localStorage.setItem('nss_unread_notif_count', '0');
      window.dispatchEvent(new Event('nss_notifications_updated'));
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      console.log('Logout initiated...');
      // 1. Sign out from Supabase if possible
      await supabase.auth.signOut().catch(() => {});
      
      // 2. Clear all auth data
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.clear();
      
      console.log('Storage cleared, redirecting...');
      
      // 3. Force redirect using multiple methods to be sure
      navigate('/login');
      window.location.hash = '/login';
      window.location.reload(); 
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      window.location.href = '/#/login';
      window.location.reload();
    }
  };

  const allNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About NSS', href: '/about', icon: Info },
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Metrics', href: '/performance', icon: BarChart3 },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Safety Status', href: '/home-arrival', icon: Home },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Quiz Hub', href: '/quiz', icon: HelpCircle },
    { name: 'My ID', href: '/id-card', icon: Contact },
    { name: 'Announcements', href: '/announcements', icon: Bell },
    { name: 'Resources', href: '/resources', icon: Library },
    { name: 'Gallery', href: '/gallery', icon: Image },
    { name: 'Alumni', href: '/alumni', icon: GraduationCap },
    { name: 'Blood Bank', href: '/bloodbank', icon: Heart },
    { name: 'SOS', href: '/sos', icon: ShieldAlert },
    { name: 'Sentinel Shield', href: '/drug-report', icon: ShieldAlert },
    { name: 'Emergency Hub', href: '/emergency', icon: ShieldAlert },
    { name: 'Complaints', href: '/complaints', icon: MessageSquare },
    { name: 'User Guide', href: '/help', icon: HelpCircle },
  ];

  const publicNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About NSS', href: '/about', icon: Info },
    { name: 'Announcements', href: '/announcements', icon: Bell },
    { name: 'Emergency Hub', href: '/emergency', icon: ShieldAlert },
    { name: 'Sentinel Shield', href: '/drug-report', icon: ShieldAlert },
    { name: 'User Guide', href: '/help', icon: HelpCircle },
    { name: 'Gallery', href: '/gallery', icon: Image },
  ];

  let navItems = [...publicNavItems];

  if (isLoggedIn) {
    if (role === 'principal') {
      navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'About NSS', href: '/about', icon: Info },
        { name: 'Principal Panel', href: '/principal', icon: GraduationCap },
        { name: 'Emergency Hub', href: '/emergency', icon: ShieldAlert },
        { name: 'Sentinel Shield', href: '/drug-report', icon: ShieldAlert },
        { name: 'Announcements', href: '/announcements', icon: Bell },
        { name: 'User Guide', href: '/help', icon: HelpCircle },
        { name: 'Gallery', href: '/gallery', icon: Image },
        { name: 'Alumni', href: '/alumni', icon: GraduationCap },
      ];
    } else if (role === 'hod') {
      navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'About NSS', href: '/about', icon: Info },
        { name: 'HOD Panel', href: '/hod', icon: GraduationCap },
        { name: 'Emergency Hub', href: '/emergency', icon: ShieldAlert },
        { name: 'Sentinel Shield', href: '/drug-report', icon: ShieldAlert },
        { name: 'Announcements', href: '/announcements', icon: Bell },
        { name: 'User Guide', href: '/help', icon: HelpCircle },
        { name: 'Gallery', href: '/gallery', icon: Image },
      ];
    } else if (role === 'admin') {
      navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'About NSS', href: '/about', icon: Info },
        { name: 'Admin Panel', href: '/admin', icon: User },
        { name: 'Emergency Hub', href: '/emergency', icon: ShieldAlert },
        { name: 'Sentinel Shield', href: '/drug-report', icon: ShieldAlert },
        { name: 'Announcements', href: '/announcements', icon: Bell },
        { name: 'User Guide', href: '/help', icon: HelpCircle },
        { name: 'Gallery', href: '/gallery', icon: Image },
      ];
    } else {
      navItems = [...allNavItems];
    }
  }

  return (
    <nav className="sticky top-0 z-[100] px-4 py-4 md:px-8 md:py-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass shadow-2xl shadow-slate-200/40 rounded-[2rem] px-4 md:px-8 h-20 md:h-24 flex items-center justify-between border border-white/50">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 sm:gap-4 group">
              <div className="flex items-center -space-x-3.5 sm:-space-x-4 transition-transform group-hover:scale-105 duration-500">
                <div 
                  className="w-10 h-10 sm:w-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-850 p-1 md:p-1.5 z-20"
                  style={{
                    backgroundColor: theme === 'dark' ? '#020617' : '#ffffff'
                  }}
                >
                  <img 
                    src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" 
                    alt="College Logo" 
                    className="w-full h-full object-contain" 
                    style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="w-10 h-10 sm:w-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-md border border-slate-100 p-1 md:p-1.5 z-10">
                  <img src="https://i.postimg.cc/Xq7KPnqK/pngkey-com-allu-arjun-png-2479287.png" alt="NSS Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              </div>
              <div className="flex flex-col justify-center items-start text-left select-none">
                <h1 className="text-[10px] min-[360px]:text-xs sm:text-base md:text-xl lg:text-2xl font-black tracking-tighter leading-none italic uppercase text-slate-900 transition-all">
                  NSS <span className="text-brand-600">COLLEGE</span> <span className="text-slate-500/80">OTTAPALAM</span>
                </h1>
                <p className="text-slate-400 text-[6px] sm:text-[9px] font-black uppercase tracking-[0.05em] sm:tracking-[0.25em] md:tracking-[0.35em] mt-0.5 sm:mt-1 opacity-60">
                  NSS UNITS 36 & 94
                </p>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <motion.div key={item.name} whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={item.href}
                    className={cn(
                      "px-4 py-2.5 rounded-2xl transition-all duration-350 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest",
                      location.pathname === item.href 
                        ? "bg-brand-600 text-white shadow-xl shadow-brand-500/30" 
                        : "text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                    )}
                  >
                    <item.icon size={16} />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="w-px h-8 bg-slate-200 mx-2" />
              
              {/* Pulsing Alert Notification Bell */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                <Link
                  to="/announcements"
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-md relative",
                    location.pathname === '/announcements'
                      ? "bg-brand-50 text-brand-600 border-brand-200"
                      : "bg-slate-100/90 text-slate-700 border-slate-200/40 hover:bg-slate-200 hover:text-brand-600/90"
                  )}
                  title="App Notifications"
                >
                  <Bell size={18} className={cn(unreadCount > 0 && "animate-bounce text-red-500")} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-650 text-white rounded-full flex items-center justify-center text-[9px] font-black tracking-tighter shadow-lg shadow-red-500/30 border border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </motion.div>

              <div className="w-px h-8 bg-slate-200 mx-1" />

              {/* High-Contrast Theme Switcher */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-md relative",
                  theme === 'dark'
                    ? "bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700"
                    : "bg-slate-100/90 text-slate-700 border-slate-200/40 hover:bg-slate-200 hover:text-brand-600/90"
                )}
                title={theme === 'dark' ? "Switch to Light Theme" : "Switch to High-Contrast Theme"}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <div className="w-px h-8 bg-slate-200 mx-1" />

              {isLoggedIn ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-12 h-12 rounded-2xl bg-slate-100/90 text-slate-700 hover:text-white hover:bg-red-650 flex items-center justify-center transition-all duration-300 shadow-md border border-slate-200/40"
                  title="Logout"
                >
                  <LogOut size={18} className="pointer-events-none" />
                </motion.button>
              ) : (
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="px-6 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-brand-500/20 font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
                  >
                    <LogIn size={14} />
                    <span>Portal Login</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="md:hidden mt-2"
          >
            <div className="glass rounded-[2.5rem] p-3 shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[calc(100vh-10rem)]">
              <div className="overflow-y-auto p-1 space-y-1.5 custom-scrollbar">
                 {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                      location.pathname === item.href 
                        ? "bg-brand-600 text-white shadow-xl shadow-brand-500/20" 
                        : "text-slate-600 hover:bg-brand-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={18} />
                      {item.name}
                    </div>
                    {item.name === 'Announcements' && unreadCount > 0 && (
                      <span className="px-2.5 py-1 bg-red-650 text-white text-[9px] font-black tracking-widest rounded-full animate-pulse shadow-sm shadow-red-500/45 shrink-0">
                        {unreadCount} NEW
                      </span>
                    )}
                  </Link>
                ))}
              </div>
               <div className="p-1 mt-1 border-t border-slate-100/50 space-y-1">
                {/* Mobile Theme Toggle Button */}
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-500" />}
                    <span>Theme: {theme === 'dark' ? 'High-Contrast' : 'Light'}</span>
                  </div>
                  <span className="text-[9px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full font-black tracking-widest">
                    TOGGLE
                  </span>
                </button>

                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} className="pointer-events-none" />
                    Logout Account
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <LogIn size={18} />
                    Portal Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
