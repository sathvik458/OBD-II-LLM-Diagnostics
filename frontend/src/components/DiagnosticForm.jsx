import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }

const OBD_PATTERN = /^[PBCUpbcu][0-9A-Fa-f]{4}$/
const VIN_PATTERN = /^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$/

export default function DiagnosticForm({ onResult, onLoading, loading }) {
  const [mode, setMode] = useState('vin')   // 'vin' | 'manual'

  // VIN mode
  const [vin, setVin] = useState('')

  // Manual mode
  const [make,   setMake]   = useState('')
  const [model,  setModel]  = useState('')
  const [year,   setYear]   = useState('')
  const [engine, setEngine] = useState('')

  // Shared
  const [obdCode,  setObdCode]  = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [mileage,  setMileage]  = useState('')
  const [error,    setError]    = useState('')

  function validate() {
    if (mode === 'vin') {
      if (!VIN_PATTERN.test(vin)) return 'Enter a valid 17-character VIN.'
    } else {
      if (!make || !model || !year || !engine) return 'Fill in all vehicle fields.'
      const y = parseInt(year, 10)
      if (isNaN(y) || y < 1980 || y > 2030) return 'Year must be between 1980 and 2030.'
    }
    if (!obdCode && !symptoms.trim()) return 'Provide at least an OBD code or symptoms.'
    if (obdCode && !OBD_PATTERN.test(obdCode)) return 'OBD code must match pattern P0420, B1234, etc.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const err = validate()
    if (err) { setError(err); return }

    const body = mode === 'vin'
      ? { vin }
      : { make, model, year: parseInt(year, 10), engine }

    if (obdCode)  body.obd_code = obdCode.toUpperCase()
    if (symptoms) body.symptoms = symptoms
    if (mileage)  body.mileage  = parseInt(mileage, 10)

    onLoading(true)
    try {
      const res = await fetch('/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      onResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      onLoading(false)
    }
  }

  return (
    <section id="diagnose" style={styles.section}>
      {/* Section label */}
      <div style={styles.label}>
        <span style={styles.labelDot} />
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diagnostic Station</span>
      </div>

      <h2 style={styles.heading}>
        Feed the<br /><span style={{ color: 'var(--lime)' }}>machine.</span>
      </h2>

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        {/* Mode toggle */}
        <div style={styles.toggle}>
          {['vin', 'manual'].map(m => (
            <button key={m} type="button" onClick={() => setMode(m)} style={{ ...styles.toggleBtn, ...(mode === m ? styles.toggleActive : {}) }}>
              {m === 'vin' ? 'VIN Decode' : 'Manual Entry'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'vin' ? (
            <motion.div key="vin" variants={SLIDE} initial="hidden" animate="show" exit="hidden">
              <FormField label="Vehicle Identification Number" hint="17 chars — US market auto-decoded via NHTSA">
                <input
                  value={vin} onChange={e => setVin(e.target.value.toUpperCase())}
                  placeholder="1HGBH41JXMN109186"
                  maxLength={17}
                  className="mono"
                  style={{ ...styles.input, letterSpacing: '0.12em' }}
                />
                <div style={styles.inputMeta}>
                  <VinStatus vin={vin} />
                  <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{vin.length}/17</span>
                </div>
              </FormField>
            </motion.div>
          ) : (
            <motion.div key="manual" variants={SLIDE} initial="hidden" animate="show" exit="hidden">
              <div style={styles.grid2}>
                <FormField label="Make">
                  <input value={make} onChange={e => setMake(e.target.value)} placeholder="Toyota" style={styles.input} />
                </FormField>
                <FormField label="Model">
                  <input value={model} onChange={e => setModel(e.target.value)} placeholder="Camry" style={styles.input} />
                </FormField>
                <FormField label="Year">
                  <input value={year} onChange={e => setYear(e.target.value)} placeholder="2019" maxLength={4} className="mono" style={styles.input} />
                </FormField>
                <FormField label="Engine">
                  <input value={engine} onChange={e => setEngine(e.target.value)} placeholder="2.5L I4" style={styles.input} />
                </FormField>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span className="mono" style={{ color: 'var(--text-dim)', fontSize: 11, whiteSpace: 'nowrap', padding: '0 12px' }}>FAULT DATA</span>
          <div style={styles.dividerLine} />
        </div>

        <div style={styles.grid2}>
          <FormField label="OBD-II Code" hint="e.g. P0420, B1234">
            <input
              value={obdCode}
              onChange={e => setObdCode(e.target.value.toUpperCase())}
              placeholder="P0420"
              maxLength={5}
              className="mono"
              style={{ ...styles.input, letterSpacing: '0.15em', fontSize: 18 }}
            />
          </FormField>
          <FormField label="Mileage" hint="optional">
            <input value={mileage} onChange={e => setMileage(e.target.value)} placeholder="68 000" className="mono" style={styles.input} />
          </FormField>
        </div>

        <FormField label="Symptoms" hint="Describe what you observe — the more detail, the better the diagnosis">
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="Engine light on. Rough idle at stop lights. Slight hesitation on acceleration…"
            rows={4}
            maxLength={2000}
            style={{ ...styles.input, ...styles.textarea }}
          />
          <span style={{ ...styles.inputMeta, justifyContent: 'flex-end', fontSize: 12, color: 'var(--text-dim)' }}>{symptoms.length}/2000</span>
        </FormField>

        <AnimatePresence>
          {error && (
            <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorBox}>
              <span style={{ color: 'var(--red)', fontSize: 13 }} className="mono">⚠ {error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? <LoadingSpinner /> : (
            <>
              <span>Run Diagnostic</span>
              <Arrow />
            </>
          )}
        </button>
      </form>
    </section>
  )
}

/* ── Sub-components ── */

function FormField({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>— {hint}</span>}
      </div>
      {children}
    </div>
  )
}

function VinStatus({ vin }) {
  if (vin.length === 0) return null
  const ok = VIN_PATTERN.test(vin)
  return (
    <span className="mono" style={{ fontSize: 11, color: ok ? 'var(--green)' : 'var(--text-dim)' }}>
      {ok ? '✓ Valid format' : `${17 - vin.length} chars remaining`}
    </span>
  )
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={18} height={18} viewBox="0 0 18 18" style={{ animation: 'spin-slow 0.8s linear infinite' }}>
        <circle cx={9} cy={9} r={7} stroke="currentColor" strokeWidth={2} fill="none" strokeDasharray="22 12" />
      </svg>
      <span className="mono" style={{ fontSize: 13, letterSpacing: '0.08em' }}>ANALYSING…</span>
    </div>
  )
}

function Arrow() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Styles ── */
const styles = {
  section: {
    maxWidth: 780,
    margin: '0 auto',
    padding: '120px 24px 80px',
  },
  label: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
  },
  labelDot: {
    width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)',
    boxShadow: '0 0 8px var(--lime)',
  },
  heading: {
    fontSize: 'clamp(40px, 6vw, 72px)',
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    marginBottom: 56,
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: 28,
  },
  toggle: {
    display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 4,
    gap: 4,
    width: 'fit-content',
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 20px',
    borderRadius: 7,
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.02em',
  },
  toggleActive: {
    background: 'var(--lime)',
    color: '#07070A',
    fontWeight: 700,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    fontWeight: 400,
    padding: '14px 18px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  },
  textarea: {
    resize: 'vertical',
    minHeight: 100,
    lineHeight: 1.7,
  },
  inputMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: 0, margin: '4px 0',
  },
  dividerLine: {
    flex: 1, height: 1, background: 'var(--border)',
  },
  errorBox: {
    background: 'rgba(255,45,32,0.08)',
    border: '1px solid rgba(255,45,32,0.25)',
    borderRadius: 10,
    padding: '12px 18px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    background: 'var(--lime)',
    color: '#07070A',
    border: 'none',
    borderRadius: 12,
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.02em',
    padding: '18px 36px',
    cursor: 'pointer',
    transition: 'all 0.25s var(--ease-spring)',
    alignSelf: 'flex-start',
    minWidth: 220,
  },
}
