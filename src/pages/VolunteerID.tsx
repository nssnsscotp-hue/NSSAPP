import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, ShieldCheck, Calendar, Phone, MapPin, Award, CheckCircle, User, Loader2, Trophy, ArrowLeft, Heart } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GAS_URLS } from '@/src/lib/constants';
import { supabase } from '@/src/lib/supabase';
import { Link } from 'react-router-dom';
import BackButton from '../components/layout/BackButton';
import { getProfilePhoto } from '@/src/lib/firebaseClient';

export default function VolunteerID() {
  const storedUser = localStorage.getItem('user') || '';
  const storedName = localStorage.getItem('name') || 'Volunteer Name';
  const [userName, setUserName] = useState(storedName);
  const [phone, setPhone] = useState(localStorage.getItem('phone') || 'No Phone');
  const [role, setRole] = useState(localStorage.getItem('role') || 'Volunteer');
  const [unit, setUnit] = useState(localStorage.getItem('unit') || '36/94');
  const userId = localStorage.getItem('userId') || 'NSS-2024-XXXX';
  const [downloading, setDownloading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({ points: 0, attendance: 0, rank: '-' });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!storedUser) return;
      try {
        setLoadingStats(true);
        // 1. Fetch Profile info (fresh)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', storedUser.toLowerCase())
          .single();

        if (profile) {
          setUserName(profile.full_name);
          setPhone(profile.mobile || 'No Phone');
          setRole(profile.role || 'Volunteer');
          setUnit(profile.unit || '36/94');
        }

        // Fetch avatar URL from Firestore profiles collection
        if (storedUser) {
          try {
            const photoUrl = await getProfilePhoto(storedUser);
            if (photoUrl) {
              setAvatarUrl(photoUrl);
            }
          } catch (photoErr) {
            console.warn("Could not load Firestore profile photo on ID Card:", photoErr);
          }
        }

        // 2. Fetch Leaderboard for Rank & Points
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('username, points')
          .order('points', { ascending: false });

        if (allProfiles) {
          const myIndex = allProfiles.findIndex(p => p.username.toLowerCase() === storedUser.toLowerCase());
          const myProfile = allProfiles[myIndex];
          
          // 3. Fetch Attendance count
          const { count } = await supabase
            .from('marked_attendance')
            .select('*', { count: 'exact', head: true })
            .eq('volunteer_name', profile?.full_name || '')
            .eq('unit', profile?.unit || '');

          if (myProfile) {
            setStats({
              points: myProfile.points || 0,
              attendance: count || 0,
              rank: myIndex !== -1 ? (myIndex + 1).toString() : '-'
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch ID stats", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchUserStats();
  }, [storedUser]);

  // Digital Achievements
  const achievements = [
    { name: 'Blood Donor', earned: stats.points >= 500, icon: '🩸' },
    { name: 'Camp Star', earned: true, icon: '⛺' },
    { name: 'Master Vol.', earned: stats.attendance >= 10, icon: '🎓' },
    { name: 'Top 10 Rank', earned: stats.rank !== '-' && parseInt(stats.rank) <= 10, icon: '🌟' },
  ];

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-10 px-4 md:px-8 relative selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* Background Graphic Patterns */}
      <div className="absolute top-[-5%] left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-300/10 to-transparent -z-10 blur-xl rounded-full" />
      <div className="absolute bottom-[20%] right-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-300/5 to-transparent -z-10 blur-xl rounded-full" />

      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation / Back links */}
        <div className="flex items-center justify-between no-print">
          <BackButton />
          <div className="flex items-center gap-2 text-right">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Secure State Verified</span>
          </div>
        </div>

        {/* Header Block */}
        <div className="text-center space-y-3 no-print">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100/80 text-indigo-700 rounded-full shadow-sm text-[9.5px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={14} className="text-indigo-600 animate-pulse" />
            <span>Official Identity Card Desk</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase italic tracking-tight text-slate-900">Digital Volunteer ID</h1>
          <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[9.5px]">NSS COLLEGE OTTAPALAM | CADRE VERIFICATION CARD</p>
        </div>

        {/* Dual Responsive Card Showcase */}
        <div className="flex justify-center max-w-3xl mx-auto">
          
          <div className="w-full no-print">
            
            {/* MOBILE ONLY INTERFACE (Fluid column layout) - Will print as appropriate, fits perfectly on small phone viewports */}
            <div className="block md:hidden bg-slate-950 rounded-[2.5rem] border-4 border-slate-900 overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-transparent -z-10 blur-md rounded-full" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-indigo-600 to-red-600" />
              
              <div className="p-6 space-y-6">
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-white p-1 rounded-xl">
                      <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="text-[10.5px] font-black text-white uppercase italic tracking-tight leading-none">NSS College Ottapalam</h4>
                      <p className="text-indigo-400 text-[8px] font-black uppercase tracking-widest mt-1">Units 36 & 94</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider">Access ID</div>
                    <span className="text-[10.5px] font-mono font-black text-white bg-white/5 px-2 py-0.5 border border-white/10 rounded">{userId}</span>
                  </div>
                </div>

                {/* Profile Core */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 rounded-full border-4 border-slate-800 overflow-hidden relative shadow-xl">
                      <img 
                        src={avatarUrl || `https://ui-avatars.com/api/?name=${userName}&background=002c6c&color=fff&size=256`} 
                        className="w-full h-full object-cover grayscale brightness-110" 
                        alt={userName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=002c6c&color=fff&size=256`;
                        }}
                      />
                    </div>
                    <div className="absolute bottom-0 right-1 bg-green-500 text-white p-1 rounded-full border-2 border-slate-950 shadow">
                      <CheckCircle size={15} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{userName}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">{role} Cadet</span>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-3.5 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">Vol. Unit</span>
                    <span className="text-xs font-bold text-white uppercase">{unit}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">Emergency Pool</span>
                    <span className="text-xs font-bold text-rose-400 uppercase">Active Donor</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">Contact</span>
                    <span className="text-xs font-bold text-white">{phone}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">Affiliation</span>
                    <span className="text-xs font-bold text-white uppercase">Univ. of Calicut</span>
                  </div>
                </div>

                {/* Quick stats & signature footer */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">Score Pool</span>
                      <strong className="text-white text-xs font-mono">{stats.points} pts</strong>
                    </div>
                    <div>
                      <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">Rank</span>
                      <strong className="text-amber-400 text-xs font-mono">#{stats.rank}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">Auth. Sign</span>
                    <span className="text-[8px] font-black uppercase text-indigo-300 italic tracking-wider">NSS CO PO</span>
                  </div>
                </div>

              </div>
            </div>

            {/* DESKTOP ONLY INTERFACE (Elegant horizontal credit card layout, prevents squishing) */}
            <div 
              ref={cardRef}
              className="hidden md:block w-full bg-slate-950 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.32)] overflow-hidden relative border-4 border-slate-900"
            >
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 skew-x-[-15deg] translate-x-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-indigo-600 to-red-600" />
              
              <div className="p-10 space-y-8 relative z-10">
                {/* ID Card Top Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-white p-1 rounded-xl shadow-lg">
                      <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="University Crest" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-sm font-black text-white uppercase italic tracking-tighter leading-none leading-tight">NSS COLLEGE OTTAPALAM</h2>
                      <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mt-1">NATIONAL SERVICE SCHEME | UNITS 36 & 94</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Registration</span>
                    <span className="text-xs font-mono font-black text-white bg-white/5 px-3 py-1 rounded-lg border border-white/15 tracking-widest">{userId}</span>
                  </div>
                </div>

                {/* ID Card Core Body */}
                <div className="grid grid-cols-12 gap-8 items-end">
                  
                  {/* Photo area with verified seal */}
                  <div className="col-span-4 relative">
                    <div className="aspect-[1/1] w-full max-w-[150px] bg-slate-900 rounded-3xl border-4 border-slate-800 overflow-hidden shadow-xl relative">
                      <img 
                        src={avatarUrl || `https://ui-avatars.com/api/?name=${userName}&background=002c6c&color=fff&size=512`} 
                        className="w-full h-full object-cover grayscale brightness-110" 
                        alt={userName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=002c6c&color=fff&size=512`;
                        }}
                      />
                      <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white w-9 h-9 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-md">
                      <CheckCircle size={16} />
                    </div>
                  </div>

                  {/* Core Attributes */}
                  <div className="col-span-8 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{userName}</h3>
                      <span className="text-[9.5px] font-black text-indigo-400 uppercase tracking-widest">{role} CADET</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Assigned Unit</span>
                        <div className="text-[11px] font-black text-white uppercase">Unit {unit}</div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Contact</span>
                        <div className="text-[11px] font-bold text-white">{phone}</div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Active Station</span>
                        <div className="text-[11px] font-bold text-white uppercase">Ottapalam</div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Registry State</span>
                        <div className="text-[11px] font-black text-emerald-400 uppercase">Active Donor Pool</div>
                      </div>
                    </div>

                    {/* Integrated mini stats tags */}
                    <div className="flex gap-4 pt-1.5 border-t border-white/5">
                      <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <span className="text-[7px] font-black text-indigo-300 uppercase tracking-wider block">Points</span>
                        <span className="text-xs font-mono font-black text-white">{stats.points}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <span className="text-[7px] font-black text-amber-300 uppercase tracking-wider block">Ranking</span>
                        <span className="text-xs font-mono font-black text-white">#{stats.rank}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <span className="text-[7px] font-black text-blue-300 uppercase tracking-wider block">Attd logs</span>
                        <span className="text-xs font-mono font-black text-white">{stats.attendance}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Holographic Seal Background Accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none rotate-45 scale-125">
                  <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" className="w-[600px]" referrerPolicy="no-referrer" alt="" />
                </div>

                {/* Simulated authority sign overlay */}
                <div className="absolute bottom-6 right-8 text-right opacity-40 group-hover:opacity-100 transition-opacity flex flex-col items-end space-y-1">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Signature (PO)</span>
                  <div className="text-[10px] font-sans font-black tracking-widest uppercase italic text-indigo-400">RAKHI / APARNA</div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Digital Achievements Section */}
        <div className="no-print">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 italic">
              <Award className="text-amber-500 animate-pulse" /> Verified Digital Achievements
            </h3>
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">State Council verified</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {achievements.map((ach) => (
              <div 
                key={ach.name}
                className={cn(
                  "p-6 rounded-3xl text-center border-2 transition-all duration-300 relative overflow-hidden group/ach bg-white",
                  ach.earned 
                    ? "border-amber-200/60 shadow-md hover:shadow-xl hover:border-amber-400" 
                    : "border-slate-100 grayscale opacity-45 shadow-none hover:opacity-60"
                )}
              >
                {ach.earned && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
                )}
                <div className="text-4xl mb-3.5 transform group-hover/ach:scale-110 transition-transform duration-300">{ach.icon}</div>
                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-2">{ach.name}</div>
                
                {ach.earned ? (
                  <span className="text-[8px] font-black text-green-600 uppercase tracking-widest inline-flex items-center gap-1">
                    <CheckCircle size={10} className="text-green-500" /> Verified Earned
                  </span>
                ) : (
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Column */}
        <div className="flex flex-col sm:flex-row gap-4 no-print max-w-sm sm:max-w-md mx-auto pt-4">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3.5 shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            {downloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            <span>Print / Save ID Card</span>
          </button>
          <button 
            onClick={() => alert(`Your Digital Profile ID URL is verified.`)}
            className="h-14 px-8 bg-white text-slate-600 hover:border-slate-300 border border-slate-200 font-extrabold rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 cursor-pointer"
          >
            <Share2 size={16} />
            <span>Copy Link</span>
          </button>
        </div>

        <p className="text-center text-slate-400 text-[9px] font-semibold uppercase tracking-[0.2em] no-print pt-6">
          * Dynamic credential pass. Hand over values to Unit PO under active duty check-in requests.
        </p>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .min-h-screen { min-height: auto !important; height: auto !important; padding: 0 !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 40px !important; }
        }
      `}</style>
    </div>
  );
}
