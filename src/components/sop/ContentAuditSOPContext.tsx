'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useContentAuditSOP } from '@/hooks/useContentAuditSOP'

type ContentAuditSOPContextType = ReturnType<typeof useContentAuditSOP>

const ContentAuditSOPContext = createContext<ContentAuditSOPContextType | null>(null)

interface ContentAuditSOPProviderProps {
  children: ReactNode
}

export function ContentAuditSOPProvider({ children }: ContentAuditSOPProviderProps) {
  const sop = useContentAuditSOP()

  return (
    <ContentAuditSOPContext.Provider value={sop}>
      {children}
    </ContentAuditSOPContext.Provider>
  )
}

export function useContentAuditSOPContext() {
  const context = useContext(ContentAuditSOPContext)
  if (!context) {
    throw new Error('useContentAuditSOPContext must be used within a ContentAuditSOPProvider')
  }
  return context
}
