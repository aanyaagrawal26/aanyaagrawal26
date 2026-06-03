import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const NODES = [
  {
    id:1, x:8,  y:60, icon:'🎮', color:'#FFD700',
    label:'CODENEX',    sub:'Associate Member', date:'Nov 2024',
    detail:'Joined SRMIST\'s premier gaming & dev club. Helped organize hackathons and mentored juniors in web development and competitive programming.',
    xp:'+15 XP',
  },
  {
    id:2, x:22, y:30, icon:'💻', color:'#00aaff',
    label:'ACM SIGKDD', sub:'Core Member', date:'Apr 2025',
    detail:'Member of SRM\'s ACM chapter focused on data mining & knowledge discovery. Ran workshops on ML & data science for 60+ students.',
    xp:'+20 XP',
  },
  {
    id:3, x:39, y:55, icon:'🔬', color:'#00ff88',
    label:'SRM UROP',   sub:'AI Researcher', date:'Aug 2025',
    detail:'Undergraduate Research Opportunity — AI research on carbon footprint reduction in supply chains. Aligned with UN SDGs 9 & 13.',
    xp:'+30 XP',
  },
  {
    id:4, x:54, y:25, icon:'🚀', color:'#ff8c00',
    label:'NOVACODE',   sub:'Frontend Dev Trainee', date:'Aug–Oct 2025',
    detail:'Intensive 2-month training in React, performance optimization, and production-grade design systems with real client projects.',
    xp:'+25 XP',
  },
  {
    id:5, x:67, y:52, icon:'☁️', color:'#bf5af2',
    label:'MICROSOFT',  sub:'Elevate Program', date:'Ongoing',
    detail:'Selected for Microsoft Elevate — building cloud and AI expertise under direct Microsoft mentorship with real-world assignments.',
    xp:'+35 XP',
  },
  {
    id:6, x:81, y:26, icon:'💰', color:'#FFD700',
    label:'JP MORGAN',  sub:'Virtual Simulation', date:'Dec 2025',
    detail:'Completed JP Morgan\'s Software Engineering simulation — built a data feed interface & visual dashboard using Python and React.',
    xp:'+25 XP',
  },
  {
    id:7, x:93, y:56, icon:'📈', color:'#00ffcc',
    label:'MCKINSEY',   sub:'Forward Program', date:'Dec 2025',
    detail:'McKinsey Forward — a competitive program developing analytical thinking, leadership, and communication skills used in consulting.',
    xp:'+20 XP',
  },
]

// Road path style tiles between nodes
function PathDots({ x1, y1, x2, y2, unlocked, color }) {
  const steps = 8
  const dots = Array.from({length:steps}, (_,i) => ({
    cx: x1 + (x2-x1) * ((i+1)/(steps+1)),
    cy: y1 + (y2-y1) * ((i+1)/(steps+1)),
  }))
  return (
    <>
      {dots.map((d,i) => (
        <circle key={i}
          cx={`${d.cx}%`} cy={`${d.cy}%`}
          r={unlocked ? 3 : 2}
          fill={unlocked ? color : '#2a2a2a'}
          style={{ transition:`fill .4s ease ${i*.05}s` }}
          opacity={unlocked ? .8 : .4}
        />
      ))}
    </>
  )
}

