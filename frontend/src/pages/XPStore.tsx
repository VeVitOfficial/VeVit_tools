import { useToolLimitsStore } from '../store/toolLimitsStore'

const BUNDLES = [
  { key: 'text-10', label: '10 AI text použití', cost: 70 },
  { key: 'vision-5', label: '5 AI vision použití', cost: 60 },
  { key: 'pdf-3', label: '3 AI PDF použití', cost: 75 },
]

export default function XPStore() {
  const { userXp } = useToolLimitsStore()

  return (
    <div className="tools-container">
      <div className="xp-store-hero">
        <h1>XP obchod</h1>
        <div className="xp-count">{userXp.toLocaleString('cs')} XP</div>
        <div className="xp-sub">Získej víc hraním her na games.vevit.fun</div>
      </div>

      <div className="xp-day-pass">
        <div>
          <div className="pass-title">AI Day Pass</div>
          <div className="pass-desc">24 hodin neomezeného AI</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <span className="pass-cost">400 XP</span>
          <button className="btn btn-primary">Aktivovat</button>
        </div>
      </div>

      <div className="xp-bundle-grid">
        {BUNDLES.map((bundle) => (
          <div key={bundle.key} className="xp-bundle-card card">
            <h3>{bundle.label}</h3>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'16px'}}>
              <span className="cost">{bundle.cost} XP</span>
              <button className="btn btn-ghost btn-sm">Koupit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}