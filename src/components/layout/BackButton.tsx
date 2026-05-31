import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ to, label = "Go Back", className }: BackButtonProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoBack}
      whileHover={{ scale: 1.05, x: -3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-750 hover:text-brand-600 rounded-2xl border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-wider transition-colors select-none ${className || ''}`}
    >
      <ArrowLeft size={14} className="stroke-[3px] text-slate-500 hover:text-brand-600 transition-colors" />
      <span>{label}</span>
    </motion.button>
  );
}
