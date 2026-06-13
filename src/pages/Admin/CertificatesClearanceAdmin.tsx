import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, CheckCircle2, Search, Loader2, Filter, ChevronRight, 
  MapPin, Clock, Check, RefreshCw, UserCheck, AlertCircle, FileText
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { db } from '@/src/lib/firebaseClient';
import { collection, doc, setDoc, getDocs, getDoc, query } from 'firebase/firestore';

interface VolunteerData {
  id: string;
  name: string;
  username: string;
  unit: string;
  points: number;
  department: string;
  mobile: string;
}

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

export default function CertificatesClearanceAdmin() {
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [clearances, setClearances] = useState<{ [id: string]: ClearanceRecord }>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<'all' | '36' | '94'>('all');
  const [filterCamp, setFilterCamp] = useState<'all' | 'completed' | 'pending'>('all');
  const [adminOfficerName, setAdminOfficerName] = useState('Dr. Aparna B');

  // Detect current active admin officer from email/session or fallback
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || 'po36@nssotpx.edu';
    if (userEmail.includes('94') || userEmail.includes('rakhi')) {
      setAdminOfficerName('Dr. Rakhikrishna R');
    } else {
      setAdminOfficerName('Dr. Aparna B');
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch volunteers from profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'volunteer')
        .order('full_name', { ascending: true });

      if (error) throw error;

      const items: VolunteerData[] = (profiles || []).map(p => ({
        id: p.id,
        name: p.full_name || 'Unnamed Volunteer',
        username: p.username || '',
        unit: p.unit || '36',
        points: p.points || 0,
        department: p.department || 'Science/Arts',
        mobile: p.mobile || 'Private'
      }));
      setVolunteers(items);

      // 2. Fetch clearance recommendation settings from Firestore
      const clearanceMap: { [id: string]: ClearanceRecord } = {};
      try {
        const querySnap = await getDocs(collection(db, 'nss_service_clearances'));
        querySnap.forEach((docSnap) => {
          const data = docSnap.data();
          clearanceMap[docSnap.id] = {
            volunteerId: docSnap.id,
            name: data.name,
            unit: data.unit,
            department: data.department || '',
            campCompleted: !!data.campCompleted,
            hoursVerified: !!data.hoursVerified,
            recommendedToPrincipal: !!data.recommendedToPrincipal,
            recommendedAt: data.recommendedAt,
            recommendedBy: data.recommendedBy
          };
        });
      } catch (err) {
        console.warn("Could not query clearance logs from firestore:", err);
      }
      setClearances(clearanceMap);

    } catch (err: any) {
      console.error("Error setting up clearance ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleState = async (volunteer: VolunteerData, field: 'campCompleted' | 'hoursVerified' | 'recommendedToPrincipal') => {
    setSavingId(`${volunteer.id}_${field}`);
    
    // Create current or fallback clearance log
    const prevLog = clearances[volunteer.id] || {
      volunteerId: volunteer.id,
      name: volunteer.name,
      unit: volunteer.unit,
      department: volunteer.department,
      campCompleted: false,
      hoursVerified: volunteer.points >= 120, // Default to true if they already crossed nss hours criteria
      recommendedToPrincipal: false
    };

    const nextLog = {
      ...prevLog,
      [field]: !prevLog[field]
    };

    // Auto-verify hours metadata if toggle is hours
    if (field === 'recommendedToPrincipal' && nextLog.recommendedToPrincipal) {
      nextLog.recommendedAt = new Date().toISOString();
      nextLog.recommendedBy = adminOfficerName;
    }

    try {
      const docRef = doc(db, 'nss_service_clearances', volunteer.id);
      await setDoc(docRef, nextLog, { merge: true });
      
      setClearances(prev => ({
        ...prev,
        [volunteer.id]: nextLog
      }));

    } catch (err: any) {
      alert(`Action paused: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const filteredVolunteers = volunteers.filter(v => {
    const log = clearances[v.id] || { campCompleted: false };
    
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnit = selectedUnit === 'all' || v.unit === selectedUnit;
    
    const matchesCamp = filterCamp === 'all' || 
                        (filterCamp === 'completed' && log.campCompleted) || 
                        (filterCamp === 'pending' && !log.campCompleted);

    return matchesSearch && matchesUnit && matchesCamp;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full mb-3 border border-amber-200">
          <Award size={13} className="text-amber-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider">National Merit Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase">
          NSS Merit Service Hour Clearance Desk
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review on-field hour points, special 7-day camp logs, and recommend highly eligible volunteers directly to the Principal's seal room.
        </p>
      </div>

      {/* Control Panel Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Roster Candidates</p>
          <p className="text-3xl font-black mt-2">{volunteers.length}</p>
          <div className="mt-4 text-xs font-semibold text-slate-300">Ready to audit and verify.</div>
        </div>

        <div className="bg-emerald-950 border border-emerald-900 text-emerald-100 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Camp Completed Cleared</p>
          <p className="text-3xl font-black text-emerald-300 mt-2">
            {(Object.values(clearances) as ClearanceRecord[]).filter(c => c.campCompleted).length}
          </p>
          <div className="mt-4 text-xs font-semibold text-emerald-400">Verified through residential camp sheets.</div>
        </div>

        <div className="bg-amber-950 border border-amber-900 text-amber-100 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Recommended for Principal Seal</p>
          <p className="text-3xl font-black text-amber-300 mt-2">
            {(Object.values(clearances) as ClearanceRecord[]).filter(c => c.recommendedToPrincipal).length}
          </p>
          <div className="mt-4 text-xs font-semibold text-amber-400">Awaiting executive digital signature approval.</div>
        </div>
      </div>

      {/* Filtering Desk */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-5 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-sm">
        
        <div className="relative w-full lg:w-96 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search candidate name, ID, or major..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold uppercase tracking-wider"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full justify-end">
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Unit Hub:</span>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(['all', '36', '94'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    selectedUnit === u ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  Unit {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Special Camp:</span>
            <select
              value={filterCamp}
              onChange={(e: any) => setFilterCamp(e.target.value)}
              className="h-10 border border-slate-200 rounded-xl bg-slate-50 px-3 text-[10px] font-black uppercase tracking-wider text-slate-600 focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">ALL CAMPERS</option>
              <option value="completed">COMPLETED</option>
              <option value="pending">PENDING CLEARANCE</option>
            </select>
          </div>

          <button
            onClick={loadData}
            className="h-10 w-10 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center transition cursor-pointer"
            title="Reload registry data"
          >
            <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
          </button>

        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="animate-spin text-amber-600 mx-auto mb-4" size={32} />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Running full-history merit audit...</p>
        </div>
      ) : filteredVolunteers.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden whitespace-nowrap">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 h-14">
                  <th className="pl-8">Active Candidate</th>
                  <th>NSS Hours (Points)</th>
                  <th>Residential Camp Log</th>
                  <th>Hours Check</th>
                  <th>Seal Desk Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredVolunteers.map(v => {
                  const log = clearances[v.id] || {
                    campCompleted: false,
                    hoursVerified: v.points >= 120,
                    recommendedToPrincipal: false
                  };

                  const isHoursQualified = v.points >= 120;
                  const isEligibleForRecommendation = log.campCompleted && log.hoursVerified;

                  return (
                    <tr key={v.id} className="h-18 hover:bg-slate-50/50 transition-colors">
                      <td className="pl-8">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black uppercase ${
                            v.unit === '36' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {v.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                              {v.name}
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                v.unit === '36' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-rose-50 border border-rose-200 text-rose-700'
                              }`}>
                                Unit {v.unit}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                              {v.department} • ({v.mobile})
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="font-mono text-xs font-black text-slate-600">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg">
                          <Clock size={12} className="text-slate-400" />
                          <span>{v.points} Hours</span>
                        </div>
                      </td>

                      <td>
                        <button
                          onClick={() => handleToggleState(v, 'campCompleted')}
                          disabled={savingId !== null}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                            log.campCompleted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {savingId === `${v.id}_campCompleted` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : log.campCompleted ? (
                            <CheckCircle2 size={13} className="text-emerald-600" />
                          ) : (
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                          )}
                          <span>{log.campCompleted ? "Camp Cleared" : "Mark Cleared"}</span>
                        </button>
                      </td>

                      <td>
                        <button
                          onClick={() => handleToggleState(v, 'hoursVerified')}
                          disabled={savingId !== null}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                            log.hoursVerified
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {savingId === `${v.id}_hoursVerified` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : log.hoursVerified ? (
                            <CheckCircle2 size={13} className="text-blue-650" />
                          ) : (
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                          )}
                          <span>{log.hoursVerified ? "Verified" : isHoursQualified ? "Verify (>=120h)" : "Below 120h Forced"}</span>
                        </button>
                      </td>

                      <td>
                        {log.recommendedToPrincipal ? (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider px-3 py-1 bg-emerald-50 rounded-lg max-w-max border border-emerald-100">
                            <Check size={12} className="stroke-[3]" />
                            <span>Recommended by {log.recommendedBy?.split(' ')[1] || 'PO'}</span>
                          </div>
                        ) : (
                          <button
                            disabled={!isEligibleForRecommendation || savingId !== null}
                            onClick={() => handleToggleState(v, 'recommendedToPrincipal')}
                            className={`px-4.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 cursor-pointer ${
                              isEligibleForRecommendation
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md active:scale-95'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/50'
                            }`}
                          >
                            {savingId === `${v.id}_recommendedToPrincipal` ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <UserCheck size={13} />
                            )}
                            <span>Recommend</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200/60 rounded-[2.5rem] py-24 text-center max-w-md mx-auto">
          <AlertCircle className="text-slate-400 mx-auto mb-3" size={32} />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">No Eligible Candidates Found</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Adjust filters or search metrics to query other volunteers.</p>
        </div>
      )}

    </div>
  );
}
