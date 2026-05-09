import { z } from 'zod'

export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(20),
    email: z.string().email('Valid email required'),
    password: z.string().min(6, 'Minimum 6 characters')
})

export const loginSchema = z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(6, 'Minimum 6 characters')
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>