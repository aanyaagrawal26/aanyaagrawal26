import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'

const BIO = "Hey! I'm Aanya Agrawal — a B.Tech CSE (Cloud Computing) student at SRMIST Chennai with a 9.21 CGPA. I build full-stack apps, explore AI systems, and love turning complex ideas into clean code. From hackathons to research, I'm always leveling up! 🍄"

const STATS = [
  { label:'CGPA',      value:'9.21 / 10',   icon:'🎓', color:'#FFD700' },
  { label:'REPOS',     value:'27 on GitHub', icon:'📦', color:'#00aaff' },
  { label:'CERTS',     value:'15+ Earned',   icon:'🏅', color:'#ff8c00' },
  { label:'STACK',     value:'MERN + Cloud', icon:'⚡', color:'#00ff88' },
]

const CRYSTAL_COLORS = ['#00ffcc','#ff00ff','#00aaff','#9b59b6','#ffff00','#ff6b6b','#00ff88','#ff4444']

// Floating text tags about Aanya
const FLOAT_TAGS = [
  'React','Python','Cloud','GSAP','Node.js','Three.js','AI/ML',
  'MongoDB','TypeScript','Git','Docker','FastAPI',
]

export default function World3Underground({ onNext }) {
  const dialogRef  = useRef(null)
  const wallRef    = useRef(null)
  const gridRef    = useRef(null)

  const [typed, setTyped]             = useState('')
  const [wallBroken, setWallBroken]   = useState(false)
  const [showSecret, setShowSecret]   = useState(false)
  const [hoveredStat, setHoveredStat] = useState(null)

  // Random positions for float tags (computed once)
  const tagPositions = useMemo(() =>
    FLOAT_TAGS.map((_, i) => ({
      top: `${8 + (i*7) % 82}%`,
      left: i % 2 === 0 ? `${2 + (i*5) % 12}%` : `${86 + (i*3) % 11}%`,
      delay: `${i * 0.4}s`,
      duration: `${3 + (i % 4) * .7}s`,
    })),
  [])

  /* ── Typewriter ── */
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (i < BIO.length) setTyped(BIO.slice(0, ++i))
      else clearInterval(id)
    }, 22)
    return () => clearInterval(id)
  }, [])

  /* ── Dialog entrance ── */
  useEffect(() => {
    if (!dialogRef.current) return
    gsap.fromTo(dialogRef.current,
      { opacity:0, y:50, scale:.92 },
      { opacity:1, y:0, scale:1, duration:.9, ease:'back.out(1.5)', delay:.25 }
    )
    // Animate grid lines
    if (gridRef.current) {
      gsap.fromTo(gridRef.current, { opacity:0 }, { opacity:1, duration:1.5, delay:.5 })
    }
  }, [])

  const breakWall = () => {
    if (wallBroken) return
    setWallBroken(true)
    gsap.to(wallRef.current, {
      scale:0, rotation:25, opacity:0,
      duration:.4, ease:'back.in(1.7)',
      onComplete:() => setShowSecret(true),
    })
    // Shatter particles
    Array.from({length:8}).forEach((_, i) => {
      const p = document.createElement('div')
      p.style.cssText = `position:fixed;width:8px;height:8px;background:#FFD700;border-radius:2px;pointer-events:none;z-index:9999;right:8%;top:50%;`
      document.body.appendChild(p)
      gsap.to(p, {
        x: (Math.random()-.5)*120, y: (Math.random()-.5)*120,
        opacity:0, rotation: Math.random()*360,
        duration:.7, ease:'power2.out',
        onComplete:() => p.remove(),
      })
    })
  }

  return (
    <div style={{
      width:'100%', minHeight:'calc(100vh - 64px)', position:'relative',
      overflow:'hidden',
      background:'linear-gradient(180deg,#02020F 0%,#050A1A 30%,#080D1F 60%,#020208 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'50px 24px',
    }}>

      {/* ── Animated grid ── */}
      <div ref={gridRef} style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:'linear-gradient(rgba(0,255,204,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,204,.04) 1px,transparent 1px)',
        backgroundSize:'50px 50px',
      }} />

      {/* ── Hex grid dots ── */}
      {Array.from({length:30}).map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${(i%6)*17+1}%`, top:`${Math.floor(i/6)*18+3}%`,
          width:3, height:3, borderRadius:'50%',
          background:CRYSTAL_COLORS[i%CRYSTAL_COLORS.length],
          boxShadow:`0 0 8px ${CRYSTAL_COLORS[i%CRYSTAL_COLORS.length]}`,
          animation:`twinkle ${2+i*.3}s ${i*.18}s ease-in-out infinite`,
          opacity:.5, zIndex:0, pointerEvents:'none',
        }} />
      ))}

      {/* ── Crystals bottom ── */}
      {Array.from({length:16}).map((_,i) => {
        const color = CRYSTAL_COLORS[i%CRYSTAL_COLORS.length]
        return (
          <div key={i} style={{
            position:'absolute',
            left:`${2+i*6.2}%`, bottom:`${2+(i%5)*5}%`,
            width:5+(i%4)*4, height:24+(i%5)*16,
            background:`linear-gradient(180deg,${color},transparent)`,
            clipPath:'polygon(50% 0%,100% 100%,0% 100%)',
            boxShadow:`0 0 18px ${color}`,
            animation:`crystalPulse ${1.3+(i%3)*.45}s ${i*.14}s ease-in-out infinite`,
            opacity:.8, zIndex:1, pointerEvents:'none',
          }} />
        )
      })}

      {/* ── Floating skill tags (sides) ── */}
      {FLOAT_TAGS.map((tag, i) => (
        <div key={tag} style={{
          position:'absolute', top:tagPositions[i].top, left:tagPositions[i].left,
          fontFamily:'"Press Start 2P", monospace', fontSize:6,
          color:`${CRYSTAL_COLORS[i%CRYSTAL_COLORS.length]}88`,
          border:`1px solid ${CRYSTAL_COLORS[i%CRYSTAL_COLORS.length]}33`,
          borderRadius:3, padding:'3px 7px',
          animation:`float ${tagPositions[i].duration} ${tagPositions[i].delay} ease-in-out infinite`,
          zIndex:1, pointerEvents:'none', whiteSpace:'nowrap',
          backdropFilter:'blur(3px)',
        }}>
          {tag}
        </div>
      ))}

      {/* ── Floating bio particles ── */}
      {Array.from({length:18}).map((_,i) => {
        const color = CRYSTAL_COLORS[i%CRYSTAL_COLORS.length]
        return (
          <div key={i} style={{
            position:'absolute',
            left:`${5+(i*5.4)%90}%`, top:`${5+(i*7.1)%85}%`,
            width:4+(i%3)*3, height:4+(i%3)*3, borderRadius:'50%',
            background:color, boxShadow:`0 0 ${10+(i%3)*8}px ${color}`,
            animation:`float ${2.5+(i%4)*.8}s ${i*.22}s ease-in-out infinite`,
            opacity:.45, zIndex:1, pointerEvents:'none',
          }} />
        )
      })}

      {/* ── Main dialog ── */}
      <div ref={dialogRef} style={{
        position:'relative', zIndex:10, width:'100%', maxWidth:720,
        padding:38,
        background:'linear-gradient(135deg,rgba(0,0,0,.92),rgba(5,10,25,.95))',
        border:'2px solid rgba(0,255,204,.35)',
        borderRadius:14,
        boxShadow:'0 0 80px rgba(0,255,204,.15),inset 0 0 40px rgba(0,255,204,.04),0 0 0 1px rgba(0,255,204,.1)',
        backdropFilter:'blur(20px)',
        opacity:0,
      }}>
        {/* ── Animated border glow ── */}
        <div style={{
          position:'absolute', inset:-2, borderRadius:14, zIndex:-1, pointerEvents:'none',
          background:'linear-gradient(135deg,#00ffcc22,transparent,#00aaff22,transparent)',
          animation:'spin 8s linear infinite',
        }} />

        {/* Speaker tag */}
        <div style={{
          position:'absolute', top:-18, left:32,
          background:'linear-gradient(90deg,#00ffcc,#00aaff)',
          color:'#000', padding:'4px 16px', borderRadius:5,
          fontFamily:'"Press Start 2P", monospace', fontSize:8, fontWeight:'bold',
          boxShadow:'0 0 20px rgba(0,255,204,.5)',
        }}>
          AANYA.EXE
        </div>

        {/* Blinking green LED */}
        <div style={{
          position:'absolute', top:-15, right:32,
          display:'flex', alignItems:'center', gap:6,
        }}>
          <div style={{
            width:8, height:8, borderRadius:'50%', background:'#00ff88',
            boxShadow:'0 0 10px #00ff88', animation:'blink 1s step-end infinite',
          }} />
          <span style={{
            fontFamily:'"Press Start 2P", monospace', fontSize:6, color:'#00ff88',
          }}>ONLINE</span>
        </div>

        {/* Bio text */}
        <p style={{
          fontFamily:'"Press Start 2P", monospace',
          fontSize:10, color:'#00ffcc',
          lineHeight:2.3, letterSpacing:.5,
          textShadow:'0 0 12px rgba(0,255,204,.7)',
          minHeight:165, margin:0,
        }}>
          {typed}
          <span style={{ animation:'typewriterCursor .5s step-end infinite' }}>▌</span>
        </p>

        {/* Stats */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:14, marginTop:30,
        }}>
          {STATS.map(s => (
            <div
              key={s.label}
              onMouseEnter={() => setHoveredStat(s.label)}
              onMouseLeave={() => setHoveredStat(null)}
              style={{
                padding:'16px 18px',
                background: hoveredStat === s.label
                  ? `linear-gradient(135deg,${s.color}22,${s.color}0a)`
                  : 'rgba(0,255,204,.06)',
                border:`1px solid ${hoveredStat === s.label ? s.color : 'rgba(0,255,204,.2)'}`,
                borderRadius:8,
                display:'flex', alignItems:'center', gap:12,
                transition:'all .25s ease',
                cursor:'default',
                boxShadow: hoveredStat === s.label ? `0 0 20px ${s.color}44` : 'none',
                transform: hoveredStat === s.label ? 'translateY(-2px)' : 'none',
              }}
            >
              <span style={{ fontSize:24 }}>{s.icon}</span>
              <div>
                <div style={{
                  fontFamily:'"Press Start 2P", monospace',
                  fontSize:6, color:`${s.color}88`, marginBottom:5,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily:'"Press Start 2P", monospace',
                  fontSize:9.5, color:'#fff',
                  textShadow: hoveredStat === s.label ? `0 0 10px ${s.color}` : 'none',
                }}>
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Secret wall ── */}
      {!wallBroken && (
        <button
          ref={wallRef}
          onClick={breakWall}
          aria-label="Hidden secret block — try clicking!"
          style={{
            position:'absolute', right:'7%', top:'48%',
            transform:'translateY(-50%)',
            width:60, height:60, cursor:'pointer',
            background:'linear-gradient(135deg,#37474F,#263238)',
            border:'3px solid #546E7A',
            borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26, boxShadow:'0 5px 0 #1a2327, inset 0 2px 4px rgba(255,255,255,.1)',
            outline:'none', zIndex:12, transition:'transform .12s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform='translateY(-50%) scale(1.1)'
            e.currentTarget.style.boxShadow='0 5px 0 #1a2327,0 0 20px rgba(255,215,0,.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform='translateY(-50%) scale(1)'
            e.currentTarget.style.boxShadow='0 5px 0 #1a2327, inset 0 2px 4px rgba(255,255,255,.1)'
          }}
        >
          🧱
        </button>
      )}

      {showSecret && (
        <div style={{
          position:'absolute', right:'6%', top:'32%', zIndex:12,
          textAlign:'center', animation:'scaleIn .5s ease-out',
        }}>
          <div style={{ fontSize:36, marginBottom:8, animation:'float 2s ease-in-out infinite' }}>🌟</div>
          <div style={{
            fontFamily:'"Press Start 2P", monospace', fontSize:7,
            color:'#FFD700', textShadow:'0 0 16px #FFD700',
            lineHeight:2.2, border:'2px solid #FFD70044',
            padding:'8px 10px', borderRadius:6,
            background:'rgba(0,0,0,.7)',
          }}>
            SECRET<br/>FOUND!<br/>SRM UROP<br/>RESEARCHER
          </div>
        </div>
      )}

      {/* ── Next button ── */}
      <button
        onClick={onNext}
        style={{
          marginTop:36, zIndex:10, position:'relative',
          background:'linear-gradient(135deg,rgba(0,255,204,.1),rgba(0,170,255,.1))',
          border:'2px solid #00ffcc',
          color:'#00ffcc', padding:'14px 32px',
          fontFamily:'"Press Start 2P", monospace', fontSize:9,
          cursor:'pointer', borderRadius:7,
          boxShadow:'0 0 30px rgba(0,255,204,.3), 0 4px 0 rgba(0,255,204,.2)',
          transition:'all .2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background='rgba(0,255,204,.2)'
          e.currentTarget.style.transform='translateY(-4px) scale(1.04)'
          e.currentTarget.style.boxShadow='0 0 50px rgba(0,255,204,.5), 0 8px 0 rgba(0,255,204,.2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background='linear-gradient(135deg,rgba(0,255,204,.1),rgba(0,170,255,.1))'
          e.currentTarget.style.transform='none'
          e.currentTarget.style.boxShadow='0 0 30px rgba(0,255,204,.3), 0 4px 0 rgba(0,255,204,.2)'
        }}
      >
        ⭐ SKILLS ZONE ▶
      </button>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.1;transform:scale(.5)} }
      `}</style>
    </div>
  )
}
