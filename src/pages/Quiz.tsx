import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, BookOpen, Clock, CheckCircle2, AlertCircle, Loader2, 
  Award, ChevronRight, History, Calendar, Printer, RefreshCw,
  Layout, ListChecks, CheckSquare, AlignLeft, Eye, HelpCircle, ArrowLeft
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebaseClient';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import BackButton from '../components/layout/BackButton';

interface QuestionItem {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'boolean' | 'text';
  options: string[];
  correct_option: any; // index, indices, bool, or string
  points: number;
}

interface QuizItem {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  created_at?: string;
  certificateStyle: {
    theme: 'amber' | 'emerald' | 'crimson' | 'navy' | 'purple' | 'coral';
    border: 'double' | 'solid' | 'ornate';
    badge: '❂' | '★' | '🏆' | '🎓' | '🎖️';
    titlePhrase: string;
    citation: string;
    ribbonText: string;
  };
  questions: QuestionItem[];
}

interface AttemptItem {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  completed_at: string;
  certificateStyle?: QuizItem['certificateStyle'];
}

const THEME_MAP = {
  amber: {
    primary: 'border-amber-600 text-amber-700 bg-amber-50/40',
    title: 'text-amber-700',
    border: 'border-amber-500',
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
    bg: 'bg-amber-600',
    hover: 'hover:bg-amber-700',
    buttonColor: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20',
    ribbon: 'text-amber-600'
  },
  emerald: {
    primary: 'border-emerald-600 text-emerald-700 bg-emerald-50/40',
    title: 'text-emerald-700',
    border: 'border-emerald-500',
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    bg: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20',
    ribbon: 'text-emerald-600'
  },
  crimson: {
    primary: 'border-rose-600 text-rose-750 bg-rose-50/40',
    title: 'text-rose-700',
    border: 'border-rose-500',
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
    bg: 'bg-rose-600',
    hover: 'hover:bg-rose-700',
    buttonColor: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20',
    ribbon: 'text-rose-600'
  },
  navy: {
    primary: 'border-indigo-800 text-indigo-900 bg-indigo-50/40',
    title: 'text-indigo-900',
    border: 'border-indigo-700',
    accent: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    bg: 'bg-indigo-805',
    hover: 'hover:bg-indigo-900',
    buttonColor: 'bg-indigo-800 hover:bg-indigo-700 shadow-indigo-500/20',
    ribbon: 'text-indigo-800'
  },
  purple: {
    primary: 'border-purple-600 text-purple-700 bg-purple-50/40',
    title: 'text-purple-750',
    border: 'border-purple-500',
    accent: 'text-purple-600 bg-purple-50 border-purple-200',
    bg: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    buttonColor: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20',
    ribbon: 'text-purple-600'
  },
  coral: {
    primary: 'border-orange-500 text-orange-700 bg-orange-50/40',
    title: 'text-orange-700',
    border: 'border-orange-500',
    accent: 'text-orange-600 bg-orange-50 border-orange-200',
    bg: 'bg-orange-500',
    hover: 'hover:bg-orange-650',
    buttonColor: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
    ribbon: 'text-orange-600'
  }
};

const BORDER_TEMPLATES = {
  double: 'border-[14px] border-double rounded-[2rem]',
  solid: 'border-10 border-solid rounded-2xl',
  ornate: 'border-[20px] border-double rounded-[2.5rem]'
};

