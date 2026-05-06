export interface Job {
  id: string
  userId: string | null
  toolSlug: string
  status: 'queued' | 'processing' | 'done' | 'error'
  progress: number
  resultUrl?: string
  error?: string
  createdAt: number
}

export interface ToolMeta {
  slug: string
  name: string
  description: string
  category: 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'ai' | 'dev' | 'security' | 'calc'
  processingLocation: 'client' | 'server' | 'ai'
  inputFormats: string[]
  outputFormats: string[]
  maxFileMB: number
  icon: string
  featured?: boolean
  isNew?: boolean
}
