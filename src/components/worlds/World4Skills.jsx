import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'

const SKILLS = [
  { id:1,  name:'React / Next.js', icon:'⚛️',  tier:'star',     color:'#61DAFB', xp:25, level:90, years:'2 yrs' },
  { id:2,  name:'Python',          icon:'🐍',  tier:'fire',     color:'#3776AB', xp:25, level:88, years:'3 yrs' },
  { id:3,  name:'Node.js',         icon:'🟢',  tier:'mushroom', color:'#4CAF50', xp:20, level:82, years:'1.5 yrs' },
  { id:4,  name:'TypeScript',      icon:'🔷',  tier:'mushroom', color:'#3178C6', xp:20, level:80, years:'1 yr' },
  { id:5,  name:'Three.js',        icon:'🌐',  tier:'star',     color:'#8B5CF6', xp:25, level:75, years:'6 mo' },
  { id:6,  name:'MySQL',           icon:'🗄️', tier:'mushroom', color:'#4479A1', xp:15, level:78, years:'1.5 yrs' },
  { id:7,  name:'Google Cloud',    icon:'☁️',  tier:'fire',     color:'#4285F4', xp:25, level:85, years:'1 yr' },
  { id:8,  name:'ML / AI',         icon:'🤖',  tier:'star',     color:'#FF6F00', xp:30, level:76, years:'1 yr' },
  { id:9,  name:'Git / GitHub',    icon:'🐙',  tier:'mushroom', color:'#F05032', xp:15, level:92, years:'3 yrs' },
  { id:10, name:'Tailwind CSS',    icon:'🎨',  tier:'mushroom', color:'#06B6D4', xp:15, level:88, years:'1.5 yrs' },
  { id:11, name:'C / C++',         icon:'⚙️',  tier:'mushroom', color:'#A8B9CC', xp:18, level:80, years:'2 yrs' },
  { id:12, name:'Java',            icon:'☕',  tier:'fire',     color:'#ED8B00', xp:18, level:77, years:'2 yrs' },
]

const TIER_META = {
  mushroom:{ label:'🍄 SUPER',      bg:'#FF444422', border:'#FF4444' },
  fire:    { label:'🔥 FIRE BALL',  bg:'#FF8C0022', border:'#FF8C00' },
  star:    { label:'⭐ STAR POWER', bg:'#FFD70022', border:'#FFD700' },
}

// Floating platform positions
const PLATFORMS = [
  {x:4,y:22,w:110},{x:20,y:38,w:90},{x:40,y:15,w:130},
  {x:60,y:32,w:100},{x:78,y:20,w:120},{x:90,y:42,w:80},
]

