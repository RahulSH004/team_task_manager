import { z } from 'zod'

export const createProjectschema = z.object({
    name: z.string().min(3, "Project name must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters").max(200),
})

export const addMemberSchema = z.object({
    email: z.string().email("Valid email required"),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
})

export type CreateProjectInput = z.infer<typeof createProjectschema>
export type AddMemberInput = z.infer<typeof addMemberSchema>