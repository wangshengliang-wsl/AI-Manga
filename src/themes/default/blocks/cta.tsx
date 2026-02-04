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
      className={cn(
        'relative overflow-hidden py-24 md:py-36',
        section.className,
        className
      )}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Aurora sweep */}
        <div className="from-primary/20 via-accent/10 to-primary/20 absolute -inset-[25%] animate-[drift_18s_ease-in-out_infinite] bg-gradient-to-r opacity-40 blur-[180px]" />
        {/* Gradient orbs */}
        <div className="bg-primary/15 animate-pulse-glow absolute top-1/2 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]" />
        <div className="bg-accent/10 absolute top-0 right-0 h-[400px] w-[400px] animate-[float_12s_ease-in-out_infinite] rounded-full blur-[120px]" />
        <div className="bg-primary/10 absolute bottom-0 left-0 h-[300px] w-[300px] animate-[float_14s_ease-in-out_infinite] rounded-full blur-[100px]" />

        {/* Grid pattern */}
        <div className="animate-grid absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]" />
      </div>

      <div className="relative container">
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
              transition={{
                duration: 0.6,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />
          </ScrollAnimation>

          <ScrollAnimation delay={0.3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
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
                      ? 'shadow-primary/25 hover:shadow-primary/30 shadow-xl hover:shadow-2xl'
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
          <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="via-primary/30 h-[1px] w-[500px] max-w-[90vw] bg-gradient-to-r from-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
