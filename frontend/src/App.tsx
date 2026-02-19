import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminFix from './pages/AdminFix'
import ClassList from './pages/professor/ClassList'
import MyEnrollments from './pages/professor/MyEnrollments'
import GestorDashboard from './pages/gestor/Dashboard'

import ClassPublicDetails from './pages/student/ClassPublicDetails'
import './index.css'

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'GESTOR' | 'PROFESSOR' }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-fix" element={<AdminFix />} />

      {/* Turmas - public (accessible without login) */}
      <Route
        path="/"
        element={
          <Layout>
            <ClassList />
          </Layout>
        }
      />
      <Route path="/turmas" element={<Navigate to="/" replace />} />
      <Route
        path="/turmas/:id"
        element={
          <Layout>
            <ClassPublicDetails />
          </Layout>
        }
      />

      {/* Protected routes */}
      <Route
        path="/minhas-inscricoes"
        element={
          <ProtectedRoute>
            <Layout>
              <MyEnrollments />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Gestor routes */}
      <Route
        path="/gestor"
        element={
          <ProtectedRoute requiredRole="GESTOR">
            <Layout fullWidth>
              <GestorDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirect helper */}
      <Route
        path="/redirect"
        element={
          user ? (
            user.role === 'GESTOR' ? (
              <Navigate to="/gestor" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
