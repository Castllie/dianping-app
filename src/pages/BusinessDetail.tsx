import { useState, useEffect, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Star, MapPin, Phone, Clock, MessageCircle } from 'lucide-react'

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
}

interface Review {
  id: string
  user: {
    id: string
    nickname: string
    avatar_url?: string
  }
  rating: number
  content: string
  images?: string[]
  created_at: string
  is_merchant_reply: boolean
  parent_id?: string
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBusinessDetail()
    fetchReviews()
  }, [id])

  const fetchBusinessDetail = async () => {
    try {
      const response = await fetch(`/api/businesses/${id}`)
      if (!response.ok) throw new Error('获取商家信息失败')
      const data = await response.json()
      setBusiness(data)
    } catch (error) {
      console.error('获取商家信息失败:', error)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?business_id=${id}`)
      if (!response.ok) throw new Error('获取评价失败')
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error('获取评价失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault()
    if (!newReview.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          business_id: id,
          rating: newRating,
          content: newReview
        })
      })

      if (!response.ok) throw new Error('提交评价失败')
      
      setNewReview('')
      setNewRating(5)
      fetchReviews() // 重新获取评价列表
    } catch (error) {
      console.error('提交评价失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">商家信息不存在</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 商家基本信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
            <p className="text-gray-600 mt-1">{business.category.name}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(business.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{business.rating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{business.review_count}条评价</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              {business.address}
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-2" />
              {business.phone}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              {business.opening_hours}
            </div>
          </div>
          <div>
            <p className="text-gray-700 leading-relaxed">{business.description}</p>
          </div>
        </div>
      </div>

      {/* 评价区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">用户评价</h2>
        
        {/* 添加评价表单 */}
        <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewRating(rating)}
                  className={`p-1 ${
                    rating <= newRating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
              评价内容
            </label>
            <textarea
              id="review"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="分享您的体验..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {submitting ? '提交中...' : '提交评价'}
          </button>
        </form>

        {/* 评价列表 */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-3">
                <img
                  className="h-10 w-10 rounded-full"
                  src={review.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.nickname)}&background=random`}
                  alt={review.user.nickname}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{review.user.nickname}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700">{review.content}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3 flex space-x-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`评价图片 ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无评价，快来写第一条评价吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
