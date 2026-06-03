import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'

/* ───────────────────────────────────────────────────────────────
   WORLD 8  —  ARCADE TROPHY ROOM
   Styled as a retro arcade / pinball machine.
   Every cert / achievement is a "coin door" you can open.
─────────────────────────────────────────────────────────────── */

const ACHIEVEMENTS = [
  {
    id: 1,
    title: 'Google Cloud Associate',
    issuer: 'Google',
    date: 'Oct 2024',
    icon: '☁️',
    color: '#4285F4',
    badge: 'CERTIFIED',
    tier: 'LEGENDARY',
    link: 'https://www.credly.com/users/aanya-agrawal.1c0eee02/badges',
    desc: 'Associate Cloud Engineer certified — deployed, monitored, and managed cloud solutions on GCP including Compute, GKE, and Cloud Functions.',
  },
  {
    id: 2,
    title: 'AWS Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'Jan 2025',
    icon: '🟠',
    color: '#FF9900',
    badge: 'CERTIFIED',
    tier: 'LEGENDARY',
    link: 'https://www.credly.com/users/aanya-agrawal.1c0eee02/badges',
    desc: 'Validated foundational knowledge of AWS services, security, architecture, pricing, and support across the AWS ecosystem.',
  },
  {
    id: 3,
    title: 'Microsoft Azure AI-900',
    issuer: 'Microsoft',
    date: 'Feb 2025',
    icon: '🔷',
    color: '#0078D4',
    badge: 'CERTIFIED',
    tier: 'EPIC',
    link: 'https://www.credly.com/users/aanya-agrawal.1c0eee02/badges',
    desc: 'Azure AI Fundamentals — core AI/ML concepts including computer vision, NLP, and responsible AI using Azure Cognitive Services.',
  },
  {
    id: 4,
    title: 'JP Morgan SWE Simulation',
    issuer: 'JP Morgan Chase',
    date: 'Dec 2025',
    icon: '💰',
    color: '#FFD700',
    badge: 'COMPLETED',
    tier: 'EPIC',
    link: 'https://www.theforage.com/',
    desc: 'Built a real-time stock data feed & React dashboard. Applied Python scripting, version control, and financial data visualization.',
  },
  {
    id: 5,
    title: 'McKinsey Forward Program',
    issuer: 'McKinsey & Company',
    date: 'Dec 2025',
    icon: '📈',
    color: '#00ffcc',
    badge: 'COMPLETED',
    tier: 'EPIC',
    link: 'https://www.mckinsey.com/forward/overview',
    desc: 'Developed analytical, structured problem-solving, and communication skills through McKinsey-designed modules and case studies.',
  },
  {
    id: 6,
    title: 'SRM UROP Research Grant',
    issuer: 'SRMIST',
    date: 'Aug 2025',
    icon: '🔬',
    color: '#00ff88',
    badge: 'RESEARCHER',
    tier: 'LEGENDARY',
    link: 'https://www.srmist.edu.in',
    desc: 'Selected for Undergraduate Research Opportunity Program — AI-driven carbon footprint analysis in supply chains, aligned with UN SDGs.',
  },
  {
    id: 7,
    title: 'Smart India Hackathon',
    issuer: 'Govt. of India',
    date: 'Sep 2024',
    icon: '🏆',
    color: '#FF5722',
    badge: 'FINALIST',
    tier: 'EPIC',
    link: '#',
    desc: 'Reached the grand finale of SIH 2024 — built a real-time AI disaster response system with multi-modal alert routing.',
  },
  {
    id: 8,
    title: 'HackerRank Gold Badge',
    issuer: 'HackerRank',
    date: '2024',
    icon: '⭐',
    color: '#00EA64',
    badge: 'GOLD',
    tier: 'RARE',
    link: 'https://www.hackerrank.com/profile/aanya_03024',
    desc: '5-star gold badge in Problem Solving & Python. Solved 100+ challenges spanning data structures, algorithms, and SQL.',
  },
  {
    id: 9,
    title: 'Microsoft Elevate Scholar',
    issuer: 'Microsoft',
    date: 'Ongoing',
    icon: '🪟',
    color: '#bf5af2',
    badge: 'SELECTED',
    tier: 'EPIC',
    link: '#',
    desc: 'Hand-picked for Microsoft\'s Elevate Program — deep-dive into Azure, AI, and cloud-native development under Microsoft mentors.',
  },
  {
    id: 10,
    title: 'NOVACODE Frontend Dev',
    issuer: 'NOVACODE',
    date: 'Aug–Oct 2025',
    icon: '🚀',
    color: '#ff8c00',
    badge: 'TRAINED',
    tier: 'RARE',
    link: '#',
    desc: '60-day intensive training in React, Tailwind, GSAP animations, and production deployment. Built 3 client-facing projects.',
  },
  {
    id: 11,
    title: 'Coursera ML Specialization',
    issuer: 'Stanford / Coursera',
    date: 'Mar 2025',
    icon: '🤖',
    color: '#FF6F00',
    badge: 'CERTIFIED',
    tier: 'EPIC',
    link: '#',
    desc: 'Completed Andrew Ng\'s Machine Learning Specialization — supervised learning, neural networks, decision trees, and best practices.',
  },
  {
    id: 12,
    title: 'ACM SIGKDD Member',
    issuer: 'ACM / SRMIST',
    date: 'Apr 2025',
    icon: '💻',
    color: '#00aaff',
    badge: 'MEMBER',
    tier: 'RARE',
    link: '#',
    desc: 'Core member of the SRM ACM SIGKDD chapter — hosted data science workshops, judged ML projects, contributed to knowledge-sharing sessions.',
  },
]

