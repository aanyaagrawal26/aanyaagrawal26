import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'

/* ── Cloud data ── */
const CLOUD_DATA = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: i * 11, y: 5 + (i % 5) * 6,
  speed: 0.012 + (i % 4) * 0.008,
  w: 90 + (i % 4) * 55,
  opacity: 0.78 + (i % 3) * 0.07,
}))

const BLOCKS = [
  { id: 1, x: 20, label: '?', color: '#FFD700', reward: 'COIN' },
  { id: 2, x: 36, label: '?', color: '#FFD700', reward: 'COIN' },
  { id: 3, x: 52, label: '★', color: '#FF8C00', reward: 'NAME' },
  { id: 4, x: 68, label: '?', color: '#FFD700', reward: 'COIN' },
]

/* ─────────────────────────────────────────────────────────
   Mario drawn on a <canvas> — authentic NES pixel art.
   Exact 12-wide × 16-tall sprite from Super Mario Bros.
   Palette:
     . = transparent
     R = red   (#E84A23) — hat & shirt
     S = skin  (#FDB97D) — face & hands
     B = brown (#8B4513) — hair, shoes, outline
     O = blue  (#5B6DEE) — overalls
     G = gold  (#FFD700) — buttons
──────────────────────────────────────────────────────────*/
const MARIO_SRC = [
  '....RRRRR...',  // hat top
  '...RRRRRRR..',  // hat brim
  '...BBSSBBS..',  // hair + skin
  '..BSSSSSBS..',  // face
  '..BSSSSSSS..',  // face
  '..BSSRRSBB..',  // face with eyes hint
  '....SSSSS...',  // chin
  '..RROORRR...',  // shirt
  '.RRROORRRR..',  // shirt body
  'RRRROORRRRR.',  // shirt wide
  'BBRGOOBGRBB.',  // waist + buttons
  '.BOOOOOOB...',  // overalls
  '..BOSOOB....',  // legs split
  '..BB..BB....',  // shoes top
  '.BBB..BBB...',  // shoes
  '.BB....BB...',  // shoes bottom
]

const MARIO_PAL = {
  '.': null,
  R: '#E84A23',
  S: '#FDB97D',
  B: '#8B4513',
  O: '#5B6DEE',
  G: '#FFD700',
}

function drawMario(canvas, px) {
  if (!canvas) return
  const cols = 12
  const rows = MARIO_SRC.length
  canvas.width        = cols * px
  canvas.height       = rows * px
  canvas.style.width  = canvas.width  + 'px'
  canvas.style.height = canvas.height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  MARIO_SRC.forEach((row, r) => {
    for (let c = 0; c < 12; c++) {
      const color = MARIO_PAL[row[c] || '.']
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(c * px, r * px, px, px)
    }
  })
}

function CanvasMario({ px = 10 }) {
  const ref = useRef(null)
  useEffect(() => { drawMario(ref.current, px) }, [px])
  return <canvas ref={ref} style={{ imageRendering: 'pixelated', display: 'block' }} />
}

