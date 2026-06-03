import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════
   WORLD 9 — AANYA_OS TERMINAL
   Clean, readable interactive console.
   Large text, high-contrast, real commands.
═══════════════════════════════════════════════════════ */

const BOOT_LINES = [
  { text: 'AANYA_OS v2.0 — Full-Stack Mage Edition', c: 'banner' },
  { text: '─────────────────────────────────────────────', c: 'dim'    },
  { text: 'BIOS Rev 2.0  |  CPU: Full-Stack @ 9.21 GHz', c: 'dim'    },
  { text: 'RAM: 27 GitHub repos loaded successfully', c: 'dim'    },
  { text: '', c: 'out' },
  { text: '[  OK  ]  Initializing kernel modules...', c: 'ok'     },
  { text: '[  OK  ]  Loading React.dll v19', c: 'ok'     },
  { text: '[  OK  ]  Mounting /cloud/gcp  ← certified', c: 'ok'     },
  { text: '[  OK  ]  Starting AI research daemon', c: 'ok'     },
  { text: '[  OK  ]  Connecting to github.com/aanyaagrawal26', c: 'ok'     },
  { text: '[ WARN ]  27 active repos found — impressive!', c: 'warn'   },
  { text: '[  OK  ]  All systems ready. Welcome, Visitor.', c: 'ok'     },
  { text: '', c: 'out' },
  { text: '  Type  help  to see available commands.', c: 'info'   },
  { text: '  Tip:  try   sudo hire aanya   👀', c: 'info'   },
  { text: '', c: 'out' },
]

