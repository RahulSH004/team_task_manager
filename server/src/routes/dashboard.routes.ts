import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { getDashboard } from '../controllers/dashboard.controller'

const dashboardRoutes = Router()

dashboardRoutes.use(authMiddleware)
dashboardRoutes.get('/', getDashboard)

export default dashboardRoutes