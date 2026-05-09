import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import {
  Search, Filter, Plus, Trash2, IndianRupee,
  Download, RotateCcw, Star, ChevronDown
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'

const FRANCHISE_LINKS = [
  { to: '/franchise', label: 'Home' },
  { to: '/franchise/strategy', label: '⚡ Strategy Maker' },
]

const ROLE_COLORS = {
  'Batter':        '#F9A825',
  'Bowler':        '#00D4FF',
  'All-rounder':   '#A855F7',
  'Wicket-keeper': '#10B981',
}

const FLAG = { India: '🇮🇳', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Australia: '🇦🇺', 'South Africa': '🇿🇦',
               'New Zealand': '🇳🇿', Afghanistan: '🇦🇫', 'West Indies': '🌴', Pakistan: '🇵🇰' }

function RatingBar({ value }) {
  const pct = (value / 100) * 100
  const color = value >= 90 ? '#F9A825' : value >= 80 ? '#00D4FF' : '#A855F7'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

function BidDialog({ player, onConfirm, onCancel }) {
  const [bid, setBid] = useState(player.basePrice)
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-7 w-full max-w-sm">
        <h3 className="font-bold text-lg mb-1">Set Max Bid</h3>
        <p className="text-white/50 text-sm mb-5">
          {player.name} · <span style={{ color: ROLE_COLORS[player.role] }}>{player.role}</span>
        </p>
        <div className="mb-5">
          <label className="text-xs text-white/50 mb-1 block">Max Bid Amount (₹ Crore)</label>
          <input
            type="number"
            min={player.basePrice}
            step={0.25}
            value={bid}
            onChange={e => setBid(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-ipl-gold"
          />
          <p className="text-xs text-white/30 mt-1">Base price: ₹{player.basePrice} Cr</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white">Cancel</button>
          <button onClick={() => onConfirm(bid)} className="flex-1 py-2.5 rounded-lg bg-ipl-gold text-ipl-dark font-bold text-sm hover:bg-yellow-400">
            Add to Squad
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StrategyMaker() {
  const { user } = useAuth()
  const [players, setPlayers]   = useState([])
  const [squad, setSquad]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(`squad_${user.code}`)) || [] } catch { return [] }
  })
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('All')
  const [natFilter, setNat]     = useState('All')
  const [bidTarget, setBidTarget] = useState(null)
  const [sortBy, setSortBy]     = useState('rating')

  const TOTAL_BUDGET = user.budget   // ₹100 Cr

  // Load players
  useEffect(() => {
    fetch(`http://localhost:8000/api/players`)
      .then(r => r.json())
      .then(setPlayers)
      .catch(() => setPlayers([]))
  }, [])

  // Persist squad
  useEffect(() => {
    localStorage.setItem(`squad_${user.code}`, JSON.stringify(squad))
  }, [squad, user.code])

  const spent        = squad.reduce((s, p) => s + p.maxBid, 0)
  const remaining    = TOTAL_BUDGET - spent
  const budgetPct    = (spent / TOTAL_BUDGET) * 100
  const overBudget   = remaining < 0
  const squadIds     = new Set(squad.map(p => p.id))

  // Role counts
  const roleCounts = useMemo(() => {
    const c = { 'Batter': 0, 'Bowler': 0, 'All-rounder': 0, 'Wicket-keeper': 0 }
    squad.forEach(p => { if (c[p.role] !== undefined) c[p.role]++ })
    return c
  }, [squad])

  const overseasCount = squad.filter(p => p.nationality !== 'India').length
  const radarData = [
    { subject: 'Batters',    A: roleCounts['Batter'],        fullMark: 8 },
    { subject: 'Bowlers',    A: roleCounts['Bowler'],        fullMark: 7 },
    { subject: 'All-rounders',A: roleCounts['All-rounder'],  fullMark: 4 },
    { subject: 'Keepers',    A: roleCounts['Wicket-keeper'], fullMark: 2 },
    { subject: 'Overseas',   A: overseasCount,               fullMark: 8 },
  ]

  // Filtered + sorted pool
  const roles = ['All', 'Batter', 'Bowler', 'All-rounder', 'Wicket-keeper']
  const nats  = ['All', 'India', 'England', 'Australia', 'South Africa', 'New Zealand', 'Afghanistan', 'West Indies']

  const filtered = useMemo(() => {
    return players
      .filter(p => !squadIds.has(p.id))
      .filter(p => roleFilter === 'All' || p.role === roleFilter)
      .filter(p => natFilter === 'All' || p.nationality === natFilter)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b[sortBy] - a[sortBy])
  }, [players, squad, roleFilter, natFilter, search, sortBy, squadIds])

  const addToSquad = (player, maxBid) => {
    setSquad(s => [...s, { ...player, maxBid }])
    setBidTarget(null)
  }

  const removeFromSquad = (id) => setSquad(s => s.filter(p => p.id !== id))

  const exportStrategy = () => {
    const data = {
      franchise: user.name,
      code: user.code,
      totalBudget: TOTAL_BUDGET,
      spent,
      remaining,
      squad: squad.map(p => ({ name: p.name, role: p.role, nationality: p.nationality, maxBid: p.maxBid })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${user.code}_strategy.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const budgetColor = budgetPct > 90 ? '#EF4444' : budgetPct > 70 ? '#F9A825' : '#10B981'

  return (
    <div className="min-h-screen bg-ipl-dark">
      <Navbar links={FRANCHISE_LINKS} />
      {bidTarget && <BidDialog player={bidTarget} onConfirm={(bid) => addToSquad(bidTarget, bid)} onCancel={() => setBidTarget(null)} />}

      {/* Budget header */}
      <div className="border-b border-white/10 bg-ipl-card/60 backdrop-blur sticky top-[57px] z-40">
        <div className="section py-3">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-white/50">Total: <strong className="text-white">₹{TOTAL_BUDGET} Cr</strong></span>
              <span className="text-white/50">Committed: <strong className="text-ipl-gold">₹{spent.toFixed(2)} Cr</strong></span>
              <span className={overBudget ? 'text-red-400 font-bold' : 'text-white/50'}>
                Remaining: <strong style={{ color: budgetColor }}>₹{remaining.toFixed(2)} Cr</strong>
              </span>
              <span className="text-white/50">Squad: <strong className="text-white">{squad.length}/25</strong></span>
              <span className={overseasCount > 8 ? 'text-red-400' : 'text-white/50'}>
                Overseas: <strong className={overseasCount > 8 ? 'text-red-400' : 'text-ipl-accent'}>{overseasCount}/8</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSquad([])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-red-400 hover:border-red-400/30">
                <RotateCcw size={12} /> Reset
              </button>
              <button onClick={exportStrategy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ipl-gold text-ipl-dark text-xs font-bold hover:bg-yellow-400">
                <Download size={12} /> Export
              </button>
            </div>
          </div>
          {/* Budget bar */}
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(budgetPct, 100)}%`, backgroundColor: budgetColor }} />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="section py-6 grid lg:grid-cols-[1fr_380px] gap-6">

        {/* ── Left: Player Pool ─────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">🏏 Player Pool <span className="text-white/30 text-sm font-normal">({filtered.length} available)</span></h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search player..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-ipl-accent"
              />
            </div>
            <select value={roleFilter} onChange={e => setRole(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {roles.map(r => <option key={r} value={r} className="bg-ipl-card">{r === 'All' ? 'All Roles' : r}</option>)}
            </select>
            <select value={natFilter} onChange={e => setNat(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {nats.map(n => <option key={n} value={n} className="bg-ipl-card">{n === 'All' ? 'All Nations' : n}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="rating" className="bg-ipl-card">Sort: Rating</option>
              <option value="basePrice" className="bg-ipl-card">Sort: Price</option>
            </select>
          </div>

          {/* Player cards */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1 custom-scroll">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-white/30">No players found</div>
            )}
            {filtered.map(player => (
              <div key={player.id} className="glass-card p-4 flex items-center gap-4 hover:border-white/20 transition-all group">
                {/* Role badge */}
                <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: ROLE_COLORS[player.role] }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm truncate">{player.name}</span>
                    <span className="text-xs">{FLAG[player.nationality] || '🏳️'}</span>
                    {player.rating >= 90 && <Star size={11} className="text-ipl-gold fill-ipl-gold" />}
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: ROLE_COLORS[player.role] + '22', color: ROLE_COLORS[player.role] }}>{player.role}</span>
                    <span className="text-xs text-white/30">{player.specialty}</span>
                  </div>
                  <RatingBar value={player.rating} />
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-ipl-gold font-bold text-sm">₹{player.basePrice} Cr</p>
                  <p className="text-white/30 text-xs">base price</p>
                </div>

                <button
                  id={`add-${player.id}`}
                  onClick={() => setBidTarget(player)}
                  disabled={squad.length >= 25}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-ipl-gold/10 border border-ipl-gold/20 text-ipl-gold text-xs font-bold hover:bg-ipl-gold hover:text-ipl-dark transition-all disabled:opacity-30"
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: My Squad ───────────────────── */}
        <div className="space-y-4">
          {/* Squad composition radar */}
          <div className="glass-card p-5">
            <h3 className="font-bold text-sm mb-3">📊 Squad Composition</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#ffffff15" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 10 }} />
                <Radar dataKey="A" stroke={user.color || '#F9A825'} fill={user.color || '#F9A825'} fillOpacity={0.25} />
                <Tooltip contentStyle={{ backgroundColor: '#12122A', border: '1px solid #ffffff20', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
            {/* Role pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(roleCounts).map(([role, count]) => (
                <div key={role} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: ROLE_COLORS[role] + '22' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ROLE_COLORS[role] }} />
                  <span style={{ color: ROLE_COLORS[role] }}>{role}: {count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Squad list */}
          <div className="glass-card p-5">
            <h3 className="font-bold text-sm mb-3">
              🎯 My Squad
              <span className="ml-2 text-white/30 font-normal">({squad.length} players)</span>
            </h3>

            {squad.length === 0 && (
              <p className="text-white/30 text-sm text-center py-6">
                Add players from the pool to start building your squad
              </p>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {squad.map((player, i) => (
                <div key={player.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 group">
                  <span className="text-xs text-white/30 w-4">{i + 1}</span>
                  <div className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: ROLE_COLORS[player.role] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{player.name}</p>
                    <p className="text-xs text-white/30">{player.role} · {FLAG[player.nationality] || ''} {player.nationality}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-ipl-gold text-sm font-bold">₹{player.maxBid} Cr</p>
                  </div>
                  <button onClick={() => removeFromSquad(player.id)} className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {squad.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-sm">
                <span className="text-white/50">Total committed</span>
                <span className="font-bold text-ipl-gold">₹{spent.toFixed(2)} Cr</span>
              </div>
            )}
          </div>

          {/* Strategy tips */}
          {squad.length > 0 && (
            <div className="glass-card p-4 border-l-4 border-ipl-accent">
              <h4 className="text-xs font-bold text-ipl-accent mb-2">💡 Strategy Analysis</h4>
              <div className="space-y-1 text-xs text-white/50">
                {roleCounts['Bowler'] < 4 && <p>⚠️ Add at least {4 - roleCounts['Bowler']} more bowler(s)</p>}
                {roleCounts['Wicket-keeper'] === 0 && <p>⚠️ No wicket-keeper in squad!</p>}
                {overseasCount > 8 && <p>🚨 Over overseas limit ({overseasCount}/8)</p>}
                {roleCounts['Batter'] >= 6 && roleCounts['Bowler'] >= 4 && roleCounts['Wicket-keeper'] >= 1 && (
                  <p className="text-green-400">✅ Good balance! Keep building.</p>
                )}
                {remaining < 10 && remaining >= 0 && <p>⚠️ Less than ₹10 Cr remaining</p>}
                {overBudget && <p className="text-red-400">🚨 Over budget! Remove players to stay within ₹{TOTAL_BUDGET} Cr</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/10 mt-4">
        <div className="section py-4 text-center text-white/20 text-xs">
          IPL Auction Strategy Decoder · {user.name}
        </div>
      </footer>
    </div>
  )
}
