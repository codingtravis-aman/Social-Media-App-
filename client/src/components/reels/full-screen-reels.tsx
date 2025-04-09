import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InteractiveReelCard } from './interactive-reel-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export function FullScreenReels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  
  // Fetch reels
  const { data: reels, isLoading, error } = useQuery({
    queryKey: ['/api/reels'],
    queryFn: async () => {
      const response = await fetch('/api/reels');
      if (!response.ok) {
        throw new Error('Failed to fetch reels');
      }
      return response.json();
    },
  });
  
  // Handle swipe/scroll behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const index = Math.round(scrollTop / itemHeight);
      
      // Only update if different
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    };
    
    // Handle wheel events separately for better control
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = e.deltaY;
      const itemHeight = container.clientHeight;
      
      // Only navigate on significant scrolls
      if (Math.abs(delta) < 50) return;
      
      if (delta > 0 && currentIndex < (reels?.length || 0) - 1) {
        // Scroll down to next item
        container.scrollTo({
          top: (currentIndex + 1) * itemHeight,
          behavior: 'smooth'
        });
      } else if (delta < 0 && currentIndex > 0) {
        // Scroll up to previous item
        container.scrollTo({
          top: (currentIndex - 1) * itemHeight,
          behavior: 'smooth'
        });
      }
    };
    
    // Touch handling for mobile
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      const itemHeight = container.clientHeight;
      
      // Only navigate on significant swipes
      if (Math.abs(diff) < 50) return;
      
      if (diff > 0 && currentIndex < (reels?.length || 0) - 1) {
        // Swipe up to next item
        container.scrollTo({
          top: (currentIndex + 1) * itemHeight,
          behavior: 'smooth'
        });
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down to previous item
        container.scrollTo({
          top: (currentIndex - 1) * itemHeight,
          behavior: 'smooth'
        });
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, reels?.length]);
  
  // Navigation functions
  const goToNextReel = () => {
    if (!containerRef.current || currentIndex >= (reels?.length || 0) - 1) return;
    
    const container = containerRef.current;
    const itemHeight = container.clientHeight;
    
    container.scrollTo({
      top: (currentIndex + 1) * itemHeight,
      behavior: 'smooth'
    });
  };
  
  const goToPrevReel = () => {
    if (!containerRef.current || currentIndex <= 0) return;
    
    const container = containerRef.current;
    const itemHeight = container.clientHeight;
    
    container.scrollTo({
      top: (currentIndex - 1) * itemHeight,
      behavior: 'smooth'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white">Loading reels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white">Error loading reels. Please try again later.</div>
      </div>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white">No reels available.</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
          onClick={() => setLocation('/watch')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Reels container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
      >
        {reels.map((reel: any, index: number) => (
          <div 
            key={reel.id} 
            className="h-full w-full snap-start snap-always"
          >
            <InteractiveReelCard 
              reel={reel}
              isCurrent={index === currentIndex}
              onNext={index === reels.length - 1 ? undefined : goToNextReel}
            />
          </div>
        ))}
      </div>
    </div>
  );
}