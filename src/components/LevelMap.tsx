import { THEMES } from "../data/themes";

type Props = {
  total: number
  current: number
  onSelect: (level: number) => void
  onClose: () => void
  maxUnlocked: number
  currentTheme: any
  onThemeChange: (theme: any) => void
}

function LevelMap({ total, current, onSelect, onClose, maxUnlocked, currentTheme, onThemeChange }: Props) {

  const levels = Array.from({ length: total }, (_, i) => i)

  return (

    <div className="level-map" onClick={(event) => event.stopPropagation()}>

      <div className="level-map-header">
        <h2>Select Level</h2>
        <button className="close-map-btn" onClick={onClose} aria-label="Close level map">
          ×
        </button>
      </div>

      <p className="level-map-note">
        Tap a previous or current level to review it. Future levels unlock after you finish the current round.
      </p>

      <div className="theme-selector">
        <h3>Theme</h3>
        <div className="theme-buttons">
          {THEMES.filter(t => t.unlockLevel <= maxUnlocked).map(theme => (
            <button
              key={theme.id}
              className={`theme-btn ${currentTheme.id === theme.id ? 'active' : ''}`}
              onClick={() => onThemeChange(theme)}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div className="level-grid">

        {levels.map(l => {
          const locked = l > maxUnlocked
          const isHighest = l === maxUnlocked
          return (
            <button
              key={l}
              className={`level-node ${l === current ? "active" : ""} ${locked ? "locked" : ""} ${isHighest ? "highest" : ""}`}
              onClick={() => !locked && onSelect(l)}
              disabled={locked}
              aria-disabled={locked}
            >
              {l + 1}
            </button>
          )
        })}

      </div>

    </div>

  )

}

export default LevelMap