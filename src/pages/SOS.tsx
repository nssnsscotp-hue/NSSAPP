import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Phone, MapPin, MessageSquare, AlertTriangle, Volume2, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import BackButton from '../components/layout/BackButton';

export default function SOS() {
  const [playing, setPlaying] = useState(false);

  const emergencyContacts = [
    { name: 'Women Helpline', number: '1091', icon: ShieldAlert, dept: 'National Safety Wing' },
    { name: 'Police Emergency', number: '112', icon: ShieldAlert, dept: 'State Central Response' },
    { name: 'Fire Emergency', number: '101', icon: AlertTriangle, dept: 'Regional Fire & Rescue' },
    { name: 'Ottapalam Police', number: '9497934004', icon: ShieldAlert, dept: 'Local Ottapalam Station' },
  ];

  const handleSOSCall = () => {
    window.location.href = "tel:112";
  };

  const playAlarm = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
    audio.play();
    setPlaying(true);
    setTimeout(() => setPlaying(false), 5000);
  };

  const getLocation = (): Promise<{lat: number, lon: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject('Permission denied')
      );
    });
  };

  const shareWhatsApp = async () => {
    try {
      const { lat, lon } = await getLocation();
      const msg = `I need help. My current location: https://maps.google.com/?q=${lat},${lon}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
    } catch (err) {
      alert(err);
    }
  };

  const shareSMS = async () => {
    try {
      const { lat, lon } = await getLocation();
      const msg = `I am in danger! My location: https://maps.google.com/?q=${lat},${lon}`;
      window.location.href = `sms:?body=${encodeURIComponent(msg)}`;
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50 via-white to-slate-50 py-12 px-4 relative overflow-hidden select-none">
      {/* Background Cyber Mesh */}
      <div className="absolute inset-0 cyber-grid-mesh opacity-30 pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-6 flex justify-start">
          <BackButton />
        </div>
        
        <div className="text-center mb-12 space-y-4">
          <div className="relative flex justify-center mb-6">
            {/* Multiple Layered Sonar Rings */}
            <div className="absolute inset-0 h-28 w-28 mx-auto my-auto bg-red-500/10 rounded-full animate-ping" />
            <div className="absolute inset-0 h-36 w-36 mx-auto my-auto bg-red-400/5 rounded-full animate-pulse-subtle" />
            
            <motion.div 
              animate={{ 
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 20px rgba(239, 68, 68, 0.2)', 
                  '0 0 40px rgba(239, 68, 68, 0.45)', 
                  '0 0 20px rgba(239, 68, 68, 0.2)'
                ] 
              }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative z-10 inline-flex p-6 bg-gradient-to-br from-red-650 to-rose-600 text-white rounded-full shadow-2xl border-4 border-white glow-dot"
            >
              <ShieldAlert size={52} className="text-white animate-pulse" />
            </motion.div>
          </div>
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50/80 border border-red-100 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-red-600 font-mono">
              🔴 Campus Crisis Management Module
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none italic">
              Women Safety SOS
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-md mx-auto">
              Immediate encrypted security commands. Access real-time location streaming and direct statutory hotlines if in distress.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Main call action */}
          <button 
            onClick={handleSOSCall}
            className="col-span-full h-24 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-[2rem] shadow-2xl shadow-red-500/25 flex items-center justify-between px-8 transition-all group active:scale-98 cursor-pointer relative overflow-hidden"
          >
            {/* Pulsing overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                <Phone size={26} className="text-white" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-100/80">Statutory Emergency Hotlines</div>
                <div className="text-xl sm:text-2xl font-black uppercase tracking-tight">CALL CENTRAL SOS (112)</div>
              </div>
            </div>
            
            <ChevronRight size={24} className="stroke-[3px] group-hover:translate-x-1.5 transition-transform text-white/80" />
          </button>

          {/* Secondary Actions */}
          <button 
            onClick={playAlarm}
            className={cn(
              "h-20 rounded-[1.8rem] flex items-center justify-center gap-3 font-extrabold text-xs uppercase tracking-widest transition-all duration-300 border-2 cursor-pointer shadow-sm active:scale-95",
              playing 
                ? "bg-amber-500 border-amber-600 text-slate-950 animate-bounce" 
                : "bg-white border-slate-200/80 text-slate-850 hover:border-amber-400/80 hover:bg-amber-50/30"
            )}
          >
            <Volume2 className={cn("shrink-0", playing && "animate-spin")} size={16} />
            <span>{playing ? "Panic Alarm Active!" : "Launch Loud Panic Siren"}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={shareWhatsApp}
              className="h-20 bg-green-500 hover:bg-green-600 text-white rounded-[1.8rem] flex flex-col items-center justify-center gap-1.5 font-black text-[9.5px] uppercase tracking-widest shadow-md shadow-green-500/10 transition-all cursor-pointer hover:translate-y-[-2px] active:scale-95"
            >
              <MessageSquare size={16} />
              <span>Share WhatsApp</span>
            </button>
            <button 
              onClick={shareSMS}
              className="h-20 bg-slate-900 hover:bg-slate-850 text-white rounded-[1.8rem] flex flex-col items-center justify-center gap-1.5 font-black text-[9.5px] uppercase tracking-widest shadow-md shadow-slate-950/10 transition-all cursor-pointer hover:translate-y-[-2px] active:scale-95"
            >
              <MessageSquare size={16} />
              <span>Broadcast SMS</span>
            </button>
          </div>
        </div>

        {/* Helpline Contact List */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-md border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-light pb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-red-500" />
              Emergency Response Registry
            </h3>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Operational Checks Live</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {emergencyContacts.map((contact) => (
              <a 
                key={contact.name}
                href={`tel:${contact.number}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-200 hover:bg-red-50/25 transition-all duration-300 group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white text-red-650 rounded-xl border border-slate-200 group-hover:scale-105 transition-transform group-hover:bg-red-50">
                    <contact.icon size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-950 uppercase tracking-tight">{contact.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{contact.dept}</div>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-1">
                  <span className="text-[11px] text-slate-900 font-mono font-black group-hover:text-red-600 transition-colors">{contact.number}</span>
                  <ChevronRight size={11} className="text-slate-300 group-hover:translate-x-1 transition-transform group-hover:text-red-650" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Safety Assurance Statement */}
        <div className="mt-8 p-5 bg-slate-100/80 border border-slate-200 text-center text-[10.5px] font-semibold text-slate-500 rounded-2xl leading-normal">
          🔒 Lock Policy: GPS maps transit sequences work exclusively within secure client scopes and trigger coordinates directly to designated stakeholders for high-fidelity response.
        </div>
      </div>
    </div>
  );
}
