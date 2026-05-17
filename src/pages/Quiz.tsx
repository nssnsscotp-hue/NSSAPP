import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, Clock, CheckCircle2, AlertCircle, Loader2, Award, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

interface Quiz {
  id: string;
  title: string;
  status: string;
  timer: string;
  theme: string;
}

export default function QuizSystem() {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [mode, setMode] = useState<'browse' | 'quiz' | 'result' | 'confirm'>('browse');
  
  // Quiz taking state
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [certLink, setCertLink] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const userEmail = localStorage.getItem('user') || '';
  const userName = localStorage.getItem('name') || '';

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setQuizzes(data.map(x => ({ 
          id: x.id, 
          title: x.title, 
          status: x.status || 'Inactive',
          timer: x.timer || '10',
          theme: x.theme || 'vibrant_blue'
        })));
      }
    } catch (err) { 
      console.error("Quiz Hub Fetch Failure:", err); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  // Timer Logic
  useEffect(() => {
    if (mode === 'quiz' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishQuiz(); // Auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, timeLeft]);

  const selectQuiz = async (quiz: Quiz) => {
    setStarting(true);
    setActiveQuiz(quiz);
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', localStorage.getItem('username'))
        .single();

      if (profile) {
        const { data: existing } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', quiz.id)
          .eq('profile_id', profile.id)
          .single();

        if (existing) {
          alert("Wait! You have already attempted this quiz. Only one attempt is allowed per volunteer.");
          setStarting(false);
          setActiveQuiz(null);
          return;
        }
      }
    } catch (e) { console.warn("Attempt check failed, proceeding..."); }
    
    setMode('confirm');
    setStarting(false);
  };

  const startQuiz = async () => {
    if (!activeQuiz) return;
    
    setLoading(true);
    setMode('browse'); // Temporary reset to show loader
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', activeQuiz.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("This quiz doesn't have any questions yet.");
        setMode('browse');
        return;
      }

      setQuestions(data.map(q => [
        q.id,
        q.question,
        q.opt1,
        q.opt2,
        q.opt3,
        q.opt4,
        q.correct_idx
      ]));
      setAnswers(new Array(data.length).fill(null));
      setCurrentQ(0);
      setTimeLeft(parseInt(activeQuiz.timer) * 60);
      setMode('quiz');
    } catch (err) { 
      alert("Error loading quiz content."); 
      setMode('browse');
    }
    finally { setLoading(false); }
  };

  const finishQuiz = async () => {
    setScoreSubmitting(true);
    let finalScore = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q[6]) finalScore++;
    });
    setScore(finalScore);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', localStorage.getItem('username'))
        .single();

      if (profile && activeQuiz) {
        const { error } = await supabase
          .from('quiz_attempts')
          .insert([{
            quiz_id: activeQuiz.id,
            profile_id: profile.id,
            score: finalScore
          }]);
        
        if (error) throw error;

        // Dummy certificate link for now (Supabase Storage could be used)
        setCertLink(`https://certificate-gen.nss.workers.dev/gen?name=${encodeURIComponent(userName)}&score=${finalScore}&quiz=${encodeURIComponent(activeQuiz.title)}`);
      }
      setMode('result');
    } catch (err) { 
      setMode('result');
    }
    finally { setScoreSubmitting(false); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-purple-100 text-purple-600 rounded-2xl mb-4">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-uppercase">NSS Quiz Hub</h1>
          <p className="text-slate-500 mt-2">Test your knowledge and earn digital certificates.</p>
        </div>

        {mode === 'browse' && (
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Available Quizzes</h2>
            {loading ? (
               <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-600" size={40} /></div>
            ) : quizzes.filter(q => q.status === 'Active').length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {quizzes.filter(q => q.status === 'Active').map((quiz) => (
                  <button 
                    key={quiz.id}
                    disabled={starting}
                    onClick={() => selectQuiz(quiz)}
                    className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:bg-purple-600 transition-all text-left flex items-center justify-between disabled:opacity-50"
                  >
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-white/20 group-hover:text-white transition-colors">
                         <BookOpen size={24} />
                       </div>
                       <div>
                         <h4 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors tracking-tight">{quiz.title}</h4>
                         <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60 transition-colors">
                           <Clock size={12} /> {quiz.timer} Mins
                         </div>
                       </div>
                    </div>
                    {starting && activeQuiz?.id === quiz.id ? (
                      <Loader2 className="animate-spin text-purple-600" size={24} />
                    ) : (
                      <ChevronRight size={24} className="text-slate-300 group-hover:text-white transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 italic text-slate-400">
                No active quizzes found. Check back soon!
              </div>
            )}
          </div>
        )}

        {mode === 'confirm' && activeQuiz && (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-300 italic">
            <div className="inline-flex p-4 bg-purple-50 text-purple-600 rounded-2xl mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Ready to Start?</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px]">
              You are about to start <span className="text-purple-600">"{activeQuiz.title}"</span>. 
              You have exactly <span className="text-slate-900">{activeQuiz.timer} minutes</span> to finish. 
              Only one attempt is permitted.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={startQuiz}
                className="w-full h-16 bg-purple-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-600/20 hover:bg-purple-500 transition-all flex items-center justify-center gap-3"
              >
                Let's Begin <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => setMode('browse')}
                className="w-full h-16 border-2 border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {mode === 'quiz' && questions.length > 0 && (
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 bg-purple-600 transition-all duration-1000" style={{ width: `${(timeLeft / (parseInt(activeQuiz!.timer) * 60)) * 100}%` }} />
            
            <div className="flex justify-between items-center mb-10">
               <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Question {currentQ + 1} of {questions.length}</span>
               <div className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest",
                 timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-50 text-slate-400"
               )}>
                 <Clock size={14} />
                 {formatTime(timeLeft)}
               </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-10 tracking-tight">
              {questions[currentQ][1]}
            </h3>

            <div className="space-y-3">
              {[questions[currentQ][2], questions[currentQ][3], questions[currentQ][4], questions[currentQ][5]].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const newAnswers = [...answers];
                    newAnswers[currentQ] = idx;
                    setAnswers(newAnswers);
                  }}
                  className={cn(
                    "w-full p-6 text-left rounded-2xl border-2 transition-all font-bold text-sm",
                    answers[currentQ] === idx 
                      ? "bg-purple-50 border-purple-600 text-purple-700" 
                      : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-12">
              <button 
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(prev => prev - 1)}
                className="flex-1 h-14 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Previous
              </button>
              {currentQ < questions.length - 1 ? (
                <button 
                  onClick={() => setCurrentQ(prev => prev + 1)}
                  className="flex-1 h-14 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                >
                  Next
                </button>
              ) : (
                <button 
                  disabled={scoreSubmitting}
                  onClick={finishQuiz}
                  className="flex-1 h-14 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-500 transition-all flex items-center justify-center gap-2"
                >
                  {scoreSubmitting ? <Loader2 className="animate-spin" /> : "Finish & Score"}
                </button>
              )}
            </div>
          </div>
        )}

        {mode === 'result' && (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-center relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
             
             <div className="inline-flex p-6 bg-emerald-50 text-emerald-600 rounded-[2rem] mb-6 shadow-sm">
                < Award size={64} />
             </div>
             
             <h2 className="text-4xl font-black text-slate-900 mb-2">Well Done!</h2>
             <p className="text-slate-500 text-lg mb-8">You have successfully completed the quiz.</p>
             
             <div className="flex justify-center gap-4 mb-10">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 min-w-32">
                   <div className="text-4xl font-black text-slate-900">{score}</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Score</div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 min-w-32">
                   <div className="text-4xl font-black text-slate-900">{questions.length}</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total</div>
                </div>
             </div>

             {certLink && (
               <button 
                onClick={() => window.location.href = certLink}
                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 mb-4 text-lg"
               >
                 <Download size={24} />
                 Download Your Certificate
               </button>
             )}

             <button 
              onClick={() => { setMode('browse'); setQuestions([]); setAnswers([]); }}
              className="w-full text-slate-400 font-bold hover:text-slate-600 transition-colors py-4 uppercase tracking-widest text-xs"
             >
               Return to Library
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Download({ size }: { size: number }) {
  return (
    <svg 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
