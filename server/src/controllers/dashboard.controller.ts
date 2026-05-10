import { Response } from "express"
import { AuthRequest } from "../types"
import { errorResponse, successResponse } from "../lib/response"
import { prisma } from "../lib/prisma"

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const now = new Date()

        const [total, completed, inProgress, overdue, myTasks, projects] = await Promise.all([
            prisma.task.count({
                where: {
                    project: { members: { some: { userId } } }
                }
            }),
            prisma.task.count({
                where: { status: 'DONE', project: { members: { some: { userId } } } }
            }),
            prisma.task.count({
                where: { status: 'IN_PROGRESS', project: { members: { some: { userId } } } }
            }),
            prisma.task.count({
                where: {
                    status: { not: 'DONE' },
                    dueDate: { lt: now },              // past due date, not done = overdue
                    project: { members: { some: { userId } } }
                }
            }),
            prisma.task.findMany({
                where: { assigneeId: userId, status: { not: 'DONE' } },
                include: { project: { select: { id: true, name: true } } },
                orderBy: { dueDate: 'asc' },
                take: 5                             // only top 5 upcoming tasks
            }),
            prisma.project.count({
                where: { members: { some: { userId } } }
            })
        ])
        successResponse(res, 200, "Success",
            {
                stats: { total, completed, inProgress, overdue, projects },
                myTasks
            })
    } catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}