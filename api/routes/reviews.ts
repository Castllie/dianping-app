import express from 'express'
import { supabase, supabaseAdmin } from '../config/supabase.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// 获取评价列表
router.get('/', async (req, res) => {
  try {
    const { business_id, user_id } = req.query

    let query = supabase
      .from('reviews')
      .select(`
        *,
        users!inner(id, nickname, avatar_url)
      `)
      .eq('is_merchant_reply', false)
      .order('created_at', { ascending: false })

    if (business_id) {
      query = query.eq('business_id', business_id)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      throw error
    }

    const reviews = data.map(review => ({
      id: review.id,
      user: {
        id: review.users.id,
        nickname: review.users.nickname,
        avatar_url: review.users.avatar_url
      },
      rating: review.rating,
      content: review.content,
      images: review.images || [],
      created_at: review.created_at,
      is_merchant_reply: review.is_merchant_reply,
      parent_id: review.parent_id
    }))

    res.json(reviews)
  } catch (error) {
    console.error('获取评价列表错误:', error)
    res.status(500).json({ error: '获取评价列表失败' })
  }
})

// 创建评价
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { business_id, rating, content, images } = req.body

    // 验证输入
    if (!business_id || !rating || !content) {
      return res.status(400).json({ error: '缺少必要信息' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: '评分必须在1-5之间' })
    }

    // 检查商家是否存在
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .single()

    if (!business) {
      return res.status(404).json({ error: '商家不存在' })
    }

    // 创建评价
    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert([{
        user_id: req.user.id,
        business_id,
        rating,
        content,
        images: images || [],
        is_merchant_reply: false
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    // 更新商家评分和评论数
    await updateBusinessRating(business_id)

    res.json(review)
  } catch (error) {
    console.error('创建评价错误:', error)
    res.status(500).json({ error: '创建评价失败' })
  }
})

// 商家回复评价
router.post('/:id/reply', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    // 验证用户是否为商家
    if (req.user.user_type !== 'merchant') {
      return res.status(403).json({ error: '只有商家才能回复评价' })
    }

    // 检查原评价是否存在
    const { data: originalReview } = await supabase
      .from('reviews')
      .select('business_id')
      .eq('id', id)
      .single()

    if (!originalReview) {
      return res.status(404).json({ error: '评价不存在' })
    }

    // 检查商家是否拥有该店铺
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', originalReview.business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (!business) {
      return res.status(403).json({ error: '您只能回复自己店铺的评价' })
    }

    // 创建商家回复
    const { data: reply, error } = await supabaseAdmin
      .from('reviews')
      .insert([{
        user_id: req.user.id,
        business_id: originalReview.business_id,
        rating: null,
        content,
        is_merchant_reply: true,
        parent_id: id
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json(reply)
  } catch (error) {
    console.error('商家回复评价错误:', error)
    res.status(500).json({ error: '回复评价失败' })
  }
})

// 更新商家评分
async function updateBusinessRating(businessId: string) {
  try {
    // 获取所有非商家回复的评价
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId)
      .eq('is_merchant_reply', false)

    if (!reviews || reviews.length === 0) {
      // 如果没有评价，重置评分
      await supabaseAdmin
        .from('businesses')
        .update({
          rating: 0,
          review_count: 0
        })
        .eq('id', businessId)
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await supabaseAdmin
      .from('businesses')
      .update({
        rating: Math.round(averageRating * 10) / 10, // 保留一位小数
        review_count: reviews.length
      })
      .eq('id', businessId)
  } catch (error) {
    console.error('更新商家评分错误:', error)
  }
}

export default router