export default function World6Map({ onNext }) {
  const [unlocked, setUnlocked] = useState([1])
  const [active, setActive]     = useState(NODES[0])
  const [animating, setAnimating] = useState(false)
  const detailRef = useRef(null)
  const mapRef    = useRef(null)

  useEffect(() => {
    if (mapRef.current) {
      gsap.fromTo(mapRef.current,
        { opacity:0, scale:.95 },
        { opacity:1, scale:1, duration:.8, ease:'back.out(1.3)' }
      )
    }
  }, [])

  const unlock = node => {
    if (animating) return
    const idx = NODES.findIndex(n => n.id === node.id)
    if (idx > 0 && !unlocked.includes(NODES[idx-1].id)) return

    setActive(node)

    if (!unlocked.includes(node.id)) {
      setAnimating(true)
      setUnlocked(p => [...p, node.id])
      setTimeout(() => setAnimating(false), 500)
    }

    if (detailRef.current) {
      gsap.fromTo(detailRef.current,
        { opacity:0, y:18, scale:.97 },
        { opacity:1, y:0, scale:1, duration:.35, ease:'back.out(1.4)' }
      )
    }
  }

  return (
    <div style={{
      width:'100%', height:'calc(100vh - 64px)', position:'relative', overflow:'hidden',
      background:'linear-gradient(180deg,#071007 0%,#0F1F0F 35%,#122012 65%,#071007 100%)',
      display:'flex', flexDirection:'column',
    }}>

      {/* ── Animated ground grid ── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(0,200,80,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,80,.05) 1px,transparent 1px)',
        backgroundSize:'44px 44px',
        animation:'mapPulse 6s ease-in-out infinite',
      }} />

      {/* ── Fog / atmosphere ── */}
      {[{x:'15%',y:'20%'},{x:'60%',y:'45%'},{x:'85%',y:'15%'}].map((f,i) => (
        <div key={i} style={{
          position:'absolute', left:f.x, top:f.y,
          width:200, height:100,
          background:'radial-gradient(ellipse,rgba(0,200,100,.06),transparent)',
          filter:'blur(30px)', pointerEvents:'none',
          animation:`aurora ${5+i*2}s ${i}s ease-in-out infinite`,
        }} />
      ))}

      {/* ── Header ── */}
      <div style={{
        textAlign:'center', padding:'24px 24px 6px', position:'relative', zIndex:2,
      }}>
        <h1 style={{
          fontFamily:'"Press Start 2P", monospace',
          fontSize:'clamp(13px,2.2vw,18px)', color:'#FFD700',
          textShadow:'0 0 28px #FFD700, 0 0 60px rgba(255,215,0,.3)',
          letterSpacing:2, marginBottom:7,
        }}>
          🗺️ EXPERIENCE MAP
        </h1>
        <div style={{
          fontFamily:'"Press Start 2P", monospace',
          fontSize:7, color:'rgba(255,255,255,.45)',
        }}>
          CLICK NODES IN ORDER — UNLOCK YOUR JOURNEY
        </div>
      </div>

      {/* ── Map ── */}
      <div ref={mapRef} style={{ flex:1, position:'relative', margin:'0 20px 6px', opacity:0 }}>

        {/* SVG paths + dots */}
        <svg style={{
          position:'absolute', inset:0, width:'100%', height:'100%',
          overflow:'visible', zIndex:1,
        }}>
          <defs>
            <filter id="mapGlow">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Path lines */}
          {NODES.slice(0,-1).map((node,i) => {
            const next = NODES[i+1]
            const pathOk = unlocked.includes(node.id) && unlocked.includes(next.id)
            return (
              <g key={node.id}>
                <line
                  x1={`${node.x}%`} y1={`${node.y}%`}
                  x2={`${next.x}%`} y2={`${next.y}%`}
                  stroke={pathOk ? node.color : '#1a1a1a'}
                  strokeWidth={pathOk ? 3 : 2}
                  strokeDasharray={pathOk ? 'none' : '8,5'}
                  filter={pathOk ? 'url(#mapGlow)' : 'none'}
                  style={{ transition:'stroke .5s ease' }}
                />
                <PathDots
                  x1={node.x} y1={node.y}
                  x2={next.x} y2={next.y}
                  unlocked={pathOk} color={node.color}
                />
              </g>
            )
          })}
        </svg>

        {/* Nodes */}
        {NODES.map(node => {
          const isUnlocked  = unlocked.includes(node.id)
          const isActive    = active?.id === node.id
          const idx         = NODES.findIndex(n => n.id === node.id)
          const isClickable = idx === 0 || unlocked.includes(NODES[idx-1].id)

          return (
            <div key={node.id}
              onClick={() => isClickable && unlock(node)}
              role="button"
              aria-label={isUnlocked ? node.label : 'Locked experience node'}
              style={{
                position:'absolute',
                left:`${node.x}%`, top:`${node.y}%`,
                transform:'translate(-50%,-50%)',
                cursor: isClickable ? 'pointer' : 'not-allowed',
                textAlign:'center', zIndex:3,
              }}
            >
              {/* Ring pulse for active */}
              {isActive && (
                <div style={{
                  position:'absolute', top:'50%', left:'50%',
                  width:80, height:80, borderRadius:'50%',
                  border:`2px solid ${node.color}`,
                  animation:'ripple 1.5s ease-out infinite',
                  zIndex:-1,
                }} />
              )}

              <div style={{
                width:62, height:62, borderRadius:'50%',
                background: isUnlocked
                  ? `radial-gradient(circle at 35% 35%,${node.color}44,${node.color}11)`
                  : 'rgba(30,30,30,.9)',
                border:`3px solid ${isUnlocked ? node.color : '#2a2a2a'}`,
                boxShadow: isUnlocked
                  ? `0 0 28px ${node.color}99, 0 0 56px ${node.color}33`
                  : 'none',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:26, transition:'all .4s ease',
                animation: isUnlocked && !isActive ? 'nodePulse 2.5s ease-in-out infinite' : 'none',
                transform: isActive ? 'scale(1.22)' : 'scale(1)',
                filter: isUnlocked && !isActive ? `drop-shadow(0 0 6px ${node.color})` : 'none',
              }}>
                {isUnlocked ? node.icon : '🔒'}
              </div>

              {/* Label */}
              {isUnlocked && (
                <div style={{ marginTop:8, position:'relative' }}>
                  <div style={{
                    fontFamily:'"Press Start 2P", monospace',
                    fontSize:6, color:node.color,
                    textShadow:`0 0 10px ${node.color}`,
                    lineHeight:2, whiteSpace:'nowrap',
                  }}>
                    {node.label}
                  </div>
                  <div style={{
                    fontFamily:'"Press Start 2P", monospace',
                    fontSize:5, color:'rgba(255,255,255,.4)', marginTop:1,
                  }}>
                    {node.date}
                  </div>
                  {/* XP badge */}
                  <div style={{
                    marginTop:2, display:'inline-block',
                    fontFamily:'"Press Start 2P", monospace', fontSize:5,
                    color:'#00ff88', background:'rgba(0,255,136,.1)',
                    border:'1px solid rgba(0,255,136,.3)',
                    padding:'2px 5px', borderRadius:3,
                  }}>
                    {node.xp}
                  </div>
                </div>
              )}

              {/* Flag */}
              {isUnlocked && (
                <div style={{
                  position:'absolute', top:-36, left:'50%',
                  transform:'translateX(-50%)',
                  fontSize:16, animation:'flagRise .5s ease-out',
                }}>
                  🚩
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Active detail card ── */}
      {active && (
        <div ref={detailRef} style={{
          position:'absolute', bottom:68, left:'50%',
          transform:'translateX(-50%)',
          background:'rgba(0,0,0,.95)',
          border:`2px solid ${active.color}`,
          borderRadius:12, padding:'16px 28px', zIndex:10,
          textAlign:'center', maxWidth:460, width:'92%',
          boxShadow:`0 0 50px ${active.color}33, inset 0 0 20px ${active.color}06`,
          backdropFilter:'blur(16px)',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:6 }}>
            <span style={{ fontSize:22 }}>{active.icon}</span>
            <div style={{
              fontFamily:'"Press Start 2P", monospace',
              fontSize:10, color:active.color,
              textShadow:`0 0 12px ${active.color}`,
            }}>
              {active.label}
            </div>
          </div>
          <div style={{
            fontFamily:'"Press Start 2P", monospace',
            fontSize:7, color:'rgba(255,255,255,.55)', marginBottom:10,
          }}>
            {active.sub} · {active.date}
          </div>
          <p style={{
            fontFamily:'system-ui,sans-serif',
            fontSize:12, color:'rgba(255,255,255,.8)', lineHeight:1.75, margin:0,
          }}>
            {active.detail}
          </p>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ textAlign:'center', padding:'10px 24px 20px', position:'relative', zIndex:4 }}>
        <button onClick={onNext} style={{
          background:'linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,140,0,.07))',
          border:'2px solid #FFD700', color:'#FFD700',
          padding:'12px 28px',
          fontFamily:'"Press Start 2P", monospace', fontSize:9,
          cursor:'pointer', borderRadius:7,
          boxShadow:'0 0 24px rgba(255,215,0,.3)',
          transition:'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,215,0,.18)'; e.currentTarget.style.transform='translateY(-4px) scale(1.04)'; e.currentTarget.style.boxShadow='0 0 50px rgba(255,215,0,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background='linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,140,0,.07))'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 24px rgba(255,215,0,.3)' }}
        >
          ✉️ FINAL BOSS ▶
        </button>
      </div>

      <style>{`
        @keyframes mapPulse { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.25) saturate(1.3)} }
        @keyframes ripple { 0%{transform:translate(-50%,-50%) scale(0);opacity:.7} 100%{transform:translate(-50%,-50%) scale(3);opacity:0} }
      `}</style>
    </div>
  )
}
