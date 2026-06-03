import { useState, useEffect, useRef, useCallback } from 'react'
import MarioCursor from './components/ui/MarioCursor'
import World1Sky from './components/worlds/World1Sky'
import World3Underground from './components/worlds/World3Underground'
import World4Skills from './components/worlds/World4Skills'
import World5Castle from './components/worlds/World5Castle'
import World6Map from './components/worlds/World6Map'
import World8Arcade from './components/worlds/World8Arcade'
import World9Terminal from './components/worlds/World9Terminal'
import World10Stats from './components/worlds/World10Stats'
import World7Contact from './components/worlds/World7Contact'
import PipeTransition from './components/game/PipeTransition'
import useGameStore from './store/gameStore'
import useKonami from './hooks/useKonami'

const WORLDS = [
  { n:1,  label:'W·1', name:'HOME',     icon:'🌤' },
  { n:3,  label:'W·2', name:'ABOUT',    icon:'👾' },
  { n:4,  label:'W·3', name:'SKILLS',   icon:'⭐' },
  { n:5,  label:'W·4', name:'PROJECTS', icon:'🏰' },
  { n:6,  label:'W·5', name:'EXP',      icon:'🗺' },
  { n:8,  label:'W·6', name:'AWARDS',   icon:'🏅' },
  { n:9,  label:'W·7', name:'TERMINAL', icon:'💻' },
  { n:10, label:'W·8', name:'STATS',    icon:'⚔️' },
  { n:7,  label:'W·9', name:'CONTACT',  icon:'✉️' },
]

