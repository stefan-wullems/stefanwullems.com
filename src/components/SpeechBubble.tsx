'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

const greetings = [
  'Hey there! Welcome to my corner of the internet! 👋',
  'Thanks for stopping by! I hope you find something interesting here.',
  'Welcome! Make yourself at home and browse around.',
  "Hope you're having a fantastic day!",
  'To browse like I do, try out dark mode! 🌙',
]

interface SpeechBubbleProps {
  className?: string
  style?: React.CSSProperties
}

export function SpeechBubble({ className, style }: SpeechBubbleProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Always start with a random greeting
    const randomGreeting =
      greetings[Math.floor(Math.random() * greetings.length)]
    setCurrentMessage(randomGreeting)

    // Show the bubble after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!currentMessage) return null

  return (
    <div className="flex items-center gap-3">
      <div
        className={clsx(
          'relative rounded-2xl bg-white/95 px-4 py-3 shadow-lg ring-1 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/95 dark:ring-white/10',
          'transition-all duration-500 ease-out',
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
          className,
        )}
        style={style}
      >
        {/* Speech bubble tail */}
        <div className="absolute top-1/2 left-0 -translate-x-2 -translate-y-1/2">
          <div className="h-0 w-0 border-t-8 border-r-8 border-b-8 border-transparent border-r-white/95 dark:border-r-zinc-800/95" />
          <div className="absolute top-1/2 -left-px h-0 w-0 -translate-y-1/2 border-t-[7px] border-r-[7px] border-b-[7px] border-transparent border-r-zinc-100/50 dark:border-r-zinc-700/50" />
        </div>

        <p className="text-sm leading-relaxed font-medium text-zinc-700 dark:text-zinc-200">
          {currentMessage}
        </p>
      </div>
    </div>
  )
}
