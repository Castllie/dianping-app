import express from 'express'
import { supabase, supabaseAdmin } from '../config/supabase.js'
import { authenticateToken, requireMerchant } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

const businessImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只支持图片文件'))
    }
    cb(null, true)
  },
})

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

// 商家图片管理：添加图片（商家用户；若店铺未认领则自动认领）
router.post('/:id/images', authenticateToken, requireMerchant, async (req: any, res) => {
  try {
    const { id } = req.params
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: '图片地址不能为空' })
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, owner_id, images')
      .eq('id', id)
      .single()

    if (businessError || !business) {
      return res.status(404).json({ error: '商家不存在' })
    }

    if (business.owner_id && business.owner_id !== req.user.id) {
      return res.status(403).json({ error: '您只能管理自己店铺的图片' })
    }

    const currentImages = Array.isArray(business.images) ? business.images : []
    const trimmed = url.trim()
    const nextImages = currentImages.includes(trimmed) ? currentImages : [...currentImages, trimmed]

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('businesses')
      .update({ images: nextImages, owner_id: business.owner_id || req.user.id })
      .eq('id', id)
      .select('id, owner_id, images')
      .single()

    if (updateError) {
      throw updateError
    }

    res.json(updated)
  } catch (error) {
    console.error('添加商家图片错误:', error)
    res.status(500).json({ error: '添加图片失败' })
  }
})

// 商家图片管理：删除图片（商家用户；只能删除自己店铺的）
router.delete('/:id/images', authenticateToken, requireMerchant, async (req: any, res) => {
  try {
    const { id } = req.params
    const url = typeof req.query.url === 'string' ? req.query.url : ''

    if (!url) {
      return res.status(400).json({ error: '图片地址不能为空' })
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, owner_id, images')
      .eq('id', id)
      .single()

    if (businessError || !business) {
      return res.status(404).json({ error: '商家不存在' })
    }

    if (business.owner_id && business.owner_id !== req.user.id) {
      return res.status(403).json({ error: '您只能管理自己店铺的图片' })
    }

    const currentImages = Array.isArray(business.images) ? business.images : []
    const nextImages = currentImages.filter((img: string) => img !== url)

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('businesses')
      .update({ images: nextImages, owner_id: business.owner_id || req.user.id })
      .eq('id', id)
      .select('id, owner_id, images')
      .single()

    if (updateError) {
      throw updateError
    }

    res.json(updated)
  } catch (error) {
    console.error('删除商家图片错误:', error)
    res.status(500).json({ error: '删除图片失败' })
  }
})

// 商家图片管理：上传本地图片文件（商家用户；若店铺未认领则自动认领）
router.post(
  '/:id/images/upload',
  authenticateToken,
  requireMerchant,
  businessImageUpload.single('file'),
  async (req: any, res) => {
    try {
      const { id } = req.params
      const file = req.file as Express.Multer.File | undefined

      if (!file) {
        return res.status(400).json({ error: '请选择要上传的图片文件' })
      }

      const { data: business, error: businessError } = await supabaseAdmin
        .from('businesses')
        .select('id, owner_id, images')
        .eq('id', id)
        .single()

      if (businessError || !business) {
        return res.status(404).json({ error: '商家不存在' })
      }

      if (business.owner_id && business.owner_id !== req.user.id) {
        return res.status(403).json({ error: '您只能管理自己店铺的图片' })
      }

      const ext = path.extname(file.originalname || '').slice(0, 16) || '.jpg'
      const objectPath = `businesses/${id}/${Date.now()}-${uuidv4()}${ext}`
      const bucket = 'business-images'

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(objectPath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath)
      const publicUrl = publicUrlData.publicUrl

      const currentImages = Array.isArray(business.images) ? business.images : []
      const nextImages = currentImages.includes(publicUrl) ? currentImages : [...currentImages, publicUrl]

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('businesses')
        .update({ images: nextImages, owner_id: business.owner_id || req.user.id })
        .eq('id', id)
        .select('id, owner_id, images')
        .single()

      if (updateError) {
        throw updateError
      }

      res.json({ ...updated, url: publicUrl })
    } catch (error: any) {
      if (error?.message === '只支持图片文件') {
        return res.status(400).json({ error: error.message })
      }
      if (error?.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: '图片文件过大（最大5MB）' })
      }
      console.error('上传商家图片错误:', error)
      res.status(500).json({ error: '上传图片失败' })
    }
  }
)

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

    await supabaseAdmin
      .from('businesses')
      .update({ view_count: (business.view_count || 0) + 1 })
      .eq('id', id)

    res.json({
      id: business.id,
      owner_id: business.owner_id,
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

export default router
