import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, EyeOff, Lock, Upload, Image as ImageIcon, Video, 
  Trash2, AlertTriangle, CheckCircle2, ChevronRight, HelpCircle, 
  Info, Sparkles, Phone, MessageSquare, AlertCircle, ArrowLeft,
  Search, FileText, CheckCircle, Clock, ShieldCheck, Eye, Settings,
  Flame, Coins, Frown, Home, Coffee, Droplet, Activity, BookOpen, 
  Compass, Globe, Zap, History, BarChart3, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebaseClient';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import BackButton from '../components/layout/BackButton';

// Pre-defined visual items for substance categories
const CATEGORIES = [
  { id: 'consumption', label: 'Consumption', desc: 'Usage or puffing on campus grounds', icon: Flame, color: 'text-orange-500 border-orange-500/20 bg-orange-500/5' },
  { id: 'dealing', label: 'Drug Dealing', desc: 'Active sales, distribution, or peddling', icon: Coins, color: 'text-rose-500 border-rose-500/20 bg-rose-500/5' },
  { id: 'possession', label: 'Contraband', desc: 'Possession or carrying sub-materials', icon: AlertTriangle, color: 'text-amber-500 border-amber-500/20 bg-amber-500/5' },
  { id: 'harassment', label: 'Peer Pressure', desc: 'Narcotic baiting or social bullying', icon: Frown, color: 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5' },
  { id: 'other', label: 'Other Activities', desc: 'Behavioral abuse or suspicious groups', icon: HelpCircle, color: 'text-slate-400 border-slate-700/50 bg-slate-800/10' }
];

// Pre-defined visual items for location territories
const LOCATIONS = [
  { id: 'hostel', label: 'Student Hostel', desc: 'Hostel blocks or surrounding lanes', icon: Home },
  { id: 'canteen', label: 'Cafeteria / Canteen', desc: 'Purity zones & dining areas', icon: Coffee },
  { id: 'washrooms', label: 'Restrooms', desc: 'Quiet corridor bathrooms', icon: Droplet },
  { id: 'grounds', label: 'Sports Grounds', desc: 'Playgrounds, parking or borders', icon: Activity },
  { id: 'classrooms', label: 'Academic Blocks', desc: 'Classrooms, library, or labs', icon: BookOpen },
  { id: 'off-campus', label: 'Off Campus Area', desc: 'Outer college neighborhood', icon: Compass },
  { id: 'other-town', label: 'Local Community', desc: 'General town surroundings', icon: Globe }
];

// Pre-defined visual items for timelines
const TIMELINES = [
  { id: 'active', label: 'Happening Now', desc: 'Critical/Active', icon: Zap, border: 'border-red-500/35 bg-red-950/10 text-red-400' },
  { id: 'recent', label: 'Recent (24 Hours)', desc: 'Fresh activity', icon: History, border: 'border-amber-500/35 bg-amber-950/10 text-amber-400' },
  { id: 'days', label: 'Within This Week', desc: 'Recurring schedule', icon: BarChart3, border: 'border-blue-500/35 bg-blue-950/10 text-blue-400' }
];

export default function DrugReport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'lodge' | 'track'>('lodge');
  
  // Lodging state variables
  const [loading, setLoading] = useState(false);
  const [successID, setSuccessID] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: '',
    location: '',
    specificLocation: '',
    details: '',
    timeline: '',
  });

  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Tracking state variables
  const [searchID, setSearchID] = useState('');
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Custom live analysis alert score
  const [riskAnalysis, setRiskAnalysis] = useState({
    level: 'Low',
    color: 'text-slate-400',
    bgColor: 'bg-slate-900 border-slate-800',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    message: 'Provide additional details below to see dynamic incident triage results.'
  });

  // Hot analysis weighting keywords
  useEffect(() => {
    const text = (formData.details + ' ' + formData.specificLocation).toLowerCase();
    let score = 0;
    
    if (formData.type === 'dealing' || text.includes('sell') || text.includes('dealer') || text.includes('peddler') || text.includes('distributing') || text.includes('traffic')) score += 4;
    if (text.includes('force') || text.includes('coerce') || text.includes('threat') || text.includes('weapon') || text.includes('abuse') || text.includes('assault')) score += 5;
    if (text.includes('injection') || text.includes('needle') || text.includes('cocaine') || text.includes('mdma') || text.includes('heroin') || text.includes('meth') || text.includes('powder') || text.includes('chemical')) score += 4;
    if (formData.timeline === 'active' || text.includes('now') || text.includes('currently') || text.includes('immediate') || text.includes('right now')) score += 3;
    if (formData.location === 'hostel' || text.includes('hostel') || text.includes('classroom') || text.includes('toilet') || text.includes('washroom')) score += 2;
    if (text.includes('many') || text.includes('group') || text.includes('gang') || text.includes('outsider')) score += 2;

    if (score >= 9) {
      setRiskAnalysis({
        level: 'Critical',
        color: 'text-red-500',
        bgColor: 'bg-red-950/20 border-red-500/20',
        badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30 font-black animate-pulse',
        message: 'CRITICAL HAZARD DETECTED: Report indicates substance sales, peer threats, or live dangers. Priority alert is flagged.'
      });
    } else if (score >= 5) {
      setRiskAnalysis({
        level: 'High',
        color: 'text-amber-500',
        bgColor: 'bg-amber-950/20 border-amber-500/20',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        message: 'HIGH ALERT LEVEL: Suspicion of distribution pattern or continuous on-campus compromise. Support units will triage.'
      });
    } else if (score >= 2 || formData.type) {
      setRiskAnalysis({
        level: 'Medium',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-950/20 border-indigo-500/20',
        badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        message: 'MODERATE URGENCY: Suspected isolated drug occurrence or peer pressure. Incident queued for routine examination.'
      });
    } else {
      setRiskAnalysis({
        level: 'Low',
        color: 'text-slate-400',
        bgColor: 'bg-slate-900 border-slate-800',
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
        message: 'AWAITING METRICS: Fill out details to generate a high-precision campus security estimate.'
      });
    }
  }, [formData.details, formData.type, formData.location, formData.timeline, formData.specificLocation]);

  // Handle files locally via reader base64 conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      alert("Attachment size is locked to 800 KB max limit to ensure immediate anonymous saving. Please compress the file and attach again.");
      return;
    }

    setFileName(file.name);
    setFileType(file.type.startsWith('video/') ? 'video' : 'image');
    setUploadProgress(10);

    const reader = new FileReader();
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 30;
      });
    }, 120);

    reader.onload = (ev) => {
      setFileBase64(ev.target?.result as string);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 400);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFileBase64(null);
    setFileName('');
    setFileType(null);
    setUploadProgress(null);
  };

  // Submit anonymous complaint to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.type) {
      setSubmitError("Please select the incident type categories above.");
      return;
    }
    if (!formData.location) {
      setSubmitError("Please specify the primary location area above.");
      return;
    }
    if (!formData.timeline) {
      setSubmitError("Please select the timeline urgency.");
      return;
    }
    if (!formData.details || formData.details.trim().length < 10) {
      setSubmitError("Please provide an incident description (at least 10 characters).");
      return;
    }

    setLoading(true);
    const reportRefId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
    const pathStr = `drug_reports/${reportRefId}`;

    try {
      const documentPayload = {
        id: reportRefId,
        type: formData.type,
        location: formData.location,
        specificLocation: formData.specificLocation,
        details: formData.details,
        timeline: formData.timeline,
        evidenceUrl: fileBase64 || '',
        evidenceType: fileType || '',
        status: 'Unread',
        created_at: new Date().toISOString(),
        adminComment: '',
        riskLevel: riskAnalysis.level
      };

      // Set directly to Firebase Firestore database path
      await setDoc(doc(db, 'drug_reports', reportRefId), documentPayload);

      setSuccessID(reportRefId);
      setFormData({
        type: '',
        location: '',
        specificLocation: '',
        details: '',
        timeline: '',
      });
      removeFile();
    } catch (err: any) {
      console.error("Firestore submission failed:", err);
      setSubmitError("Connection timed out. Please review network parameters and try again.");
      handleFirestoreError(err, OperationType.WRITE, pathStr);
    } finally {
      setLoading(false);
    }
  };

  // Tracking Complaint Look up function
  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackResult(null);

    const queryId = searchID.trim().toUpperCase();
    if (!queryId) {
      setTrackError("Please specify a report reference ID.");
      return;
    }

    setTrackLoading(true);
    const pathStr = `drug_reports/${queryId}`;
    try {
      const docRef = doc(db, 'drug_reports', queryId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        setTrackResult(snapshot.data());
      } else {
        setTrackError("No record found with this reference key. Please check spelling or case format.");
      }
    } catch (err) {
      console.error("Firestore query failed:", err);
      setTrackError("Unable to retrieve report database entries.");
      handleFirestoreError(err, OperationType.GET, pathStr);
    } finally {
      setTrackLoading(false);
    }
  };

  // Quick select clickers for visuals
  const setCategoryType = (typeId: string) => {
    setFormData(prev => ({ ...prev, type: typeId }));
  };

  const setLocationType = (locId: string) => {
    setFormData(prev => ({ ...prev, location: locId }));
  };

  const setTimelineType = (timeId: string) => {
    setFormData(prev => ({ ...prev, timeline: timeId }));
  };

  // Badge styles
  const getRiskLabelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'medium': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[300px] right-1/4 w-[500px] h-[500px] bg-amber-900/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Header Bar */}
      <div className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800" />
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 block">NSS College Ottapalam</span>
              <h1 className="text-sm font-black tracking-tight text-white uppercase sm:block hidden">Campus Sentinel Shield</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
            <Lock size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest leading-none">CONFIDENTIAL DEPLOYMENT</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left column info & beautiful guide cards */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-6">
          
          {/* Main Shield Widget */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-[2rem] p-6 text-center space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Shield size={36} className="text-amber-500" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Sentinel Hub</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-bold">
                Anti-Drug protective registry & student defense line.
              </p>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Report suspected drug consumption, substance trafficking, possession, or general coercion directly to campus coordinators. No registration required. Your safety is guaranteed.
            </p>

            <div className="border-t border-slate-800/80 pt-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">IP Identity</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase mt-1 block">Zero Logs</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">File Data</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase mt-1 block">Encrypted</span>
              </div>
            </div>
          </div>

          {/* Hotline contacts block */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <Phone size={14} className="text-amber-500" />
              <h3 className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Campus & National Helplines</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                <span className="text-[8px] uppercase font-black text-slate-500 block tracking-widest mb-1">State Vimukthi Care Line</span>
                <a href="tel:14408" className="text-base font-black text-amber-500 flex items-center gap-1.5 justify-center">
                  14408 <span className="text-xs font-bold text-slate-400">/ 1800-425-2853</span>
                </a>
              </div>
              
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                <span className="text-[8px] uppercase font-black text-slate-500 block tracking-widest mb-1">Campus Coordinator</span>
                <p className="text-xs font-black text-slate-200">Dr. Rajesh R.</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Principal PO (Unit 36 & 94)</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right column Form / Tracker Panel */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Gorgeous Navigation Tabs for Lodge vs Track */}
          <div className="bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850 flex items-center gap-2 max-w-md">
            <button
              onClick={() => setActiveTab('lodge')}
              className={`flex-1 h-11 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'lodge'
                  ? 'bg-gradient-to-r from-red-600/10 to-amber-600/10 border border-amber-505/30 text-amber-500 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <ShieldAlert size={14} />
              Lodge Complaint
            </button>
            
            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 h-11 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'track'
                  ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 text-blue-400 shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Search size={14} />
              Track Progress
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'lodge' ? (
              
              // LODGE COMPLAINT SECTION
              <motion.div
                key="lodge-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {successID ? (
                  
                  // SUCCESS FEEDBACK COMPONENT
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 text-center space-y-6"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 size={32} />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Report Logged Anonymously</h3>
                      <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                        Your submission has been securely written. Your anonymous identification token has been successfully generated.
                      </p>
                    </div>

                    <div className="bg-slate-950 rounded-2xl p-6 border border-slate-900 max-w-sm mx-auto space-y-2.5">
                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Your Private Tracking ID</span>
                      <div className="text-3xl font-mono font-black text-amber-500 tracking-wider">{successID}</div>
                      <p className="text-[10px] text-slate-400 tracking-normal pt-1 italic font-semibold">
                        Please save or copy this reference key. Use the "Track Progress" tab above to check for responses.
                      </p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => setSuccessID(null)}
                        className="h-11 px-6 bg-slate-100 hover:bg-white text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        Submit Another Report
                      </button>
                      <button
                        onClick={() => setActiveTab('track')}
                        className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        Track Status
                      </button>
                    </div>
                  </motion.div>

                ) : (

                  // LODGING ENTRY FORM
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-[2.5rem] p-6 md:p-8 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Lodge Anonymous Incident</h3>
                      <p className="text-slate-400 text-xs font-semibold">Fast-track secure reporting. No personal information is logged or requested.</p>
                    </div>

                    {submitError && (
                      <div className="p-4 bg-red-950/20 border border-red-500/25 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-3">
                        <AlertCircle size={16} className="text-red-400 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      
                      {/* Category Selection in small grid-pills */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Incident Category *
                          </label>
                          {formData.type && (
                            <span className="text-[10px] font-bold text-amber-500">
                              Selected: {CATEGORIES.find(c => c.id === formData.type)?.label}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {CATEGORIES.map((item) => {
                            const IconC = item.icon;
                            const isSelected = formData.type === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setCategoryType(item.id)}
                                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                                  isSelected 
                                    ? 'border-amber-500 ring-2 ring-amber-500/15 bg-amber-500/5 text-amber-400 font-extrabold shadow-sm' 
                                    : 'border-slate-800 bg-slate-950/30 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <div className={`p-1.5 rounded-lg border shrink-0 ${item.color}`}>
                                  <IconC size={14} />
                                </div>
                                <span className="text-[9.5px] font-bold uppercase tracking-tight leading-none">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Primary Location Selector using flexible compact tags */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Primary Campus Location *
                          </label>
                          {formData.location && (
                            <span className="text-[10px] font-bold text-amber-500">
                              Selected: {LOCATIONS.find(l => l.id === formData.location)?.label}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {LOCATIONS.map((loc) => {
                            const isSelected = formData.location === loc.id;
                            return (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => setLocationType(loc.id)}
                                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                                  isSelected 
                                    ? 'border-amber-500 bg-amber-500/5 text-amber-400 font-extrabold ring-1 ring-amber-500/15 shadow-sm' 
                                    : 'border-slate-800 bg-slate-950/30 hover:bg-slate-900/40 text-slate-400 hover:text-slate-250'
                                }`}
                              >
                                <loc.icon size={13} className={isSelected ? 'text-amber-400' : 'text-slate-500'} />
                                <span className="text-[9.5px] font-bold uppercase tracking-wide leading-none">{loc.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Specific Location Details & Timeline in a neat 2-Column Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Timeline Urgency *
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {TIMELINES.map((time) => {
                              const isSelected = formData.timeline === time.id;
                              return (
                                <button
                                  key={time.id}
                                  type="button"
                                  onClick={() => setTimelineType(time.id)}
                                  className={`h-10 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    isSelected 
                                      ? time.border + ' ring-1 ring-amber-500/10 font-bold'
                                      : 'border-slate-800 bg-slate-950/20 hover:bg-slate-900/30 text-slate-400 text-xs'
                                  }`}
                                >
                                  <span className="text-[9.5px] font-semibold uppercase tracking-wider leading-tight px-1">{time.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Specific Location (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. toilet behind Block C, Room 302"
                            value={formData.specificLocation}
                            onChange={e => setFormData({ ...formData, specificLocation: e.target.value })}
                            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-semibold placeholder:text-slate-650 text-slate-200 outline-none focus:border-amber-500/70 transition-all font-sans"
                          />
                        </div>
                      </div>

                      {/* Description & Dynamic Security Estimate side-by-side */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Actionable Details *
                          </label>
                          <textarea
                            required
                            placeholder="Describe the incident. Specify schedules, suspicious behaviors or groups. Do NOT mention any personal names or details."
                            rows={3}
                            value={formData.details}
                            onChange={e => setFormData({ ...formData, details: e.target.value })}
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold placeholder:text-slate-650 text-slate-200 outline-none focus:border-amber-500/70 transition-all resize-none leading-relaxed font-sans"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Urgency Triage Estimate
                          </label>
                          <div className={`p-3 rounded-xl border transition-all duration-300 ${riskAnalysis.bgColor} flex flex-col justify-between h-[82px]`}>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Triage Level</span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border leading-none ${riskAnalysis.badgeColor}`}>
                                {riskAnalysis.level}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-slate-350 font-bold leading-normal line-clamp-2">
                              {riskAnalysis.message}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Step F: Compact Media Attachment */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                          Media Attachment (Optional)
                        </label>
                        
                        <div className="relative border border-dashed border-slate-800 rounded-xl px-4 py-2.5 bg-slate-950/20 hover:border-slate-700 transition-all flex items-center justify-between">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={loading}
                          />
                          
                          {fileBase64 ? (
                            <div className="w-full flex items-center justify-between gap-3 relative z-10">
                              <div className="flex items-center gap-2.5">
                                {fileType === 'video' ? <Video size={15} className="text-amber-500" /> : <ImageIcon size={15} className="text-amber-500" />}
                                <div className="text-left">
                                  <div className="text-xs font-black text-white max-w-[200px] sm:max-w-[400px] truncate">{fileName}</div>
                                  <div className="text-[9px] text-slate-500 uppercase font-bold">{fileType === 'video' ? 'Video' : 'Image'}</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={removeFile}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                              >
                                <Trash2 size={10} /> Clear
                              </button>
                            </div>
                          ) : (
                            <div className="w-full flex items-center justify-between pointer-events-none">
                              <div className="flex items-center gap-2.5">
                                <Upload size={14} className="text-slate-500" />
                                <div className="text-left">
                                  <p className="text-xs font-bold text-slate-300">Add supporting photos / brief video clip</p>
                                  <p className="text-[8.5px] text-slate-500 uppercase tracking-wider mt-0.5">JPEG, PNG, MP4 under 800 KB</p>
                                </div>
                              </div>
                              <span className="text-[8.5px] font-extrabold uppercase px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg">Browse</span>
                            </div>
                          )}

                          {uploadProgress !== null && (
                            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-slate-950 rounded-b-xl flex items-center justify-between border-t border-slate-900">
                              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                              </div>
                              <span className="text-[8px] font-mono text-slate-400 ml-4 shrink-0">{uploadProgress}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer outline-none"
                      >
                        {loading ? (
                          <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <>
                            <ShieldAlert size={14} />
                            Dispatch Anonymous Case
                          </>
                        )}
                      </button>

                    </form>
                  </div>
                )}
              </motion.div>

            ) : (
              
              // TRACK COMPLAINT SECTION
              <motion.div
                key="track-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Search Header Container */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-[2rem] p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">2. Lookup Incident Reference</h3>
                    <p className="text-slate-400 text-xs">Enter your unlogged reference code to securely pull real-time resolution status updates.</p>
                  </div>

                  <form onSubmit={handleTrackSearch} className="flex gap-3 items-stretch">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Type Reference Key (e.g. REP-209481)"
                        value={searchID}
                        onChange={e => setSearchID(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 placeholder:text-slate-650 outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={trackLoading}
                      className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      {trackLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      ) : 'Look Up'}
                    </button>
                  </form>

                  {trackError && (
                    <div className="p-4 bg-red-950/20 border border-red-500/25 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-3">
                      <AlertCircle size={15} className="text-red-400 shrink-0" />
                      <span>{trackError}</span>
                    </div>
                  )}
                </div>

                {/* Tracking Progress Node Graph */}
                {trackResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 md:p-8 space-y-6 text-left"
                  >
                    {/* Status Header summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Active Case File</span>
                        <div className="text-xl font-bold font-mono text-white tracking-widest">{trackResult.id}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-500">Urgency:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getRiskLabelColor(trackResult.riskLevel)}`}>
                          {trackResult.riskLevel || 'Low'}
                        </span>
                      </div>
                    </div>

                    {/* Miniature verification parameters */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                        <span className="text-[8px] uppercase font-black text-slate-500 block mb-0.5">Classification</span>
                        <span className="text-[10px] font-black text-slate-200 uppercase">{trackResult.type}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                        <span className="text-[8px] uppercase font-black text-slate-500 block mb-0.5">Core Location</span>
                        <span className="text-[10px] font-black text-slate-200 uppercase">{trackResult.location}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 col-span-2 sm:col-span-1">
                        <span className="text-[8px] uppercase font-black text-slate-500 block mb-0.5">Timeline</span>
                        <span className="text-[10px] font-black text-slate-200 uppercase">{trackResult.timeline}</span>
                      </div>
                    </div>

                    {/* Progress Timeline Nodes */}
                    <div className="space-y-5 pt-2">
                      <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Vetting Status Roadmap</h4>
                      
                      <div className="relative border-l border-slate-800 pl-6 ml-3.5 space-y-8">
                        
                        {/* Node 1: Logged */}
                        <div className="relative">
                          <span className="absolute -left-[31px] top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center shadow-lg" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 leading-none">
                              Step 1: Submitted Confidentially
                            </span>
                            <p className="text-[11px] text-slate-400 font-semibold pt-0.5">
                              Incident written safely into secure firestore logs. Awaiting triage.
                            </p>
                          </div>
                        </div>

                        {/* Node 2: Administrative Review */}
                        <div className="relative">
                          {trackResult.status === 'Resolved' || trackResult.status === 'Investigating' ? (
                            <span className="absolute -left-[31px] top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950 shadow-md" />
                          ) : (
                            <span className="absolute -left-[31px] top-0 w-4 h-4 bg-slate-800 rounded-full border-4 border-slate-950" />
                          )}
                          <div className="space-y-0.5">
                            <span className={`text-[10px] font-black uppercase tracking-wider leading-none flex items-center gap-1.5 ${
                              trackResult.status === 'Resolved' || trackResult.status === 'Investigating'
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                            }`}>
                              Step 2: Administrative Assessment
                            </span>
                            <p className="text-[11px] text-slate-400 font-medium pt-0.5">
                              {trackResult.status === 'Resolved' 
                                ? 'Vetting assessment finished. Campus coordinators examined parameters.'
                                : trackResult.status === 'Investigating' 
                                  ? 'Active review. Coordinators and program officers are evaluating details.'
                                  : 'Queued to undergo triage and local spot examination.'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Node 3: Support Action Taken */}
                        <div className="relative">
                          {trackResult.status === 'Resolved' ? (
                            <span className="absolute -left-[31px] top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950 shadow-md" />
                          ) : (
                            <span className="absolute -left-[31px] top-0 w-4 h-4 bg-slate-800 rounded-full border-4 border-slate-950" />
                          )}
                          <div className="space-y-0.5 animate-fade-in">
                            <span className={`text-[10px] font-black uppercase tracking-wider leading-none ${
                              trackResult.status === 'Resolved' ? 'text-emerald-400 font-black' : 'text-slate-500'
                            }`}>
                              Step 3: Outcome Conclusions
                            </span>
                            
                            {trackResult.status === 'Resolved' ? (
                              <div className="bg-emerald-950/15 border border-emerald-500/15 rounded-xl p-4 mt-2.5 space-y-1.5">
                                <span className="text-[8.5px] font-black uppercase tracking-widest text-[#10B981] flex items-center gap-1">
                                  <ShieldCheck size={11} /> Resolution Notes:
                                </span>
                                <p className="text-xs font-bold text-slate-200 leading-relaxed italic">
                                  "{trackResult.adminComment || 'Anti-drug support units deployed campus patrolling and monitoring updates. Case resolved.'}"
                                </p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                                Support action summaries will become visible here upon case completion.
                              </p>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                  </motion.div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 bg-slate-950 text-center relative z-10 text-xs text-slate-650 select-none">
        <p className="font-extrabold uppercase tracking-[0.25em] text-slate-500 mb-1">NSS College Ottapalam - Units 36 & 94</p>
        <p className="font-semibold text-slate-600">Anti-Drug Protective & Awareness Cell</p>
      </footer>

    </div>
  );
}
