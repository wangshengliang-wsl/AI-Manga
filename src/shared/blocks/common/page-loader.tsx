'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';

import { PrismaticBurst } from '@/shared/components/magicui/prismatic-burst';

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
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_MESSAGES.length)
  );
  const [themeColors, setThemeColors] = useState<string[]>([
    '#a78bfa',
    '#c4b5fd',
    '#f0abfc',
    '#a7f3d0',
  ]);
  const startTimeRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();

  const getLoaderColors = useCallback((): string[] => {
    if (resolvedTheme === 'dark') {
      return ['#818cf8', '#a78bfa', '#e879f9', '#6ee7b7'];
    }
    return ['#a78bfa', '#c4b5fd', '#f0abfc', '#a7f3d0'];
  }, [resolvedTheme]);

  useEffect(() => {
    setThemeColors(getLoaderColors());
  }, [getLoaderColors]);

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
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'var(--loader-bg)' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: state === 'exiting' ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION / 1000, ease: 'easeInOut' }}
    >
      {/* Background: PrismaticBurst WebGL animation */}
      <div className="absolute inset-0">
        <PrismaticBurst
          animationType="rotate3d"
          distort={10}
          intensity={1.5}
          speed={0.5}
          colors={themeColors}
          paused={state === 'exiting'}
          mixBlendMode="normal"
        />
      </div>

      {/* Content: Text messages */}
      <div className="relative z-10 flex h-20 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            className="text-center text-lg font-medium md:text-xl lg:text-2xl"
            style={{
              color: '#ffffff',
              textShadow:
                '0 2px 10px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.3)',
            }}
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
