import { z } from 'zod'
import { Priority, TaskStatus } from '../generated/prisma/enums'

export const createTaskSchema = z.object({
    title: z.string().min(3, "Task title must be at least 3 characters"),
    description: z.string().min(3, "Task description must be at least 3 characters"),
    priority: z.nativeEnum(Priority),
    dueDate: z.string().optional(),
    assigneeId: z.string('Invalid assignee ID').optional(),
})

export const updateStatusSchema = z.object({
    status: z.nativeEnum(TaskStatus, {
        message: 'Invalid status'
    }),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>