import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { errorResponse } from './response'

export const validate = (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {

        const result = schema.safeParse(req.body)

        if (!result.success) {
            const message = result.error.issues[0].message
            errorResponse(res, 422, message)
            return
        }

        req.body = result.data
        next()
    }