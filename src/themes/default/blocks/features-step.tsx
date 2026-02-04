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
      className={cn(
        'relative overflow-hidden py-20 md:py-32',
        section.className,
        className
      )}
    >
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/10 absolute top-8 -left-24 h-64 w-64 animate-[drift_24s_ease-in-out_infinite] rounded-full opacity-60 blur-[120px]" />
        <div className="bg-accent/10 absolute -right-24 bottom-8 h-72 w-72 animate-[drift_28s_ease-in-out_infinite_reverse] rounded-full opacity-50 blur-[140px]" />
        <div className="via-primary/20 absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
        <div className="via-primary/20 absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
      </div>

      <div className="container">
        <div className="@container relative">
          <ScrollAnimation>
            <div className="mx-auto max-w-2xl text-center">
              {section.label && (
                <span className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">
                  {section.label}
                </span>
              )}
              <h2 className="text-foreground mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground mt-5 text-lg leading-relaxed text-balance">
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
                    transition={{
                      delay: idx * 0.15,
                      duration: 0.4,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className="relative mx-auto mb-6"
                  >
                    <div className="from-primary/20 to-primary/5 border-primary/20 shadow-primary/10 group-hover:shadow-primary/20 relative z-10 mx-auto flex size-14 items-center justify-center rounded-2xl border bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                      <span className="text-primary text-lg font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.div>

                  {/* Connector line for desktop */}
                  {idx < (section.items?.length ?? 0) - 1 && (
                    <motion.div
                      custom={idx}
                      variants={lineVariants}
                      className="from-primary/40 via-primary/20 absolute top-7 right-[calc(-50%+2rem)] left-[calc(50%+2rem)] hidden h-px origin-left bg-gradient-to-r to-transparent @3xl:block"
                    />
                  )}

                  {/* Icon */}
                  {item.icon && (
                    <div className="bg-muted/50 text-foreground group-hover:bg-primary/10 group-hover:text-primary mx-auto my-5 flex size-12 items-center justify-center rounded-xl transition-all duration-300">
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