/* ─ Starfield canvas hook ─────────────────────── */
function useStarfield(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, W, H
    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Stars of 3 types
    const stars = Array.from({ length: 220 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: i < 30 ? Math.random() * 2.5 + 1 : Math.random() * 1.2 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random(),
      color: i % 7 === 0 ? '#aaeeff' : i % 11 === 0 ? '#ffccaa' : '#fffce8',
    }))

    // Meteors
    const meteors = Array.from({ length: 4 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * (window.innerHeight / 2),
      vx: -(2 + Math.random() * 3),
      vy: 1 + Math.random() * 2,
      len: 80 + Math.random() * 120,
      life: 0,
      maxLife: 60 + Math.random() * 60,
      next: Math.random() * 300,
    }))

    const draw = t => {
      ctx.clearRect(0, 0, W, H)

      // Stars
      stars.forEach(s => {
        const alpha = 0.15 + 0.85 * Math.abs(Math.sin(t / 1800 * s.speed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.color.replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace('fffce8)', '255,252,232,').replace('aaeeff)', '170,238,255,').replace('ffccaa)', '255,204,170,') || `rgba(255,252,232,${alpha})`
        // fallback simple:
        ctx.fillStyle = `rgba(255,252,232,${alpha})`
        if (s.color === '#aaeeff') ctx.fillStyle = `rgba(170,238,255,${alpha})`
        if (s.color === '#ffccaa') ctx.fillStyle = `rgba(255,204,170,${alpha})`
        ctx.fill()
      })

      // Meteors
      meteors.forEach(m => {
        if (m.next > 0) { m.next--; return }
        m.life++
        if (m.life > m.maxLife) {
          m.x = Math.random() * W; m.y = Math.random() * H / 3
          m.life = 0; m.next = 120 + Math.random() * 300
          return
        }
        const progress = m.life / m.maxLife
        const alpha    = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7
        const cx = m.x + m.vx * m.life
        const cy = m.y + m.vy * m.life
        const grad = ctx.createLinearGradient(cx, cy, cx - m.vx * 20, cy - m.vy * 20)
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx - m.vx * 20, cy - m.vy * 20)
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.stroke()
      })

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
}

export default function App() {
  const [world, setWorld]          = useState(1)
  const [transitioning, setTrans]  = useState(false)
  const [secretVisible, setSecret] = useState(false)
  const [coinPop, setCoinPop]      = useState([])
  const [levelUp, setLevelUp]      = useState(false)
  const prevLevel                  = useRef(1)
  const canvasRef                  = useRef(null)

  const coins          = useGameStore(s => s.coins)
  const xp             = useGameStore(s => s.xp)
  const level          = useGameStore(s => s.level)
  const setStoreWorld  = useGameStore(s => s.setWorld)
  const secretUnlocked = useKonami()

  useStarfield(canvasRef)

  /* ── Level-up detection ── */
  useEffect(() => {
    if (level > prevLevel.current) {
      setLevelUp(true)
      prevLevel.current = level
      const t = setTimeout(() => setLevelUp(false), 2200)
      return () => clearTimeout(t)
    }
  }, [level])

  /* ── Konami secret ── */
  useEffect(() => {
    if (!secretUnlocked) return
    const show = setTimeout(() => setSecret(true), 0)
    const hide = setTimeout(() => setSecret(false), 7000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [secretUnlocked])

  /* ── Navigation ── */
  const goToWorld = useCallback(n => {
    if (n === world) return
    if (world === 1 && n === 3) { setTrans(true) }
    else { setWorld(n); setStoreWorld(n) }
  }, [world, setStoreWorld])

  const afterTransition = useCallback(() => {
    setTrans(false); setWorld(3); setStoreWorld(3)
  }, [setStoreWorld])

  /* ── Coin pop on HUD click ── */
  const spawnCoinPop = () => {
    const id = Date.now()
    setCoinPop(p => [...p, id])
    setTimeout(() => setCoinPop(p => p.filter(x => x !== id)), 900)
  }

  return (
    <div style={{ width:'100vw', minHeight:'100svh', background:'#000', position:'relative', overflow:'hidden' }}>

      {/* ── Starfield + meteors canvas ── */}
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />

      {/* ── Aurora bands ── */}
      {[
        { top:'15%', color:'rgba(0,200,120,.07)', w:'120%', delay:'0s' },
        { top:'28%', color:'rgba(80,0,200,.06)',  w:'110%', delay:'1.5s' },
        { top:'42%', color:'rgba(0,120,255,.05)', w:'130%', delay:'3s' },
      ].map((a,i) => (
        <div key={i} style={{
          position:'fixed', top:a.top, left:'-10%',
          width:a.w, height:120,
          background:`radial-gradient(ellipse at 50% 50%, ${a.color}, transparent)`,
          filter:'blur(40px)',
          animation:`aurora 6s ${a.delay} ease-in-out infinite`,
          pointerEvents:'none', zIndex:0,
        }} />
      ))}

      {/* ── Scanline overlay ── */}
      <div style={{
        position:'fixed', inset:0, zIndex:1, pointerEvents:'none',
        backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.08) 2px, rgba(0,0,0,.08) 4px)',
      }} />

      {/* ── CRT vignette ── */}
      <div style={{
        position:'fixed', inset:0, zIndex:1, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,.55) 100%)',
      }} />

      <MarioCursor />

      {/* ════════════════════════════════════════════
          TOP HUD — spectacular game bar
      ════════════════════════════════════════════ */}
      <header style={{
        position:'fixed', top:0, left:0, right:0, zIndex:2000,
        height:64,
        background:'linear-gradient(180deg, rgba(0,0,0,.98) 0%, rgba(10,5,0,.96) 100%)',
        borderBottom:'3px solid transparent',
        borderImage:'linear-gradient(90deg,#FF8C00,#FFD700,#FF8C00) 1',
        display:'flex', alignItems:'center',
        padding:'0 20px', gap:16,
        backdropFilter:'blur(20px)',
        animation:'hudGlow 4s ease-in-out infinite',
      }}>

        {/* ── Logo glitch text ── */}
        <div style={{ flexShrink:0, position:'relative', cursor:'pointer' }} onClick={spawnCoinPop}>
          <div style={{
            fontFamily:'"Press Start 2P", monospace',
            fontSize:11, color:'#FFD700',
            textShadow:'0 0 20px #FFD700, 0 0 40px #FF8C00, 2px 0 #FF4500',
            letterSpacing:2, whiteSpace:'nowrap',
            animation:'pulseGlow 3s ease-in-out infinite',
          }}>
            ★ AANYA
          </div>
          {/* Coin pops */}
          {coinPop.map(id => (
            <div key={id} style={{
              position:'absolute', top:-10, left:'50%',
              fontSize:16, pointerEvents:'none',
              animation:'particleRise .9s ease-out forwards',
            }}>🪙</div>
          ))}
        </div>

        {/* ── World navigation ── */}
        <nav style={{
          flex:1, display:'flex', gap:5,
          justifyContent:'center', alignItems:'center',
          flexWrap:'nowrap', overflow:'hidden',
        }}>
          {WORLDS.map(({ n, label, name, icon }) => {
            const active = world === n
            return (
              <button key={n} onClick={() => goToWorld(n)}
                aria-label={`Go to ${name}`}
                style={{
                  fontFamily:'"Press Start 2P", monospace',
                  fontSize:6, padding:'7px 10px',
                  background: active
                    ? 'linear-gradient(135deg,#FFD700 0%,#FF8C00 100%)'
                    : 'rgba(255,255,255,0.04)',
                  color: active ? '#000' : '#FFD700',
                  border:`2px solid ${active ? '#FFD700' : 'rgba(255,215,0,.2)'}`,
                  borderRadius:5, cursor:'pointer', whiteSpace:'nowrap',
                  transition:'all .18s ease',
                  transform: active ? 'translateY(-3px)' : 'none',
                  boxShadow: active ? '0 6px 20px rgba(255,215,0,.5), 0 3px 0 #8B4513' : 'none',
                  position:'relative', overflow:'hidden',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background='rgba(255,215,0,.1)'
                    e.currentTarget.style.borderColor='rgba(255,215,0,.6)'
                    e.currentTarget.style.transform='translateY(-2px)'
                    e.currentTarget.style.boxShadow='0 4px 12px rgba(255,215,0,.2)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background='rgba(255,255,255,0.04)'
                    e.currentTarget.style.borderColor='rgba(255,215,0,.2)'
                    e.currentTarget.style.transform='none'
                    e.currentTarget.style.boxShadow='none'
                  }
                }}
              >
                <span style={{ display:'block', fontSize:8 }}>{icon}</span>
                <span style={{ display:'block', fontSize:6, fontWeight:'bold', marginTop:1 }}>{label}</span>
                <span style={{
                  display:'block', fontSize:4.5, marginTop:1,
                  color: active ? 'rgba(0,0,0,.7)' : 'rgba(255,215,0,.45)',
                }}>
                  {name}
                </span>
                {/* Active shimmer */}
                {active && (
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(105deg, transparent 40%, rgba(255,255,255,.25) 50%, transparent 60%)',
                    backgroundSize:'200% 100%',
                    animation:'shimmer 2s ease-in-out infinite',
                    pointerEvents:'none',
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Stats panel ── */}
        <div style={{
          flexShrink:0, display:'flex', gap:12, alignItems:'center',
          fontFamily:'"Press Start 2P", monospace',
        }}>
          {/* Coins */}
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            background:'rgba(255,215,0,.08)',
            border:'1px solid rgba(255,215,0,.2)',
            borderRadius:5, padding:'4px 8px',
          }}>
            <div style={{ fontSize:5, color:'rgba(255,215,0,.6)' }}>COINS</div>
            <div style={{ fontSize:9, color:'#FFD700', textShadow:'0 0 10px #FFD700' }}>
              🪙{String(coins).padStart(4,'0')}
            </div>
          </div>

          {/* Level + XP bar */}
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            background:'rgba(0,255,136,.07)',
            border:'1px solid rgba(0,255,136,.2)',
            borderRadius:5, padding:'4px 8px',
            minWidth:80,
          }}>
            <div style={{ fontSize:5, color:'rgba(0,255,136,.6)' }}>LVL {String(level).padStart(2,'0')}</div>
            <div style={{
              width:'100%', height:4, background:'rgba(255,255,255,.1)',
              borderRadius:2, overflow:'hidden',
            }}>
              <div style={{
                height:'100%', width:`${xp % 100}%`,
                background:'linear-gradient(90deg,#00ff88,#00ffcc)',
                borderRadius:2, transition:'width .5s ease',
                boxShadow:'0 0 6px #00ff88',
              }} />
            </div>
            <div style={{ fontSize:5, color:'rgba(255,255,255,.5)' }}>{xp} XP</div>
          </div>
        </div>
      </header>

      {/* ── Level-up splash ── */}
      {levelUp && (
        <div style={{
          position:'fixed', top:'40%', left:'50%',
          transform:'translate(-50%,-50%)',
          fontFamily:'"Press Start 2P", monospace',
          fontSize:28, color:'#FFD700',
          textShadow:'0 0 30px #FFD700, 0 0 70px #FF8C00',
          zIndex:99998, pointerEvents:'none',
          animation:'levelUpPop 2.2s forwards',
        }}>
          ★ LEVEL UP! ★
        </div>
      )}

      {/* ── Main content ── */}
      <main style={{ position:'relative', zIndex:2, paddingTop:64, minHeight:'100svh' }}>
        {transitioning && <PipeTransition onComplete={afterTransition} />}
        {!transitioning && (
          <>
            {world === 1  && <World1Sky        onEnterPipe={() => goToWorld(3)} />}
            {world === 3  && <World3Underground onNext={()     => goToWorld(4)} />}
            {world === 4  && <World4Skills      onNext={()     => goToWorld(5)} />}
            {world === 5  && <World5Castle      onNext={()     => goToWorld(6)} />}
            {world === 6  && <World6Map         onNext={()     => goToWorld(8)} />}
            {world === 8  && <World8Arcade      onNext={()     => goToWorld(9)} />}
            {world === 9  && <World9Terminal    onNext={()     => goToWorld(10)} />}
            {world === 10 && <World10Stats      onNext={()     => goToWorld(7)} />}
            {world === 7  && <World7Contact />}
          </>
        )}
      </main>

      {/* ── Konami secret ── */}
      {secretVisible && (
        <div role="alert" style={{
          position:'fixed', bottom:32, left:'50%',
          fontFamily:'"Press Start 2P", monospace',
          color:'#FFD700', fontSize:10, letterSpacing:1,
          whiteSpace:'nowrap',
          background:'rgba(0,0,0,.97)',
          border:'3px solid #FFD700', borderRadius:10,
          padding:'16px 32px', zIndex:99999,
          textShadow:'0 0 16px #FFD700, 0 0 40px #FF8C00',
          boxShadow:'0 0 60px rgba(255,215,0,.4), 0 0 120px rgba(255,140,0,.2)',
          animation:'secretPop .4s cubic-bezier(.34,1.56,.64,1) both',
        }}>
          🌟 GALAXY MODE UNLOCKED! 🌟
        </div>
      )}
    </div>
  )
}
