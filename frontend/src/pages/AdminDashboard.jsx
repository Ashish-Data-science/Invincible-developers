import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Trophy, TrendingUp, Users, BarChart2, IndianRupee, Target } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts'

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Overview' },
]

const ROLE_COLORS = {
  'Batter': '#F9A825',
  'Bowler': '#00D4FF',
  'All-Rounder': '#A855F7',
  'WK-Batter': '#10B981',
}
const PIE_COLORS = ['#F9A825', '#00D4FF', '#A855F7', '#10B981']

export default function AdminDashboard() {
  const [teamSpend, setTeamSpend]       = useState([])
  const [summary, setSummary]           = useState({})
  const [roleDist, setRoleDist]         = useState([])
  const [scatter, setScatter]           = useState([])
  const [players, setPlayers]           = useState([])

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:8000/api/team_spend`).then(r => r.json()),
      fetch(`http://localhost:8000/api/auction_summary`).then(r => r.json()),
      fetch(`http://localhost:8000/api/role_distribution`).then(r => r.json()),
      fetch(`http://localhost:8000/api/price_vs_performance`).then(r => r.json()),
      fetch(`http://localhost:8000/api/players`).then(r => r.json()),
    ]).then(([ts, sm, rd, sc, pl]) => {
      setTeamSpend(ts)
      setSummary(sm)
      setRoleDist(rd)
      setScatter(sc)
      setPlayers(pl)
    }).catch(console.error)
  }, [])

  const topBatters = [...players].sort((a, b) => b.totalRuns - a.totalRuns).slice(0, 5)
  const topBowlers = [...players].sort((a, b) => b.wickets - a.wickets).slice(0, 5)

  const statCards = [
    { icon: Users,        label: 'Players Auctioned', value: summary.totalPlayers || '—' },
    { icon: Trophy,       label: 'Teams',             value: summary.totalTeams || '—' },
    { icon: IndianRupee,  label: 'Total Spend (Cr)',  value: `₹${summary.totalSpend || 0}` },
    { icon: Target,       label: 'Avg Price (Cr)',    value: `₹${summary.avgPrice || 0}` },
    { icon: TrendingUp,   label: 'Max Price (Cr)',    value: `₹${summary.maxPrice || 0}` },
    { icon: BarChart2,    label: 'Seasons Covered',   value: summary.seasons || 6 },
  ]

  return (
    <div className="min-h-screen bg-ipl-dark">
      <Navbar links={ADMIN_LINKS} />

      {/* Hero */}
      <section className="section text-center py-14">
        <p className="text-ipl-accent text-xs font-semibold uppercase tracking-widest mb-3">Analytics Dashboard</p>
        <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4 leading-tight">
          Decode the Auction.<br />Win the Trophy.
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto text-sm">
          Data-driven insights from {summary.totalPlayers || '—'} players across {summary.totalTeams || '—'} franchises.
          Powered by real ball-by-ball and auction data from IPL 2020–2025.
        </p>
      </section>

      {/* Stat cards */}
      <section className="section py-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-card p-4 flex flex-col items-center gap-1.5 text-center">
              <Icon className="text-ipl-gold" size={22} />
              <span className="text-2xl font-black">{value}</span>
              <span className="text-white/40 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Charts row 1 */}
      <section className="section grid md:grid-cols-2 gap-6">
        {/* Team spend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-1">Auction Spend by Team (₹ Cr)</h3>
          <p className="text-white/40 text-xs mb-4">Budget allocation across player roles per franchise</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={teamSpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="team" stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 11 }} />
              <YAxis stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#12122A', border: '1px solid #ffffff20', borderRadius: 8 }} labelStyle={{ color: '#F9A825', fontWeight: 700 }} />
              <Legend wrapperStyle={{ color: '#ffffff60', fontSize: 11 }} />
              <Bar dataKey="batters"     name="Batters"      fill="#F9A825" radius={[3,3,0,0]} />
              <Bar dataKey="bowlers"     name="Bowlers"      fill="#00D4FF" radius={[3,3,0,0]} />
              <Bar dataKey="allrounders" name="All-rounders" fill="#A855F7" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role distribution pie */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-1">Role Distribution</h3>
          <p className="text-white/40 text-xs mb-4">Number of players auctioned by role</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleDist} dataKey="count" nameKey="role" cx="50%" cy="50%"
                outerRadius={90} innerRadius={45} paddingAngle={4}
                label={({ role, count }) => `${role}: ${count}`}
              >
                {roleDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#12122A', border: '1px solid #ffffff20', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Charts row 2: Scatter */}
      <section className="section">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-1">💰 Price vs Performance</h3>
          <p className="text-white/40 text-xs mb-4">Are high-price players worth it? (hover for player names)</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="price" name="Price (₹Cr)" stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 11 }} />
              <YAxis dataKey="performance" name="Performance Score" stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 11 }} />
              <ZAxis range={[40, 120]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#12122A', border: '1px solid #ffffff20', borderRadius: 8 }}
                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(1) : value, name]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
              />
              <Scatter data={scatter.filter(s => s.role === 'Batter' || s.role === 'WK-Batter')} fill="#F9A825" name="Batters" />
              <Scatter data={scatter.filter(s => s.role === 'Bowler')} fill="#00D4FF" name="Bowlers" />
              <Scatter data={scatter.filter(s => s.role === 'All-Rounder')} fill="#A855F7" name="All-rounders" />
              <Legend wrapperStyle={{ color: '#ffffff60', fontSize: 11 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Leaderboards */}
      <section className="section grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold text-base mb-3">🏏 Top Run Scorers</h3>
          <div className="space-y-2">
            {topBatters.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 bg-white/5 rounded-lg p-2.5">
                <span className="text-ipl-gold font-black text-sm w-6">#{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-white/40">{p.role} · SR: {p.strikeRate}</p>
                </div>
                <span className="text-ipl-gold font-bold">{p.totalRuns.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-bold text-base mb-3">🎯 Top Wicket Takers</h3>
          <div className="space-y-2">
            {topBowlers.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 bg-white/5 rounded-lg p-2.5">
                <span className="text-ipl-accent font-black text-sm w-6">#{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-white/40">{p.role} · Econ: {p.economy}</p>
                </div>
                <span className="text-ipl-accent font-bold">{p.wickets}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="section">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">🔍 Data Insights</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Most Expensive Player', desc: `${summary.topBatter || '—'} commanded the highest bid of ₹${summary.maxPrice || 0} Cr`, color: 'border-ipl-gold' },
              { title: 'Average Auction Price', desc: `Players were sold at an average of ₹${summary.avgPrice || 0} Cr across all roles`, color: 'border-ipl-accent' },
              { title: 'Role Price Gaps', desc: roleDist.length > 0 ? `${roleDist[0]?.role} fetched an avg of ₹${roleDist[0]?.avgPrice} Cr vs ₹${roleDist[roleDist.length-1]?.avgPrice} Cr for ${roleDist[roleDist.length-1]?.role}` : '', color: 'border-purple-400' },
            ].map(i => (
              <div key={i.title} className={`border-l-4 ${i.color} pl-4 py-1`}>
                <p className="font-bold text-sm mb-1">{i.title}</p>
                <p className="text-white/50 text-xs leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 mt-10">
        <div className="section py-5 text-center text-white/20 text-xs">
          Built with React · Recharts · TailwindCSS · Python Data Pipeline
        </div>
      </footer>
    </div>
  )
}
