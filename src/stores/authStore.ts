import { create } from 'zustand'

interface User {
  id: string
  email: string
  nickname: string
  avatar_url?: string
  user_type: 'user' | 'merchant'
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nickname: string, userType?: User['user_type']) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (email: string, password: string, nickname: string, userType: User['user_type'] = 'user') => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nickname, user_type: userType }),
      })

      if (!response.ok) {
        throw new Error('注册失败')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  setUser: (user: User | null) => {
    set({ user })
  },
}))
