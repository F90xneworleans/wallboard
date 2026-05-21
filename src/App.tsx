import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ListsPage } from './pages/ListsPage'
import { ListDetailPage } from './pages/ListDetailPage'
import { LoginPage } from './pages/LoginPage'

export function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<ListsPage />} />
      <Route path="/list/:listId" element={<ListDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter basename="/wallboard">
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
