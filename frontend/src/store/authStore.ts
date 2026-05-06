import { create } from 'zustand'

interface AuthState {
  userId: string | null
  token: string | null
  isLoggedIn: boolean
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: localStorage.getItem('token'),
  isLoggedIn: !!localStorage.getItem('token'),
  login: (token) => {
    localStorage.setItem('token', token)
    set({ token, isLoggedIn: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, userId: null, isLoggedIn: false })
  },
}))
