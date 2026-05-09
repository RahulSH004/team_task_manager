import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../types'
import { errorResponse } from '../lib/response'

interface JwtPayload {
    id: string
    email: string
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        errorResponse(res, 401, 'Unauthorized')
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
        req.user = decoded
        next()
    } catch {
        errorResponse(res, 403, 'Forbidden')
    }
}