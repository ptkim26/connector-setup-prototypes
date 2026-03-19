import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONNECTORS, PRODUCTS, CROSS_PRODUCTS, CHECKS, EASE_OUT, getDataPlan } from '../data'
import './DirectionA.css'

// ─── Easing / Motion ──────────────────────────────────────────────────────────

const stepVariants = {
  enter: { opacity: 0, y: 16 },
  active: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ steps, current, onNavigate }) {
  return (
    <nav className="steps-nav" aria-label="Setup progress">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <motion.button
            key={step.id}
            className={`step-pip ${active ? 'active' : ''} ${done ? 'done' : ''}`}
            onClick={() => done && onNavigate(i)}
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: EASE_OUT }}
          >
            <span className="pip-dot">
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <span className="pip-num">{i + 1}</span>
              )}
            </span>
            <span className="pip-label">{step.label}</span>
          </motion.button>
        )
      })}
    </nav>
  )
}

// ─── Step: Get Started ────────────────────────────────────────────────────────

function StepGetStarted({ scenario, onNext }) {
  const conn = CONNECTORS[scenario.connector]
  const prod = PRODUCTS[scenario.origin]
  const isManaged = (prod.requiredCategories?.[scenario.connector] || []).length > 0
  const others = CROSS_PRODUCTS[scenario.connector]

  return (
    <motion.div className="step-body" variants={stepVariants} initial="enter" animate="active" exit="exit" transition={{ duration: 0.4, ease: EASE_OUT }}>
      <div className="step-connector-icon">
        {scenario.connector === 'aws' ? (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 6L36 14v12l-16 8-16-8V14L20 6z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M20 6v20M4 14l16 8 16-8" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2"/>
            <path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <h2 className="step-heading">
        {isManaged ? <>Connect {conn.shortName} for {prod.name}</> : <>Import data from {conn.shortName}</>}
      </h2>
      <p className="step-text">
        {isManaged
          ? <>{prod.name} needs access to your {conn.shortName} account to monitor your cloud infrastructure against compliance frameworks.</>
          : <>Select which {conn.shortName} data to bring into Rippling for reports, workflows, and custom objects.</>}
      </p>

      <div className="value-row">
        <span className="value-label">This connection powers</span>
        <div className="value-pills">
          {others.map(p => <span key={p} className="pill">{p}</span>)}
        </div>
      </div>

      {conn.authType === 'cloudformation' && (
        <div className="prereqs">
          <span className="prereqs-label">Before you start</span>
          <ul>
            <li>AWS Console access with CloudFormation permissions</li>
            <li>Read-only access only — we never modify your resources</li>
            <li>About 5 minutes of active effort</li>
          </ul>
        </div>
      )}
      {conn.authType === 'api_key' && (
        <div className="prereqs">
          <span className="prereqs-label">You'll need</span>
          <ul>
            <li>Your Checkr API key (Settings &rarr; API)</li>
            <li>Takes about 30 seconds</li>
          </ul>
        </div>
      )}

      <button className="btn-primary" onClick={onNext}>
        {conn.authType === 'api_key' ? 'Enter API Key' : 'Begin Setup'}
      </button>
    </motion.div>
  )
}

// ─── Step: Connect ────────────────────────────────────────────────────────────

function StepConnect({ scenario, onNext }) {
  const conn = CONNECTORS[scenario.connector]
  const [phase, setPhase] = useState(0) // 0=deploy, 1=paste ARN
  const [arn, setArn] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [validating, setValidating] = useState(false)
  const [validated, setValidated] = useState(false)

  const handleValidate = (val) => {
    if (!val.trim()) return
    setValidating(true)
    setTimeout(() => {
      setValidating(false)
      setValidated(true)
      setTimeout(onNext, 700)
    }, 1400)
  }

  if (conn.authType === 'api_key') {
    return (
      <motion.div className="step-body" variants={stepVariants} initial="enter" animate="active" exit="exit" transition={{ duration: 0.4, ease: EASE_OUT }}>
        <h2 className="step-heading">Enter your Checkr API key</h2>
        <p className="step-text">Paste your key from Checkr's dashboard. This grants Rippling read-only access.</p>
        <fieldset className="field-group" disabled={validating || validated}>
          <label className="field-label">API Key</label>
          <input className="field-input" type="text" placeholder="sk_live_..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </fieldset>
        <div className="perm-block">
          <span className="perm-title">Permissions</span>
          <div className="perm-row"><span className="perm-icon read">R</span> Read background checks & candidate records</div>
          <div className="perm-row"><span className="perm-icon deny">&#x2715;</span> Cannot initiate checks, modify data, or access billing</div>
        </div>
        <button className={`btn-primary ${validated ? 'success' : ''}`} onClick={() => handleValidate(apiKey)} disabled={!apiKey.trim() || validating || validated}>
          {validated ? 'Connected' : validating ? 'Validating...' : 'Connect'}
        </button>
      </motion.div>
    )
  }

  // AWS CloudFormation
  return (
    <motion.div className="step-body" variants={stepVariants} initial="enter" animate="active" exit="exit" transition={{ duration: 0.4, ease: EASE_OUT }}>
      <h2 className="step-heading">Connect your AWS account</h2>
      <p className="step-text">Deploy a CloudFormation stack that creates a read-only IAM role for Rippling.</p>

      <AnimatePresence mode="wait">
        {phase === 0 ? (
          <motion.div key="deploy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cf-section">
            <div className="cf-card">
              <div className="cf-header">
                <span className="cf-icon">&#9889;</span>
                <div>
                  <strong>One-click CloudFormation</strong>
                  <span className="cf-sub">Creates a read-only role in your account</span>
                </div>
              </div>
              <div className="perm-block">
                <span className="perm-title">What this creates</span>
                <div className="perm-row"><span className="perm-icon read">R</span> IAM role with <strong>SecurityAudit</strong> policy (read-only)</div>
                <div className="perm-row"><span className="perm-icon read">R</span> Trust policy scoped to Rippling's account ID</div>
                <div className="perm-row"><span className="perm-icon deny">&#x2715;</span> Cannot modify, delete, or create any resources</div>
              </div>
              <button className="btn-primary" onClick={() => setPhase(1)}>Deploy Stack in AWS Console</button>
              <button className="btn-ghost">Set up manually instead</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="arn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cf-section">
            <div className="status-chip ok">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Stack deployment initiated
            </div>
            <fieldset className="field-group" disabled={validating || validated}>
              <label className="field-label">Role ARN</label>
              <input className="field-input" type="text" placeholder="arn:aws:iam::123456789012:role/RipplingReadOnly" value={arn} onChange={e => setArn(e.target.value)} />
              <span className="field-hint">Copy the Role ARN from the CloudFormation stack outputs tab</span>
            </fieldset>
            <button className={`btn-primary ${validated ? 'success' : ''}`} onClick={() => handleValidate(arn)} disabled={!arn.trim() || validating || validated}>
              {validated ? 'Validated' : validating ? 'Validating connection...' : 'Validate & Connect'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Step: Data Plan — Managed ────────────────────────────────────────────────

function StepDataManaged({ scenario, onNext }) {
  const conn = CONNECTORS[scenario.connector]
  const prod = PRODUCTS[scenario.origin]
  const plan = getDataPlan(scenario.connector, scenario.origin)
  const required = plan.filter(c => c.required)
  const optional = plan.filter(c => !c.required)
  const [showOpt, setShowOpt] = useState(false)

  return (
    <motion.div className="step-body" variants={stepVariants} initial="enter" animate="active" exit="exit" transition={{ duration: 0.4, ease: EASE_OUT }}>
      <h2 className="step-heading">Data that will be imported</h2>
      <p className="step-text">{prod.name} requires the following from {conn.shortName}. This isn't configurable — it's what the product needs.</p>

      <div className="data-plan">
        {required.map(cat => (
          <div key={cat.id} className="cat-row locked">
            <div className="cat-main">
              <div className="cat-info">
                <span className="cat-name">{cat.name}</span>
                <span className="cat-lock">Required for {prod.name}</span>
                <span className="cat-desc">{cat.description}</span>
              </div>
              <span className="lock-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </span>
            </div>
            <div className="cat-objects">
              {cat.objects.map(o => <span key={o.id} className="obj-chip">{o.name}<span className="obj-fields">{o.fields}</span></span>)}
            </div>
          </div>
        ))}
      </div>

      {optional.length > 0 && (
        <>
          <button className="btn-expand" onClick={() => setShowOpt(!showOpt)}>
            <motion.span animate={{ rotate: showOpt ? 180 : 0 }} style={{ display: 'inline-flex' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.span>
            {showOpt ? 'Hide' : 'Show'} {optional.length} optional categories
          </button>
          <AnimatePresence>
            {showOpt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="optional-section">
                {optional.map(cat => <OptionalToggle key={cat.id} category={cat} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <button className="btn-primary" onClick={onNext}>Confirm & Start Import</button>
    </motion.div>
  )
}

function OptionalToggle({ category }) {
  const [on, setOn] = useState(false)
  return (
    <div className={`cat-row optional ${on ? 'enabled' : ''}`}>
      <div className="cat-main">
        <div className="cat-info">
          <span className="cat-name">{category.name}</span>
          <span className="cat-desc">{category.description}</span>
        </div>
        <button className={`toggle ${on ? 'on' : ''}`} onClick={() => setOn(!on)} role="switch" aria-checked={on}>
          <motion.span className="toggle-dot" animate={{ x: on ? 18 : 0 }} transition={{ duration: 0.15 }} />
        </button>
      </div>
    </div>
  )
}

// ─── Step: Data Plan — Flexible ───────────────────────────────────────────────

function StepDataFlexible({ scenario, onNext }) {
  const conn = CONNECTORS[scenario.connector]
  const plan = getDataPlan(scenario.connector, scenario.origin, scenario.existingCategories || [])
  const [selections, setSelections] = useState(() => {
    const m = {}
    plan.forEach(c => { m[c.id] = c.existing || false })
    return m
  })
  const [expanded, setExpanded] = useState(null)
  const count = Object.values(selections).filter(Boolean).length

  const toggle = id => {
    const cat = plan.find(c => c.id === id)
    if (cat.locked) return
    setSelections(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <motion.div className="step-body" variants={stepVariants} initial="enter" animate="active" exit="exit" transition={{ duration: 0.4, ease: EASE_OUT }}>
      <h2 className="step-heading">Choose what to import</h2>
      <p className="step-text">Select the data categories you want from {conn.shortName}. You can always change this later.</p>

      {scenario.existing && (
        <div className="reuse-banner">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9a7 7 0 0113.5-2.5M16 9a7 7 0 01-13.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 3v4h-4M2 15v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div>
            <strong>{conn.shortName} is already connected</strong> for {scenario.existingProduct}.
            Categories marked "Already importing" are already flowing.
          </div>
        </div>
      )}

      <div className="data-plan flexible">
        {plan.map(cat => (
          <div key={cat.id} className={`cat-row selectable ${selections[cat.id] ? 'selected' : ''} ${cat.existing ? 'existing' : ''} ${cat.locked ? 'locked' : ''}`}>
            <div className="cat-main" onClick={() => toggle(cat.id)}>
              <div className="cat-check">
                {cat.locked ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                ) : (
                  <span className={`cbox ${selections[cat.id] ? 'on' : ''}`}>
                    {selections[cat.id] && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                )}
              </div>
              <div className="cat-info">
                <span className="cat-name">
                  {cat.name}
                  {cat.existing && <span className="existing-badge">Already importing</span>}
                  {cat.locked && <span className="cat-lock">Required for {cat.requiredBy[0]}</span>}
                </span>
                <span className="cat-desc">{cat.description}</span>
              </div>
              <button className="btn-drill" onClick={e => { e.stopPropagation(); setExpanded(expanded === cat.id ? null : cat.id) }}>
                {cat.objects.length} objects
                <motion.span animate={{ rotate: expanded === cat.id ? 180 : 0 }} style={{ display: 'inline-flex', marginLeft: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.span>
              </button>
            </div>
            <AnimatePresence>
              {expanded === cat.id && (
                <motion.div className="cat-expanded" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
                  {cat.objects.map(o => (
                    <div key={o.id} className="obj-row">
                      <span>{o.name}</span>
                      <span className="obj-fc">{o.fields} fields</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onNext} disabled={count === 0}>
        Import {count} {count === 1 ? 'category' : 'categories'}
      </button>
    </motion.div>
  )
}

// ─── Step: Success ────────────────────────────────────────────────────────────

function StepSuccess({ scenario, onReset }) {
  const conn = CONNECTORS[scenario.connector]
  const prod = PRODUCTS[scenario.origin]
  const isManaged = (prod.requiredCategories?.[scenario.connector] || []).length > 0
  const others = CROSS_PRODUCTS[scenario.connector].filter(p => p !== prod.name)
  const checks = CHECKS

  const [pct, setPct] = useState(0)
  const [showChecks, setShowChecks] = useState(false)
  const [visibleChecks, setVisibleChecks] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPct(p => { if (p >= 100) { clearInterval(t); return 100 } return p + 2 }), 55)
    return () => clearInterval(t)
  }, [])
  useEffect(() => { if (pct >= 35 && isManaged && scenario.origin === 'automated_compliance') setShowChecks(true) }, [pct, isManaged, scenario.origin])
  useEffect(() => {
    if (showChecks && visibleChecks < checks.length) {
      const t = setTimeout(() => setVisibleChecks(v => v + 1), 350)
      return () => clearTimeout(t)
    }
  }, [showChecks, visibleChecks, checks.length])

  return (
    <motion.div className="step-body" variants={stepVariants} initial="enter" animate="active" exit="exit" transition={{ duration: 0.4, ease: EASE_OUT }}>
      <motion.div className="success-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 7L23 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.div>

      <h2 className="step-heading">{scenario.existing ? 'Import expanded' : `${conn.shortName} connected`}</h2>
      <p className="step-text">{scenario.existing ? `Additional data is now being imported from ${conn.shortName}.` : `Data import from ${conn.shortName} has started.`}</p>

      <div className="progress-block">
        <div className="progress-header">
          <span>Importing data</span>
          <span className="progress-pct">{Math.min(pct, 100)}%</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        {pct >= 15 && (
          <motion.div className="import-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {conn.id === 'aws' && <><span>142 IAM users</span><span>38 S3 buckets</span><span>12 CloudTrail trails</span></>}
            {conn.id === 'checkr' && <><span>847 background checks</span><span>1,204 candidates</span></>}
          </motion.div>
        )}
      </div>

      {showChecks && (
        <motion.div className="first-value" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <span className="fv-title">First compliance checks</span>
          <div className="checks-list">
            {checks.slice(0, visibleChecks).map((c, i) => (
              <motion.div key={c} className="check-item" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                <span className={`check-dot ${i % 3 === 0 ? 'fail' : 'pass'}`}>{i % 3 === 0 ? '\u2715' : '\u2713'}</span>
                <span>{c}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {conn.id === 'checkr' && pct >= 50 && (
        <motion.div className="first-value" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <span className="fv-title">Data available</span>
          <div className="checks-list">
            <div className="check-item"><span className="check-dot pass">{'\u2713'}</span>847 completed checks synced</div>
            <div className="check-item"><span className="check-dot pass">{'\u2713'}</span>1,204 candidate records linked</div>
          </div>
        </motion.div>
      )}

      <div className="cross-value">
        <span className="cv-label">Also powers</span>
        <div className="cv-pills">{others.map(p => <span key={p} className="pill">{p}</span>)}</div>
      </div>

      <div className="success-actions">
        <button className="btn-primary" onClick={onReset}>{isManaged ? `Go to ${prod.name}` : 'View Connection'}</button>
        <button className="btn-ghost" onClick={onReset}>Try another scenario</button>
      </div>
    </motion.div>
  )
}

// ─── Flow Controller ──────────────────────────────────────────────────────────

export default function DirectionA({ scenario, onReset }) {
  const conn = CONNECTORS[scenario.connector]
  const prod = PRODUCTS[scenario.origin]
  const isManaged = (prod.requiredCategories?.[scenario.connector] || []).length > 0
  const isSimple = conn.authType === 'api_key'
  const isReuse = scenario.existing

  const steps = useCallback(() => {
    if (isReuse) return [{ id: 'data', label: 'Select Data' }, { id: 'success', label: 'Done' }]
    if (isSimple && isManaged) return [{ id: 'connect', label: 'Connect' }, { id: 'success', label: 'Done' }]
    if (isSimple) return [{ id: 'connect', label: 'Connect' }, { id: 'data', label: 'Select Data' }, { id: 'success', label: 'Done' }]
    if (isManaged) return [{ id: 'start', label: 'Overview' }, { id: 'connect', label: 'Connect' }, { id: 'data', label: 'Review Data' }, { id: 'success', label: 'Done' }]
    return [{ id: 'start', label: 'Overview' }, { id: 'connect', label: 'Connect' }, { id: 'data', label: 'Select Data' }, { id: 'success', label: 'Done' }]
  }, [isReuse, isSimple, isManaged])()

  const [current, setCurrent] = useState(0)
  const next = () => setCurrent(p => Math.min(p + 1, steps.length - 1))

  const renderStep = () => {
    const s = steps[current]
    switch (s.id) {
      case 'start': return <StepGetStarted key="start" scenario={scenario} onNext={next} />
      case 'connect': return <StepConnect key="connect" scenario={scenario} onNext={next} />
      case 'data': return isManaged ? <StepDataManaged key="data" scenario={scenario} onNext={next} /> : <StepDataFlexible key="data" scenario={scenario} onNext={next} />
      case 'success': return <StepSuccess key="success" scenario={scenario} onReset={onReset} />
      default: return null
    }
  }

  const flowType = isReuse ? 'Reuse' : isManaged ? 'Managed' : 'Flexible'

  return (
    <div className="flow">
      <header className="flow-header">
        <button className="btn-back" onClick={onReset}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div className="flow-context">
          <span className="ctx-connector">{conn.shortName}</span>
          <span className="ctx-sep">&rarr;</span>
          <span className="ctx-product">{prod.name}</span>
        </div>
        <span className="flow-type">{flowType} &middot; {steps.length} steps</span>
      </header>

      <StepIndicator steps={steps} current={current} onNavigate={setCurrent} />

      <main className="flow-main">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
    </div>
  )
}
