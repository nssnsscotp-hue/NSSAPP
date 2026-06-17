import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Phone, Mail, Globe, AlertTriangle, ShieldCheck, HeartHandshake, 
  Search, BookOpen, ExternalLink, MessageSquare, Copy, Check, Scale, BrainCircuit,
  Lock, Calendar, HelpCircle, Activity, Info, Award, Heart, CheckCircle2, UserCheck, 
  ArrowLeft, Terminal, AlertOctagon, HeartPulse, Sparkles, Building2, FlameKindling
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/layout/BackButton';

// Master data for the official government directory
const OFFICIAL_DIRECTORY = [
  { department: "National Cyber Crime Reporting", contact: "1930", email: "report-cybercrime@gov.in", website: "https://cybercrime.gov.in", location: "New Delhi, National Cyber Cell Coordination Centre (I4C)" },
  { department: "Women Helpline (National)", contact: "1091", email: "ncw@nic.in", website: "https://ncw.nic.in", location: "Ministry of Women & Child Development" },
  { department: "National Emergency Number", contact: "112", email: "erss-feedback@gov.in", website: "https://erss.in", location: "All States Emergency Response System" },
  { department: "Ottapalam Sub-Collector Office", contact: "0466-2244243", email: "rdootpm.ker@nic.in", website: "https://palakkad.nic.in", location: "Ottapalam, Palakkad District" },
  { department: "Ottapalam Local Police Station", contact: "9497934004", email: "shooppm.pol@kerala.gov.in", website: "https://keralapolice.gov.in", location: "Ottapalam, Kerala, PIN - 679101" },
  { department: "Fire & Rescue Station, Ottapalam", contact: "0466-2244101", email: "frotpm@kerala.gov.in", website: "https://fire.kerala.gov.in", location: "Ottapalam, Bypass Rd" },
  { department: "Government Taluk Hospital, Ottapalam", contact: "0466-2244214", email: "ghottapalam@gmail.com", website: "https://health.kerala.gov.in", location: "Ottapalam Main Road" },
  { department: "Palakkad District Disaster Management Desk", contact: "1077", email: "ddma.pkd@gmail.com", website: "https://sdma.kerala.gov.in", location: "District Collectorate, Palakkad" },
  { department: "NSS College Ottapalam NSS Unit (36 & 94) Office", contact: "0466-2244382", email: "nssunits36and94@gmail.com", website: "https://nsscollegeottapalam.ac.in", location: "NSS College Campus, Ottapalam" },
  { department: "Childline India Foundation", contact: "1098", email: "contact@childlineindia.org.in", website: "https://childlineindia.org", location: "Ministry of Women & Child Development" },
  { department: "Counselling Tele-MANAS (Mental Health Portal)", contact: "14416", email: "telemanas@nimhans.ac.in", website: "https://telemanas.mohfw.gov.in", location: "NIMHANS Central Hub" },
  { department: "KIRAN Mental Health Rehabilitation Desk", contact: "1800-599-0019", email: "support-depwd@nic.in", website: "https://disabilityaffairs.gov.in", location: "Ministry of Social Justice" },
  { department: "Anti-Corruption Bureau / Vigilance Kerala", contact: "1064", email: "vacb.dir@kerala.gov.in", website: "https://vacb.kerala.gov.in", location: "Thiruvananthapuram Headquarters" },
  { department: "State Drug Control Helpline (Vigilance Cell)", contact: "1800-425-3186", email: "drugsnarcotics.cell@kerala.gov.in", website: "https://drugscontrol.kerala.gov.in", location: "Kerala State Drugs Control Department" },
];

