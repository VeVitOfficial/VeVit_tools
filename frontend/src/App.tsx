import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hub from './pages/Hub'
import ToolPage from './pages/ToolPage'
import XPStore from './pages/XPStore'
import History from './pages/History'

function App() {
  return (
    <div className="tools-accent" style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <Header />
      <main style={{flex:1}}>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/xp-store" element={<XPStore />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  )
}

export default App