const CMDS = {
  help: [
    { t: '┌─────────────────────────────────────────────┐', c: 'dim'    },
    { t: '│            AVAILABLE COMMANDS               │', c: 'banner' },
    { t: '├─────────────────────────────────────────────┤', c: 'dim'    },
    { t: '│  whoami        →  Who is Aanya?             │', c: 'out'    },
    { t: '│  about         →  Full biography            │', c: 'out'    },
    { t: '│  skills        →  Tech stack + levels       │', c: 'out'    },
    { t: '│  projects      →  All projects              │', c: 'out'    },
    { t: '│  experience    →  Roles & programs          │', c: 'out'    },
    { t: '│  certs         →  Certifications            │', c: 'out'    },
    { t: '│  hackathons    →  Hackathon history         │', c: 'out'    },
    { t: '│  contact       →  Reach me                 │', c: 'out'    },
    { t: '│  stats         →  Quick numbers             │', c: 'out'    },
    { t: '│  clear         →  Clear terminal            │', c: 'out'    },
    { t: '│  sudo hire aanya  →  🎉 Easter egg          │', c: 'gold'   },
    { t: '└─────────────────────────────────────────────┘', c: 'dim'    },
  ],
  whoami: [
    { t: '──────────────────────────────────────────────', c: 'dim'    },
    { t: '  Name    :  Aanya Agrawal',                    c: 'out'    },
    { t: '  College :  SRMIST Chennai — B.Tech CSE',      c: 'out'    },
    { t: '  Major   :  Cloud Computing',                  c: 'out'    },
    { t: '  CGPA    :  9.21 / 10.0  ⭐',                  c: 'gold'   },
    { t: '  Role    :  Full-Stack Dev · Cloud · AI/ML',   c: 'out'    },
    { t: '  Status  :  Open to opportunities  ✅',        c: 'ok'     },
    { t: '──────────────────────────────────────────────', c: 'dim'    },
  ],
  about: [
    { t: "  Hey! I'm Aanya Agrawal, a B.Tech CSE student",  c: 'out'  },
    { t: '  specialising in Cloud Computing at SRMIST.',     c: 'out'  },
    { t: '',                                                  c: 'out'  },
    { t: '  I build full-stack apps, design cloud infra,',   c: 'out'  },
    { t: '  and explore AI/ML systems. I love turning',      c: 'out'  },
    { t: '  complex ideas into clean, elegant code.',        c: 'out'  },
    { t: '',                                                  c: 'out'  },
    { t: '  From SIH hackathons to UROP AI research —',     c: 'gold' },
    { t: "  always building, always levelling up. 🍄",       c: 'gold' },
  ],
  skills: [
    { t: '──────────────────────────────────────────────', c: 'dim'   },
    { t: '  SKILL              LEVEL       SCORE',           c: 'dim'  },
    { t: '──────────────────────────────────────────────', c: 'dim'   },
    { t: '  React / Next.js    ██████████  92/100',          c: 'skill'},
    { t: '  Python             ██████████  90/100',          c: 'skill'},
    { t: '  Google Cloud       █████████░  88/100',          c: 'skill'},
    { t: '  Node.js            █████████░  85/100',          c: 'skill'},
    { t: '  TypeScript         ████████░░  82/100',          c: 'skill'},
    { t: '  Tailwind CSS       ████████░░  88/100',          c: 'skill'},
    { t: '  ML / AI            ████████░░  76/100',          c: 'skill'},
    { t: '  MySQL / MongoDB    ████████░░  80/100',          c: 'skill'},
    { t: '  Git / GitHub       ██████████  92/100',          c: 'skill'},
    { t: '──────────────────────────────────────────────', c: 'dim'   },
  ],
  projects: [
    { t: '──────────────────────────────────────────────', c: 'dim'  },
    { t: '  [1]  DevPulse',                                  c: 'gold' },
    { t: '       GitHub Analytics + AI Dashboard',           c: 'out'  },
    { t: '       Next.js  TypeScript  MongoDB  RAG',         c: 'dim'  },
    { t: '',                                                  c: 'out'  },
    { t: '  [2]  AI Multiverse OS',                          c: 'gold' },
    { t: '       Multi-Agent AI System',                     c: 'out'  },
    { t: '       Python  LLMs  AutoGen  Workflows',          c: 'dim'  },
    { t: '',                                                  c: 'out'  },
    { t: '  [3]  Sundown Clone',                             c: 'gold' },
    { t: '       Immersive Frontend Experience',             c: 'out'  },
    { t: '       HTML  CSS  GSAP  Canvas  ScrollTrigger',    c: 'dim'  },
    { t: '',                                                  c: 'out'  },
    { t: '  [4]  Carbon AI Research  (UROP)',                c: 'gold' },
    { t: '       UN SDG-aligned supply chain AI',            c: 'out'  },
    { t: '       Python  ML  NumPy  Pandas  Scikit',         c: 'dim'  },
    { t: '',                                                  c: 'out'  },
    { t: '  → 27 more at github.com/aanyaagrawal26',         c: 'info' },
    { t: '──────────────────────────────────────────────', c: 'dim'  },
  ],
  experience: [
    { t: '──────────────────────────────────────────────', c: 'dim'  },
    { t: '  CODENEX         Associate Member   Nov 2024', c: 'out'  },
    { t: '  ACM SIGKDD      Core Member        Apr 2025', c: 'out'  },
    { t: '  SRM UROP        AI Researcher      Aug 2025', c: 'ok'   },
    { t: '  Novacode        Frontend Trainee   ✓ DONE',  c: 'done' },
    { t: '  Microsoft Elev  Cloud Scholar      ✓ DONE',  c: 'done' },
    { t: '  JP Morgan       SWE Simulation     Dec 2025', c: 'out'  },
    { t: '  McKinsey Fwd    Forward Program    Dec 2025', c: 'out'  },
    { t: '──────────────────────────────────────────────', c: 'dim'  },
  ],
  certs: [
    { t: '──────────────────────────────────────────────', c: 'dim'  },
    { t: '  ★  Google Cloud Associate Engineer  Oct 2024', c: 'gold' },
    { t: '  ★  AWS Cloud Practitioner           Jan 2025', c: 'gold' },
    { t: '  ★  Microsoft Azure AI-900           Feb 2025', c: 'gold' },
    { t: '  ★  JP Morgan SWE Simulation         Dec 2025', c: 'ok'   },
    { t: '  ★  McKinsey Forward Program         Dec 2025', c: 'ok'   },
    { t: '  ★  Coursera ML Specialization       Mar 2025', c: 'ok'   },
    { t: '  ★  HackerRank Gold Badge (Python)   2024',    c: 'ok'   },
    { t: '  → 15+ total on credly.com',                   c: 'info' },
    { t: '──────────────────────────────────────────────', c: 'dim'  },
  ],
  hackathons: [
    { t: '──────────────────────────────────────────────', c: 'dim'  },
    { t: '  Smart India Hackathon 2024  →  FINALIST 🏆', c: 'gold' },
    { t: '  Built AI disaster response system',           c: 'out'  },
    { t: '  with multi-modal alert routing + ML.',        c: 'dim'  },
    { t: '',                                              c: 'out'  },
    { t: '  SRMIST Internal Hackathons  →  Multiple wins', c: 'ok' },
    { t: '  CodeNex Club events  →  Organiser & participant', c: 'ok' },
    { t: '  5+ hackathons and counting 🚀',               c: 'info' },
    { t: '──────────────────────────────────────────────', c: 'dim'  },
  ],
  contact: [
    { t: '──────────────────────────────────────────────', c: 'dim'  },
    { t: '  Email    aanyaagrawal260304@gmail.com',        c: 'out'  },
    { t: '  GitHub   github.com/aanyaagrawal26',           c: 'out'  },
    { t: '  LinkedIn linkedin.com/in/aanya-agrawal-99b1a8322', c: 'out' },
    { t: '  LeetCode leetcode.com/u/aanya24_6',            c: 'out'  },
    { t: '  Credly   credly.com/users/aanya-agrawal.1c0eee02', c: 'out' },
    { t: '──────────────────────────────────────────────', c: 'dim'  },
  ],
  stats: [
    { t: '──────────────────────────────────────────────', c: 'dim'  },
    { t: '  CGPA           9.21 / 10.0',                   c: 'gold' },
    { t: '  GitHub Repos   27',                            c: 'out'  },
    { t: '  Certifications 15+',                           c: 'out'  },
    { t: '  Hackathons     5+  (SIH 2024 Finalist)',       c: 'out'  },
    { t: '  Research       UROP @ SRMIST (ongoing)',       c: 'ok'   },
    { t: '  Programs Done  Microsoft Elevate ✓',           c: 'done' },
    { t: '  Programs Done  Novacode Training ✓',           c: 'done' },
    { t: '──────────────────────────────────────────────', c: 'dim'  },
  ],
  'sudo hire aanya': [
    { t: '',                                               c: 'out'  },
    { t: '[sudo] password for visitor: ••••••••••••',     c: 'dim'  },
    { t: '',                                               c: 'out'  },
    { t: '███████████████████████████████████████████████', c: 'gold' },
    { t: '  ✅  SUDO ACCESS GRANTED',                      c: 'gold' },
    { t: '  AANYA.EXE hired successfully.',                c: 'gold' },
    { t: '  Redirecting → /team/best-developer...',        c: 'gold' },
    { t: '  Excellent choice, human. 🎉🚀',                c: 'gold' },
    { t: '███████████████████████████████████████████████', c: 'gold' },
    { t: '',                                               c: 'out'  },
  ],
}

