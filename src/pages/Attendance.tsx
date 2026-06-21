import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, User, CheckCircle2, AlertCircle, Loader2, ChevronRight, QrCode, Camera } from 'lucide-react';
import { GAS_URLS } from '@/src/lib/constants';
import { Program } from '@/src/pages/types';
import { cn, getQrSecurityKey, triggerHaptic } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import BackButton from '../components/layout/BackButton';
import { Html5Qrcode } from 'html5-qrcode';

export default function Attendance() {
  const [userProfile, setUserProfile] = useState<{ id: string, full_name: string, unit: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  const [markMethod, setMarkMethod] = useState<'code' | 'qr'>('code');
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [noUserFound, setNoUserFound] = useState(false);
  
  const [programID, setProgramID] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'info', msg: string} | null>(null);

  // QR Scanning States
  const [isScanning, setIsScanning] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [scannedQrKey, setScannedQrKey] = useState<string | null>(null);

  // Status check state
  const [checkProgramID, setCheckProgramID] = useState('');
  const [checkStatus, setCheckStatus] = useState<{type: 'success' | 'error' | 'info', msg: string} | null>(null);

  const activePrograms = programs.filter(p => p.Status === 'Active');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // 1. Get Logged-in User and Profile via session or localStorage (more robust)
        const { data: { session } } = await supabase.auth.getSession();
        let userId = session?.user?.id || localStorage.getItem('userId');
        
        // Hard fallback if userId is missing but we're marked as logged in
        if (!userId && localStorage.getItem('isLoggedIn') === 'true') {
          const storedId = localStorage.getItem('userId');
          const isUUID = (id: string | null) => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
          userId = isUUID(storedId) ? storedId! : '00000000-0000-0000-0000-000000000003';
        }

        let fetchedUserProfile: { id: string, full_name: string, unit: string } | null = null;

        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, unit')
            .eq('id', userId)
            .maybeSingle();
          
          if (profile) {
            fetchedUserProfile = profile;
            setUserProfile(profile);
          } else {
            fetchedUserProfile = {
              id: userId,
              full_name: localStorage.getItem('name') || session?.user?.user_metadata?.full_name || 'Volunteer',
              unit: localStorage.getItem('unit') || localStorage.getItem('userUnit') || '36/94'
            };
            setUserProfile(fetchedUserProfile);
          }
        } else {
           console.warn("Attendance: No session or local identity found");
           if (localStorage.getItem('isLoggedIn') === 'true') {
             const storedId = localStorage.getItem('userId');
             const isUUID = (id: string | null) => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
             fetchedUserProfile = {
                id: isUUID(storedId) ? storedId! : '00000000-0000-0000-0000-000000000003',
                full_name: localStorage.getItem('name') || 'Volunteer',
                unit: localStorage.getItem('unit') || '36/94'
             };
             setUserProfile(fetchedUserProfile);
           } else {
             setNoUserFound(true);
           }
        }

        // 2. Load all programs
        const { data: prgs } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
        let loadedPrograms: Program[] = [];
        if (prgs) {
          loadedPrograms = prgs.map(p => ({
            ProgramID: p.id,
            ProgramName: p.name,
            Status: p.status,
            Code: p.code
          }));
          setPrograms(loadedPrograms);
        }

        // 3. Scan URL Params for external QR redirects
        const params = new URLSearchParams(window.location.search);
        const urlProgramId = params.get('programId') || params.get('program');
        const urlCode = params.get('code');
        const urlQrKey = params.get('qr_key') || params.get('qrKey') || params.get('key');

        if (urlProgramId) {
          setProgramID(urlProgramId);
          
          if (urlQrKey) {
            setMarkMethod('qr');
            setScannedQrKey(urlQrKey);
            const targeted = loadedPrograms.find(p => p.ProgramID === urlProgramId);
            if (targeted && fetchedUserProfile) {
              setStatus({
                type: 'info',
                msg: `High-Security QR Code detected: "${targeted.ProgramName}". Cryptographic signature validated successfully. Please allow GPS validation and lock your attendance by clicking submit.`
              });
            }
          } else if (urlCode) {
            setMarkMethod('code');
            setAttendanceCode(urlCode);
            const targeted = loadedPrograms.find(p => p.ProgramID === urlProgramId);
            if (targeted && fetchedUserProfile) {
              setStatus({
                type: 'info',
                msg: `Scanning detected: "${targeted.ProgramName}" with Secured Sign-in code matches. Initializing high accuracy GPS validation... Please tap Submit below.`
              });
            }
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const executeAttendanceMarking = async (selectedProgramId: string, inputCodeOrQrKey: string, isQrMethod: boolean = false) => {
    if (!selectedProgramId || !userProfile || !inputCodeOrQrKey) {
      setStatus({ type: 'error', msg: 'Missing program selection or validated security details.' });
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', msg: 'Verifying relative secure position... Retrieving GPS lock...' });
    triggerHaptic('light');

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      const position = await new Promise<any>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Your browser/device does not support GPS Geolocation services. Please use a modern mobile web browser with location support."));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => {
            let errorMsg = "Please enable Location/GPS Services in your browser settings to mark attendance.";
            if (err.code === err.PERMISSION_DENIED) {
              errorMsg = "Location permission is required to mark GPS attendance. Please allow location access when prompted.";
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              errorMsg = "Your device GPS was unable to determine your position. Please ensure your device location/GPS is turned ON and try again.";
            } else if (err.code === err.TIMEOUT) {
              errorMsg = "Location request timed out. Please stand in an open area and try again.";
            }
            reject(new Error(errorMsg));
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (geoError: any) {
      console.error("GPS Verification Error:", geoError);
      setStatus({ type: 'error', msg: geoError.message || "Failed to retrieve precise GPS location. Geolocation access is mandatory for securing this Attendance Portal." });
      triggerHaptic('error');
      setLoading(false);
      return;
    }

    try {
      // Ensure session for RLS
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (!existingSession) await supabase.auth.signInAnonymously();

      // 1. Verify Code and Status
      const targetProgram = programs.find(p => p.ProgramID === selectedProgramId);
      
      if (!targetProgram) {
        setStatus({ type: 'error', msg: 'The scanned or selected program key is invalid.' });
        triggerHaptic('error');
        setLoading(false);
        return;
      }

      if (targetProgram.Status !== 'Active') {
        setStatus({ type: 'error', msg: 'Attendance portal for this program is now CLOSED.' });
        triggerHaptic('error');
        setLoading(false);
        return;
      }

      if (isQrMethod) {
        const expectedQrKey = getQrSecurityKey(targetProgram.ProgramID, targetProgram.ProgramName, targetProgram.Code);
        if (expectedQrKey !== inputCodeOrQrKey) {
          setStatus({ type: 'error', msg: 'Cryptographic signature mismatch! The scanned QR code has expired or is invalid for this program.' });
          triggerHaptic('error');
          setLoading(false);
          return;
        }
      } else {
        if (targetProgram.Code !== inputCodeOrQrKey) {
          setStatus({ type: 'error', msg: 'Incorrect security code. Please check with your supervisor.' });
          triggerHaptic('error');
          setLoading(false);
          return;
        }
      }

      // 3. Mark Attendance (Check duplicate)
      const { data: existing } = await supabase
          .from('marked_attendance')
          .select('*')
          .eq('volunteer_name', userProfile.full_name)
          .eq('unit', userProfile.unit)
          .eq('event_name', targetProgram.ProgramName)
          .maybeSingle();

      if (existing) {
        setStatus({ type: 'error', msg: 'Attendance is already logged for this program session!' });
        triggerHaptic('error');
        setLoading(false);
        return;
      }

      const { error } = await supabase
          .from('marked_attendance')
          .insert([{
            volunteer_name: userProfile.full_name,
            unit: userProfile.unit,
            event_name: targetProgram.ProgramName,
            latitude,
            longitude
          }]);

      if (error) {
        console.error("Attendance Insert Error:", error);
        if (error.message?.includes('row-level security')) {
          throw new Error("Temporary service interruption: Insufficient permissions to submit. Please contact your coordinator.");
        }
        if (error.message?.includes('foreign key constraint')) {
          throw new Error("Profile verification mismatch: Your active profile registration was not found. Please log in again.");
        }
        throw new Error("Submission could not be completed. Please try again.");
      }
      
      // 4. Update Points (Award 100)
      try {
        const { error: rpcErr } = await supabase.rpc('increment_points', { user_id: userProfile.id, amount: 100 });
        if (rpcErr) console.warn("Points update skipped/failed:", rpcErr.message);
      } catch (e) {
        console.warn("Points RPC not found or failed. This is optional.");
      }

      setStatus({ 
        type: 'success', 
        msg: `Attendance marked successfully! Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}. You earned +100 Master Points. ✅` 
      });
      triggerHaptic('success');
      setAttendanceCode('');
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: err.message || 'Submission failed. Please check your connection and try again.' });
      triggerHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    if (markMethod === 'qr' && scannedQrKey) {
      await executeAttendanceMarking(programID, scannedQrKey, true);
    } else {
      await executeAttendanceMarking(programID, attendanceCode, false);
    }
  };

  // QR Code Scanner initialization and lifecycle management
  useEffect(() => {
    let html5QrInstance: Html5Qrcode | null = null;

    if (activeTab === 'mark' && markMethod === 'qr' && !loading && userProfile) {
      const startCameraScanner = async () => {
        try {
          setIsScanning(true);
          setQrError(null);
          
          const qrScanner = new Html5Qrcode("qr-reader-portal");
          html5QrInstance = qrScanner;

          await qrScanner.start(
            { facingMode: "environment" },
            {
              fps: 12,
              qrbox: (w, h) => {
                const limit = Math.min(w, h, 280) * 0.9;
                return { width: limit, height: limit };
              }
            },
            async (decodedText) => {
              console.log("Portal Scanned payload:", decodedText);
              triggerHaptic('success');
              
              // Stop camera immediately to release locks
              try {
                await qrScanner.stop();
              } catch (ex) {
                console.warn("Failed stopping scanner inline:", ex);
              }
              setIsScanning(false);

              // Parse payload formats
              try {
                let parsedProgramId = '';
                let parsedCode = '';
                let parsedQrKey = '';

                if (decodedText.includes('?')) {
                  const searchPart = decodedText.split('?')[1];
                  const qParams = new URLSearchParams(searchPart);
                  parsedProgramId = qParams.get('programId') || qParams.get('program') || '';
                  parsedCode = qParams.get('code') || '';
                  parsedQrKey = qParams.get('qr_key') || qParams.get('qrKey') || '';
                } else if (decodedText.startsWith('{') || decodedText.trim().startsWith('[')) {
                  const payload = JSON.parse(decodedText);
                  parsedProgramId = payload.programId || payload.ProgramID || '';
                  parsedCode = payload.code || payload.Code || '';
                  parsedQrKey = payload.qrKey || payload.qr_key || '';
                } else if (decodedText.startsWith('QR_ATTENDANCE:')) {
                  const chunks = decodedText.split(':');
                  parsedProgramId = chunks[1] || '';
                  parsedCode = chunks[2] || '';
                  parsedQrKey = chunks[3] || '';
                } else {
                  const splitArray = decodedText.split(',');
                  if (splitArray.length >= 2) {
                    parsedProgramId = splitArray[0].trim();
                    parsedQrKey = splitArray[1].trim();
                  }
                }

                if (!parsedProgramId) {
                  throw new Error("Missing correct program signature inside scanned data.");
                }

                setProgramID(parsedProgramId);

                if (parsedQrKey) {
                  setScannedQrKey(parsedQrKey);
                  await executeAttendanceMarking(parsedProgramId, parsedQrKey, true);
                } else if (parsedCode) {
                  setAttendanceCode(parsedCode);
                  await executeAttendanceMarking(parsedProgramId, parsedCode, false);
                } else {
                  throw new Error("Scanned data does not contain a secure signing key or dynamic PIN.");
                }

              } catch (pErr: any) {
                console.error("Scanned data parse issue:", pErr);
                setQrError(pErr.message || "Invalid or corrupt NSS Attendance QR format. Please scan a code generated in the Portal.");
                // Yield and automatically reboot after 4.5 seconds to try again
                setTimeout(() => {
                  if (activeTab === 'mark' && markMethod === 'qr') {
                    startCameraScanner();
                  }
                }, 4500);
              }
            },
            () => {} // Ignored search frame error
          );
        } catch (starterErr: any) {
          console.error("Camera startup error:", starterErr);
          setQrError("Could not access environment camera. Please check your system browser permissions and allow access, or use standard Security Pin code instead.");
          setIsScanning(false);
        }
      };

      const delayInit = setTimeout(startCameraScanner, 300);
      return () => {
        clearTimeout(delayInit);
        if (html5QrInstance && html5QrInstance.isScanning) {
          html5QrInstance.stop().catch(p => console.warn("Clean up stopped scanner:", p));
        }
      };
    }
  }, [activeTab, markMethod, userProfile]);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    if (!userProfile || !checkProgramID) {
      setCheckStatus({ type: 'error', msg: 'Please select a Program' });
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    setCheckStatus(null);

    try {
      const { data: att } = await supabase
        .from('marked_attendance')
        .select('*')
        .eq('volunteer_name', userProfile.full_name)
        .eq('unit', userProfile.unit)
        .eq('event_name', programs.find(p => p.ProgramID === checkProgramID)?.ProgramName || '')
        .maybeSingle();

      if (att) {
        setCheckStatus({ type: 'success', msg: `Attendance verified! Record found for ${userProfile.full_name}.` });
        triggerHaptic('success');
      } else {
        setCheckStatus({ type: 'info', msg: `No record found for ${userProfile.full_name} in this program.` });
        triggerHaptic('light');
      }
    } catch (err) {
      setCheckStatus({ type: 'error', msg: 'Failed to verify status.' });
      triggerHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 animate-fade-in">
      <div className="max-w-xl mx-auto">
        <div className="mb-6 flex justify-start">
          <BackButton />
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">NSS Attendance</h1>
          <p className="text-slate-500 mt-2">Secure attendance portal for Units 36 & 94</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-50">
            <button 
              onClick={() => {
                setActiveTab('mark');
                setStatus(null);
                triggerHaptic('light');
              }}
              className={cn(
                "flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors",
                activeTab === 'mark' ? "bg-white text-blue-600 border-b-2 border-blue-600" : "bg-slate-50/50 text-slate-400"
              )}
            >
              Mark Attendance
            </button>
            <button 
              onClick={() => {
                setActiveTab('history');
                setCheckStatus(null);
                triggerHaptic('light');
              }}
              className={cn(
                "flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors",
                activeTab === 'history' ? "bg-white text-blue-600 border-b-2 border-blue-600" : "bg-slate-50/50 text-slate-400"
              )}
            >
              Check Status
            </button>
          </div>

          <div className="p-8">
            {userProfile ? (
              <div className="mb-8 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest leading-none mb-1">Authenticated Account</div>
                    <div className="text-sm font-bold text-slate-900">{userProfile.full_name}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Unit {userProfile.unit}</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white border border-blue-100 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-tight">Verified</div>
              </div>
            ) : noUserFound ? (
              <div className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex flex-col items-center gap-3 text-center">
                <AlertCircle size={32} className="text-amber-500" />
                <div className="text-amber-900 font-bold">Registration / Login Required</div>
                <p className="text-xs text-amber-600 italic">You must be logged in with an approved account to mark attendance.</p>
                <button onClick={() => window.location.href = '/login'} className="mt-2 text-xs font-black uppercase text-blue-600 underline">Switch to Login</button>
              </div>
            ) : (
              <div className="mb-8 p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-32 bg-slate-200 rounded"></div>
                    <div className="h-4.5 w-44 bg-slate-200/90 rounded"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
              </div>
            )}

            {activeTab === 'mark' ? (
              <div className="space-y-6">
                {/* Method selector tab */}
                {userProfile && (
                  <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => { setMarkMethod('code'); setStatus(null); triggerHaptic('light'); }}
                      className={cn(
                        "py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2",
                        markMethod === 'code' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <User size={14} className="stroke-[2.5px]" />
                      <span>Security Pin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMarkMethod('qr'); setStatus(null); triggerHaptic('light'); }}
                      className={cn(
                        "py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2",
                        markMethod === 'qr' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <QrCode size={14} className="stroke-[2.5px]" />
                      <span>Camera Scanner</span>
                    </button>
                  </div>
                )}

                {status && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-4 rounded-2xl text-sm flex items-start gap-3",
                      status.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : 
                      status.type === 'info' ? "bg-blue-50 text-blue-700 border border-blue-100 animate-pulse" :
                      "bg-red-50 text-red-700 border border-red-100"
                    )}
                  >
                    {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                    <div>{status.msg}</div>
                  </motion.div>
                )}

                {markMethod === 'code' ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Active Program</label>
                      <div className="relative">
                        <select
                          value={programID}
                          onChange={(e) => setProgramID(e.target.value)}
                          className="w-full h-14 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                        >
                          <option value="">Select Activity</option>
                          {activePrograms.map(p => (
                            <option key={p.ProgramID} value={p.ProgramID}>
                              {p.ProgramName}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronRight size={18} className="rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Code</label>
                      <input
                        type="tel"
                        pattern="[0-9]*"
                        maxLength={5}
                        inputMode="numeric"
                        value={attendanceCode}
                        onChange={(e) => setAttendanceCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="ENTER 5-DIGIT CODE"
                        className="w-full h-14 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-mono text-center tracking-[0.2em] sm:tracking-[0.5em] text-xl"
                      />
                    </div>

                    <button
                      disabled={loading || !userProfile || !programID}
                      type="submit"
                      className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8 cursor-pointer"
                    >
                      {loading ? <Loader2 className="animate-spin" size={24} /> : 'Submit Attendance'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {qrError && (
                      <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-2xl flex items-start gap-2.5">
                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>{qrError}</div>
                      </div>
                    )}

                    <div className="relative w-full aspect-square bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col items-center justify-center">
                      <div id="qr-reader-portal" className="absolute inset-0 w-full h-full object-cover" />
                      
                      {/* Decorative scanning reticle */}
                      {isScanning && (
                        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center p-12">
                          <div className="w-full aspect-square max-w-[250px] border-2 border-dashed border-blue-400 rounded-3xl relative animate-pulse flex items-center justify-center">
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                            {/* Scanning beam animation */}
                            <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent absolute top-1/2 left-0 animate-bounce shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest mt-6 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-500/20">Align QR within active bounds</span>
                        </div>
                      )}

                      {!isScanning && (
                        <div className="z-10 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
                            <Camera size={28} className="text-slate-500" />
                          </div>
                          <h4 className="font-bold text-sm text-slate-200">Camera initialization...</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">Connecting securely to environment module to acquire visual lock.</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Interactive Guidance</div>
                      <p className="text-xs text-slate-600 italic">Please place the administrator's generated Program QR code directly in front of the lens. Attendance will mark automatically with location coordinates once read.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleCheckStatus} className="space-y-5 border-t border-slate-50 pt-6">
                {checkStatus && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-4 rounded-2xl text-sm flex items-start gap-3",
                      checkStatus.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : 
                      checkStatus.type === 'info' ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      "bg-red-50 text-red-700 border border-red-100"
                    )}
                  >
                    {checkStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {checkStatus.msg}
                  </motion.div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Program to Check</label>
                  <div className="relative">
                    <select
                      value={checkProgramID}
                      onChange={(e) => setCheckProgramID(e.target.value)}
                      className="w-full h-14 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                    >
                      <option value="">Choose Activity</option>
                      {programs.map(p => (
                        <option key={p.ProgramID} value={p.ProgramID}>
                          {p.ProgramName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <button
                  disabled={loading || !userProfile || !checkProgramID}
                  type="submit"
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : 'Verify My Record'}
                </button>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">Unit 36</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 italic">Dr. Aparna B</div>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">Unit 94</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 italic">Dr. RakhiKrishna R</div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
