import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ListsPage } from './pages/ListsPage'
import { ListDetailPage } from './pages/ListDetailPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ListsPage />} />
      <Route path="/list/:listId" element={<ListDetailPage />} />
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
