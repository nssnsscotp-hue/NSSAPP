import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, MessageSquare, Send, Mail, MapPin, Phone, CheckCircle2, Loader2,
  Compass, Users, ShieldCheck, GraduationCap, User, Workflow, ArrowRight,
  BookOpen, Terminal, CheckSquare, Bell, Heart, Contact, Sparkles, HelpCircle as HelpIcon,
  BookOpen as BookIcon, ClipboardList, ShieldAlert, Award, ChevronDown, Check, Activity,
  Info, ExternalLink, Library, Download, FileText, CheckSquare as CheckIcon, AlertTriangle,
  Search, Tag
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';
import BackButton from '../components/layout/BackButton';

interface SitemapNode {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  description: string;
  instructions: string;
  status: 'Public' | 'Protected' | 'Restricted' | 'Executive';
}

interface FAQItem {
  id: string;
  q: string;
  a: string;
  category: 'volunteer' | 'admin' | 'hod' | 'principal' | 'blood_safety';
  tags: string[];
}

export default function Help() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'volunteer' | 'admin' | 'hod' | 'principal'>('volunteer');
  const [selectedNode, setSelectedNode] = useState<string>('attendance');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  
  // Interactive FAQ States
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([formData]);
      
      if (error) throw error;

      setSuccess(true);
      setFormData({ name: '', email: '', role: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  const contacts = [
    { icon: Mail, label: 'Units Email', value: 'nssnsscotp@gmail.com', href: 'mailto:nssnsscotp@gmail.com' },
    { icon: Phone, label: 'College Office', value: '0466 224 4382', href: 'tel:04662244382' },
    { icon: MapPin, label: 'Location Office', value: 'NSS Room, Main Block Ground Floor', href: 'https://maps.app.goo.gl/CdwcxL8c6xBKExyP7?g_st=ac' },
  ];

  // Specific Sitemap Nodes per role
  const sitemapData: Record<'volunteer' | 'admin' | 'hod' | 'principal', SitemapNode[]> = {
    volunteer: [
      {
        id: 'profile',
        label: 'Volunteer Profile',
        path: '/profile',
        icon: User,
        description: 'Comprehensive profile database centering volunteer academic logs, designated Units, and blood group flags.',
        instructions: 'Setup profile during registration. It acts as the statutory ID roster on campus resources. Use it to check your calculated hours progress.',
        status: 'Protected'
      },
      {
        id: 'attendance',
        label: 'Attendance & Logs',
        path: '/attendance',
        icon: CheckSquare,
        description: 'Primary register logging hours for community service, campus cleaning, environmental drives, and social camps.',
        instructions: 'Fill the calendar date tracker, choose the activity item type, describe physical output, and submit. Status transitions from "Pending HOD Verification" to "Admin Completed" with approved work hours.',
        status: 'Protected'
      },
      {
        id: 'bloodbank',
        label: 'NSS Blood Bank',
        path: '/bloodbank',
        icon: Heart,
        description: 'A comprehensive live registry pairing local Ottapalam Taluk hospitals, active donors, and immediate family contacts.',
        instructions: 'Toggle your "Available Donor" checkbox in profile. Search for regional blood donors filtered by precise blood types. Administrators list blood request banners directly on the homepage notice board ticker.',
        status: 'Protected'
      },
      {
        id: 'sos',
        label: 'SOS Panic Safety',
        path: '/sos',
        icon: ShieldAlert,
        description: 'Instant, secure coordinates transmission mechanism to coordinate emergency assistance during camps.',
        instructions: 'Press and hold down the high-visibility RED emergency button during hazardous camp operations. It fires an immediate high-priority alarm trace showing your status to administrative dashboards.',
        status: 'Protected'
      },
      {
        id: 'id_card',
        label: 'Digital ID Card',
        path: '/id-card',
        icon: Contact,
        description: 'Personalized high-contrast digital identity badge displaying statutory enrolment indices.',
        instructions: 'Generates automatically if administrative profile records are active. Features secure unique credential barcodes and Grade metrics. Export or snap details dynamically.',
        status: 'Protected'
      },
      {
        id: 'quiz',
        label: 'Daily Quiz Hub',
        path: '/quiz',
        icon: HelpIcon,
        description: 'Interactive gamified learning center covering Indian Constitution, history, social schemes, and guidelines with dynamic ranks.',
        instructions: 'Complete daily questions. Earning high scores advances your standing in the global College Units Leaderboard.',
        status: 'Protected'
      },
      {
        id: 'home_arrival',
        label: 'Safe Home Arrival',
        path: '/home-arrival',
        icon: Activity,
        description: 'Mandatory tracking status checking volunteer transit safety returning from distance camps.',
        instructions: 'Once home, select your current security status and submit location checkpoint logs. It gives real-time relief markers to unit directors overseeing remote operations.',
        status: 'Protected'
      },
      {
        id: 'resources',
        label: 'Guidelines & Files',
        path: '/resources',
        icon: Library,
        description: 'Direct files resource library offering NSS Regular activity manuals, camp sheets, and reports templates.',
        instructions: 'Browse resources, click download for PDF guidelines or survey reports templates. Essential for filing certified camp diaries.',
        status: 'Protected'
      },
      {
        id: 'alumni',
        label: 'Alumni Network',
        path: '/alumni',
        icon: GraduationCap,
        description: 'Connect, network, and exchange experiences with former NSS senior volunteers.',
        instructions: 'Access former volunteer lists, read their career placements, filter by previous executive batch years, or send messaging inquiries for community employment drives.',
        status: 'Protected'
      }
    ],
    admin: [
      {
        id: 'central_command',
        label: 'Admin Command Deck',
        path: '/admin',
        icon: Terminal,
        description: 'Supreme operations center outlining core metrics, verified headcounts, active warnings, and general database statuses.',
        instructions: 'Access metrics summaries, track live registers, identify pending approvals, configure system thresholds, and issue urgent broadcasts.',
        status: 'Restricted'
      },
      {
        id: 'user_approval',
        label: 'Roster Clearance Unit',
        path: '/admin?tab=users',
        icon: Users,
        description: 'Profiles audit queue designed to authorize system accounts and assign dynamic academic departments.',
        instructions: 'Filter pending signups, check student credentials, click "Approve" to activate their portal ID, assign Unit 36 or Unit 94 groups, or revoke outdated profiles.',
        status: 'Restricted'
      },
      {
        id: 'hours_grant',
        label: 'Hour Credits Dispatcher',
        path: '/admin?tab=attendance',
        icon: ClipboardList,
        description: 'Central validation dashboard managing submitted service hours and verifying diaries.',
        instructions: 'Review work hours logged by volunteers. Double check HOD department clearance flags, select and edit verified hours, and approve to record statutory operational units.',
        status: 'Restricted'
      },
      {
        id: 'sos_response',
        label: 'SOS Emergency Center',
        path: '/admin?tab=sos',
        icon: ShieldAlert,
        description: 'GPS coordinate alarm cockpit that triggers alert status protocols on campus registries.',
        instructions: 'Monitor the map triggers. Clicking are alarm elements will reveal caller information, phone hotline contacts, and time flags to guide prompt emergency dispatches.',
        status: 'Restricted'
      },
      {
        id: 'notice_board',
        label: 'Circulation & Notices',
        path: '/admin?tab=announcements',
        icon: Bell,
        description: 'Administrative portal publishing emergency blood supply needs or official activities memos.',
        instructions: 'Compose critical notices, specify blood donor group alerts to publish live on the homepage ticker, and append downloadable attachments into resource folders.',
        status: 'Restricted'
      }
    ],
    hod: [
      {
        id: 'hod_dashboard',
        label: 'HOD Overview Desk',
        path: '/hod',
        icon: ShieldCheck,
        description: 'Departmental command deck detailing active volunteers tracking parameters inside your scope.',
        instructions: 'View department-specific metrics including student volunteers count, cumulative hours, emergency flags, and specific pending approvals.',
        status: 'Restricted'
      },
      {
        id: 'department_verify',
        label: 'Hour Sign-Offs',
        path: '/hod?view=attendance',
        icon: CheckSquare,
        description: 'Academic validation layer ensuring mapped activities match your office records.',
        instructions: 'Select students belonging to your academic field. Inspect logged details, check description authenticity, and toggle HOD clearance. Highly required before Admin hour distribution.',
        status: 'Restricted'
      },
      {
        id: 'student_reports',
        label: 'Volunteers Metrics List',
        path: '/hod?view=students',
        icon: FileText,
        description: 'Tabular database displaying all enrolled department volunteers, their current activity grades, and contact files.',
        instructions: 'Export list records, monitor department performance averages, or write feedback logs for students who require corrective support.',
        status: 'Restricted'
      }
    ],
    principal: [
      {
        id: 'principal_dashboard',
        label: 'Principal Central Panel',
        path: '/principal',
        icon: GraduationCap,
        description: 'Supreme college administration dashboard monitoring campus Units 36 & 94.',
        instructions: 'Provides direct operational oversight. Audits total volunteer counts, active donor availability pools, global camps completed, and logs state.',
        status: 'Executive'
      },
      {
        id: 'circular_directives',
        label: 'Executive Directives Hub',
        path: '/principal',
        icon: Info,
        description: 'Official publisher delivering statutory circulars, institutional rules, and campus-wide emergency directives.',
        instructions: 'Write global administrative memos or official unit orders. Directives appear instantly on Homepage and Admin notices panels.',
        status: 'Executive'
      },
      {
        id: 'system_audits',
        label: 'Audits & Action Logs',
        path: '/principal',
        icon: Workflow,
        description: 'Complete transparency auditor tracing grievance reports, SOS incident databases, and performance curves.',
        instructions: 'Review complaints logs from student panels, trace resolution comments added by Admin program offices, and inspect historical activity registers.',
        status: 'Executive'
      }
    ]
  };

  const portalfaqs: FAQItem[] = [
    {
      id: 'faq-hours-approval',
      q: "How are my work hours evaluated, verified, and approved?",
      a: "Hours flow through a robust 3-stage validation chain strictly aligned with university standards: \n1. Volunteer Registration: You post active task hours with detailed logs on the Attendance portal.\n2. HOD Clearance: Your designated Academic Head of Department (HOD) reviews the authenticity of the task content.\n3. Program Officer Credits: Administrative Program Officers perform final evaluation, allocating approved statutory credit hours. These accumulate toward official Calicut University certificates.",
      category: 'volunteer',
      tags: ['Attendance', 'Hours', 'Grades']
    },
    {
      id: 'faq-profile-update',
      q: "How can I update my academic department if it was configured incorrectly?",
      a: "Navigate to the 'My Profile' menu. Use the Profile editor options to select your correct Class Department and click Save. All pending attendance logs route dynamically to your newly assigned HOD's dashboard for verification.",
      category: 'volunteer',
      tags: ['Profile', 'Registration', 'Department']
    },
    {
      id: 'faq-emergency-alert',
      q: "Who is notified when I trigger a camp SOS Emergency Panic command?",
      a: "The SOS emergency panic system routes your detailed GPS coordinates and volunteer profile information in real-time to active Program Officers' admin terminals. This ensures immediate camp coordinators can organize rapid local dispatches.",
      category: 'blood_safety',
      tags: ['SOS Emergency', 'Safety', 'GPS Locator']
    },
    {
      id: 'faq-safe-arrival',
      q: "What is the mandatory 'Safe Home Arrival' tracking protocol?",
      a: "Following distance campaigns, night drives, or rural camps, all student volunteers must activate their transit status using the 'Safe Home Arrival' map toggle. Logging your status as 'Safe at Home' sends immediate reassurance flags to camp directors' central monitors.",
      category: 'volunteer',
      tags: ['Volunteer', 'Safety Tracker', 'Camp Transit']
    },
    {
      id: 'faq-blood-bank',
      q: "How is donor privacy managed inside the dynamic NSS Blood Bank registry?",
      a: "Volunteers retain absolute control over blood group visibility. Toggling 'Available Donor' in your profile allows other designated student leaders to search your details during neighborhood medical crisis events. Program Officers also dispatch live emergency banner alerts to the homepage notices ticker.",
      category: 'blood_safety',
      tags: ['Blood Bank', 'Donors List', 'Medical Support']
    },
    {
      id: 'faq-hod-clearance',
      q: "What is expected of Academic HODs under the verification program?",
      a: "HODs access their dashboard to verify academic attendance registers mapping to activities performed by student volunteers under their department. Verifying hours guarantees institutional academic authenticity before sending credits onto the central PO Office.",
      category: 'hod',
      tags: ['HOD Clearance', 'Class Verification']
    },
    {
      id: 'faq-admin-roster',
      q: "How does the Admin command deck evaluate newly registered accounts?",
      a: "Admins (Program Officers) verify student signup requests against the official college catalog. Selecting 'Approve' activates the volunteer's unique Digital ID card, grants database permissions, and enrolls them into either Unit 36 or Unit 94 streams.",
      category: 'admin',
      tags: ['Admin Deck', 'Student Clearance', 'Unit Assignment']
    },
    {
      id: 'faq-principal-directives',
      q: "What administrative capabilities does the College Principal command?",
      a: "The Principal acts as the Supreme Executive Director. They command cross-unit statistics, audit logged student grievances, track live emergency operations databases, and issue mandatory institutional circulars on the announcements board.",
      category: 'principal',
      tags: ['Principal Panel', 'Supervisory Audit', 'Circulars']
    }
  ];

  // FAQ Filtering Logic
  const filteredFaqs = portalfaqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                          faq.tags.some(t => t.toLowerCase().includes(faqSearchQuery.toLowerCase()));
    
    const matchesCategory = selectedFaqCategory === 'all' || faq.category === selectedFaqCategory;
    
    return matchesSearch && matchesCategory;
  });

  const faqCategories = [
    { value: 'all', label: 'All Questions' },
    { value: 'volunteer', label: 'Student Volunteers' },
    { value: 'admin', label: 'Program Officers' },
    { value: 'hod', label: 'HODs Clearance' },
    { value: 'principal', label: 'Principal & Audit' },
    { value: 'blood_safety', label: 'Safety & Blood Bank' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 animate-fade-in">
      
      {/* Dynamic Immersive Header */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 text-white py-14 sm:py-20 relative overflow-hidden shadow-2xl border-b border-indigo-950/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 flex justify-start relative z-10">
          <BackButton />
        </div>
        
        {/* Ambient background glow */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-20 left-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="inline-flex p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 mb-2 shadow-inner"
          >
            <Compass size={32} className="text-emerald-400 animate-spin-slow" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase">
            Portal Guide & Sitemap
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Welcome to the NSS College Ottapalam Portal. Access interactive sitemaps, system data guides, execution pipelines, and direct support desks corresponding to all system roles.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-mono tracking-widest uppercase text-slate-200 border border-white/5">Units 36 & 94</span>
            <span className="px-2.5 py-1 bg-emerald-500/20 rounded-full text-[9px] font-mono tracking-widest uppercase text-emerald-300 border border-emerald-500/20">Calicut University Approved</span>
            <span className="px-2.5 py-1 bg-indigo-500/20 rounded-full text-[9px] font-mono tracking-widest uppercase text-indigo-300 border border-indigo-500/20 font-bold">DIGITAL FRAMEWORK</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">

        {/* SECTION 1: ROLE SPECIFIC SITE MAP & GUIDE */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-606 text-emerald-600 font-sans">Step-by-Step Operations</div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">Operational Role Matrix</h2>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md">
              Toggle between different institutional categories to explore their personalized digital pathways and sitemap logs.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {(['volunteer', 'admin', 'hod', 'principal'] as const).map((roleKey) => {
              const config = {
                volunteer: { label: 'Volunteer/Student', icon: User, color: 'border-blue-500 text-blue-700 bg-blue-50' },
                admin: { label: 'Admin (PO)', icon: Terminal, color: 'border-indigo-500 text-indigo-700 bg-indigo-50' },
                hod: { label: 'HOD Clearance', icon: ShieldCheck, color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
                principal: { label: 'Principal Exec', icon: GraduationCap, color: 'border-rose-500 text-rose-700 bg-rose-50' }
              }[roleKey];

              const isActive = activeTab === roleKey;

              return (
                <button
                  key={roleKey}
                  onClick={() => {
                    setActiveTab(roleKey);
                    setSelectedNode(sitemapData[roleKey][0]?.id || '');
                  }}
                  className={cn(
                    "flex items-center gap-2.5 p-3 sm:p-4 rounded-2xl border transition-all duration-300 text-left outline-none",
                    isActive 
                      ? `${config.color} border-2 font-black shadow-lg scale-[1.02]` 
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold"
                  )}
                >
                  <config.icon size={18} className={cn("shrink-0", isActive ? "animate-pulse" : "")} />
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider">{config.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Visual Interactive Map Nodes of Selected Role */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-150 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Interactive Map Nodes</h3>
                </div>
                <span className="text-[9px] font-mono tracking-wider uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Click any node to reveal guide docs</span>
              </div>

              {/* Sitemap Node Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {sitemapData[activeTab].map((node) => {
                  const isNodeSelected = selectedNode === node.id;
                  const NodeIcon = node.icon;
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left flex items-start gap-3 transition-all outline-none relative group",
                        isNodeSelected 
                          ? "border-emerald-500 bg-emerald-50/50 shadow-md ring-1 ring-emerald-400" 
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-lg shrink-0 transition-all",
                        isNodeSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-650 group-hover:bg-slate-200"
                      )}>
                        <NodeIcon size={16} />
                      </div>
                      <div className="space-y-0.5 max-w-[80%]">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                          {node.label}
                          {isNodeSelected && <Check size={11} className="text-emerald-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{node.path}</p>
                        <span className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider font-semibold mt-1",
                          node.status === 'Public' ? 'bg-emerald-100 text-emerald-800' :
                          node.status === 'Protected' ? 'bg-sky-100 text-sky-800' :
                          node.status === 'Restricted' ? 'bg-orange-100 text-orange-850' : 'bg-rose-100 text-rose-800'
                        )}>
                          {node.status}
                        </span>
                      </div>

                      {/* Connection decoration helper */}
                      <div className={cn(
                        "absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-emerald-300 pointer-events-none hidden lg:block opacity-0 transition-opacity",
                        isNodeSelected && "opacity-100"
                      )} />
                    </button>
                  );
                })}
              </div>

              {/* General guide summary based on Role */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 text-xs text-slate-600 space-y-2">
                <div className="font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Workflow size={13} className="text-emerald-600" /> Administrative Verification Sequence:
                </div>
                {activeTab === 'volunteer' && (
                  <p>Volunteers log daily regular hours directly. Certified diaries must undergo Departmental Head (HOD) clearances before the Administrative Program Officers perform final approval checkpoints to issue certificates.</p>
                )}
                {activeTab === 'admin' && (
                  <p>Admins serve as supreme coordinators overseeing active verification modules. They reconcile HOD recommendations, verify volunteer compliance rosters, process SOS rescue events, and distribute resources packages.</p>
                )}
                {activeTab === 'hod' && (
                  <p>HODs oversee department-specific student rosters. They sign off on monthly attendance books, and endorse camp certificates, saving Admin officers from manual departmental background auditing.</p>
                )}
                {activeTab === 'principal' && (
                  <p>The Principal holds institutional supreme command over both Unit 36 and Unit 94 operations, reviewing consolidated action reports or deploying formal academic memos to coordinate campus projects.</p>
                )}
              </div>
            </div>

            {/* Live Interactive Popover/Detail Viewer */}
            <div className="lg:col-span-5 space-y-6">
              <AnimatePresence mode="wait">
                {(() => {
                  const currentNodeObj = sitemapData[activeTab].find(n => n.id === selectedNode) || sitemapData[activeTab][0];
                  if (!currentNodeObj) return null;
                  const NodeIcon = currentNodeObj.icon;

                  return (
                    <motion.div
                      key={currentNodeObj.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -25 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-emerald-500 shadow-xl space-y-6 relative overflow-hidden"
                    >
                      {/* Highlight corner badge */}
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white px-4 py-1 rounded-bl-xl text-[9px] font-mono tracking-widest uppercase font-bold">
                        ACTIVE GUIDE
                      </div>

                      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                        <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                          <NodeIcon size={24} />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono tracking-wider">{currentNodeObj.path}</div>
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{currentNodeObj.label}</h4>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Functional Description</h5>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                            {currentNodeObj.description}
                          </p>
                        </div>

                        <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                            <Info size={11} /> Step-by-Step Instructions
                          </h5>
                          <p className="text-slate-650 text-[11.5px] sm:text-[12px] leading-relaxed">
                            {currentNodeObj.instructions}
                          </p>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                            <span>Access Level:</span>
                            <span className="font-mono text-slate-700 font-bold">{currentNodeObj.status} System Area</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                            <span>Database Bindings:</span>
                            <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">supabase.io</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Core Execution Summary and Tips */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-950 p-6 sm:p-7 rounded-[2rem] text-white shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  <Terminal size={120} />
                </div>
                
                <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Award size={14} /> Quick Execution Tip:
                </h4>
                <p className="text-slate-350 text-xs leading-relaxed">
                  Always ensure your profile lists the correct academic year and department. This prevents delays since student diaries route automatically to department HOD files for verification.
                </p>
                <div className="pt-2">
                  <a
                    href="#contact-form"
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white hover:text-emerald-300 transition-colors bg-white/10 px-3.5 py-2 rounded-xl"
                  >
                    Send Query message <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>
            
          </div>
        </section>


        {/* SECTION 2: GLOBAL DATA ARCHITECTURE */}
        <section className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-8">
          <div className="space-y-2 text-center max-w-3xl mx-auto">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">Unified Architecture</h3>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">Information Clearance Pipeline</h2>
            <p className="text-slate-400 text-sm">
              Discover how credentials, hourly journals, event announcements, and emergency messages escalate across the NSS framework hierarchy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative pt-4">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                  Log
                </div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight mt-3">1. Volunteer Diary</h4>
                <p className="text-slate-500 text-xs leading-relaxed pt-1">
                  Active volunteers submit regular, special campaign, or cleaning efforts in detail under specific dates.
                </p>
              </div>
              <div className="text-[10px] font-mono text-blue-600 font-bold uppercase bg-blue-50 py-1 px-2 rounded w-fit">
                Initiator / Student
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase">
                  Audit
                </div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight mt-3">2. HOD Clearance</h4>
                <p className="text-slate-500 text-xs leading-relaxed pt-1">
                  Respective Department Heads audit entries to verify students actually performed the logged tasks.
                </p>
              </div>
              <div className="text-[10px] font-mono text-emerald-600 font-bold uppercase bg-emerald-50 py-1 px-2 rounded w-fit">
                Endorser / HOD
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                  Verify
                </div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight mt-3">3. Admin Credit</h4>
                <p className="text-slate-500 text-xs leading-relaxed pt-1">
                  Administrative Program Officers allocate approved hours and credit hours to the official master roster.
                </p>
              </div>
              <div className="text-[10px] font-mono text-indigo-600 font-bold uppercase bg-indigo-50 py-1 px-2 rounded w-fit">
                Director / Admin
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs uppercase">
                  Audit
                </div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight mt-3">4. Principal Oversight</h4>
                <p className="text-slate-500 text-xs leading-relaxed pt-1">
                  Principal monitors comprehensive aggregates, resolves grievances, and publishes official updates.
                </p>
              </div>
              <div className="text-[10px] font-mono text-rose-600 font-bold uppercase bg-rose-50 py-1 px-2 rounded w-fit">
                Supreme / Principal
              </div>
            </div>

          </div>

          <div className="bg-indigo-50 border border-indigo-150 p-5 rounded-2xl text-slate-700 text-xs flex gap-3 items-start">
            <Info className="text-indigo-600 shrink-0 mt-0.5" size={16} />
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-indigo-800 block">Critical System Security Alert:</span>
              <p>All database logs are tracked using secure tokens. Users can only read and write data related to their designated role parameters under the statutory college standards. If you encounter permissions errors, try clearing local browser cache and logging in again.</p>
            </div>
          </div>
        </section>


        {/* SECTION 3: SYSTEM FAQS ACCORDION WITH FILTER AND REALTIME SEARCH */}
        <section className="space-y-6">
          <div className="text-center space-y-2 pb-2">
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-600">Dynamic User Help Desk</div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">Self-Service Portal FAQ</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Search frequently asked questions and guides with dynamic tagging. Get instant step-by-step resolution logs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Search and Category filters Block */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-md space-y-5">
              
              {/* Keyword Search Input */}
              <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search FAQs by title, body explanation, or tags..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/80 transition-all font-medium text-xs sm:text-sm text-slate-900"
                />
                {faqSearchQuery && (
                  <button 
                    onClick={() => setFaqSearchQuery('')}
                    className="absolute right-4 top-3.5 text-xs font-bold text-slate-400 hover:text-emerald-600 font-mono"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Tag Categories filter matrix */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {faqCategories.map((cat) => {
                  const isSelected = selectedFaqCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedFaqCategory(cat.value)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 outline-none",
                        isSelected 
                          ? "bg-slate-900 text-white shadow-sm scale-102 ring-1 ring-slate-800" 
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800"
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-400 font-mono px-1">
                <span>Total Matches: {filteredFaqs.length} Guides in dataset</span>
                <span>Active Filters: Category ({selectedFaqCategory})</span>
              </div>

            </div>

            {/* Accordion List render */}
            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen = expandedFaq === faq.id;
                  
                  return (
                    <div 
                      key={faq.id} 
                      className={cn(
                        "bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300",
                        isOpen ? "border-emerald-500 shadow-lg" : "border-slate-200/80 hover:border-slate-350"
                      )}
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                        className="w-full text-left p-5 sm:p-6 flex justify-between items-start gap-4 hover:bg-slate-50/50 outline-none"
                      >
                        <div className="space-y-2">
                          <span className="font-black text-slate-850 text-xs sm:text-sm uppercase tracking-wide leading-snug block">
                            {faq.q}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <span className={cn(
                              "text-[8px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded",
                              faq.category === 'volunteer' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                              faq.category === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                              faq.category === 'hod' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              faq.category === 'principal' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                              'bg-amber-50 text-amber-600 border border-amber-200'
                            )}>
                              {faq.category}
                            </span>
                            {faq.tags.map(t => (
                              <span key={t} className="text-[8px] font-mono tracking-wider uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronDown 
                          size={18} 
                          className={cn("text-slate-400 transition-transform duration-300 shrink-0 mt-0.5", isOpen && "rotate-180 text-emerald-600")} 
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 text-slate-650 text-xs sm:text-sm leading-relaxed space-y-3 bg-slate-50/50">
                              <p className="whitespace-pre-line font-medium">{faq.a}</p>
                              
                              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>Ref: {faq.id}</span>
                                <span className="flex items-center gap-1"><Check size={11} className="text-emerald-600" /> Operational standard verified</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-slate-200 p-8 rounded-[2rem] text-center space-y-3 text-slate-500">
                  <AlertTriangle className="mx-auto text-amber-500" size={32} />
                  <p className="text-xs sm:text-sm uppercase tracking-wider font-bold">No matching FAQ found</p>
                  <p className="text-xs max-w-md mx-auto text-slate-400">
                    Try searching different keywords like "Hours", "SOS", "Blood Bank", or choose "All Questions" in category options.
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>


        {/* SECTION 4: FEEDBACK & DIRECT CHANNELS */}
        <section id="contact-form" className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start pt-4">
          
          {/* Contacts info panel */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 border-l-4 border-indigo-600 pl-4 uppercase tracking-tight">Direct Support Channels</h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Have complex grievances or custom enrollment challenges? Reach out directly using our official institutional hotlines below.
            </p>
            
            <div className="space-y-4 pt-2">
              {contacts.map((contact) => (
                <div key={contact.label} className="bg-white p-5 rounded-2xl border border-slate-150 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <contact.icon size={20} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{contact.label}</div>
                    <a 
                      href={contact.href} 
                      target={contact.href.startsWith('http') ? '_blank' : undefined}
                      rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-slate-900 text-xs sm:text-sm font-bold hover:text-indigo-600 transition-colors"
                    >
                      {contact.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden space-y-4">
              <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
              <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-2">Central NSS Cabin Office</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Our Program Officers are available during standard college hours at the official NSS Cabin on ground floor of main college block.
              </p>
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] font-mono uppercase tracking-widest">
                Mon - Fri • 9:30 AM - 4:30 PM
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Direct Operations support form</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Submit your specific technical difficulties or queries. The administrative deck reviews issues daily.</p>
              </div>

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-xs sm:text-sm"
                >
                  <CheckCircle2 className="text-emerald-600 shrink-0" /> Your help request has been dispatched safely to Program Officers logs!
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <input 
                      type="text" required placeholder="Enter active name" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full h-11 bg-slate-50 border border-slate-150 rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-xs sm:text-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Ph (Optional)</label>
                    <input 
                      type="text" placeholder="email@example.com / Phone" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full h-11 bg-slate-50 border border-slate-150 rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-xs sm:text-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal designated role</label>
                  <input 
                    type="text" placeholder="e.g. Student Volunteer / HOD Commerce / Guest Admin / Public" 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full h-11 bg-slate-50 border border-slate-150 rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-xs sm:text-sm" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Describe Query details</label>
                  <textarea 
                    required placeholder="Enter deep explanation. E.g., 'Locked out of attendance log' or 'HOD approved hours not credited yet'..." 
                    rows={4}
                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-150 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none text-slate-900 text-xs sm:text-sm leading-relaxed" 
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/10 transition-all flex items-center justify-center gap-3 text-xs sm:text-sm uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="animate-spin text-white mb-0" size={18} /> : (
                    <>
                      <Send size={15} />
                      Log Help Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
