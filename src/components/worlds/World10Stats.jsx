import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'

/* ═══════════════════════════════════════════════════════
   WORLD 10  —  RPG CHARACTER SHEET
   Full RPG stat screen. Feels like an SNES pause menu.
═══════════════════════════════════════════════════════ */

const ATTRIBUTES = [
  { label: 'ATTACK',  sub: 'React / Frontend',  val: 92, icon: '⚔️',  color: '#ff4444' },
  { label: 'DEFENSE', sub: 'Problem Solving',    val: 88, icon: '🛡️', color: '#4488ff' },
  { label: 'MAGIC',   sub: 'AI / ML',            val: 82, icon: '✨',  color: '#bf5af2' },
  { label: 'SPEED',   sub: 'TypeScript',         val: 85, icon: '⚡',  color: '#FFD700' },
  { label: 'WISDOM',  sub: 'Cloud / GCP',        val: 90, icon: '🧠',  color: '#00aaff' },
  { label: 'LUCK',    sub: 'Hackathons',         val: 78, icon: '💎',  color: '#00ff88' },
]

const EQUIPPED = [
  { icon: '⚛️',  name: 'React'  },
  { icon: '🐍',  name: 'Python' },
  { icon: '☁️',  name: 'GCP'   },
  { icon: '🟢',  name: 'Node'  },
  { icon: '🎯',  name: 'GSAP'  },
  { icon: '🤖',  name: 'ML'    },
  { icon: '🔷',  name: 'TS'    },
  { icon: '🐙',  name: 'Git'   },
]

const QUESTS = [
  { label: 'SRM UROP Research', desc: 'AI carbon-footprint analysis — ongoing', color: '#00ff88', done: false },
  { label: 'Microsoft Elevate', desc: 'Cloud & AI scholar program — completed',  color: '#4285F4', done: true  },
  { label: 'Novacode Training',  desc: 'Production frontend dev — completed',    color: '#ff8c00', done: true  },
]

const RUNES = ['✦','◈','⬡','✧','◆','⬟','✦','◈','⬡','✧','◆','⬟']

function StatBar({ val, color, animate }) {
  const barRef = useRef(null)
  useEffect(() => {
    if (!animate || !barRef.current) return
    gsap.fromTo(barRef.current, { width: '0%' }, { width: `${val}%`, duration: 1.2, ease: 'power2.out', delay: 0.3 })
  }, [animate, val])
  return (
    <div style={{
      width: '100%', height: 8,
      background: 'rgba(255,255,255,.08)',
      borderRadius: 4, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,.1)',
    }}>
      <div ref={barRef} style={{
        height: '100%', width: animate ? '0%' : `${val}%`,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
        borderRadius: 4,
        boxShadow: `0 0 8px ${color}`,
        transition: animate ? 'none' : `width 1.2s ease`,
      }} />
    </div>
  )
}

