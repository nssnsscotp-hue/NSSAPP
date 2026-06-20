import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Shield, Command, Radio, Settings, AlertCircle, X, Check } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';

// Helper function to play a beautiful discrete notification beep using Web Audio API (no external file needed)
function playHumbleBeep() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Clean dual-chime sequence
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.38);
  } catch (e) {
    console.warn("Audio Context beep ignored by browser autoplay security policies.", e);
  }
}

export default function AppNotificationListener() {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState<{ id: string; title: string; content: string } | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
      // If they haven't explicitly blocked or accepted, and haven't hidden the prompt, show our beautiful action bar
      if (Notification.permission === 'default' && !localStorage.getItem('nss_notif_banner_dismissed')) {
        setShowPermissionBanner(true);
      }
    }
  }, []);

  // Set up SQL listen on announcements table
  useEffect(() => {
    console.log("Initializing Real-time App Notification receiver...");
    
    const channel = supabase
      .channel('app-announcements-broadcast')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log("New broadcast announcement push received! ", payload);
          const newRecord = payload.new;
          if (!newRecord) return;

          const title = newRecord.title || 'Urgent Update';
          const content = newRecord.content || newRecord.message || '';
          const alertId = (newRecord.id || Math.random().toString()).toString();

          // 1. Play sound
          playHumbleBeep();

          // 2. Trigger in-app overlay block
          setIncomingAlert({
            id: alertId,
            title,
            content
          });

          // 3. Increment unread counters
          const unreads = parseInt(localStorage.getItem('nss_unread_notif_count') || '0', 10);
          localStorage.setItem('nss_unread_notif_count', (unreads + 1).toString());
          window.dispatchEvent(new Event('nss_notifications_updated'));

          // 4. Trigger Web API OS level alert if permission is allowed
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(title, {
                body: content,
                icon: 'https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png',
                tag: alertId
              });
            } catch (err) {
              console.warn("Failed to dispatch device push notification:", err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Request standard native notifications permission securely
  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert("This device's browser does not support native notification panels.");
      setShowPermissionBanner(false);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      setShowPermissionBanner(false);
      localStorage.setItem('nss_notif_banner_dismissed', 'true');
      
      if (permission === 'granted') {
        playHumbleBeep();
        new Notification("Notifications Enabled Successfully!", {
          body: "You will now receive instant push announcements from college admin units 36 & 94 on your device panel.",
          icon: 'https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png'
        });
      }
    } catch (err) {
      console.error("Error requesting permission state: ", err);
    }
  };

  const dismissBanner = () => {
    setShowPermissionBanner(false);
    localStorage.setItem('nss_notif_banner_dismissed', 'true');
  };

  return (
    <>
      {/* 1. DISCRETE OPT-IN FLOATING NOTIFICATION BANNER */}
      <AnimatePresence>
        {showPermissionBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[9999] bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-755/50 font-sans"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Bell size={22} className="animate-bounce" />
              </div>
              <div className="space-y-1 pr-4">
                <h4 className="font-bold text-sm tracking-tight">Stay Live Updated!</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enable device notification alerts so you never miss urgent camper roll calls, emergency SOS bulletins, or campus alerts.
                </p>
              </div>
              <button 
                onClick={dismissBanner}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleRequestPermission}
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition duration-200 active:scale-95"
              >
                Allow Notifications
              </button>
              <button
                onClick={dismissBanner}
                className="px-4 h-10 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition duration-200"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. REAL-TIME ACTIVE IN-APP TOAST NOTIFICATION OVERLAY */}
      <AnimatePresence>
        {incomingAlert && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[28rem] z-[11000] bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-blue-100 shadow-[0_20px_50px_rgba(30,41,59,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-brand-500" />
            <div className="p-6 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div className="space-y-1 pr-6 flex-1 text-left min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[8.5px] font-black uppercase tracking-wider mb-2 border border-rose-100/55">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                  <span>New Broadcast Alert</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                  {incomingAlert.title}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 font-medium whitespace-pre-wrap">
                  {incomingAlert.content}
                </p>
              </div>
              <button 
                onClick={() => setIncomingAlert(null)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Dismiss Alert Toast"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Shield size={10} /> Verified Admin Broadcast
              </span>
              <button
                onClick={() => {
                  setIncomingAlert(null);
                  // Redirect or dismiss action
                }}
                className="px-4 py-2 bg-slate-950 text-white hover:bg-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition duration-200 active:scale-95"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
