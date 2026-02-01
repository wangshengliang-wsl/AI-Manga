'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { LightRays } from '@/shared/components/magicui/light-rays';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

import { SocialAvatars } from './social-avatars';

const RAYS_COLOR_LIGHT = '#8A79AB';
const RAYS_COLOR_DARK = '#A495C6';

const fadeInUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export function Hero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const [raysColor, setRaysColor] = useState<string | null>(null);

  useEffect(() => {
    const updateColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setRaysColor(isDark ? RAYS_COLOR_DARK : RAYS_COLOR_LIGHT);
    };
    updateColor();
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const highlightText = section.highlight_text ?? '';
  let texts = null;
  if (highlightText) {
    texts = section.title?.split(highlightText, 2);
  }
  const hotComics = (section as any).hot_comics?.items ?? [];
  const hotComicsId = (section as any).hot_comics?.id ?? 'hot-comics';

  return (
    <section
      id={section.id}
      className={cn(
        'relative min-h-screen pt-24 pb-8 md:pt-36 md:pb-8 overflow-hidden',
        section.className,
        className
      )}
    >
      {/* Light rays background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {raysColor && (
          <LightRays
            raysOrigin="top-center"
            raysColor={raysColor}
            raysSpeed={0.8}
            lightSpread={1.5}
            rayLength={1.5}
            fadeDistance={1.2}
            saturation={0.8}
            followMouse={true}
            mouseInfluence={0.15}
            className="absolute inset-0"
          />
        )}
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10"
      >
        {section.announcement && (
          <motion.div variants={fadeInUp} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <Link
              href={section.announcement.url || ''}
              target={section.announcement.target || '_self'}
              className="hover:bg-background dark:hover:border-t-border bg-muted/80 backdrop-blur-sm group mx-auto mb-8 flex w-fit items-center gap-4 rounded-full border border-primary/20 p-1 pl-4 shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] dark:border-t-white/5 dark:shadow-zinc-950"
            >
              <span className="text-foreground text-sm font-medium">
                {section.announcement.title}
              </span>
              <span className="dark:border-background block h-4 w-0.5 border-l bg-primary/30 dark:bg-zinc-700"></span>

              <div className="bg-primary/10 group-hover:bg-primary/20 size-6 overflow-hidden rounded-full duration-500">
                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3 text-primary" />
                  </span>
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3 text-primary" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="relative mx-auto max-w-full px-4 text-center md:max-w-6xl">
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {texts && texts.length > 0 ? (
              <h1 className="text-foreground text-4xl font-bold tracking-tight text-pretty sm:mt-12 sm:text-6xl lg:text-7xl">
                {texts[0]}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#8A79AB] via-[#5c4d78] via-50% to-[#8A79AB] dark:from-[#A495C6] dark:via-[#6b5d8a] dark:to-[#A495C6] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer-slow drop-shadow-[0_0_25px_rgba(138,121,171,0.5)] dark:drop-shadow-[0_0_30px_rgba(164,149,198,0.6)]">
                    {highlightText}
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-4 overflow-visible"
                    viewBox="0 0 200 20"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={raysColor ?? RAYS_COLOR_LIGHT} stopOpacity="0.2" />
                        <stop offset="50%" stopColor={raysColor ?? RAYS_COLOR_LIGHT} stopOpacity="1" />
                        <stop offset="100%" stopColor={raysColor ?? RAYS_COLOR_LIGHT} stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 10 Q 10 5, 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10 T 140 10 T 160 10 T 180 10 T 200 10"
                      stroke="url(#waveGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="animate-wave-loop"
                      style={{ strokeDasharray: 400, strokeDashoffset: 0 }}
                    />
                  </svg>
                </span>
                {texts[1]}
              </h1>
            ) : (
              <h1 className="text-foreground text-4xl font-bold tracking-tight text-pretty sm:mt-12 sm:text-6xl lg:text-7xl">
                {section.title}
              </h1>
            )}
          </motion.div>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-muted-foreground mt-8 mb-8 text-lg text-balance leading-relaxed max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
          />

          {hotComics.length > 0 && (
            <motion.div
              id={hotComicsId}
              variants={scaleIn}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10 -mx-4 md:-mx-[calc((100vw-100%)/2)]"
            >
              <div className="w-screen relative left-1/2 -translate-x-1/2">
                <div className="group/carousel relative overflow-hidden border-y border-primary/10 bg-gradient-to-b from-background/80 to-muted/30 py-3 shadow-2xl shadow-primary/5 backdrop-blur-sm">
                  {/* Gradient overlays */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background via-background/80 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background via-background/80 to-transparent" />

                  <div className="flex w-max gap-3 [--duration:35s] [--gap:0.75rem] group-hover/carousel:[animation-play-state:paused]">
                    {[0, 1].map((repeatIdx) => (
                      <div
                        key={`hot-comics-row-${repeatIdx}`}
                        className="flex w-max shrink-0 gap-3 animate-marquee"
                      >
                        {hotComics.map((item: any, idx: number) => {
                          const src =
                            item?.image?.src ?? item?.src ?? item?.image ?? '';
                          const alt =
                            item?.image?.alt ??
                            item?.alt ??
                            item?.title ??
                            `Hot Comic ${idx + 1}`;
                          return (
                            <div
                              key={`${repeatIdx}-${idx}`}
                              className="group/card relative w-44 overflow-hidden rounded-xl border border-white/10 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:z-20 sm:w-52 md:w-60"
                            >
                              <div className="aspect-video w-full overflow-hidden">
                                {src ? (
                                  <Image
                                    src={src}
                                    alt={alt}
                                    fill
                                    sizes="(max-width: 640px) 176px, (max-width: 768px) 208px, 240px"
                                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                                  />
                                ) : null}
                              </div>
                              {/* Hover overlay with gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {section.buttons && (
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              {section.buttons.map((button, idx) => (
                <Button
                  asChild
                  size={button.size || 'lg'}
                  variant={button.variant || 'default'}
                  className={cn(
                    'px-6 text-sm font-medium transition-all duration-300 hover:scale-105',
                    button.variant === 'default' &&
                      'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                  )}
                  key={idx}
                >
                  <Link href={button.url ?? ''} target={button.target ?? '_self'}>
                    {button.icon && <SmartIcon name={button.icon as string} />}
                    <span>{button.title}</span>
                  </Link>
                </Button>
              ))}
            </motion.div>
          )}

          {section.tip && (
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-muted-foreground/80 mt-6 block text-center text-sm"
              dangerouslySetInnerHTML={{ __html: section.tip ?? '' }}
            />
          )}

          {section.show_avatars && (
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <SocialAvatars tip={section.avatars_tip || ''} />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Bottom gradient transition to next section */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-24 md:h-32 bg-gradient-to-b from-transparent via-background/70 to-background" />

      {section.background_image?.src && (
        <div className="absolute inset-0 -z-10 hidden h-full w-full overflow-hidden md:block">
          <div className="from-background/90 via-background/80 to-background/70 absolute inset-0 z-10 bg-gradient-to-b" />
          <Image
            src={section.background_image.src}
            alt={section.background_image.alt || ''}
            className="object-cover opacity-40 animate-ken-burns"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 0vw, 100vw"
            quality={70}
            unoptimized={section.background_image.src.startsWith('http')}
          />
        </div>
      )}
    </section>
  );
}
