import { Link } from 'react-router-dom'
import type { ToolMeta } from '../types/tool'
import { CATEGORY_COLORS } from '../types/tool'
import * as Icons from 'lucide-react'

interface ToolCardProps {
  tool: ToolMeta
}

export default function ToolCard({ tool }: ToolCardProps) {
  const color = CATEGORY_COLORS[tool.category]
  const Icon = (Icons as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[tool.icon] || Icons.Circle

  return (
    <Link to={`/tools/${tool.slug}`} className="tool-card">
      <div className="tool-card-bar" style={{ backgroundColor: color }} />
      <div className="tool-card-body">
        <div className="tool-card-meta">
          <Icon style={{ width: 20, height: 20, color }} />
          {tool.isNew && <span className="tool-card-badge-new">NOVÉ</span>}
        </div>

        <h3>{tool.name}</h3>
        <p className="desc">{tool.description}</p>

        {tool.processingLocation === 'ai' && (
          <span className="tool-card-badge-ai">Denní limit</span>
        )}

        <div style={{marginTop:'12px'}}>
          <span className="tool-card-open">Otevřít</span>
        </div>
      </div>
    </Link>
  )
}