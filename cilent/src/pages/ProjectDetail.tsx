import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import { Project, Task } from '../types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// ── Schemas ───────────────────────────────────────────────
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM').optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional()
})

const addMemberSchema = z.object({
  email: z.string().email('Valid email required'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER').optional()
})

// ── Types ───────────────────────────────────────────────
type CreateTaskInput = z.infer<typeof createTaskSchema>
type AddMemberInput = z.infer<typeof addMemberSchema>

// ── Config ────────────────────────────────────────────────
const statusConfig = {
  TODO: { label: 'To Do', dot: 'bg-slate-300', badge: 'bg-slate-100 text-slate-600 hover:bg-slate-100' },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 hover:bg-amber-50' },
  DONE: { label: 'Done', dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' }
}

const priorityConfig = {
  LOW: { label: 'Low', badge: 'bg-slate-50 text-slate-500 hover:bg-slate-50' },
  MEDIUM: { label: 'Medium', badge: 'bg-blue-50 text-blue-600 hover:bg-blue-50' },
  HIGH: { label: 'High', badge: 'bg-red-50 text-red-600 hover:bg-red-50' }
}

// ── Task Card ─────────────────────────────────────────────
const TaskCard = ({
  task,
  isAdmin,
  isAssignee,
  onStatusChange
}: {
  task: Task
  isAdmin: boolean
  isAssignee: boolean
  onStatusChange: (taskId: string, status: string) => void
}) => {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  const canUpdate = isAdmin || isAssignee

  return (
    <div className="flex items-start justify-between py-4 border-b border-slate-50 last:border-0 group">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${status.dot}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-800 font-light mb-1">{task.title}</p>
          {task.description && (
            <p className="text-xs text-slate-400 font-light mb-2 line-clamp-1">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-xs font-light border-0 ${priority.badge}`}>
              {priority.label}
            </Badge>
            {task.assignee && (
              <span className="text-xs text-slate-400 font-light">
                → {task.assignee.name}
              </span>
            )}
            {task.dueDate && (
              <span className={`text-xs font-light ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                {isOverdue ? 'Overdue · ' : ''}
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* status selector */}
      <div className="ml-4 flex-shrink-0">
        {canUpdate ? (
          <Select
            value={task.status}
            onValueChange={(val) => onStatusChange(task.id, val)}
          >
            <SelectTrigger className={`h-7 text-xs border-0 font-light px-2.5 rounded-md w-32 ${status.badge}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO" className="text-xs">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS" className="text-xs">In Progress</SelectItem>
              <SelectItem value="DONE" className="text-xs">Done</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={`text-xs font-light border-0 ${status.badge}`}>
            {status.label}
          </Badge>
        )}
      </div>
    </div>
  )
}

// ── Create Task Modal ─────────────────────────────────────
const CreateTaskModal = ({
  projectId,
  members,
  onCreated
}: {
  projectId: string
  members: Project['members']
  onCreated: (task: Task) => void
}) => {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateTaskInput>({ resolver: zodResolver(createTaskSchema) })

  const onSubmit = async (data: CreateTaskInput) => {
    try {
      setServerError('')
      const payload = {
        ...data,
        assigneeId: data.assigneeId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined
      }
      const res = await api.post(`/projects/${projectId}/tasks`, payload)
      onCreated(res.data.data)
      reset()
      setOpen(false)
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-950 hover:bg-slate-800 text-white text-xs h-9 px-4 rounded-lg font-medium">
          Add task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Create task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Title</label>
            <Input
              placeholder="What needs to be done?"
              className="h-10 border-slate-200 text-slate-900 placeholder:text-slate-300 font-light rounded-lg"
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Description <span className="normal-case text-slate-400">(optional)</span>
            </label>
            <textarea
              placeholder="Add more context..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 font-light resize-none focus:outline-none focus:border-slate-400 transition-colors"
              {...register('description')}
            />
          </div>

          {/* priority + assignee row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Priority</label>
              <Select defaultValue="MEDIUM" onValueChange={(v) => setValue('priority', v as any)}>
                <SelectTrigger className="h-10 border-slate-200 text-slate-700 font-light rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW" className="text-xs">Low</SelectItem>
                  <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
                  <SelectItem value="HIGH" className="text-xs">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Assign to</label>
              <Select onValueChange={(v) => setValue('assigneeId', v)}>
                <SelectTrigger className="h-10 border-slate-200 text-slate-700 font-light rounded-lg text-sm">
                  <SelectValue placeholder="Nobody" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.user.id} value={m.user.id} className="text-xs">
                      {m.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* due date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Due date <span className="normal-case text-slate-400">(optional)</span>
            </label>
            <Input
              type="date"
              className="h-10 border-slate-200 text-slate-700 font-light rounded-lg"
              {...register('dueDate')}
            />
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <p className="text-xs text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-10 text-slate-500 text-sm font-light"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-slate-950 hover:bg-slate-800 text-white text-sm rounded-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating...
                </span>
              ) : 'Create task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Add Member Modal ──────────────────────────────────────
const AddMemberModal = ({
  projectId,
  onAdded
}: {
  projectId: string
  onAdded: (member: any) => void
}) => {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AddMemberInput>({ resolver: zodResolver(addMemberSchema) })

  const onSubmit = async (data: AddMemberInput) => {
    try {
      setServerError('')
      const res = await api.post(`/projects/${projectId}/members`, data)
      onAdded(res.data.data)
      reset()
      setOpen(false)
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-xs h-9 px-4 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
        >
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-white border-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Add member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
            <Input
              type="email"
              placeholder="teammate@company.com"
              className="h-10 border-slate-200 text-slate-900 placeholder:text-slate-300 font-light rounded-lg"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Role</label>
            <Select defaultValue="MEMBER" onValueChange={(v) => setValue('role', v as any)}>
              <SelectTrigger className="h-10 border-slate-200 text-slate-700 font-light rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER" className="text-xs">Member</SelectItem>
                <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <p className="text-xs text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-10 text-slate-500 text-sm font-light"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-slate-950 hover:bg-slate-800 text-white text-sm rounded-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Adding...
                </span>
              ) : 'Add member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Project Detail Page ───────────────────────────────────
const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`)
        setProject(res.data.data)
        setTasks(res.data.data.tasks ?? [])
      } catch {
        navigate('/projects')
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [projectId])

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status })
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: status as Task['status'] } : t)
      )
    } catch (err: any) {
      console.error(err)
    }
  }

  // figure out current user's role in this project
  const myMembership = project?.members.find(m => m.user.id === user?.id)
  const isAdmin = myMembership?.role === 'ADMIN'

  // task counts
  const todo = tasks.filter(t => t.status === 'TODO').length
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const done = tasks.filter(t => t.status === 'DONE').length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 pt-24">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-8 bg-slate-100 rounded w-48" />
          </div>
        </main>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* breadcrumb */}
        <div className="flex items-center gap-2 mb-8 fade-in">
          <button
            onClick={() => navigate('/projects')}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Projects
          </button>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-xs text-slate-600">{project.name}</span>
        </div>

        {/* header */}
        <div className="flex items-start justify-between mb-8 fade-in">
          <div>
            <h1 className="text-3xl text-slate-900 mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-slate-400 font-light max-w-lg">{project.description}</p>
            )}
          </div>
          {/* only ADMIN sees these buttons */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <AddMemberModal
                projectId={project.id}
                onAdded={(member) =>
                  setProject(prev => prev
                    ? { ...prev, members: [...prev.members, member] }
                    : prev
                  )
                }
              />
              <CreateTaskModal
                projectId={project.id}
                members={project.members}
                onCreated={(task) => setTasks(prev => [task, ...prev])}
              />
            </div>
          )}
        </div>

        {/* task stat strip */}
        <div className="flex items-center gap-6 mb-8 slide-up">
          {[
            { label: 'To Do', value: todo },
            { label: 'In Progress', value: inProgress },
            { label: 'Done', value: done }
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-2xl text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                {s.value}
              </span>
              <span className="text-xs text-slate-400 font-light">{s.label}</span>
            </div>
          ))}
          {tasks.length > 0 && (
            <>
              <div className="flex-1 h-px bg-slate-100 mx-2" />
              <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((done / tasks.length) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {Math.round((done / tasks.length) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* main grid */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* tasks — 2 cols */}
          <div className="md:col-span-2">
            <h2 className="text-sm font-medium text-slate-600 uppercase tracking-widest mb-4">
              Tasks
            </h2>
            <Card className="border-slate-100 bg-white">
              <div className="p-4">
                {tasks.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-slate-400 text-sm font-light">No tasks yet</p>
                    {isAdmin && (
                      <p className="text-slate-300 text-xs mt-1">
                        Create the first task for this project
                      </p>
                    )}
                  </div>
                ) : (
                  tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isAdmin={isAdmin}
                      isAssignee={task.assignee?.id === user?.id}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* members sidebar */}
          <div>
            <h2 className="text-sm font-medium text-slate-600 uppercase tracking-widest mb-4">
              Members
            </h2>
            <Card className="border-slate-100 bg-white p-4 space-y-3">
              {project.members.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center text-white text-xs font-medium">
                      {member.user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-slate-800 font-light leading-none mb-0.5">
                        {member.user.name}
                        {member.user.id === user?.id && (
                          <span className="text-slate-400 text-xs ml-1">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">{member.user.email}</p>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs border-0 font-light ${
                      member.role === 'ADMIN'
                        ? 'bg-slate-900 text-white hover:bg-slate-900'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {member.role.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}

export default ProjectDetail