export default function World10Stats({ onNext }) {
  const coins = useGameStore(s => s.coins)
  const xp    = useGameStore(s => s.xp)
  const level = useGameStore(s => s.level)

  const [visible, setVisible] = useState(false)
  const cardRef    = useRef(null)
  const attrsRef   = useRef(null)
  const runesRef   = useRef([])

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: () => setVisible(true) })
    if (cardRef.current) {
      tl.fromTo(cardRef.current,
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'back.out(1.4)' }
      )
    }
    if (attrsRef.current) {
      tl.fromTo(attrsRef.current,
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'back.out(1.4)' },
        '-=0.5'
      )
    }
  }, [])

  // Animate floating runes
  useEffect(() => {
    runesRef.current.forEach((el, i) => {
      if (!el) return
      gsap.to(el, {
        y: -14, repeat: -1, yoyo: true,
        duration: 2 + (i % 4) * 0.4,
        delay: i * 0.22,
        ease: 'sine.inOut',
      })
    })
  }, [])

  const xpPct = xp % 100

  return (
    <div style={{
      width: '100%', minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #07001A 0%, #0E0030 40%, #0A001F 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px 60px',
      fontFamily: '"Press Start 2P", monospace',
    }}>

      {/* ── Grid lines ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(150,50,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(150,50,255,.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* ── Floating runes ── */}
      {RUNES.map((r, i) => (
        <div
          key={i}
          ref={el => runesRef.current[i] = el}
          style={{
            position: 'absolute',
            left: `${(i % 6) * 18 + 2}%`,
            top: `${Math.floor(i / 6) * 50 + 8}%`,
            fontSize: 18,
            color: `rgba(${i%2===0?'180,80,255':'100,180,255'}, 0.18)`,
            pointerEvents: 'none', zIndex: 0,
            userSelect: 'none',
          }}
        >{r}</div>
      ))}

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 2 }}>
        <div style={{
          fontSize: 'clamp(13px,2.5vw,20px)', color: '#bf5af2',
          textShadow: '0 0 28px #bf5af2, 0 0 60px rgba(191,90,242,.35)',
          letterSpacing: 3, marginBottom: 8,
        }}>
          ⚔ CHARACTER SHEET ⚔
        </div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,.35)' }}>
          PLAYER STATS &amp; INVENTORY
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px,1fr) minmax(300px,2fr)',
        gap: 24, maxWidth: 1100, width: '100%',
        position: 'relative', zIndex: 2,
      }}>

        {/* ── LEFT: Character card ── */}
        <div ref={cardRef} style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,.85), rgba(20,0,50,.9))',
          border: '2px solid rgba(191,90,242,.35)',
          borderRadius: 14,
          padding: '28px 22px',
          display: 'flex', flexDirection: 'column',
          gap: 16, opacity: 0,
          boxShadow: '0 0 50px rgba(191,90,242,.12), inset 0 0 30px rgba(191,90,242,.04)',
          backdropFilter: 'blur(16px)',
        }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%', margin: '0 auto 10px',
                background: 'radial-gradient(circle, rgba(191,90,242,.3), rgba(0,0,0,.6))',
                border: '3px solid #bf5af2',
                boxShadow: '0 0 30px rgba(191,90,242,.6), 0 0 60px rgba(191,90,242,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 46,
                animation: 'float 2.5s ease-in-out infinite',
              }}>🧙‍♀️</div>
              {/* Class badge */}
              <div style={{
                position: 'absolute', bottom: 6, right: -8,
                background: 'linear-gradient(135deg,#FFD700,#FF8C00)',
                color: '#000', fontSize: 5, padding: '2px 6px', borderRadius: 3,
                fontWeight: 'bold', whiteSpace: 'nowrap',
              }}>CLOUD MAGE</div>
            </div>
            <div style={{ fontSize: 9, color: '#fff', letterSpacing: 1, marginBottom: 3 }}>AANYA AGRAWAL</div>
            <div style={{ fontSize: 6, color: '#bf5af2', marginBottom: 12 }}>FULL-STACK MAGE</div>
          </div>

          {/* Level + XP */}
          <div style={{
            background: 'rgba(191,90,242,.08)', border: '1px solid rgba(191,90,242,.2)',
            borderRadius: 8, padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 7, color: '#bf5af2' }}>
              <span>LEVEL {String(level).padStart(2,'0')}</span>
              <span style={{ color: '#00ff88' }}>EXP {xp}</span>
            </div>
            {/* HP bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 5.5, color: '#ff4444', marginBottom: 4 }}>HP  100 / 100</div>
              <div style={{ height: 7, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,68,68,.2)' }}>
                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#ff4444,#ff6666)', boxShadow: '0 0 6px #ff4444' }} />
              </div>
            </div>
            {/* MP bar */}
            <div>
              <div style={{ fontSize: 5.5, color: '#4488ff', marginBottom: 4 }}>MP  {xpPct} / 100</div>
              <div style={{ height: 7, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(68,136,255,.2)' }}>
                <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#4488ff,#66aaff)', transition: 'width .5s', boxShadow: '0 0 6px #4488ff' }} />
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { k: 'CGPA',    v: '9.21', c: '#FFD700' },
              { k: 'REPOS',   v: '27',   c: '#00aaff' },
              { k: 'CERTS',   v: '15+',  c: '#ff8c00' },
              { k: 'COINS',   v: String(coins).padStart(4,'0'), c: '#FFD700' },
            ].map(s => (
              <div key={s.k} style={{
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 5, padding: '8px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 5, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>{s.k}</div>
                <div style={{ fontSize: 9, color: s.c, textShadow: `0 0 8px ${s.c}` }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* LORE */}
          <div style={{
            background: 'rgba(191,90,242,.06)', border: '1px solid rgba(191,90,242,.15)',
            borderRadius: 8, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 6, color: '#bf5af2', marginBottom: 8 }}>⟨ LORE ⟩</div>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, margin: 0 }}>
              Born in the Cloud Realm, Aanya mastered the ancient arts of
              Full-Stack Sorcery and AI Alchemy. A 9.21 GPA scholar bearing
              15+ magical certifications, she slays bugs by day and ships
              features by night. Currently on a legendary quest: building
              things that matter.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Attributes + equipped + quests ── */}
        <div ref={attrsRef} style={{ display: 'flex', flexDirection: 'column', gap: 20, opacity: 0 }}>

          {/* Attribute bars */}
          <div style={{
            background: 'rgba(0,0,0,.8)',
            border: '2px solid rgba(191,90,242,.25)',
            borderRadius: 14, padding: '22px 24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 40px rgba(191,90,242,.1)',
          }}>
            <div style={{ fontSize: 8, color: '#bf5af2', textShadow: '0 0 14px #bf5af2', marginBottom: 20, letterSpacing: 2 }}>
              ⚔ ATTRIBUTES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ATTRIBUTES.map(a => (
                <div key={a.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: 7, color: '#fff', letterSpacing: 1 }}>{a.label}</div>
                        <div style={{ fontSize: 5, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{a.sub}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 8, color: a.color, textShadow: `0 0 10px ${a.color}` }}>
                      {a.val}
                    </div>
                  </div>
                  <StatBar val={a.val} color={a.color} animate={visible} />
                </div>
              ))}
            </div>
          </div>

          {/* Equipped items */}
          <div style={{
            background: 'rgba(0,0,0,.8)',
            border: '2px solid rgba(255,215,0,.2)',
            borderRadius: 14, padding: '18px 22px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 30px rgba(255,215,0,.07)',
          }}>
            <div style={{ fontSize: 8, color: '#FFD700', textShadow: '0 0 14px #FFD700', marginBottom: 16, letterSpacing: 2 }}>
              ⚙ EQUIPPED
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {EQUIPPED.map(e => (
                <div key={e.name} style={{
                  background: 'rgba(255,215,0,.07)',
                  border: '1px solid rgba(255,215,0,.2)',
                  borderRadius: 8, padding: '10px 8px',
                  textAlign: 'center',
                  transition: 'all .2s',
                  cursor: 'default',
                }}
                  onMouseEnter={ev => { ev.currentTarget.style.background='rgba(255,215,0,.15)'; ev.currentTarget.style.borderColor='rgba(255,215,0,.5)'; ev.currentTarget.style.transform='translateY(-3px)' }}
                  onMouseLeave={ev => { ev.currentTarget.style.background='rgba(255,215,0,.07)'; ev.currentTarget.style.borderColor='rgba(255,215,0,.2)'; ev.currentTarget.style.transform='none' }}
                >
                  <div style={{ fontSize: 22, marginBottom: 5 }}>{e.icon}</div>
                  <div style={{ fontSize: 5, color: 'rgba(255,255,255,.55)' }}>{e.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active quests */}
          <div style={{
            background: 'rgba(0,0,0,.8)',
            border: '2px solid rgba(0,255,136,.2)',
            borderRadius: 14, padding: '18px 22px',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ fontSize: 8, color: '#00ff88', textShadow: '0 0 14px #00ff88', marginBottom: 16, letterSpacing: 2 }}>
              ◎ QUESTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {QUESTS.map(q => (
                <div key={q.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: `${q.color}0d`,
                  border: `1px solid ${q.done ? q.color + '55' : q.color + '33'}`,
                  borderRadius: 8,
                  opacity: q.done ? 0.75 : 1,
                }}>
                  {/* Status dot — pulsing if active, solid check if done */}
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: q.done ? q.color : q.color,
                    boxShadow: `0 0 10px ${q.color}`,
                    flexShrink: 0,
                    animation: q.done ? 'none' : 'pulse 1.5s ease-in-out infinite',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: q.done ? 7 : 0,
                    color: '#000',
                  }}>
                    {q.done ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 7, color: q.color, marginBottom: 3, textDecoration: q.done ? 'line-through' : 'none', opacity: q.done ? 0.8 : 1 }}>{q.label}</div>
                    <div style={{ fontSize: 5.5, color: 'rgba(255,255,255,.4)' }}>{q.desc}</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', fontSize: 6,
                    color: q.done ? '#00ff88' : q.color,
                    whiteSpace: 'nowrap',
                    animation: q.done ? 'none' : 'blink 2s step-end infinite',
                    background: q.done ? 'rgba(0,255,136,.12)' : 'transparent',
                    border: q.done ? '1px solid rgba(0,255,136,.3)' : 'none',
                    padding: q.done ? '2px 6px' : '0',
                    borderRadius: 3,
                  }}>
                    {q.done ? '✓ DONE' : 'IN PROGRESS'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Next button ── */}
      <div style={{ marginTop: 40, position: 'relative', zIndex: 2 }}>
        <button onClick={onNext} style={{
          background: 'linear-gradient(135deg, rgba(191,90,242,.14), rgba(120,0,200,.08))',
          border: '2px solid #bf5af2', color: '#bf5af2',
          padding: '14px 36px',
          fontFamily: '"Press Start 2P", monospace', fontSize: 9,
          cursor: 'pointer', borderRadius: 7,
          boxShadow: '0 0 30px rgba(191,90,242,.3)',
          transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(191,90,242,.24)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 0 50px rgba(191,90,242,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background='linear-gradient(135deg,rgba(191,90,242,.14),rgba(120,0,200,.08))'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 30px rgba(191,90,242,.3)' }}
        >
          NEXT WORLD ▶
        </button>
      </div>
    </div>
  )
}
