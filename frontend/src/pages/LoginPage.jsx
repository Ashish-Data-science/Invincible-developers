import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Shield, Building2, Eye, EyeOff, Trophy } from 'lucide-react'

export default function LoginPage() {
  const { loginAdmin, loginFranchise, franchises } = useAuth()
  const [tab, setTab] = useState('admin')          // 'admin' | 'franchise'
  const [form, setForm] = useState({ username: '', password: '', franchise: 'MI' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))   // small UX delay
    const result = tab === 'admin'
      ? loginAdmin(form.username, form.password)
      : loginFranchise(form.franchise, form.password)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-ipl-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-ipl-blue/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-ipl-gold/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏏</div>
          <h1 className="text-2xl font-black gradient-text">IPL Auction Strategy Decoder</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        {/* Tab switcher */}
        <div className="glass-card p-1 flex mb-6 rounded-xl">
          <button
            id="tab-admin"
            onClick={() => { setTab('admin'); setError('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'admin' ? 'bg-ipl-blue text-white shadow' : 'text-white/50 hover:text-white'
            }`}
          >
            <Shield size={15} /> Analytics Team
          </button>
          <button
            id="tab-franchise"
            onClick={() => { setTab('franchise'); setError('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'franchise' ? 'bg-ipl-gold text-ipl-dark shadow' : 'text-white/50 hover:text-white'
            }`}
          >
            <Building2 size={15} /> Franchise
          </button>
        </div>

        {/* Login card */}
        <div className="glass-card p-7">
          <h2 className="text-lg font-bold mb-5">
            {tab === 'admin' ? '🛡️ Admin Login' : '🏟️ Franchise Login'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            {tab === 'admin' ? (
              <div>
                <label className="text-xs text-white/50 mb-1 block">Username</label>
                <input
                  id="input-username"
                  name="username"
                  value={form.username}
                  onChange={handle}
                  placeholder="admin"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-ipl-accent transition"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs text-white/50 mb-1 block">Select Franchise</label>
                <select
                  id="input-franchise"
                  name="franchise"
                  value={form.franchise}
                  onChange={handle}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-ipl-gold transition"
                >
                  {Object.entries(franchises).map(([code, f]) => (
                    <option key={code} value={code} className="bg-ipl-card">{code} — {f.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs text-white/50 mb-1 block">Password</label>
              <div className="relative">
                <input
                  id="input-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder-white/25 focus:outline-none focus:border-ipl-accent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                tab === 'admin'
                  ? 'bg-ipl-blue hover:bg-blue-600 text-white'
                  : 'bg-ipl-gold hover:bg-yellow-400 text-ipl-dark'
              } disabled:opacity-50`}
            >
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 space-y-1">
            <p className="font-semibold text-white/60">Demo credentials:</p>
            {tab === 'admin'
              ? <><p>Username: <span className="text-ipl-accent">admin</span></p><p>Password: <span className="text-ipl-accent">ipl2024</span></p></>
              : <><p>Select any franchise</p><p>Password: <span className="text-ipl-gold">franchise2024</span></p></>
            }
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          🏆 IPL Auction Strategy Decoder · Hackathon Edition
        </p>
      </div>
    </div>
  )
}
