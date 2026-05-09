import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { validate } from "../lib/validate";
import { registerSchema, loginSchema } from "../schema/auth.schema";
import rateLimit from "express-rate-limit";
import { error } from "node:console";

const authrouter = Router()

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests'
        }
    },
    skipSuccessfulRequests: true,
})

authrouter.post('/register', authLimiter, validate(registerSchema), register)
authrouter.post('/login', authLimiter, validate(loginSchema), login)

export default authrouter