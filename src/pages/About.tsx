import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Star, Award, History, Compass, Users, Heart, GraduationCap, 
  ChevronRight, Calendar, Landmark, MapPin, Feather, CheckCircle, Sparkles, Flag, Zap,
  Scroll, ShieldAlert, Award as Trophy, Compass as DirIcon
} from 'lucide-react';
import BackButton from '../components/layout/BackButton';

interface CollegeTimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: any;
}

interface NssTimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: any;
}

export default function About() {
  const [aboutMode, setAboutMode] = useState<'college' | 'nss'>('college');

  // Stats for the College
  const collegeStats = [
    { value: "1950", label: "Year Founded", desc: "NSS College Ottapalam", icon: Landmark },
    { value: "30+", label: "Acres Campus", desc: "Lush green serene eco-space", icon: MapPin },
    { value: "15+", label: "Departments", desc: "UG, PG & Research programs", icon: GraduationCap },
    { value: "A Grade", label: "NAAC Standard", desc: "Certified Academic Excellence", icon: Award }
  ];

  // Stats for the National Service Scheme
  const nssStats = [
    { value: "1969", label: "NSS Launched", desc: "Gandhi Centenary Year", icon: History },
    { value: "2 Units", label: "Active Wings", desc: "Unit 36 & Unit 94", icon: Users },
    { value: "200+", label: "Volunteers", desc: "Enrolled active leaders", icon: Heart },
    { value: "5000+", label: "Service Hours", desc: "Completed annually", icon: Sparkles }
  ];

  // Timeline events for the College
  const collegeTimeline: CollegeTimelineEvent[] = [
    {
      year: '1950',
      title: 'The Great Conception',
      description: 'NSS College Ottapalam was started by the Nair Service Society under the visionary leadership of Bharatha Kesari Mannathu Padmanabhan to cater to the higher educational needs of the Valluvanad area.',
      icon: Landmark
    },
    {
      year: '1970',
      title: 'Upgrade to Post Graduate Institution',
      description: 'The college raised its academic status by offering state-of-the-art postgraduate programs and expanding the multi-faculty science departments.',
      icon: GraduationCap
    },
    {
      year: '2000',
      title: 'Golden Jubilee Celebrations',
      description: 'Commemorated 50 years of outstanding educational and community service with new laboratory infrastructure, libraries, and seminar halls.',
      icon: Star
    },
    {
      year: '2023',
      title: 'NAAC Accreditation & Modernization',
      description: 'Awarded exemplary NAAC accreditation grades, proving absolute quality in learning, infrastructure, and extension activities.',
      icon: Award
    }
  ];

  // Timeline events for the NSS Units
  const nssTimeline: NssTimelineEvent[] = [
    {
      year: '1969',
      title: 'National Launch',
      description: 'The National Service Scheme was officially introduced in Indian universities on 24th September 1969, marking the Mahatma Gandhi centenary celebration.',
      icon: Flag
    },
    {
      year: '1970',
      title: 'Unit Registration at Ottapalam',
      description: 'NSS Units 36 & 94 were established inside the college campus to instil community leadership and humanitarian responsibilities inside student minds.',
      icon: Users
    },
    {
      year: '2018',
      title: 'Outstanding Flood Relief Services',
      description: 'During the historic Kerala floods, our units and program officers established crucial supply camps, relief coordination networks, and reconstruction hubs.',
      icon: Heart
    },
    {
      year: '2021',
      title: 'Best Village Adaptation Award',
      description: 'Earned accolades from Calicut University for systematic village development projects, including healthcare surveys and water sanitation drives.',
      icon: CheckedIcon
    },
    {
      year: '2026',
      title: 'Digital Volunteer Ecosystem',
      description: 'Launched a custom automated platform to coordinate real-time emergency blood requests, community camp details, and voluntary hour validation.',
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 animate-fade-in">
      
      {/* PROFESSIONAL IMMERSIVE HEADER */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 text-white py-16 sm:py-24 relative overflow-hidden shadow-2xl border-b border-indigo-950/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 flex justify-start relative z-10">
          <BackButton />
        </div>
        
        {/* Abstract background ambient flows */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute -bottom-20 left-10 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="inline-flex p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 mb-2 shadow-inner"
          >
            <Scroll size={32} className="text-orange-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase">
            {aboutMode === 'college' ? 'NSS College Ottapalam' : 'National Service Scheme'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {aboutMode === 'college' 
              ? 'Institutional history, heritage moments, and milestones of our glorious educational center since 1950.' 
              : 'Community service philosophy, active campus units 36 & 94, motto significance, and societal impact.'}
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase text-slate-200 border border-white/5">
              {aboutMode === 'college' ? 'ESTD 1950 • Ottapalam' : 'ESTD 1969 • Ministry of Youth affairs'}
            </span>
            <span className="px-3 py-1 bg-orange-500/20 rounded-full text-[9px] font-bold tracking-widest uppercase text-orange-400 border border-orange-500/20">
              {aboutMode === 'college' ? 'Academic Leadership' : 'Not Me But You'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* STRUCTURAL SEGREGATION MENU (TOP TAB SWITCHER) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-white rounded-3xl p-3 border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <button
            onClick={() => setAboutMode('college')}
            className={`w-full sm:w-1/2 py-4 px-6 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 outline-none ${
              aboutMode === 'college' 
                ? 'bg-slate-900 text-white shadow-xl scale-102 font-black' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={18} />
            <span>NSS College Ottapalam</span>
          </button>
          
          <button
            onClick={() => setAboutMode('nss')}
            className={`w-full sm:w-1/2 py-4 px-6 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 outline-none ${
              aboutMode === 'nss' 
                ? 'bg-orange-550 text-white shadow-xl scale-102 font-black' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass size={18} />
            <span>National Service Scheme (NSS)</span>
          </button>
        </div>

        {/* CONTENT RENDERER */}
        <AnimatePresence mode="wait">
          {aboutMode === 'college' ? (
            <motion.div
              key="college-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              {/* COLLEGE STATISTICS & PERFORMANCE metrics */}
              <section className="bg-white rounded-[2rem] border border-slate-150 p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-650" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-slate-100 divide-y sm:divide-y-0 lg:divide-x">
                  {collegeStats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center p-2 pt-6 sm:pt-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 border border-indigo-100">
                        <stat.icon size={20} />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-indigo-600 mt-1">{stat.label}</div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-tight">{stat.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* DETAILED COLLEGE HISTORICAL LEGACY */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                
                {/* Visual Tribute card for the founder */}
                <div className="lg:col-span-5 bg-slate-950 text-white rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between border border-slate-800">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
                  
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-orange-400 border border-white/5">
                      <Landmark size={24} />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-orange-400 block font-mono">Founding Visionary</span>
                    <h3 className="text-2xl font-black tracking-tight uppercase leading-tight">
                      Bharatha Kesari Mannathu Padmanabhan
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                      The legendary social reformer of Kerala and founder of the Nair Service Society. His tireless efforts in launching premium colleges and scientific schools opened up educational access for generations in agricultural and rural regions.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-800 mt-8 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase font-black text-[9px] tracking-wide">Nair Service Society founder</span>
                    <span className="text-orange-400 font-black">1878 - 1970</span>
                  </div>
                </div>

                {/* College Heritage Summary */}
                <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-10 shadow-sm flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100 w-fit">
                        <GraduationCap size={11} className="text-indigo-600" />
                        <span>University of Calicut affiliation</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Seventy-Five Years of Educational Excellence
                      </h3>
                    </div>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                      Established in 1950, NSS College Ottapalam is one of the premier, oldest, and most distinguished arts and science educational centers in Palakkad District, Kerala. Owned and systematically managed by Nair Service Society, the institution holds a pivotal spot in molding academic leaders, researchers, and professional cadres.
                    </p>

                    <div className="space-y-4 text-xs text-slate-500 font-medium">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0" />
                        <p><strong className="text-slate-800 uppercase tracking-wide text-[11px] block">Departments & Courses</strong> Currently hosts exceptional multi-faculty departments including Physics, Chemistry, Zoology, Mathematics, English, History, and Commerce holding research facilities.</p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0" />
                        <p><strong className="text-slate-800 uppercase tracking-wide text-[11px] block">Serene Riverbanks & Campus</strong> The 30-acre campus is situated in safe, green suburban Ottapalam, neighboring the iconic Nila River basin. It supplies a safe, quiet, energetic study biosphere.</p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0" />
                        <p><strong className="text-slate-800 uppercase tracking-wide text-[11px] block">Social Empowerment Focus</strong> Beyond academic curriculum, the college emphasizes social intelligence, regular legal literacy, physical sports excellence, and public service ideals.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <MapPin size={14} className="text-indigo-600" />
                      <span>Premises of Ottapalam Town, Palakkad</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <Award size={14} className="text-indigo-600" />
                      <span>Certified Quality NAAC Cycle</span>
                    </div>
                  </div>
                </div>

              </section>

              {/* CHRONOLOGY OF THE COLLEGE */}
              <section className="space-y-8 bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-10 shadow-sm">
                <div className="border-b border-slate-100 pb-5">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-600">The Path Transversed</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Milestones of NSS College Ottapalam</h2>
                  <p className="text-xs text-slate-500 mt-1">Tracing our history of academic scaling from establishment to the modern research institution.</p>
                </div>

                <div className="relative border-l-2 border-indigo-150 pl-6 sm:pl-8 space-y-8 max-w-4xl">
                  {collegeTimeline.map((evt, idx) => {
                    const EvtIcon = evt.icon;
                    return (
                      <div key={idx} className="relative space-y-1.5 group">
                        <span className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] bg-indigo-600 border-2 border-white shadow-md">
                          <EvtIcon size={11} />
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                            {evt.year}
                          </span>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Institutional Event</span>
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight block">
                          {evt.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="nss-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              {/* NSS STATISTICS & LOGISTICS */}
              <section className="bg-white rounded-[2rem] border border-slate-150 p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-600" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-slate-100 divide-y sm:divide-y-0 lg:divide-x">
                  {nssStats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center p-2 pt-6 sm:pt-2">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-3 border border-orange-100">
                        <stat.icon size={20} />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-orange-600 mt-1">{stat.label}</div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-tight">{stat.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* DETAILED NSS WING DESCRIPTION */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                
                {/* NSS philosophical core */}
                <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-10 shadow-sm flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-100 w-fit">
                        <Flag size={11} className="text-orange-600" />
                        <span>Motto: Not Me But You</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                        The Soul of NSS Units 36 & 94
                      </h3>
                    </div>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                      The National Service Scheme (NSS) at our college consists of two highly efficient, award-winning volunteer units (36 & 94) under the direct affiliation guidelines of the University of Calicut. The program is specifically structured to bridge the theoretical academic ecosystem of the student with realistic rural social contexts.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 space-y-2">
                        <h4 className="text-[11px] font-black text-orange-850 uppercase tracking-widest">Normal Extension Works</h4>
                        <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                          Engages in weekly blood donation matchmaking, literacy assistance sessions, legal rights classes, organic vegetable farming on campus, and healthcare camps.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                        <h4 className="text-[11px] font-black text-indigo-850 uppercase tracking-widest">Special Camping Drives</h4>
                        <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                          Annual 7-day residential village adoption camp. Activities include rural asset mapping, building clean river structures, and primary education setups.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <Users size={14} className="text-orange-600" />
                      <span>Supervised by Active Program Officers</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <Heart size={14} className="text-orange-600" />
                      <span>Dedicated Shramadan Workhours</span>
                    </div>
                  </div>
                </div>

                {/* NSS Emblem Meaning Card */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between border border-slate-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl" />
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-orange-400">Emblem Symbolic Meanings</h4>
                    <span className="text-lg font-black text-slate-200 block uppercase tracking-tight font-serif italic">"Cycle of Realism"</span>
                    
                    <div className="space-y-3.5 pt-2">
                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">1</span>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-slate-100 uppercase tracking-wider block">Konark Giant Wheel</span>
                          <p className="text-[10px] text-slate-400 leading-normal font-semibold">Our insignia is derived from Konark Sun Temple’s Wheel. It commands progress, motion, creation, and release across time.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">2</span>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-slate-100 uppercase tracking-wider block">Navy Cosmic Blue</span>
                          <p className="text-[10px] text-slate-400 leading-normal font-semibold">The navy blue represents the giant energetic cosmic universe of which NSS acts as a small, selfless, dedicated element.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">3</span>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-slate-100 uppercase tracking-wider block">Saffron Red Spokes</span>
                          <p className="text-[10px] text-slate-400 leading-normal font-semibold">Saffron red elements denote the warm, high-spirit, passionate blood of the youth country, driving social development.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </section>

              {/* CORE NSS PHILOSOPHY */}
              <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
                <div className="max-w-3xl space-y-4 relative z-10">
                  <span className="text-[9px] font-mono tracking-widest text-orange-400 font-bold uppercase">The Democratic Essence</span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-none">
                    Motto Philosophy Explored: "NOT ME BUT YOU"
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
                    The slogan represents the essence of democratic living and stresses the need for entirely selfless community support. It outlines that the welfare of our community as a whole directly governs individual well-being. Therefore, NSS student cadres are prepared to prioritize public and civic recovery over individual goals.
                  </p>
                </div>
              </section>

              {/* CHRONOLOGY OF THE NSS NATIONAL MOVEMENT & CAMPUS EVENTS */}
              <section className="space-y-8 bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-10 shadow-sm">
                <div className="border-b border-slate-100 pb-5">
                  <span className="text-xs font-black uppercase tracking-widest text-orange-600">The Path Transversed</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Milestones of National Service Scheme</h2>
                  <p className="text-xs text-slate-500 mt-1">Tracing our history of voluntary movement, national launches, and historic campus initiatives.</p>
                </div>

                <div className="relative border-l-2 border-orange-150 pl-6 sm:pl-8 space-y-8 max-w-4xl">
                  {nssTimeline.map((evt, idx) => {
                    const EvtIcon = evt.icon;
                    return (
                      <div key={idx} className="relative space-y-1.5 group">
                        <span className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] bg-orange-500 border-2 border-white shadow-md">
                          <EvtIcon size={11} />
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                            {evt.year}
                          </span>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Voluntary Service Marker</span>
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight block">
                          {evt.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PROJECT INITIATIVE & LEADERSHIP RECOGNITION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-[2.5rem] border border-slate-800 p-8 sm:p-12 shadow-2xl">
          {/* Decorative graphic background glows */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-brand-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-20 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            
            {/* Visual Graphic Representation */}
            <div className="w-full lg:w-1/3 flex justify-center shrink-0">
              <div className="relative group">
                {/* Outer animated rotating glowing border */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-orange-500 to-amber-500 rounded-[2rem] blur-lg opacity-40 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
                
                {/* Main badge frame */}
                <div className="relative bg-slate-950/90 border border-white/10 rounded-[1.8rem] p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-3xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                    <Sparkles size={28} className="text-white animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-400 block">NSS Leadership</span>
                    <h4 className="text-lg font-black tracking-tight uppercase">Abhinav V A</h4>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Volunteer Secretary</p>
                    <span className="inline-block text-[9px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300 font-bold uppercase tracking-widest mt-2">
                      Batch 2024 - 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Written tribute content */}
            <div className="flex-1 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-[9px] font-black uppercase tracking-widest w-fit mx-auto lg:mx-0">
                <Award size={12} />
                <span>Project Conception & Digital Vision</span>
              </div>
              
              <h2 className="text-xl sm:text-2.5xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                Conceived & Pioneered for the Service of Tomorrow
              </h2>
              
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                This digital volunteer coordination portal is an official system conceptualized, initiated, and actively championed by <strong className="text-white font-bold">Abhinav V A</strong> during his service tenure as the <strong className="text-orange-400 font-bold">Volunteer Secretary (2024-26 Batch)</strong> of NSS Unit 36 at NSS College Ottapalam.
              </p>
              
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                Driven by a vision to automate urgent blood bank inquiries, student service logs, and public emergency responses, this application bridges traditional societal outreach with cutting-edge cloud infrastructure to deliver real-time, life-saving impacts for the community.
              </p>

              <div className="pt-2 border-t border-white/5 flex flex-wrap justify-center lg:justify-start gap-4 text-[10px] font-mono text-slate-500 uppercase font-black tracking-wide">
                <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-brand-500" /> Student Initiative</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-brand-500" /> Administrative Approval</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-brand-500" /> Live Community Impact</span>
              </div>
            </div>

          </div>
        </section>

        {/* MOTTO CALL TO ACTION CARDS */}
        <section className="bg-slate-950 text-white rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-brand-600/10 to-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-orange-400 font-serif italic text-base sm:text-lg">"Service to mankind is service to God"</h3>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-none text-slate-100">
              Do You Wish to Volunteer and Build Community?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-2xl mx-auto leading-relaxed">
              Enrolment inside NSS Units 36 & 94 begins every academic launch phase. If you are already an active volunteer, register on our student portal to verify hours, log emergency SOS protocols, and check performance scores.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <a 
                href="/#/login" 
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-center font-black text-[10px] uppercase tracking-widest transition duration-300 shadow-xl shadow-brand-500/20"
              >
                Access Student Portal
              </a>
              <a 
                href="/#/help" 
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 rounded-xl text-center font-black text-[10px] uppercase tracking-widest transition duration-300"
              >
                Read Portal Instructions
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Inline fallback icon for Checked element
function CheckedIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
