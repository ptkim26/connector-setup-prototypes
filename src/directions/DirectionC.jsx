import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONNECTORS, PRODUCTS, CROSS_PRODUCTS, CHECKS, EASE_OUT } from '../data'
import './DirectionC.css'

// ─── Intents ──────────────────────────────────────────────────────────────────

const INTENTS = [
  { id: 'compliance', label: 'Monitor our cloud compliance', sublabel: 'Check AWS against security frameworks', connector: 'aws', origin: 'automated_compliance', managed: true },
  { id: 'import', label: 'Import AWS data for reporting', sublabel: 'Bring cloud data into Rippling', connector: 'aws', origin: 'data_cloud', managed: false },
  { id: 'background', label: 'Run background checks', sublabel: 'Connect your Checkr account', connector: 'checkr', origin: 'background_checks', managed: true },
  { id: 'delegated', label: 'Someone sent me a setup link', sublabel: 'Complete a connection on behalf of someone', connector: 'aws', origin: 'delegated', managed: false },
]

// ─── Intent Selection Screen ──────────────────────────────────────────────────

function IntentScreen({ scenario, onSelectIntent }) {
  const filteredIntents = scenario.intent === 'delegated'
    ? INTENTS.filter(i => i.id === 'delegated')
    : INTENTS.filter(i => i.id !== 'delegated')

  return (
    <motion.div className="c-step" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE_OUT }}>
      <h2 className="c-heading">What brings you here?</h2>
      <p className="c-subtext">We'll adapt the experience based on what you need.</p>
      <div className="intent-grid">
        {filteredIntents.map((intent, i) => (
          <motion.button key={intent.id} className={`intent-card ${intent.id === scenario.intent ? 'suggested' : ''}`} onClick={() => onSelectIntent(intent)}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: EASE_OUT }}>
            <span className="intent-label">{intent.label}</span>
            <span className="intent-sub">{intent.sublabel}</span>
            {intent.id === scenario.intent && <span className="intent-suggested">Suggested</span>}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Delegation Flow ──────────────────────────────────────────────────────────

function DelegationFlow({ onReset }) {
  const [phase, setPhase] = useState('info') // info | connect | done
  const [arn, setArn] = useState('')
  const [validating, setValidating] = useState(false)

  const validate = () => {
    setValidating(true)
    setTimeout(() => {
      setValidating(false)
      setPhase('done')
    }, 1500)
  }

  return (
    <motion.div className="c-step" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE_OUT }}>
      <AnimatePresence mode="wait">
        {phase === 'info' && (
          <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="delegation-header">
              <div className="delegation-from">
                <span className="delegation-from-label">Requested by</span>
                <span className="delegation-from-name">Sarah Chen</span>
                <span className="delegation-from-role">IT Admin at Acme Corp</span>
              </div>
            </div>
            <h2 className="c-heading">Connect Acme's AWS account to Rippling</h2>
            <p className="c-subtext">
              Sarah needs you to create a read-only IAM role so Rippling can monitor your AWS infrastructure for compliance.
              You don't need a Rippling account — just AWS Console access.
            </p>

            <div className="deleg-what">
              <span className="deleg-what-title">What you'll do</span>
              <ol className="deleg-steps">
                <li>Deploy a CloudFormation stack (one click)</li>
                <li>Copy the Role ARN from the output</li>
                <li>Paste it below</li>
              </ol>
            </div>

            <div className="deleg-perms">
              <span className="deleg-perms-title">What Rippling gets</span>
              <div className="deleg-perm"><span className="dp-icon ok">R</span> Read-only access via SecurityAudit policy</div>
              <div className="deleg-perm"><span className="dp-icon no">&#x2715;</span> Cannot modify, create, or delete any resources</div>
            </div>

            <button className="c-btn" onClick={() => setPhase('connect')}>Deploy CloudFormation Stack</button>
            <span className="deleg-time">Takes about 3 minutes</span>
          </motion.div>
        )}

        {phase === 'connect' && (
          <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="c-chip ok">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Stack deployment initiated
            </div>
            <h2 className="c-heading">Paste the Role ARN</h2>
            <p className="c-subtext">Find the Role ARN in the CloudFormation stack's Outputs tab.</p>

            <fieldset className="c-field" disabled={validating}>
              <label className="c-flabel">Role ARN</label>
              <input className="c-input" placeholder="arn:aws:iam::123456789012:role/RipplingReadOnly" value={arn} onChange={e => setArn(e.target.value)} />
            </fieldset>

            <button className="c-btn" onClick={validate} disabled={!arn.trim() || validating}>
              {validating ? 'Validating...' : 'Validate & Complete'}
            </button>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="c-success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 7L23 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.div>
            <h2 className="c-heading">Connection complete</h2>
            <p className="c-subtext">
              Sarah has been notified. The AWS connection is now active and Rippling will begin importing data.
              You can close this page.
            </p>
            <div className="deleg-done-info">
              <span>Sarah will see compliance checks within 5 minutes.</span>
            </div>
            <button className="c-btn-ghost" onClick={onReset}>Try another scenario</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Managed Compliance Path ──────────────────────────────────────────────────

function ManagedPath({ scenario, onReset }) {
  const conn = CONNECTORS[scenario.connector || 'aws']
  const [phase, setPhase] = useState('confirm') // confirm | connect | importing | done
  const [arn, setArn] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [cfPhase, setCfPhase] = useState(0) // 0=deploy, 1=arn
  const [validating, setValidating] = useState(false)
  const [pct, setPct] = useState(0)
  const [showChecks, setShowChecks] = useState(false)
  const [visibleChecks, setVisibleChecks] = useState(0)

  const requiredCats = conn.id === 'aws'
    ? conn.categories.filter(c => ['identity-access', 'storage-databases', 'logging-monitoring'].includes(c.id))
    : conn.categories

  const productName = conn.id === 'checkr' ? 'Background Checks' : 'Automated Compliance'
  const others = CROSS_PRODUCTS[conn.id].filter(p => p !== productName)

  const handleConnect = () => {
    setValidating(true)
    setTimeout(() => {
      setValidating(false)
      setPhase('importing')
    }, 1400)
  }

  // Delegation option
  const [showDelegate, setShowDelegate] = useState(false)

  useEffect(() => {
    if (phase === 'importing') {
      const t = setInterval(() => setPct(p => { if (p >= 100) { clearInterval(t); setPhase('done'); return 100 } return p + 2 }), 50)
      return () => clearInterval(t)
    }
  }, [phase])

  useEffect(() => { if (pct >= 30 && conn.id === 'aws') setShowChecks(true) }, [pct, conn.id])
  useEffect(() => {
    if (showChecks && visibleChecks < CHECKS.length) {
      const t = setTimeout(() => setVisibleChecks(v => v + 1), 400)
      return () => clearTimeout(t)
    }
  }, [showChecks, visibleChecks])

  return (
    <motion.div className="c-step" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE_OUT }}>
      <AnimatePresence mode="wait">
        {phase === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="c-heading">
              {conn.id === 'checkr' ? 'Connect Checkr for Background Checks' : 'Enable Automated Compliance for AWS'}
            </h2>
            <p className="c-subtext">
              {conn.id === 'checkr'
                ? 'We\'ll connect your Checkr account and import background check data automatically.'
                : 'We\'ll connect your AWS account and start running compliance checks. The system knows exactly what data it needs — no configuration required.'}
            </p>

            {/* What will be imported */}
            <div className="managed-plan">
              <span className="mp-title">Data that will be imported</span>
              {requiredCats.map(cat => (
                <div key={cat.id} className="mp-row">
                  <div className="mp-info">
                    <span className="mp-name">{cat.name}</span>
                    <span className="mp-desc">{cat.description}</span>
                  </div>
                  <span className="mp-lock">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="6" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  </span>
                </div>
              ))}
            </div>

            <div className="c-value-row">
              <span className="c-value-label">Also powers</span>
              <div className="c-value-pills">
                {others.map(p => <span key={p} className="c-pill">{p}</span>)}
              </div>
            </div>

            <button className="c-btn" onClick={() => setPhase('connect')}>
              {conn.authType === 'api_key' ? 'Enter API Key' : 'Connect AWS Account'}
            </button>

            {conn.authType === 'cloudformation' && (
              <button className="c-btn-ghost" onClick={() => setShowDelegate(true)}>
                I need someone else to do this
              </button>
            )}

            {showDelegate && (
              <motion.div className="delegate-panel" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="delegate-title">Send a setup link</h3>
                <p className="delegate-desc">Generate a link your DevOps engineer can complete without a Rippling account.</p>
                <fieldset className="c-field">
                  <label className="c-flabel">Recipient email</label>
                  <input className="c-input" placeholder="devops@company.com" />
                </fieldset>
                <button className="c-btn-secondary">Send Setup Link</button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'connect' && (
          <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {conn.authType === 'api_key' ? (
              <>
                <h2 className="c-heading">Enter your Checkr API key</h2>
                <p className="c-subtext">Read-only access to your background check data.</p>
                <fieldset className="c-field" disabled={validating}>
                  <label className="c-flabel">API Key</label>
                  <input className="c-input" placeholder="sk_live_..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
                </fieldset>
                <button className="c-btn" onClick={handleConnect} disabled={!apiKey.trim() || validating}>
                  {validating ? 'Connecting...' : 'Connect'}
                </button>
              </>
            ) : (
              <>
                <h2 className="c-heading">Connect AWS</h2>
                {cfPhase === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="c-subtext">Deploy a CloudFormation stack to create a read-only role.</p>
                    <div className="deleg-perms" style={{ marginBottom: 20 }}>
                      <div className="deleg-perm"><span className="dp-icon ok">R</span> SecurityAudit policy (read-only)</div>
                      <div className="deleg-perm"><span className="dp-icon no">&#x2715;</span> Cannot modify any resources</div>
                    </div>
                    <button className="c-btn" onClick={() => setCfPhase(1)}>Deploy Stack</button>
                    <button className="c-btn-ghost">Set up manually</button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="c-chip ok">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Stack deployed
                    </div>
                    <p className="c-subtext">Paste the Role ARN from the Outputs tab.</p>
                    <fieldset className="c-field" disabled={validating}>
                      <label className="c-flabel">Role ARN</label>
                      <input className="c-input" placeholder="arn:aws:iam::123456789012:role/RipplingReadOnly" value={arn} onChange={e => setArn(e.target.value)} />
                    </fieldset>
                    <button className="c-btn" onClick={handleConnect} disabled={!arn.trim() || validating}>
                      {validating ? 'Validating...' : 'Validate & Connect'}
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}

        {(phase === 'importing' || phase === 'done') && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="c-success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 7L23 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.div>
            <h2 className="c-heading">{conn.shortName} connected</h2>

            <div className="c-progress">
              <div className="c-progress-head">
                <span>Importing data</span>
                <span className="c-progress-pct">{Math.min(pct, 100)}%</span>
              </div>
              <div className="c-progress-track"><div className="c-progress-fill" style={{ width: `${pct}%` }} /></div>
              {pct >= 15 && (
                <div className="c-import-stats">
                  {conn.id === 'aws' && <><span>142 IAM users</span><span>38 S3 buckets</span><span>12 CloudTrail trails</span></>}
                  {conn.id === 'checkr' && <><span>847 checks</span><span>1,204 candidates</span></>}
                </div>
              )}
            </div>

            {showChecks && (
              <motion.div className="c-first-value" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <span className="c-fv-title">First compliance checks</span>
                {CHECKS.slice(0, visibleChecks).map((c, i) => (
                  <motion.div key={c} className="c-check" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                    <span className={`c-chk-dot ${i % 3 === 0 ? 'fail' : 'pass'}`}>{i % 3 === 0 ? '\u2715' : '\u2713'}</span>
                    <span>{c}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {conn.id === 'checkr' && pct >= 50 && (
              <motion.div className="c-first-value" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <span className="c-fv-title">Data available</span>
                <div className="c-check"><span className="c-chk-dot pass">{'\u2713'}</span>847 completed checks synced</div>
                <div className="c-check"><span className="c-chk-dot pass">{'\u2713'}</span>1,204 candidates linked to employees</div>
              </motion.div>
            )}

            <div className="c-value-row">
              <span className="c-value-label">Also powers</span>
              <div className="c-value-pills">{others.map(p => <span key={p} className="c-pill">{p}</span>)}</div>
            </div>

            <button className="c-btn" onClick={onReset}>Go to {productName}</button>
            <button className="c-btn-ghost" onClick={onReset}>Try another scenario</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Flexible Import Path ─────────────────────────────────────────────────────

function FlexiblePath({ scenario, onReset }) {
  const conn = CONNECTORS.aws
  const isReuse = scenario.reuse
  const existingCats = isReuse ? ['identity-access', 'storage-databases', 'logging-monitoring'] : []

  const [phase, setPhase] = useState(isReuse ? 'select' : 'connect') // connect | select | importing | done
  const [cfPhase, setCfPhase] = useState(0)
  const [arn, setArn] = useState('')
  const [validating, setValidating] = useState(false)
  const [selections, setSelections] = useState(() => {
    const m = {}
    conn.categories.forEach(c => { m[c.id] = existingCats.includes(c.id) })
    return m
  })
  const [expandedCat, setExpandedCat] = useState(null)
  const [pct, setPct] = useState(0)

  const toggle = id => { if (!existingCats.includes(id)) setSelections(p => ({ ...p, [id]: !p[id] })) }
  const selectedCount = Object.values(selections).filter(Boolean).length

  const handleConnect = () => {
    setValidating(true)
    setTimeout(() => { setValidating(false); setPhase('select') }, 1400)
  }

  const startImport = () => { setPhase('importing') }

  useEffect(() => {
    if (phase === 'importing') {
      const t = setInterval(() => setPct(p => { if (p >= 100) { clearInterval(t); setPhase('done'); return 100 } return p + 2 }), 50)
      return () => clearInterval(t)
    }
  }, [phase])

  return (
    <motion.div className="c-step" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE_OUT }}>
      <AnimatePresence mode="wait">
        {phase === 'connect' && (
          <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="c-heading">Connect AWS for data import</h2>
            <p className="c-subtext">After connecting, you'll choose exactly which data to import.</p>
            {cfPhase === 0 ? (
              <>
                <div className="deleg-perms" style={{ marginBottom: 20 }}>
                  <div className="deleg-perm"><span className="dp-icon ok">R</span> Read-only SecurityAudit access</div>
                  <div className="deleg-perm"><span className="dp-icon no">&#x2715;</span> Cannot modify resources</div>
                </div>
                <button className="c-btn" onClick={() => setCfPhase(1)}>Deploy Stack</button>
              </>
            ) : (
              <>
                <div className="c-chip ok">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Stack deployed
                </div>
                <fieldset className="c-field" disabled={validating}>
                  <label className="c-flabel">Role ARN</label>
                  <input className="c-input" placeholder="arn:aws:iam::..." value={arn} onChange={e => setArn(e.target.value)} />
                </fieldset>
                <button className="c-btn" onClick={handleConnect} disabled={!arn.trim() || validating}>
                  {validating ? 'Validating...' : 'Connect'}
                </button>
              </>
            )}
          </motion.div>
        )}

        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="c-heading">Choose what to import</h2>
            <p className="c-subtext">Select data categories from AWS. You can change this anytime.</p>

            {isReuse && (
              <div className="c-reuse-banner">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 8a6.5 6.5 0 0112.5-2.3M14.5 8a6.5 6.5 0 01-12.5 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M14.5 2.5v3.2h-3.2M1.5 13.5v-3.2h3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>AWS is already connected for Automated Compliance. Add more data below.</span>
              </div>
            )}

            <div className="flex-plan">
              {conn.categories.map(cat => {
                const isExisting = existingCats.includes(cat.id)
                const isOn = selections[cat.id]
                return (
                  <div key={cat.id} className={`flex-row ${isOn ? 'on' : ''} ${isExisting ? 'existing' : ''}`}>
                    <div className="flex-main" onClick={() => toggle(cat.id)}>
                      <span className={`flex-cbox ${isOn ? 'on' : ''} ${isExisting ? 'locked' : ''}`}>
                        {isExisting ? (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : isOn ? (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : null}
                      </span>
                      <div className="flex-info">
                        <span className="flex-name">
                          {cat.name}
                          {isExisting && <span className="flex-flowing">Flowing</span>}
                        </span>
                        <span className="flex-desc">{cat.description}</span>
                      </div>
                      <button className="flex-drill" onClick={e => { e.stopPropagation(); setExpandedCat(expandedCat === cat.id ? null : cat.id) }}>
                        {cat.objects.length}
                        <motion.span animate={{ rotate: expandedCat === cat.id ? 180 : 0 }} style={{ display: 'inline-flex', marginLeft: 2 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </motion.span>
                      </button>
                    </div>
                    <AnimatePresence>
                      {expandedCat === cat.id && (
                        <motion.div className="flex-expanded" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          {cat.objects.map(o => (
                            <div key={o.id} className="flex-obj"><span>{o.name}</span><span className="flex-obj-f">{o.fields} fields</span></div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
            <button className="c-btn" onClick={startImport} disabled={selectedCount === 0}>Import {selectedCount} categories</button>
          </motion.div>
        )}

        {(phase === 'importing' || phase === 'done') && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="c-success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 7L23 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.div>
            <h2 className="c-heading">{isReuse ? 'Import expanded' : 'Import started'}</h2>

            <div className="c-progress">
              <div className="c-progress-head"><span>Importing</span><span className="c-progress-pct">{Math.min(pct, 100)}%</span></div>
              <div className="c-progress-track"><div className="c-progress-fill" style={{ width: `${pct}%` }} /></div>
              {pct >= 15 && <div className="c-import-stats"><span>142 IAM users</span><span>38 S3 buckets</span></div>}
            </div>

            <div className="c-value-row">
              <span className="c-value-label">Available in</span>
              <div className="c-value-pills">{CROSS_PRODUCTS.aws.map(p => <span key={p} className="c-pill">{p}</span>)}</div>
            </div>

            <button className="c-btn" onClick={onReset}>View Connection</button>
            <button className="c-btn-ghost" onClick={onReset}>Try another scenario</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Flow Controller ──────────────────────────────────────────────────────────

export default function DirectionC({ scenario, onReset }) {
  const [intent, setIntent] = useState(null)

  const resolvedConnector = intent?.connector || scenario.connector || 'aws'

  // Intent is always selected by the user via IntentScreen

  return (
    <div className="c-flow">
      <header className="c-flow-header">
        <button className="c-back" onClick={() => { if (intent) setIntent(null); else onReset() }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {intent ? 'Change intent' : 'Scenarios'}
        </button>
        {intent && (
          <div className="c-flow-ctx">
            <span className="c-ctx-intent">{intent.label}</span>
            <span className="c-ctx-conn">{CONNECTORS[resolvedConnector]?.shortName}</span>
          </div>
        )}
      </header>

      <div className="c-flow-body">
        <AnimatePresence mode="wait">
          {!intent ? (
            <IntentScreen key="intent" scenario={scenario} onSelectIntent={setIntent} />
          ) : intent.id === 'delegated' ? (
            <DelegationFlow key="deleg" onReset={onReset} />
          ) : intent.managed ? (
            <ManagedPath key="managed" scenario={{ ...scenario, connector: intent.connector }} onReset={onReset} />
          ) : (
            <FlexiblePath key="flexible" scenario={scenario} onReset={onReset} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
