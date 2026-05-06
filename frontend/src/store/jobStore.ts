import { create } from 'zustand'

interface Job {
  id: string
  status: 'queued' | 'processing' | 'done' | 'error'
  progress: number
  resultUrl?: string
  error?: string
}

interface JobState {
  jobs: Record<string, Job>
  setJob: (id: string, job: Partial<Job>) => void
  removeJob: (id: string) => void
}

export const useJobStore = create<JobState>((set) => ({
  jobs: {},
  setJob: (id, job) =>
    set((state) => ({
      jobs: { ...state.jobs, [id]: { ...state.jobs[id], ...job } },
    })),
  removeJob: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.jobs
      return { jobs: rest }
    }),
}))
