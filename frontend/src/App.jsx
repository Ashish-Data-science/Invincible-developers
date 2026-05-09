import { useState } from 'react'
import { Trophy, TrendingUp, Users, BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

// Placeholder data — replace with JSON loaded from /public/data/
const placeholderData = [
  { team: 'MI',  batters: 12.5, bowlers: 8.2, allrounders: 5.3 },
  { team: 'CSK', batters: 11.0, bowlers: 9.5, allrounders: 6.0 },
  { team: 'RCB', batters: 14.0, bowlers: 7.0, allrounders: 4.5 },
  { team: 'KKR', batters: 10.0, bowlers: 10.0, allrounders: 7.0 },
  { team: 'DC',  batters: 9.5,  bowlers: 8.8,  allrounders: 5.5 },
]

const statCards = [
  { icon: Trophy,    label: 'Teams Analysed',    value: '10' },
  { icon: Users,     label: 'Players Tracked',   value: '300+' },
  { icon: TrendingUp,label: 'Auction Seasons',   value: '16' },
  { icon: BarChart2, label: 'Data Points',        value: '50K+' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-ipl-dark">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-ipl-dark/80 backdrop-blur">
        <div className="section py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏏</span>
            <div>
              <h1 className="text-xl font-bold gradient-text leading-tight">
                IPL Auction Strategy Decoder
              </h1>
              <p className="text-xs text-white/40">Data Storytelling Project</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-white/60">
            {['overview', 'teams', 'players', 'insights'].map(tab => (
              <button
                key={tab}
                id={`nav-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`capitalize transition-colors hover:text-ipl-gold ${
                  activeTab === tab ? 'text-ipl-gold font-semibold' : ''
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="section text-center py-20">
        <p className="text-ipl-accent text-sm font-semibold uppercase tracking-widest mb-3">
          Data × Cricket
        </p>
        <h2 className="text-5xl md:text-6xl font-black gradient-text mb-6 leading-tight">
          Decode the Auction.<br />Win the Trophy.
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto text-lg">
          Interactive visualisations revealing how IPL franchises spend their auction
          budgets — and which strategies actually lead to championships.
        </p>
      </section>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <section className="section py-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-card p-5 flex flex-col items-center gap-2">
              <Icon className="text-ipl-gold" size={28} />
              <span className="text-3xl font-black">{value}</span>
              <span className="text-white/50 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Chart ──────────────────────────────────────────── */}
      <section className="section">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-1">Auction Spend by Role (₹ Cr)</h3>
          <p className="text-white/40 text-sm mb-6">
            Breakdown of how each team allocates budget across player roles
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={placeholderData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="team" stroke="#ffffff60" tick={{ fill: '#ffffff80' }} />
              <YAxis stroke="#ffffff60" tick={{ fill: '#ffffff80' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#12122A', border: '1px solid #ffffff20', borderRadius: 8 }}
                labelStyle={{ color: '#F9A825', fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ color: '#ffffff80' }} />
              <Bar dataKey="batters"     fill="#F9A825" radius={[4,4,0,0]} />
              <Bar dataKey="bowlers"     fill="#00D4FF" radius={[4,4,0,0]} />
              <Bar dataKey="allrounders" fill="#7C3AED" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/10 mt-20">
        <div className="section py-6 text-center text-white/30 text-sm">
          Built with React · Recharts · TailwindCSS · GitHub Pages
        </div>
      </footer>
    </div>
  )
}
