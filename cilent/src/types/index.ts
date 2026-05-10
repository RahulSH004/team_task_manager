export interface User {
    id: string
    name: string
    email: string
}

export interface ProjectMember {
    id: string
    role: 'ADMIN' | 'MEMBER'
    user: User
}

export interface Task {
    id: string
    title: string
    description?: string
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    dueDate?: string
    assignee?: User
    createdBy: User
    projectId: string
    createdAt: string
}

export interface Project {
    id: string
    name: string
    description?: string
    createdAt: string
    members: ProjectMember[]
    tasks?: Task[]
    _count?: { tasks: number }
}

export interface DashboardStats {
    total: number
    completed: number
    inProgress: number
    overdue: number
    projects: number
}

export interface DashboardData {
    stats: DashboardStats
    myTasks: Task[]
}