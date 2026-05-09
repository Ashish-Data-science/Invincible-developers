import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Demo credentials — replace with real auth for production
const CREDENTIALS = {
  admin: { username: 'admin', password: 'ipl2024', role: 'admin', name: 'Analytics Team' },
  franchises: {
    MI:   { password: 'franchise2024', name: 'Mumbai Indians',       color: '#004BA0', budget: 100 },
    CSK:  { password: 'franchise2024', name: 'Chennai Super Kings',   color: '#F9CD05', budget: 100 },
    RCB:  { password: 'franchise2024', name: 'Royal Challengers Bangalore', color: '#EC1C24', budget: 100 },
    KKR:  { password: 'franchise2024', name: 'Kolkata Knight Riders', color: '#3A225D', budget: 100 },
    DC:   { password: 'franchise2024', name: 'Delhi Capitals',        color: '#0078BC', budget: 100 },
    SRH:  { password: 'franchise2024', name: 'Sunrisers Hyderabad',   color: '#F26522', budget: 100 },
    PBKS: { password: 'franchise2024', name: 'Punjab Kings',          color: '#ED1B24', budget: 100 },
    RR:   { password: 'franchise2024', name: 'Rajasthan Royals',      color: '#EA1A85', budget: 100 },
    GT:   { password: 'franchise2024', name: 'Gujarat Titans',        color: '#1C4E80', budget: 100 },
    LSG:  { password: 'franchise2024', name: 'Lucknow Super Giants',  color: '#A4C639', budget: 100 },
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ipl_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const loginAdmin = (username, password) => {
    if (username === CREDENTIALS.admin.username && password === CREDENTIALS.admin.password) {
      const u = { role: 'admin', name: 'Analytics Team', username }
      setUser(u)
      localStorage.setItem('ipl_user', JSON.stringify(u))
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const loginFranchise = (code, password) => {
    const f = CREDENTIALS.franchises[code]
    if (f && password === f.password) {
      const u = { role: 'franchise', code, name: f.name, color: f.color, budget: f.budget }
      setUser(u)
      localStorage.setItem('ipl_user', JSON.stringify(u))
      return { success: true }
    }
    return { success: false, error: 'Invalid franchise credentials' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ipl_user')
  }

  return (
    <AuthContext.Provider value={{ user, loginAdmin, loginFranchise, logout, franchises: CREDENTIALS.franchises }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
