import { v4 as uuidv4 } from 'uuid'
import type { Job } from '../types/index.js'

const jobs = new Map<string, Job>()

export function createJob(userId: string | null, toolSlug: string): Job {
  const job: Job = {
    id: uuidv4(),
    userId,
    toolSlug,
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
  }
  jobs.set(job.id, job)
  return job
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id)
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const job = jobs.get(id)
  if (!job) return undefined
  const updated = { ...job, ...updates }
  jobs.set(id, updated)
  return updated
}

export function deleteJob(id: string): boolean {
  return jobs.delete(id)
}

export function listJobs(): Job[] {
  return Array.from(jobs.values())
}
