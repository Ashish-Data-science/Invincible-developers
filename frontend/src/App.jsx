import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import FranchiseDashboard from './pages/FranchiseDashboard'
import StrategyMaker from './pages/StrategyMaker'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />
  return <Navigate to="/franchise" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
      } />

      {/* Franchise routes */}
      <Route path="/franchise" element={
        <ProtectedRoute allowedRole="franchise"><FranchiseDashboard /></ProtectedRoute>
      } />
      <Route path="/franchise/strategy" element={
        <ProtectedRoute allowedRole="franchise"><StrategyMaker /></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/Invincible-developers">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
