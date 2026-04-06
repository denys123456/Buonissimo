"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06
    }
  }
};

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function Reveal({ className, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
      className={className}
      {...props}
    />
  );
}

type StaggerProps = HTMLMotionProps<"div">;

export function Stagger({ className, ...props }: StaggerProps) {
  return (
    <motion.div
      variants={staggerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      className={cn(className)}
      {...props}
    />
  );
}

export function MotionSection({
  className,
  ...props
}: HTMLMotionProps<"section">) {
  return (
    <motion.section
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      className={className}
      {...props}
    />
  );
}