function PixelCoin({ size = 4 }) {
  const map = [[0,1,1,0],[1,2,2,1],[1,2,2,1],[0,1,1,0]]
  const clr = { 0: 'transparent', 1: '#B8860B', 2: '#FFD700' }
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(4,${size}px)`, gap:0 }}>
      {map.flat().map((v,i) => (
        <div key={i} style={{ width:size, height:size, background:clr[v] }} />
      ))}
    </div>
  )
}

export default function World1Sky({ onEnterPipe }) {
  const marioRef    = useRef(null)
  const heroRef     = useRef(null)
  const subtitleRef = useRef(null)
  const pipeRef     = useRef(null)
  const nameRef     = useRef(null)
  const sunRef      = useRef(null)

  const [blocks, setBlocks] = useState(() => BLOCKS.map(b => ({ ...b, hit: false })))
  const [coins, setCoins]   = useState([])
  const [clouds, setClouds] = useState(CLOUD_DATA)
  const [jumped, setJumped] = useState(false)

  const addCoins = useGameStore(s => s.addCoins)
  const addXP    = useGameStore(s => s.addXP)

  /* ── GSAP entrance ── */
  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(marioRef.current,
      { x: -160, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.3, ease: 'power3.out' }
    )
    .fromTo(heroRef.current,
      { opacity: 0, y: -28 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.6'
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3'
    )
    .add(() => {
      gsap.to(marioRef.current, {
        y: -10, repeat: -1, yoyo: true, duration: 0.7, ease: 'sine.inOut',
      })
    })

    /* Pipe glow */
    gsap.to(pipeRef.current, {
      boxShadow: '0 0 40px #00FF0099, 0 0 80px #00AA0055',
      repeat: -1, yoyo: true, duration: 1.4, ease: 'sine.inOut',
    })

    /* Sun slow spin */
    gsap.to(sunRef.current, {
      rotation: 360, repeat: -1, duration: 60,
      ease: 'none', transformOrigin: '50% 50%',
    })
  }, [])

  /* ── Cloud drift ── */
  useEffect(() => {
    const id = setInterval(() => {
      setClouds(prev => prev.map(c => ({ ...c, x: (c.x + c.speed) % 112 })))
    }, 55)
    return () => clearInterval(id)
  }, [])

  /* ── Block hit ── */
  const hitBlock = useCallback(b => {
    if (b.hit) return
    setBlocks(prev => prev.map(bl => bl.id === b.id ? { ...bl, hit: true } : bl))
    addCoins(5); addXP(10)
    setJumped(true)
    setTimeout(() => setJumped(false), 800)

    const batch = Array.from({ length: 7 }, (_, i) => ({
      id: Date.now() + i,
      x: b.x + (Math.random() - 0.5) * 5,
      y: 32 + Math.random() * 10,
    }))
    setCoins(prev => [...prev, ...batch])
    setTimeout(() => setCoins(prev => prev.filter(c => !batch.find(n => n.id === c.id))), 1100)

    /* Block bounce */
    const el = document.getElementById(`blk-${b.id}`)
    if (el) gsap.fromTo(el, { y: 0 }, { y: -16, duration: 0.1, ease: 'power2.out',
      onComplete: () => gsap.to(el, { y: 0, duration: 0.25, ease: 'bounce.out' }),
    })

    /* Name burst */
    if (b.id === 3 && nameRef.current) {
      gsap.fromTo(nameRef.current,
        { scale: 0, opacity: 0, y: 0 },
        { scale: 1.5, opacity: 1, y: -55, duration: 0.5, ease: 'back.out(2)',
          onComplete: () => gsap.to(nameRef.current, { opacity: 0, y: -110, duration: 0.6 }),
        }
      )
    }
  }, [addCoins, addXP])

  return (
    <div style={{
      width: '100%', height: 'calc(100vh - 64px)',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #0D47A1 0%, #1565C0 14%, #1976D2 28%, #42A5F5 50%, #90CAF9 66%, #B3E5FC 76%, #DCEDC8 85%, #66BB6A 92%, #388E3C 100%)',
    }}>

      {/* ── Ambient light near sun ── */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 320, height: 280,
        background: 'radial-gradient(ellipse at 70% 25%, rgba(255,220,80,.18), transparent 65%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ── Sun body ── */}
      <div ref={sunRef} style={{
        position: 'absolute',
        top: 28, right: 72,
        width: 88, height: 88,
        borderRadius: '50%', zIndex: 2,
        background: 'radial-gradient(circle at 38% 35%, #FFFDE7, #FFD700 55%, #FF8F00)',
        boxShadow: '0 0 50px #FFD700, 0 0 110px rgba(255,200,0,.55)',
        animation: 'sunPulse 3s ease-in-out infinite',
      }}>
        {/* Sun rays as children — so they rotate WITH the sun div */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 3, height: 52,
            background: 'linear-gradient(180deg, rgba(255,220,0,.7) 0%, transparent 100%)',
            transformOrigin: '50% 0%',         /* pivot at the sun center */
            transform: `rotate(${i * 30}deg) translateY(-100%)`,
            animation: `rayPulse 3s ${i * 0.22}s ease-in-out infinite`,
            borderRadius: 2,
          }} />
        ))}
      </div>

      {/* ── Clouds ── */}
      {clouds.map(c => (
        <div key={c.id} style={{
          position: 'absolute', left: `${c.x}%`, top: `${c.y}%`,
          zIndex: 3, pointerEvents: 'none', opacity: c.opacity,
        }}>
          <div style={{ position: 'relative', width: c.w, height: c.w * 0.42 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 50, background: 'rgba(255,255,255,.93)', boxShadow: '0 6px 20px rgba(255,255,255,.3)' }} />
            <div style={{ position: 'absolute', top: '-50%', left: '12%', width: '46%', height: '100%', borderRadius: '50%', background: 'rgba(255,255,255,.97)' }} />
            <div style={{ position: 'absolute', top: '-36%', left: '50%', width: '36%', height: '88%', borderRadius: '50%', background: 'rgba(255,255,255,.97)' }} />
            <div style={{ position: 'absolute', top: '-24%', left: '30%', width: '27%', height: '68%', borderRadius: '50%', background: '#fff' }} />
          </div>
        </div>
      ))}

      {/* ── Birds ── */}
      {[{x:13,y:17,d:'2s'},{x:31,y:11,d:'2.4s'},{x:57,y:21,d:'1.7s'},{x:76,y:14,d:'3.1s'}].map((b,i) => (
        <div key={i} style={{
          position: 'absolute', left: `${b.x}%`, top: `${b.y}%`,
          fontSize: 13, zIndex: 3, pointerEvents: 'none',
          animation: `float ${b.d} ease-in-out infinite`,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.28))',
        }}>🐦</div>
      ))}

      {/* ── Parallax hills ── */}
      <div style={{
        position: 'absolute', bottom: 70, left: 0, right: 0, height: 150, zIndex: 4, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 380px 150px at 10%  100%, #1B5E20, transparent)',
          'radial-gradient(ellipse 340px 130px at 30%  100%, #2E7D32, transparent)',
          'radial-gradient(ellipse 400px 145px at 54%  100%, #388E3C, transparent)',
          'radial-gradient(ellipse 340px 135px at 77%  100%, #43A047, transparent)',
          'radial-gradient(ellipse 280px 120px at 97%  100%, #2E7D32, transparent)',
        ].join(','),
      }} />

      {/* ── Ground ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, zIndex: 5,
        background: 'linear-gradient(180deg, #6D4C41 0%, #4E342E 100%)',
        borderTop: '5px solid #8D6E63',
        boxShadow: 'inset 0 8px 18px rgba(0,0,0,.28)',
      }}>
        {Array.from({ length: 38 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: i * 40, top: 5, width: 38, height: 36,
            border: '1px solid rgba(255,255,255,.055)',
            background: 'rgba(0,0,0,.045)',
          }} />
        ))}
      </div>

      {/* ── Bushes ── */}
      {[{ l: '5%', w: 92 }, { l: '42%', w: 82 }, { l: '80%', w: 72 }].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.l, bottom: 68,
          width: b.w, height: 42, zIndex: 5, pointerEvents: 'none',
        }}>
          <div style={{ position: 'absolute', top: 4, left: '18%', width: '64%', height: '90%', borderRadius: '50% 50% 0 0', background: '#388E3C', boxShadow: '0 0 12px rgba(56,142,60,.45)' }} />
          <div style={{ position: 'absolute', top: 8, left: '3%',  width: '42%', height: '80%', borderRadius: '50% 50% 0 0', background: '#43A047' }} />
          <div style={{ position: 'absolute', top: 8, left: '55%', width: '40%', height: '78%', borderRadius: '50% 50% 0 0', background: '#43A047' }} />
        </div>
      ))}

      {/* ── Fireflies ── */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${10 + (i * 7.5) % 80}%`,
          top: `${58 + (i % 5) * 5}%`,
          width: 5, height: 5, borderRadius: '50%',
          background: '#FFE57F',
          boxShadow: '0 0 8px #FFD700, 0 0 18px rgba(255,215,0,.5)',
          animation: `twinkle ${1.4 + i * 0.28}s ${i * 0.19}s ease-in-out infinite`,
          zIndex: 5, pointerEvents: 'none',
        }} />
      ))}

      {/* ── Question blocks ── */}
      {blocks.map(b => (
        <div
          id={`blk-${b.id}`}
          key={b.id}
          onClick={() => hitBlock(b)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && hitBlock(b)}
          aria-label={b.hit ? 'Used block' : `Hit the ${b.label} block`}
          style={{
            position: 'absolute', left: `${b.x}%`, bottom: 205,
            transform: 'translateX(-50%)',
            width: 54, height: 54,
            cursor: b.hit ? 'default' : 'pointer',
            background: b.hit ? '#546E7A' : `linear-gradient(145deg, ${b.color}, ${b.color}BB)`,
            border: `4px solid ${b.hit ? '#37474F' : '#4E342E'}`,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 20, color: b.hit ? '#37474F' : '#4E342E',
            boxShadow: b.hit ? 'none' : `0 6px 0 #4E342E, 0 0 26px ${b.color}88`,
            transition: 'all .12s', userSelect: 'none', outline: 'none', zIndex: 6,
            animation: b.hit ? 'none' : `float ${1.6 + b.id * 0.2}s ease-in-out infinite`,
          }}
        >
          {b.label}
          {!b.hit && (
            <div style={{
              position: 'absolute', top: 2, left: 3, right: 3, height: 10,
              background: 'rgba(255,255,255,.32)', borderRadius: 2, pointerEvents: 'none',
            }} />
          )}
        </div>
      ))}

      {/* ── Coin burst ── */}
      {coins.map(c => (
        <div key={c.id} style={{
          position: 'absolute', left: `${c.x}%`, bottom: `${c.y}%`,
          zIndex: 10, pointerEvents: 'none',
          animation: 'coinFloat 1.1s ease-out forwards',
        }}>
          <PixelCoin size={5} />
        </div>
      ))}

      {/* ── Mario (canvas — crisp NES pixels) ── */}
      <div ref={marioRef} style={{
        position: 'absolute', left: 58, bottom: 72, zIndex: 7,
        cursor: 'pointer',
      }}>
        <CanvasMario px={8} />
        {jumped && (
          <div style={{
            position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
            fontFamily: '"Press Start 2P", monospace', fontSize: 8,
            color: '#FFD700', textShadow: '0 0 10px #FFD700',
            animation: 'particleRise .75s ease-out forwards',
            whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>+5 🪙</div>
        )}
      </div>

      {/* ── Pipe ── */}
      <div
        ref={pipeRef}
        onClick={onEnterPipe}
        role="button" tabIndex={0}
        aria-label="Enter the pipe"
        onKeyDown={e => e.key === 'Enter' && onEnterPipe()}
        style={{
          position: 'absolute', right: 108, bottom: 70, zIndex: 7,
          width: 72, height: 100, cursor: 'pointer',
          background: 'linear-gradient(90deg,#1B5E20 0%,#2E7D32 22%,#4CAF50 50%,#2E7D32 78%,#1B5E20 100%)',
          border: '4px solid #1B5E20', borderRadius: '6px 6px 0 0',
        }}
      >
        <div style={{
          position: 'absolute', top: -16, left: -8, right: -8, height: 24,
          background: 'linear-gradient(90deg,#1B5E20,#388E3C,#66BB6A,#388E3C,#1B5E20)',
          border: '4px solid #1B5E20', borderRadius: '6px 6px 0 0',
        }} />
        <div style={{
          position: 'absolute', inset: 4, borderRadius: 2,
          background: 'linear-gradient(90deg,rgba(0,0,0,.3),transparent,rgba(0,0,0,.18))',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)',
          fontFamily: '"Press Start 2P", monospace', fontSize: 7,
          color: '#69F0AE', textShadow: '0 0 12px #00FF00',
          whiteSpace: 'nowrap', animation: 'blink 1.3s step-end infinite',
        }}>▼ ENTER</div>
      </div>

      {/* ── Flag ── */}
      <div style={{ position: 'absolute', right: 202, bottom: 70, zIndex: 6, pointerEvents: 'none' }}>
        <div style={{ width: 4, height: 130, background: '#9E9E9E', boxShadow: '2px 0 6px rgba(0,0,0,.4)' }} />
        <div style={{
          position: 'absolute', top: 0, left: 4, width: 44, height: 28,
          background: 'linear-gradient(90deg,#E53935,#EF5350)',
          clipPath: 'polygon(0 0,100% 50%,0 100%)',
          boxShadow: '0 0 12px rgba(229,57,53,.45)',
        }} />
      </div>

      {/* ── Hero text ── */}
      <div ref={heroRef} style={{
        position: 'absolute', top: '12%', left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center', zIndex: 8,
        width: '90%', maxWidth: 780, opacity: 0,
      }}>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(18px,3.8vw,38px)',
          color: '#fff',
          textShadow: '4px 4px #4E342E, 0 0 50px rgba(255,215,0,.9), 0 0 100px rgba(255,140,0,.5)',
          animation: 'titleFloat 2s ease-in-out infinite',
          letterSpacing: 4, lineHeight: 1.3,
        }}>
          AANYA AGRAWAL
        </div>

        <div ref={subtitleRef} style={{
          marginTop: 18,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(7px,1.3vw,11px)',
          background: 'linear-gradient(90deg,#FFD700,#FF8C00,#FFD700)',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer 3s ease-in-out infinite',
          lineHeight: 2.3, letterSpacing: 2, opacity: 0,
        }}>
          FULL-STACK DEV · CLOUD ENGINEER · AI RESEARCHER
        </div>

        <div style={{
          marginTop: 22,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(6px,1.1vw,9px)',
          color: 'rgba(255,255,255,.72)',
          animation: 'blink 1.5s step-end infinite', letterSpacing: 1,
        }}>
          ✦ HIT THE BLOCKS · ENTER THE PIPE ✦
        </div>

        <div style={{ marginTop: 26, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'GitHub',   url: 'https://github.com/aanyaagrawal26',                           color: '#e2e8f0', icon: '🐙' },
            { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aanya-agrawal-99b1a8322/',        color: '#38bdf8', icon: '💼' },
            { label: 'LeetCode', url: 'https://leetcode.com/u/aanya24_6/',                           color: '#FFA116', icon: '⌨️' },
          ].map(s => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: '"Press Start 2P", monospace', fontSize: 7,
                padding: '8px 16px',
                border: `2px solid ${s.color}`,
                borderRadius: 5, color: s.color,
                textDecoration: 'none',
                background: 'rgba(0,0,0,.55)',
                backdropFilter: 'blur(8px)',
                transition: 'all .2s',
                boxShadow: `0 0 14px ${s.color}33`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${s.color}22`
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 0 28px ${s.color}77`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,.55)'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = `0 0 14px ${s.color}33`
              }}
            >
              {s.icon} {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Name burst ── */}
      <div ref={nameRef} style={{
        position: 'absolute', top: '42%', left: '50%',
        transform: 'translate(-50%,-50%)',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 32, color: '#FFD700',
        textShadow: '3px 3px #4E342E, 0 0 40px #FFD700, 0 0 80px #FF8C00',
        opacity: 0, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 20,
      }}>★ AANYA ★</div>

      <style>{`
        @keyframes rayPulse  { 0%,100%{opacity:.35} 50%{opacity:.85} }
        @keyframes twinkle   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.15;transform:scale(.5)} }
        @keyframes coinFloat { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-90px) scale(.4)} }
        @keyframes titlePulse { 0%,100%{text-shadow:4px 4px #4E342E,0 0 40px rgba(255,215,0,.8)} 50%{text-shadow:4px 4px #4E342E,0 0 80px rgba(255,215,0,1),0 0 130px rgba(255,140,0,.6)} }
      `}</style>
    </div>
  )
}
