import { Request } from "express";

export interface AuthRequest extends Request {
    user?: { id: string, email: string };
}

export interface ApiError {
    error: {
        code: string
        message: string
    }
}