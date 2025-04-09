import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type MotionWrapperProps = {
  children: ReactNode;
  className?: string;
  type?: 'hover' | 'tap' | 'both';
  hoverScale?: number;
  tapScale?: number;
  rotateOnTap?: boolean;
  whileInView?: boolean;
  duration?: number;
  delay?: number;
};

export default function MotionWrapper({
  children,
  className = '',
  type = 'both',
  hoverScale = 1.05,
  tapScale = 0.95,
  rotateOnTap = false,
  whileInView = false,
  duration = 0.15,
  delay = 0
}: MotionWrapperProps) {
  const hoverAnimation = type === 'both' || type === 'hover' 
    ? { scale: hoverScale }
    : {};
  
  const tapAnimation = type === 'both' || type === 'tap'
    ? { 
        scale: tapScale,
        rotate: rotateOnTap ? 2 : 0
      }
    : {};
  
  const viewportAnimation = whileInView
    ? {
        once: true,
        amount: 0.3,
      }
    : undefined;

  return (
    <motion.div
      className={className}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      whileInView={whileInView ? { scale: 1, opacity: 1 } : undefined}
      initial={whileInView ? { scale: 0.9, opacity: 0 } : undefined}
      viewport={viewportAnimation}
      transition={{ duration, delay, type: 'spring', stiffness: 400 }}
    >
      {children}
    </motion.div>
  );
}