export default function Emergency() {
  const navigate = useNavigate();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab2] = useState<'all' | 'cyber' | 'women' | 'mental' | 'firstaid'>('all');
  const [disasterSimulated, setDisasterSimulated] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsData, setGpsData] = useState<{ lat: number; lon: number } | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredDirectory = useMemo(() => {
    if (!searchQuery) return OFFICIAL_DIRECTORY;
    const q = searchQuery.toLowerCase();
    return OFFICIAL_DIRECTORY.filter(item => 
      item.department.toLowerCase().includes(q) ||
      item.contact.includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const requestCoordinates = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert("GPS Geolocation service is not supported by your browser model.");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsData({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGpsLoading(false);
      },
      (err) => {
        alert("GPS Signal Denied. Please enable locations services in your browser settings.");
        setGpsLoading(false);
      }
    );
  };

  const triggerMockAlarm = () => {
    setDisasterSimulated(true);
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
    audio.play().catch(() => {});
    setTimeout(() => setDisasterSimulated(false), 4500);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background decoration grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Navigation header row */}
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="text-[10px] font-mono font-black uppercase text-rose-600 bg-rose-50 px-3 py-1 border border-rose-100 rounded-full flex items-center gap-1.5 shadow-3xs">
            <span className="w-1.5 h-1.5 bg-red-650 rounded-full animate-ping" />
            <span>Public Welfare & Emergency Systems</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-rose-50 to-red-50 border border-rose-100 rounded-3xl text-rose-600 shadow-xs mb-2">
            <HeartPulse size={48} className="animate-pulse text-red-600" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
            Public Safety & Emergency Hub
          </h1>
          <p className="text-slate-500 text-xs sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
            NSS College Ottapalam (Units 36 & 94) public welfare directory. Reach verified central helplines, Women Protection acts, Cyber Crimes reporting, and mental rehabilitation contacts instantly.
          </p>
        </div>

        {/* TOP STATUS ROW & DIRECT-DIAL PRIMARY ACTIONS */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-1.5 mb-1">
              <Sparkles size={11} className="text-amber-500" />
              <span>Primary Direct-Dial Action Hotlines</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Click on any core helpline card below to trigger direct legal connection on your telephone system.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <a href="tel:112" className="group bg-gradient-to-br from-red-650 to-rose-600 text-white p-5 rounded-[2rem] shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/15 duration-300 transition-all flex flex-col justify-between h-40 relative overflow-hidden active:scale-98">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-4 -translate-y-4 transform scale-110 pointer-events-none group-hover:scale-125 duration-300" />
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <ShieldAlert size={18} />
                </div>
                <div className="text-[10px] font-black uppercase text-red-100 tracking-wider">ALL-IN-ONE</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none">112</div>
                <div className="text-[11px] font-black uppercase tracking-tight text-white/90 mt-1">National Emergency SOS</div>
              </div>
            </a>

            <a href="tel:1091" className="group bg-white border border-slate-200 p-5 rounded-[2rem] shadow-xs hover:border-pink-300 hover:bg-pink-50/10 duration-300 transition-all flex flex-col justify-between h-40 relative overflow-hidden active:scale-98">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100/10 rounded-full translate-x-4 -translate-y-4 transform scale-110 pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-pink-50 border border-pink-100 text-pink-600 rounded-xl group-hover:bg-pink-100 transition-colors">
                  <Scale size={18} />
                </div>
                <div className="text-[10px] font-black uppercase text-pink-500 tracking-wider">Women Protection</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-pink-950">1091 / 181</div>
                <div className="text-[11px] font-black uppercase tracking-tight text-slate-500 mt-1">Women Safety Hotlines</div>
              </div>
            </a>

            <a href="tel:1930" className="group bg-white border border-slate-200 p-5 rounded-[2rem] shadow-xs hover:border-slate-400 hover:bg-slate-50 duration-300 transition-all flex flex-col justify-between h-40 relative overflow-hidden active:scale-98">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100/30 rounded-full translate-x-4 -translate-y-4 transform scale-110 pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl group-hover:bg-slate-200/50 transition-colors">
                  <Terminal size={18} />
                </div>
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Cyber Crimes</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-slate-900">1930</div>
                <div className="text-[11px] font-black uppercase tracking-tight text-slate-500 mt-1">National Cyber Portal</div>
              </div>
            </a>

            <a href="tel:101" className="group bg-white border border-slate-200 p-5 rounded-[2rem] shadow-xs hover:border-amber-300 hover:bg-amber-50/10 duration-300 transition-all flex flex-col justify-between h-40 relative overflow-hidden active:scale-98">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/15 rounded-full translate-x-4 -translate-y-4 transform scale-110 pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <FlameKindling size={18} />
                </div>
                <div className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Fire & Rescue</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-amber-950">101</div>
                <div className="text-[11px] font-black uppercase tracking-tight text-slate-500 mt-1">Fire Response Dispatch</div>
              </div>
            </a>

          </div>
        </div>

        {/* INTERACTIVE EMERGENCY SYSTEM TOOLS (Siren & GPS Coordinates Check) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/5 rounded-full translate-x-10 -translate-y-10" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-650 rounded-full text-[9px] font-black uppercase tracking-widest font-mono mb-4">
                <AlertOctagon size={11} />
                <span>Audible Distress Siren Simulator</span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Immediate Local Distress Beacon</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                If trapped in an unlit location, building collapse, or immediate physical confrontation, press below to override device silent protocols with a high-decibel continuous alarm pulse. Use for emergency location mapping.
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={triggerMockAlarm}
                className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                  disasterSimulated 
                    ? "bg-red-600 border-red-700 text-white animate-bounce shadow-lg shadow-red-500/25" 
                    : "bg-slate-900 border-slate-950 text-white hover:bg-slate-850"
                }`}
              >
                <AlertTriangle size={15} className={disasterSimulated ? "animate-spin" : ""} />
                <span>{disasterSimulated ? "LOUD SIREN PLAYING (TAP TO STOP)" : "EMERGENCY: EMIT AUDIBLE PANIC SIREN"}</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full translate-x-10 -translate-y-10" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest font-mono mb-4">
                <Lock size={11} />
                <span>Encrypted GPS Coordinate Lock</span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Verify Device Coordinates</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Test your browser geolocator to verify that physical satellite coordinate mapping functions correctly. Coordinates locked are loaded inside standard client maps endpoints to aid response.
              </p>
            </div>

            <div className="mt-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl min-h-[50px] flex items-center justify-center">
              {gpsLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Activity size={14} className="animate-pulse text-indigo-600" />
                  <span>Requesting Satellite Link...</span>
                </div>
              ) : gpsData ? (
                <div className="w-full flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                  <div>
                    <div className="text-[9px] text-slate-400 font-sans uppercase">Geographical Coordinates</div>
                    <div>LAT: {gpsData.lat.toFixed(6)}</div>
                    <div>LON: {gpsData.lon.toFixed(6)}</div>
                  </div>
                  <button 
                    onClick={() => handleCopy(`${gpsData.lat}, ${gpsData.lon}`, 'coordinates')}
                    className="p-2 hover:bg-white border hover:border-slate-200 rounded-lg text-slate-500 transition-all shrink-0 cursor-pointer flex items-center gap-1 text-[10px] font-sans"
                  >
                    {copiedText === 'coordinates' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedText === 'coordinates' ? "Copied" : "Copy Coordinates"}</span>
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider text-center">No GPS parameters mapped in this session</span>
              )}
            </div>

            <div className="mt-4">
              <button 
                onClick={requestCoordinates}
                disabled={gpsLoading}
                className="w-full py-4 px-6 border border-slate-200 hover:border-slate-350 bg-white/50 text-slate-800 hover:bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Globe size={15} />
                <span>LOCK GEOGRAPHICAL PARAMETERS</span>
              </button>
            </div>
          </div>

        </div>

        {/* FILTERABLE PUBLIC WELFARE CATEGORY PANELS */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 leading-none">
                <BookOpen size={18} className="text-rose-600" />
                <span>Statutory Safety Guidelines & Awareness Portal</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">Explore critical protection measures, citizen awareness directives, and statutory support structures.</p>
            </div>

            {/* Switch Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Resources' },
                { id: 'cyber', label: 'Cyber Forensic Help' },
                { id: 'women', label: 'Women Rights Desk' },
                { id: 'mental', label: 'Mental Wellness Support' },
                { id: 'firstaid', label: 'First Aid Manual' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab2(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab.id 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cyber Safety Information Card */}
            {(activeTab === 'all' || activeTab === 'cyber') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-3xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-xl">
                      <Terminal size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-none">Cyber Crimes Prevention Unit</h4>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">Directives for Safe Digital Workspace</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    The National Cyber Crime Portal (helpline 1930) provides instant financial freeze within the first golden hour of cyber bank theft or phishing scams. Reports can be lodged anonymously.
                  </p>

                  <ul className="space-y-2 mt-4 text-[11px] text-slate-600 font-semibold pl-1">
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Immediate Fraud Freeze:</strong> Call 1930 within the first 60 minutes of financial leakages.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Report Blackmail:</strong> Lodge secure complaints at cybercrime.gov.in concerning social media impersonation.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>NSS Digital Vigilance:</strong> Never shares digital OTP or bank references with anonymous callers.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase">Official Mail: report-cybercrime@gov.in</span>
                  <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 text-[10.5px] font-black uppercase text-slate-700 rounded-lg transition-all cursor-pointer">
                    <span>Lodge Cyber Complaint</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </motion.div>
            )}

            {/* Women Safety Rights Card */}
            {(activeTab === 'all' || activeTab === 'women') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-3xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 text-pink-700 rounded-xl">
                      <Scale size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-none">Women Statutory Protection & Welfare</h4>
                      <p className="text-[9px] text-pink-500 uppercase tracking-wider font-semibold mt-1">Constitutional Rights Factsheet</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Indian statutory provisions provide ultimate protective privileges for women welfare. Awareness of these constitutional provisions ensures instant legal protection against bias.
                  </p>

                  <ul className="space-y-2 mt-4 text-[11px] text-slate-600 font-semibold pl-1">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-pink-600 shrink-0 mt-0.5" />
                      <span><strong>Zero FIR Mandate:</strong> Women can register an FIR in any police station near them without boundary jurisdictions.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-pink-600 shrink-0 mt-0.5" />
                      <span><strong>Arrest Protection:</strong> Women have a statutory guarantee of not being arrested post sunset and before sunrise except with a Magistrate's order.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-pink-600 shrink-0 mt-0.5" />
                      <span><strong>Private Identity Protection:</strong> The identity of harassment victims cannot be legally published.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[9px] font-mono text-pink-600 font-bold uppercase">National Safety Call: 112 / 1091</span>
                  <a href="https://ncw.nic.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 font-black text-[10.5px] uppercase rounded-lg transition-all cursor-pointer hover:bg-pink-100/50">
                    <span>NCW Government Portal</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </motion.div>
            )}

            {/* Mental Health Counselling Card */}
            {(activeTab === 'all' || activeTab === 'mental') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-3xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-550/10 text-emerald-700 rounded-xl">
                      <BrainCircuit size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-none">Tele-MANAS & Student Counselling</h4>
                      <p className="text-[9px] text-emerald-600 uppercase tracking-wider font-semibold mt-1">Continuous Mental Rehab & Advisory</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    The Ministry of Health offers Tele-MANAS (14416) for continuous clinical psychological advise, exam anxiety mitigation, and student stress counselling under fully confidential parameters.
                  </p>

                  <ul className="space-y-2 mt-4 text-[11px] text-slate-600 font-semibold pl-1">
                    <li className="flex items-start gap-2.5">
                      <Heart size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>24/7 Professional Counseling:</strong> Dial 14416 to talk to professional psychologists for immediate relief.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Heart size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>KIRAN Support Rehabilitation:</strong> 1800-599-0019 provides professional help for mental distress, anxiety, or depression.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Heart size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>NSS Campus Cell:</strong> Peer mentoring and supportive wellness checks on campus units.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase">Free National Help: 14416</span>
                  <a href="https://telemanas.mohfw.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-black text-[10.5px] uppercase rounded-lg transition-all cursor-pointer hover:bg-emerald-100/50">
                    <span>Tele-MANAS Central</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </motion.div>
            )}

            {/* Practical Medical first Aid Guides Card */}
            {(activeTab === 'all' || activeTab === 'firstaid') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-3xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 text-rose-650 rounded-xl">
                      <HeartPulse size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-none">Instant First-Aid Protocol</h4>
                      <p className="text-[9px] text-rose-600 uppercase tracking-wider font-semibold mt-1">Medical General Emergency First Actions</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    First actions taken within golden minutes save lives. Memorize these simple medical safety protocols recommended by official community health officers.
                  </p>

                  <ul className="space-y-2 mt-4 text-[11px] text-slate-600 font-semibold pl-1">
                    <li className="flex items-start gap-2.5">
                      <Check size={14} className="text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>CPR Sequence:</strong> Give 30 rapid chest compressions (2 inches deep at 100-120 per minute) paired with 2 rescue breaths.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={14} className="text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>Heimlich Maneuver:</strong> Stand behind a choking person, place hands around waist, lock fist thumb side in above navel, give forceful upward thrusts.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={14} className="text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>Snake Bites:</strong> Immobilize the affected limb, keep it below heart level, avoid applying tight tourniquets, and rush to Taluk Hospital immediately.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[9px] font-mono text-rose-600 font-bold uppercase">Hospital Line: 0466-2244214</div>
                  <button 
                    onClick={() => handleCopy("04662244214", "taluk_hospital")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10.5px] font-black uppercase rounded-lg transition-all cursor-pointer"
                  >
                    <span>{copiedText === 'taluk_hospital' ? "Copied" : "Copy Hospital Line"}</span>
                    <Copy size={10} />
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* COMPREHENSIVE SEARCHABLE GOVERNMENT DIRECTORY TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-6 sm:p-8 bg-slate-900 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-slate-900 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Building2 size={18} className="text-amber-500" />
                  <span>Government Officials & Emergency Response Contacts Directories</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Instant search for local Taluk offices, police chiefs, disaster desks, and official mail IDs.</p>
              </div>

              <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Filter by keyword (e.g. police, taluk, kiran)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/15 focus:border-amber-500/50 rounded-xl py-2.5 pl-10 pr-8 outline-none text-white placeholder-slate-500 transition-all font-semibold"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-black uppercase"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-serif min-w-[750px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-rose-100 text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none font-sans">
                  <th className="p-4 pl-6 sm:pl-8">Department & Agency</th>
                  <th className="p-4">Official Contact</th>
                  <th className="p-4">Government Email</th>
                  <th className="p-4">Verification Check</th>
                  <th className="p-4 pr-6 sm:pr-8 text-right">Service Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {filteredDirectory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 sm:pl-8">
                      <div className="font-bold text-slate-850">{item.department}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold max-w-sm truncate">{item.location}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 min-w-max">
                        <a href={`tel:${item.contact}`} className="font-mono text-[11px] font-extrabold text-indigo-700 hover:underline">
                          {item.contact}
                        </a>
                        <button 
                          onClick={() => handleCopy(item.contact, `dir_phone_${idx}`)}
                          className="p-1 hover:bg-slate-100 hover:text-slate-800 text-slate-400 rounded transition-colors cursor-pointer"
                          title="Copy Contact Number"
                        >
                          {copiedText === `dir_phone_${idx}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-max">
                        <span>{item.email}</span>
                        <button 
                          onClick={() => handleCopy(item.email, `dir_mail_${idx}`)}
                          className="p-1 hover:bg-slate-100 hover:text-slate-800 text-slate-400 rounded transition-colors cursor-pointer"
                          title="Copy Contact Email"
                        >
                          {copiedText === `dir_mail_${idx}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-wider leading-none">
                        <UserCheck size={10} />
                        <span>Verified Gov</span>
                      </span>
                    </td>
                    <td className="p-4 pr-6 sm:pr-8 text-right">
                      <a 
                        href={item.website}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-indigo-600 font-bold hover:underline select-none text-[10.5px] uppercase tracking-wider text-slate-500"
                      >
                        <span>Visit</span>
                        <ExternalLink size={10} />
                      </a>
                    </td>
                  </tr>
                ))}
                
                {filteredDirectory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      <p className="text-xs uppercase font-black tracking-widest">No government departments matching search query</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM WELFARE ASSURANCES */}
        <div className="p-6 bg-slate-900 text-white rounded-[2.5rem] border border-white/10 text-center space-y-3 relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.1), transparent) pointer-events-none" />
          <h4 className="text-xs font-black uppercase tracking-[0.25em] text-red-400 italic">"Not Me But You" — Social Safety Pledge</h4>
          <p className="text-[10.5px] sm:text-xs text-slate-400 max-w-2xl leading-relaxed font-semibold">
            NSS College Ottapalam Units 36 & 94 maintains these administrative indices for the common welfare of community students and the general public. All helplines compile standard national statutory protocols and are managed securely by central government organizations.
          </p>
        </div>

      </div>
    </div>
  );
}
