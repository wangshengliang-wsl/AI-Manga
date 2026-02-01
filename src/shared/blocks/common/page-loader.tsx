'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LOADING_MESSAGES = [
  'AI 是笔，创意是墨，故事永远由你书写。',
  '从构思到成画，让创作的距离缩短为一个想法。',
  '人人都可以是漫画家，只要心中有故事。',
  '技术降低门槛，热爱决定高度。',
  '你的故事，AI 来画。',
  '让每一个脑洞都有机会成为作品。',
  '从零到漫剧，只需一个灵感。',
  '创作自由，表达无限。',
];

const TEXT_INTERVAL = 3000;
const FADE_DURATION = 500;
const MIN_DISPLAY_TIME = 2500;
const EXIT_DURATION = 600;

type LoaderState = 'pending' | 'visible' | 'exiting' | 'hidden';

export function PageLoader() {
  const [state, setState] = useState<LoaderState>('pending');
  const [currentIndex, setCurrentIndex] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setState('visible');
  }, []);

  useEffect(() => {
    if (state !== 'visible') return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, TEXT_INTERVAL);

    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (state !== 'visible') return;

    const triggerExit = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

      setTimeout(() => {
        setState('exiting');

        setTimeout(() => {
          setState('hidden');
        }, EXIT_DURATION);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      triggerExit();
    } else {
      window.addEventListener('load', triggerExit, { once: true });
      return () => window.removeEventListener('load', triggerExit);
    }
  }, [state]);

  if (state === 'pending' || state === 'hidden') return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: state === 'exiting' ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION / 1000, ease: 'easeInOut' }}
    >
      <div className="flex h-20 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            className="text-center text-lg font-medium text-white md:text-xl lg:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: FADE_DURATION / 1000, ease: 'easeInOut' }}
          >
            {LOADING_MESSAGES[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
