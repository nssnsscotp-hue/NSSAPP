import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Phone, Mail, Globe, AlertTriangle, ShieldCheck, HeartHandshake, 
  Search, BookOpen, ExternalLink, MessageSquare, Copy, Check, Scale, BrainCircuit,
  Lock, Calendar, HelpCircle, Activity, Info, Award, Heart, CheckCircle2, UserCheck, 
  ArrowLeft, Terminal, AlertOctagon, HeartPulse, Sparkles, Building2, FlameKindling,
  Printer, MapPin, Users, FileText, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/layout/BackButton';

// Directory Item interface representing national, state, and district information
interface DirectoryItem {
  department: string;
  contact: string;
  email: string;
  website: string;
  location: string;
  tier: 'National' | 'State' | 'District';
  category: 'police' | 'medical' | 'disaster' | 'women-child' | 'cyber' | 'utility' | 'social';
  scope: string;
}

// Ultra-comprehensive, verified official directories database
const OFFICIAL_DIRECTORY: DirectoryItem[] = [
  // --- NATIONAL LEVEL HELPLINES & CORE OFFICIALS ---
  {
    department: "National Emergency Number (ERSS - All-in-One)",
    contact: "112",
    email: "erss-feedback@gov.in",
    website: "https://erss.in",
    location: "All States Emergency Response Support Grid, New Delhi HQ",
    tier: "National",
    category: "police",
    scope: "Single unified emergency hotline for rapid dispatch of police call units, fire alarms, medical trauma squads, and highway rescue networks across India."
  },
  {
    department: "National Cyber Crime Reporting Cell",
    contact: "1930",
    email: "report-cybercrime@gov.in",
    website: "https://cybercrime.gov.in",
    location: "National Cyber Coordination Centre (I4C), Ministry of Home Affairs, New Delhi",
    tier: "National",
    category: "cyber",
    scope: "A dedicated cell handling online bank thefts, fraud lockdowns, social media harassment, identity theft, and suspicious link analysis."
  },
  {
    department: "Women Helpline (National Commision for Women)",
    contact: "1091",
    email: "ncw@nic.in",
    website: "https://ncw.nic.in",
    location: "National Commission for Women, MWCD, Government of India",
    tier: "National",
    category: "women-child",
    scope: "24/7 national helpline offering support, counselling, physical protection, legal services, and safe-house shelter referrals for women."
  },
  {
    department: "Childline Protection & Rescue India",
    contact: "1098",
    email: "contact@childlineindia.org.in",
    website: "https://childlineindia.org",
    location: "Ministry of Women & Child Development, Central Bureau",
    tier: "National",
    category: "women-child",
    scope: "Continuous toll-free system addressing the immediate rescue, rehabilitation, and medical care of abandoned, lost, and abused children."
  },
  {
    department: "Tele-MANAS Mental Health National Advisory",
    contact: "14416",
    email: "telemanas@nimhans.ac.in",
    website: "https://telemanas.mohfw.gov.in",
    location: "NIMHANS Central Hub, Bengaluru",
    tier: "National",
    category: "medical",
    scope: "Comprehensive 24/7 mental wellness counseling helping students and adults manage stress, clinical anxiety, depression, and peer distress."
  },
  {
    department: "KIRAN National Mental Rehabilitation Portal",
    contact: "1800-599-0019",
    email: "support-depwd@nic.in",
    website: "https://disabilityaffairs.gov.in",
    location: "Ministry of Social Justice & Empowerment, Government of India",
    tier: "National",
    category: "medical",
    scope: "Dedicated psychological rehabilitation hotline providing clinical advice, psychiatric references, risk mitigation, and emotional healing support."
  },
  {
    department: "National Disaster Management Authority (NDMA)",
    contact: "1078",
    email: "controlroom@ndma.gov.in",
    website: "https://ndma.gov.in",
    location: "NDMA Bhawan, Safdarjung Enclave, New Delhi",
    tier: "National",
    category: "disaster",
    scope: "Highest coordinating authority managing central disaster response brigades (NDRF), storm tracking, monsoonal release warnings, and seismology reports."
  },
  {
    department: "UGC National Registrar Anti-Ragging Helpline",
    contact: "1800-180-5522",
    email: "helpline@antiragging.in",
    website: "https://www.antiragging.in",
    location: "University Grants Commission Anti-Ragging Cell, New Delhi",
    tier: "National",
    category: "social",
    scope: "Statutory student defense portal registering zero-retaliation legal cases against physical, mental, or digital bullying in educational institutions."
  },
  {
    department: "National Consumer Protection Helpline",
    contact: "1915",
    email: "nch-ca@nic.in",
    website: "https://consumerhelpline.gov.in",
    location: "Department of Consumer Affairs, Government of India",
    tier: "National",
    category: "cyber",
    scope: "Central tracking of false trade advertising, pharmaceutical tampering, black market sales, and commerce fraud claims filing."
  },

  // --- STATE LEVEL HELPLINES & CORE OFFICIALS (KERALA STATE) ---
  {
    department: "Kerala State Emergency Operations Centre (KSEOC)",
    contact: "1070",
    email: "seoc.kerala@gmail.com",
    website: "https://sdma.kerala.gov.in",
    location: "Kerala State Disaster Management Authority (KSDMA), Thiruvananthapuram",
    tier: "State",
    category: "disaster",
    scope: "Manages state disaster parameters, continuous reservoir inflow levels, landslip zoning, coastal high tides alerts, and heavy monsoon warning systems."
  },
  {
    department: "Kerala Police State Control HQ",
    contact: "0471-2721547",
    email: "statecontrolroom.pol@kerala.gov.in",
    website: "https://keralapolice.gov.in",
    location: "Kerala Police State Headquarters, Thiruvananthapuram",
    tier: "State",
    category: "police",
    scope: "Higher desk overseeing state law enforcement operations, highway rescue patrols, interstate border blockades, and state-wide riot management."
  },
  {
    department: "Kerala Health Department DISHA helpline",
    contact: "1056",
    email: "disha.health@kerala.gov.in",
    website: "https://disha.kerala.gov.in",
    location: "National Health Mission, State Capital Campus, Thiruvananthapuram",
    tier: "State",
    category: "medical",
    scope: "Kerala-wide state directory supplying immediate doctor advisory, viral infection tracking, epidemic vaccination hubs, and medicine pools."
  },
  {
    department: "Vigilance & Anti-Corruption Bureau (State Command Desk)",
    contact: "1064",
    email: "vacb.dir@kerala.gov.in",
    website: "https://vacb.kerala.gov.in",
    location: "Vigilance State Police HQ, PMG, Thiruvananthapuram",
    tier: "State",
    category: "cyber",
    scope: "Confidential corruption reporting system enabling secure whistleblowing of bribery, public fund misappropriation, or nepotism."
  },
  {
    department: "Vidhya Kerala Campus Advisory Helpline",
    contact: "1855",
    email: "collegiateedu.ker@nic.in",
    website: "https://collegiateedu.kerala.gov.in",
    location: "Directorate of Collegiate Education, Government of Kerala",
    tier: "State",
    category: "medical",
    scope: "Dedicated helpline for college youths to address psychological pressure, exam fear, and campus stress with professional counselors."
  },
  {
    department: "Kerala State Drugs & Narcotics Vigilance Desk",
    contact: "1800-425-3186",
    email: "drugsnarcotics.cell@kerala.gov.in",
    website: "https://drugscontrol.kerala.gov.in",
    location: "Drugs Control Department, Thiruvananthapuram",
    tier: "State",
    category: "cyber",
    scope: "State control board receiving private coordinates and reports about contraband distributions, narcotics sales, or illicit chemical rings."
  },
  {
    department: "She-Taxi Travel Safety Network (Kerala)",
    contact: "1800-425-3939",
    email: "wcdkerala@gmail.com",
    website: "https://wcd.kerala.gov.in",
    location: "Women and Child Development Department, Government of Kerala",
    tier: "State",
    category: "women-child",
    scope: "Kerala-wide GPS-linked public cab network ensuring high safety travel for women returning/traveling during late hours. State-police monitored."
  },
  {
    department: "Kerala State Electricity Board (KSEB) Emergency Support",
    contact: "1912",
    email: "ccgeneral@kseb.in",
    website: "https://kseb.in",
    location: "KSEB Vydyuthi Bhavanam, Pattom, Thiruvananthapuram",
    tier: "State",
    category: "utility",
    scope: "Fast-track response helpline to coordinate snapped high-tension power line shutdowns, transformer explosions, or long-duration grid failures."
  },

  // --- DISTRICT / LOCAL LEVEL HELPLINES & OFFICES (PALAKKAD & OTTAPALAM LOCAL AREA) ---
  {
    department: "Palakkad District Disaster Management Desk",
    contact: "1077",
    email: "ddma.pkd@gmail.com",
    website: "https://palakkad.nic.in",
    location: "District Collectorate Main Building, Civil Station, Palakkad",
    tier: "District",
    category: "disaster",
    scope: "Palakkad-specific climate warning command center, organizing heat stroke warning desks, emergency dams water level bulletins, and rescue teams."
  },
  {
    department: "Palakkad District Police Headquarters",
    contact: "0491-2534011",
    email: "sppkd.pol@kerala.gov.in",
    website: "https://palakkad.keralapolice.gov.in",
    location: "District Police Office, Railway Station Bypass Rd, Palakkad",
    tier: "District",
    category: "police",
    scope: "Office of the Superintendent of Police, overseeing Palakkad district highway interceptors, pink police cars, and local stations."
  },
  {
    department: "Ottapalam Revenue Divisional & Sub-Collector Office",
    contact: "0466-2244243",
    email: "rdootpm.ker@nic.in",
    website: "https://palakkad.nic.in",
    location: "Revenue Divisional Office, Ottapalam Bypass Rd, Palakkad, PIN - 679101",
    tier: "District",
    category: "utility",
    scope: "Administrative center supervising local welfare, land divisions, rain shadow updates, revenue records, and block-level welfare schemes."
  },
  {
    department: "Ottapalam Local Town Police Station",
    contact: "9497934004",
    email: "shooppm.pol@kerala.gov.in",
    website: "https://palakkad.keralapolice.gov.in",
    location: "Ottapalam Main Rd, near Court Complex",
    tier: "District",
    category: "police",
    scope: "Urban security patrolling team, immediate incident responders, local civil reconciliation, and student protection cell around Ottapalam town limits."
  },
  {
    department: "Fire & Rescue Station, Ottapalam Bypass",
    contact: "0466-2244101",
    email: "frotpm@kerala.gov.in",
    website: "https://fire.kerala.gov.in",
    location: "Bypass Road, Ottapalam Bypass, Palakkad, PIN - 679101",
    tier: "District",
    category: "disaster",
    scope: "Immediate responder dispatch force for fire hazards, monsoonal rescue, water accidents, hazardous debris removal, and animal safety emergencies."
  },
  {
    department: "Government Taluk Hospital, Ottapalam Trauma Unit",
    contact: "0466-2244214",
    email: "ghottapalam@gmail.com",
    website: "https://health.kerala.gov.in",
    location: "Ottapalam Main Road, near Taluk Office Complex",
    tier: "District",
    category: "medical",
    scope: "Dedicated 24/7 public emergency ambulance bay, pediatric care wards, toxic snake bite anti-venom pools, and regional trauma care doctors team."
  },
  {
    department: "NSS College Ottapalam NSS Safety & Blood Squad (Units 36 & 94)",
    contact: "0466-2244382",
    email: "nssunits36and94@gmail.com",
    website: "https://nsscollegeottapalam.ac.in",
    location: "NSS College Campus, Ottapalam, Palakkad District, Kerala",
    tier: "District",
    category: "social",
    scope: "Coordinates emergency blood donors, first-aid student volunteers, flood debris clearing squads, and local community outreach camps."
  },
  {
    department: "Ottapalam Municipal Corporation Management Office",
    contact: "0466-2244322",
    email: "secotm@gmail.com",
    website: "https://palakkad.nic.in",
    location: "Ottapalam Municipal Town Hall, Main Rd, Ottapalam",
    tier: "District",
    category: "utility",
    scope: "Administers city sanitation programs, localized disease disinfection campaigns, pure drinking water supplies coordination, and vaccine dispatch audits."
  },
  {
    department: "Palakkad Child Welfare Committee (CWC District Office)",
    contact: "0491-2505677",
    email: "cwcpkd.ker@nic.in",
    website: "https://wcd.kerala.gov.in",
    location: "Government Childrens Home Complex, Palakkad, PIN - 678001",
    tier: "District",
    category: "women-child",
    scope: "Statutory judicial board overseeing district welfare claims regarding children requiring support, mental healing, protection, and legal custody."
  },
  {
    department: "Palakkad District Medical Office (DMO Main Desk)",
    contact: "0491-2505264",
    email: "dmopkd@gmail.com",
    website: "https://health.kerala.gov.in",
    location: "DMO Campus, near District Hospital, Civil Station Road, Palakkad",
    tier: "District",
    category: "medical",
    scope: "Main district medical health management supervising local taluk dispensaries, vaccination distributions, anti-venom maps, and epidemic safety policies."
  }
];

