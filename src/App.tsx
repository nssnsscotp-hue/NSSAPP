import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';
import SOS from './pages/SOS';
import BloodBank from './pages/BloodBank';
import Complaints from './pages/Complaints';
import Gallery from './pages/Gallery';
import Help from './pages/Help';
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

// Layout wrapper to conditionally show navbar
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideNavbarOn = ['/login'];
  const shouldHideNavbar = hideNavbarOn.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main>
        {children}
      </main>
      {!shouldHideNavbar && <NSSAssistant />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            {/* User Routes */}
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/bloodbank" element={<BloodBank />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/help" element={<Help />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/quiz" element={<QuizSystem />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/id-card" element={<VolunteerID />} />
            <Route path="/performance" element={<PerformanceDashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/home-arrival" element={<HomeArrival />} />
            <Route path="/alumni" element={<AlumniNetwork />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
