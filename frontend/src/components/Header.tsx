import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useToolLimitsStore } from '../store/toolLimitsStore'

export default function Header() {
  const { isLoggedIn } = useAuthStore()
  const { userXp } = useToolLimitsStore()

  return (
    <header className="nav" data-active="tools">
      <div className="container nav-inner">
        <a className="wordmark" href="/">
          <span className="ve">Ve</span>Vit
        </a>

        <nav className="nav-links">
          <a className="nav-link" href="https://vevit.fun" data-nav="portal">Domů</a>
          <a className="nav-link" href="https://games.vevit.fun" data-nav="games">Hry</a>
          <a className="nav-link active" href="/" data-nav="tools">Nástroje</a>
          <a className="nav-link" href="https://edu.vevit.fun" data-nav="edu">Vzdělávání</a>
        </nav>

        <div className="nav-cta">
          {isLoggedIn ? (
            <>
              <Link to="/xp-store" style={{fontSize:'14px',fontWeight:500,color:'var(--c-tools)',textDecoration:'none'}}>
                XP obchod
              </Link>
              <span style={{fontSize:'14px',fontWeight:600,color:'var(--c-tools)',fontFamily:'var(--font-mono)'}}>
                {userXp.toLocaleString('cs')} XP
              </span>
            </>
          ) : (
            <a href="https://account.vevit.fun/login" className="btn btn-ghost btn-sm">
              Přihlásit se
            </a>
          )}
        </div>

        <button
          className="hamburger"
          onClick={() => {
            document.querySelector('.mobile-overlay')?.classList.add('open');
            document.querySelector('.mobile-panel')?.classList.add('open');
          }}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>
    </header>
  )
}