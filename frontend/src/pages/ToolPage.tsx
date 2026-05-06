import { useParams } from 'react-router-dom'
import { tools } from '../registry/tools'
import { CATEGORY_COLORS } from '../types/tool'

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>()
  const tool = tools.find((t) => t.slug === slug)

  if (!tool) {
    return (
      <div className="tools-container">
        <h1 style={{fontSize:'24px',fontWeight:700}}>Nástroj nenalezen</h1>
      </div>
    )
  }

  const color = CATEGORY_COLORS[tool.category]

  return (
    <div className="tools-container">
      <div className="tool-page-header">
        <div className="tool-page-bar" style={{ backgroundColor: color }} />
        <h1 className="tool-page-title">{tool.name}</h1>
        <span className="tool-page-badge">
          {tool.processingLocation === 'client' && 'Lokální'}
          {tool.processingLocation === 'server' && 'Server'}
          {tool.processingLocation === 'ai' && 'AI'}
        </span>
      </div>

      <div className="tool-page-frame">
        <p style={{color:'var(--text-muted)',marginBottom:'32px'}}>{tool.description}</p>
        <div className="placeholder">
          Zde se načte konkrétní nástroj...
        </div>
      </div>
    </div>
  )
}