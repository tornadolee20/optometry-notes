import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share } from 'lucide-react';

const InstallPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) return;

    // Show after a short delay on first visit
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-[60] max-w-[400px] mx-auto"
        >
          <div className="bg-card rounded-lg shadow-elevated p-4 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src="/icon-512.png" alt="App icon" width={36} height={36} className="rounded-lg" />
                <h3 className="text-body font-semibold text-card-foreground">加入主畫面</h3>
              </div>
              <button onClick={dismiss} className="touch-target flex items-center justify-center">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-label text-muted-foreground mb-3">
              將「視力家家簿」加入主畫面，享受更好的使用體驗
            </p>
            <div className="flex items-center gap-2 text-label text-primary font-medium">
              <Share size={16} />
              <span>點擊分享 → 加入主畫面</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
