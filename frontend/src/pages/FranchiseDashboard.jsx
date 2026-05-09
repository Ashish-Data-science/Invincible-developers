import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { Wand2, Users, IndianRupee, Target } from 'lucide-react'

const FRANCHISE_LINKS = [
  { to: '/franchise', label: 'Home' },
  { to: '/franchise/strategy', label: '⚡ Strategy Maker' },
]

export default function FranchiseDashboard() {
  const { user } = useAuth()

  const cards = [
    { icon: IndianRupee, label: 'Total Budget',   value: `₹${user.budget} Cr`, color: 'text-ipl-gold' },
    { icon: Users,       label: 'Max Squad Size',  value: '25',                 color: 'text-ipl-accent' },
    { icon: Target,      label: 'Overseas Slots',  value: '8 (4 playing)',      color: 'text-purple-400' },
    { icon: Wand2,       label: 'Strategy Status', value: 'Not started',        color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen bg-ipl-dark">
      <Navbar links={FRANCHISE_LINKS} />

      <section className="section py-14 text-center">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 text-white"
          style={{ backgroundColor: user.color + '33', border: `1px solid ${user.color}66` }}
        >
          🏟️ {user.code} — {user.name}
        </div>
        <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">
          Welcome, {user.name}!
        </h2>
        <p className="text-white/60 max-w-xl mx-auto mb-8">
          Build your championship squad. Use the Strategy Maker to plan your auction picks, manage your budget, and decode winning team compositions.
        </p>
        <Link
          to="/franchise/strategy"
          id="btn-strategy-maker"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-ipl-dark text-sm transition-all hover:scale-105 shadow-lg"
          style={{ backgroundColor: user.color || '#F9A825' }}
        >
          <Wand2 size={18} /> Open Strategy Maker
        </Link>
      </section>

      {/* Quick stats */}
      <section className="section py-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card p-5 flex flex-col items-center gap-2 text-center">
              <Icon size={24} className={color} />
              <span className="text-2xl font-black">{value}</span>
              <span className="text-white/40 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Rules reminder */}
      <section className="section">
        <div className="glass-card p-6">
          <h3 className="font-bold text-base mb-4">📋 IPL Auction Rules (Quick Reference)</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-white/60">
            {[
              '💰 Total purse: ₹100 Crore per franchise',
              '👥 Squad size: 18–25 players',
              '🌍 Max 8 overseas players in squad (4 in playing XI)',
              '🔒 Retain up to 6 players before auction',
              '⚡ Right to Match (RTM) cards available',
              '🏏 Minimum 14 Indian players in squad',
              '🏦 Minimum ₹3 Cr must remain after auction',
              '⬆️ Base price starts at ₹20 Lakh minimum',
            ].map(r => (
              <div key={r} className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2">
                {r}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 mt-10">
        <div className="section py-5 text-center text-white/20 text-xs">
          IPL Auction Strategy Decoder · {user.name}
        </div>
      </footer>
    </div>
  )
}
