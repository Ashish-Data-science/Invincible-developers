import Navbar from '../components/Navbar'
import { Trophy, TrendingUp, Users, BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'

const spendData = [
  { team: 'MI',  batters: 12.5, bowlers: 8.2, allrounders: 5.3 },
  { team: 'CSK', batters: 11.0, bowlers: 9.5, allrounders: 6.0 },
  { team: 'RCB', batters: 14.0, bowlers: 7.0, allrounders: 4.5 },
  { team: 'KKR', batters: 10.0, bowlers: 10.0,allrounders: 7.0 },
  { team: 'DC',  batters: 9.5,  bowlers: 8.8, allrounders: 5.5 },
  { team: 'SRH', batters: 11.5, bowlers: 9.0, allrounders: 4.0 },
]

const winRateData = [
  { season: '2019', MI: 72, CSK: 68, RCB: 45 },
  { season: '2020', MI: 75, CSK: 58, RCB: 50 },
  { season: '2021', MI: 62, CSK: 75, RCB: 55 },
  { season: '2022', MI: 40, CSK: 52, RCB: 60 },
  { season: '2023', MI: 55, CSK: 80, RCB: 62 },
]

const statCards = [
  { icon: Trophy,     label: 'Teams Analysed',  value: '10' },
  { icon: Users,      label: 'Players Tracked', value: '300+' },
  { icon: TrendingUp, label: 'Auction Seasons',  value: '16' },
  { icon: BarChart2,  label: 'Data Points',      value: '50K+' },
]

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/teams', label: 'Teams' },
  { to: '/dashboard/insights', label: 'Insights' },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-ipl-dark">
      <Navbar links={ADMIN_LINKS} />

      {/* Hero */}
      <section className="section text-center py-16">
        <p className="text-ipl-accent text-xs font-semibold uppercase tracking-widest mb-3">Analytics Dashboard</p>
        <h2 className="text-5xl md:text-6xl font-black gradient-text mb-4 leading-tight">
          Decode the Auction.<br />Win the Trophy.
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Interactive visualisations revealing how IPL franchises spend their auction budgets — and which strategies lead to championships.
        </p>
      </section>

      {/* Stat cards */}
      <section className="section py-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-card p-5 flex flex-col items-center gap-2">
              <Icon className="text-ipl-gold" size={26} />
              <span className="text-3xl font-black">{value}</span>
              <span className="text-white/50 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="section grid md:grid-cols-2 gap-6">
        {/* Spend by role */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-1">Auction Spend by Role (₹ Cr)</h3>
          <p className="text-white/40 text-xs mb-4">Budget allocation across player roles</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={spendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="team" stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 12 }} />
              <YAxis stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#12122A', border: '1px solid #ffffff20', borderRadius: 8 }} labelStyle={{ color: '#F9A825', fontWeight: 700 }} />
              <Legend wrapperStyle={{ color: '#ffffff60', fontSize: 12 }} />
              <Bar dataKey="batters"     fill="#F9A825" radius={[3,3,0,0]} />
              <Bar dataKey="bowlers"     fill="#00D4FF" radius={[3,3,0,0]} />
              <Bar dataKey="allrounders" fill="#7C3AED" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win rate trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-1">Win Rate Trend (%)</h3>
          <p className="text-white/40 text-xs mb-4">Top franchise performance over seasons</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={winRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="season" stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 12 }} />
              <YAxis stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#12122A', border: '1px solid #ffffff20', borderRadius: 8 }} labelStyle={{ color: '#F9A825', fontWeight: 700 }} />
              <Legend wrapperStyle={{ color: '#ffffff60', fontSize: 12 }} />
              <Line type="monotone" dataKey="MI"  stroke="#004BA0" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="CSK" stroke="#F9CD05" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="RCB" stroke="#EC1C24" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Key insights */}
      <section className="section">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">🔍 Key Insights</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Big-Batter Bias', desc: 'Teams spending >₹12Cr on batters average 65% win rate vs 48% for balanced squads.', color: 'border-ipl-gold' },
              { title: 'Spin Wins Titles', desc: 'Champions in 4 of last 5 seasons had a premium spinner costing >₹8Cr.', color: 'border-ipl-accent' },
              { title: 'Overseas Balance', desc: 'Optimal squads use exactly 4 overseas picks split 2 bat / 1 bowl / 1 WK.', color: 'border-purple-400' },
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
          Built with React · Recharts · TailwindCSS · GitHub Pages
        </div>
      </footer>
    </div>
  )
}
