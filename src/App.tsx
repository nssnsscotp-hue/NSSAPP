import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BadgeCheck, X } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';
import SOS from './pages/SOS';
import BloodBank from './pages/BloodBank';
import Complaints from './pages/Complaints';
import DrugReport from './pages/DrugReport';
import Gallery from './pages/Gallery';
import Help from './pages/Help';
import About from './pages/About';
import AdminDashboard from './pages/Admin/Dashboard';
import QuizSystem from './pages/Quiz';
import Reports from './pages/Reports';
import CalendarPage from './pages/CalendarPage';
import Leaderboard from './pages/Leaderboard';
import VolunteerID from './pages/VolunteerID';
import PerformanceDashboard from './pages/Performance';
import Resources from './pages/Resources';
import HomeArrival from './pages/HomeArrival';
import AlumniNetwork from './pages/Alumni';
import NSSAssistant from './components/Assistant/NSSAssistant';
import Profile from './pages/Profile';
import HODDashboard from './pages/HOD/HODDashboard';
import PrincipalDashboard from './pages/Principal/PrincipalDashboard';
import Emergency from './pages/Emergency';
import AppNotificationListener from './components/layout/AppNotificationListener';

// Layout wrapper to conditionally show navbar with welcome popup capability
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideNavbarOn = ['/login', '/hod', '/principal'];
  const shouldHideNavbar = hideNavbarOn.includes(location.pathname) || location.pathname.startsWith('/hod') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/principal');
  const shouldHideAssistant = shouldHideNavbar;

  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (localStorage.getItem("justLoggedIn") === "true") {
      const userVal = localStorage.getItem("user") || "Volunteer";
      const nameVal = localStorage.getItem("name") || "NSS Volunteer";
      const roleVal = localStorage.getItem("role") || "volunteer";
      
      setUsername(userVal);
      setFullName(nameVal);
      setRole(roleVal);
      setShowPopup(true);
      
      localStorage.removeItem("justLoggedIn");
    }
  }, [location.pathname]);

  const getRoleLabel = (r: string) => {
    switch(r.toLowerCase()) {
      case 'admin': return 'System Administrator';
      case 'principal': return 'College Principal & Authority';
      case 'hod': return 'Academic Head of Department';
      default: return 'Enrolled NSS Volunteer';
    }
  };

  return (
    <>
      <AppNotificationListener />
      {!shouldHideNavbar && <Navbar />}
      <main>
        {children}
      </main>
      {!shouldHideAssistant && <NSSAssistant />}

      {/* SUCCESS WELCOME POPUP MODAL */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop blurring the behind content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Modal Card content */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] border border-slate-200/80 shadow-2xl p-8 overflow-hidden text-slate-800"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800" />
              
              {/* Decorative radial background flare */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              {/* Dismiss X Button */}
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="relative z-10 text-center space-y-5">
                {/* Visual Accent Circle */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
                  <Sparkles size={28} className="text-blue-600 stroke-[1.8]" />
                </div>

                {/* Scope Metadata */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                  <BadgeCheck size={11} className="text-blue-600" />
                  <span>Secure Portal Authentication</span>
                </div>

                {/* Greeting messaging */}
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                    Welcome Back!
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    {getRoleLabel(role)}
                  </p>
                </div>

                {/* Identity Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Verified User Name</span>
                  <div className="text-base font-black text-indigo-700 uppercase tracking-tight">
                    {fullName}
                  </div>
                  <div className="text-[9.5px] font-mono font-medium text-slate-400">
                    ID Ref: @{username}
                  </div>
                </div>

                {/* Official Motto / Affirmation */}
                <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-350 italic animate-pulse">
                  "Not Me But You"
                </span>

                {/* Core Control Action Button */}
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full h-13 bg-slate-950 hover:bg-slate-900 border border-transparent hover:border-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  <span>Enter Control Workspace</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Publicly Accessible Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/drug-report" element={<DrugReport />} />
          <Route path="/emergency" element={<Emergency />} />
          
          <Route element={<ProtectedRoute />}>
            {/* Protected Volunteer Routes */}
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/bloodbank" element={<BloodBank />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/quiz" element={<QuizSystem />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/id-card" element={<VolunteerID />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/performance" element={<PerformanceDashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/home-arrival" element={<HomeArrival />} />
            <Route path="/alumni" element={<AlumniNetwork />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute role="hod" />}>
            <Route path="/hod" element={<HODDashboard />} />
          </Route>

          <Route element={<ProtectedRoute role="principal" />}>
            <Route path="/principal" element={<PrincipalDashboard />} />
          </Route>

          {/* Catch-all route to handle 404s/mismatches */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
              <div className="text-center">
                <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
                <p className="text-slate-500 mb-8 uppercase tracking-widest font-bold">Route Not Found</p>
                <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
