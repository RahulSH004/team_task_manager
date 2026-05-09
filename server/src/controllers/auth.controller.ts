import { Request, Response } from "express";
import { successResponse, errorResponse } from "../lib/response";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { RegisterInput, LoginInput } from "../schema/auth.schema";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body as RegisterInput
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            errorResponse(res, 400, 'User already exists')
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        })
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        )
        successResponse(res, 201, 'User registered successfully', { user, token })
    } catch (error) {
        errorResponse(res, 500, 'Internal server error')
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body as LoginInput
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            errorResponse(res, 401, 'Invalid credentials')
            return
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            errorResponse(res, 401, 'Invalid credentials')
            return
        }
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        )
        successResponse(res, 200, 'User logged in successfully',
            {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            })
    } catch (error) {
        errorResponse(res, 500, 'Internal server error')
    }
}
