import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// 获取当前用户信息
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, nickname, avatar_url, user_type, created_at')
      .eq('id', req.user.id)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(user)
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

// 更新用户信息
router.put('/me', authenticateToken, async (req: any, res) => {
  try {
    const { nickname, avatar_url } = req.body

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ nickname, avatar_url })
      .eq('id', req.user.id)
      .select('id, email, nickname, avatar_url, user_type, created_at')
      .single()

    if (error) {
      throw error
    }

    res.json(user)
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({ error: '更新用户信息失败' })
  }
})

export default router
