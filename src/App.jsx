import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './components/Login'
import AdminSetup from './components/AdminSetup'
import Dashboard from './components/Dashboard'
import SurveyForm from './components/SurveyForm'
import SurveyDetail from './components/SurveyDetail'
import UserManagement from './components/UserManagement'
import Tablero from './components/Tablero'
import About from './components/About'
import Psicobienestar from './components/Psicobienestar'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (user) return <Navigate to="/dashboard" replace />
  return <AdminSetup />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/setup" element={<PublicRoute><AdminSetup /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/survey/new" element={<ProtectedRoute><SurveyForm /></ProtectedRoute>} />
          <Route path="/survey/edit/:id" element={<ProtectedRoute><SurveyForm /></ProtectedRoute>} />
          <Route path="/survey/:id" element={<ProtectedRoute><SurveyDetail /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/tablero" element={<ProtectedRoute><Tablero /></ProtectedRoute>} />
          <Route path="/psicobienestar" element={<ProtectedRoute><Psicobienestar /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
