import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

/* ═══════════════════════════════════════════════════════════════
   INTRO SCREEN — cinematic Mario boot sequence
   Phase 1: Nintendo-style black screen with chime
   Phase 2: "AANYA WORLD" title card with pixel rain
   Phase 3: Press Start prompt with scanline overlay
   Phase 4: Warp-speed tunnel into the portfolio
═══════════════════════════════════════════════════════════════ */

/* Classic NES Mario standing sprite on canvas */
const SPRITE = [
  '....RRRR....',
  '...RRRRRR...',
  '...BBSSBBS..',
  '..BSSSSSBS..',
  '..BSSSSSSS..',
  '..BSSRRSBB..',
  '....SSSSS...',
  '..RROORRR...',
  '.RRROORRRR..',
  'RRRROORRRRR.',
  'BBRGOOBGRBB.',
  '.BOOOOOOB...',
  '..BOSOOB....',
  '..BB..BB....',
  '.BBB..BBB...',
  '.BB....BB...',
]
const PAL = { '.':null, R:'#E84A23', S:'#FDB97D', B:'#8B4513', O:'#5B6DEE', G:'#FFD700' }

function drawSprite(canvas, px) {
  if (!canvas) return
  canvas.width  = 12 * px
  canvas.height = 16 * px
  canvas.style.width  = canvas.width  + 'px'
  canvas.style.height = canvas.height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  SPRITE.forEach((row, r) => {
    for (let c = 0; c < 12; c++) {
      const col = PAL[row[c]]
      if (!col) continue
      ctx.fillStyle = col
      ctx.fillRect(c * px, r * px, px, px)
    }
  })
}

/* Coin pixel */
function drawCoin(canvas, px) {
  if (!canvas) return
  const map = [[0,1,1,0],[1,2,2,1],[1,2,2,1],[0,1,1,0]]
  const pal = {0:null,1:'#B8860B',2:'#FFD700'}
  canvas.width  = 4 * px
  canvas.height = 4 * px
  canvas.style.width  = canvas.width  + 'px'
  canvas.style.height = canvas.height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  map.forEach((row, r) => row.forEach((v, c) => {
    if (pal[v]) { ctx.fillStyle = pal[v]; ctx.fillRect(c*px, r*px, px, px) }
  }))
}

