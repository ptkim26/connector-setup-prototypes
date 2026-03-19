import { useState, useCallback, lazy, Suspense } from 'react'
import { SCENARIOS } from './data'
import './App.css'

const DirectionA = lazy(() => import('./directions/DirectionA'))
const DirectionB = lazy(() => import('./directions/DirectionB'))
const DirectionC = lazy(() => import('./directions/DirectionC'))
const DirectionD = lazy(() => import('./directions/DirectionD'))

const DIRECTIONS = [
  {
    id: 'a',
    label: 'A',
    name: 'The Collapsing Flow',
    argument: 'A variable-length wizard that reshapes itself. Managed = 3 steps. Flexible = 4. Simple = 2. The flow is a living thing.',
    scenarios: SCENARIOS,
  },
  {
    id: 'b',
    label: 'B',
    name: 'The Data Contract Surface',
    argument: 'No wizard. One persistent surface IS the data contract. Connection, data plan, products, and lifecycle live on one screen.',
    scenarios: SCENARIOS,
  },
  {
    id: 'c',
    label: 'C',
    name: 'The Intent-Driven Concierge',
    argument: 'Starts with WHY, not WHAT. The system adapts to intent + persona. Delegation is a first-class path.',
    scenarios: [...SCENARIOS, { id: 'delegation', label: 'Delegation', sublabel: 'Engineer completes setup', origin: 'delegated', connector: 'aws', existing: false }],
  },
  {
    id: 'd',
    label: 'D',
    name: 'The Invisible Setup',
    argument: 'Setup doesn\'t exist as its own page. You\'re enabling a product feature; connecting AWS is just a step within that. The system does visible work while you watch.',
    scenarios: SCENARIOS,
  },
]

function DirectionComponent({ directionId, scenario, onReset }) {
  switch (directionId) {
    case 'a': return <DirectionA scenario={scenario} onReset={onReset} />
    case 'b': return <DirectionB scenario={scenario} onReset={onReset} />
    case 'c': return <DirectionC scenario={scenario} onReset={onReset} />
    case 'd': return <DirectionD scenario={scenario} onReset={onReset} />
    default: return null
  }
}

export default function App() {
  const [directionId, setDirectionId] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [hudCollapsed, setHudCollapsed] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const direction = DIRECTIONS.find(d => d.id === directionId)

  const handleReset = useCallback(() => {
    setScenario(null)
  }, [])

  // Landing page
  if (!directionId) {
    return (
      <div className="landing">
        <div className="landing-inner">
          <p className="landing-pre">Rippling</p>
          <h1 className="landing-title">Connector Setup Flow</h1>
          <p className="landing-subtitle">
            Four structurally divergent approaches to the same problem: a single, reusable
            setup flow that works for any data-powered integration.
          </p>
          <p className="landing-instruction">Pick a direction to explore.</p>
          <div className="landing-grid">
            {DIRECTIONS.map((d, i) => (
              <button key={d.id} className="landing-card" onClick={() => setDirectionId(d.id)}>
                <span className="landing-card-letter">{d.label}</span>
                <span className="landing-card-name">{d.name}</span>
                <span className="landing-card-arg">{d.argument}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // HUD + Direction
  return (
    <div className="prototype">
      {/* HUD */}
      <div className={`hud ${hudCollapsed ? 'collapsed' : ''}`}>
        <div className="hud-bar">
          <div className="hud-left">
            <button className="hud-home" onClick={() => { setDirectionId(null); setScenario(null) }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l6-6 6 6M4 6.5V13h3v-3h2v3h3V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="hud-direction-tabs">
              {DIRECTIONS.map(d => (
                <button
                  key={d.id}
                  className={`hud-tab ${d.id === directionId ? 'active' : ''}`}
                  onClick={() => { setDirectionId(d.id); setScenario(null) }}
                >
                  <span className="hud-tab-letter">{d.label}</span>
                  <span className="hud-tab-name">{d.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="hud-right">
            <button className="hud-info-btn" onClick={() => setShowInfo(!showInfo)}>
              {showInfo ? 'Hide info' : 'What to notice'}
            </button>
            <button className="hud-collapse" onClick={() => setHudCollapsed(!hudCollapsed)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d={hudCollapsed ? "M3 5l4 4 4-4" : "M3 9l4-4 4 4"} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {!hudCollapsed && (
          <>
            {showInfo && direction && (
              <div className="hud-info">
                <strong>Direction {direction.label}: {direction.name}</strong>
                <span>{direction.argument}</span>
              </div>
            )}
            {!scenario && (
              <div className="hud-scenarios">
                <span className="hud-scenarios-label">Scenarios:</span>
                {direction?.scenarios.map(s => (
                  <button key={s.id} className="hud-scenario-btn" onClick={() => setScenario(s)}>
                    <span className="hud-scenario-label">{s.label}</span>
                    <span className="hud-scenario-sub">{s.sublabel}</span>
                  </button>
                ))}
              </div>
            )}
            {scenario && (
              <div className="hud-active-scenario">
                <span className="hud-active-label">
                  {scenario.label}: {scenario.sublabel}
                </span>
                <button className="hud-reset-btn" onClick={handleReset}>Change scenario</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className={`prototype-content ${hudCollapsed ? 'hud-collapsed' : ''}`}>
        {!scenario ? (
          <div className="scenario-chooser">
            <h2 className="sc-title">Direction {direction?.label}: {direction?.name}</h2>
            <p className="sc-desc">{direction?.argument}</p>
            <p className="sc-pick">Choose a scenario to click through:</p>
            <div className="sc-grid">
              {direction?.scenarios.map((s, i) => (
                <button key={s.id} className="sc-card" onClick={() => setScenario(s)}>
                  <span className="sc-card-num">Scenario {i + 1}</span>
                  <span className="sc-card-label">{s.label}</span>
                  <span className="sc-card-sub">{s.sublabel}</span>
                  {s.existing && <span className="sc-card-badge">Already Connected</span>}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <DirectionComponent directionId={directionId} scenario={scenario} onReset={handleReset} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
