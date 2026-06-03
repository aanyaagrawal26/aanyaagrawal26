import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'

const PROJECTS = [
  {
    id:1, name:'DevPulse', subtitle:'GitHub Analytics & AI Dashboard',
    icon:'📊', color:'#00aaff',
    stack:['Next.js','TypeScript','MongoDB','Tailwind','Hugging Face','RAG'],
    desc:'AI-powered dashboard analyzing GitHub repos for code quality, security risks, and dev patterns — with interactive visualizations and RAG-driven insights.',
    github:'https://github.com/aanyaagrawal26',
    difficulty:'LEGENDARY', hp:100,
  },
  {
    id:2, name:'AI Multiverse OS', subtitle:'Multi-Agent AI System',
    icon:'🤖', color:'#bf5af2',
    stack:['Python','LLMs','Multi-Agent','API Integration','AutoGen'],
    desc:'A collaborative multi-agent system routing complex tasks across specialized AI models for smart multi-step reasoning and dynamic response generation.',
    github:'https://github.com/aanyaagrawal26',
    difficulty:'EPIC', hp:80,
  },
  {
    id:3, name:'Sundown Clone', subtitle:'Immersive Frontend Experience',
    icon:'🌅', color:'#ff8c00',
    stack:['HTML','CSS','JS','GSAP','Canvas API','ScrollTrigger'],
    desc:'Pixel-perfect recreation of a modern marketing site with silky scroll animations, canvas particle effects, and zero-dependency interactions.',
    github:'https://github.com/aanyaagrawal26',
    difficulty:'RARE', hp:60,
  },
  {
    id:4, name:'Carbon AI Research', subtitle:'UROP Research at SRMIST',
    icon:'🌱', color:'#00ff88',
    stack:['Python','ML','NumPy','Pandas','Scikit-learn','Data Viz'],
    desc:'AI-driven carbon footprint analysis & reduction in supply chains, aligned with UN SDGs 9 & 13. Published under SRM UROP program.',
    github:'https://github.com/aanyaagrawal26',
    difficulty:'EPIC', hp:85,
  },
]

const DIFF_COLORS = { LEGENDARY:'#FFD700', EPIC:'#bf5af2', RARE:'#00aaff' }

// Pixel fire frames
function FireEffect() {
  return (
    <div style={{ display:'flex', gap:3, justifyContent:'center', marginBottom:8 }}>
      {['🔥','🔥','🔥'].map((f,i) => (
        <span key={i} style={{
          fontSize:16,
          animation:`fireFlicker ${.4+i*.15}s ${i*.1}s ease-in-out infinite`,
          display:'inline-block',
        }}>{f}</span>
      ))}
    </div>
  )
}

