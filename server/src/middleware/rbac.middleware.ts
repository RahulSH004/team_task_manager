import { Request, Response, NextFunction } from "express"
import { AuthRequest } from "../types"
import { errorResponse } from "../lib/response"
import { prisma } from '../lib/prisma'
import { Role } from '../generated/prisma/enums'

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId as string
        if (!projectId) {
            errorResponse(res, 400, 'Project ID is required')
            return
        }
        const member = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: req.user!.id,
                    projectId
                }
            }
        })
        if (!member) {
            errorResponse(res, 404, 'Project member not found')
            return
        }
        if (member.role !== Role.ADMIN) {
            errorResponse(res, 403, 'Forbidden')
            return
        }
        next()
    } catch (error) {
        errorResponse(res, 500, 'Internal server error')
    }
}


