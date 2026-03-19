import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONNECTORS, PRODUCTS, CROSS_PRODUCTS, CHECKS, EASE_OUT } from '../data'
import './DirectionD.css'

/*
  Direction D: The Invisible Setup

  The connector setup doesn't exist as a standalone page. You're enabling a product
  feature — connecting AWS is just a step within that. The system does visible work
  while you watch: CloudFormation deployment messages scroll, resources appear by
  type with counts, compliance checks start appearing.

  The header says "Rippling / Automated Compliance" — not "AWS Connection."
*/

const FEED_MESSAGES = [
  { msg: 'Creating CloudFormation stack...', type: 'info' },
  { msg: 'Provisioning IAM role: RipplingSecurityAuditRole', type: 'info' },
  { msg: 'Attaching SecurityAudit managed policy', type: 'info' },
  { msg: 'Configuring trust relationship', type: 'info' },
  { msg: 'Stack CREATE_COMPLETE', type: 'success' },
  { msg: 'Validating IAM role access...', type: 'info' },
  { msg: 'Role validated. Read-only access confirmed.', type: 'success' },
  { msg: 'Discovering resources in us-east-1...', type: 'info' },
  { msg: '47 EC2 instances, 23 S3 buckets, 156 IAM entities', type: 'data' },
  { msg: 'Discovering resources in us-west-2...', type: 'info' },
  { msg: '18 EC2 instances, 12 RDS databases, 34 Lambda functions', type: 'data' },
  { msg: 'Discovery complete. 312 resources across 2 regions.', type: 'success' },
]

const DISCOVERED_RESOURCES = [
  { type: 'EC2', count: 65, color: 'oklch(55% 0.14 30)' },
  { type: 'S3', count: 23, color: 'oklch(55% 0.14 155)' },
  { type: 'IAM', count: 156, color: 'oklch(55% 0.14 260)' },
  { type: 'RDS', count: 12, color: 'oklch(55% 0.14 200)' },
  { type: 'Lambda', count: 34, color: 'oklch(60% 0.14 80)' },
  { type: 'VPC', count: 8, color: 'oklch(55% 0.14 310)' },
  { type: 'CloudTrail', count: 2, color: 'oklch(50% 0.12 180)' },
  { type: 'DynamoDB', count: 12, color: 'oklch(55% 0.14 50)' },
]

const E = EASE_OUT

// ─── Product Context Bar ──────────────────────────────────────────────────────

function ProductBar({ productName, connectorName, onBack }) {
  return (
    <div className="d-product-bar">
      <button className="d-product-back" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="d-product-brand">
        <span className="d-brand">Rippling</span>
        <span className="d-brand-sep">/</span>
        <span className="d-product-name">{productName}</span>
      </div>
      {connectorName && (
        <span className="d-connector-chip">{connectorName}</span>
      )}
    </div>
  )
}

// ─── Phase Indicator ──────────────────────────────────────────────────────────

