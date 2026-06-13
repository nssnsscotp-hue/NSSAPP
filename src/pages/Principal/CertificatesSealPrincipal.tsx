import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, ShieldCheck, CheckCheck, Loader2, FileText, Check, AlertCircle, 
  MapPin, Clock, Printer, Download, Sparkles, Send, CheckCircle2, RefreshCw
} from 'lucide-react';
import { db } from '@/src/lib/firebaseClient';
import { collection, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';

interface ClearanceRecord {
  volunteerId: string;
  name: string;
  unit: string;
  department: string;
  campCompleted: boolean;
  hoursVerified: boolean;
  recommendedToPrincipal: boolean;
  recommendedAt?: string;
  recommendedBy?: string;
}

interface SealedCertificate {
  volunteerId: string;
  signedAt: string;
  citation: string;
  sealApproved: boolean;
  certificateId: string;
}

export default function CertificatesSealPrincipal() {
  const [recommendations, setRecommendations] = useState<ClearanceRecord[]>([]);
  const [sealedCerts, setSealedCerts] = useState<{ [id: string]: SealedCertificate }>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedVol, setSelectedVol] = useState<ClearanceRecord | null>(null);
  
  // Seal / Sign Controls
  const [citationText, setCitationText] = useState('For outstanding and inspiring dedication to National Service Scheme social restorations, emergency blood relief drives, and resident camp restorations.');
  const [affixSign, setAffixSign] = useState(true);
  const [affixStamp, setAffixStamp] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Load recommendations from FireStore
      const recsList: ClearanceRecord[] = [];
      const recSnap = await getDocs(collection(db, 'nss_service_clearances'));
      recSnap.forEach(snap => {
        const val = snap.data();
        if (val.recommendedToPrincipal) {
          recsList.push({
            volunteerId: snap.id,
            name: val.name,
            unit: val.unit || '36',
            department: val.department || 'General',
            campCompleted: !!val.campCompleted,
            hoursVerified: !!val.hoursVerified,
            recommendedToPrincipal: true,
            recommendedAt: val.recommendedAt,
            recommendedBy: val.recommendedBy
          });
        }
      });
      setRecommendations(recsList);

      // 2. Load sealed certificates status
      const sealedMap: { [id: string]: SealedCertificate } = {};
      const sealedSnap = await getDocs(collection(db, 'nss_sealed_certificates'));
      sealedSnap.forEach(snap => {
        const val = snap.data();
        sealedMap[snap.id] = {
          volunteerId: snap.id,
          signedAt: val.signedAt,
          citation: val.citation,
          sealApproved: !!val.sealApproved,
          certificateId: val.certificateId
        };
      });
      setSealedCerts(sealedMap);

      if (recsList.length > 0 && !selectedVol) {
        setSelectedVol(recsList[0]);
      }
    } catch (err) {
      console.warn("Error loaded recommendations list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSealCertificate = async (vol: ClearanceRecord) => {
    if (!vol) return;
    setSavingId(vol.volunteerId);
    
    const certId = `NSS-OTP-${vol.unit}-${vol.volunteerId.slice(0, 6).toUpperCase()}-${new Date().getFullYear()}`;
    const nextCert: SealedCertificate = {
      volunteerId: vol.volunteerId,
      signedAt: new Date().toISOString(),
      citation: citationText,
      sealApproved: true,
      certificateId: certId
    };

    try {
      // Save to Firebase Firestore website settings sync
      const docRef = doc(db, 'nss_sealed_certificates', vol.volunteerId);
      await setDoc(docRef, nextCert);

      setSealedCerts(prev => ({
        ...prev,
        [vol.volunteerId]: nextCert
      }));

      // Broadcast update event
      window.dispatchEvent(new Event('website-settings-updated'));

    } catch (err: any) {
      alert(`Action paused: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById('print-principal-preview');
    if (!printArea) return;
    const printContent = printArea.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Create new print window environment
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>NSS Merit Certificate</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @media print {
                body { background: white; margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
              @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Great+Vibes&display=swap');
            </style>
          </head>
          <body class="flex items-center justify-center min-h-screen">
            <div style="width: 840px;">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Executive Desk Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full mb-3 border border-amber-200">
            <ShieldCheck size={13} className="text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-wider">Level-5 Digital Endorsements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-905 tracking-tighter uppercase leading-none">
            Principal Sign-off & Seal Room
          </h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">
            Formally endorse University of Calicut NSS Merit Certificates for outstanding dynamic volunteers.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-center h-10 px-4 border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-600 bg-white hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer transition"
        >
          <RefreshCw size={13} />
          <span>Sync Desk Entries</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="animate-spin text-amber-600 mx-auto mb-4" size={32} />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Consulting recommended registries...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: List of Recommended Volunteers */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white rounded-[2rem] p-5 shadow-lg">
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-4">Recommended Registrants</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {recommendations.map(vol => {
                  const isSealed = !!sealedCerts[vol.volunteerId];
                  const isSelected = selectedVol?.volunteerId === vol.volunteerId;

                  return (
                    <button
                      key={vol.volunteerId}
                      onClick={() => {
                        setSelectedVol(vol);
                        // Pre-populate citation if already sealed
                        if (sealedCerts[vol.volunteerId]) {
                          setCitationText(sealedCerts[vol.volunteerId].citation);
                        } else {
                          setCitationText('For outstanding and inspiring dedication to National Service Scheme social restorations, emergency blood relief drives, and resident camp restorations.');
                        }
                      }}
                      className={`w-full text-left p-4 rounded-xl transition flex items-center justify-between gap-4 cursor-pointer relative ${
                        isSelected 
                          ? 'bg-amber-600 text-slate-950 font-extrabold shadow-md scale-[1.01]' 
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-black uppercase tracking-wide ${isSelected ? 'text-slate-950' : 'text-slate-100'}`}>
                          {vol.name}
                        </div>
                        <div className={`text-[10px] font-bold uppercase mt-1 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                          Unit {vol.unit} • {vol.department}
                        </div>
                      </div>

                      {isSealed ? (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isSelected ? 'bg-slate-950 text-amber-400' : 'bg-emerald-950/50 test-emerald-400 text-emerald-300 border border-emerald-900/60'
                        }`}>
                          <Check size={10} className="stroke-[3]" /> SEALED
                        </span>
                      ) : (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-amber-950 text-yellow-100' : 'bg-slate-800 text-slate-400'
                        }`}>
                          RECOMMENDED
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seal Room Tools Configuration */}
            {selectedVol && (
              <div className="bg-white border border-slate-200/80 rounded-[2rem] p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">Signature & Seal Config</h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Merit Certificate Citation</label>
                  <textarea
                    rows={4}
                    value={citationText}
                    onChange={(e) => setCitationText(e.target.value)}
                    placeholder="Enter custom commendation citation..."
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={affixSign} 
                      onChange={(e) => setAffixSign(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Affix Dr. Rajesh R Digital E-Sign</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={affixStamp} 
                      onChange={(e) => setAffixStamp(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Affix Official College Executive Rubber Stamp</span>
                  </label>
                </div>

                <div className="pt-2">
                  {sealedCerts[selectedVol.volunteerId] ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2.5 text-emerald-800">
                      <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-900">Certificate Formally Cleared</p>
                        <p className="text-[9px] font-medium text-emerald-700 mt-0.5">Approved signature and seal released to student roster.</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSealCertificate(selectedVol)}
                      disabled={savingId !== null}
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {savingId === selectedVol.volunteerId ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>RELEASEEING MERIT SEAL...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-yellow-200" />
                          <span>AFFIX PRINCIPAL MERIT SEAL</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: High Fidelity Print Certificate Canvas */}
          <div className="lg:col-span-8 space-y-4">
            {selectedVol ? (
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-6 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Merit Certificate Live Preview</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Draft preview before stamping with Principal signatures.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Print Certificate</span>
                    </button>
                  </div>
                </div>

                {/* Print area wrapper */}
                <div className="overflow-x-auto p-4 bg-slate-50 border border-slate-100 rounded-3xl flex justify-center">
                  
                  <div 
                    id="print-principal-preview"
                    className="bg-white border-[14px] border-double border-amber-600 p-10 md:p-14 text-center rounded-2xl relative select-none shadow-md max-w-2xl"
                    style={{ minWidth: '640px', minHeight: '460px' }}
                  >
                    
                    {/* Golden corners ornaments */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-amber-600 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-amber-600 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-amber-600 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-amber-600 rounded-br-lg" />

                    {/* Logo/Identity Section */}
                    <div className="flex items-center justify-between px-6 pb-4 border-b-2 border-slate-100">
                      <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="Seal Level-1" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                      <div>
                        <h2 className="text-amber-800 font-extrabold tracking-widest text-[11px] uppercase">National Service Scheme</h2>
                        <h1 className="text-slate-900 font-black tracking-tight text-lg uppercase leading-none mt-1">NSS College, Ottapalam</h1>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">Affiliated to Calicut University • NAAC Re-accredited with 'A' Grade</p>
                      </div>
                      <img src="https://i.postimg.cc/Xq7KPnqK/pngkey-com-allu-arjun-png-2479287.png" alt="Seal Level-2" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="text-amber-700 font-black tracking-[0.3em] uppercase text-xs">
                        ★ Merit Service Certificate ★
                      </div>
                      
                      <div className="text-slate-800 text-[11px] font-medium leading-relaxed max-w-md mx-auto">
                        This is to certify that Volunteer <strong className="text-slate-950 font-black uppercase text-xs underline decoration-amber-500 tracking-wide decoration-2">{selectedVol.name}</strong> of <strong className="text-slate-900 font-bold uppercase">{selectedVol.department} Department</strong> has been cleared by the Program Administration Board for statutory merit achievements in <strong className="text-slate-900 font-bold uppercase">NSS Programme Unit {selectedVol.unit}</strong>.
                      </div>

                      <div className="text-slate-700 text-[10px] font-semibold italic border-y border-dashed border-slate-200/80 py-3 leading-relaxed max-w-lg mx-auto">
                        "{citationText}"
                      </div>

                      <div className="grid grid-cols-2 gap-10 pt-8">
                        
                        {/* PO signature block */}
                        <div className="flex flex-col items-center justify-end text-center mt-3 relative">
                          {affixSign && (
                            <div className="absolute bottom-6 font-mono font-semibold text-indigo-700/80 italic text-xs tracking-wider uppercase select-none pointer-events-none transform -rotate-3 border-b border-indigo-500 pb-0.5">
                              {selectedVol.recommendedBy?.split(' ')[1] || 'PO SIGN'}
                            </div>
                          )}
                          <div className="h-0.5 w-32 bg-slate-300 rounded" />
                          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1.5">Programme Officer</p>
                          <p className="text-[7px] text-slate-400 font-semibold uppercase">NSS Unit {selectedVol.unit}</p>
                        </div>

                        {/* Principal signature block */}
                        <div className="flex flex-col items-center justify-end text-center mt-3 relative">
                          {affixSign && sealedCerts[selectedVol.volunteerId]?.sealApproved && (
                            <div className="absolute bottom-6 font-mono font-semibold text-rose-700/80 italic text-xs tracking-wider uppercase select-none pointer-events-none transform rotate-2 border-b border-rose-500 pb-0.5">
                              Dr. Rajesh R
                            </div>
                          )}
                          
                          {affixStamp && sealedCerts[selectedVol.volunteerId]?.sealApproved && (
                            <div className="absolute -top-12 opacity-30 pointer-events-none select-none">
                              <div className="w-16 h-16 rounded-full border-4 border-double border-red-650 flex flex-col items-center justify-center text-[6px] font-black text-red-600 rotate-12 bg-white/20 select-none shadow-inner p-1">
                                <span className="leading-none text-[5px]">NSS COLLEGE</span>
                                <span className="leading-none text-[5px] text-red-700">OTTAPALAM</span>
                                <span className="leading-none text-[4px] border-t border-red-400/60 mt-0.5 pt-0.5">SEAL APPROVED</span>
                              </div>
                            </div>
                          )}

                          <div className="h-0.5 w-32 bg-slate-300 rounded" />
                          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1.5">Dr. Rajesh R</p>
                          <p className="text-[7px] text-slate-400 font-semibold uppercase">PRINCIPAL & CHIEF PATRON</p>
                        </div>

                      </div>

                      <div className="pt-6 flex justify-between items-center text-[7px] text-slate-400 font-semibold font-mono tracking-wider border-t border-slate-100">
                        <span>CERTIFICATE ID: {sealedCerts[selectedVol.volunteerId]?.certificateId || 'AWAITING PRINCIPAL SEAL'}</span>
                        <span>DATE SIGNED: {sealedCerts[selectedVol.volunteerId] ? new Date(sealedCerts[selectedVol.volunteerId].signedAt).toLocaleDateString() : '—'}</span>
                      </div>

                    </div>
                    
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200/60 rounded-[2.5rem] py-24 text-center">
                <AlertCircle className="text-slate-400 mx-auto mb-3" size={32} />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-bold">No Active Canvas Selected</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Select a recommended volunteer from the registrar roster to stamp and preview.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200/60 rounded-[2.5rem] py-24 text-center max-w-md mx-auto">
          <AlertCircle className="text-slate-400 mx-auto mb-3" size={32} />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">No Recommended Certificates Awaiting Approval</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Active recommendations will flow here directly when program officers approve camper logs and verify service registers.</p>
        </div>
      )}

    </div>
  );
}
