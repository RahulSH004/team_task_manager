import { Response } from "express";

export const successResponse = (res: Response, status: number, message: string, data?: unknown) => {
    res.status(status).json({
        status: 'success',
        message,
        data
    })
}

export const errorResponse = (res: Response, status: number, message: string) => {
    res.status(status).json({
        status: 'error',
        message
    })
}