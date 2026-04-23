import { motion } from 'framer-motion'

const SEVERITY_META = {
  critical: { label: 'CRITICAL', color: '#FF2D20', bg: 'rgba(255,45,32,0.1)',  border: 'rgba(255,45,32,0.3)',  glow: '#FF2D20' },
  high:     { label: 'HIGH',     color: '#FF8C00', bg: 'rgba(255,140,0,0.1)',  border: 'rgba(255,140,0,0.3)',  glow: '#FF8C00' },
  medium:   { label: 'MEDIUM',   color: '#B06EFF', bg: 'rgba(176,110,255,0.1)',border: 'rgba(176,110,255,0.3)',glow: '#B06EFF' },
  low:      { label: 'LOW',      color: '#00E87A', bg: 'rgba(0,232,122,0.1)', border: 'rgba(0,232,122,0.3)', glow: '#00E87A' },
}

const EASE_COLORS = { Easy: '#00E87A', Moderate: '#FF8C00', Hard: '#FF2D20' }
const CONF_COLORS = { high: '#C9FF3B', medium: '#00CFFF', low: 'rgba(255,255,255,0.35)' }

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Results({ data }) {
  if (!data) return null

  const sev = SEVERITY_META[data.severity] ?? SEVERITY_META.medium
  const { vehicle, diagnostic_summary, probable_causes, safe_to_drive,
          estimated_repair_cost_usd: cost, recommended_actions,
          diagnostic_certainty_percent } = data

  return (
    <section id="results" style={styles.section}>
      {/* Section label */}
      <div style={styles.sectionLabel}>
        <span style={{ ...styles.labelDot, background: sev.color, boxShadow: `0 0 10px ${sev.glow}` }} />
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diagnostic Report</span>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" style={styles.grid}>

        {/* ── Vehicle + Severity banner ── */}
        <motion.div variants={card} style={{ ...styles.card, gridColumn: '1/-1', borderColor: sev.border, background: sev.bg }}>
          <div style={styles.bannerRow}>
            <div>
              <p className="mono" style={{ color: 'var(--text-dim)', fontSize: 11, letterSpacing: '0.14em', marginBottom: 4 }}>VEHICLE</p>
              <h3 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{vehicle.engine}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <SeverityBadge sev={sev} />
              <DriveStatus safe={safe_to_drive} />
            </div>
          </div>
        </motion.div>

        {/* ── Summary + Certainty ── */}
        <motion.div variants={card} style={{ ...styles.card, gridColumn: 'span 2' }}>
          <CardLabel>AI Summary</CardLabel>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text)', marginBottom: 20 }}>{diagnostic_summary}</p>
          <CertaintyBar value={diagnostic_certainty_percent} />
        </motion.div>

        {/* ── Repair cost ── */}
        <motion.div variants={card} style={styles.card}>
          <CardLabel>Estimated Repair Cost</CardLabel>
          <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginTop: 8 }}>
            <span className="mono" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: 'var(--lime)', letterSpacing: '-0.03em' }}>
              ${cost.min.toLocaleString()}
            </span>
            <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 16 }}>– ${cost.max.toLocaleString()} USD</span>
          </div>
        </motion.div>

        {/* ── Probable causes ── */}
        <motion.div variants={card} style={{ ...styles.card, gridColumn: '1/-1' }}>
          <CardLabel>Probable Causes</CardLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
            {probable_causes.map((pc, i) => (
              <CauseRow key={i} index={i} cause={pc} />
            ))}
          </div>
        </motion.div>

        {/* ── Recommended actions ── */}
        <motion.div variants={card} style={{ ...styles.card, gridColumn: '1/-1' }}>
          <CardLabel>Recommended Actions</CardLabel>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 0, marginTop: 4, listStyle: 'none' }}>
            {recommended_actions.map((action, i) => (
              <li key={i} style={styles.actionItem}>
                <span className="mono" style={{ color: 'var(--lime)', fontSize: 12, fontWeight: 700, minWidth: 24 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{action}</span>
              </li>
            ))}
          </ol>
        </motion.div>

      </motion.div>
    </section>
  )
}

/* ── Sub-components ── */

function CardLabel({ children }) {
  return (
    <p className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>
      {children}
    </p>
  )
}

function SeverityBadge({ sev }) {
  return (
    <div style={{
      background: sev.bg, border: `1px solid ${sev.border}`,
      borderRadius: 6, padding: '5px 14px',
      boxShadow: `0 0 20px ${sev.glow}30`,
    }}>
      <span className="mono" style={{ color: sev.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em' }}>
        {sev.label}
      </span>
    </div>
  )
}

function DriveStatus({ safe }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: safe ? 'var(--green)' : 'var(--red)',
        boxShadow: `0 0 8px ${safe ? 'var(--green)' : 'var(--red)'}`,
        animation: safe ? 'none' : 'blink 1.2s ease-in-out infinite',
      }} />
      <span className="mono" style={{ fontSize: 11, color: safe ? 'var(--green)' : 'var(--red)', letterSpacing: '0.12em' }}>
        {safe ? 'SAFE TO DRIVE' : 'DO NOT DRIVE'}
      </span>
    </div>
  )
}

function CertaintyBar({ value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>AI Certainty</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--lime)', fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--lime), var(--cyan))', borderRadius: 2 }}
        />
      </div>
    </div>
  )
}

function CauseRow({ index, cause }) {
  const easeColor = EASE_COLORS[cause.ease_of_check] ?? 'var(--text-muted)'
  const confColor = CONF_COLORS[cause.confidence_level] ?? 'var(--text-dim)'
  const rankColors = ['var(--lime)', 'var(--cyan)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)']

  return (
    <div style={styles.causeRow}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Rank indicator */}
        <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: rankColors[index], lineHeight: 1.2, minWidth: 32 }}>
          #{index + 1}
        </span>

        <div style={{ flex: 1 }}>
          {/* Cause name + badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{cause.cause}</span>
            <span style={{ ...styles.badge, color: easeColor, borderColor: `${easeColor}40` }}>
              {cause.ease_of_check}
            </span>
            <span style={{ ...styles.badge, color: confColor, borderColor: `${confColor}40` }}>
              {cause.confidence_level} confidence
            </span>
          </div>

          {/* Probability bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cause.probability_percent}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 + 0.4 }}
                style={{ height: '100%', background: rankColors[index], borderRadius: 2, opacity: 0.8 }}
              />
            </div>
            <span className="mono" style={{ fontSize: 12, color: rankColors[index], minWidth: 36, textAlign: 'right', fontWeight: 700 }}>
              {cause.probability_percent}%
            </span>
          </div>

          {/* Recommended check */}
          {cause.recommended_check && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 12 }}>
              {cause.recommended_check}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Styles ── */
const styles = {
  section: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '0 24px 120px',
  },
  sectionLabel: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36,
  },
  labelDot: {
    width: 6, height: 6, borderRadius: '50%',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '28px 28px 24px',
    backdropFilter: 'blur(12px)',
  },
  bannerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  badge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.1em',
    border: '1px solid',
    borderRadius: 4,
    padding: '2px 8px',
    textTransform: 'uppercase',
  },
  causeRow: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '16px 18px',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
}
