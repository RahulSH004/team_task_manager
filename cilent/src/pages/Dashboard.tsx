import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardData, Task } from '../types'

// stat card
const StatCard = ({
  label,
  value,
  delay = '0ms'
}: {
  label: string
  value: number
  delay?: string
}) => (
  <Card
    className="p-6 border-slate-100 bg-white slide-up"
    style={{ animationDelay: delay }}
  >
    <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">
      {label}
    </p>
    <p className="text-4xl text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
      {value}
    </p>
  </Card>
)

// status badge
const statusConfig = {
  TODO: { label: 'To Do', class: 'bg-slate-100 text-slate-600 hover:bg-slate-100' },
  IN_PROGRESS: { label: 'In Progress', class: 'bg-amber-50 text-amber-700 hover:bg-amber-50' },
  DONE: { label: 'Done', class: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' }
}

const priorityConfig = {
  LOW: { label: 'Low', class: 'bg-slate-50 text-slate-500' },
  MEDIUM: { label: 'Medium', class: 'bg-blue-50 text-blue-600' },
  HIGH: { label: 'High', class: 'bg-red-50 text-red-600' }
}

const TaskRow = ({ task }: { task: Task }) => {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group">
      <div className="flex items-center gap-3 min-w-0">
        {/* status dot */}
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          task.status === 'DONE' ? 'bg-emerald-400' :
          task.status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-slate-300'
        }`} />
        <div className="min-w-0">
          <p className="text-sm text-slate-800 truncate font-light">{task.title}</p>
          {task.projectId && (
            <p className="text-xs text-slate-400 mt-0.5">{(task as any).project?.name}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        {isOverdue && (
          <span className="text-xs text-red-500 font-medium">Overdue</span>
        )}
        <Badge className={`text-xs font-light border-0 ${priority.class}`}>
          {priority.label}
        </Badge>
        <Badge className={`text-xs font-light border-0 ${status.class}`}>
          {status.label}
        </Badge>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/dashboard')
        setData(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* header */}
        <div className="mb-10 fade-in">
          <p className="text-sm text-slate-400 font-light mb-1">{greeting()}</p>
          <h1 className="text-3xl text-slate-900">{user?.name}</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6 border-slate-100 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-16 mb-4" />
                <div className="h-8 bg-slate-100 rounded w-10" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard label="Total Tasks" value={data?.stats.total ?? 0} delay="0ms" />
              <StatCard label="Completed" value={data?.stats.completed ?? 0} delay="60ms" />
              <StatCard label="In Progress" value={data?.stats.inProgress ?? 0} delay="120ms" />
              <StatCard label="Overdue" value={data?.stats.overdue ?? 0} delay="180ms" />
            </div>

            {/* content grid */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* my tasks — takes 2 cols */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium text-slate-900">My Tasks</h2>
                  <Link
                    to="/projects"
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    View projects →
                  </Link>
                </div>
                <Card className="border-slate-100 bg-white divide-y-0">
                  <div className="p-4">
                    {data?.myTasks.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-slate-400 text-sm font-light">
                          No tasks assigned to you yet
                        </p>
                      </div>
                    ) : (
                      data?.myTasks.map(task => (
                        <TaskRow key={task.id} task={task} />
                      ))
                    )}
                  </div>
                </Card>
              </div>

              {/* summary panel */}
              <div>
                <h2 className="text-base font-medium text-slate-900 mb-4">Overview</h2>
                <Card className="border-slate-100 bg-white p-4 space-y-4">

                  {/* progress bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wide">
                        Completion
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        {data?.stats.total
                          ? Math.round((data.stats.completed / data.stats.total) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-700"
                        style={{
                          width: `${data?.stats.total
                            ? Math.round((data.stats.completed / data.stats.total) * 100)
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    {[
                      { label: 'Projects', value: data?.stats.projects ?? 0 },
                      { label: 'Completed', value: data?.stats.completed ?? 0 },
                      { label: 'In Progress', value: data?.stats.inProgress ?? 0 },
                      { label: 'Overdue', value: data?.stats.overdue ?? 0, danger: true }
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-light">{item.label}</span>
                        <span className={`text-sm font-medium ${item.danger && (item.value ?? 0) > 0 ? 'text-red-500' : 'text-slate-700'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                </Card>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard