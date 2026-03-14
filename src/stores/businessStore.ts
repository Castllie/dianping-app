import { create } from 'zustand'

interface Business {
  id: string
  name: string
  category: {
    id: string
    name: string
    icon: string
  }
  description: string
  address: string
  phone: string
  opening_hours: string
  latitude: number
  longitude: number
  images: string[]
  rating: number
  review_count: number
  distance?: number
}

interface BusinessState {
  businesses: Business[]
  categories: Array<{ id: string; name: string; icon: string }>
  loading: boolean
  searchQuery: string
  selectedCategory: string
  sortBy: 'rating' | 'distance' | 'review_count'
  fetchBusinesses: () => Promise<void>
  fetchCategories: () => Promise<void>
  searchBusinesses: (query: string) => Promise<void>
  filterByCategory: (categoryId: string) => Promise<void>
  sortBusinesses: (sortBy: 'rating' | 'distance' | 'review_count') => Promise<void>
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  categories: [],
  loading: false,
  searchQuery: '',
  selectedCategory: '',
  sortBy: 'rating',

  fetchBusinesses: async () => {
    set({ loading: true })
    try {
      const response = await fetch('/api/businesses')
      if (!response.ok) throw new Error('获取商家列表失败')
      const data = await response.json()
      set({ businesses: data, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('获取商家列表失败:', error)
    }
  },

  fetchCategories: async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('获取分类失败')
      const data = await response.json()
      set({ categories: data })
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  },

  searchBusinesses: async (query: string) => {
    set({ loading: true, searchQuery: query })
    try {
      const response = await fetch(`/api/businesses/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('搜索失败')
      const data = await response.json()
      set({ businesses: data, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('搜索失败:', error)
    }
  },

  filterByCategory: async (categoryId: string) => {
    set({ loading: true, selectedCategory: categoryId })
    try {
      const response = await fetch(`/api/businesses?category=${categoryId}`)
      if (!response.ok) throw new Error('筛选失败')
      const data = await response.json()
      set({ businesses: data, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('筛选失败:', error)
    }
  },

  sortBusinesses: async (sortBy: 'rating' | 'distance' | 'review_count') => {
    set({ loading: true, sortBy })
    const { businesses } = get()
    const sorted = [...businesses].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'distance':
          return (a.distance || 0) - (b.distance || 0)
        case 'review_count':
          return b.review_count - a.review_count
        default:
          return 0
      }
    })
    set({ businesses: sorted, loading: false })
  },
}))
