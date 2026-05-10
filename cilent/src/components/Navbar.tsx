import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Projects', path: '/projects' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-6 h-6 bg-slate-950 rounded-md flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-sm" />
          </div>
          <span className="text-sm font-medium text-slate-900 tracking-wide">
            Task
          </span>
        </Link>

        {/* nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(link => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors duration-150 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* user section */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-slate-900 text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-600 font-light">{user?.name}</span>
          </div>

          <Separator orientation="vertical" className="h-4 hidden md:block" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-light"
          >
            Sign out
          </Button>
        </div>

      </div>
    </header>
  )
}

export default Navbar