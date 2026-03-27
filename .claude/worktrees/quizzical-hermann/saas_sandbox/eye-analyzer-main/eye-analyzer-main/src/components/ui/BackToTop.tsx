/**
 * Back to Top Button - Phase 2 Mobile Optimized
 * - Button size: 56×56px on mobile (from 48×48px)
 * - Icon size: 24px on mobile (from 20px)
 * - Touch feedback: active:scale-90
 * - Position: right-6 bottom-6 (24px from edges)
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BackToTopProps {
  threshold?: number;
  className?: string;
}

export const BackToTop: React.FC<BackToTopProps> = ({
  threshold = 300,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed z-50",
            "bottom-6 right-6 md:bottom-4 md:right-4", // 24px mobile, 16px desktop
            className
          )}
        >
          <Button
            size="icon"
            className={cn(
              "rounded-full shadow-lg transition-all duration-200",
              "bg-primary hover:bg-primary/90",
              "hover:scale-105 active:scale-90", // Touch feedback
              "h-14 w-14 md:h-12 md:w-12" // 56px mobile, 48px desktop
            )}
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <ArrowUp className="h-6 w-6 md:h-5 md:w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
