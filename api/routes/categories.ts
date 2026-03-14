import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// 获取所有分类
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      throw error
    }

    res.json(data)
  } catch (error) {
    console.error('获取分类错误:', error)
    res.status(500).json({ error: '获取分类失败' })
  }
})

// 获取单个分类
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !category) {
      return res.status(404).json({ error: '分类不存在' })
    }

    res.json(category)
  } catch (error) {
    console.error('获取分类详情错误:', error)
    res.status(500).json({ error: '获取分类详情失败' })
  }
})

export default router
