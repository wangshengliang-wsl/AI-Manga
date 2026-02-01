'use client';

import { motion } from 'framer-motion';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Cta({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('relative py-24 md:py-36 overflow-hidden', section.className, className)}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Aurora sweep */}
        <div className="absolute -inset-[25%] bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-40 blur-[180px] animate-[drift_18s_ease-in-out_infinite]" />
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-primary/15 blur-[150px] animate-pulse-glow" />
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px] animate-[float_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px] animate-[float_14s_ease-in-out_infinite]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02] animate-grid" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollAnimation>
            <motion.h2
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-foreground text-4xl font-bold tracking-tight text-balance lg:text-6xl"
            >
              {section.title}
            </motion.h2>
          </ScrollAnimation>

          <ScrollAnimation delay={0.15}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-muted-foreground mt-6 text-lg leading-relaxed max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />
          </ScrollAnimation>

          <ScrollAnimation delay={0.3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              {section.buttons?.map((button, idx) => (
                <Button
                  asChild
                  size="lg"
                  variant={button.variant || 'default'}
                  key={idx}
                  className={cn(
                    'px-8 text-base font-medium transition-all duration-300 hover:scale-105',
                    button.variant === 'default' || !button.variant
                      ? 'shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30'
                      : 'hover:bg-muted'
                  )}
                >
                  <Link
                    href={button.url || ''}
                    target={button.target || '_self'}
                  >
                    {button.icon && <SmartIcon name={button.icon as string} />}
                    <span>{button.title}</span>
                  </Link>
                </Button>
              ))}
            </motion.div>
          </ScrollAnimation>

          {/* Decorative elements */}
          <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[1px] w-[500px] max-w-[90vw] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
