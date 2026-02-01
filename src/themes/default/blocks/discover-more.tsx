'use client';

import { useState, useRef, useCallback } from 'react';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type VideoItem = {
  title?: string;
  src?: string;
  poster?: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function DiscoverMore({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const items = (section.items ?? []) as VideoItem[];
  const [active, setActive] = useState<VideoItem | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setActive(null);
    }
  };

  const handleMouseEnter = useCallback((idx: number) => {
    setHoveredIndex(idx);
    const video = videoRefs.current.get(idx);
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  const handleMouseLeave = useCallback((idx: number) => {
    setHoveredIndex(null);
    const video = videoRefs.current.get(idx);
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  const setVideoRef = useCallback((idx: number, el: HTMLVideoElement | null) => {
    if (el) {
      videoRefs.current.set(idx, el);
    } else {
      videoRefs.current.delete(idx);
    }
  }, []);

  return (
    <section
      id={section.id}
      className={cn('relative py-20 md:py-32 overflow-hidden', section.className, className)}
    >
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[150px] animate-[drift_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 -right-[10%] h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px] animate-[drift_24s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="container relative space-y-12">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center">
            {section.label ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-primary mb-4 text-xs font-semibold uppercase tracking-[0.35em]"
              >
                {section.label}
              </motion.div>
            ) : null}
            <h2 className="text-foreground mb-5 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.map((item, idx) => (
            <motion.button
              key={`${item.src ?? 'video'}-${idx}`}
              custom={idx}
              variants={cardVariants}
              type="button"
              onClick={() => setActive(item)}
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
              className="group relative text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
              aria-label={item.title ? `Play ${item.title}` : 'Play video'}
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-muted/50 to-muted/20 shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:border-primary/30">
                {/* Video element */}
                <video
                  ref={(el) => setVideoRef(idx, el)}
                  src={item.src ?? ''}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

                {/* Play button - visible by default, hidden on hover */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: hoveredIndex === idx ? 0 : 1,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex size-14 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-md shadow-2xl"
                  >
                    <Play className="size-6 text-white fill-white/90 ml-0.5" />
                  </motion.div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>

                {/* Border glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ring-1 ring-inset ring-white/20" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Fullscreen video dialog */}
        <AnimatePresence>
          {active && (
            <Dialog open={!!active} onOpenChange={handleOpenChange}>
              <DialogContent className="w-[90vw] max-w-[90vw] md:w-[85vw] md:max-w-[85vw] lg:w-[80vw] lg:max-w-[80vw] xl:w-[75vw] xl:max-w-[75vw] border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
                <DialogTitle className="sr-only">
                  {active.title ?? 'Video player'}
                </DialogTitle>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[16/9] w-full mx-auto overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/50 ring-1 ring-white/10"
                >
                  <video
                    src={active.src ?? ''}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-contain"
                  />
                  {/* Close button */}
                  <button
                    onClick={() => setActive(null)}
                    className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white transition-all duration-200 hover:bg-black/70 hover:scale-110"
                    aria-label="Close video"
                  >
                    <X className="size-5" />
                  </button>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
