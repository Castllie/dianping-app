import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import businessRoutes from './routes/businesses.js'
import reviewRoutes from './routes/reviews.js'
import categoryRoutes from './routes/categories.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/businesses', businessRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/categories', categoryRoutes)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// 错误处理中间件
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  })
})

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
})
