import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONNECTORS, PRODUCTS_LIST as PRODUCTS, CROSS_PRODUCTS, CHECKS, EASE_OUT } from '../data'
import './DirectionB.css'

// ─── Connection Inline Panel ──────────────────────────────────────────────────

function ConnectionPanel({ connector, isConnected, onConnect }) {
  const conn = CONNECTORS[connector]
  const [phase, setPhase] = useState(isConnected ? 'done' : 'idle')
  const [arn, setArn] = useState('')
  const [apiKey, setApiKey] = useState('')

  useEffect(() => { if (isConnected) setPhase('done') }, [isConnected])

  const validate = () => {
    setPhase('validating')
    setTimeout(() => {
      setPhase('done')
      onConnect()
    }, 1500)
  }

  if (phase === 'done') {
    return (
      <motion.div className="conn-panel connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="conn-status">
          <span className="conn-dot live" />
          <span className="conn-label">Connected</span>
          <span className="conn-meta">Read-only access &middot; All regions</span>
        </div>
      </motion.div>
    )
  }

  if (conn.authType === 'api_key') {
    return (
      <motion.div className="conn-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="conn-header">
          <span className="conn-title">Connect {conn.shortName}</span>
          <span className="conn-subtitle">Paste your API key for read-only access</span>
        </div>
        <fieldset className="conn-field" disabled={phase === 'validating'}>
          <label className="conn-flabel">API Key</label>
          <input className="conn-input" placeholder="sk_live_..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </fieldset>
        <div className="conn-perms">
          <div className="conn-perm"><span className="cp-icon ok">R</span> Read check results & candidates</div>
          <div className="conn-perm"><span className="cp-icon no">&#x2715;</span> Cannot modify data or billing</div>
        </div>
        <button className="b-btn" onClick={validate} disabled={!apiKey.trim() || phase === 'validating'}>
          {phase === 'validating' ? 'Validating...' : 'Connect'}
        </button>
      </motion.div>
    )
  }

  // CloudFormation
  return (
    <motion.div className="conn-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="conn-header">
        <span className="conn-title">Connect {conn.shortName}</span>
        <span className="conn-subtitle">Deploy a CloudFormation stack, then paste the Role ARN</span>
      </div>
      {phase === 'idle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="conn-perms">
            <div className="conn-perm"><span className="cp-icon ok">R</span> IAM role with <strong>SecurityAudit</strong> (read-only)</div>
            <div className="conn-perm"><span className="cp-icon ok">R</span> Trust policy scoped to Rippling</div>
            <div className="conn-perm"><span className="cp-icon no">&#x2715;</span> Cannot modify any resources</div>
          </div>
          <button className="b-btn" onClick={() => setPhase('arn')}>Deploy Stack in AWS Console</button>
          <button className="b-btn-ghost" onClick={() => setPhase('arn')}>Set up manually</button>
        </motion.div>
      )}
      {(phase === 'arn' || phase === 'validating') && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="conn-chip ok">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Stack deployment initiated
          </div>
          <fieldset className="conn-field" disabled={phase === 'validating'}>
            <label className="conn-flabel">Role ARN</label>
            <input className="conn-input" placeholder="arn:aws:iam::123456789012:role/RipplingReadOnly" value={arn} onChange={e => setArn(e.target.value)} />
          </fieldset>
          <button className="b-btn" onClick={validate} disabled={!arn.trim() || phase === 'validating'}>
            {phase === 'validating' ? 'Validating...' : 'Validate & Connect'}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Product Dependency Row ───────────────────────────────────────────────────

function ProductRow({ product, connectorId, categories }) {
  const req = product.requiredCategories?.[connectorId] || []
  if (req.length === 0) return null
  const catNames = req.map(id => categories.find(c => c.id === id)?.name).filter(Boolean)

  return (
    <div className="prod-row">
      <span className="prod-name">{product.name}</span>
      <div className="prod-cats">
        {catNames.map(n => (
          <span key={n} className="prod-cat-chip">{n}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Data Contract Surface ────────────────────────────────────────────────────

export default function DirectionB({ scenario, onReset }) {
  const conn = CONNECTORS[scenario.connector]
  const originProduct = PRODUCTS.find(p => p.id === scenario.origin) || { name: 'Data Cloud', requiredCategories: {} }
  const isManaged = (originProduct.requiredCategories?.[scenario.connector] || []).length > 0

  // All products that use this connector
  const relevantProducts = PRODUCTS.filter(p => {
    const req = p.requiredCategories?.[scenario.connector] || []
    return req.length > 0
  })

  // Build the data contract
  const allRequired = new Set()
  relevantProducts.forEach(p => {
    ;(p.requiredCategories?.[scenario.connector] || []).forEach(id => allRequired.add(id))
  })

  const [connected, setConnected] = useState(scenario.existing)
  const [selections, setSelections] = useState(() => {
    const m = {}
    conn.categories.forEach(c => {
      const isReq = allRequired.has(c.id)
      const isExisting = (scenario.existingCategories || []).includes(c.id)
      m[c.id] = isReq || isExisting
    })
    return m
  })
  const [expandedCat, setExpandedCat] = useState(null)
  const [importing, setImporting] = useState(scenario.existing ? 'partial' : 'none') // none | starting | importing | done | partial
  const [importPct, setImportPct] = useState(scenario.existing ? 100 : 0)
  const [showChecks, setShowChecks] = useState(scenario.existing)
  const [visibleChecks, setVisibleChecks] = useState(scenario.existing ? 5 : 0)

  const toggle = (id) => {
    if (allRequired.has(id)) return
    setSelections(p => ({ ...p, [id]: !p[id] }))
  }

  const startImport = () => {
    setImporting('starting')
    setTimeout(() => setImporting('importing'), 600)
  }

  useEffect(() => {
    if (importing === 'importing') {
      const t = setInterval(() => {
        setImportPct(p => {
          if (p >= 100) {
            clearInterval(t)
            setImporting('done')
            return 100
          }
          return p + 2
        })
      }, 50)
      return () => clearInterval(t)
    }
  }, [importing])

  useEffect(() => {
    if (importPct >= 30 && scenario.origin === 'automated_compliance') setShowChecks(true)
  }, [importPct, scenario.origin])

  useEffect(() => {
    if (showChecks && visibleChecks < CHECKS.length) {
      const t = setTimeout(() => setVisibleChecks(v => v + 1), 400)
      return () => clearTimeout(t)
    }
  }, [showChecks, visibleChecks])

  const catRequiredBy = (catId) => {
    return relevantProducts.filter(p => (p.requiredCategories?.[scenario.connector] || []).includes(catId))
  }

  const selectedCount = Object.values(selections).filter(Boolean).length

  return (
    <div className="surface">
      <header className="surface-header">
        <button className="b-back" onClick={onReset}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Scenarios
        </button>
        <h1 className="surface-title">{conn.shortName} Connection</h1>
        <span className="surface-meta">{originProduct.name}</span>
      </header>

      <div className="surface-body">
        {/* Left: Data Contract */}
        <div className="contract-col">
          {/* Connection Status / Inline Auth */}
          <section className="section">
            <div className="section-head">
              <h2 className="section-title">Connection</h2>
              {connected && <span className="live-dot"><span className="live-inner" /> Live</span>}
            </div>
            <ConnectionPanel connector={scenario.connector} isConnected={connected} onConnect={() => { setConnected(true); if (isManaged) startImport() }} />
          </section>

          {/* Data Contract */}
          <section className="section">
            <div className="section-head">
              <h2 className="section-title">Data Contract</h2>
              {isManaged && <span className="managed-label">Managed by {originProduct.name}</span>}
            </div>

            {isManaged && (
              <p className="section-desc">
                {originProduct.name} defines which data is imported. Required categories are locked.
                {!isManaged && ' Select the data you want to import.'}
              </p>
            )}
            {!isManaged && !scenario.existing && (
              <p className="section-desc">Select the data categories to import from {conn.shortName}.</p>
            )}
            {scenario.existing && (
              <div className="reuse-info">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 8a6.5 6.5 0 0112.5-2.3M14.5 8a6.5 6.5 0 01-12.5 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M1.5 13.5v-3.2h3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Already connected for {scenario.existingProduct}. Add more data below.
              </div>
            )}

            <div className="contract-list">
              {conn.categories.map(cat => {
                const reqProds = catRequiredBy(cat.id)
                const isLocked = reqProds.length > 0
                const isExisting = (scenario.existingCategories || []).includes(cat.id)
                const isOn = selections[cat.id]

                return (
                  <div key={cat.id} className={`contract-row ${isLocked ? 'locked' : ''} ${isOn ? 'on' : ''} ${isExisting ? 'existing' : ''}`}>
                    <div className="cr-main" onClick={() => !isLocked && toggle(cat.id)}>
                      <div className="cr-check">
                        {isLocked ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        ) : (
                          <span className={`cr-cbox ${isOn ? 'on' : ''}`}>
                            {isOn && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>
                        )}
                      </div>
                      <div className="cr-info">
                        <div className="cr-name-row">
                          <span className="cr-name">{cat.name}</span>
                          {isExisting && <span className="cr-existing">Flowing</span>}
                          {isLocked && reqProds.map(p => (
                            <span key={p.id} className="cr-req">Required for {p.name}</span>
                          ))}
                        </div>
                        <span className="cr-desc">{cat.description}</span>
                      </div>
                      <button className="cr-expand" onClick={e => { e.stopPropagation(); setExpandedCat(expandedCat === cat.id ? null : cat.id) }}>
                        {cat.objects.length} objects
                        <motion.span animate={{ rotate: expandedCat === cat.id ? 180 : 0 }} style={{ display: 'inline-flex', marginLeft: 3 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </motion.span>
                      </button>
                    </div>
                    <AnimatePresence>
                      {expandedCat === cat.id && (
                        <motion.div className="cr-objects" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
                          {cat.objects.map(o => (
                            <div key={o.id} className="cr-obj">
                              <span>{o.name}</span>
                              <span className="cr-obj-f">{o.fields} fields</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {connected && (importing === 'none' || importing === 'partial') && !isManaged && (
              <button className="b-btn" onClick={startImport} disabled={selectedCount === 0} style={{ marginTop: 16 }}>
                {scenario.existing ? `Import ${selectedCount} categories` : `Start Import (${selectedCount} categories)`}
              </button>
            )}
          </section>
        </div>

        {/* Right: Products & Status */}
        <div className="status-col">
          {/* Product Dependencies */}
          <section className="section">
            <h2 className="section-title">Products using this connection</h2>
            <div className="prod-list">
              {relevantProducts.map(p => (
                <ProductRow key={p.id} product={p} connectorId={scenario.connector} categories={conn.categories} />
              ))}
              {PRODUCTS.filter(p => !p.requiredCategories?.[scenario.connector]?.length && p.id !== 'background_checks').map(p => (
                <div key={p.id} className="prod-row optional-prod">
                  <span className="prod-name">{p.name}</span>
                  <span className="prod-optional">Available if data selected</span>
                </div>
              ))}
            </div>
          </section>

          {/* Import Status */}
          {(importing !== 'none' || scenario.existing) && (
            <section className="section">
              <h2 className="section-title">Import Status</h2>
              {(importing === 'importing' || importing === 'starting') && (
                <div className="import-block">
                  <div className="import-header">
                    <span>Importing...</span>
                    <span className="import-pct">{importPct}%</span>
                  </div>
                  <div className="import-track"><div className="import-fill" style={{ width: `${importPct}%` }} /></div>
                  {importPct >= 15 && (
                    <div className="import-items">
                      {conn.id === 'aws' && <><span>142 IAM users</span><span>38 S3 buckets</span><span>12 CloudTrail trails</span></>}
                      {conn.id === 'checkr' && <><span>847 checks</span><span>1,204 candidates</span></>}
                    </div>
                  )}
                </div>
              )}
              {(importing === 'done' || importing === 'partial' || scenario.existing) && (
                <div className="import-block done">
                  <div className="import-header">
                    <span className="import-live"><span className="live-inner" /> Data flowing</span>
                    <span className="import-pct">100%</span>
                  </div>
                  <div className="import-items">
                    {conn.id === 'aws' && <><span>142 IAM users synced</span><span>38 S3 buckets synced</span><span>12 CloudTrail trails synced</span></>}
                    {conn.id === 'checkr' && <><span>847 checks synced</span><span>1,204 candidates synced</span></>}
                  </div>
                  <span className="import-ts">Last sync: just now</span>
                </div>
              )}
            </section>
          )}

          {/* First Value: Compliance Checks */}
          {showChecks && (
            <motion.section className="section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="section-title">Compliance checks</h2>
              <div className="checks-block">
                {CHECKS.slice(0, visibleChecks).map((c, i) => (
                  <motion.div key={c} className="chk" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                    <span className={`chk-dot ${i % 3 === 0 ? 'fail' : 'pass'}`}>{i % 3 === 0 ? '\u2715' : '\u2713'}</span>
                    <span>{c}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Checkr value */}
          {conn.id === 'checkr' && (importing === 'done' || scenario.existing) && (
            <motion.section className="section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="section-title">Data available</h2>
              <div className="checks-block">
                <div className="chk"><span className="chk-dot pass">{'\u2713'}</span>847 completed checks synced</div>
                <div className="chk"><span className="chk-dot pass">{'\u2713'}</span>1,204 candidate records linked to employees</div>
              </div>
            </motion.section>
          )}

          <section className="section">
            <button className="b-btn-ghost" onClick={onReset}>Try another scenario</button>
          </section>
        </div>
      </div>
    </div>
  )
}
