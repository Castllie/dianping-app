import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../config/supabase.js'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    user_type: string
  }
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' })
  }

  try {
    // 验证 JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    
    // 从 Supabase 获取用户最新信息
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, user_type')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: '用户不存在' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: '无效的访问令牌' })
  }
}

export const requireMerchant = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.user_type !== 'merchant') {
    return res.status(403).json({ error: '需要商家权限' })
  }
  next()
}
