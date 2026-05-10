import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFound = () => (
  <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center fade-in">
    <p className="text-8xl text-slate-100 font-medium mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
      404
    </p>
    <p className="text-slate-900 text-sm font-medium mb-1">Page not found</p>
    <p className="text-slate-400 text-xs font-light mb-8">
      The page you're looking for doesn't exist
    </p>
    <Link to="/dashboard">
      <Button className="bg-slate-950 hover:bg-slate-800 text-white text-xs h-9 px-5 rounded-lg">
        Back to dashboard
      </Button>
    </Link>
  </div>
)

export default NotFound