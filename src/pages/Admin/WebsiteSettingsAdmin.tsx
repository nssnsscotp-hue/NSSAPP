import React, { useState, useEffect } from 'react';
import { 
  Save, Loader2, ShieldCheck, Upload, AlertTriangle, RefreshCw, 
  Settings, User, HelpCircle, Image as ImageIcon, Sparkles, Globe, 
  MapPin, CheckCircle, CheckCircle2, ChevronRight, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebaseClient';
import firebaseConfig from '../../../firebase-applet-config.json';

// Initialize Firebase Storage
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

interface TeamMember {
  name: string;
  role: string;
  dept: string;
  image: string;
}

interface WebsiteConfig {
  principal: TeamMember;
  po36: TeamMember;
  po94: TeamMember;
  heroTitle: string;
  heroSubText: string;
  heroDesc: string;
  heroImage: string;
  tickerText: string;
  collegeName: string;
  unitsText: string;
  countdownActive?: boolean;
  countdownTitle?: string;
  countdownTarget?: string;
  countdownDescription?: string;
  countdownLocation?: string;
  countdownEventLink?: string;
}

const DEFAULT_SETTINGS: WebsiteConfig = {
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

export default function WebsiteSettingsAdmin() {
  const [config, setConfig] = useState<WebsiteConfig>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Separate upload state trackers for individual assets
  const [uploadState, setUploadState] = useState<{
    [key: string]: { progress: number; uploading: boolean; error: string | null }
  }>({
    principal: { progress: 0, uploading: false, error: null },
    po36: { progress: 0, uploading: false, error: null },
    po94: { progress: 0, uploading: false, error: null },
    heroImage: { progress: 0, uploading: false, error: null }
  });

  // Pull existing configuration from database settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Load from localStorage as an immediate fallback or parallel reference
      const cached = localStorage.getItem('website_config_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setConfig(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.warn("Could not parse cached website settings.");
        }
      }

      const settingsDocRef = doc(db, 'website_config', 'settings');
      const snap = await getDoc(settingsDocRef);
      if (snap.exists()) {
        const dbData = snap.data() as Partial<WebsiteConfig>;
        
        // Merge with defaults to ensure complete fields
        const merged: WebsiteConfig = {
          principal: { ...DEFAULT_SETTINGS.principal, ...(dbData.principal || {}) },
          po36: { ...DEFAULT_SETTINGS.po36, ...(dbData.po36 || {}) },
          po94: { ...DEFAULT_SETTINGS.po94, ...(dbData.po94 || {}) },
          heroTitle: dbData.heroTitle || DEFAULT_SETTINGS.heroTitle,
          heroSubText: dbData.heroSubText || DEFAULT_SETTINGS.heroSubText,
          heroDesc: dbData.heroDesc || DEFAULT_SETTINGS.heroDesc,
          heroImage: dbData.heroImage || DEFAULT_SETTINGS.heroImage,
          tickerText: dbData.tickerText || DEFAULT_SETTINGS.tickerText,
          collegeName: dbData.collegeName || DEFAULT_SETTINGS.collegeName,
          unitsText: dbData.unitsText || DEFAULT_SETTINGS.unitsText,
          countdownActive: dbData.countdownActive !== undefined ? dbData.countdownActive : DEFAULT_SETTINGS.countdownActive,
          countdownTitle: dbData.countdownTitle !== undefined ? dbData.countdownTitle : DEFAULT_SETTINGS.countdownTitle,
          countdownTarget: dbData.countdownTarget !== undefined ? dbData.countdownTarget : DEFAULT_SETTINGS.countdownTarget,
          countdownDescription: dbData.countdownDescription !== undefined ? dbData.countdownDescription : DEFAULT_SETTINGS.countdownDescription,
          countdownLocation: dbData.countdownLocation !== undefined ? dbData.countdownLocation : DEFAULT_SETTINGS.countdownLocation,
          countdownEventLink: dbData.countdownEventLink !== undefined ? dbData.countdownEventLink : DEFAULT_SETTINGS.countdownEventLink
        };
        setConfig(merged);
        localStorage.setItem('website_config_settings', JSON.stringify(merged));
      }
    } catch (err: any) {
      console.warn("Fell back to local presets. Firestore syncing status: ", err.message);
      // We do not set status error state so the user is not blocked by permissions or offline states.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle local state updates
  const handleFieldChange = (section: keyof WebsiteConfig, field: string, value: string) => {
    setConfig(prev => {
      const copy = { ...prev };
      if (section === 'principal' || section === 'po36' || section === 'po94') {
        copy[section] = { ...copy[section], [field]: value };
      } else {
        (copy as any)[section] = value;
      }
      return copy;
    });
  };

  // Convert files to Base64 in case of Firebase Storage upload failures
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Safe file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        [targetKey]: { progress: 0, uploading: false, error: "Image file exceeds 5MB limit." }
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      [targetKey]: { progress: 0, uploading: true, error: null }
    }));

    try {
      // 1. Attempt to upload bytes to Firebase Storage
      const storageRef = ref(storage, `website_config/${targetKey}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadState(prev => ({
            ...prev,
            [targetKey]: { ...prev[targetKey], progress }
          }));
        },
        async (error) => {
          console.warn("Firebase Storage blocked, using robust Base64 local synchronization:", error);
          // 2. Fallback to base64 encoding to support inline media datastores
          const base64Str = await convertToBase64(file);
          
          setConfig(prev => {
            const next = { ...prev };
            if (targetKey === 'heroImage') {
              next.heroImage = base64Str;
            } else if (targetKey === 'principal' || targetKey === 'po36' || targetKey === 'po94') {
              next[targetKey] = { ...next[targetKey], image: base64Str };
            }
            // Save immediately to local storage on select/upload
            localStorage.setItem('website_config_settings', JSON.stringify(next));
            return next;
          });

          setUploadState(prev => ({
            ...prev,
            [targetKey]: { progress: 100, uploading: false, error: null }
          }));
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setConfig(prev => {
            const next = { ...prev };
            if (targetKey === 'heroImage') {
              next.heroImage = downloadUrl;
            } else if (targetKey === 'principal' || targetKey === 'po36' || targetKey === 'po94') {
              next[targetKey] = { ...next[targetKey], image: downloadUrl };
            }
            // Save immediately to local storage on select/upload
            localStorage.setItem('website_config_settings', JSON.stringify(next));
            return next;
          });

          setUploadState(prev => ({
            ...prev,
            [targetKey]: { progress: 100, uploading: false, error: null }
          }));
        }
      );
    } catch (err: any) {
      console.error("Critical upload processing failure:", err);
      setUploadState(prev => ({
        ...prev,
        [targetKey]: { progress: 0, uploading: false, error: err.message }
      }));
    }
  };

  // Submit and save configuration settings directly to Firestore
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // Save to localStorage immediately
    localStorage.setItem('website_config_settings', JSON.stringify(config));

    try {
      const settingsDocRef = doc(db, 'website_config', 'settings');
      await setDoc(settingsDocRef, {
        ...config,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setStatus({ type: 'success', message: 'Website parts and leadership information updated successfully!' });
      
      // Dispatch custom event to trigger reload across active screens
      window.dispatchEvent(new Event('website-settings-updated'));
    } catch (err: any) {
      console.warn("Firebase Storage/Firestore update restricted, saved configuration locally:", err);
      setStatus({ 
        type: 'success', 
        message: 'Saved changes locally! (Online sync paused: ' + err.message + ')' 
      });
      // Still dispatch reload event so local screens reflect updates
      window.dispatchEvent(new Event('website-settings-updated'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
        <p className="text-slate-500 font-extrabold uppercase tracking-widest text-xs animate-pulse">
          Retrieving Site Configuration Layout...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full mb-3">
          <Settings size={13} />
          <span className="text-[10px] font-black uppercase tracking-wider">Visual Customizer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase">
          Dynamic Website Control Center
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete authority and control to override the homescreen principal photo, program officers' names/portraits, and other editable sections.
        </p>
      </header>

      {status && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
          status.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle2 className="shrink-0 text-emerald-600" size={18} />
          ) : (
            <AlertTriangle className="shrink-0 text-rose-600" size={18} />
          )}
          <span className="text-xs font-bold uppercase tracking-wide">{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-12">
        {/* SECTION 1: Leadership Team (Principal & Program Officers) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <User className="text-blue-600" size={18} />
              1. Institutional Leadership Team
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Modify names, roles, departmental details, and change photos for the homescreen staff directory.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Card A: Principal */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/60 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  Head of College
                </span>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
                    <img 
                      src={config.principal.image} 
                      alt="Principal Preview" 
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">College Principal Settings</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                    <input 
                      type="text"
                      value={config.principal.name}
                      onChange={(e) => handleFieldChange('principal', 'name', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Designated Role Text</label>
                    <input 
                      type="text"
                      value={config.principal.role}
                      onChange={(e) => handleFieldChange('principal', 'role', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Department / Meta Details</label>
                    <input 
                      type="text"
                      value={config.principal.dept}
                      onChange={(e) => handleFieldChange('principal', 'dept', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Photo Upload / Custom Image URL</label>
                    <div className="space-y-2">
                      <input 
                        type="text"
                        value={config.principal.image}
                        onChange={(e) => handleFieldChange('principal', 'image', e.target.value)}
                        placeholder="Image Direct HTTP Link"
                        className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold text-slate-700 font-mono"
                      />
                      <label className="w-full h-10 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white transition hover:bg-slate-50">
                        <Upload size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-wide text-blue-650">
                          {uploadState.principal.uploading ? `Uploading... ${uploadState.principal.progress}%` : "Upload Portrait File"}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'principal')} 
                          disabled={uploadState.principal.uploading}
                        />
                      </label>
                      {uploadState.principal.error && (
                        <p className="text-[10px] text-red-500 font-bold mt-1">{uploadState.principal.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Program Officer Unit 36 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/60 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                  Unit 36 Officer
                </span>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
                    <img 
                      src={config.po36.image} 
                      alt="PO 36 Preview" 
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Unit 36 Program Officer Settings</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                    <input 
                      type="text"
                      value={config.po36.name}
                      onChange={(e) => handleFieldChange('po36', 'name', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-orange-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Designated Role Text</label>
                    <input 
                      type="text"
                      value={config.po36.role}
                      onChange={(e) => handleFieldChange('po36', 'role', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-orange-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Department / Meta Details</label>
                    <input 
                      type="text"
                      value={config.po36.dept}
                      onChange={(e) => handleFieldChange('po36', 'dept', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-orange-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Photo Upload / Custom Image URL</label>
                    <div className="space-y-2">
                      <input 
                        type="text"
                        value={config.po36.image}
                        onChange={(e) => handleFieldChange('po36', 'image', e.target.value)}
                        placeholder="Image Direct HTTP Link"
                        className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-orange-600 text-xs font-semibold text-slate-700 font-mono"
                      />
                      <label className="w-full h-10 border border-dashed border-orange-255 hover:border-orange-400 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white transition hover:bg-slate-50">
                        <Upload size={14} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-wide text-orange-600">
                          {uploadState.po36.uploading ? `Uploading... ${uploadState.po36.progress}%` : "Upload Portrait File"}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'po36')} 
                          disabled={uploadState.po36.uploading}
                        />
                      </label>
                      {uploadState.po36.error && (
                        <p className="text-[10px] text-red-500 font-bold mt-1">{uploadState.po36.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card C: Program Officer Unit 94 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/60 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-rose-100 text-rose-700">
                  Unit 94 Officer
                </span>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
                    <img 
                      src={config.po94.image} 
                      alt="PO 94 Preview" 
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Unit 94 Program Officer Settings</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                    <input 
                      type="text"
                      value={config.po94.name}
                      onChange={(e) => handleFieldChange('po94', 'name', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-rose-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Designated Role Text</label>
                    <input 
                      type="text"
                      value={config.po94.role}
                      onChange={(e) => handleFieldChange('po94', 'role', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-rose-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Department / Meta Details</label>
                    <input 
                      type="text"
                      value={config.po94.dept}
                      onChange={(e) => handleFieldChange('po94', 'dept', e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-rose-600 text-xs font-extrabold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Photo Upload / Custom Image URL</label>
                    <div className="space-y-2">
                      <input 
                        type="text"
                        value={config.po94.image}
                        onChange={(e) => handleFieldChange('po94', 'image', e.target.value)}
                        placeholder="Image Direct HTTP Link"
                        className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-rose-600 text-xs font-semibold text-slate-700 font-mono"
                      />
                      <label className="w-full h-10 border border-dashed border-rose-200 hover:border-rose-400 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white transition hover:bg-slate-50">
                        <Upload size={14} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-wide text-rose-600">
                          {uploadState.po94.uploading ? `Uploading... ${uploadState.po94.progress}%` : "Upload Portrait File"}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'po94')} 
                          disabled={uploadState.po94.uploading}
                        />
                      </label>
                      {uploadState.po94.error && (
                        <p className="text-[10px] text-red-500 font-bold mt-1">{uploadState.po94.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: General Homepage Layout Parts (Hero & Marquee) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Globe className="text-blue-600" size={18} />
              2. Website Layout Content Parts
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Give full control and access to alter titles, custom slogan lines, and banner headers in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Main College Title</label>
              <input 
                type="text"
                value={config.collegeName}
                onChange={(e) => handleFieldChange('collegeName', '', e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Programme Units Text</label>
              <input 
                type="text"
                value={config.unitsText}
                onChange={(e) => handleFieldChange('unitsText', '', e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Home Hero Badge / Slogan Hint</label>
              <input 
                type="text"
                value={config.heroSubText}
                onChange={(e) => handleFieldChange('heroSubText', '', e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Main Hero Slogan Title</label>
              <input 
                type="text"
                value={config.heroTitle}
                onChange={(e) => handleFieldChange('heroTitle', '', e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Main Slogan Brief Paragraph</label>
              <textarea 
                rows={3}
                value={config.heroDesc}
                onChange={(e) => handleFieldChange('heroDesc', '', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700 leading-relaxed"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Welcome Notice Marquee Banner Text</label>
              <textarea 
                rows={3}
                value={config.tickerText}
                onChange={(e) => handleFieldChange('tickerText', '', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700 leading-relaxed"
              />
            </div>

            {/* Banner Image Customizer */}
            <div className="space-y-4 md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Panoramic College Banner image</h4>
                  <p className="text-[10px] text-slate-400">Display background banner for the homepage portal header.</p>
                </div>
                {config.heroImage && (
                  <div className="relative w-32 h-14 rounded-lg overflow-hidden border border-slate-200">
                    <img src={config.heroImage} className="w-full h-full object-cover" alt="Banner Preview" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input 
                  type="text"
                  value={config.heroImage}
                  onChange={(e) => handleFieldChange('heroImage', '', e.target.value)}
                  placeholder="Insert image HTTP URL"
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold font-mono text-slate-700"
                />
                <label className="w-full h-10 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white transition hover:bg-slate-50">
                  <Upload size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-wide text-blue-650">
                    {uploadState.heroImage.uploading ? `Uploading... ${uploadState.heroImage.progress}%` : "Upload Custom Banner File"}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'heroImage')} 
                    disabled={uploadState.heroImage.uploading}
                  />
                </label>
                {uploadState.heroImage.error && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">{uploadState.heroImage.error}</p>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: NSS General Countdown Timer Settings */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <RefreshCw className="text-indigo-600 animate-[spin_10s_linear_infinite]" size={18} />
              3. NSS General Countdown Timer Settings
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Enable an interactive real-time countdown banner on the homescreen volunteer dashboard for important upcoming camps, meetings, or training sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Countdown Active Status Toggle */}
            <div className="space-y-4 md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Display Countdown Timer Banner</h4>
                <p className="text-[10px] text-slate-400">Specify whether the active timer should be rendered on the volunteer dashboard.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={!!config.countdownActive} 
                  onChange={(e) => setConfig(prev => ({ ...prev, countdownActive: e.target.checked }))}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-xs font-black uppercase tracking-widest text-slate-600">
                  {config.countdownActive ? "ACTIVE ON HOME PORTAL" : "DISABLED"}
                </span>
              </label>
            </div>

            {/* Countdown Event Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Scheduled Event / Meeting Title</label>
              <input 
                type="text"
                value={config.countdownTitle || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, countdownTitle: e.target.value }))}
                placeholder="e.g., General Executive Committee Meeting"
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
              />
            </div>

            {/* Countdown Target Date/Time */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Date & Time (Local / Indian Standard Time)</label>
              <input 
                type="datetime-local"
                value={config.countdownTarget || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, countdownTarget: e.target.value }))}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
              />
            </div>

            {/* Countdown Event Location / Venue */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meeting / Camp Venue Location</label>
              <input 
                type="text"
                value={config.countdownLocation || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, countdownLocation: e.target.value }))}
                placeholder="e.g., Seminar Hall, Left Block / Teams Meet"
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700"
              />
            </div>

            {/* Optional Registration or Live Link */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Action Call Resource Link (Optional)</label>
              <input 
                type="text"
                value={config.countdownEventLink || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, countdownEventLink: e.target.value }))}
                placeholder="e.g., https://forms.gle/xyz / Meeting Link"
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold text-slate-705 font-mono"
              />
            </div>

            {/* Brief Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Brief Event / Agenda Description</label>
              <textarea 
                rows={3}
                value={config.countdownDescription || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, countdownDescription: e.target.value }))}
                placeholder="Provide a sentence detailing the upcoming meeting requirements or directives."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-blue-600 text-xs font-extrabold text-slate-700 leading-relaxed"
              />
            </div>

          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-initial h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/10 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Save size={15} />
            )}
            <span>Save Customization Settings</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset layout controls back to college fallback presets?")) {
                setConfig(DEFAULT_SETTINGS);
                setStatus({ type: 'success', message: 'Restored local default layouts screen catalog.' });
              }
            }}
            className="h-14 px-6 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Reset presets</span>
          </button>
        </div>
      </form>
    </div>
  );
}
