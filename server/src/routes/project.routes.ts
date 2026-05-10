import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware";
import { addMember, createProject, getProject, getProjects, removeProject } from "../controllers/project.controller";
import { addMemberSchema, createProjectschema } from "../schema/project.schema";
import { validate } from "../lib/validate";
import { requireAdmin } from "../middleware/rbac.middleware";
import { createTaskSchema } from "../schema/task.schema";
import { createTask, getTask } from "../controllers/task.controller";




const projectRoutes = Router();

projectRoutes.use(authMiddleware);

projectRoutes.post('/', validate(createProjectschema), createProject)
projectRoutes.get('/', getProjects)
projectRoutes.get('/:projectId', getProject)
projectRoutes.delete('/:projectId', requireAdmin, removeProject)

projectRoutes.post('/:projectId/members', requireAdmin, validate(addMemberSchema), addMember)
projectRoutes.post('/:projectId/tasks', requireAdmin, validate(createTaskSchema), createTask)
projectRoutes.get('/:projectId/tasks', getTask)

export default projectRoutes