import { LazyMotion, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'

export function FramerWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  )
}
