import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Scene3D from './components/Scene3D.jsx'
import DiagnosticForm from './components/DiagnosticForm.jsx'
import Results from './components/Results.jsx'

/* ── Glitch text effect ── */
function GlitchText({ children, style }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      {/* base layer */}
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
      {/* red channel shift */}
      <span aria-hidden style={{
        position: 'absolute', inset: 0, color: '#FF2D20',
        clipPath: 'inset(30% 0 50% 0)',
        transform: 'translateX(-3px)',
        animation: 'glitch 4s steps(1) infinite',
        animationDelay: '1.2s',
        zIndex: 1,
      }}>{children}</span>
      {/* cyan channel shift */}
      <span aria-hidden style={{
        position: 'absolute', inset: 0, color: '#00CFFF',
        clipPath: 'inset(60% 0 20% 0)',
        transform: 'translateX(3px)',
        animation: 'glitch 4s steps(1) infinite',
        animationDelay: '1.5s',
        zIndex: 1,
      }}>{children}</span>
    </span>
  )
}

/* ── Live status ticker ── */
function StatusTicker() {
  const items = ['GEMINI 2.5 FLASH ACTIVE', 'NHTSA VPIC CONNECTED', 'OBD-II PARSER READY', 'DIAGNOSTICS ONLINE']
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={tickerStyles.wrap}>
      <span style={tickerStyles.dot} />
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          className="mono"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          style={tickerStyles.text}
        >
          {items[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

const tickerStyles = {
  wrap: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--green)', boxShadow: '0 0 8px var(--green)',
    animation: 'blink 2s ease-in-out infinite',
    flexShrink: 0,
  },
  text: { fontSize: 11, letterSpacing: '0.16em', color: 'var(--text-muted)', textTransform: 'uppercase' },
}

/* ── Hero Section ── */
function HeroSection() {
  const formRef = useRef()

  function scrollToForm() {
    document.getElementById('diagnose')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section style={heroStyles.section}>
      {/* Three.js fills the hero */}
      <Scene3D style={heroStyles.canvas} />

      {/* Gradient vignette over the canvas edges */}
      <div style={heroStyles.vignette} />

      {/* Content overlay */}
      <div style={heroStyles.content}>
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={heroStyles.topBar}
        >
          <div style={heroStyles.wordmark}>
            <span className="mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--lime)' }}>OBD·II</span>
            <div style={{ width: 1, height: 14, background: 'var(--border-h)' }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Diagnostics</span>
          </div>
          <StatusTicker />
        </motion.div>

        {/* Main headline */}
        <div style={heroStyles.headline}>
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mono" style={heroStyles.eyebrow}>— ENGINE DIAGNOSTIC SYSTEM —</p>
            <h1 style={heroStyles.h1}>
              <GlitchText>DIAGNOSE</GlitchText>
              <br />
              <span style={{ color: 'var(--lime)', WebkitTextStroke: '0px' }}>ANYTHING.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={heroStyles.sub}
          >
            Decode OBD-II fault codes in seconds. Powered by Gemini AI,<br />
            NHTSA vehicle data, and deterministic diagnostic logic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <button onClick={scrollToForm} style={heroStyles.cta}>
              <span>Start Diagnostic</span>
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Pulse rings to indicate interactive CTA */}
            <div style={heroStyles.pulseWrap}>
              <span style={heroStyles.pulseRing1} />
              <span style={heroStyles.pulseRing2} />
              <span style={heroStyles.pulseCore} />
            </div>
          </motion.div>
        </div>

        {/* Bottom feature strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          style={heroStyles.strip}
        >
          {[
            { val: '2–4', label: 'Probable Causes' },
            { val: '< 5s', label: 'Diagnosis Time' },
            { val: 'NHTSA', label: 'VIN Decode Source' },
            { val: 'Gemini', label: 'AI Engine' },
          ].map(({ val, label }) => (
            <div key={label} style={heroStyles.stripItem}>
              <span className="mono" style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 700, color: 'var(--text)' }}>{val}</span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scan line animation overlay */}
      <div style={heroStyles.scanline} />
    </section>
  )
}

const heroStyles = {
  section: {
    position: 'relative',
    height: '100dvh',
    minHeight: 640,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(5,5,10,0.7) 100%),
      linear-gradient(to bottom, rgba(5,5,10,0.3) 0%, transparent 30%, transparent 65%, rgba(5,5,10,0.95) 100%)
    `,
    pointerEvents: 'none',
  },
  scanline: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, transparent 50%, rgba(201,255,59,0.015) 50%)',
    backgroundSize: '100% 4px',
    pointerEvents: 'none',
    opacity: 0.6,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '28px clamp(24px, 6vw, 80px)',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.22em',
    color: 'var(--text-dim)',
    marginBottom: 16,
  },
  h1: {
    fontSize: 'clamp(64px, 11vw, 140px)',
    fontWeight: 700,
    lineHeight: 0.92,
    letterSpacing: '-0.04em',
    marginBottom: 28,
    WebkitTextStroke: '1px rgba(255,255,255,0.15)',
  },
  headline: {
    maxWidth: 720,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  sub: {
    fontSize: 'clamp(14px, 1.5vw, 17px)',
    lineHeight: 1.75,
    color: 'var(--text-muted)',
    marginBottom: 36,
  },
  cta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(201,255,59,0.1)',
    border: '1px solid rgba(201,255,59,0.35)',
    color: 'var(--lime)',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.04em',
    padding: '14px 28px',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  pulseWrap: {
    position: 'relative',
    width: 20, height: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  pulseRing1: {
    position: 'absolute',
    width: 20, height: 20, borderRadius: '50%',
    border: '1px solid var(--lime)',
    animation: 'pulse-ring 2s ease-out infinite',
  },
  pulseRing2: {
    position: 'absolute',
    width: 20, height: 20, borderRadius: '50%',
    border: '1px solid var(--lime)',
    animation: 'pulse-ring 2s ease-out 0.6s infinite',
  },
  pulseCore: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--lime)',
    boxShadow: '0 0 8px var(--lime)',
    position: 'relative',
    zIndex: 1,
  },
  strip: {
    display: 'flex',
    gap: 'clamp(24px, 5vw, 64px)',
    alignItems: 'flex-end',
    paddingBottom: 8,
  },
  stripItem: {
    display: 'flex', flexDirection: 'column', gap: 4,
  },
}

/* ── Separator between hero and form ── */
function Separator() {
  return (
    <div style={{ position: 'relative', height: 1, background: 'var(--border)', margin: '0 24px', overflow: 'visible' }}>
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--bg)',
        padding: '0 16px',
      }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-dim)' }}>◆</span>
      </div>
    </div>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={footerStyles.wrap}>
      <div style={footerStyles.inner}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.12em' }}>
          OBD·II AI DIAGNOSTICS
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
          POWERED BY GOOGLE GEMINI · NHTSA VPIC · FASTAPI
        </span>
      </div>
    </footer>
  )
}

const footerStyles = {
  wrap: {
    borderTop: '1px solid var(--border)',
    padding: '32px 24px',
  },
  inner: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
}

/* ── Root App ── */
export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleResult(data) {
    setResult(data)
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <>
      <HeroSection />
      <Separator />
      <DiagnosticForm onResult={handleResult} onLoading={setLoading} loading={loading} />
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Results data={result} />
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />

      {/* Focus ring for inputs */}
      <style>{`
        input:focus, textarea:focus {
          border-color: rgba(201,255,59,0.5) !important;
          box-shadow: 0 0 0 3px rgba(201,255,59,0.08), inset 0 0 0 1px rgba(201,255,59,0.1) !important;
          background: rgba(255,255,255,0.06) !important;
          outline: none;
        }
        button[type=submit]:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(201,255,59,0.25);
        }
        button[type=submit]:active:not(:disabled) {
          transform: translateY(0px);
        }
        button[type=submit]:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .toggle-btn:hover { background: rgba(255,255,255,0.06); }
        button[style*="background: var(--lime)"]:hover,
        [style*="background: rgba(201,255,59,0.1)"]:hover {
          background: rgba(201,255,59,0.18) !important;
        }
      `}</style>
    </>
  )
}