function PhaseIndicator({ phases, current }) {
  return (
    <div className="d-phases">
      {phases.map((p, i) => (
        <div key={p} className={`d-phase ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}>
          <div className="d-phase-bar" />
        </div>
      ))}
    </div>
  )
}

// ─── AC Flow: "Enable Compliance Monitoring" ──────────────────────────────────

function ACFlow({ onReset }) {
  const [phase, setPhase] = useState('splash') // splash | grant | deploying | discovery | confirm | live
  const [feedIdx, setFeedIdx] = useState(0)
  const [resourcesVisible, setResourcesVisible] = useState(0)
  const [productsLit, setProductsLit] = useState(0)
  const [checksVisible, setChecksVisible] = useState(0)

  const phases = ['splash', 'grant', 'deploying', 'discovery', 'confirm', 'live']
  const currentPhaseIdx = phases.indexOf(phase)

  const handleDeploy = useCallback(() => {
    setPhase('deploying')
    FEED_MESSAGES.forEach((_, i) => {
      setTimeout(() => setFeedIdx(i + 1), 400 + i * 300)
    })
    setTimeout(() => {
      setPhase('discovery')
    }, 400 + FEED_MESSAGES.length * 300 + 500)
  }, [])

  useEffect(() => {
    if (phase === 'discovery') {
      DISCOVERED_RESOURCES.forEach((_, i) => {
        setTimeout(() => setResourcesVisible(i + 1), 200 + i * 250)
      })
      setTimeout(() => setPhase('confirm'), 200 + DISCOVERED_RESOURCES.length * 250 + 600)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'live') {
      [0, 1, 2, 3].forEach(i => {
        setTimeout(() => setProductsLit(i + 1), 300 + i * 300)
      })
      CHECKS.forEach((_, i) => {
        setTimeout(() => setChecksVisible(i + 1), 800 + i * 350)
      })
    }
  }, [phase])

  const crossProducts = [
    { name: 'Automated Compliance', stat: '14 checks running', primary: true },
    { name: 'Universal Search', stat: '312 resources indexed' },
    { name: 'Reports', stat: '7 infrastructure templates' },
    { name: 'Workflows', stat: '3 automations enabled' },
  ]

  return (
    <div className="d-flow-wrap">
      <ProductBar productName="Automated Compliance" connectorName={phase !== 'splash' ? 'AWS' : null} onBack={onReset} />
      <PhaseIndicator phases={phases} current={currentPhaseIdx} />

      <div className="d-panel">
        <AnimatePresence mode="wait">
          {/* Splash: product feature framing */}
          {phase === 'splash' && (
            <motion.div key="splash" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: E }}>
              <div className="d-feature-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4l10 5.5v8.5c0 6-4.5 10.5-10 12.5C10.5 28.5 6 24 6 18V9.5L16 4z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                  <path d="M12 17l3 3 5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="d-heading">Enable compliance monitoring</h1>
              <p className="d-subtext">
                Continuously monitor your AWS infrastructure against CIS benchmarks.
                14 security checks run every 6 hours. We'll need read-only access to your AWS account.
              </p>
              <div className="d-data-note">
                <span className="d-data-note-title">Data managed by Automated Compliance</span>
                <span className="d-data-note-body">
                  This product imports specific AWS configuration data — IAM, S3, EC2, VPC, CloudTrail,
                  RDS, Lambda, DynamoDB. You don't choose what to import; the data contract
                  is defined by the compliance checks. This data is locked and cannot be modified.
                </span>
              </div>
              <button className="d-btn" onClick={() => setPhase('grant')}>Grant AWS access</button>
            </motion.div>
          )}

          {/* Grant: permission transparency */}
          {phase === 'grant' && (
            <motion.div key="grant" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: E }}>
              <h1 className="d-heading">Grant read-only access</h1>
              <p className="d-subtext">
                One click deploys a CloudFormation stack. Here's exactly what it does:
              </p>
              <div className="d-perm-list">
                {[
                  { what: 'Creates IAM role', detail: 'RipplingSecurityAuditRole with trust policy limited to Rippling' },
                  { what: 'Attaches SecurityAudit', detail: 'AWS-managed read-only policy. Views configuration, cannot modify.' },
                  { what: 'Reads infrastructure metadata', detail: 'EC2, S3, IAM, VPC, RDS, Lambda, DynamoDB, CloudTrail, CloudWatch' },
                ].map((p, i) => (
                  <div key={i} className="d-perm-item">
                    <span className="d-perm-icon ok">R</span>
                    <div>
                      <span className="d-perm-what">{p.what}</span>
                      <span className="d-perm-detail">{p.detail}</span>
                    </div>
                  </div>
                ))}
                <div className="d-perm-item deny">
                  <span className="d-perm-icon no">&#x2715;</span>
                  <div>
                    <span className="d-perm-what">Cannot</span>
                    <span className="d-perm-detail">Modify resources, access stored data (S3 objects, database contents), create/delete infrastructure, or change IAM policies.</span>
                  </div>
                </div>
              </div>
              <button className="d-btn" onClick={handleDeploy}>Deploy CloudFormation stack</button>
              <div className="d-delegate-banner">
                Don't have AWS admin access? <button className="d-delegate-link">Send setup to your engineer</button>
              </div>
            </motion.div>
          )}

          {/* Deploying: live terminal feed */}
          {phase === 'deploying' && (
            <motion.div key="deploying" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: E }}>
              <h1 className="d-heading">Setting up compliance monitoring</h1>
              <p className="d-subtext">
                Connecting to AWS, discovering resources, preparing your first scan.
              </p>
              <div className="d-terminal">
                {FEED_MESSAGES.slice(0, feedIdx).map((m, i) => (
                  <motion.div key={i} className={`d-term-line ${m.type}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
                    <span className={`d-term-dot ${m.type}`} />
                    <span className="d-term-msg">{m.msg}</span>
                  </motion.div>
                ))}
                {feedIdx < FEED_MESSAGES.length && (
                  <div className="d-term-line">
                    <span className="d-term-spinner" />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Discovery: resources appearing */}
          {phase === 'discovery' && (
            <motion.div key="discovery" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: E }}>
              <h1 className="d-heading">Resources discovered</h1>
              <p className="d-subtext">Found across 2 regions (us-east-1, us-west-2)</p>
              <div className="d-resource-grid">
                {DISCOVERED_RESOURCES.slice(0, resourcesVisible).map((r, i) => (
                  <motion.div key={r.type} className="d-resource-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, ease: E }}>
                    <span className="d-resource-type" style={{ background: r.color }}>{r.type}</span>
                    <span className="d-resource-count">{r.count}</span>
                  </motion.div>
                ))}
              </div>
              {resourcesVisible >= DISCOVERED_RESOURCES.length && (
                <motion.div className="d-resource-total" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  312 resources discovered
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Confirm: summary before activation */}
          {phase === 'confirm' && (
            <motion.div key="confirm" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: E }}>
              <h1 className="d-heading">Ready to activate</h1>
              <p className="d-subtext">312 resources found. Here's what this connection powers:</p>
              <div className="d-power-banner">
                <span className="d-power-label">This data powers 4 products</span>
                <div className="d-power-products">
                  {['Automated Compliance', 'Universal Search', 'Reports', 'Workflows'].map(p => (
                    <span key={p} className="d-power-pill">{p}</span>
                  ))}
                </div>
              </div>
              <div className="d-confirm-detail">
                <div className="d-confirm-row">
                  <span className="d-confirm-label">Connection</span>
                  <span className="d-confirm-value">AWS (read-only via SecurityAudit)</span>
                </div>
                <div className="d-confirm-row">
                  <span className="d-confirm-label">Resources</span>
                  <span className="d-confirm-value">312 across 2 regions</span>
                </div>
                <div className="d-confirm-row">
                  <span className="d-confirm-label">Scan frequency</span>
                  <span className="d-confirm-value">Every 6 hours</span>
                </div>
              </div>
              <details className="d-advanced">
                <summary>Advanced: customize regions and resource types</summary>
                <p className="d-advanced-note">
                  All regions and resource types are included by default. Excluding regions means compliance checks won't cover them.
                </p>
              </details>
              <button className="d-btn" onClick={() => setPhase('live')}>Activate connection</button>
            </motion.div>
          )}

          {/* Live: connection active, products lighting up */}
          {phase === 'live' && (
            <motion.div key="live" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: E }}>
              <motion.div className="d-success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4, ease: E }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 7L23 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
              <h1 className="d-heading" style={{ textAlign: 'center' }}>AWS is connected</h1>
              <p className="d-subtext" style={{ textAlign: 'center' }}>
                312 resources discovered. Compliance monitoring active.
              </p>

              <div className="d-live-products">
                {crossProducts.slice(0, productsLit).map((p) => (
                  <motion.div key={p.name} className={`d-live-product ${p.primary ? 'primary' : ''}`}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: E }}>
                    <span className="d-live-dot" />
                    <span className="d-live-name">{p.name}</span>
                    <span className="d-live-stat">{p.stat}</span>
                  </motion.div>
                ))}
              </div>

              {checksVisible > 0 && (
                <div className="d-live-checks">
                  <span className="d-live-checks-title">First compliance checks</span>
                  {CHECKS.slice(0, checksVisible).map((c, i) => (
                    <motion.div key={c} className="d-live-check" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                      <span className={`d-chk-dot ${i % 3 === 0 ? 'fail' : 'pass'}`}>{i % 3 === 0 ? '\u2715' : '\u2713'}</span>
                      <span>{c}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="d-live-actions">
                <button className="d-btn">Go to Automated Compliance</button>
                <button className="d-btn-ghost" onClick={onReset}>Try another scenario</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Data Cloud Flow ──────────────────────────────────────────────────────────

function DCFlow({ scenario, onReset }) {
  const isReuse = scenario.existing
  const existingCats = scenario.existingCategories || []
  const conn = CONNECTORS.aws
  const [phase, setPhase] = useState(isReuse ? 'select' : 'intro') // intro | connecting | select | importing | done
  const [selections, setSelections] = useState(() => {
    const m = {}
    conn.categories.forEach(c => { m[c.id] = existingCats.includes(c.id) })
    return m
  })
  const [pct, setPct] = useState(0)

  const toggle = id => { if (!existingCats.includes(id)) setSelections(p => ({ ...p, [id]: !p[id] })) }
  const selectedCount = Object.values(selections).filter(Boolean).length

  useEffect(() => {
    if (phase === 'importing') {
      const t = setInterval(() => setPct(p => { if (p >= 100) { clearInterval(t); setPhase('done'); return 100 } return p + 2 }), 50)
      return () => clearInterval(t)
    }
  }, [phase])

  const phases = isReuse ? ['select', 'importing', 'done'] : ['intro', 'connecting', 'select', 'importing', 'done']
  const phaseIdx = phases.indexOf(phase)

  return (
    <div className="d-flow-wrap">
      <ProductBar productName="Data Cloud" connectorName="AWS" onBack={onReset} />
      <PhaseIndicator phases={phases} current={phaseIdx} />

      <div className="d-panel">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: E }}>
              <h1 className="d-heading">Import AWS infrastructure data</h1>
              <p className="d-subtext">
                Connect your AWS account, then choose which resources to import
                for reporting and automation.
              </p>
              <button className="d-btn" onClick={() => { setPhase('connecting'); setTimeout(() => setPhase('select'), 2000) }}>
                Connect AWS account
              </button>
              <span className="d-hint">Creates a read-only IAM role via CloudFormation</span>
            </motion.div>
          )}

          {phase === 'connecting' && (
            <motion.div key="connecting" className="d-content center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="d-spinner" />
              <p className="d-spinner-text">Connecting to AWS...</p>
              <p className="d-spinner-sub">Deploying CloudFormation stack and discovering resources</p>
            </motion.div>
          )}

          {phase === 'select' && (
            <motion.div key="select" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: E }}>
              {isReuse && (
                <div className="d-reuse-banner">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 8a6.5 6.5 0 0112.5-2.3M14.5 8a6.5 6.5 0 01-12.5 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M14.5 2.5v3.2h-3.2M1.5 13.5v-3.2h3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div><strong>AWS is already connected</strong> via Automated Compliance. No re-authentication needed.</div>
                </div>
              )}
              <h1 className="d-heading">{isReuse ? 'Import additional data' : 'Choose what to import'}</h1>
              <p className="d-subtext">
                {isReuse
                  ? 'Resources used by Automated Compliance are already syncing. Choose additional data for reporting.'
                  : 'Select the resource categories to bring into your Object Graph.'}
              </p>
              <div className="d-select-list">
                {conn.categories.map(cat => {
                  const isExisting = existingCats.includes(cat.id)
                  const isOn = selections[cat.id]
                  return (
                    <div key={cat.id} className={`d-select-row ${isOn ? 'on' : ''} ${isExisting ? 'existing' : ''}`} onClick={() => toggle(cat.id)}>
                      <span className={`d-select-check ${isExisting ? 'locked' : ''} ${isOn ? 'on' : ''}`}>
                        {(isExisting || isOn) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </span>
                      <div className="d-select-info">
                        <span className="d-select-name">
                          {cat.name}
                          {isExisting && <span className="d-select-locked">Locked by AC</span>}
                        </span>
                        <span className="d-select-desc">{cat.description}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button className="d-btn" onClick={() => setPhase('importing')} disabled={selectedCount === 0}>
                Import {selectedCount} categories
              </button>
            </motion.div>
          )}

          {phase === 'importing' && (
            <motion.div key="importing" className="d-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="d-heading">Importing data</h1>
              <div className="d-import-progress">
                <div className="d-import-head"><span>Importing...</span><span className="d-import-pct">{pct}%</span></div>
                <div className="d-import-track"><div className="d-import-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" className="d-content center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E }}>
              <motion.div className="d-success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4, ease: E }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 7L23 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
              <h1 className="d-heading">Data imported</h1>
              <p className="d-subtext">Your AWS data is now in the Object Graph. Build reports, create automations, query anything.</p>
              <div className="d-live-actions">
                <button className="d-btn">Go to Data Cloud</button>
                <button className="d-btn-ghost" onClick={onReset}>Try another scenario</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Checkr Flow ──────────────────────────────────────────────────────────────

function CheckrFlow({ onReset }) {
  const [phase, setPhase] = useState('input') // input | validating | done
  const [apiKey, setApiKey] = useState('')

  return (
    <div className="d-flow-wrap">
      <ProductBar productName="Background Checks" connectorName="Checkr" onBack={onReset} />

      <div className="d-panel">
        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div key="input" className="d-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: E }}>
              <h1 className="d-heading">Connect Checkr</h1>
              <p className="d-subtext">Enter your API key. That's it.</p>
              <fieldset className="d-field" disabled={phase !== 'input'}>
                <label className="d-flabel">API Key</label>
                <input className="d-finput" type="text" placeholder="ck_live_..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
                <span className="d-fhint">Checkr Dashboard &rarr; Developer Settings &rarr; API Keys</span>
              </fieldset>
              <div className="d-simple-note">
                No IAM roles. No CloudFormation. No external console. Just an API key.
              </div>
              <button className="d-btn" onClick={() => { setPhase('validating'); setTimeout(() => setPhase('done'), 1200) }} disabled={!apiKey.trim()}>
                Connect
              </button>
            </motion.div>
          )}

          {phase === 'validating' && (
            <motion.div key="validating" className="d-content center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="d-spinner" />
              <p className="d-spinner-text">Validating...</p>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" className="d-content center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E }}>
              <motion.div className="d-success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4, ease: E }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 7L23 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
              <h1 className="d-heading">Checkr connected</h1>
              <p className="d-subtext">Background check data is syncing. That was about 15 seconds.</p>
              <div className="d-live-actions">
                <button className="d-btn">Go to Background Checks</button>
                <button className="d-btn-ghost" onClick={onReset}>Try another scenario</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Main Router ──────────────────────────────────────────────────────────────

export default function DirectionD({ scenario, onReset }) {
  const isAC = scenario.origin === 'automated_compliance'
  const isDC = scenario.origin === 'data_cloud'
  const isCheckr = scenario.connector === 'checkr'

  if (isCheckr) return <CheckrFlow onReset={onReset} />
  if (isDC) return <DCFlow scenario={scenario} onReset={onReset} />
  return <ACFlow onReset={onReset} />
}
