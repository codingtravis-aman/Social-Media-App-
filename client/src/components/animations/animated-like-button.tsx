import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnimatedLikeButtonProps = {
  isLiked: boolean;
  onLike: () => void;
  onUnlike: () => void;
  size?: 'sm' | 'md' | 'lg';
  withConfetti?: boolean;
  className?: string;
  iconClassName?: string;
};

const confettiColors = ['#ff0000', '#ff7700', '#ffee00', '#00ff00', '#0000ff', '#8a2be2', '#ff00ff'];

export default function AnimatedLikeButton({
  isLiked,
  onLike,
  onUnlike,
  size = 'md',
  withConfetti = true,
  className = '',
  iconClassName = ''
}: AnimatedLikeButtonProps) {
  const [confetti, setConfetti] = useState<{ id: number; color: string; x: number; y: number }[]>([]);
  const [lastTap, setLastTap] = useState(0);

  const handleClick = () => {
    if (isLiked) {
      onUnlike();
    } else {
      onLike();
      if (withConfetti) {
        createConfetti();
      }
    }
  };

  const handleDoubleClick = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      if (!isLiked) {
        onLike();
        if (withConfetti) {
          createConfetti(15); // More confetti for double-tap
        }
      }
      setLastTap(0);
    } else {
      setLastTap(now);
    }
  };

  const createConfetti = (count = 8) => {
    const newConfetti = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      x: (Math.random() * 2 - 1) * 60, // Random x between -60 and 60
      y: (Math.random() * -1 - 0.2) * 80 // Random y between -16 and -80
    }));
    
    setConfetti(newConfetti);
    
    // Clear confetti after animation
    setTimeout(() => {
      setConfetti([]);
    }, 1000);
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn("relative inline-block", className)} onClick={handleClick} onDoubleClick={handleDoubleClick}>
      <motion.div
        whileTap={{ scale: 0.85 }}
        className="relative"
      >
        <Heart
          className={cn(
            sizeClasses[size],
            isLiked ? 'fill-red-500 text-red-500' : 'text-foreground',
            iconClassName
          )}
        />
        
        <AnimatePresence>
          {isLiked && (
            <motion.div
              key="heart-animation"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className={cn(sizeClasses[size], 'fill-red-500 text-red-500')} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confetti animation */}
      <AnimatePresence>
        {confetti.map((item) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
            animate={{ scale: 1, opacity: 0, x: item.x, y: item.y }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ backgroundColor: item.color }}
            className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full pointer-events-none"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}