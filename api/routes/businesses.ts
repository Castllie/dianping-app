import express from 'express'
import { supabase, supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

// 获取商家列表
router.get('/', async (req, res) => {
  try {
    const { category, search, lat, lng } = req.query
    
    let query = supabase
      .from('businesses')
      .select(`
        *,
        categories!inner(id, name, icon)
      `)

    // 分类筛选
    if (category) {
      query = query.eq('category_id', category)
    }

    // 搜索功能
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 地理位置筛选（简化版）
    if (lat && lng) {
      // 这里应该使用 PostGIS 进行更精确的地理查询
      // 暂时使用简单的范围查询
      const latRange = 0.05 // 大约 5km
      const lngRange = 0.05
      query = query
        .gte('latitude', parseFloat(lat as string) - latRange)
        .lte('latitude', parseFloat(lat as string) + latRange)
        .gte('longitude', parseFloat(lng as string) - lngRange)
        .lte('longitude', parseFloat(lng as string) + lngRange)
    }

    const { data, error } = await query
      .order('rating', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    // 格式化数据
    const businesses = data.map(business => ({
      id: business.id,
      name: business.name,
      category: {
        id: business.categories.id,
        name: business.categories.name,
        icon: business.categories.icon
      },
      description: business.description,
      address: business.address,
      phone: business.phone,
      opening_hours: business.opening_hours,
      latitude: business.latitude,
      longitude: business.longitude,
      images: business.images || [],
      rating: business.rating || 0,
      review_count: business.review_count || 0
    }))

    res.json(businesses)
  } catch (error) {
    console.error('获取商家列表错误:', error)
    res.status(500).json({ error: '获取商家列表失败' })
  }
})

// 获取单个商家详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: business, error } = await supabase
      .from('businesses')
      .select(`
        *,
        categories!inner(id, name, icon)
      `)
      .eq('id', id)
      .single()

    if (error || !business) {
      return res.status(404).json({ error: '商家不存在' })
    }

    // 更新浏览次数（可选）
    await supabaseAdmin
      .from('businesses')
      .update({ view_count: (business.view_count || 0) + 1 })
      .eq('id', id)

    res.json({
      id: business.id,
      name: business.name,
      category: {
        id: business.categories.id,
        name: business.categories.name,
        icon: business.categories.icon
      },
      description: business.description,
      address: business.address,
      phone: business.phone,
      opening_hours: business.opening_hours,
      latitude: business.latitude,
      longitude: business.longitude,
      images: business.images || [],
      rating: business.rating || 0,
      review_count: business.review_count || 0
    })
  } catch (error) {
    console.error('获取商家详情错误:', error)
    res.status(500).json({ error: '获取商家详情失败' })
  }
})

// 搜索商家
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({ error: '搜索关键词不能为空' })
    }

    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        categories!inner(id, name, icon)
      `)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`)
      .limit(20)

    if (error) {
      throw error
    }

    const businesses = data.map(business => ({
      id: business.id,
      name: business.name,
      category: {
        id: business.categories.id,
        name: business.categories.name,
        icon: business.categories.icon
      },
      description: business.description,
      address: business.address,
      phone: business.phone,
      opening_hours: business.opening_hours,
      latitude: business.latitude,
      longitude: business.longitude,
      images: business.images || [],
      rating: business.rating || 0,
      review_count: business.review_count || 0
    }))

    res.json(businesses)
  } catch (error) {
    console.error('搜索商家错误:', error)
    res.status(500).json({ error: '搜索失败' })
  }
})

export default router
