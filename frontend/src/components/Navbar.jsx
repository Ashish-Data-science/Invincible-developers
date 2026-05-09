import { useAuth } from '../context/AuthContext'
import { LogOut, BarChart2, Shield, Building2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ links }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="border-b border-white/10 sticky top-0 z-50 bg-ipl-dark/80 backdrop-blur">
      <div className="section py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to={user?.role === 'admin' ? '/dashboard' : '/franchise'} className="flex items-center gap-3">
          <span className="text-2xl">🏏</span>
          <div>
            <p className="text-base font-bold gradient-text leading-tight">IPL Auction Decoder</p>
            <p className="text-xs text-white/40">Data Storytelling Project</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex gap-1">
          {links?.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* User badge + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            {user?.role === 'admin'
              ? <Shield size={13} className="text-ipl-accent" />
              : <Building2 size={13} className="text-ipl-gold" />
            }
            <span className="text-xs font-semibold text-white/80">
              {user?.role === 'franchise' ? user.code + ' · ' : ''}{user?.name}
            </span>
          </div>
          <button
            id="btn-logout"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-red-400 hover:bg-red-400/10 border border-white/10 transition-all"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </header>
  )
}
