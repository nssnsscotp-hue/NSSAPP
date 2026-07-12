import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Clock, ArrowUpRight, Bell, Sparkles } from 'lucide-react';

interface CountdownProps {
  active?: boolean;
  title?: string;
  targetDate?: string;
  description?: string;
  location?: string;
  eventLink?: string;
}

export default function HomeCountdown({
  active = false,
  title = '',
  targetDate = '',
  description = '',
  location = '',
  eventLink = ''
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    if (!active || !targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 65), // limit maximum safely
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [active, targetDate]);

  if (!active || !targetDate) return null;

  // Render nice date strings
  const formattedDate = (() => {
    try {
      return new Date(targetDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return targetDate;
    }
  })();

  const timeBlocks = [
    { label: 'days', value: timeLeft.days },
    { label: 'hours', value: timeLeft.hours },
    { label: 'minutes', value: timeLeft.minutes },
    { label: 'seconds', value: timeLeft.seconds }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full border border-indigo-950/10 dark:border-slate-800 rounded-[2.2rem] bg-indigo-950 text-white shadow-2xl overflow-hidden select-none"
    >
      {/* Background visual flares */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      
      {/* Wave effect filter line decorations */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500 opacity-80" />

      <div className="p-6 sm:p-10 flex flex-col lg:flex-row items-center gap-8 justify-between relative z-10">
        
        {/* Info Column */}
        <div className="flex-1 space-y-4 text-center lg:text-left min-w-0 w-full">
          <div className="flex items-center justify-center lg:justify-start gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-orange-400 border border-white/5">
              <Sparkles size={10} />
              NSS Scheduled Directive
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight uppercase font-sans">
              {title || "Upcoming NSS Activity"}
            </h3>
            {description && (
              <p className="text-slate-300 text-xs sm:text-sm font-semibold max-w-2xl leading-relaxed text-pretty">
                {description}
              </p>
            )}
          </div>

          {/* Icon Meta Elements */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-[11px] font-bold text-slate-350 tracking-wide pt-1">
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-orange-400 shrink-0" />
                <span className="uppercase text-slate-100">{location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-emerald-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Timer Blocks & Action Column */}
        <div className="shrink-0 flex flex-col items-center gap-6 w-full lg:w-auto">
          
          <AnimatePresence mode="popLayout">
            {timeLeft.isOver ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-6 py-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-center"
              >
                <div className="text-emerald-400 font-extrabold text-sm uppercase tracking-widest flex items-center gap-2 justify-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  NSS Activity In Progress / Live
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4 justify-center">
                {timeBlocks.map((block) => (
                  <div key={block.label} className="flex flex-col items-center">
                    {/* Digit Card */}
                    <div className="w-14 h-14 sm:w-18 sm:h-18 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden">
                      <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                        {String(block.value).padStart(2, '0')}
                      </span>
                      {/* Sub-card light reflection */}
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-white/2 pointer-events-none" />
                    </div>
                    {/* Label */}
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mt-2">
                      {block.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Direct Event registration/link button */}
          {eventLink && (
            <a
              href={eventLink}
              target="_blank"
              rel="noopener referrer"
              className="h-11 px-5 w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
            >
              <span>Access Event Resource</span>
              <ArrowUpRight size={13} className="stroke-[3px]" />
            </a>
          )}
        </div>

      </div>
    </motion.div>
  );
}
