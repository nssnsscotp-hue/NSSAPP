import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, GraduationCap, Download, Search, 
  LogOut, Filter, BookOpen, Loader2, Bell, Trophy, ShieldAlert,
  ArrowUpDown, Check, ChevronRight, School, Calendar, Award,
  Sparkles, HeartPulse, Activity, CheckCheck, FileSpreadsheet,
  Zap, UserCheck, ShieldCheck, History, Send, Keyboard, Flame, Compass, HelpCircle
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';
import HighlightsAdmin from '../Admin/HighlightsAdmin';
import AnnouncementsAdmin from '../Admin/AnnouncementsAdmin';
import CertificatesSealPrincipal from './CertificatesSealPrincipal';

interface VolunteerProfile {
  id: string;
  username: string;
  full_name: string;
  mobile: string;
  unit: string;
  role: string;
  points: number;
  department: string;
  created_at: string;
}

interface AttendanceRecord {
  id: string;
  volunteer_name: string;
  unit: string;
  event_name: string;
  created_at: string;
  department?: string;
}

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  
  // Principal metadata
  const principalName = "Dr. NSS Principal";
  const principalTitle = "College Principal & Chief Patron of NSS Council";
  const councilRoomCode = "NSS-CO-EXEC-404";
  const accessClearance = "Level-5 General Patron";

  const [activeTab, setActiveTab] = useState<'attendance' | 'announcements' | 'highlights' | 'stats' | 'seal_room'>('attendance');
  const [activeSubTab, setActiveSubTab] = useState<'volunteers' | 'records'>('records');
  const [students, setStudents] = useState<VolunteerProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Filtering and Sorting States
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'points' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const DEPARTMENTS = [
    'English', 'Hindi', 'Malayalam', 'Commerce', 'Physics', 
    'Chemistry', 'Economics', 'Computer Science', 'Electronics', 
    'Botany', 'Zoology', 'Mathematics', 'History'
  ];

  // Map departments to customized aesthetic icons
  const getDepartmentIcon = (dept: string) => {
    switch(dept) {
      case 'English':
      case 'Hindi':
      case 'Malayalam':
        return <BookOpen size={14} className="text-pink-500" />;
      case 'Commerce':
      case 'Economics':
        return <Activity size={14} className="text-emerald-500" />;
      case 'Physics':
      case 'Chemistry':
        return <Flame size={14} className="text-orange-500" />;
      case 'Computer Science':
      case 'Electronics':
        return <Zap size={14} className="text-blue-500" />;
      case 'Botany':
      case 'Zoology':
        return <Compass size={14} className="text-green-500" />;
      default:
        return <Sparkles size={14} className="text-indigo-500" />;
    }
  };

  useEffect(() => {
    // Elegant clock simulation for principal's executive desk
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const loadData = async () => {
    try {
      setSyncStatus('syncing');
      setLoading(true);

      // 1. Fetch all volunteers registered
      const { data: profilesData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'volunteer');

      if (profileErr) throw profileErr;
      
      const loadedStudents: VolunteerProfile[] = (profilesData || []).map((p: any) => ({
        id: p.id || '',
        username: p.username || '',
        full_name: p.full_name || '',
        mobile: p.mobile || 'No Contact',
        unit: p.unit || '36/94',
        role: p.role || 'volunteer',
        points: p.points || 0,
        department: p.department || 'General',
        created_at: p.created_at || ''
      }));
      setStudents(loadedStudents);

      // 2. Fetch all marked attendance
      const { data: attendanceData, error: attErr } = await supabase
        .from('marked_attendance')
        .select('*')
        .order('created_at', { ascending: false });

      if (attErr) throw attErr;

      // Map volunteer department onto attendance records dynamically
      const profileMap = new Map<string, string>();
      loadedStudents.forEach(s => {
        const key = (s.full_name || '').trim().toLowerCase();
        if (key) {
          profileMap.set(key, s.department);
        }
      });

      const mappedAttendance: AttendanceRecord[] = (attendanceData || []).map((a: any) => {
        const vName = (a.volunteer_name || '').trim();
        const vKey = vName.toLowerCase();
        return {
          id: a.id,
          volunteer_name: vName,
          unit: a.unit || '36/94',
          event_name: a.event_name || '',
          created_at: a.created_at || '',
          department: profileMap.get(vKey) || 'General'
        };
      });

      setAttendance(mappedAttendance);
      setTimeout(() => {
        setSyncStatus('synced');
      }, 600);
    } catch (err) {
      console.error("Error loading Principal stats:", err);
      setSyncStatus('synced');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dynamic Programs collected from attendance logs
  const dynamicPrograms = Array.from(new Set(attendance.map(a => a.event_name || ''))).filter(Boolean);

  // Filtering Volunteers (Students)
  const filteredStudents = students
    .filter(s => {
      const sDep = s.department || 'General';
      const sName = s.full_name || '';
      const sUser = s.username || '';
      
      const matchDep = selectedDepartment === 'all' || sDep.toLowerCase() === selectedDepartment.toLowerCase();
      const matchSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sDep.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDep && matchSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = (a.full_name || '').localeCompare(b.full_name || '');
      } else if (sortBy === 'department') {
        comparison = (a.department || '').localeCompare(b.department || '');
      } else if (sortBy === 'points') {
        comparison = (a.points || 0) - (b.points || 0);
      } else {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Filtering Attendance Records
  const filteredAttendance = attendance
    .filter(a => {
      const aDep = a.department || 'General';
      const aVolName = a.volunteer_name || '';
      const aEvent = a.event_name || '';
      
      const matchDep = selectedDepartment === 'all' || aDep.toLowerCase() === selectedDepartment.toLowerCase();
      const matchProg = selectedProgram === 'all' || aEvent === selectedProgram;
      const matchSearch = aVolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          aEvent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          aDep.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDep && matchProg && matchSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = (a.volunteer_name || '').localeCompare(b.volunteer_name || '');
      } else if (sortBy === 'department') {
        comparison = (a.department || '').localeCompare(b.department || '');
      } else {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle manual/toggle sorting
  const requestSort = (type: typeof sortBy) => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    let csvString = '';
    
    if (activeSubTab === 'records') {
      csvString = [
        ["Volunteer Name", "Department", "Unit", "Event Name", "Marked Time"],
        ...filteredAttendance.map(a => [a.volunteer_name, a.department, a.unit, a.event_name, new Date(a.created_at).toLocaleString()])
      ].map(e => e.join(",")).join("\n");
    } else {
      csvString = [
        ["Full Name", "Username", "Department", "Unit ID", "Contact No", "NSS Points"],
        ...filteredStudents.map(s => [s.full_name, s.username, s.department, s.unit, s.mobile, s.points])
      ].map(e => e.join(",")).join("\n");
    }

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `principal_signed_report_${activeSubTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      
      {/* High-Elegance Authority Top Ribbon */}
      <div className="bg-slate-950 text-[10px] text-slate-400 font-extrabold uppercase py-2.5 px-4 flex justify-between items-center tracking-[0.2em] border-b border-indigo-500/10 z-50">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
          <span>Principal Executive Portal active</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-indigo-400 hidden md:inline">Clearance: {accessClearance}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-400 text-[9px] font-black bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-sm">
            SECURE COUNCIL ROOM: {councilRoomCode}
          </span>
          <span className="font-mono text-slate-300 hidden sm:inline">{currentTime || 'Syncing live UTC clock...'}</span>
        </div>
      </div>

      {/* Regal Executive Header Banner */}
      <header className="bg-slate-900 text-white shadow-2xl relative overflow-hidden border-b border-white/5 shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/90 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            
            {/* Elite Rounded Crest Frame */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-amber-500 to-indigo-500 rounded-[2rem] blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex -space-x-4 shrink-0 bg-slate-950 p-2.5 rounded-[1.8rem] border border-white/10 shadow-2xl">
                <div className="w-14 h-14 bg-white p-1 rounded-2xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform shadow-lg">
                  <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" alt="University Seal" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="w-14 h-14 bg-white p-1 rounded-2xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform shadow-lg border border-slate-100">
                  <img src="https://i.postimg.cc/Xq7KPnqK/pngkey-com-allu-arjun-png-2479287.png" alt="NSS Crest" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full text-slate-950 shadow-md">
                  ★ Chief General Patron ★
                </span>
                <span className="bg-white/10 border border-white/20 text-slate-200 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                  NSS Academic Head
                </span>
              </div>
              
              <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
                NSS College Ottapalam
              </h1>
              <div className="h-1 w-24 bg-indigo-500 rounded-full mx-auto md:mx-0 my-1" />
              <p className="text-slate-300 text-xs md:text-sm font-semibold tracking-wider flex items-center justify-center md:justify-start gap-2">
                <span className="text-amber-400 font-extrabold">Executive Council Desk: </span> 
                <span>{principalName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto justify-end">
            <button 
              onClick={loadData}
              disabled={syncStatus === 'syncing'}
              className="w-full sm:w-auto px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <Loader2 size={13} className="animate-spin text-amber-400" />
                  <span>Auditing Archives...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} className="text-indigo-400" />
                  <span>Sync Council Data</span>
                </>
              )}
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-3.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <LogOut size={14} /> 
              <span>Leave Desk</span>
            </button>
          </div>
        </div>
      </header>

      {/* Prestige Tabbed Command Console Route Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 flex space-x-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'attendance', name: 'NSS Roster & Attendance Logs', icon: CheckCircle, desc: 'Sort or search records by department / program' },
            { id: 'announcements', name: 'Admin Announcements publisher', icon: Bell, desc: 'Broadcast notifications to all dashboards' },
            { id: 'highlights', name: 'Campus Excellence Pinboard', icon: Trophy, desc: 'Pin highlights list inside home gallery' },
            { id: 'stats', name: 'Bento Stats & Visual Analytics', icon: School, desc: 'Department statistics distribution charts' },
            { id: 'seal_room', name: 'Merit Certificate Seal Room', icon: Award, desc: 'Endorse and issue official merit certificates' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchTerm('');
                }}
                className={cn(
                  "py-4.5 border-b-3 text-xs font-black uppercase tracking-widest flex flex-col items-start gap-1 transition-all whitespace-nowrap cursor-pointer relative",
                  isSelected 
                    ? "border-indigo-600 text-indigo-700" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={cn(isSelected ? "text-indigo-600" : "text-slate-400")} />
                  <span>{tab.name}</span>
                </div>
                <span className="text-[9px] lowercase font-semibold tracking-normal text-slate-400 hidden lg:inline">
                  {tab.desc}
                </span>
                {isSelected && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-500 shadow-sm"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Administrative Screen Area */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex-1">
        <AnimatePresence mode="wait">
          
          {loading ? (
            <motion.div 
              key="loading-spinner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-40 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <Loader2 size={44} className="animate-spin text-indigo-700 relative z-10" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Principal Security Handshake</p>
                <p className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mt-1">Compiling authenticated college data...</p>
              </div>
            </motion.div>
          ) : activeTab === 'attendance' ? (
            <motion.div 
              key="attendance-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Executive Grid: Filters, Search, Statistics and Department list */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Sidebar: Filter by Departments Board */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Department List Panel */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden relative">
                    <div className="bg-slate-900 px-5 py-4.5 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter size={13} className="text-amber-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider">Department roster</h3>
                      </div>
                      {selectedDepartment !== 'all' && (
                        <button 
                          onClick={() => setSelectedDepartment('all')}
                          className="text-[9px] font-black uppercase bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-all"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border-b border-rose-100 text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Select a department below to isolate lists:
                    </div>

                    {/* Department Interactive Option List */}
                    <div className="p-3 space-y-1.5 max-h-[385px] overflow-y-auto scrollbar-thin">
                      <button
                        onClick={() => setSelectedDepartment('all')}
                        className={cn(
                          "w-full px-4 py-3 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between pointer-events-auto border cursor-pointer",
                          selectedDepartment === 'all' 
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-600/10" 
                            : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 text-slate-600"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <School size={13} className={selectedDepartment === 'all' ? "text-white" : "text-indigo-600"} />
                          <span>All Departments</span>
                        </div>
                        {selectedDepartment === 'all' ? (
                          <CheckCheck size={14} className="text-amber-400" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {students.length}
                          </span>
                        )}
                      </button>

                      {DEPARTMENTS.map((dept) => {
                        const count = students.filter(s => s.department === dept).length;
                        const isSel = selectedDepartment.toLowerCase() === dept.toLowerCase();
                        return (
                          <button
                            key={dept}
                            onClick={() => setSelectedDepartment(dept)}
                            className={cn(
                              "w-full px-4 py-3 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between border cursor-pointer",
                              isSel 
                                ? "bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-600/15" 
                                : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50 text-slate-600"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              {getDepartmentIcon(dept)}
                              <span className="truncate">{dept}</span>
                            </div>
                            {isSel ? (
                              <CheckCheck size={14} className="text-amber-400" />
                            ) : (
                              <span className={cn(
                                "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0",
                                count > 0 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-400"
                              )}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prestige Stats Gauge for selected department */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">Isolated Filter statistics</p>
                    <h4 className="text-xs font-extrabold uppercase mt-1 text-slate-300">Selected: {selectedDepartment}</h4>
                    
                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl">
                        <span className="text-2xl font-black text-indigo-400 font-mono tracking-tight">{filteredStudents.length}</span>
                        <p className="text-[9px] font-extrabold uppercase text-slate-400 mt-1">Volunteers</p>
                      </div>
                      <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl">
                        <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">{filteredAttendance.length}</span>
                        <p className="text-[9px] font-extrabold uppercase text-slate-400 mt-1">Attendances</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Unit distribution bias:</span>
                        <span className="text-white font-mono font-bold">
                          {Math.round((filteredStudents.filter(s => s.unit === '36').length / (filteredStudents.length || 1)) * 100)}% Unit 36
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1 flex">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${(filteredStudents.filter(s => s.unit === '36').length / (filteredStudents.length || 1)) * 100}%` }}
                        />
                        <div 
                          className="h-full bg-amber-500" 
                          style={{ width: `${(filteredStudents.filter(s => s.unit === '94').length / (filteredStudents.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Area: Tables & Search & Program Dropdown */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Executive Action & Filter Toolbar */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
                    
                    {/* Sub-Tab Navigation Toggle inside Attendance Panel */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:max-w-sm">
                      <button 
                        onClick={() => { setActiveSubTab('records'); setSearchTerm(''); }}
                        className={cn(
                          "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
                          activeSubTab === 'records' 
                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        All College Attendance
                      </button>
                      <button 
                        onClick={() => { setActiveSubTab('volunteers'); setSearchTerm(''); }}
                        className={cn(
                          "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
                          activeSubTab === 'volunteers' 
                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        Registered Volunteers ({filteredStudents.length})
                      </button>
                    </div>

                    {/* Filters & Actions dropdown selection */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      
                      {/* Dropdown to select/isolate specific Programs */}
                      {activeSubTab === 'records' && (
                        <div className="relative w-full sm:w-52">
                          <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            className="w-full h-12 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer text-ellipsis overflow-hidden"
                          >
                            <option value="all">📁 All Campaigns</option>
                            {dynamicPrograms.map((prog) => (
                              <option key={prog} value={prog}>★ {prog}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="relative w-full sm:w-60">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                          type="text" 
                          placeholder={activeSubTab === 'records' ? "Search rosters..." : "Search students..."}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full h-12 bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-xs uppercase tracking-widest text-slate-700"
                        />
                      </div>

                      <button 
                        onClick={exportCSV}
                        className="w-full sm:w-auto h-12 px-5 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-900/10"
                        title="Export filtered records as CSV files with Academic signature"
                      >
                        <FileSpreadsheet size={15} /> 
                        <span>Download report</span>
                      </button>
                    </div>
                  </div>

                  {/* High Quality Table View Sheet */}
                  <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-md p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
                      <div>
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          {activeSubTab === 'records' ? (
                            <>
                              <CheckCheck size={18} className="text-emerald-500" />
                              <span>Verified attendance ledger book</span>
                            </>
                          ) : (
                            <>
                              <Users size={18} className="text-indigo-600" />
                              <span>NSS Enlistment registration book</span>
                            </>
                          )}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium">
                          Displaying <span className="text-indigo-600 font-bold">{activeSubTab === 'records' ? filteredAttendance.length : filteredStudents.length} authenticated lines</span> under <span className="font-extrabold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{selectedDepartment} department</span>
                        </p>
                      </div>

                      {/* Sorting Selection Tags */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black uppercase text-slate-400">Order by:</span>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/50 text-[9px] font-black uppercase tracking-wide">
                          <button
                            onClick={() => requestSort('name')}
                            className={cn("px-3 py-1.5 rounded-lg transition-all cursor-pointer", sortBy === 'name' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600')}
                          >
                            Name
                          </button>
                          <button
                            onClick={() => requestSort('department')}
                            className={cn("px-3 py-1.5 rounded-lg transition-all cursor-pointer", sortBy === 'department' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600')}
                          >
                            Department
                          </button>
                          {activeSubTab === 'volunteers' ? (
                            <button
                              onClick={() => requestSort('points')}
                              className={cn("px-3 py-1.5 rounded-lg transition-all cursor-pointer", sortBy === 'points' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600')}
                            >
                              Points
                            </button>
                          ) : (
                            <button
                              onClick={() => requestSort('date')}
                              className={cn("px-3 py-1.5 rounded-lg transition-all cursor-pointer", sortBy === 'date' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600')}
                            >
                              Marks Date
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      {activeSubTab === 'records' ? (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <th className="pb-3 px-4">Volunteer Student</th>
                              <th className="pb-3 px-4">academic department</th>
                              <th className="pb-3 px-4">nss assigned unit</th>
                              <th className="pb-3 px-4">Campaign/Program name</th>
                              <th className="pb-3 px-4 text-right">Academic ledger timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredAttendance.length > 0 ? (
                              filteredAttendance.map((rec) => (
                                <tr key={rec.id} className="hover:bg-indigo-50/20 transition-all group">
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md shadow-indigo-600/10">
                                        {rec.volunteer_name?.charAt(0) || '?'}
                                      </div>
                                      <div>
                                        <span className="font-black text-xs uppercase text-slate-800 tracking-tight block">{rec.volunteer_name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 tracking-wider">SECURE_MATCH_ID: #{rec.id?.substring(0, 5) || 'OK'}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="px-3 py-1 bg-indigo-50/50 border border-indigo-100/60 text-indigo-700 text-[9px] font-black uppercase rounded-lg">
                                      {rec.department || 'General'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-xs font-bold text-slate-500">Unit {rec.unit}</td>
                                  <td className="py-4 px-4">
                                    <span className="text-xs text-slate-900 font-bold uppercase tracking-tight flex items-center gap-1.5">
                                      <Award size={12} className="text-medium text-amber-500" />
                                      {rec.event_name}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <span className="block text-[11px] text-slate-500 font-mono font-bold">
                                      {new Date(rec.created_at).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mt-0.5">Verified Patron Approved</span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-24 text-center">
                                  <ShieldAlert size={28} className="mx-auto text-slate-300 mb-3" />
                                  <p className="text-xs uppercase tracking-widest font-black text-slate-400">Ledger empty</p>
                                  <p className="text-[11px] text-slate-400 mt-1 uppercase">No attendance inputs match your filtered constraints</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <th className="pb-3 px-4">Student profile</th>
                              <th className="pb-3 px-4">academic department</th>
                              <th className="pb-3 px-4">Security Contact Detail</th>
                              <th className="pb-3 px-4">nss unit code</th>
                              <th className="pb-3 px-4 text-right">accumulated points</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredStudents.length > 0 ? (
                              filteredStudents.map((stud) => (
                                <tr key={stud.id} className="hover:bg-indigo-50/20 transition-all group">
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md">
                                        {stud.full_name?.charAt(0) || '?'}
                                      </div>
                                      <div>
                                        <p className="font-extrabold text-xs uppercase text-slate-800 tracking-tight leading-none mb-1">{stud.full_name}</p>
                                        <p className="text-[9px] font-mono text-slate-400 lowercase">@{stud.username}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-black uppercase rounded-lg">
                                      {stud.department}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-xs font-mono font-bold text-slate-600">{stud.mobile}</td>
                                  <td className="py-4 px-4 text-xs text-slate-400 font-bold uppercase">Unit ID: {stud.unit}</td>
                                  <td className="py-4 px-4 text-right">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-extrabold rounded-lg select-none">
                                      <Award size={11} className="text-amber-500 animate-pulse" />
                                      {stud.points} PTS
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-24 text-center">
                                  <ShieldAlert size={28} className="mx-auto text-slate-300 mb-3" />
                                  <p className="text-xs uppercase tracking-widest font-black text-slate-400">Roster empty</p>
                                  <p className="text-[11px] text-slate-400 mt-1 uppercase">No profiles currently fit these department variables</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          ) : activeTab === 'announcements' ? (
            <motion.div 
              key="announcements-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/20 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                  <Bell size={120} />
                </div>
                
                <div className="space-y-3 max-w-3xl relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    👑 Direct Patron Decree Console
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Executive Announcements Room</h2>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Broadcast critical executive updates, camp schedules, and college directions. Any entry published here is stamped with <strong>Patron Clearance Authority</strong> and locks automatically onto every registered student screen instantly.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/80 shadow-md">
                <AnnouncementsAdmin />
              </div>
            </motion.div>
          ) : activeTab === 'highlights' ? (
            <motion.div 
              key="highlights-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-amber-950 to-slate-900 border border-amber-500/20 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                  <Trophy size={120} />
                </div>

                <div className="space-y-3 max-w-3xl relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    🏆 College Service Hall of Fame
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">NSS Service Excellence Highlights</h2>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Authorize and showcase flagship campaign photo cards, state award details, and memories directly on the public visitors home interface. Keep potential stakeholders, inspectors, and the community informed of college achievements.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/80 shadow-md">
                <HighlightsAdmin />
              </div>
            </motion.div>
          ) : activeTab === 'stats' ? (
            <motion.div 
              key="stats-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Premium Stats Bento Grid - Top executive statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md flex items-center gap-5 hover:border-indigo-200 transition-all group">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 group-hover:scale-105 transition-transform">
                    <Users size={24} />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{students.length}</span>
                    <p className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider leading-none">Registered volunteers</p>
                    <span className="text-[9px] text-emerald-600 font-bold uppercase">100% Verified</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md flex items-center gap-5 hover:border-emerald-200 transition-all group">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 text-emerald-600 group-hover:scale-105 transition-transform">
                    <CheckCheck size={24} />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{attendance.length}</span>
                    <p className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider leading-none">Verified attendances</p>
                    <span className="text-[9px] text-indigo-600 font-bold uppercase">Points ledger match</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md flex items-center gap-5 hover:border-amber-200 transition-all group">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/50 text-amber-500 group-hover:scale-105 transition-transform">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{dynamicPrograms.length}</span>
                    <p className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider leading-none">Flagship Operations</p>
                    <span className="text-[9px] text-amber-600 font-bold uppercase">Campus approved</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md flex items-center gap-5 hover:border-rose-200 transition-all group">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100/50 text-rose-500 group-hover:scale-105 transition-transform">
                    <Award size={24} />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {students.length > 0 ? (attendance.length / students.length).toFixed(1) : '0'}
                    </span>
                    <p className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider leading-none">Att. / Volunteer Ratio</p>
                    <span className="text-[9px] text-rose-600 font-bold uppercase">Active response rate</span>
                  </div>
                </div>

              </div>

              {/* Department breakdown & NSS Units Graphic panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Custom Graphic Panel: Visual Progress Bar Distribution */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-md space-y-6">
                  <div>
                    <span className="bg-gradient-to-r from-indigo-50 to-indigo-100/80 border border-indigo-200/50 text-indigo-700 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                      Domain Analysis
                    </span>
                    <h3 className="text-base font-black text-slate-950 uppercase tracking-wider mt-2">Volunteer density by department</h3>
                    <p className="text-xs text-slate-400 mt-1">Isolate the absolute ratio of student contributions in each college faculty:</p>
                  </div>
                  
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {DEPARTMENTS.map((dept) => {
                      const count = students.filter(s => s.department === dept).length;
                      const max = Math.max(...DEPARTMENTS.map(d => students.filter(s => s.department === d).length), 1);
                      const percentage = (count / max) * 100;
                      return (
                        <div key={dept} className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold uppercase text-slate-700 flex items-center gap-2">
                              {getDepartmentIcon(dept)}
                              {dept} Faculty
                            </span>
                            <span className="font-bold text-indigo-700 font-mono">{count} Active</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-1 text-[8px] relative">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* NSS Units Status & Executive Insights */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-md space-y-8 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div>
                      <span className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200/50 text-amber-700 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                        Operational Divisions
                      </span>
                      <h3 className="text-base font-black text-slate-950 uppercase tracking-wider mt-2">NSS Unit 36 & Unit 94 audits</h3>
                      <p className="text-xs text-slate-400 mt-1">Cross-reference state reporting standards specifically on assigned divisions.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {['36', '94'].map((unitNum) => {
                        const count = students.filter(s => s.unit === unitNum).length;
                        const atts = attendance.filter(a => a.unit === unitNum).length;
                        return (
                          <div key={unitNum} className="p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-indigo-100/40">
                              <h4 className="text-xs font-black uppercase text-indigo-700 flex items-center gap-2.5">
                                <ShieldCheck size={14} className="text-indigo-600" /> 
                                <span>Unit Code {unitNum}</span>
                              </h4>
                              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                Live Audit
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Registered Roster</p>
                                <p className="text-base font-black text-slate-900 font-mono tracking-tight mt-0.5">{count} Students</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Attended Markings</p>
                                <p className="text-base font-black text-slate-900 font-mono tracking-tight mt-0.5">{atts} Actions</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Principal executive clearance sign-off visual */}
                  <div className="bg-slate-950 text-white p-6 rounded-2xl relative overflow-hidden border border-white/5 shadow-lg mt-6">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <School size={80} />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-amber-400 mb-0.5">official digital seal</p>
                    <h4 className="text-xs font-extrabold uppercase text-white tracking-wide">Principal Despatch Desk Stamp</h4>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      "This dashboard compiles active credentials from authorized college database tables. Reports are cryptographically bound to NSS college registration protocols."
                    </p>
                    <div className="text-right mt-4 pt-4 border-t border-white/5">
                      <span className="text-[10px] font-serif tracking-widest italic text-amber-300 block">Dr. NSS Principal</span>
                      <span className="text-[8px] font-mono tracking-wider uppercase text-slate-400 block mt-1">Council Signature Clear</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="seal-room-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <CertificatesSealPrincipal />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* College motto foot footer */}
      <footer className="bg-slate-950 text-slate-500 py-10 text-center text-xs mt-auto shrink-0 border-t border-white/5 select-none">
        <p className="font-extrabold uppercase tracking-[0.25em] text-[10px] text-slate-300 mb-1">National Service Scheme (NSS)</p>
        <p className="italic text-[11px] text-slate-400">"Not Me But You" | NSS College Ottapalam</p>
        <p className="text-[9px] text-slate-600 mt-4 tracking-widest uppercase">Level-5 Patron Control Interface &copy; 2026</p>
      </footer>

    </div>
  );
}
