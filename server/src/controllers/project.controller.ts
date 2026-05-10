import { Response } from "express";
import { AuthRequest } from "../types";
import { AddMemberInput, CreateProjectInput } from "../schema/project.schema";
import { prisma } from "../lib/prisma";
import { errorResponse, successResponse } from "../lib/response";
import { Role } from "../generated/prisma/enums";


const safeUser = { id: true, name: true, email: true }

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body as CreateProjectInput
        const project = await prisma.project.create({
            data: {
                name,
                description,
                members: {
                    create: {
                        userId: req.user!.id,
                        role: Role.ADMIN
                    }
                }
            }
        })
        successResponse(res, 201, 'Project created successfully', project)
    }
    catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}

// get projects

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                members: { some: { userId: req.user!.id } }
            },
            include: {
                members: {
                    include: { user: { select: safeUser } }
                },
                tasks: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        successResponse(res, 200, 'Projects fetched successfully', projects)
    }
    catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}

// get project by id

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params as { projectId: string }
        const membership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: req.user!.id,
                    projectId
                }
            },
        })
        if (!membership) {
            errorResponse(res, 403, 'You are not a member of this project')
            return
        }

        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                members: {
                    include: { user: { select: safeUser } }
                },
                tasks: {
                    include: {
                        assignee: { select: safeUser },
                        createdBy: { select: safeUser }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            },
        })
        if (!project) {
            errorResponse(res, 404, 'Project not found')
            return
        }
        successResponse(res, 200, 'Project fetched successfully', project)
    }
    catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}

// add member

export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params as { projectId: string }
        const { email, role } = req.body as AddMemberInput

        const usertoAdd = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!usertoAdd) {
            errorResponse(res, 404, 'User not found')
            return
        }

        const existing = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: usertoAdd.id,
                    projectId
                }
            }
        })
        if (existing) {
            errorResponse(res, 400, 'User already added')
            return
        }
        const member = await prisma.projectMember.create({
            data: {
                userId: usertoAdd.id,
                projectId,
                role: role as Role
            },
            include: {
                user: { select: safeUser }
            }
        })
        successResponse(res, 200, 'Member added successfully', {
            user: member.user,
            role: member.role
        })
    } catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
}

//remove project

export const removeProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params as { projectId: string }
        await prisma.project.delete({
            where: {
                id: projectId
            }
        })
        res.status(204).send()
    } catch (error) {
        console.log(error)
        errorResponse(res, 500, 'Internal server error')
    }
} 