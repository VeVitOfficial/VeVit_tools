import { useState } from 'react'
import ToolCard from '../components/ToolCard'
import { tools } from '../registry/tools'

const CATEGORIES = [
  { key: 'all', label: 'Všechny' },
  { key: 'pdf', label: 'PDF' },
  { key: 'image', label: 'Obrázky' },
  { key: 'video', label: 'Video & Audio' },
  { key: 'text', label: 'Text' },
  { key: 'ai', label: 'AI' },
  { key: 'dev', label: 'Dev' },
  { key: 'security', label: 'Bezpečnost' },
  { key: 'calc', label: 'Kalkulačky' },
] as const

export default function Hub() {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = activeCategory === 'all'
    ? tools
    : tools.filter((t) => t.category === activeCategory)

  return (
    <div className="tools-container">
      {/* Hero */}
      <section className="tools-hero rise">
        <div className="tools-hero-info">
          <span className="eyebrow"><i data-lucide="wrench" style={{width:'12px',height:'12px'}}></i> Nástroje</span>
          <h1>Výkonné nástroje. <span className="gradient-text">Přímo v prohlížeči.</span></h1>
          <p>94 nástrojů pro PDF, obrázky, video, text a AI.</p>
          <p>Vaše soubory se zpracovávají bezpečně. Žádné nahrávání tam, kde to není nutné.</p>
        </div>

        <div className="tools-hero-stats">
          <div className="hero-stat">
            <span className="number">94</span>
            <span className="label">nástrojů</span>
          </div>
          <div className="hero-stat">
            <span className="number accent">100%</span>
            <span className="label">zdarma</span>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-inline">
              <i data-lucide="cpu" style={{width:'24px',height:'24px'}} className="stat-icon"></i>
              <div>
                <span className="stat-label">AI nástroje</span>
                <span className="stat-sublabel">Gemini 1.5 Flash</span>
              </div>
            </div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-inline">
              <i data-lucide="zap" style={{width:'24px',height:'24px',color:'var(--warn)'}}></i>
              <div>
                <span className="stat-label">Víc AI za XP</span>
                <span className="stat-sublabel">Z her získávej bonusy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <div className="cat-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`cat-tab ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tool grid */}
      <div className="tools-grid">
        {filtered.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {/* Privacy banner */}
      <section className="privacy-banner">
        <div className="privacy-item">
          <i data-lucide="shield" style={{width:'20px',height:'20px'}} className="icon"></i>
          <div>
            <span className="label">Lokální zpracování</span>
            <span className="sublabel">68 nástrojů běží přímo v prohlížeči</span>
          </div>
        </div>
        <div className="privacy-item">
          <i data-lucide="lock" style={{width:'20px',height:'20px'}} className="icon"></i>
          <div>
            <span className="label">Serverové zpracování</span>
            <span className="sublabel">Soubory na serveru max. 1 hodinu</span>
          </div>
        </div>
        <div className="privacy-item">
          <i data-lucide="eye" style={{width:'20px',height:'20px'}} className="icon"></i>
          <div>
            <span className="label">Bez reklam</span>
            <span className="sublabel">Žádné sledování, čistý zážitek</span>
          </div>
        </div>
      </section>
    </div>
  )
}