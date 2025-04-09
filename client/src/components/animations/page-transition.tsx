import { ReactNode } from "react";
import { motion } from "framer-motion";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
  animation?: "fade" | "slide" | "scale" | "slideUp";
  duration?: number;
  delay?: number;
};

const animations = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 }
  },
  scale: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  },
  slideUp: {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -30, opacity: 0 }
  }
};

export default function PageTransition({
  children,
  className = "",
  animation = "fade",
  duration = 0.3,
  delay = 0
}: PageTransitionProps) {
  const variant = animations[animation];

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration, delay, ease: "easeInOut" }}
      variants={variant}
    >
      {children}
    </motion.div>
  );
}