const TIER_CLR = { LEGENDARY: '#FFD700', EPIC: '#bf5af2', RARE: '#00aaff' }

/* Pixel trophy */
function PixelTrophy({ color, size = 4 }) {
  const m = [
    [0,1,1,1,0],
    [1,2,2,2,1],
    [1,2,2,2,1],
    [0,1,2,1,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
  ]
  const c = { 0: 'transparent', 1: color, 2: `${color}66` }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(5,${size}px)`, gap: 0 }}>
      {m.flat().map((v, i) => (
        <div key={i} style={{ width: size, height: size, background: c[v] }} />
      ))}
    </div>
  )
}

/* Arcade score ticker */
function ScoreTicker({ score }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let current = 0
    const step = Math.ceil(score / 40)
    const id = setInterval(() => {
      current = Math.min(current + step, score)
      setDisplay(current)
      if (current >= score) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [score])
  return <>{String(display).padStart(6, '0')}</>
}

export default function World8Arcade({ onNext }) {
  const [opened, setOpened]   = useState([])
  const [active, setActive]   = useState(null)
  const [insertedCoins, setInserted] = useState(0)
  const headerRef = useRef(null)
  const marqueeRef = useRef(null)
  const { addCoins, addXP }   = useGameStore()

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)' }
      )
    }
    // Marquee scroll
    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, {
        x: '-50%', duration: 18, ease: 'none', repeat: -1,
      })
    }
  }, [])

  const openCard = (ach) => {
    if (!opened.includes(ach.id)) {
      setOpened(p => [...p, ach.id])
      addCoins(10); addXP(20)
      setInserted(n => n + 1)

      // Flash effect
      const el = document.getElementById(`ach-${ach.id}`)
      if (el) {
        gsap.fromTo(el,
          { scale: 1 },
          { scale: 1.06, duration: 0.12, yoyo: true, repeat: 3, ease: 'power2.inOut' }
        )
      }
    }
    setActive(ach)
  }

  const totalScore = opened.length * 1000 + insertedCoins * 50

  return (
    <div style={{
      width: '100%', minHeight: 'calc(100vh - 64px)',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #0A0015 0%, #100020 40%, #0A001A 100%)',
      padding: '0 0 80px',
    }}>

      {/* ── Arcade grid background ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: [
          'linear-gradient(rgba(180,0,255,.06) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(180,0,255,.06) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '40px 40px',
      }} />

      {/* ── Neon glow blobs ── */}
      {[
        { c: 'rgba(180,0,255,.12)', x: '10%',  y: '20%' },
        { c: 'rgba(0,150,255,.09)', x: '75%',  y: '15%' },
        { c: 'rgba(255,0,100,.08)', x: '45%',  y: '60%' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.x, top: b.y,
          width: 350, height: 250,
          background: `radial-gradient(ellipse, ${b.c}, transparent)`,
          filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
          animation: `aurora ${5 + i * 2}s ${i}s ease-in-out infinite`,
        }} />
      ))}

      {/* ── Top marquee scrolling text ── */}
      <div style={{
        width: '100%', overflow: 'hidden',
        background: 'rgba(180,0,255,.15)',
        borderTop: '2px solid #b400ff',
        borderBottom: '2px solid #b400ff',
        padding: '6px 0', zIndex: 2, position: 'relative',
        boxShadow: '0 0 20px rgba(180,0,255,.4)',
      }}>
        <div ref={marqueeRef} style={{
          display: 'inline-flex', gap: 60, whiteSpace: 'nowrap',
          fontFamily: '"Press Start 2P", monospace', fontSize: 8,
          color: '#b400ff',
          textShadow: '0 0 12px #b400ff',
        }}>
          {/* duplicated for seamless loop */}
          {[...Array(2)].map((_, ri) => (
            <span key={ri}>
              {ACHIEVEMENTS.map(a => `${a.icon} ${a.title} `).join('  ·  ')}
            </span>
          ))}
        </div>
      </div>

      {/* ── Arcade cabinet header ── */}
      <div ref={headerRef} style={{
        textAlign: 'center', padding: '28px 24px 20px',
        position: 'relative', zIndex: 2, opacity: 0,
      }}>
        {/* Score panel */}
        <div style={{
          display: 'inline-flex', gap: 32, alignItems: 'center',
          background: 'rgba(0,0,0,.8)',
          border: '2px solid rgba(180,0,255,.4)',
          borderRadius: 8, padding: '8px 28px', marginBottom: 20,
          boxShadow: '0 0 30px rgba(180,0,255,.2)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: 'rgba(180,0,255,.7)', marginBottom: 4 }}>HIGH SCORE</div>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 13, color: '#b400ff', textShadow: '0 0 14px #b400ff' }}>
              <ScoreTicker score={totalScore} />
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: 'rgba(180,0,255,.3)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: 'rgba(255,215,0,.7)', marginBottom: 4 }}>UNLOCKED</div>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 13, color: '#FFD700', textShadow: '0 0 14px #FFD700' }}>
              {opened.length}/{ACHIEVEMENTS.length}
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: 'rgba(180,0,255,.3)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: 'rgba(0,255,136,.7)', marginBottom: 4 }}>COINS IN</div>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 13, color: '#00ff88', textShadow: '0 0 14px #00ff88' }}>
              {String(insertedCoins).padStart(2, '0')}
            </div>
          </div>
        </div>

        <h1 style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(14px, 2.5vw, 22px)',
          color: '#b400ff',
          textShadow: '0 0 30px #b400ff, 0 0 70px rgba(180,0,255,.4)',
          letterSpacing: 3, marginBottom: 10,
        }}>
          🏅 TROPHY ARCADE 🏅
        </h1>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 7.5, color: 'rgba(255,255,255,.5)',
        }}>
          CLICK ANY TROPHY TO INSERT COIN &amp; UNLOCK
        </div>
      </div>

      {/* ── Tier filter legend ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 14,
        marginBottom: 24, position: 'relative', zIndex: 2,
      }}>
        {Object.entries(TIER_CLR).map(([tier, color]) => (
          <div key={tier} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: '"Press Start 2P", monospace', fontSize: 6.5,
            color, border: `1px solid ${color}44`,
            background: `${color}11`, borderRadius: 4, padding: '4px 10px',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
            {tier}
          </div>
        ))}
      </div>

      {/* ── Achievement grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 18, maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        position: 'relative', zIndex: 2,
      }}>
        {ACHIEVEMENTS.map(ach => {
          const isOpen   = opened.includes(ach.id)
          const isActive = active?.id === ach.id
          const tierClr  = TIER_CLR[ach.tier]

          return (
            <div
              id={`ach-${ach.id}`}
              key={ach.id}
              onClick={() => openCard(ach)}
              style={{
                background: isOpen
                  ? `linear-gradient(135deg, ${ach.color}16, rgba(0,0,0,.85))`
                  : 'rgba(0,0,0,.75)',
                border: `2px solid ${isActive ? ach.color : isOpen ? `${ach.color}55` : 'rgba(180,0,255,.18)'}`,
                borderRadius: 10, cursor: 'pointer', overflow: 'hidden',
                boxShadow: isActive
                  ? `0 0 50px ${ach.color}66, inset 0 0 20px ${ach.color}0a`
                  : isOpen ? `0 0 24px ${ach.color}33` : 'none',
                transition: 'all .3s ease',
                backdropFilter: 'blur(12px)',
                transform: isActive ? 'translateY(-6px)' : 'none',
              }}
            >
              {/* Card top bar */}
              <div style={{
                background: isOpen
                  ? `linear-gradient(90deg, ${ach.color}33, transparent)`
                  : 'rgba(180,0,255,.06)',
                borderBottom: `1px solid ${isOpen ? ach.color + '44' : 'rgba(180,0,255,.15)'}`,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 8,
                  background: isOpen ? `${ach.color}22` : 'rgba(255,255,255,.05)',
                  border: `2px solid ${isOpen ? ach.color : 'rgba(255,255,255,.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                  boxShadow: isOpen ? `0 0 16px ${ach.color}55` : 'none',
                  transition: 'all .3s',
                }}>
                  {isOpen ? ach.icon : '🔒'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Tier badge */}
                  <div style={{
                    display: 'inline-block', marginBottom: 4,
                    fontFamily: '"Press Start 2P", monospace', fontSize: 5,
                    color: tierClr, background: `${tierClr}18`,
                    border: `1px solid ${tierClr}44`, padding: '2px 6px', borderRadius: 3,
                  }}>
                    {ach.badge}
                  </div>
                  <div style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 8, color: isOpen ? ach.color : '#e2e8f0',
                    textShadow: isOpen ? `0 0 10px ${ach.color}` : 'none',
                    lineHeight: 1.5,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {ach.title}
                  </div>
                </div>

                {/* Pixel trophy top-right */}
                {isOpen && (
                  <div style={{ flexShrink: 0 }}>
                    <PixelTrophy color={ach.color} size={4} />
                  </div>
                )}
              </div>

              {/* Issuer + date */}
              <div style={{
                padding: '8px 16px 10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 5.5, color: 'rgba(255,255,255,.45)',
                }}>
                  {isOpen ? ach.issuer : '???'}
                </div>
                <div style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 5.5, color: isOpen ? `${ach.color}99` : 'rgba(255,255,255,.25)',
                }}>
                  {isOpen ? ach.date : '----'}
                </div>
              </div>

              {/* Expanded description */}
              {isActive && isOpen && (
                <div style={{
                  padding: '0 16px 14px',
                  borderTop: `1px solid ${ach.color}22`,
                }}>
                  <p style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: 12, color: 'rgba(255,255,255,.75)',
                    lineHeight: 1.75, margin: '10px 0 10px',
                  }}>
                    {ach.desc}
                  </p>
                  {ach.link !== '#' && (
                    <a href={ach.link} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontFamily: '"Press Start 2P", monospace', fontSize: 6.5,
                        color: ach.color, textDecoration: 'none',
                        border: `1px solid ${ach.color}55`,
                        background: `${ach.color}11`,
                        padding: '5px 12px', borderRadius: 4,
                        transition: 'all .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${ach.color}22`; e.currentTarget.style.transform = 'scale(1.05)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${ach.color}11`; e.currentTarget.style.transform = 'none' }}
                    >
                      🔗 VIEW CREDENTIAL
                    </a>
                  )}
                </div>
              )}

              {/* "Insert coin" hint when locked */}
              {!isOpen && (
                <div style={{
                  textAlign: 'center', padding: '0 0 12px',
                  fontFamily: '"Press Start 2P", monospace', fontSize: 6,
                  color: 'rgba(180,0,255,.5)',
                  animation: 'blink 1.6s step-end infinite',
                }}>
                  INSERT COIN ▶
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── All-unlocked celebration ── */}
      {opened.length === ACHIEVEMENTS.length && (
        <div style={{
          textAlign: 'center', marginTop: 48,
          position: 'relative', zIndex: 2,
          animation: 'rainbow 1.5s linear infinite',
        }}>
          <div style={{
            display: 'inline-block',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(11px,2vw,17px)', color: '#b400ff',
            textShadow: '0 0 40px #b400ff',
            padding: '16px 32px',
            background: 'rgba(0,0,0,.7)',
            border: '2px solid rgba(180,0,255,.5)',
            borderRadius: 10,
            boxShadow: '0 0 60px rgba(180,0,255,.3)',
          }}>
            🏆 ARCADE MASTER! ALL TROPHIES COLLECTED! 🏆
          </div>
        </div>
      )}

      {/* ── Next button ── */}
      <div style={{ textAlign: 'center', marginTop: 52, position: 'relative', zIndex: 2 }}>
        <button onClick={onNext} style={{
          background: 'linear-gradient(135deg, rgba(180,0,255,.14), rgba(120,0,200,.08))',
          border: '2px solid #b400ff', color: '#b400ff',
          padding: '14px 36px',
          fontFamily: '"Press Start 2P", monospace', fontSize: 9,
          cursor: 'pointer', borderRadius: 7,
          boxShadow: '0 0 30px rgba(180,0,255,.3), 0 4px 0 rgba(120,0,200,.3)',
          transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,0,255,.24)'; e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(180,0,255,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(180,0,255,.14),rgba(120,0,200,.08))'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 30px rgba(180,0,255,.3), 0 4px 0 rgba(120,0,200,.3)' }}
        >
          ✉️ FINAL BOSS ▶
        </button>
      </div>

      <style>{`
        @keyframes aurora { 0%,100%{opacity:.7;transform:scale(1) translateY(0)} 50%{opacity:1;transform:scale(1.06) translateY(-18px)} }
      `}</style>
    </div>
  )
}