const CLR = {
  banner: '#00ff88',
  ok:     '#00ff88',
  warn:   '#FFD700',
  info:   '#38bdf8',
  dim:    'rgba(0,220,100,.5)',
  out:    '#d4fde4',
  gold:   '#FFD700',
  skill:  '#00ffcc',
  done:   '#00ff88',
  err:    '#ff6b6b',
  cmd:    '#FFD700',
}

const CMDS_LIST = ['help','whoami','about','skills','projects','experience','certs','hackathons','contact','stats','clear']

function ts() {
  const d = new Date()
  return `[${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}]`
}

export default function World9Terminal({ onNext }) {
  const [lines,  setLines]   = useState([])
  const [input,  setInput]   = useState('')
  const [ready,  setReady]   = useState(false)
  const [blink,  setBlink]   = useState(true)
  const [hints,  setHints]   = useState([])
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  /* boot */
  useEffect(() => {
    let delay = 0
    const timers = BOOT_LINES.map(line => {
      delay += 120
      return setTimeout(() =>
        setLines(p => [...p, { id: Date.now() + delay + Math.random(), ...line }]),
        delay
      )
    })
    setTimeout(() => setReady(true), delay + 300)
    return () => timers.forEach(clearTimeout)
  }, [])

  /* cursor blink */
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 500)
    return () => clearInterval(id)
  }, [])

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  /* autocomplete hints */
  useEffect(() => {
    const q = input.trim().toLowerCase()
    setHints(q ? CMDS_LIST.filter(c => c.startsWith(q)) : [])
  }, [input])

  const submit = useCallback(() => {
    const raw = input.trim()
    if (!raw) return
    const cmd = raw.toLowerCase()
    setInput(''); setHints([])

    const echoLine = { id: Date.now(), text: `${ts()}  visitor@aanya:~$ ${raw}`, c: 'cmd' }

    if (cmd === 'clear') { setLines([echoLine]); return }

    const results = CMDS[cmd]
    if (results) {
      const out = results.map((l, i) => ({ id: Date.now()+i+10, text: l.t, c: l.c }))
      setLines(p => [...p, echoLine, ...out, { id: Date.now()+9999, text: '', c: 'out' }])
    } else {
      setLines(p => [...p, echoLine,
        { id: Date.now()+1, text: `  bash: ${raw}: not found. Type 'help' for commands.`, c: 'err' },
        { id: Date.now()+2, text: '', c: 'out' },
      ])
    }
  }, [input])

  const onKey = e => {
    if (e.key === 'Enter') { submit(); return }
    if (e.key === 'Tab') { e.preventDefault(); if (hints.length === 1) setInput(hints[0]) }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        width: '100%', minHeight: 'calc(100vh - 64px)',
        background: '#0C1A0C',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        fontFamily: 'monospace',
      }}
    >
      {/* subtle scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0,rgba(0,0,0,.18) 1px,transparent 1px,transparent 4px)',
      }} />

      {/* title bar */}
      <div style={{
        background: '#0A150A',
        borderBottom: '1px solid rgba(0,255,80,.25)',
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <span style={{ fontSize: 14, color: '#00cc55', fontFamily: '"Press Start 2P", monospace', letterSpacing: 1 }}>
            aanya@aanya-os — bash
          </span>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(0,200,60,.4)', fontFamily: '"Press Start 2P", monospace' }}>
          AANYA_OS v2.0
        </span>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* output pane */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 28px 12px',
          scrollbarWidth: 'thin', scrollbarColor: '#00ff5533 #0C1A0C',
        }}>

          {lines.map(line => (
            <div key={line.id} style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: CLR[line.c] || '#d4fde4',
              textShadow: line.c === 'gold'   ? '0 0 12px rgba(255,215,0,.6)'
                        : line.c === 'ok'    ? '0 0 8px rgba(0,255,136,.5)'
                        : line.c === 'err'   ? '0 0 8px rgba(255,107,107,.5)'
                        : line.c === 'banner'? '0 0 14px rgba(0,255,136,.7)'
                        : 'none',
              whiteSpace: 'pre',
              letterSpacing: 0.3,
            }}>{line.text || '\u00A0'}</div>
          ))}

          {ready && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,.5)', whiteSpace: 'nowrap' }}>
                {ts()}  visitor@aanya:~$
              </span>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', minHeight: 24 }}>
                <span style={{ fontSize: 15, color: '#00ff88' }}>{input}</span>
                <span style={{
                  display: 'inline-block', width: 10, height: 20,
                  background: blink ? '#00ff88' : 'transparent',
                  marginLeft: 1, verticalAlign: 'middle',
                  boxShadow: blink ? '0 0 8px #00ff88' : 'none',
                }} />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  autoFocus
                  style={{
                    position: 'absolute', inset: 0,
                    opacity: 0, border: 'none', outline: 'none',
                    background: 'transparent', cursor: 'text',
                    fontSize: 15,
                  }}
                />
              </div>
            </div>
          )}

          {/* autocomplete dropdown */}
          {hints.length > 0 && hints.length < CMDS_LIST.length && (
            <div style={{
              display: 'flex', gap: 8, flexWrap: 'wrap',
              marginTop: 4, marginLeft: 2,
            }}>
              {hints.map(h => (
                <button key={h} onClick={() => { setInput(h); inputRef.current?.focus() }} style={{
                  background: 'rgba(0,255,80,.12)',
                  border: '1px solid rgba(0,255,80,.4)',
                  color: '#00ff88', padding: '3px 12px',
                  fontFamily: 'monospace', fontSize: 13,
                  cursor: 'pointer', borderRadius: 3,
                }}>
                  {h}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* sidebar */}
        <div style={{
          width: 220, flexShrink: 0,
          borderLeft: '1px solid rgba(0,255,80,.15)',
          background: '#091209',
          padding: '20px 16px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(0,255,80,.5)', marginBottom: 6, letterSpacing: 2, fontFamily: '"Press Start 2P", monospace' }}>
            COMMANDS
          </div>
          {CMDS_LIST.map(cmd => (
            <button key={cmd} onClick={() => { setInput(cmd); inputRef.current?.focus() }} style={{
              display: 'block', width: '100%',
              background: 'transparent',
              border: 'none',
              borderLeft: `3px solid ${input && cmd.startsWith(input) ? '#00ff88' : 'transparent'}`,
              color: input && cmd.startsWith(input) ? '#00ff88' : 'rgba(0,200,60,.6)',
              padding: '6px 10px', cursor: 'pointer',
              textAlign: 'left', fontFamily: 'monospace', fontSize: 14,
              borderRadius: '0 4px 4px 0',
              transition: 'all .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(0,255,80,.1)'; e.currentTarget.style.color='#00ff88'; e.currentTarget.style.borderLeftColor='#00ff88' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=input&&cmd.startsWith(input)?'#00ff88':'rgba(0,200,60,.6)'; e.currentTarget.style.borderLeftColor=input&&cmd.startsWith(input)?'#00ff88':'transparent' }}
            >
              {cmd}
            </button>
          ))}

          <div style={{ borderTop: '1px solid rgba(0,255,80,.1)', paddingTop: 14, marginTop: 6 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,255,80,.4)', marginBottom: 8, letterSpacing: 1, fontFamily: '"Press Start 2P", monospace' }}>TIPS</div>
            {['Tab → autocomplete','Click a command','Try: sudo hire aanya'].map((t,i) => (
              <div key={i} style={{ fontSize: 13, color: 'rgba(0,180,60,.5)', lineHeight: 2 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{
        background: '#0A150A',
        borderTop: '1px solid rgba(0,255,80,.15)',
        padding: '10px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(0,255,80,.4)', fontFamily: '"Press Start 2P", monospace' }}>AANYA_OS v2.0</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#00ff88', fontFamily: '"Press Start 2P", monospace' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', display: 'inline-block', boxShadow: '0 0 8px #00ff88' }} />
            ONLINE
          </span>
        </div>
        <button onClick={onNext} style={{
          background: 'rgba(0,255,80,.1)',
          border: '2px solid rgba(0,255,80,.45)',
          color: '#00ff88', padding: '10px 22px',
          fontFamily: '"Press Start 2P", monospace', fontSize: 9,
          cursor: 'pointer', borderRadius: 5,
          boxShadow: '0 0 16px rgba(0,255,80,.2)',
          transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(0,255,80,.22)'; e.currentTarget.style.boxShadow='0 0 28px rgba(0,255,80,.45)'; e.currentTarget.style.transform='translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(0,255,80,.1)'; e.currentTarget.style.boxShadow='0 0 16px rgba(0,255,80,.2)'; e.currentTarget.style.transform='none' }}
        >
          NEXT WORLD ▶
        </button>
      </div>
    </div>
  )
}
