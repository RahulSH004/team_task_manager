import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../lib/validate'
import { updateStatusSchema } from '../schema/task.schema'
import { updateTaskStatus, deleteTask } from '../controllers/task.controller'

const taskRoutes = Router()

taskRoutes.use(authMiddleware)

taskRoutes.patch('/:taskId/status', validate(updateStatusSchema), updateTaskStatus)
taskRoutes.delete('/:taskId', deleteTask)

export default taskRoutes