export default function IntroScreen({ onEnter }) {
  const [phase, setPhase] = useState('black')   // black | logo | press | warp
  const [coins, setCoins] = useState([])
  const [stars, setStars] = useState([])
  const [pressed, setPressed] = useState(false)

  const wrapperRef  = useRef(null)
  const titleRef    = useRef(null)
  const subtitleRef = useRef(null)
  const promptRef   = useRef(null)
  const marioRef    = useRef(null)
  const spriteRef   = useRef(null)
  const tunnelRef   = useRef(null)
  const logoRef     = useRef(null)

  /* ── Draw sprite on mount ── */
  useEffect(() => {
    if (spriteRef.current) drawSprite(spriteRef.current, 7)
  }, [phase])

  /* ── Generate starfield ── */
  useEffect(() => {
    setStars(Array.from({ length: 120 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      r: Math.random() * 1.4 + 0.3, speed: 0.3 + Math.random(),
      phase: Math.random() * Math.PI * 2,
    })))
  }, [])

  /* ── Phase timeline ── */
  useEffect(() => {
    // Phase 1: black screen for 800ms
    const t1 = setTimeout(() => setPhase('logo'), 800)
    return () => clearTimeout(t1)
  }, [])

  /* ── Logo phase animations ── */
  useEffect(() => {
    if (phase !== 'logo') return

    const tl = gsap.timeline()

    // Logo drops in
    if (logoRef.current) {
      gsap.fromTo(logoRef.current,
        { opacity: 0, y: -80, scale: 0.7 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.6)', delay: 0.1 }
      )
    }
    // Title
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, letterSpacing: '40px' },
        { opacity: 1, letterSpacing: '4px', duration: 1, ease: 'power3.out', delay: 0.5 }
      )
    }
    // Subtitle
    if (subtitleRef.current) {
      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 1.0 }
      )
    }
    // Mario walks in from left
    if (marioRef.current) {
      gsap.fromTo(marioRef.current,
        { x: -200, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.8,
          onComplete: () => {
            gsap.to(marioRef.current, { y: -12, repeat: -1, yoyo: true, duration: 0.7, ease: 'sine.inOut' })
          }
        }
      )
    }

    // Show press prompt after 1.6s
    const t = setTimeout(() => setPhase('press'), 1600)
    return () => clearTimeout(t)
  }, [phase])

  /* ── Press phase ── */
  useEffect(() => {
    if (phase !== 'press') return
    if (promptRef.current) {
      gsap.fromTo(promptRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }
      )
    }
    // Coin rain
    const interval = setInterval(() => {
      setCoins(prev => [
        ...prev.slice(-30),
        { id: Date.now() + Math.random(), x: Math.random() * 100, delay: 0 }
      ])
    }, 180)
    return () => clearInterval(interval)
  }, [phase])

  /* ── Enter handler ── */
  const handleEnter = () => {
    if (pressed) return
    setPressed(true)
    setPhase('warp')

    gsap.to(wrapperRef.current, {
      scale: 1.08, duration: 0.15, yoyo: true, repeat: 1,
      onComplete: () => {
        gsap.to(wrapperRef.current, {
          opacity: 0, scale: 22, duration: 0.8, ease: 'power3.in',
          onComplete: onEnter,
        })
      }
    })
  }

  /* ── Keyboard press start ── */
  useEffect(() => {
    if (phase !== 'press') return
    const handler = e => { if (e.key === 'Enter' || e.key === ' ') handleEnter() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, pressed])

  return (
    <div
      ref={wrapperRef}
      onClick={phase === 'press' ? handleEnter : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        cursor: phase === 'press' ? 'pointer' : 'default',
      }}
    >
      {/* ── Starfield ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {stars.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.r * 2, height: s.r * 2, borderRadius: '50%',
            background: '#fff',
            animation: `twinkleIntro ${1.5 + s.speed}s ${s.phase}s ease-in-out infinite`,
            opacity: 0.7,
          }} />
        ))}
      </div>

      {/* ── Scanlines ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0, rgba(0,0,0,.25) 1px, transparent 1px, transparent 4px)',
      }} />

      {/* ── CRT vignette ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.75) 100%)',
      }} />

      {/* ── Coin rain ── */}
      {coins.map(c => (
        <div key={c.id} style={{
          position: 'absolute', left: `${c.x}%`, top: '-5%',
          zIndex: 2, pointerEvents: 'none',
          animation: 'coinDrop 2.2s ease-in forwards',
          fontSize: 18,
        }}>🪙</div>
      ))}

      {/* ── Content ── */}
      {phase !== 'black' && (
        <div style={{
          position: 'relative', zIndex: 3,
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        }}>

          {/* Super Mario style logo top */}
          <div ref={logoRef} style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(10px,1.8vw,16px)',
            color: '#FF8C00',
            textShadow: '3px 3px #8B4513, 0 0 30px #FF8C00',
            letterSpacing: 4,
            marginBottom: 12,
            padding: '6px 24px',
            border: '2px solid rgba(255,140,0,.3)',
            borderRadius: 4,
            background: 'rgba(0,0,0,.5)',
          }}>
            ★ WORLD 1-1 ★
          </div>

          {/* Big name */}
          <div ref={titleRef} style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(28px,6vw,72px)',
            color: '#FFD700',
            textShadow: '5px 5px #8B4513, 0 0 60px #FFD700, 0 0 120px rgba(255,140,0,.6)',
            letterSpacing: 4,
            lineHeight: 1.1,
            opacity: 0,
          }}>
            AANYA
          </div>
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(28px,6vw,72px)',
            color: '#fff',
            textShadow: '5px 5px #333, 0 0 40px rgba(255,255,255,.4)',
            letterSpacing: 4,
            lineHeight: 1.1,
            marginBottom: 20,
          }}>
            AGRAWAL
          </div>

          {/* Subtitle */}
          <div ref={subtitleRef} style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(7px,1.3vw,12px)',
            color: '#00ffcc',
            textShadow: '0 0 20px #00ffcc',
            letterSpacing: 3,
            marginBottom: 40,
            opacity: 0,
          }}>
            FULL-STACK DEV · CLOUD ENGINEER · AI RESEARCHER
          </div>

          {/* Mario sprite */}
          <div ref={marioRef} style={{ marginBottom: 40, opacity: 0 }}>
            <canvas ref={spriteRef} style={{ imageRendering: 'pixelated', display: 'block' }} />
          </div>

          {/* Press Start prompt */}
          {phase === 'press' && (
            <div ref={promptRef} style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 'clamp(10px,1.8vw,16px)',
              color: '#FFD700',
              textShadow: '0 0 20px #FFD700',
              animation: 'blinkIntro 0.9s step-end infinite',
              letterSpacing: 2,
              padding: '14px 32px',
              border: '3px solid #FFD700',
              borderRadius: 6,
              background: 'rgba(0,0,0,.6)',
              boxShadow: '0 0 40px rgba(255,215,0,.3)',
              opacity: 0,
            }}>
              ▶ PRESS START / CLICK TO PLAY ◀
            </div>
          )}

          {/* Version tag */}
          {phase === 'press' && (
            <div style={{
              position: 'absolute', bottom: -80, left: '50%', transform: 'translateX(-50%)',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 8, color: 'rgba(255,255,255,.3)', whiteSpace: 'nowrap',
              letterSpacing: 2,
            }}>
              © 2025 AANYA CORP · ALL RIGHTS RESERVED
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes twinkleIntro { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:.1;transform:scale(.5)} }
        @keyframes coinDrop { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes blinkIntro { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}
