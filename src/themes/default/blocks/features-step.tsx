'use client';

import { motion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: {
      delay: i * 0.15 + 0.3,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function FeaturesStep({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('relative py-20 md:py-32 overflow-hidden', section.className, className)}
    >
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-primary/10 blur-[120px] opacity-60 animate-[drift_24s_ease-in-out_infinite]" />
        <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-accent/10 blur-[140px] opacity-50 animate-[drift_28s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container">
        <div className="@container relative">
          <ScrollAnimation>
            <div className="mx-auto max-w-2xl text-center">
              {section.label && (
                <span className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
                  {section.label}
                </span>
              )}
              <h2 className="text-foreground mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground mt-5 text-lg text-balance leading-relaxed">
                {section.description}
              </p>
            </div>
          </ScrollAnimation>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="mt-20 grid gap-8 @3xl:grid-cols-4 @3xl:gap-6"
          >
            {section.items?.map((item, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                variants={stepVariants}
                className="group relative"
              >
                <div className="relative text-center">
                  {/* Step number badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15, duration: 0.4, type: 'spring', stiffness: 200 }}
                    className="relative mx-auto mb-6"
                  >
                    <div className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:scale-110">
                      <span className="text-lg font-bold text-primary">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.div>

                  {/* Connector line for desktop */}
                  {idx < (section.items?.length ?? 0) - 1 && (
                    <motion.div
                      custom={idx}
                      variants={lineVariants}
                      className="absolute top-7 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] hidden h-px origin-left bg-gradient-to-r from-primary/40 via-primary/20 to-transparent @3xl:block"
                    />
                  )}

                  {/* Icon */}
                  {item.icon && (
                    <div className="mx-auto my-5 flex size-12 items-center justify-center rounded-xl bg-muted/50 text-foreground transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                      <SmartIcon name={item.icon as string} size={24} />
                    </div>
                  )}

                  {/* Content */}
                  <h3 className="text-foreground mb-3 text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-balance">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
