import { useEffect } from 'react'
import { useBusinessStore } from '../stores/businessStore'
import { Link } from 'react-router-dom'
import { Star, MapPin, Phone } from 'lucide-react'

export default function Home() {
  const { 
    businesses, 
    categories, 
    loading, 
    fetchBusinesses, 
    fetchCategories,
    filterByCategory 
  } = useBusinessStore()

  useEffect(() => {
    fetchBusinesses()
    fetchCategories()
  }, [])

  const handleCategoryFilter = (categoryId: string) => {
    filterByCategory(categoryId)
  }

  return (
    <div className="space-y-8">
      {/* 分类筛选 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">商家分类</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fetchBusinesses()}
            className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryFilter(category.id)}
              className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 商家列表 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">热门商家</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link
                key={business.id}
                to={`/business/${business.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {business.category.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(business.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {business.rating.toFixed(1)} ({business.review_count}条评价)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {business.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-1" />
                      {business.phone}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    营业时间: {business.opening_hours}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {businesses.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无商家信息</p>
          </div>
        )}
      </div>
    </div>
  )
}