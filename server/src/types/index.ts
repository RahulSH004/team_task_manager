import { Request } from "express";

export interface AuthRequest extends Request {
    user?: { id: String, email: String };
}

export interface ApiError {
    error: {
        code: string
        message: string
    }
}