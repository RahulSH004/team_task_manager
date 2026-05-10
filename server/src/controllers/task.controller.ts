import { Response } from "express"
import { AuthRequest } from "../types"
import { CreateTaskInput, UpdateStatusInput } from "../schema/task.schema"
import { prisma } from "../lib/prisma"
import { errorResponse, successResponse } from "../lib/response"
import { Role } from "../generated/prisma/enums"



const safeUser = {
    id: true,
    name: true,
    email: true
}

//create task

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params as { projectId: string }
        const { title, description, priority, dueDate, assigneeId } = req.body as CreateTaskInput

        if (assigneeId) {
            const isMember = await prisma.projectMember.findUnique({
                where: { userId_projectId: { userId: assigneeId, projectId } }
            })
            if (!isMember) {
                errorResponse(res, 400, 'Assignee is not a member of this project')
                return
            }
        }
        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority,
                dueDate,
                assigneeId,
                projectId,
                createdById: req.user!.id
            },
            include: {
                assignee: { select: safeUser },
                createdBy: { select: safeUser },
            }
        })
        successResponse(res, 201, 'Task created successfully', task)
    } catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}

// get task 

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params as { projectId: string }

        const membership = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: req.user!.id, projectId } }
        })
        if (!membership) {
            errorResponse(res, 403, 'You are not a member of this project')
            return
        }
        const tasks = await prisma.task.findMany({
            where: {
                projectId
            },
            include: {
                assignee: { select: safeUser },
                createdBy: { select: safeUser },
            },
            orderBy: { createdAt: 'desc' }
        })
        successResponse(res, 200, 'Tasks fetched successfully', tasks)
    } catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}

//update task status

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params as { taskId: string }
        const { status } = req.body as UpdateStatusInput

        const task = await prisma.task.findUnique({ where: { id: taskId } })
        if (!task) {
            errorResponse(res, 404, 'Task not found')
            return
        }
        const membership = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: req.user!.id, projectId: task.projectId } }
        })

        if (!membership) {
            errorResponse(res, 403, 'You are not a member of this project')
            return
        }
        const isAdmin = membership.role === Role.ADMIN
        const isAssignee = task.assigneeId === req.user!.id

        if (!isAdmin && !isAssignee) {
            errorResponse(res, 403, 'Only the assignee or an admin can update this task')
            return
        }
        const update = await prisma.task.update({
            where: { id: taskId },
            data: { status },
            include: {
                assignee: { select: safeUser },
                createdBy: { select: safeUser },
            }
        })
        successResponse(res, 200, 'Task updated successfully', update)
    } catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}

// delete task

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params as { taskId: string }

        const task = await prisma.task.findUnique({ where: { id: taskId } })
        if (!task) {
            errorResponse(res, 404, 'Task not found')
            return
        }
        const membership = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: req.user!.id, projectId: task.projectId } }
        })

        if (!membership) {
            errorResponse(res, 403, 'You are not a member of this project')
            return
        }
        const isAdmin = membership.role === Role.ADMIN

        if (!isAdmin) {
            errorResponse(res, 403, 'Admin access required')
            return
        }
        const deleted = await prisma.task.delete({
            where: { id: taskId },
        })
        res.status(204).send()
    } catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}
