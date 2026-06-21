import React from 'react';
import { motion } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  slideUp?: boolean;
}

export default function PageTransition({ children, className, slideUp = false }: PageTransitionProps) {
  const initial = slideUp ? { opacity: 0, y: 24 } : { opacity: 0, y: 12 };
  const animate = { opacity: 1, y: 0 };
  const exit = slideUp ? { opacity: 0, y: -24 } : { opacity: 0, y: -12 };
  
  const transition = {
    duration: 0.3, // Standardized 300ms transition duration
    ease: [0.25, 1, 0.5, 1] // Custom refined easeOutCubic curve for a fluid, tactile feel
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={className}
      style={{ willChange: "transform, opacity" }} // Hardware acceleration hints
    >
      {children}
    </motion.div>
  );
}