export default function World5Castle({ onNext }) {
  const [activeProject, setActiveProject] = useState(null)
  const [battling, setBattling]           = useState(null)
  const [won, setWon]                     = useState([])
  const [battleProgress, setBattleProgress] = useState(0)
  const headerRef = useRef(null)
  const { addCoins, addXP } = useGameStore()

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity:0, y:-30 },
        { opacity:1, y:0, duration:.8, ease:'back.out(1.4)' }
      )
    }
  }, [])

  const startBattle = project => {
    setBattling(project.id)
    setBattleProgress(0)

    // Animate progress bar
    let prog = 0
    const interval = setInterval(() => {
      prog += Math.random() * 18 + 5
      if (prog >= 100) {
        prog = 100
        clearInterval(interval)
        setTimeout(() => {
          setBattling(null)
          setBattleProgress(0)
          setWon(p => [...p, project.id])
          addCoins(20); addXP(30)
          setActiveProject(null)
        }, 300)
      }
      setBattleProgress(Math.min(prog, 100))
    }, 120)
  }

  return (
    <div style={{
      width:'100%', minHeight:'calc(100vh - 64px)', position:'relative',
      background:'linear-gradient(180deg,#080000 0%,#140000 35%,#1A0000 65%,#080000 100%)',
      padding:'44px 28px 80px', overflow:'hidden',
    }}>

      {/* ── Lava floor ── */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, height:58, zIndex:1,
        background:'linear-gradient(180deg,#BF360C,#E64A19,#FF5722,#FF7043)',
        boxShadow:'0 -30px 80px rgba(255,87,34,.6)',
        animation:'lavaFlow 2.5s ease-in-out infinite',
      }}>
        {/* Lava bubbles */}
        {Array.from({length:8}).map((_,i) => (
          <div key={i} style={{
            position:'absolute', bottom:4+i*3,
            left:`${8+i*12}%`, width:8+(i%3)*4, height:8+(i%3)*4,
            borderRadius:'50%', background:'rgba(255,200,50,.4)',
            animation:`lavaRipple ${1+i*.3}s ${i*.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* ── Ember particles ── */}
      {Array.from({length:16}).map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${(i*6.3)%95}%`, bottom:`${8+(i%8)*8}%`,
          width:3+(i%3)*2, height:3+(i%3)*2, borderRadius:'50%',
          background:['#FF5722','#FF8F00','#FFD700'][i%3],
          boxShadow:`0 0 ${6+i%4*4}px ${['#FF5722','#FF8F00','#FFD700'][i%3]}`,
          animation:`float ${1.5+i*.4}s ${i*.3}s ease-in-out infinite, particleRise ${4+i%3}s ${i*.5}s ease-out infinite`,
          opacity:.75, pointerEvents:'none', zIndex:2,
        }} />
      ))}

      {/* ── Castle silhouette towers ── */}
      {[6,22,50,78,92].map((x,i) => (
        <div key={i} style={{
          position:'absolute', left:`${x}%`, bottom:58,
          width:28+(i%3)*8, height:90+(i%4)*30,
          background:'linear-gradient(180deg,#1a1a1a,#0d0d0d)',
          border:'1px solid #333', opacity:.5, zIndex:1,
        }}>
          {/* Battlements */}
          <div style={{ display:'flex', gap:2, padding:'3px 2px' }}>
            {Array.from({length:3}).map((_,j) => (
              <div key={j} style={{ width:6, height:10, background:'#222' }} />
            ))}
          </div>
          {/* Window light */}
          <div style={{
            position:'absolute', left:'50%', top:'40%',
            transform:'translateX(-50%)',
            width:8, height:10, background:'rgba(255,200,0,.4)',
            boxShadow:'0 0 12px rgba(255,200,0,.5)',
            animation:`blink ${2+i*.5}s ${i*.3}s step-end infinite`,
          }} />
        </div>
      ))}

      {/* ── Header ── */}
      <div ref={headerRef} style={{
        textAlign:'center', marginBottom:40, position:'relative', zIndex:3, opacity:0,
      }}>
        <FireEffect />
        <h1 style={{
          fontFamily:'"Press Start 2P", monospace',
          fontSize:'clamp(14px,2.5vw,22px)', color:'#FF5722',
          textShadow:'0 0 30px #FF5722, 0 0 70px rgba(255,87,34,.4)',
          letterSpacing:3, marginBottom:10,
        }}>
          🏰 PROJECTS CASTLE 🏰
        </h1>
        <div style={{
          fontFamily:'"Press Start 2P", monospace',
          fontSize:7.5, color:'rgba(255,255,255,.55)',
        }}>
          EXPAND A PROJECT · DEFEAT THE BUGS · CLAIM THE TROPHY
        </div>
      </div>

      {/* ── Project cards ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(270px, 1fr))',
        gap:22, maxWidth:1160, margin:'0 auto',
        position:'relative', zIndex:3,
      }}>
        {PROJECTS.map(project => {
          const isWon    = won.includes(project.id)
          const isActive = activeProject?.id === project.id
          const diffColor = DIFF_COLORS[project.difficulty]

          return (
            <div key={project.id} style={{
              background: isWon
                ? `linear-gradient(135deg,${project.color}15,rgba(0,0,0,.85))`
                : 'rgba(0,0,0,.8)',
              border:`2px solid ${isWon ? project.color : 'rgba(255,87,34,.25)'}`,
              borderRadius:12, overflow:'hidden',
              boxShadow: isWon
                ? `0 0 50px ${project.color}44, inset 0 0 20px ${project.color}0a`
                : '0 4px 24px rgba(0,0,0,.7)',
              transition:'all .35s ease',
              backdropFilter:'blur(12px)',
            }}>
              {/* Card header */}
              <button
                onClick={() => setActiveProject(isActive ? null : project)}
                style={{
                  width:'100%', padding:'20px 22px',
                  cursor:'pointer',
                  background: isWon
                    ? `linear-gradient(135deg,${project.color}18,transparent)`
                    : 'rgba(255,87,34,.07)',
                  borderBottom:`1px solid ${isWon ? project.color+'33' : '#2a2a2a'}`,
                  display:'flex', alignItems:'flex-start', gap:14,
                  border:'none', outline:'none', textAlign:'left',
                  transition:'background .2s',
                }}
                onMouseEnter={e => { if(!isWon) e.currentTarget.style.background='rgba(255,87,34,.13)' }}
                onMouseLeave={e => { if(!isWon) e.currentTarget.style.background='rgba(255,87,34,.07)' }}
              >
                <div style={{ fontSize:38, flexShrink:0, filter: isWon ? `drop-shadow(0 0 8px ${project.color})` : 'none' }}>
                  {project.icon}
                </div>
                <div style={{ flex:1 }}>
                  {/* Difficulty badge */}
                  <div style={{
                    display:'inline-block', marginBottom:5,
                    fontFamily:'"Press Start 2P", monospace', fontSize:5.5,
                    color:diffColor, background:`${diffColor}18`,
                    border:`1px solid ${diffColor}44`,
                    padding:'2px 7px', borderRadius:3,
                  }}>
                    ⚔ {project.difficulty}
                  </div>
                  <div style={{
                    fontFamily:'"Press Start 2P", monospace',
                    fontSize:10, color: isWon ? project.color : '#f1f5f9',
                    textShadow: isWon ? `0 0 12px ${project.color}` : 'none',
                    lineHeight:1.4, marginBottom:5,
                    display:'block',
                  }}>
                    {project.name}
                  </div>
                  <div style={{
                    fontFamily:'"Press Start 2P", monospace',
                    fontSize:6.5, color:'rgba(255,255,255,.5)', lineHeight:1.6,
                  }}>
                    {project.subtitle}
                  </div>
                </div>
                <div style={{ flexShrink:0, fontSize:22, alignSelf:'center' }}>
                  {isWon ? '🏆' : isActive ? '▲' : '▼'}
                </div>
              </button>

              {/* Expanded body */}
              {(isWon || isActive) && (
                <div style={{ padding:'20px 22px' }}>
                  <p style={{
                    fontFamily:'system-ui,sans-serif',
                    fontSize:13, color:'rgba(255,255,255,.8)',
                    lineHeight:1.8, marginBottom:16,
                  }}>
                    {project.desc}
                  </p>

                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:18 }}>
                    {project.stack.map(s => (
                      <span key={s} style={{
                        padding:'4px 10px',
                        background:`${project.color}18`,
                        border:`1px solid ${project.color}44`,
                        borderRadius:4, color:project.color,
                        fontFamily:'monospace', fontSize:11,
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Battle progress */}
                  {battling === project.id && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{
                          fontFamily:'"Press Start 2P", monospace',
                          fontSize:7, color:'#FF5722',
                          animation:'blink .4s step-end infinite',
                        }}>FIXING BUGS...</span>
                        <span style={{
                          fontFamily:'"Press Start 2P", monospace',
                          fontSize:7, color:'#FF5722',
                        }}>{Math.round(battleProgress)}%</span>
                      </div>
                      <div style={{
                        width:'100%', height:10, background:'rgba(255,255,255,.1)',
                        borderRadius:5, overflow:'hidden',
                        border:'1px solid rgba(255,87,34,.3)',
                      }}>
                        <div style={{
                          width:`${battleProgress}%`, height:'100%',
                          background:'linear-gradient(90deg,#FF5722,#FFD700)',
                          borderRadius:5, transition:'width .15s ease',
                          boxShadow:'0 0 10px rgba(255,87,34,.7)',
                        }} />
                      </div>
                    </div>
                  )}

                  {!isWon ? (
                    <div style={{ display:'flex', gap:10 }}>
                      <button
                        onClick={() => startBattle(project)}
                        disabled={battling !== null}
                        style={{
                          flex:1, padding:'11px',
                          background: battling ? 'rgba(30,30,30,.8)' : 'linear-gradient(135deg,#FF5722,#E64A19)',
                          border:'none', borderRadius:7, color:'#fff',
                          fontFamily:'"Press Start 2P", monospace', fontSize:8,
                          cursor: battling ? 'wait' : 'pointer',
                          boxShadow: battling ? 'none' : '0 0 24px rgba(255,87,34,.5), 0 4px 0 rgba(180,40,10,.6)',
                          animation: battling === project.id ? 'shake .12s infinite' : 'none',
                          transition:'all .2s',
                        }}
                        onMouseEnter={e => { if(!battling) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 40px rgba(255,87,34,.7)' } }}
                        onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=battling?'none':'0 0 24px rgba(255,87,34,.5), 0 4px 0 rgba(180,40,10,.6)' }}
                      >
                        {battling === project.id ? '⚔️ BATTLING...' : '⚔️ FIGHT BUGS'}
                      </button>
                      <a href={project.github} target="_blank" rel="noopener noreferrer"
                        style={{
                          padding:'11px 16px',
                          background:'rgba(255,255,255,.07)',
                          border:'1px solid rgba(255,255,255,.15)',
                          borderRadius:7, color:'#fff',
                          fontFamily:'"Press Start 2P", monospace', fontSize:7,
                          textDecoration:'none', display:'flex',
                          alignItems:'center', gap:5, transition:'background .2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.14)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.07)'}
                      >
                        🔗 CODE
                      </a>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{
                        fontFamily:'"Press Start 2P", monospace', fontSize:8,
                        color:project.color, textShadow:`0 0 12px ${project.color}`,
                      }}>
                        ✓ CLEARED! +20🪙 +30XP
                      </div>
                      <a href={project.github} target="_blank" rel="noopener noreferrer"
                        style={{
                          padding:'9px 16px',
                          background:`${project.color}18`,
                          border:`1px solid ${project.color}55`,
                          borderRadius:6, color:project.color,
                          fontFamily:'"Press Start 2P", monospace', fontSize:7,
                          textDecoration:'none', transition:'all .2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background=`${project.color}33`; e.currentTarget.style.transform='scale(1.05)' }}
                        onMouseLeave={e => { e.currentTarget.style.background=`${project.color}18`; e.currentTarget.style.transform='none' }}
                      >
                        🔗 VIEW
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Full-screen battle overlay ── */}
      {battling !== null && (
        <div style={{
          position:'fixed', inset:0, zIndex:9000,
          background:'rgba(0,0,0,.9)',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          fontFamily:'"Press Start 2P", monospace',
          backdropFilter:'blur(8px)',
        }}>
          <div style={{ fontSize:64, animation:'shake .12s infinite', marginBottom:20 }}>⚔️</div>
          <div style={{ fontSize:16, color:'#FF5722', textShadow:'0 0 30px #FF5722', marginBottom:12 }}>
            DEFEATING BUGS...
          </div>
          <div style={{ fontSize:8, color:'rgba(255,255,255,.6)', animation:'blink .6s step-end infinite' }}>
            AANYA.EXE IS DEPLOYING FIXES
          </div>
          <div style={{ width:280, height:12, background:'rgba(255,255,255,.1)', borderRadius:6, overflow:'hidden', marginTop:24, border:'1px solid rgba(255,87,34,.3)' }}>
            <div style={{ width:`${battleProgress}%`, height:'100%', background:'linear-gradient(90deg,#FF5722,#FFD700)', transition:'width .15s', boxShadow:'0 0 12px rgba(255,87,34,.8)' }} />
          </div>
          <div style={{ fontSize:8, color:'#FF5722', marginTop:8 }}>{Math.round(battleProgress)}%</div>
        </div>
      )}

      <div style={{ textAlign:'center', marginTop:60, position:'relative', zIndex:3 }}>
        <button onClick={onNext} style={{
          background:'linear-gradient(135deg,rgba(255,87,34,.12),rgba(255,50,0,.08))',
          border:'2px solid #FF5722', color:'#FF5722',
          padding:'14px 36px',
          fontFamily:'"Press Start 2P", monospace', fontSize:9,
          cursor:'pointer', borderRadius:7,
          boxShadow:'0 0 30px rgba(255,87,34,.3), 0 4px 0 rgba(200,40,0,.3)',
          transition:'all .2s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background='rgba(255,87,34,.22)'
            e.currentTarget.style.transform='translateY(-4px) scale(1.04)'
            e.currentTarget.style.boxShadow='0 0 50px rgba(255,87,34,.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background='linear-gradient(135deg,rgba(255,87,34,.12),rgba(255,50,0,.08))'
            e.currentTarget.style.transform='none'
            e.currentTarget.style.boxShadow='0 0 30px rgba(255,87,34,.3), 0 4px 0 rgba(200,40,0,.3)'
          }}
        >
          🗺 EXPERIENCE MAP ▶
        </button>
      </div>

      <style>{`
        @keyframes fireFlicker { 0%,100%{transform:scaleY(1) scaleX(1)} 25%{transform:scaleY(1.1) scaleX(.93)} 75%{transform:scaleY(.93) scaleX(1.07)} }
        @keyframes lavaRipple { 0%,100%{border-radius:50%;transform:scale(1)} 50%{border-radius:40% 60% 55% 45%;transform:scale(1.12)} }
      `}</style>
    </div>
  )
}
