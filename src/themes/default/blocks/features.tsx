'use client';

import { motion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function Features({
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
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/10 absolute top-10 -left-24 h-72 w-72 animate-[drift_22s_ease-in-out_infinite] rounded-full opacity-60 blur-[120px]" />
        <div className="bg-accent/10 absolute -right-24 bottom-10 h-80 w-80 animate-[drift_26s_ease-in-out_infinite_reverse] rounded-full opacity-50 blur-[140px]" />
      </div>

      <div className={`container space-y-12 md:space-y-16`}>
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="text-foreground mb-5 text-4xl font-bold tracking-tight md:text-5xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed md:mb-12 lg:mb-16">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="border-primary/10 bg-primary/5 relative mx-auto grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3"
        >
          {section.items?.map((item, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={itemVariants}
              className="group bg-background hover:bg-muted/50 relative p-8 transition-all duration-300"
            >
              {/* Hover glow effect */}
              <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:shadow-primary/10 flex size-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <SmartIcon name={item.icon as string} size={20} />
                  </div>
                  <h3 className="text-foreground text-base font-semibold tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Border highlight on hover */}
              <div className="group-hover:border-primary/20 absolute inset-0 rounded-none border border-transparent transition-all duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
