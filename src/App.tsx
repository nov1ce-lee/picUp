import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Notification from './pages/Notification'

function App() {
  return (
    <Routes>
      <Route path="/notification" element={<Notification />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  )
}
export default App
