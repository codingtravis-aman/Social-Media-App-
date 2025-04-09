import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SkeletonLoaderProps = {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'image' | 'rect';
  width?: string | number;
  height?: string | number;
  count?: number;
  gap?: number;
};

export default function SkeletonLoader({
  className = '',
  variant = 'rect',
  width,
  height,
  count = 1,
  gap = 4
}: SkeletonLoaderProps) {
  const variantClasses = {
    card: 'w-full h-32 rounded-lg',
    text: 'w-full h-4 rounded-md',
    circle: 'rounded-full aspect-square',
    image: 'w-full aspect-video rounded-md',
    rect: ''
  };

  const shimmerVariant = {
    hidden: {
      x: '-100%',
      opacity: 0.5
    },
    visible: {
      x: '100%',
      opacity: 1
    }
  };

  const skeletons = Array.from({ length: count }, (_, i) => i);

  const skeletonItem = (key: number) => (
    <div 
      key={key}
      className={cn(
        'relative bg-muted overflow-hidden',
        variantClasses[variant],
        className
      )}
      style={{ 
        width: width || undefined, 
        height: height || undefined,
      }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
        variants={shimmerVariant}
        initial="hidden"
        animate="visible"
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear"
        }}
      />
    </div>
  );

  if (count === 1) {
    return skeletonItem(0);
  }

  return (
    <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap }}>
      {skeletons.map(i => skeletonItem(i))}
    </div>
  );
}