export default function World4Skills({ onNext }) {
  const [collected, setCollected] = useState([])
  const [effect, setEffect]       = useState(null)
  const [hovered, setHovered]     = useState(null)
  const headerRef                 = useRef(null)
  const gridRef                   = useRef(null)
  const effectRef                 = useRef(null)
  const { addCoins, addXP, setPowerUp } = useGameStore()

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity:0, y:-30 },
        { opacity:1, y:0, duration:.8, ease:'back.out(1.4)' }
      )
    }
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { opacity:0, y:30, scale:.9 },
        { opacity:1, y:0, scale:1, stagger:.05, duration:.5, ease:'back.out(1.6)', delay:.3 }
      )
    }
  }, [])

  const collect = skill => {
    if (collected.includes(skill.id)) return
    setCollected(p => [...p, skill.id])
    addCoins(4); addXP(skill.xp); setPowerUp(skill.tier)
    setEffect(skill)

    // Ripple effect
    const el = document.getElementById(`skill-${skill.id}`)
    if (el) {
      const ripple = document.createElement('div')
      ripple.style.cssText = `position:absolute;inset:0;border-radius:10px;border:3px solid ${skill.color};animation:rippleOut .6s ease-out forwards;pointer-events:none;z-index:5;`
      el.appendChild(ripple)
      setTimeout(() => ripple.remove(), 700)
    }
  }

  const allCollected = collected.length === SKILLS.length

  return (
    <div style={{
      width:'100%', minHeight:'calc(100vh - 64px)', position:'relative',
      background:'linear-gradient(180deg,#0D0426 0%,#160840 40%,#1A0A50 70%,#0D0426 100%)',
      padding:'44px 28px 60px', overflow:'hidden',
    }}>

      {/* ── Nebula clouds ── */}
      {[
        {c:'rgba(139,92,246,.12)',x:'20%',y:'30%',w:'50%',h:'40%'},
        {c:'rgba(59,130,246,.08)',x:'60%',y:'10%',w:'40%',h:'35%'},
        {c:'rgba(236,72,153,.07)',x:'5%', y:'60%',w:'35%',h:'30%'},
      ].map((n,i) => (
        <div key={i} style={{
          position:'absolute', left:n.x, top:n.y, width:n.w, height:n.h,
          background:`radial-gradient(ellipse,${n.c},transparent)`,
          filter:'blur(40px)', pointerEvents:'none', zIndex:0,
          animation:`aurora ${5+i*2}s ${i*1.5}s ease-in-out infinite`,
        }} />
      ))}

      {/* ── Floating platforms ── */}
      {PLATFORMS.map((p,i) => (
        <div key={i} style={{
          position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
          width:p.w, height:14,
          background:'linear-gradient(180deg,#8B4513 0%,#6B3410 100%)',
          borderRadius:'3px 3px 0 0', opacity:.28,
          boxShadow:'0 4px 12px rgba(0,0,0,.7)',
          animation:`float ${4+i*.5}s ${i*.4}s ease-in-out infinite`,
        }} />
      ))}

      {/* ── Star particles ── */}
      {Array.from({length:25}).map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${(i*4.1)%98}%`, top:`${(i*3.7)%95}%`,
          width:2+(i%3), height:2+(i%3), borderRadius:'50%',
          background:'#fff',
          boxShadow:`0 0 ${4+(i%4)*3}px #fff`,
          animation:`twinkle ${2+i*.3}s ${i*.2}s ease-in-out infinite`,
          opacity:.6, zIndex:0, pointerEvents:'none',
        }} />
      ))}

      {/* ── Header ── */}
      <div ref={headerRef} style={{
        textAlign:'center', marginBottom:40, position:'relative', zIndex:2, opacity:0,
      }}>
        <h1 style={{
          fontFamily:'"Press Start 2P", monospace',
          fontSize:'clamp(15px,2.8vw,24px)', color:'#FFD700',
          textShadow:'0 0 30px #FFD700, 0 0 70px rgba(255,140,0,.5)',
          letterSpacing:3, marginBottom:14,
        }}>
          ⭐ POWER-UP ZONE ⭐
        </h1>
        <div style={{
          fontFamily:'"Press Start 2P", monospace',
          fontSize:8, color:'rgba(255,255,255,.65)', marginBottom:16,
        }}>
          CLICK EACH SKILL TO COLLECT & UNLOCK STAR POWER
        </div>

        {/* Progress bar */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:14,
          background:'rgba(255,255,255,.05)', padding:'10px 24px',
          borderRadius:30, border:'1px solid rgba(255,215,0,.2)',
          backdropFilter:'blur(8px)',
        }}>
          <div style={{ display:'flex', gap:4 }}>
            {SKILLS.map(s => (
              <div key={s.id} style={{
                width:8, height:8, borderRadius:'50%',
                background: collected.includes(s.id) ? s.color : 'rgba(255,255,255,.15)',
                boxShadow: collected.includes(s.id) ? `0 0 8px ${s.color}` : 'none',
                transition:'all .4s',
              }} />
            ))}
          </div>
          <span style={{ fontFamily:'"Press Start 2P", monospace', fontSize:8, color:'#FFD700' }}>
            {collected.length}/{SKILLS.length}
          </span>
        </div>
      </div>

      {/* ── Skills grid ── */}
      <div ref={gridRef} style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(185px,1fr))',
        gap:18, maxWidth:1050, margin:'0 auto',
        position:'relative', zIndex:2,
      }}>
        {SKILLS.map(skill => {
          const isDone  = collected.includes(skill.id)
          const isHov   = hovered === skill.id
          const meta    = TIER_META[skill.tier]
          return (
            <div
              id={`skill-${skill.id}`}
              key={skill.id}
              onClick={() => collect(skill)}
              onMouseEnter={() => setHovered(skill.id)}
              onMouseLeave={() => setHovered(null)}
              role="button"
              aria-label={`${isDone ? 'Collected' : 'Collect'} ${skill.name}`}
              tabIndex={0}
              onKeyDown={e => e.key==='Enter' && collect(skill)}
              style={{
                padding:'22px 16px 18px',
                borderRadius:10, cursor: isDone ? 'default' : 'pointer',
                background: isDone
                  ? `linear-gradient(135deg,${skill.color}22,${skill.color}0a)`
                  : isHov ? `${skill.color}12` : 'rgba(255,255,255,.04)',
                border:`2px solid ${isDone ? skill.color : isHov ? `${skill.color}66` : 'rgba(255,255,255,.1)'}`,
                boxShadow: isDone
                  ? `0 0 30px ${skill.color}44, inset 0 0 20px ${skill.color}0a`
                  : isHov ? `0 8px 30px ${skill.color}33` : 'none',
                transition:'all .3s ease',
                textAlign:'center',
                transform: isDone ? 'translateY(-6px)' : isHov ? 'translateY(-4px) scale(1.02)' : 'none',
                position:'relative', overflow:'hidden',
                outline:'none',
              }}
            >
              {/* Shimmer on collected */}
              {isDone && (
                <div style={{
                  position:'absolute', inset:0,
                  background:`linear-gradient(105deg,transparent 40%,${skill.color}18 50%,transparent 60%)`,
                  backgroundSize:'200% 100%',
                  animation:'shimmer 3s ease-in-out infinite',
                  pointerEvents:'none',
                }} />
              )}

              {/* Glow orb */}
              {isDone && (
                <div style={{
                  position:'absolute', inset:0, borderRadius:10,
                  background:`radial-gradient(circle at 50% 0%,${skill.color}1a,transparent 60%)`,
                  animation:'orbitGlow 2.5s ease-in-out infinite',
                  pointerEvents:'none',
                }} />
              )}

              <div style={{ fontSize:34, marginBottom:8 }}>{skill.icon}</div>

              <div style={{
                fontFamily:'"Press Start 2P", monospace',
                fontSize:7, color: isDone ? skill.color : '#e2e8f0',
                textShadow: isDone ? `0 0 12px ${skill.color}` : 'none',
                lineHeight:1.8, marginBottom:8,
              }}>
                {skill.name}
              </div>

              {/* Level bar (shown when collected) */}
              {isDone && (
                <div style={{ margin:'6px 0 4px' }}>
                  <div style={{
                    width:'100%', height:5, background:'rgba(255,255,255,.1)',
                    borderRadius:3, overflow:'hidden',
                  }}>
                    <div style={{
                      width:`${skill.level}%`, height:'100%',
                      background:`linear-gradient(90deg,${skill.color},${skill.color}88)`,
                      borderRadius:3, transition:'width .9s ease',
                      boxShadow:`0 0 6px ${skill.color}`,
                    }} />
                  </div>
                  <div style={{
                    display:'flex', justifyContent:'space-between',
                    fontFamily:'"Press Start 2P", monospace',
                    fontSize:5, color:`${skill.color}99`, marginTop:3,
                  }}>
                    <span>{skill.years}</span>
                    <span>LVL {skill.level}</span>
                  </div>
                </div>
              )}

              {!isDone && (
                <div style={{
                  marginTop:6, display:'inline-block',
                  fontFamily:'"Press Start 2P", monospace', fontSize:5.5,
                  color: meta.border,
                  background: meta.bg, border:`1px solid ${meta.border}55`,
                  padding:'3px 8px', borderRadius:3,
                }}>
                  {meta.label}
                </div>
              )}

              {isDone && (
                <div style={{
                  marginTop:6, fontFamily:'"Press Start 2P", monospace',
                  fontSize:7, color:'#00ff88',
                  textShadow:'0 0 8px #00ff88',
                }}>
                  ✓ UNLOCKED
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Power-up flash ── */}
      {effect && (
        <div ref={effectRef} style={{
          position:'fixed', inset:0, zIndex:9000, pointerEvents:'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          background: effect.tier==='star' ? 'rgba(255,215,0,.1)' : effect.tier==='fire' ? 'rgba(255,140,0,.08)' : 'rgba(255,68,68,.07)',
        }}>
          <div style={{
            textAlign:'center',
            animation:'powerUpAnim 2s ease-out forwards',
          }}>
            <div style={{ fontSize:72 }}>
              {effect.tier==='star' ? '⭐' : effect.tier==='fire' ? '🔥' : '🍄'}
            </div>
            <div style={{
              fontFamily:'"Press Start 2P", monospace',
              fontSize:18, color:'#FFD700',
              textShadow:'0 0 40px #FFD700', marginTop:10,
            }}>
              {effect.name}
            </div>
            <div style={{
              fontFamily:'"Press Start 2P", monospace',
              fontSize:11, color:'#fff', marginTop:8,
            }}>
              UNLOCKED!
            </div>
          </div>
        </div>
      )}

      {/* ── Star power banner ── */}
      {allCollected && (
        <div style={{
          textAlign:'center', marginTop:40,
          animation:'rainbow 1.5s linear infinite',
          position:'relative', zIndex:2,
        }}>
          <div style={{
            fontFamily:'"Press Start 2P", monospace',
            fontSize:'clamp(11px,2.2vw,18px)', color:'#FFD700',
            textShadow:'0 0 40px #FFD700',
            padding:'16px 30px',
            background:'rgba(0,0,0,.6)', borderRadius:8,
            border:'2px solid #FFD70066',
            display:'inline-block',
          }}>
            ⭐ ALL SKILLS MASTERED — STAR POWER ACTIVATED! ⭐
          </div>
        </div>
      )}

      <div style={{ textAlign:'center', marginTop:52, position:'relative', zIndex:2 }}>
        <button onClick={onNext} style={{
          background:'linear-gradient(135deg,rgba(255,215,0,.12),rgba(255,140,0,.08))',
          border:'2px solid #FFD700', color:'#FFD700',
          padding:'14px 36px',
          fontFamily:'"Press Start 2P", monospace', fontSize:9,
          cursor:'pointer', borderRadius:7,
          boxShadow:'0 0 30px rgba(255,215,0,.3), 0 4px 0 rgba(255,215,0,.2)',
          transition:'all .2s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background='rgba(255,215,0,.22)'
            e.currentTarget.style.transform='translateY(-4px) scale(1.04)'
            e.currentTarget.style.boxShadow='0 0 50px rgba(255,215,0,.5), 0 8px 0 rgba(255,215,0,.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background='linear-gradient(135deg,rgba(255,215,0,.12),rgba(255,140,0,.08))'
            e.currentTarget.style.transform='none'
            e.currentTarget.style.boxShadow='0 0 30px rgba(255,215,0,.3), 0 4px 0 rgba(255,215,0,.2)'
          }}
        >
          🏰 ENTER THE CASTLE ▶
        </button>
      </div>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:.1;transform:scale(.5)} }
        @keyframes rippleOut { 0%{opacity:.8;transform:scale(1)} 100%{opacity:0;transform:scale(1.5)} }
      `}</style>
    </div>
  )
}
