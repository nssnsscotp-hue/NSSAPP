import React, { useState, useEffect } from 'react';
import { 
  Plus, Trophy, CheckCircle, XCircle, Loader2, 
  Trash2, BookOpen, Clock, ChevronRight, Save, HelpCircle, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

interface Quiz {
  id: string;
  title: string;
  status: string;
  timer: string;
  theme: string;
}

export default function QuizAdmin() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Quiz Builder State
  const [quizInfo, setQuizInfo] = useState({ 
    title: '', 
    id: '', 
    timer: '10', 
    theme: 'vibrant_blue' 
  });
  const [questions, setQuestions] = useState<any[]>([]);
  
  const themes = [
    { id: 'vibrant_blue', name: 'Vibrant Blue', color: 'bg-blue-600' },
    { id: 'nss_classic', name: 'NSS Classic', color: 'bg-orange-600' },
    { id: 'golden_excellence', name: 'Golden Excellence', color: 'bg-amber-500' },
  ];

  // Current Question Form
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct: '0'
  });

  const addQuestionToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question || !newQuestion.option1 || !newQuestion.option2) {
      alert("Validation Error: Please provide a question and at least two options.");
      return;
    }
    
    const qToAdd = {
      question: newQuestion.question,
      options: [newQuestion.option1, newQuestion.option2, newQuestion.option3, newQuestion.option4],
      correct: parseInt(newQuestion.correct)
    };
    
    setQuestions([...questions, qToAdd]);
    setNewQuestion({ question: '', option1: '', option2: '', option3: '', option4: '', correct: '0' });
  };

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
          title: x.title || 'Untitled', 
          status: String(x.status || 'Inactive').trim(),
          timer: x.timer || '10',
          theme: x.theme || 'vibrant_blue'
        })));
      }
    } catch (err) { 
      console.error('Quiz Admin Library Fetch failed', err); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleFinalPublish = async () => {
    if (!quizInfo.id || !quizInfo.title) {
      alert("Missing Data: Quiz ID and Title are mandatory.");
      return;
    }
    
    if (questions.length === 0) {
      alert("Draft Empty: Add at least one question before publishing.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Quiz Header
      const { data: qData, error: qError } = await supabase
        .from('quiz')
        .upsert([{
          id: quizInfo.id.trim(),
          title: quizInfo.title.trim(),
          timer: quizInfo.timer,
          theme: quizInfo.theme,
          status: 'Active'
        }], { onConflict: 'id' })
        .select()
        .single();

      if (qError) throw qError;

      // 2. Insert Questions
      const questionsToInsert = questions.map(q => ({
        quiz_id: quizInfo.id.trim(),
        question: q.question,
        opt1: q.options[0],
        opt2: q.options[1],
        opt3: q.options[2],
        opt4: q.options[3],
        correct_idx: q.correct
      }));

      // Delete existing questions first if upserting (to avoid duplicates)
      await supabase.from('quiz_questions').delete().eq('quiz_id', quizInfo.id.trim());

      const { error: qsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (qsError) throw qsError;

      alert("Success! Your quiz has been published to the student portal.");
      setQuizInfo({ title: '', id: '', timer: '10', theme: 'vibrant_blue' });
      setQuestions([]);
      fetchQuizzes();
    } catch (err: any) { 
      console.error(err);
      alert("Error: " + (err.message || "Action failed"));
    }
    finally { setSubmitting(false); }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <Trophy className="text-blue-600" size={32} /> Quiz Master Pro
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest">Build, Style, and Publish assessments globally.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Database Synced</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 italic">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <BookOpen size={16} /> 1. Configure Identity
            </h3>
            <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quiz Code</label>
                 <input 
                  type="text" placeholder="e.g. NSS_QZ_01" 
                  value={quizInfo.id} onChange={e => setQuizInfo({...quizInfo, id: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600 font-bold text-xs uppercase" 
                />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Title</label>
                 <input 
                  type="text" placeholder="Enter Quiz Subject" 
                  value={quizInfo.title} onChange={e => setQuizInfo({...quizInfo, title: e.target.value})}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600 font-bold text-xs" 
                />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Limit (Mins)</label>
                   <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 h-12">
                    <Clock size={14} className="text-slate-400" />
                    <input 
                      type="number" 
                      value={quizInfo.timer} onChange={e => setQuizInfo({...quizInfo, timer: e.target.value})}
                      className="bg-transparent outline-none flex-1 font-bold text-xs" 
                    />
                  </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Certificate Theme</label>
                    <select 
                      value={quizInfo.theme}
                      onChange={e => setQuizInfo({...quizInfo, theme: e.target.value})}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600 font-bold text-[10px] uppercase tracking-widest"
                    >
                      {themes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                 </div>
               </div>
            </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/10">
            <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-6 italic">2. Live Console</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto opacity-20" /></div>
              ) : quizzes.length > 0 ? quizzes.map((q) => (
                <div key={q.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className={cn("w-2 h-2 rounded-full", q.status === 'Active' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-slate-600")} />
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">{q.id}</p>
                       <p className="text-xs font-bold leading-tight">{q.title}</p>
                     </div>
                   </div>
                   <div className="text-[10px] font-bold opacity-40">{q.timer}m</div>
                </div>
              )) : <p className="text-[10px] text-slate-500 uppercase font-black text-center py-4 italic">The question bank is empty.</p>}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 italic relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8">
                <div className="bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                  Drafting: Q{questions.length + 1}
                </div>
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-10 flex items-center gap-2">
               <Plus size={16} /> 3. Compose Question
             </h3>
             <form onSubmit={addQuestionToList} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Question Text</label>
                  <textarea 
                    required placeholder="What is the motto of NSS?" 
                    rows={2}
                    value={newQuestion.question} onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 font-bold text-lg text-slate-900 resize-none transition-all" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((num, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Option {num}</label>
                        {parseInt(newQuestion.correct) === idx && <span className="text-[8px] font-black uppercase text-emerald-600 italic">Correct Key</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" placeholder={`Option value...`}
                          value={idx === 0 ? newQuestion.option1 : idx === 1 ? newQuestion.option2 : idx === 2 ? newQuestion.option3 : newQuestion.option4}
                          onChange={(e) => {
                             const v = e.target.value;
                             if (idx === 0) setNewQuestion({...newQuestion, option1: v});
                             else if (idx === 1) setNewQuestion({...newQuestion, option2: v});
                             else if (idx === 2) setNewQuestion({...newQuestion, option3: v});
                             else setNewQuestion({...newQuestion, option4: v});
                          }}
                          className={cn(
                            "flex-1 h-16 border rounded-2xl px-6 outline-none transition-all font-bold text-sm",
                            parseInt(newQuestion.correct) === idx ? "bg-emerald-50 border-emerald-200 focus:ring-emerald-600" : "bg-slate-50 border-slate-100 focus:ring-blue-600"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setNewQuestion({...newQuestion, correct: idx.toString()})}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-90",
                            newQuestion.correct === idx.toString() ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                          )}
                        >
                           <CheckCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">All questions auto-saved to local draft.</p>
                  <button 
                    type="submit"
                    className="h-14 px-10 bg-slate-900 border-b-4 border-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-3 hover:bg-slate-800 active:border-b-0 active:translate-y-[4px] transition-all"
                  >
                    <Plus size={18} /> Add Question to Deck
                  </button>
                </div>
             </form>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic px-2">Final Review List ({questions.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {questions.map((q, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={idx} 
                    className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group"
                  >
                     <div className="flex items-center gap-5 overflow-hidden">
                       <span className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl shrink-0 flex items-center justify-center text-xs font-black text-blue-600">{idx + 1}</span>
                       <div className="overflow-hidden">
                         <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate italic">{q.question}</p>
                         <p className="text-[9px] text-emerald-600 font-bold mt-0.5 uppercase">Key: Option {q.correct + 1}</p>
                       </div>
                     </div>
                     <button 
                      onClick={() => removeQuestion(idx)}
                      className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                     >
                       <Trash2 size={18} />
                     </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {questions.length === 0 && (
                <div className="col-span-full py-12 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center italic text-slate-400">
                   <HelpCircle size={32} className="mb-2 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Deck is empty. Add questions to enable publishing.</p>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={submitting || questions.length === 0}
            onClick={handleFinalPublish}
            className="w-full h-24 bg-blue-700 hover:bg-blue-600 text-white font-black uppercase tracking-[0.4em] rounded-[2.5rem] shadow-2xl shadow-blue-700/30 flex items-center justify-center gap-5 transition-all disabled:opacity-30 disabled:grayscale group relative overflow-hidden"
          >
            {submitting ? <Loader2 className="animate-spin" size={28} /> : (
              <>
                <Send size={28} className="group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform" />
                <span className="text-xl italic">Publish To Portal Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
