import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { Project } from '../types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional()
})

type CreateProjectInput = z.infer<typeof createProjectSchema>

// ── Project Card ──────────────────────────────────────────
const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const memberCount = project.members?.length ?? 0
  const taskCount = project._count?.tasks ?? 0

  return (
    <Link to={`/projects/${project.id}`}>
      <Card
        className="p-6 border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer group slide-up"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* top row */}
        <div className="flex items-start justify-between mb-6">
          <div
            className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
          >
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs text-slate-400 font-light">
            {new Date(project.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>

        {/* name + description */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed">
            {project.description || 'No description'}
          </p>
        </div>

        {/* bottom row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-3">
            {/* member avatars */}
            <div className="flex -space-x-1.5">
              {project.members?.slice(0, 3).map(m => (
                <div
                  key={m.id}
                  className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-medium text-slate-600"
                  title={m.user.name}
                >
                  {m.user.name[0].toUpperCase()}
                </div>
              ))}
              {memberCount > 3 && (
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[9px] text-slate-500">
                  +{memberCount - 3}
                </div>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </Card>
    </Link>
  )
}

// ── Create Project Modal ──────────────────────────────────
const CreateProjectModal = ({ onCreated }: { onCreated: (p: Project) => void }) => {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateProjectInput>({ resolver: zodResolver(createProjectSchema) })

  const onSubmit = async (data: CreateProjectInput) => {
    try {
      setServerError('')
      const res = await api.post('/projects', data)
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
        <Button className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-medium h-9 px-4 rounded-lg">
          New project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Create project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Name
            </label>
            <Input
              placeholder="e.g. Website Redesign"
              className="h-10 border-slate-200 text-slate-900 placeholder:text-slate-300 font-light rounded-lg"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Description
              <span className="normal-case text-slate-400 ml-1">(optional)</span>
            </label>
            <textarea
              placeholder="What is this project about?"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 font-light resize-none focus:outline-none focus:border-slate-400 transition-colors"
              {...register('description')}
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
              ) : 'Create project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Projects Page ─────────────────────────────────────────
const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/projects')
        setProjects(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* header */}
        <div className="flex items-end justify-between mb-10 fade-in">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">
              Workspace
            </p>
            <h1 className="text-3xl text-slate-900">Projects</h1>
          </div>
          <CreateProjectModal
            onCreated={(p) => setProjects(prev => [p, ...prev])}
          />
        </div>

        {/* loading skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 border-slate-100 animate-pulse">
                <div className="w-8 h-8 bg-slate-100 rounded-lg mb-6" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-50 rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          // empty state
          <div className="flex flex-col items-center justify-center py-32 fade-in">
            <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-slate-300 rounded" />
            </div>
            <p className="text-slate-900 font-medium text-sm mb-1">No projects yet</p>
            <p className="text-slate-400 text-xs font-light mb-6">
              Create your first project to get started
            </p>
            <CreateProjectModal
              onCreated={(p) => setProjects([p])}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

export default Projects