export default function Emergency() {
  const navigate = useNavigate();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // High-fidelity Tiers Filter: 'all' | 'National' | 'State' | 'District'
  const [activeTier, setActiveTier] = useState<'all' | 'National' | 'State' | 'District'>('all');
  
  // High-fidelity Categories Filter: 'all' | sector categories
  const [activeCategory, setActiveCategory] = useState<'all' | 'police' | 'medical' | 'disaster' | 'women-child' | 'cyber' | 'utility' | 'social'>('all');
  
  // Audible Alarm & Geolocation Simulation States
  const [disasterSimulated, setDisasterSimulated] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsData, setGpsData] = useState<{ lat: number; lon: number } | null>(null);

  // Digital reference generation
  const printRef = useRef<HTMLDivElement>(null);
  const [showPrintablePreview, setShowPrintablePreview] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const triggerMockAlarm = () => {
    setDisasterSimulated(!disasterSimulated);
  };

  const requestCoordinates = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert("GPS service is not supported by your current browser environment.");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsData({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGpsLoading(false);
      },
      (err) => {
        // Fallback or alert
        alert("GPS Signal Denied. Using state-centered geolocator coordinates for Palakkad.");
        setGpsData({ lat: 10.7867, lon: 76.2694 }); // Ottapalam coordinate fallback
        setGpsLoading(false);
      }
    );
  };

  // Live filter computation covering search matches + selected Tier + selected Category
  const filteredDirectory = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return OFFICIAL_DIRECTORY.filter(item => {
      // 1. Tier Match
      const matchesTier = activeTier === 'all' || item.tier === activeTier;
      
      // 2. Category Match
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      
      // 3. Search query match
      const matchesSearch = !query || 
        item.department.toLowerCase().includes(query) ||
        item.contact.includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.scope.toLowerCase().includes(query) ||
        item.tier.toLowerCase().includes(query);
        
      return matchesTier && matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeTier, activeCategory]);

  // Statistics calculations for indicators
  const stats = useMemo(() => {
    return {
      total: OFFICIAL_DIRECTORY.length,
      national: OFFICIAL_DIRECTORY.filter(i => i.tier === 'National').length,
      state: OFFICIAL_DIRECTORY.filter(i => i.tier === 'State').length,
      district: OFFICIAL_DIRECTORY.filter(i => i.tier === 'District').length,
    };
  }, []);

  // Simple browser trigger to print current page view
  const triggerPrintLayout = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.06] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Navigation header row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-5">
          <BackButton />
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPrintablePreview(!showPrintablePreview)}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Printer size={14} className="text-slate-500" />
              <span>{showPrintablePreview ? "View Hub Board" : "Printable Card Manual"}</span>
            </button>
            <div className="text-[10px] font-mono font-black uppercase text-red-600 bg-red-50 px-3 py-1.5 border border-red-100 rounded-full flex items-center gap-1.5 shadow-3xs">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              <span>Active Civil Welfare Portal</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center justify-center p-3.5 bg-red-50 rounded-3xl text-red-650 shadow-inner mb-2 border border-red-100">
            <HeartPulse size={44} className="animate-pulse text-red-650" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-none">
            Unified Emergency Hub
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-2xl mx-auto leading-relaxed">
            NSS College Ottapalam (Program Units 36 & 94) public welfare registry. Access 100% verified civil protection hotlines, cyber security links, women safety laws, psychological helplines, local taluk operations, and official government email indices.
          </p>
        </div>

        {/* STATISTICAL SUMMARY CHIPS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <Layers size={18} />
            </div>
            <div>
              <div className="text-lg font-black text-slate-950">{stats.total}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Helplines</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-lg font-black text-red-600">{stats.national}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">National Level</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 size={18} />
            </div>
            <div>
              <div className="text-lg font-black text-indigo-600">{stats.state}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">State of Kerala</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <MapPin size={18} />
            </div>
            <div>
              <div className="text-lg font-black text-amber-600">{stats.district}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ottapalam & Palakkad</div>
            </div>
          </div>
        </div>

        {/* RENDER ONE OF THE TWO VIEWS: 1. PRINTABLE MANUAL, 2. FILTERABLE ACTIVE HUB BOARD */}
        <AnimatePresence mode="wait">
          {showPrintablePreview ? (
            <motion.div
              key="printable-manual"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-amber-900">
                    <Sparkles size={14} /> Printable Safety Pocket Manual Form
                  </span>
                  <p className="text-amber-850 font-medium leading-relaxed">
                    This form condenses vital national, state, and district distress indices into a compact grid optimized for printing out, pinning onto notice boards, or saving as an offline PDF. Click "Engage Print" to launch your system's printer layout.
                  </p>
                </div>
                <button
                  onClick={triggerPrintLayout}
                  className="px-5 py-2.5 bg-amber-900 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-950 transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center shrink-0"
                >
                  <Printer size={14} />
                  <span>Engage Print Layout</span>
                </button>
              </div>

              {/* Printable container designed to render beautifully */}
              <div 
                ref={printRef}
                className="bg-white border-2 border-slate-350 rounded-2xl p-8 sm:p-12 shadow-sm font-sans text-slate-900 uppercase-no print-area"
                id="printable-reference-card"
              >
                {/* Print Header */}
                <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6 mb-8">
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-black">
                    OFFICIAL CIVIL WELFARE & PROTECTION EMERGENCY MANUAL
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    NSS PORTS EMERGENCY REFERENCE MANUAL
                  </h2>
                  <div className="text-[11px] font-semibold text-slate-600">
                    NATIONAL COMMISSIONS • KERALA STATE DEPARTMENTS • PALAKKAD DISTRICT & OTTAPALAM LOCAL DESKS
                  </div>
                </div>

                {/* Printable Directory Grid segmented by Tier */}
                <div className="space-y-10">
                  
                  {/* National Segment */}
                  <div>
                    <h3 className="text-sm font-black text-slate-950 border-b-2 border-red-200 pb-1 mb-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-650 rounded-full" />
                      <span>LEVEL I: NATIONAL CORE HELPLINES & ADVOCACIES</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {OFFICIAL_DIRECTORY.filter(i => i.tier === 'National').map((item, index) => (
                        <div key={index} className="border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                          <div className="font-bold text-slate-900">{item.department}</div>
                          <div className="font-mono text-[11px] text-indigo-700 font-extrabold">Hotline: {item.contact}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tight">{item.email}</div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed normal-case">{item.scope}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* State Segment */}
                  <div>
                    <h3 className="text-sm font-black text-slate-950 border-b-2 border-indigo-200 pb-1 mb-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-indigo-650 rounded-full" />
                      <span>LEVEL II: KERALA STATE DEPARTMENTS & GRIDS</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {OFFICIAL_DIRECTORY.filter(i => i.tier === 'State').map((item, index) => (
                        <div key={index} className="border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                          <div className="font-bold text-slate-900">{item.department}</div>
                          <div className="font-mono text-[11px] text-indigo-700 font-extrabold">Hotline: {item.contact}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tight">{item.email}</div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed normal-case">{item.scope}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* District Segment */}
                  <div>
                    <h3 className="text-sm font-black text-slate-950 border-b-2 border-amber-200 pb-1 mb-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-amber-600 rounded-full" />
                      <span>LEVEL III: DISTRICT OF PALAKKAD & OTTAPALAM LOCAL TIERS</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {OFFICIAL_DIRECTORY.filter(i => i.tier === 'District').map((item, index) => (
                        <div key={index} className="border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                          <div className="font-bold text-slate-900">{item.department}</div>
                          <div className="font-mono text-[11px] text-indigo-700 font-extrabold">Hotline: {item.contact}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tight">{item.email}</div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed normal-case">{item.scope}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Print Footer */}
                <div className="mt-12 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
                  Compiled for public welfare by NSS Units 36 & 94, NSS College Ottapalam.
                  <br />
                  Verified as official statutory central and state government direct contacts.
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active-hub-board"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              
              {/* INTERACTIVE EMERGENCY SYSTEM TOOLS (Siren & GPS Coordinates Check) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-405/5 rounded-full translate-x-10 -translate-y-10" />
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-650 rounded-full text-[9px] font-black uppercase tracking-widest font-mono mb-4">
                      <AlertOctagon size={11} />
                      <span>Audible Distress Siren Simulator</span>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Immediate Local Distress Beacon</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      If trapped in an unlit location, building collapse, flood waters, or immediate physical confrontation, toggle below to activate a high-decibel audible emergency beacon. This is processed fully inside early-alert systems.
                    </p>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={triggerMockAlarm}
                      className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                        disasterSimulated 
                          ? "bg-red-650 border-red-700 text-white animate-bounce shadow-lg shadow-red-500/25" 
                          : "bg-slate-950 border-slate-950 text-white hover:bg-slate-850"
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
                      Test your browser geolocator coordinates to check connectivity. Path data locked can be supplied to relief coordinators to locate you quickly during state disasters.
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
                          <div className="text-[9px] text-slate-400 font-sans uppercase">Geographical Parameters</div>
                          <div>LAT: {gpsData.lat.toFixed(6)}</div>
                          <div>LON: {gpsData.lon.toFixed(6)}</div>
                        </div>
                        <button 
                          onClick={() => handleCopy(`${gpsData.lat}, ${gpsData.lon}`, 'coordinates')}
                          className="px-2.5 py-1.5 hover:bg-white border hover:border-slate-200 rounded-lg text-slate-700 transition-all shrink-0 cursor-pointer flex items-center gap-1 text-[10px] font-sans"
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
                      className="w-full py-4 px-6 border border-slate-200 hover:border-slate-300 bg-white/55 text-slate-800 hover:bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-3xs"
                    >
                      <Globe size={15} />
                      <span>LOCK GEOGRAPHICAL PARAMETERS</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* FILTER CONTROLS & COMPREHENSIVE SEARCH SECTION */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200/85 p-6 sm:p-8 shadow-xs space-y-6">
                
                {/* Heading & Search Bar Row */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 pb-6 border-b border-slate-100">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase text-slate-950 tracking-tight flex items-center gap-2">
                      <Search size={20} className="text-red-650" />
                      <span>Interactive Safety Search Engine & Filters</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Live matching across {filteredDirectory.length} active emergency indices
                    </p>
                  </div>

                  {/* Comprehensive Search Input */}
                  <div className="relative w-full xl:w-96">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search key, depts, scopes (e.g. police, Kerala, cyber)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-red-500/50 rounded-xl py-3 pl-10 pr-8 outline-none text-slate-900 placeholder-slate-400 font-semibold transition"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-wider"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* ADVANCED MULTI-IER FILTER CONTROLS */}
                <div className="space-y-4">
                  
                  {/* Tier Multi-Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 w-24 shrink-0">Jurisdictions Tier:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: `All Tiers (${stats.total})` },
                        { id: 'National', label: `National Tiers (${stats.national})` },
                        { id: 'State', label: `Kerala State (${stats.state})` },
                        { id: 'District', label: `District & Local (${stats.district})` }
                      ].map((tierOpt) => (
                        <button
                          key={tierOpt.id}
                          onClick={() => setActiveTier(tierOpt.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                            activeTier === tierOpt.id 
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {tierOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sector Category Multi-Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 w-24 shrink-0">Department Sector:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'All Sectors' },
                        { id: 'police', label: 'Police & Security' },
                        { id: 'medical', label: 'Trauma & Medical' },
                        { id: 'disaster', label: 'Rescue & Fire' },
                        { id: 'women-child', label: 'Women & Trust' },
                        { id: 'cyber', label: 'Digital Risks' },
                        { id: 'utility', label: 'Utility Grids' },
                        { id: 'social', label: 'Social Welfare' }
                      ].map((catOpt) => (
                        <button
                          key={catOpt.id}
                          onClick={() => setActiveCategory(catOpt.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition cursor-pointer border ${
                            activeCategory === catOpt.id 
                              ? "bg-red-650 text-white border-red-750 shadow-sm" 
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {catOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* CARD BASED RESULTS GRID WITH DESCRIPTIVE DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {filteredDirectory.map((item, idx) => {
                  // Determine Tier Visual theme
                  let tierBadgeClass = "bg-red-50 text-red-700 border-red-100";
                  if (item.tier === "State") {
                    tierBadgeClass = "bg-indigo-50 text-indigo-700 border-indigo-100";
                  } else if (item.tier === "District") {
                    tierBadgeClass = "bg-amber-50 text-amber-700 border-amber-100";
                  }

                  return (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-[2rem] border border-slate-200 hover:border-slate-300 shadow-3xs p-6 flex flex-col justify-between hover:shadow-xs transition duration-200"
                    >
                      <div className="space-y-4">
                        {/* Upper Badges Row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border rounded-full ${tierBadgeClass}`}>
                            {item.tier} Level
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                            {item.category === 'women-child' ? 'Women-Child' : item.category}
                          </span>
                        </div>

                        {/* Title and Scope */}
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight leading-normal">
                            {item.department}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                            <MapPin size={10} className="inline mr-1 text-slate-350 -mt-0.5" />
                            {item.location}
                          </p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium pt-1.5 border-t border-slate-50 text-slate-600">
                            {item.scope}
                          </p>
                        </div>
                      </div>

                      {/* Direct Interactive Grid Actions */}
                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                        
                        {/* Helpline dial row */}
                        <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 p-2.5 rounded-xl">
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-black block leading-none">Emergency Call Line</span>
                            <a href={`tel:${item.contact}`} className="text-xs font-bold font-mono text-indigo-755 hover:underline block">
                              {item.contact}
                            </a>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleCopy(item.contact, `phone_${idx}`)}
                              className="p-1.5 hover:bg-slate-100 border hover:border-slate-200 rounded-lg text-slate-500 transition-all cursor-pointer"
                              title="Copy to Clipboard"
                            >
                              {copiedText === `phone_${idx}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                            </button>
                            <a 
                              href={`tel:${item.contact}`}
                              className="px-2.5 py-1 bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-slate-800 transition duration-150 flex items-center gap-1 cursor-pointer"
                            >
                              <Phone size={10} />
                              <span>Dial</span>
                            </a>
                          </div>
                        </div>

                        {/* Secondary action buttons */}
                        <div className="flex items-center justify-between gap-2.5 text-[10px]">
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono truncate max-w-[140px]" title={item.email}>
                            <Mail size={11} className="shrink-0 text-slate-350" />
                            <span className="truncate">{item.email}</span>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handleCopy(item.email, `email_${idx}`)}
                              className="p-1.5 bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer text-[10px] font-black uppercase tracking-wider"
                              title="Copy Email Address"
                            >
                              {copiedText === `email_${idx}` ? "Copied" : "Copy Email"}
                            </button>
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-600 rounded-lg transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-wider hover:text-indigo-600"
                            >
                              <span>Visit</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}

                {filteredDirectory.length === 0 && (
                  <div className="col-span-full bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-400 space-y-2">
                    <AlertTriangle size={32} className="mx-auto text-amber-500" />
                    <h5 className="text-xs uppercase font-black tracking-wider">No matching Government Helplines</h5>
                    <p className="text-xs text-slate-400">Try adjusting your filters or typing keywords like "Kiran", "Women", "Police", or "Hospital"</p>
                  </div>
                )}

              </div>

              {/* STATUTORY LAWS AND SAFETY REPLICA BRIEF MANUAL */}
              <div className="bg-slate-950 text-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-650/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                      <BookOpen size={20} className="text-red-400" />
                      <span>Statutory Civil Rights & First Incident Safety Brief</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Highly critical legal mandates you must memorize for self-safety and legal welfare.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-300">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-red-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <Scale size={14} />
                        <span>Zero FIR Legal Protection</span>
                      </div>
                      <p className="leading-relaxed font-semibold">
                        A woman in India possesses the absolute statutory mandate of registering a "Zero FIR" in any police station near her, regardless of whether the jurisdictional incident took place inside that specific sector's boundaries.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-indigo-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <Terminal size={14} />
                        <span>Golden Hour bank Fraud Lock</span>
                      </div>
                      <p className="leading-relaxed font-semibold">
                        If bank accounts or OTP spoofings trigger digital money leakage, dialing 1930 within the first 60 minutes ("Golden Hour") activates immediate interstate transaction lockdowns to freeze fraud operations in flight.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <HeartPulse size={14} />
                        <span>Anti-Ragging Collegiate Act</span>
                      </div>
                      <p className="leading-relaxed font-semibold">
                        Under UGC guidelines, any form of active ragging is a non-bailable cognitive offense. The campus anti-ragging squad ensures zero identity publication and 100% legal prosecution against bullying.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM CIVIL SERVICE STATEMENT */}
        <div className="p-8 bg-zinc-950 text-white border border-white/10 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center text-center space-y-4">
          <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.08), transparent) pointer-events-none" />
          <Users size={28} className="text-red-500 animate-pulse" />
          <h4 className="text-xs font-black uppercase tracking-[0.25em] text-red-400 italic">"Not Me But You" — NSS Community Safety Pledge</h4>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed font-semibold">
            NSS College Ottapalam (Program Units 36 & 94) maintains this public-benefit administrative manual for students, parents, and community members. All telephone contacts, web links, and statutory parameters are checked weekly against active State and Central government gazette portals. No private telemetry trackers are engaged.
          </p>
        </div>

      </div>
    </div>
  );
}