export default function QuizSystem() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'browse' | 'quiz' | 'result' | 'confirm'>('browse');

  // Active quiz playing state
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Custom user choices array (can map to numbers, strings, or boolean arrays)
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [qualifiedEarnedPoints, setQualifiedEarnedPoints] = useState(0);

  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // Live ticking countdown
  const certPrintRef = useRef<HTMLDivElement>(null);

  const userName = localStorage.getItem('name') || localStorage.getItem('fullname') || 'NSS Volunteer';

  const fetchQuizzesAndAttempts = async () => {
    try {
      setLoading(true);

      // 1. Fetch quizzes from Firestore
      const snap = await getDocs(collection(db, 'quizzes'));
      let list: QuizItem[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Dynamic Assessment',
          description: d.description || '',
          duration: d.duration || 10,
          certificateStyle: d.certificateStyle || {
            theme: 'amber',
            border: 'double',
            badge: '❂',
            titlePhrase: 'Certificate of Excellence',
            citation: 'For successful fulfillment of goals in community upliftment.',
            ribbonText: '★ NATIONAL SERVICE SCHEME ★'
          },
          questions: d.questions || []
        });
      });

      // Local storage fallbacks
      if (list.length === 0) {
        const localQ = localStorage.getItem('nss_quizzes_backup_store');
        if (localQ) {
          try { list = JSON.parse(localQ); } catch (e) { list = []; }
        }
      }

      setQuizzes(list);

      // 2. Fetch attempts from localStorage for immediate Profile & Hub stats presentation
      const localAttempts = localStorage.getItem('nss_local_quiz_attempts_backup');
      if (localAttempts) {
        try {
          setAttempts(JSON.parse(localAttempts));
        } catch (pe) {
          setAttempts([]);
        }
      }
    } catch (err) {
      console.error("Quiz hub loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesAndAttempts();
  }, []);

  // Live Timer implementation countdown (ticks every second in active quiz mode)
  useEffect(() => {
    if (mode === 'quiz' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time triggers automatic submit
            console.warn("Quiz duration elapsed, auto submitting score sheets!");
            finishQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, timeLeft]);

  const selectQuizAndConfirm = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setCurrentQIndex(0);
    // Convert duration metric to seconds
    setTimeLeft((quiz.duration || 10) * 60);
    setMode('confirm');
  };

  const startQuizPlay = () => {
    setAnswers({});
    setCurrentQIndex(0);
    setMode('quiz');
  };

  const handleAnswerInput = (qIdx: number, val: any) => {
    setAnswers(prev => ({
      ...prev,
      [qIdx]: val
    }));
  };

  const handleCheckboxToggle = (qIdx: number, oIdx: number) => {
    const currentList: number[] = Array.isArray(answers[qIdx]) ? answers[qIdx] : [];
    let updated: number[];
    if (currentList.includes(oIdx)) {
      updated = currentList.filter(i => i !== oIdx);
    } else {
      updated = [...currentList, oIdx];
    }
    handleAnswerInput(qIdx, updated);
  };

  const finishQuiz = async (autoSubmitted = false) => {
    if (!activeQuiz) return;
    setScoreSubmitting(true);

    let earnedScore = 0;
    let earnedPoints = 0;
    let maxPointsAvailable = 0;

    activeQuiz.questions.forEach((q, idx) => {
      maxPointsAvailable += q.points || 10;
      const userAns = answers[idx];

      if (q.type === 'single') {
        if (Number(userAns) === Number(q.correct_option)) {
          earnedScore++;
          earnedPoints += q.points || 10;
        }
      } else if (q.type === 'boolean') {
        if (userAns === q.correct_option) {
          earnedScore++;
          earnedPoints += q.points || 10;
        }
      } else if (q.type === 'text') {
        const formattedUser = String(userAns || '').trim().toLowerCase();
        const formattedCorrect = String(q.correct_option || '').trim().toLowerCase();
        if (formattedUser === formattedCorrect && formattedCorrect !== '') {
          earnedScore++;
          earnedPoints += q.points || 10;
        }
      } else if (q.type === 'multiple') {
        const correctArray = Array.isArray(q.correct_option) ? q.correct_option : [];
        const userArray = Array.isArray(userAns) ? userAns : [];
        
        // Match both elements length and content exactness
        const isMatch = correctArray.length === userArray.length && 
                        correctArray.every(v => userArray.includes(v));
        if (isMatch) {
          earnedScore++;
          earnedPoints += q.points || 10;
        }
      }
    });

    setScore(earnedScore);
    setTotalQuestions(activeQuiz.questions.length);
    setTotalPoints(maxPointsAvailable);
    setQualifiedEarnedPoints(earnedPoints);

    const attemptId = `ach-${Date.now()}`;
    const freshAttempt: AttemptItem = {
      id: attemptId,
      quiz_id: activeQuiz.id,
      quiz_title: activeQuiz.title,
      score: earnedScore,
      total_questions: activeQuiz.questions.length,
      completed_at: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      certificateStyle: activeQuiz.certificateStyle
    };

    // Save locally
    const currentLocalAttempts = localStorage.getItem('nss_local_quiz_attempts_backup');
    let parsedArr: AttemptItem[] = [];
    if (currentLocalAttempts) {
      try { parsedArr = JSON.parse(currentLocalAttempts); } catch (_) {}
    }
    parsedArr.unshift(freshAttempt);
    localStorage.setItem('nss_local_quiz_attempts_backup', JSON.stringify(parsedArr));
    setAttempts(parsedArr);

    // Save to Firestore for permanent server-side lookup
    try {
      await addDoc(collection(db, 'quiz_attempts'), {
        ...freshAttempt,
        username: localStorage.getItem('username')?.toLowerCase() || 'anonymous',
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Could not write attempt to Firestore:", err);
    }

    setMode('result');
    setScoreSubmitting(false);

    // Execute absolute Auto Print trigger
    setTimeout(() => {
      handleAutoPrintTrigger();
    }, 1200);
  };

  const handleAutoPrintTrigger = () => {
    const printContent = certPrintRef.current;
    if (!printContent) return;

    console.log("Triggering official print window...");
    const origHtml = document.body.innerHTML;
    // Create dedicated printable page view
    const printHtml = `
      <html>
        <head>
          <title>${activeQuiz?.title || 'Certification'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: white;
            }
            .printable-box {
              width: 800px;
              height: 580px;
              box-sizing: border-box;
              margin: auto;
            }
            @media print {
              body, html {
                width: 100%;
                height: 100%;
                background: none;
              }
              .printable-box {
                border: 14px double #d97706 !important;
                box-shadow: none !important;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="printable-box" style="padding: 40px; text-align: center; border: 14px double #d97706; border-radius: 20px;">
            ${printContent.innerHTML}
          </div>
          <script>
            window.addEventListener('load', () => {
              window.print();
            });
          </script>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(printHtml);
      printWin.document.close();
    } else {
      // Fallback: browser popup blocked, print page directly using iframe layout
      window.print();
    }
  };

  const formatTimeMinutes = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-start">
          <BackButton />
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-purple-100 text-purple-600 rounded-3xl mb-4 shadow-sm hover:scale-105 transition-transform">
            <Trophy size={36} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase">NSS Assessment Portal</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Test service proficiency guidelines and claim custom styled community certificates.
          </p>
        </div>

        {/* MODE: BROWSE QUIZZES */}
        {mode === 'browse' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <span className="bg-white/20 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  NSS Certification Hub 
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold mt-4 tracking-tight leading-tight">
                  Qualified National Youth Awards
                </h3>
                <p className="text-purple-100 mt-2 text-sm max-w-lg leading-relaxed font-light">
                  Select and take any of the active evaluation models published by the Program Officers. Earn points to showcase on your profile, and receive distinct printable badges.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Published Active Assessments ({quizzes.length})
                </h2>
                <button 
                  onClick={fetchQuizzesAndAttempts}
                  className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw size={12} /> Sync Assessments
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-600" size={32} /></div>
              ) : quizzes.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {quizzes.map((q) => {
                    const style = q.certificateStyle || { theme: 'amber', badge: '❂' };
                    const themeColor = THEME_MAP[style.theme as keyof typeof THEME_MAP] || THEME_MAP.amber;
                    return (
                      <div 
                        key={q.id}
                        className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-purple-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded", themeColor.primary)}>
                              {style.theme} Theme {style.badge}
                            </span>
                            <span className="text-[10px] text-slate-400 font-extrabold font-mono flex items-center gap-1">
                              <Clock size={11} /> {q.duration || 10} Mins
                            </span>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">{q.title}</h3>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-xl">{q.description || 'No instruction setup.'}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              {q.questions?.length || 0} Questions • {(q.questions || []).reduce((sum, item)=> sum + (item.points || 10), 0)} Potential Points
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => selectQuizAndConfirm(q)}
                          className="w-full sm:w-auto h-12 px-6 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-600/10 shrink-0 flex items-center justify-center gap-2"
                        >
                          Launch
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200 italic text-slate-400 text-xs px-4">
                  No custom assessments found. Ask Program Officers to design customized quizzes via Admin panel!
                </div>
              )}
            </div>

            {/* Hub attempts */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                <History size={14} /> My Recent Certification Achievements ({attempts.length})
              </h2>

              {attempts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {attempts.slice(0, 5).map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                          🏅
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.quiz_title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Grade: <span className="text-emerald-600 font-extrabold">{item.score} Qualified</span> • {item.completed_at}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-black uppercase px-2.5 py-1 rounded-lg border border-emerald-100">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

          </div>
        )}

        {/* MODE: CONFIRM/SETUP METADATA */}
        {mode === 'confirm' && activeQuiz && (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-350">
            <div className="inline-flex p-4 bg-purple-50 text-purple-600 rounded-2xl mb-6">
              <AlertCircle size={40} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Initialize Examination Session</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px] leading-relaxed">
              Assessment: <span className="text-purple-600 block text-sm mt-1">{activeQuiz.title}</span>
              You have exactly <span className="text-slate-900">{activeQuiz.duration} minutes</span> to respond to all <span className="text-slate-900">{activeQuiz.questions.length} questions</span>.
              Ensure you have sufficient quietness and steady speed configured.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={startQuizPlay}
                className="flex-1 h-16 bg-purple-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-600/20 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 text-xs"
              >
                Access Examination <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => { setMode('browse'); setActiveQuiz(null); }}
                className="flex-1 h-16 border-2 border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all text-xs"
              >
                Cancel Session
              </button>
            </div>
          </div>
        )}

        {/* MODE: ACTIVE TEST INTERACTIVE WORKSPACE */}
        {mode === 'quiz' && activeQuiz && activeQuiz.questions.length > 0 && (
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden animate-in fade-in duration-300">
            {/* Countdown bar indicator */}
            <div 
              className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-1000" 
              style={{ width: `${(timeLeft / ((activeQuiz.duration || 10) * 60)) * 100}%` }} 
            />

            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Question {currentQIndex + 1} of {activeQuiz.questions.length}
              </span>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest",
                timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse border border-red-200" : "bg-slate-50 text-slate-400"
              )}>
                <Clock size={14} />
                {formatTimeMinutes(timeLeft)}
              </div>
            </div>

            <div className="mb-4">
              <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                +{activeQuiz.questions[currentQIndex].points || 10} Points Value
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-8 tracking-tight">
              {activeQuiz.questions[currentQIndex].question}
            </h3>

            {/* Dynamic input blocks matching question types */}
            <div className="space-y-3">
              {/* Type 1: Single Choice (Radio) */}
              {activeQuiz.questions[currentQIndex].type === 'single' && (
                activeQuiz.questions[currentQIndex].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerInput(currentQIndex, oIdx)}
                    className={cn(
                      "w-full p-5 text-left rounded-2xl border-2 transition-all font-bold text-sm",
                      answers[currentQIndex] === oIdx 
                        ? "bg-purple-50 border-purple-600 text-purple-700 shadow-sm" 
                        : "bg-slate-50 border-transparent text-slate-650 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {answers[currentQIndex] === oIdx && (
                        <CheckCircle2 size={18} className="text-purple-600" />
                      )}
                    </div>
                  </button>
                ))
              )}

              {/* Type 2: Multiple Selection Checkboxes */}
              {activeQuiz.questions[currentQIndex].type === 'multiple' && (
                activeQuiz.questions[currentQIndex].options.map((opt, oIdx) => {
                  const currentSelections = Array.isArray(answers[currentQIndex]) ? answers[currentQIndex] : [];
                  const isChecked = currentSelections.includes(oIdx);
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleCheckboxToggle(currentQIndex, oIdx)}
                      className={cn(
                        "w-full p-5 text-left rounded-2xl border-2 transition-all font-bold text-sm",
                        isChecked 
                          ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm" 
                          : "bg-slate-50 border-transparent text-slate-650 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        <div className={cn(
                          "w-5 h-5 rounded flex items-center justify-center border-2",
                          isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                        )}>
                          {isChecked && <span className="text-[10px] font-black">✓</span>}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}

              {/* Type 3: True False Toggle */}
              {activeQuiz.questions[currentQIndex].type === 'boolean' && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'TRUE', val: true },
                    { label: 'FALSE', val: false }
                  ].map((itemOption) => (
                    <button
                      key={itemOption.label}
                      onClick={() => handleAnswerInput(currentQIndex, itemOption.val)}
                      className={cn(
                        "p-6 font-black text-xs uppercase rounded-2xl border-2 transition-all text-center",
                        answers[currentQIndex] === itemOption.val
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {itemOption.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Type 4: Text input fill gap */}
              {activeQuiz.questions[currentQIndex].type === 'text' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Write your typed response answer</label>
                  <input
                    type="text"
                    required
                    placeholder="Type words or phrase matching..."
                    value={answers[currentQIndex] || ''}
                    onChange={(e) => handleAnswerInput(currentQIndex, e.target.value)}
                    className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-600 font-extrabold text-sm"
                  />
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-12 border-t border-slate-100 pt-8">
              <button 
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
                className="flex-1 h-14 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Previous
              </button>

              {currentQIndex < activeQuiz.questions.length - 1 ? (
                <button 
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                  className="flex-1 h-14 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                >
                  Next
                </button>
              ) : (
                <button 
                  disabled={scoreSubmitting}
                  onClick={() => finishQuiz(false)}
                  className="flex-1 h-14 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {scoreSubmitting ? <Loader2 className="animate-spin" /> : "Finish & Auto Print Certificate"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODE: RESULT SUCCESS & PRINTABLE CERTIFICATE CARD */}
        {mode === 'result' && activeQuiz && (
          <div className="space-y-8 animate-in zoom-in-95 duration-350">
            <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />

              <div className="inline-flex p-6 bg-emerald-50 text-emerald-600 rounded-[2rem] mb-6 shadow-sm">
                <Award size={64} />
              </div>

              <h2 className="text-4xl font-black text-slate-900 mb-2">Congratulations, {userName}!</h2>
              <p className="text-slate-500 text-sm font-semibold max-w-md mx-auto">
                You has successfully qualified and completed the <strong>{activeQuiz.title}</strong> examination.
              </p>

              <div className="flex justify-center gap-4 my-8">
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 min-w-28 text-center shadow-inner">
                  <div className="text-3xl font-black text-slate-900">{score}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Questions Pass</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 min-w-28 text-center shadow-inner">
                  <div className="text-3xl font-black text-emerald-600">{qualifiedEarnedPoints}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Points Earned</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 min-w-28 text-center shadow-inner">
                  <div className="text-3xl font-black text-slate-400">{totalPoints}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Available</div>
                </div>
              </div>

              {/* Instructions box */}
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 max-w-md mx-auto mb-8 font-semibold text-[11px] text-purple-700 leading-relaxed">
                📢 SYSTEM AUTO TRIGGER: Your elegant credential has been structured and dispatched to the printing system. If blocking occurred, please use the <strong>"Print Credentials Sheet"</strong> button down below.
              </div>

              {/* The Certificate Stage (Admin Custom Color and Styles applied!) */}
              {(() => {
                const style = activeQuiz.certificateStyle || {
                  theme: 'amber',
                  border: 'double',
                  badge: '❂',
                  titlePhrase: 'Certificate of Excellence',
                  citation: 'For successful fulfillment of goals in community upliftment.',
                  ribbonText: '★ NATIONAL SERVICE SCHEME ★'
                };
                const THEME_MAP_LOCAL = {
                  amber: { primary: '#b45309', text: '#78350f' },
                  indigo: { primary: '#4338ca', text: '#312e81' },
                  emerald: { primary: '#047857', text: '#064e3b' },
                  rose: { primary: '#be123c', text: '#881337' },
                  slate: { primary: '#334155', text: '#0f172a' }
                };
                const pColor = style.customColor || THEME_MAP_LOCAL[style.theme as keyof typeof THEME_MAP_LOCAL]?.primary || '#b45309';
                const tColorVal = style.customTextColor || THEME_MAP_LOCAL[style.theme as keyof typeof THEME_MAP_LOCAL]?.text || '#78350f';
                const selectedFont = style.fontStyle || 'serif';
                const fontClass = selectedFont === 'sans' ? 'font-sans' : selectedFont === 'mono' ? 'font-mono' : selectedFont === 'display' ? 'font-serif tracking-tight font-black uppercase' : 'font-serif';
                
                return (
                  <div className="overflow-x-auto p-4 bg-slate-100 rounded-[2rem] border border-slate-200">
                    <div 
                      id="print-certificate-target"
                      ref={certPrintRef}
                      className={cn(
                        "bg-white p-8 md:p-12 text-center rounded-2xl relative select-none shadow-md max-w-2xl mx-auto overflow-hidden flex flex-col justify-between transition-all",
                        fontClass,
                        BORDER_TEMPLATES[style.border || 'double']
                      )}
                      style={{ minWidth: '580px', minHeight: '420px', borderColor: pColor }}
                    >
                      {/* Graphic Ornaments: Corners */}
                      {(style.graphicCorners ?? true) && (
                        <div className="absolute inset-0 pointer-events-none p-2 z-10">
                          <div className="absolute top-2 left-2 w-6 h-6 border-t-[3px] border-l-[3px]" style={{ borderColor: pColor }} />
                          <div className="absolute top-2 right-2 w-6 h-6 border-t-[3px] border-r-[3px]" style={{ borderColor: pColor }} />
                          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-[3px] border-l-[3px]" style={{ borderColor: pColor }} />
                          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-[3px] border-r-[3px]" style={{ borderColor: pColor }} />
                        </div>
                      )}

                      {/* Laurel Garland Ring backdrop */}
                      {(style.graphicLaurel ?? true) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
                          <svg viewBox="0 0 100 100" className="w-[200px] h-[200px]" style={{ stroke: pColor, fill: 'none' }}>
                            <circle cx="50" cy="50" r="38" strokeWidth="1" strokeDasharray="2,2" />
                            <circle cx="50" cy="50" r="34" strokeWidth="0.5" />
                          </svg>
                        </div>
                      )}

                      {/* Watermark badge Backdrop */}
                      {(style.graphicWatermark ?? true) && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none text-[12rem] select-none z-0">
                          {style.badge || '❂'}
                        </div>
                      )}

                      {/* Official Seal stamp graphic */}
                      {(style.graphicGoldSeal ?? true) && (
                        <div className="absolute bottom-10 right-6 w-14 h-14 pointer-events-none opacity-85 z-10">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                            <path
                              d="M50,0 L55,10 L66,5 L68,16 L79,15 L77,26 L87,29 L82,39 L91,45 L83,53 L89,64 L79,69 L82,80 L71,82 L71,93 L60,91 L57,100 L47,97 L41,105 L33,98 L25,103 L20,93 L10,95 L9,84 L0,82 L2,71 L0,60 L7,52 L1,41 L10,36 L8,25 L18,23 L20,12 L30,13 L33,2 L43,5 Z"
                              fill={pColor}
                            />
                            <circle cx="50" cy="50" r="28" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" />
                          </svg>
                        </div>
                      )}

                      {/* Ribbon banner ornament */}
                      <div 
                        className="text-[9px] font-black uppercase tracking-widest text-center block mb-2 font-mono"
                        style={{ color: pColor }}
                      >
                        {style.ribbonText || '★ NATIONAL SERVICE SCHEME ★'}
                      </div>

                      <hr className="border-t w-1/4 mx-auto my-3 opacity-35" style={{ borderColor: pColor }} />

                      {/* TitlePhrase dynamic */}
                      <h4 
                        className="text-2xl font-black tracking-tight italic uppercase"
                        style={{ color: tColorVal }}
                      >
                        {style.titlePhrase || 'Certificate of Excellence'}
                      </h4>
                      <p className="text-slate-400 text-[8px] uppercase tracking-[0.2em] font-sans font-black mt-1">
                        Verified NSS Credential Identification
                      </p>

                      {/* User Name */}
                      <h1 className="text-3xl font-extrabold text-slate-900 mt-6 tracking-tight font-sans underline underline-offset-8">
                        {userName}
                      </h1>

                      {/* Narrative dynamic */}
                      <div className="max-w-md mx-auto mt-6 text-xs text-slate-650 leading-normal italic font-sans z-10 relative">
                        has successfully completed qualifications and earned an exemplary score of <strong className="text-emerald-600 font-black">{score} / {totalQuestions}</strong> in the official online Interactive Assessment on <strong className="text-slate-900 font-extrabold">{activeQuiz.title}</strong>. 
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed not-italic">
                          {style.citation || 'For exemplary active civic dedication.'}
                        </p>
                      </div>

                      {/* Footer signatures */}
                      <div className="grid grid-cols-2 gap-8 text-center pt-8 max-w-md mx-auto border-t border-slate-100 mt-8 font-sans mt-auto">
                        <div>
                          <div className="border-b border-dotted border-slate-350 h-5 flex items-center justify-center font-semibold text-slate-500 text-[10px] italic">
                            {style.sig1Name || 'PO Dr. S. K. Nair'}
                          </div>
                          <p className="text-[7px] uppercase font-bold text-slate-450 tracking-wider mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                            {style.sig1Title || 'programme Officer Unit 36'}
                          </p>
                        </div>
                        <div>
                          <div className="border-b border-dotted border-slate-350 h-5 flex items-center justify-center font-semibold text-slate-500 text-[10px] italic">
                            {style.sig2Name || 'PO Prof. L. Mathew'}
                          </div>
                          <p className="text-[7px] uppercase font-bold text-slate-450 tracking-wider mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                            {style.sig2Title || 'programme Officer Unit 94'}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Action operations controls */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-4 border-t border-slate-100">
                <button 
                  onClick={handleAutoPrintTrigger}
                  className="flex-1 h-14 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/15"
                >
                  <Printer size={16} /> Print Credentials Sheet
                </button>
                <button 
                  onClick={() => { setMode('browse'); setActiveQuiz(null); }}
                  className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                >
                  Return to Assessments
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
