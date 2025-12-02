"use client"

import { motion, AnimatePresence, type Variants } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import type { ReactNode } from "react"

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(10px)",
    transition: {
      duration: 0.3,
    },
  },
}

export const authPageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    filter: "blur(8px)",
    transition: {
      duration: 0.4,
    },
  },
}

export const formItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

export const buttonPulseVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: "0 0 30px rgba(79, 70, 229, 0.5)",
    transition: { duration: 0.3 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
}

export const magneticVariants: Variants = {
  initial: { x: 0, y: 0 },
  hover: {
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
}

export const glowBorderVariants: Variants = {
  initial: {
    background: "linear-gradient(90deg, transparent, transparent)",
  },
  animate: {
    background: [
      "linear-gradient(90deg, #4F46E5, #06B6D4, #4F46E5)",
      "linear-gradient(180deg, #4F46E5, #06B6D4, #4F46E5)",
      "linear-gradient(270deg, #4F46E5, #06B6D4, #4F46E5)",
      "linear-gradient(360deg, #4F46E5, #06B6D4, #4F46E5)",
    ],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
}

// Fade in from bottom
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// Fade in from left
export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// Fade in from right
export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// Scale in
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// Stagger container
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// Stagger children
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

// Glow pulse animation
export const glowPulse: Variants = {
  initial: {
    boxShadow: "0 0 0 rgba(79, 70, 229, 0)",
  },
  animate: {
    boxShadow: ["0 0 0 rgba(79, 70, 229, 0)", "0 0 30px rgba(79, 70, 229, 0.4)", "0 0 0 rgba(79, 70, 229, 0)"],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

// Modal variants
export const modalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
}

// Sidebar variants
export const sidebarVariants: Variants = {
  expanded: {
    width: 240,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  collapsed: {
    width: 64,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// Card hover variants
export const cardHover: Variants = {
  initial: { y: 0, boxShadow: "0 0 0 rgba(79, 70, 229, 0)" },
  hover: {
    y: -4,
    boxShadow: "0 10px 40px rgba(79, 70, 229, 0.2)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  tap: {
    y: 0,
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

// Button press variants
export const buttonPress: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

// Typing cursor animation
export const typingCursor: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 1, 0],
    transition: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
  },
}

// Float animation
export const floatAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
  },
}

// Shimmer animation for loading states
export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
  },
}

// Tab switch animation
export const tabContent: Variants = {
  initial: { opacity: 0, x: 10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.2 },
  },
}

// Notification slide in
export const notificationSlide: Variants = {
  initial: { opacity: 0, x: 100, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

// Component wrappers for easy use

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className={className}>
      {children}
    </motion.div>
  )
}

interface AuthPageTransitionProps {
  children: ReactNode
  className?: string
}

export function AuthPageTransition({ children, className }: AuthPageTransitionProps) {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={authPageVariants} className={className}>
      {children}
    </motion.div>
  )
}

interface FormItemProps {
  children: ReactNode
  className?: string
  index?: number
}

export function FormItem({ children, className, index = 0 }: FormItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { delay: index * 0.1, duration: 0.4 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedLinkProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

export function AnimatedLink({ children, className, onClick }: AnimatedLinkProps) {
  return (
    <motion.span
      className={className}
      whileHover={{
        scale: 1.05,
        textShadow: "0 0 8px rgba(6, 182, 212, 0.6)",
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ cursor: "pointer", display: "inline-block" }}
    >
      {children}
    </motion.span>
  )
}

export function SparkleButton({
  children,
  className,
  onClick,
}: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover="hover"
      whileTap="tap"
      initial="initial"
      onClick={onClick}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        variants={{
          initial: { opacity: 0 },
          hover: {
            opacity: 1,
            background: [
              "radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)",
            ],
            transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
          },
        }}
      />
      <motion.div
        variants={{
          initial: { scale: 1 },
          hover: { scale: 1.02 },
          tap: { scale: 0.95 },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  direction?: "up" | "down" | "left" | "right"
  delay?: number
}

export function FadeIn({ children, direction = "up", delay = 0, ...props }: FadeInProps) {
  const directions = {
    up: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } },
  }

  return (
    <motion.div
      initial={directions[direction].initial}
      whileInView={directions[direction].animate}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function StaggerContainer({ children, className, delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  )
}

interface HoverCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode
}

export function HoverCard({ children, className, ...props }: HoverCardProps) {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={cardHover}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={buttonPress}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Animated counter for statistics
interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 2, className }: AnimatedCounterProps) {
  return (
    <motion.span className={className} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  )
}

// Export motion and AnimatePresence for direct use
export { motion, AnimatePresence }
