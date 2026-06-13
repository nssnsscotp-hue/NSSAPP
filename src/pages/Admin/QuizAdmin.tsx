import React, { useState, useEffect } from 'react';
import { 
  Plus, Trophy, CheckCircle, Loader2, Trash2, BookOpen, Clock, 
  ChevronRight, HelpCircle, Send, Award, Edit2, Save, X, Eye, 
  FileText, Star, GraduationCap, RefreshCw, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebaseClient';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

interface QuestionItem {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'boolean' | 'text';
  options: string[];
  correct_option: number | number[] | boolean | string; // depends on type
  points: number;
}

interface QuizItem {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  created_at: string;
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

const THEME_MAP = {
  amber: {
    primary: 'border-amber-600 text-amber-700 bg-amber-50/40',
    title: 'text-amber-700',
    border: 'border-amber-600',
    accent: 'text-amber-600',
    bg: 'bg-amber-600',
    hover: 'hover:bg-amber-700',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-400',
    gradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/10'
  },
  emerald: {
    primary: 'border-emerald-600 text-emerald-700 bg-emerald-50/40',
    title: 'text-emerald-700',
    border: 'border-emerald-600',
    accent: 'text-emerald-600',
    bg: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-400',
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/10'
  },
  crimson: {
    primary: 'border-rose-600 text-rose-750 bg-rose-50/40',
    title: 'text-rose-700',
    border: 'border-rose-600',
    accent: 'text-rose-600',
    bg: 'bg-rose-600',
    hover: 'hover:bg-rose-700',
    badgeBg: 'bg-rose-50 text-rose-750 border-rose-400',
    gradient: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-500/10'
  },
  navy: {
    primary: 'border-indigo-800 text-indigo-900 bg-indigo-50/40',
    title: 'text-indigo-900',
    border: 'border-indigo-800',
    accent: 'text-indigo-800',
    bg: 'bg-indigo-800',
    hover: 'hover:bg-indigo-900',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-400',
    gradient: 'from-indigo-600 to-indigo-800',
    shadow: 'shadow-indigo-500/10'
  },
  purple: {
    primary: 'border-purple-600 text-purple-700 bg-purple-50/40',
    title: 'text-purple-700',
    border: 'border-purple-600',
    accent: 'text-purple-600',
    bg: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-400',
    gradient: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/10'
  },
  coral: {
    primary: 'border-orange-500 text-orange-700 bg-orange-50/40',
    title: 'text-orange-700',
    border: 'border-orange-500',
    accent: 'text-orange-600',
    bg: 'bg-orange-500',
    hover: 'hover:bg-orange-600',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-400',
    gradient: 'from-orange-500 to-orange-600',
    shadow: 'shadow-orange-500/10'
  }
};

const BORDER_TEMPLATES = {
  double: 'border-[12px] border-double rounded-2xl',
  solid: 'border-8 border-solid rounded-xl',
  ornate: 'border-[16px] border-double rounded-[2rem]'
};

const THEME_HEX = {
  amber: '#d97706',
  emerald: '#059669',
  crimson: '#e11d48',
  navy: '#1e3a8a',
  purple: '#7c3aed',
  coral: '#ea580c'
};

const THEME_TEXT_HEX = {
  amber: '#451a03',
  emerald: '#022c22',
  crimson: '#4c0519',
  navy: '#172554',
  purple: '#2e1065',
  coral: '#431407'
};

export default function QuizAdmin() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string; details?: string } | null>(null);

  // Active quiz being added/edited
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Partial<QuizItem>>({
    id: '',
    title: '',
    description: '',
    duration: 15,
    certificateStyle: {
      theme: 'amber',
      border: 'double',
      badge: '❂',
      titlePhrase: 'Certificate of Excellence',
      citation: 'In recognition of outstanding dedication, volunteer mobilization, and passionate leadership during various health, hygiene, literacy, and environmental outreach projects.',
      ribbonText: '★ NATIONAL SERVICE SCHEME ★'
    },
    questions: []
  });

  // Editor states
  const [showCertPreview, setShowCertPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'questions' | 'certificate'>('info');

  // Single Question composer state within editing quiz
  const [questionForm, setQuestionForm] = useState<Partial<QuestionItem>>({
    id: '',
    question: '',
    type: 'single',
    options: ['', ''],
    correct_option: 0,
    points: 10
  });

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'quizzes'));
      const activeList: QuizItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        activeList.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          duration: data.duration || 10,
          created_at: data.created_at || new Date().toISOString(),
          certificateStyle: data.certificateStyle || {
            theme: 'amber',
            border: 'double',
            badge: '❂',
            titlePhrase: 'Certificate of Excellence',
            citation: 'For successful fulfillment of goals in community upliftment.',
            ribbonText: '★ NATIONAL SERVICE SCHEME ★'
          },
          questions: data.questions || []
        });
      });

      // Sort by creation or fallbacks
      activeList.sort((a,b) => b.created_at.localeCompare(a.created_at));
      setQuizzes(activeList);

      // Seed fallback default quiz to Firestore if list completely empty
      if (activeList.length === 0) {
        await seedDefaultQuiz();
      }
    } catch (err) {
      console.warn("Firestore quiz fetch failed. Loading localStorage registry...", err);
      const local = localStorage.getItem('nss_quizzes_backup_store');
      if (local) {
        try {
          setQuizzes(JSON.parse(local));
        } catch (pe) {
          setQuizzes([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultQuiz = async () => {
    const defaultQuiz: QuizItem = {
      id: "nss-primer-quiz",
      title: "Comprehensive NSS Volunteer Assessment",
      description: "Official credential qualifier testing your proficiency in NSS code, service protocols, ethics, and community leadership workflows.",
      duration: 10,
      created_at: new Date().toISOString(),
      certificateStyle: {
        theme: 'amber',
        border: 'double',
        badge: '❂',
        titlePhrase: 'Certificate of Excellence',
        citation: 'In recognition of outstanding dedication, volunteer mobilization, and passionate leadership during various health, hygiene, literacy, and environmental outreach projects.',
        ribbonText: '★ NATIONAL SERVICE SCHEME ★'
      },
      questions: [
        {
          id: "q-1",
          question: "What is the official motto of the National Service Scheme (NSS)?",
          type: "single",
          options: ["Not Me But You", "Service Before Self", "Unity and Discipline", "Truth Alone Triumphs"],
          correct_option: 0,
          points: 10
        },
        {
          id: "q-2",
          question: "In which centenary year of Mahatma Gandhi was the NSS formally launched?",
          type: "single",
          options: ["1950", "1969", "1975", "1947"],
          correct_option: 1,
          points: 10
        },
        {
          id: "q-3",
          question: "On which date is NSS Day celebrated annually across India?",
          type: "single",
          options: ["15th August", "2nd October", "24th September", "12th January"],
          correct_option: 2,
          points: 10
        },
        {
          id: "q-4",
          question: "What does the giant wheel featured in the NSS badge represent?",
          type: "single",
          options: ["Crest of Progress, movement, and the Konark Sun Temple", "The Ashoka Chakra of the national flag", "Industrial expansion", "Urbanization of rural systems"],
          correct_option: 0,
          points: 10
        }
      ]
    };

    try {
      await setDoc(doc(db, 'quizzes', defaultQuiz.id), defaultQuiz);
      setQuizzes([defaultQuiz]);
      saveLocalBackup([defaultQuiz]);
    } catch (err) {
      console.warn("Could not seed default quiz:", err);
    }
  };

  const saveLocalBackup = (list: QuizItem[]) => {
    localStorage.setItem('nss_quizzes_backup_store', JSON.stringify(list));
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openNewQuizEditor = () => {
    setEditingQuiz({
      id: `quiz-${Date.now()}`,
      title: '',
      description: '',
      duration: 15,
      created_at: new Date().toISOString(),
      certificateStyle: {
        theme: 'navy',
        border: 'double',
        badge: '❂',
        titlePhrase: 'Certificate of Achievement',
        citation: 'For outstanding commitment to volunteer work and active participation in social services.',
        ribbonText: '★ STATE MERIT RECOGNITION ★'
      },
      questions: []
    });
    setQuestionForm({
      id: '',
      question: '',
      type: 'single',
      options: ['', ''],
      correct_option: 0,
      points: 10
    });
    setActiveTab('info');
    setIsEditorOpen(true);
  };

  const openQuizToEdit = (quiz: QuizItem) => {
    setEditingQuiz({ ...quiz });
    setQuestionForm({
      id: '',
      question: '',
      type: 'single',
      options: ['', ''],
      correct_option: 0,
      points: 10
    });
    setActiveTab('info');
    setIsEditorOpen(true);
  };

  // Add constructed question to editing quiz list
  const addQuestionToQuiz = () => {
    if (!questionForm.question?.trim()) {
      alert("Please provide the question body text first!");
      return;
    }

    // Process correctness and options depending on question type
    let finalOptions = [...(questionForm.options || [])].map(o => o.trim()).filter(Boolean);
    if (questionForm.type === 'boolean') {
      finalOptions = ["True", "False"];
    } else if (questionForm.type === 'text') {
      finalOptions = [];
    }

    const newQItem: QuestionItem = {
      id: questionForm.id || `q-${Date.now()}`,
      question: questionForm.question.trim(),
      type: questionForm.type || 'single',
      options: finalOptions,
      correct_option: questionForm.correct_option !== undefined ? questionForm.correct_option : 0,
      points: Number(questionForm.points) || 10
    };

    const currentQuestions = editingQuiz.questions ? [...editingQuiz.questions] : [];
    const existingIndex = currentQuestions.findIndex(q => q.id === newQItem.id);

    if (existingIndex > -1) {
      currentQuestions[existingIndex] = newQItem;
    } else {
      currentQuestions.push(newQItem);
    }

    setEditingQuiz({
      ...editingQuiz,
      questions: currentQuestions
    });

    // Reset question form
    setQuestionForm({
      id: '',
      question: '',
      type: 'single',
      options: ['', ''],
      correct_option: 0,
      points: 10
    });

    setActionStatus({
      type: 'success',
      text: 'Question added/updated successfully inside this builder buffer.'
    });
  };

  const deleteQuestionFromBuffer = (qId: string) => {
    if (editingQuiz.questions) {
      setEditingQuiz({
        ...editingQuiz,
        questions: editingQuiz.questions.filter(q => q.id !== qId)
      });
    }
  };

  const editQuestionFromBuffer = (item: QuestionItem) => {
    setQuestionForm({ ...item });
  };

  const saveQuizToFirebase = async () => {
    if (!editingQuiz.title?.trim()) {
      setActionStatus({
        type: 'error',
        text: 'Validation Failed',
        details: 'The Quiz must have a descriptive title!'
      });
      return;
    }

    if (!editingQuiz.questions || editingQuiz.questions.length === 0) {
      setActionStatus({
        type: 'error',
        text: 'No Questions Found',
        details: 'Please add at least 1 valid question to this quiz before publishing!'
      });
      return;
    }

    setSubmitting(true);
    setActionStatus(null);

    const targetId = editingQuiz.id || `quiz-${Date.now()}`;

    try {
      await setDoc(doc(db, 'quizzes', targetId), {
        ...editingQuiz,
        id: targetId,
        duration: Number(editingQuiz.duration) || 10,
        updated_at: new Date().toISOString()
      });

      setActionStatus({
        type: 'success',
        text: 'Ultimate Quiz Published!',
        details: `Saved successfully under ID: ${targetId}. Users can instantly attend this quiz.`
      });

      setIsEditorOpen(false);
      fetchQuizzes();
    } catch (err) {
      console.warn("Could not save to Firestore, writing to localized state:", err);
      // fallback mock update in list
      const updatedList = [...quizzes];
      const matchIndex = updatedList.findIndex(q => q.id === targetId);
      const finishedQuizItem: QuizItem = {
        id: targetId,
        title: editingQuiz.title || 'Draft Quiz',
        description: editingQuiz.description || '',
        duration: Number(editingQuiz.duration) || 15,
        created_at: editingQuiz.created_at || new Date().toISOString(),
        certificateStyle: editingQuiz.certificateStyle as any,
        questions: editingQuiz.questions || []
      };

      if (matchIndex > -1) {
        updatedList[matchIndex] = finishedQuizItem;
      } else {
        updatedList.unshift(finishedQuizItem);
      }
      setQuizzes(updatedList);
      saveLocalBackup(updatedList);

      setIsEditorOpen(false);
      setActionStatus({
        type: 'success',
        text: 'Quiz saved to local sandbox system.',
        details: 'Data persists on browser local state due to Firestore transient bypass.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFullQuiz = async (quizId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this quiz, its question pool, and certificate settings?')) return;
    
    setActionStatus(null);
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      
      const filtered = quizzes.filter(q => q.id !== quizId);
      setQuizzes(filtered);
      saveLocalBackup(filtered);

      setActionStatus({
        type: 'success',
        text: 'Quiz deleted successfully.'
      });
    } catch (err) {
      console.warn("Firestore delete failed, performing local operation:", err);
      const filtered = quizzes.filter(q => q.id !== quizId);
      setQuizzes(filtered);
      saveLocalBackup(filtered);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <Trophy className="text-purple-600" size={32} /> Ultimate Quiz Central
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest">
            Design diverse quiz formats, define timer speeds, &amp; customize tailored participant service certificates.
          </p>
        </div>
        <button
          onClick={openNewQuizEditor}
          className="h-14 px-6 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl flex items-center gap-2 shadow-xl shadow-purple-600/10 active:scale-95 transition-all self-start md:self-center"
        >
          <Plus size={16} /> Create Custom Quiz
        </button>
      </header>

      {actionStatus && (
        <div className={cn(
          "p-5 rounded-3xl text-sm font-bold flex flex-col gap-1.5 border animate-in slide-in-from-top-3 max-w-4xl",
          actionStatus.type === 'success' ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-rose-50 text-rose-800 border-rose-100"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn("w-2.5 h-2.5 rounded-full", actionStatus.type === 'success' ? "bg-emerald-500" : "bg-rose-500")} />
            <span className="font-black uppercase tracking-wide">{actionStatus.text}</span>
          </div>
          {actionStatus.details && <p className="text-[11px] text-slate-500 leading-relaxed pl-4 font-semibold">{actionStatus.details}</p>}
        </div>
      )}

      {/* Editor Modal Drawer */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              className="bg-white w-full max-w-5xl h-screen flex flex-col shadow-2xl relative z-50 text-slate-700"
            >
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 text-slate-900 shrink-0">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2.5">
                    <Layers className="text-purple-600" size={22} />
                    {editingQuiz.title ? `Edit: ${editingQuiz.title}` : 'Drafting Dynamic Quiz'}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    Quiz ID: {editingQuiz.id}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="w-12 h-12 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors bg-white shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Subtabs Navigation */}
              <div className="flex border-b border-slate-100 px-8 gap-6 bg-slate-50 shrink-0">
                {[
                  { id: 'info', name: '1. Setup Metadata', icon: HelpCircle },
                  { id: 'questions', name: `2. Question Composites (${editingQuiz.questions?.length || 0})`, icon: BookOpen },
                  { id: 'certificate', name: '3. Credentials customization', icon: Award }
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setActiveTab(st.id as any)}
                      className={cn(
                        "py-4 px-2 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2",
                        activeTab === st.id 
                          ? "border-purple-600 text-purple-600 font-extrabold" 
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Icon size={14} />
                      {st.name}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Workspace panel */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                
                {/* Tab 1: Info Setup */}
                {activeTab === 'info' && (
                  <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Quiz Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Swachh Bharat Hygiene Protocols" 
                        value={editingQuiz.title || ''}
                        onChange={e => setEditingQuiz({...editingQuiz, title: e.target.value})}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 text-xs font-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Brief Overview / Instructions</label>
                      <textarea 
                        rows={4}
                        placeholder="State the focus area, target candidates, or general instructions..."
                        value={editingQuiz.description || ''}
                        onChange={e => setEditingQuiz({...editingQuiz, description: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 text-xs font-semibold leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Clock size={12} /> Timer Duration limit (Minutes)
                        </label>
                        <input 
                          type="number" 
                          min={1}
                          max={180}
                          value={editingQuiz.duration || 15}
                          onChange={e => setEditingQuiz({...editingQuiz, duration: Number(e.target.value)})}
                          className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 text-xs font-black"
                        />
                      </div>
                      
                      <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 flex items-center justify-start gap-4">
                        <Star className="text-purple-600 shrink-0" size={24} />
                        <div>
                          <h4 className="text-[11px] font-black uppercase text-purple-900 tracking-wide">Time Countdown Protection</h4>
                          <p className="text-[10px] text-purple-600 font-semibold mt-0.5 leading-relaxed">
                            Once started, the system ticks down live. If the time expires, users are auto-submitted to guarantee authentic grades.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Question Composites builder */}
                {activeTab === 'questions' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                    
                    {/* Compose single Question Box */}
                    <div className="lg:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200/60 space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-purple-700 flex items-center gap-2">
                        <Plus size={14} /> Compose Quiz Question
                      </h4>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Question Category/Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'single', label: 'Single Choice' },
                            { id: 'multiple', label: 'Multi Select' },
                            { id: 'boolean', label: 'True/False' },
                            { id: 'text', label: 'Text Gap/Free' }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                let correctedVal: any = 0;
                                if (t.id === 'multiple') correctedVal = [0];
                                if (t.id === 'boolean') correctedVal = true;
                                if (t.id === 'text') correctedVal = '';

                                setQuestionForm({
                                  ...questionForm, 
                                  type: t.id as any,
                                  options: t.id === 'boolean' ? ["True", "False"] : ['', ''],
                                  correct_option: correctedVal
                                });
                              }}
                              className={cn(
                                "py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider text-center border transition-all",
                                questionForm.type === t.id 
                                  ? "bg-purple-600 text-white border-purple-500" 
                                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-200"
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Question body</label>
                        <textarea
                          placeholder="What is the objective or prompt?"
                          rows={2}
                          value={questionForm.question || ''}
                          onChange={e => setQuestionForm({...questionForm, question: e.target.value})}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-xs font-semibold leading-normal"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Points Gain</label>
                        <input
                          type="number"
                          placeholder="e.g. 10"
                          value={questionForm.points || 10}
                          onChange={e => setQuestionForm({...questionForm, points: Number(e.target.value)})}
                          className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl outline-none text-xs font-black"
                        />
                      </div>

                      {/* Options Setup according to types */}
                      {questionForm.type === 'single' && (
                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Set choices & select correct key</label>
                          {(questionForm.options || []).map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 w-4">{oIdx+1}.</span>
                              <input 
                                type="text"
                                placeholder={`Enter Option text`}
                                value={opt}
                                onChange={e => {
                                  const updatedOpts = [...(questionForm.options || [])];
                                  updatedOpts[oIdx] = e.target.value;
                                  setQuestionForm({...questionForm, options: updatedOpts});
                                }}
                                className={cn(
                                  "flex-grow h-10 px-3 bg-white border rounded-xl text-xs font-semibold outline-none",
                                  questionForm.correct_option === oIdx ? "border-emerald-400 ring-2 ring-emerald-50" : "border-slate-150"
                                )}
                              />
                              <button
                                type="button"
                                onClick={() => setQuestionForm({...questionForm, correct_option: oIdx})}
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center active:scale-90",
                                  questionForm.correct_option === oIdx ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"
                                )}
                              >
                                <CheckCircle size={15} />
                              </button>
                              {(questionForm.options || []).length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filteredOpts = (questionForm.options || []).filter((_, i) => i !== oIdx);
                                    let correct = questionForm.correct_option as number;
                                    if (correct >= filteredOpts.length) correct = 0;
                                    setQuestionForm({...questionForm, options: filteredOpts, correct_option: correct});
                                  }}
                                  className="w-8 h-8 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {(questionForm.options || []).length < 6 && (
                            <button
                              type="button"
                              onClick={() => setQuestionForm({...questionForm, options: [...(questionForm.options || []), '']})}
                              className="text-[10px] text-purple-600 font-black uppercase tracking-wider flex items-center gap-1 mt-1 hover:underline text-left"
                            >
                              + Add custom option
                            </button>
                          )}
                        </div>
                      )}

                      {questionForm.type === 'multiple' && (
                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Set choices & check multiple correct options</label>
                          {(questionForm.options || []).map((opt, oIdx) => {
                            const correctArr = Array.isArray(questionForm.correct_option) ? questionForm.correct_option : [];
                            const isSelected = correctArr.includes(oIdx);
                            return (
                              <div key={oIdx} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 w-4">{oIdx+1}.</span>
                                <input 
                                  type="text"
                                  placeholder={`Enter Option text`}
                                  value={opt}
                                  onChange={e => {
                                    const updatedOpts = [...(questionForm.options || [])];
                                    updatedOpts[oIdx] = e.target.value;
                                    setQuestionForm({...questionForm, options: updatedOpts});
                                  }}
                                  className={cn(
                                    "flex-grow h-10 px-3 bg-white border rounded-xl text-xs font-semibold outline-none",
                                    isSelected ? "border-emerald-400 ring-2 ring-emerald-50" : "border-slate-150"
                                  )}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    let newArr = [...correctArr];
                                    if (isSelected) {
                                      newArr = newArr.filter(i => i !== oIdx);
                                    } else {
                                      newArr.push(oIdx);
                                    }
                                    setQuestionForm({...questionForm, correct_option: newArr});
                                  }}
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center active:scale-90",
                                    isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                                  )}
                                >
                                  <CheckCircle size={15} />
                                </button>
                                {(questionForm.options || []).length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filteredOpts = (questionForm.options || []).filter((_, i) => i !== oIdx);
                                      const mappedArr = correctArr.filter(i => i !== oIdx).map(i => i > oIdx ? i - 1 : i);
                                      setQuestionForm({...questionForm, options: filteredOpts, correct_option: mappedArr});
                                    }}
                                    className="w-8 h-8 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          
                          {(questionForm.options || []).length < 6 && (
                            <button
                              type="button"
                              onClick={() => setQuestionForm({...questionForm, options: [...(questionForm.options || []), '']})}
                              className="text-[10px] text-purple-600 font-black uppercase tracking-wider flex items-center gap-1 mt-1 hover:underline text-left"
                            >
                              + Add custom option
                            </button>
                          )}
                        </div>
                      )}

                      {questionForm.type === 'boolean' && (
                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Choose default correct Boolean</label>
                          <div className="flex gap-4">
                            {[
                              { label: 'True', val: true },
                              { label: 'False', val: false }
                            ].map(b => (
                              <button
                                key={b.label}
                                type="button"
                                onClick={() => setQuestionForm({...questionForm, correct_option: b.val})}
                                className={cn(
                                  "flex-grow py-3 rounded-xl text-xs font-black uppercase text-center border-2 transition-all",
                                  questionForm.correct_option === b.val 
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-800" 
                                    : "bg-white border-slate-100 text-slate-400"
                                )}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {questionForm.type === 'text' && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Exact correct matching word/phrase</label>
                          <input
                            type="text"
                            placeholder="e.g. Swachhta"
                            value={typeof questionForm.correct_option === 'string' ? questionForm.correct_option : ''}
                            onChange={e => setQuestionForm({...questionForm, correct_option: e.target.value})}
                            className="w-full h-11 px-3 bg-white border border-slate-150 rounded-xl outline-none text-xs font-bold text-slate-800"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={addQuestionToQuiz}
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={14} /> {questionForm.id ? 'Save Updated Question' : 'Add Question To Pool'}
                      </button>
                      
                    </div>

                    {/* Composite Pool Preview */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 italic">
                          Active Question Registry ({editingQuiz.questions?.length || 0})
                        </label>
                      </div>

                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {editingQuiz.questions && editingQuiz.questions.length > 0 ? (
                          editingQuiz.questions.map((item, idx) => (
                            <div 
                              key={item.id || idx}
                              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start justify-between gap-4 hover:border-slate-200 transition-colors"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="bg-purple-100 text-purple-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">
                                    Q-{idx+1} • {item.type}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-extrabold font-mono">
                                    +{item.points} Points
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                  {item.question}
                                </p>
                                
                                {item.options && item.options.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {item.options.map((opt, oKey) => {
                                      const isCorrect = Array.isArray(item.correct_option) 
                                        ? (item.correct_option as number[]).includes(oKey)
                                        : item.correct_option === oKey;
                                      return (
                                        <span 
                                          key={oKey}
                                          className={cn(
                                            "text-[9px] px-2 py-0.5 rounded-md font-semibold",
                                            isCorrect ? "bg-emerald-100 text-emerald-800 border border-emerald-200 font-black" : "bg-white text-slate-500 border border-slate-100"
                                          )}
                                        >
                                          {opt}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                {item.type === 'text' && (
                                  <p className="text-[9px] text-emerald-600 font-black">
                                    Expected Key Accent: "{item.correct_option as string}"
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => editQuestionFromBuffer(item)}
                                  className="p-1.5 bg-white border border-slate-150 hover:border-slate-350 text-slate-500 hover:text-slate-700 rounded-lg active:scale-90"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteQuestionFromBuffer(item.id)}
                                  className="p-1.5 bg-white border border-slate-150 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg active:scale-90"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center border-2 border-dashed border-slate-200/60 rounded-3xl text-slate-400 italic text-xs">
                            This quiz has no questions published yet. Please compose items using the left workspace tool.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Dynamic Certificate customization */}
                {activeTab === 'certificate' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                    
                    {/* Styling panel controls */}
                    <div className="lg:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200/60 space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">
                        Customize Credential Theme
                      </h4>

                      {/* Presets Swatch Palette */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Color Swatch Palette</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.keys(THEME_MAP) as Array<keyof typeof THEME_MAP>).map(themeKey => (
                            <button
                              type="button"
                              key={themeKey}
                              onClick={() => {
                                const defaultPrim = THEME_HEX[themeKey];
                                const defaultText = THEME_TEXT_HEX[themeKey];
                                setEditingQuiz({
                                  ...editingQuiz,
                                  certificateStyle: {
                                    ...(editingQuiz.certificateStyle || {
                                      theme: 'amber',
                                      border: 'double',
                                      badge: '❂',
                                      titlePhrase: 'Certificate of Excellence',
                                      citation: '',
                                      ribbonText: '★ NATIONAL SERVICE SCHEME ★'
                                    }),
                                    theme: themeKey,
                                    customColor: defaultPrim,
                                    customTextColor: defaultText
                                  }
                                });
                              }}
                              className={cn(
                                "py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider text-center transition-all flex flex-col items-center justify-center gap-1",
                                editingQuiz.certificateStyle?.theme === themeKey ? "border-slate-800 ring-2 ring-slate-100" : "border-slate-150 bg-white"
                              )}
                            >
                              <div className={cn("w-4 h-4 rounded-full", THEME_MAP[themeKey].bg)} />
                              <span>{themeKey}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Wheel Selectors */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                            <span 
                              className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 transition-colors" 
                              style={{ backgroundColor: editingQuiz.certificateStyle?.customColor || THEME_HEX[editingQuiz.certificateStyle?.theme as keyof typeof THEME_HEX || 'amber'] }} 
                            />
                            Theme Color Wheel
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={editingQuiz.certificateStyle?.customColor || THEME_HEX[editingQuiz.certificateStyle?.theme as keyof typeof THEME_HEX || 'amber']}
                              onChange={e => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  customColor: e.target.value
                                }
                              })}
                              className="w-10 h-10 bg-white border border-slate-205 rounded-xl cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={editingQuiz.certificateStyle?.customColor || THEME_HEX[editingQuiz.certificateStyle?.theme as keyof typeof THEME_HEX || 'amber']}
                              onChange={e => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  customColor: e.target.value
                                }
                              })}
                              placeholder="#hex"
                              className="w-full px-2.5 bg-white border border-slate-150 rounded-xl outline-none text-[10px] font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                            <span 
                              className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 transition-colors" 
                              style={{ backgroundColor: editingQuiz.certificateStyle?.customTextColor || THEME_TEXT_HEX[editingQuiz.certificateStyle?.theme as keyof typeof THEME_TEXT_HEX || 'amber'] }} 
                            />
                            Text Accent Color
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={editingQuiz.certificateStyle?.customTextColor || THEME_TEXT_HEX[editingQuiz.certificateStyle?.theme as keyof typeof THEME_TEXT_HEX || 'amber']}
                              onChange={e => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  customTextColor: e.target.value
                                }
                              })}
                              className="w-10 h-10 bg-white border border-slate-205 rounded-xl cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={editingQuiz.certificateStyle?.customTextColor || THEME_TEXT_HEX[editingQuiz.certificateStyle?.theme as keyof typeof THEME_TEXT_HEX || 'amber']}
                              onChange={e => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  customTextColor: e.target.value
                                }
                              })}
                              placeholder="#hex"
                              className="w-full px-2.5 bg-white border border-slate-150 rounded-xl outline-none text-[10px] font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Font typography select */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Typography Font Selection</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {([
                            { id: 'serif', label: 'Classic Serif' },
                            { id: 'sans', label: 'Modern Sans' },
                            { id: 'mono', label: 'Tech Mono' },
                            { id: 'display', label: 'Elegant Display' }
                          ]).map(f => (
                            <button
                              type="button"
                              key={f.id}
                              onClick={() => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  fontStyle: f.id as any
                                }
                              })}
                              className={cn(
                                "py-1.5 rounded-xl text-[9px] font-bold text-center border transition-all",
                                (editingQuiz.certificateStyle?.fontStyle || 'serif') === f.id ? "bg-slate-950 text-white border-slate-900" : "bg-white text-slate-500 border-slate-150"
                              )}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive graphic ornaments also */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Decorative Graphics & Stamps</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingQuiz({
                              ...editingQuiz,
                              certificateStyle: {
                                ...(editingQuiz.certificateStyle as any),
                                graphicCorners: !(editingQuiz.certificateStyle?.graphicCorners ?? true)
                              }
                            })}
                            className={cn(
                              "p-2.5 rounded-xl border text-[9px] font-black uppercase text-left transition-all flex items-center justify-between",
                              (editingQuiz.certificateStyle?.graphicCorners ?? true) ? "bg-purple-100/50 border-purple-250 text-purple-800" : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50"
                            )}
                          >
                            <span>Corners Ornament</span>
                            <span className="text-[8px] font-semibold">{(editingQuiz.certificateStyle?.graphicCorners ?? true) ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingQuiz({
                              ...editingQuiz,
                              certificateStyle: {
                                ...(editingQuiz.certificateStyle as any),
                                graphicGoldSeal: !(editingQuiz.certificateStyle?.graphicGoldSeal ?? true)
                              }
                            })}
                            className={cn(
                              "p-2.5 rounded-xl border text-[9px] font-black uppercase text-left transition-all flex items-center justify-between",
                              (editingQuiz.certificateStyle?.graphicGoldSeal ?? true) ? "bg-purple-100/50 border-purple-250 text-purple-800" : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50"
                            )}
                          >
                            <span>Official Seal</span>
                            <span className="text-[8px] font-semibold">{(editingQuiz.certificateStyle?.graphicGoldSeal ?? true) ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingQuiz({
                              ...editingQuiz,
                              certificateStyle: {
                                ...(editingQuiz.certificateStyle as any),
                                graphicWatermark: !(editingQuiz.certificateStyle?.graphicWatermark ?? true)
                              }
                            })}
                            className={cn(
                              "p-2.5 rounded-xl border text-[9px] font-black uppercase text-left transition-all flex items-center justify-between",
                              (editingQuiz.certificateStyle?.graphicWatermark ?? true) ? "bg-purple-100/50 border-purple-250 text-purple-800" : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50"
                            )}
                          >
                            <span>Symbol Watermark</span>
                            <span className="text-[8px] font-semibold">{(editingQuiz.certificateStyle?.graphicWatermark ?? true) ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingQuiz({
                              ...editingQuiz,
                              certificateStyle: {
                                ...(editingQuiz.certificateStyle as any),
                                graphicLaurel: !(editingQuiz.certificateStyle?.graphicLaurel ?? true)
                              }
                            })}
                            className={cn(
                              "p-2.5 rounded-xl border text-[9px] font-black uppercase text-left transition-all flex items-center justify-between",
                              (editingQuiz.certificateStyle?.graphicLaurel ?? true) ? "bg-purple-100/50 border-purple-250 text-purple-800" : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50"
                            )}
                          >
                            <span>Laurel Garland</span>
                            <span className="text-[8px] font-semibold">{(editingQuiz.certificateStyle?.graphicLaurel ?? true) ? 'ON' : 'OFF'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Accent Ribbon Banner Text</label>
                        <input
                          type="text"
                          value={editingQuiz.certificateStyle?.ribbonText || '★ NATIONAL SERVICE SCHEME ★'}
                          onChange={e => setEditingQuiz({
                            ...editingQuiz,
                            certificateStyle: {
                              ...(editingQuiz.certificateStyle as any),
                              ribbonText: e.target.value
                            }
                          })}
                          className="w-full h-11 px-3 bg-white border border-slate-150 rounded-xl outline-none text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Crest Badging Symbol / Icon</label>
                        <div className="flex gap-2">
                          {(['❂', '★', '🏆', '🎓', '🎖️']).map(sym => (
                            <button
                              type="button"
                              key={sym}
                              onClick={() => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  badge: sym as any
                                }
                              })}
                              className={cn(
                                "flex-grow h-12 rounded-xl text-lg font-black border transition-all flex items-center justify-center",
                                editingQuiz.certificateStyle?.badge === sym ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-500 hover:bg-slate-100"
                              )}
                            >
                              {sym}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Double Decorated Border Outline</label>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { id: 'double', label: 'Classic Double' },
                            { id: 'solid', label: 'Modern Bold' },
                            { id: 'ornate', label: 'Detailed Frame' }
                          ]).map(b => (
                            <button
                              type="button"
                              key={b.id}
                              onClick={() => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  border: b.id as any
                                }
                              })}
                              className={cn(
                                "py-2 rounded-xl text-[9px] font-black uppercase text-center border transition-all",
                                editingQuiz.certificateStyle?.border === b.id ? "bg-slate-955 text-white" : "bg-white text-slate-500"
                              )}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Certificate Title Heading Phrase</label>
                        <input
                          type="text"
                          value={editingQuiz.certificateStyle?.titlePhrase || 'Certificate of Excellence'}
                          onChange={e => setEditingQuiz({
                            ...editingQuiz,
                            certificateStyle: {
                              ...(editingQuiz.certificateStyle as any),
                              titlePhrase: e.target.value
                            }
                          })}
                          className="w-full h-11 px-3 bg-white border border-slate-150 rounded-xl outline-none text-xs font-bold text-slate-850"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Dynamic Citation Text Description</label>
                        <textarea
                          rows={3}
                          value={editingQuiz.certificateStyle?.citation || ''}
                          onChange={e => setEditingQuiz({
                            ...editingQuiz,
                            certificateStyle: {
                              ...(editingQuiz.certificateStyle as any),
                              citation: e.target.value
                            }
                          })}
                          className="w-full p-3 bg-white border border-slate-150 rounded-xl text-xs font-medium outline-none leading-relaxed"
                        />
                      </div>

                      {/* Custom Signatures layout inputs */}
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <label className="text-[9px] font-black uppercase text-slate-550 tracking-wider block">Signature Roll Configuration</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[7.5px] font-extrabold uppercase text-slate-400">First Program Officer Name</label>
                            <input
                              type="text"
                              placeholder="PO Dr. S. K. Nair"
                              value={editingQuiz.certificateStyle?.sig1Name || ''}
                              onChange={e => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  sig1Name: e.target.value
                                }
                              })}
                              className="w-full h-9 px-2 bg-white border border-slate-150 rounded-xl outline-none text-[10px] font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Programme Officer Unit"
                              value={editingQuiz.certificateStyle?.sig1Title || ''}
                              onChange={e => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  sig1Title: e.target.value
                                }
                              })}
                              className="w-full h-9 px-2 bg-white border border-slate-150 rounded-xl outline-none text-[8px] text-slate-400 font-medium mt-1"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[7.5px] font-extrabold uppercase text-slate-400">Second Principal Name</label>
                            <input
                              type="text"
                              placeholder="PO Prof. L. Mathew"
                              value={editingQuiz.certificateStyle?.sig2Name || ''}
                              onChange={e => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  sig2Name: e.target.value
                                }
                              })}
                              className="w-full h-9 px-2 bg-white border border-slate-150 rounded-xl outline-none text-[10px] font-bold"
                            />
                            <input
                              type="text"
                              placeholder="NSS College Executive"
                              value={editingQuiz.certificateStyle?.sig2Title || ''}
                              onChange={e => setEditingQuiz({
                                ...editingQuiz,
                                certificateStyle: {
                                  ...(editingQuiz.certificateStyle as any),
                                  sig2Title: e.target.value
                                }
                              })}
                              className="w-full h-9 px-2 bg-white border border-slate-150 rounded-xl outline-none text-[8px] text-slate-400 font-medium mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Certificate Area */}
                    <div className="lg:col-span-7 bg-slate-100 p-6 rounded-[2.5rem] flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
                      <span className="absolute top-4 left-4 bg-purple-100 text-purple-700 text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider">
                        Live Preview rendering stage
                      </span>

                      {/* Rendered Certificate Card Preview */}
                      {(() => {
                        const style = editingQuiz.certificateStyle || {
                          theme: 'amber',
                          border: 'double',
                          badge: '❂',
                          titlePhrase: 'Certificate of Excellence',
                          ribbonText: '★ NATIONAL SERVICE SCHEME ★'
                        };
                        const pColor = style.customColor || THEME_HEX[style.theme as keyof typeof THEME_HEX || 'amber'];
                        const tColorVal = style.customTextColor || THEME_TEXT_HEX[style.theme as keyof typeof THEME_TEXT_HEX || 'amber'];
                        const selectedFont = style.fontStyle || 'serif';
                        const fontClass = selectedFont === 'sans' ? 'font-sans' : selectedFont === 'mono' ? 'font-mono' : selectedFont === 'display' ? 'font-serif tracking-tight font-black uppercase' : 'font-serif';
                        
                        return (
                          <div 
                            className={cn(
                              "bg-white p-8 text-center relative select-none shadow-md max-w-sm shrink-0 w-full text-[10px] overflow-hidden min-h-[320px] flex flex-col justify-between transition-all",
                              fontClass,
                              BORDER_TEMPLATES[style.border || 'double']
                            )}
                            style={{ borderColor: pColor }}
                          >
                            {/* Graphic Ornaments: Corners */}
                            {(style.graphicCorners ?? true) && (
                              <div className="absolute inset-0 pointer-events-none p-1.5 z-10">
                                <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: pColor }} />
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: pColor }} />
                                <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: pColor }} />
                                <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: pColor }} />
                              </div>
                            )}

                            {/* Laurel Garland Ring backdrop */}
                            {(style.graphicLaurel ?? true) && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
                                <svg viewBox="0 0 100 100" className="w-[140px] h-[140px]" style={{ stroke: pColor, fill: 'none' }}>
                                  <circle cx="50" cy="50" r="38" strokeWidth="1" strokeDasharray="2,2" />
                                  <circle cx="50" cy="50" r="34" strokeWidth="0.5" />
                                </svg>
                              </div>
                            )}

                            {/* Watermark badge Backdrop */}
                            {(style.graphicWatermark ?? true) && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none text-[6.5rem] select-none z-0">
                                {style.badge || '❂'}
                              </div>
                            )}

                            {/* Official Seal stamp graphic */}
                            {(style.graphicGoldSeal ?? true) && (
                              <div className="absolute bottom-8 right-2 w-8 h-8 pointer-events-none opacity-85 z-10">
                                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                                  <path
                                    d="M50,0 L55,10 L66,5 L68,16 L79,15 L77,26 L87,29 L82,39 L91,45 L83,53 L89,64 L79,69 L82,80 L71,82 L71,93 L60,91 L57,100 L47,97 L41,105 L33,98 L25,103 L20,93 L10,95 L9,84 L0,82 L2,71 L0,60 L7,52 L1,41 L10,36 L8,25 L18,23 L20,12 L30,13 L33,2 L43,5 Z"
                                    fill={pColor}
                                  />
                                  <circle cx="50" cy="50" r="28" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" />
                                </svg>
                              </div>
                            )}

                            {/* Ribbon Text display block */}
                            <div 
                              className="text-[7.5px] font-black uppercase font-mono tracking-widest mt-1 pr-1"
                              style={{ color: pColor }}
                            >
                              {style.ribbonText || '★ NATIONAL SERVICE SCHEME ★'}
                            </div>

                            <hr className="border-t w-1/4 mx-auto my-1.5 opacity-30" style={{ borderColor: pColor }} />

                            {/* TitlePhrase with custom text color */}
                            <h4 
                              className="text-xs font-bold uppercase tracking-widest italic"
                              style={{ color: tColorVal }}
                            >
                              {style.titlePhrase || 'Certificate of Excellence'}
                            </h4>

                            {/* Middle Volunteer name mockups */}
                            <div className="my-2.5 text-slate-650 leading-normal text-[8px] italic font-sans max-w-[200px] mx-auto">
                              "Volunteer Full Name"
                              <p className="text-[7px] text-slate-400 mt-1 not-italic font-medium shrink-0 leading-relaxed">
                                {style.citation || 'For exemplary active civic dedication.'}
                              </p>
                            </div>

                            {/* Signatures with customizable metadata */}
                            <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-100 pt-1.5 mt-auto">
                              <div>
                                <div className="h-4 border-b border-dotted border-slate-300 italic text-[6.5px] text-slate-500 flex items-center justify-center">
                                  {style.sig1Name || 'PO Dr. S. K. Nair'}
                                </div>
                                <span className="text-[5.5px] uppercase font-bold text-slate-400 block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                  {style.sig1Title || 'NSS Program Officer'}
                                </span>
                              </div>
                              <div>
                                <div className="h-4 border-b border-dotted border-slate-300 italic text-[6.5px] text-indigo-950/70 flex items-center justify-center">
                                  {style.sig2Name || 'Dr. Rajesh R. (Principal)'}
                                </div>
                                <span className="text-[5.5px] uppercase font-bold text-slate-400 block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                  {style.sig2Title || 'NSS College Executive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Publish Actions bar */}
              <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-6 h-12 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-xs font-black uppercase rounded-xl"
                >
                  Discard Draft
                </button>
                <button
                  onClick={saveQuizToFirebase}
                  disabled={submitting}
                  className="px-8 h-12 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-600/15"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  Publish Assessment
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Quizzes Grid Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Published Active Quizzes Pool</h3>
              <p className="text-xs text-slate-500">Volunteers can access, participate, and download credentials for these active evaluations.</p>
            </div>
            <button
              onClick={fetchQuizzes}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl active:scale-95 transition-all"
              title="Refresh Pool"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-16 text-center">
                <Loader2 className="animate-spin text-purple-600 mx-auto" size={40} />
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider mt-4">Streaming quizzes grid...</p>
              </div>
            ) : quizzes.length > 0 ? (
              quizzes.map((quiz) => {
                const style = quiz.certificateStyle || { theme: 'amber', badge: '❂' };
                const tColor = THEME_MAP[style.theme as keyof typeof THEME_MAP] || THEME_MAP.amber;
                return (
                  <div 
                    key={quiz.id}
                    className="p-6 rounded-3xl bg-white border border-slate-150 hover:border-purple-200 transition-all hover:shadow-md flex flex-col justify-between gap-6 group relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Badge styling & timer indicator */}
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border", tColor.primary)}>
                          Theme: {style.theme} {style.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 font-mono">
                          <Clock size={11} /> {quiz.duration} Mins
                        </span>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <h4 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-purple-600 transition-colors">
                          {quiz.title}
                        </h4>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {quiz.description || 'No instruction setup.'}
                        </p>
                      </div>

                      {/* stats count */}
                      <div className="flex items-center gap-3 pt-2">
                        <span className="bg-slate-100 text-slate-600 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                          {quiz.questions?.length || 0} Questions
                        </span>
                        <span className="bg-purple-50 text-purple-700 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                          {((quiz.questions || []).reduce((sum, q) => sum + (q.points || 10), 0))} Points
                        </span>
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => openQuizToEdit(quiz)}
                        className="flex-grow h-11 bg-slate-905 hover:bg-slate-800 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Edit2 size={13} /> Edit Quiz
                      </button>
                      
                      <button
                        onClick={() => deleteFullQuiz(quiz.id)}
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95 shrink-0"
                        title="Delete Quiz"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200/60 rounded-3xl italic text-slate-400 text-xs">
                No custom quizzes published. Tap "Create Custom Quiz" above to deploy your interactive portal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
