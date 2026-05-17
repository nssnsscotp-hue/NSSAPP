import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Bell, ShieldAlert, Heart, Trophy, BarChart3, Home,
  Plus, Settings, CheckCircle, XCircle, Loader2, Calendar, FolderOpen,
  Image as ImageIcon, Contact, GraduationCap, HelpCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Sub-components
import HighlightsAdmin from './HighlightsAdmin';
import AnnouncementsAdmin from './AnnouncementsAdmin';
import ComplaintsAdmin from './ComplaintsAdmin';
import AttendanceAdmin from './AttendanceAdmin';
import RegistrationAdmin from './RegistrationAdmin';
import QuizAdmin from './QuizAdmin';
import GalleryAdmin from './GalleryAdmin';

import AlumniAdmin from './AlumniAdmin';
import BloodAdmin from './BloodAdmin';
import VolunteerIDAdmin from './VolunteerIDAdmin';
import HomeArrivalAdmin from './HomeArrivalAdmin';

type AdminTab = 'overview' | 'highlights' | 'announcements' | 'complaints' | 'attendance' | 'volunteers' | 'quiz' | 'gallery' | 'alumni' | 'blood' | 'ids' | 'arrival';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'highlights', name: 'Highlights', icon: Trophy },
    { id: 'announcements', name: 'Announcements', icon: Bell },
    { id: 'arrival', name: 'Safety Status', icon: Home },
    { id: 'complaints', name: 'Complaints', icon: ShieldAlert },
    { id: 'attendance', name: 'Attendance', icon: CheckCircle },
    { id: 'gallery', name: 'Activity Gallery', icon: ImageIcon },
    { id: 'volunteers', name: 'Onboarding', icon: Users },
    { id: 'ids', name: 'Digitial IDs', icon: Contact },
    { id: 'alumni', name: 'Alumni Network', icon: GraduationCap },
    { id: 'blood', name: 'Blood Alerts', icon: Heart },
    { id: 'quiz', name: 'Quiz Builder', icon: Trophy },
  ];

  const stats = [
    { label: 'Admin Requests', value: '4', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Complaints', value: '12', icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Quizzes', value: '3', icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'New Announcements', value: '2', icon: Bell, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Mobile: Horizontal Scroll, Desktop: Side fixed */}
      <aside className="w-full md:w-72 bg-slate-900 text-white md:min-h-screen sticky top-16 md:top-16 z-40 overflow-x-auto md:overflow-x-visible">
        <div className="p-4 md:p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="flex -space-x-3 shrink-0">
              <div className="w-10 h-10 bg-white rounded-xl p-1 flex items-center justify-center transform -rotate-6 shadow-xl">
                <img src="https://i.ibb.co/k6WG4cv2/1000350739-removebg-preview.png" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="w-10 h-10 bg-white rounded-xl p-1 flex items-center justify-center transform rotate-6 shadow-xl border border-slate-100">
                <img src="https://i.postimg.cc/Xq7KPnqK/pngkey-com-allu-arjun-png-2479287.png" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase italic leading-none">Admin Hub</h1>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Units 36 & 94</p>
            </div>
          </div>
          
          <h2 className="hidden md:block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Management</h2>
          <nav className="flex md:flex-col gap-2 md:space-y-1 pb-2 md:pb-0">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                  activeTab === item.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 min-w-0">
        {activeTab === 'overview' && (
          <div className="space-y-8 md:space-y-10">
            <header>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase">Admin Console</h1>
              <p className="text-slate-500 text-sm mt-1">Full control over Units 36 & 94 digital assets.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                  <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
                <div className="space-y-6">
                  {[
                    "New attendance marked for 'Camp 2025'",
                    "Announcement 'Blood Drive' published",
                    "Complaint #1032 marked as resolved",
                    "Volunteer 'Rahul K' registered"
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <p className="text-slate-600 text-sm font-medium">{activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/20">
                <h3 className="text-lg font-bold mb-6">System Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                    <span className="text-sm font-medium opacity-70">Frontend Services</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                    <span className="text-sm font-medium opacity-70">Database Sync</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       Synced
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                    <span className="text-sm font-medium opacity-70">Auth Provider</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'highlights' && <HighlightsAdmin />}
        {activeTab === 'announcements' && <AnnouncementsAdmin />}
        {activeTab === 'complaints' && <ComplaintsAdmin />}
        {activeTab === 'attendance' && <AttendanceAdmin />}
        {activeTab === 'volunteers' && <RegistrationAdmin />}
        {activeTab === 'ids' && <VolunteerIDAdmin />}
        {activeTab === 'alumni' && <AlumniAdmin />}
        {activeTab === 'blood' && <BloodAdmin />}
        {activeTab === 'quiz' && <QuizAdmin />}
        {activeTab === 'gallery' && <GalleryAdmin />}
        {activeTab === 'arrival' && <HomeArrivalAdmin />}
      </main>
    </div>
  );
}
