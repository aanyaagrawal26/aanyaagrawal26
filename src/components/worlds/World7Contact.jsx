import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'

const SOCIALS = [
  { label:'GitHub',     url:'https://github.com/aanyaagrawal26',                                      color:'#e2e8f0', icon:'🐙' },
  { label:'LinkedIn',   url:'https://www.linkedin.com/in/aanya-agrawal-99b1a8322/',                   color:'#38bdf8', icon:'💼' },
  { label:'LeetCode',   url:'https://leetcode.com/u/aanya24_6/',                                      color:'#FFA116', icon:'💻' },
  { label:'HackerRank', url:'https://www.hackerrank.com/profile/aanya_03024',                         color:'#00EA64', icon:'🟢' },
  { label:'Credly',     url:'https://www.credly.com/users/aanya-agrawal.1c0eee02/badges',             color:'#FF6B00', icon:'🏅' },
]

// Victory confetti particle
function Confetti({ count = 60 }) {
  const colors = ['#FFD700','#FF5722','#00ff88','#00aaff','#bf5af2','#ff69b4']
  return (
    <>
      {Array.from({length:count}).map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${(i*1.7)%100}%`,
          top:`${-5-(i%8)*3}%`,
          width: i%3===0 ? 8 : 5, height: i%3===0 ? 8 : 14,
          background:colors[i%colors.length],
          borderRadius: i%2===0 ? '50%' : 2,
          transform:`rotate(${i*23}deg)`,
          animation:`confettiFall ${2+i*.08}s ${i*.04}s ease-in forwards`,
          zIndex:0, pointerEvents:'none',
        }} />
      ))}
    </>
  )
}

export default function World7Contact() {
  const [form, setForm]             = useState({ name:'', email:'', message:'' })
  const [submitted, setSubmitted]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]         = useState({})
  const [focusedField, setFocused]  = useState(null)
  const formRef    = useRef(null)
  const victoryRef = useRef(null)
  const bossRef    = useRef(null)

  const addCoins = useGameStore(s => s.addCoins)
  const addXP    = useGameStore(s => s.addXP)

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity:0, y:50, scale:.94 },
        { opacity:1, y:0, scale:1, duration:.8, ease:'back.out(1.5)', delay:.2 }
      )
    }
    // Boss idle animation
    if (bossRef.current) {
      gsap.to(bossRef.current, { y:-10, repeat:-1, yoyo:true, duration:1.2, ease:'sine.inOut' })
    }
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'ENTER YOUR NAME!'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                               e.email   = 'VALID EMAIL REQUIRED!'
    if (!form.message.trim()) e.message = 'TYPE YOUR MESSAGE!'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validate()) {
      // Shake form on error
      gsap.to(formRef.current, { x:-8, duration:.08, repeat:5, yoyo:true, ease:'power1.inOut' })
      return
    }
    setSubmitting(true)
    // Boss defeat animation
    if (bossRef.current) {
      gsap.to(bossRef.current, { rotation:720, scale:0, opacity:0, duration:1.5, ease:'back.in(2)' })
    }
    setTimeout(() => {
      setSubmitted(true)
      addCoins(50); addXP(100)
      setTimeout(() => {
        if (victoryRef.current) {
          gsap.fromTo(victoryRef.current,
            { scale:.4, opacity:0 },
            { scale:1, opacity:1, duration:.9, ease:'back.out(2)' }
          )
        }
      }, 100)
    }, 2000)
  }

  const fieldBase = (field) => ({
    width:'100%',
    background: focusedField === field ? 'rgba(255,87,34,.1)' : 'rgba(255,87,34,.05)',
    border:`2px solid ${errors[field] ? '#ef4444' : focusedField === field ? '#FF8F00' : 'rgba(255,87,34,.35)'}`,
    borderRadius:8, color:'#f1f5f9', padding:'12px 14px',
    fontFamily:'system-ui,sans-serif', fontSize:14,
    outline:'none', boxSizing:'border-box',
    transition:'all .2s',
    boxShadow: focusedField === field ? '0 0 20px rgba(255,143,0,.35)' : 'none',
  })

  return (
    <div style={{
      width:'100%', minHeight:'calc(100vh - 64px)', position:'relative',
      background:'linear-gradient(180deg,#040000 0%,#0a0000 45%,#040000 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      overflow:'hidden', padding:'40px 20px',
    }}>

      {/* ── Heat haze ── */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, height:'30%',
        background:'linear-gradient(0deg,rgba(255,87,34,.2),transparent)',
        animation:'heatWave 3s ease-in-out infinite',
        pointerEvents:'none', zIndex:0,
      }} />

      {/* ── Boss character (floats above form) ── */}
      {!submitted && (
        <div ref={bossRef} style={{
          position:'relative', zIndex:3, textAlign:'center', marginBottom:20,
        }}>
          <div style={{ fontSize:52, filter:'drop-shadow(0 0 20px rgba(255,87,34,.7))' }}>
            👾
          </div>
          <div style={{
            position:'absolute', top:-15, left:'50%', transform:'translateX(-50%)',
            whiteSpace:'nowrap',
            fontFamily:'"Press Start 2P", monospace', fontSize:6,
            color:'#FF5722', background:'rgba(0,0,0,.8)',
            border:'1px solid rgba(255,87,34,.4)', borderRadius:4,
            padding:'3px 8px',
            animation:'float 2s ease-in-out infinite',
          }}>
            SEND A MSG TO DEFEAT ME!
          </div>
        </div>
      )}

      {/* ── Embers ── */}
      {Array.from({length:18}).map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${(i*5.6)%95}%`, bottom:`${4+(i%6)*8}%`,
          width:3+(i%3)*2, height:3+(i%3)*2, borderRadius:'50%',
          background:['#FF5722','#FF8F00','#FFD700'][i%3],
          boxShadow:`0 0 ${6+i%4*4}px ${['#FF5722','#FF8F00','#FFD700'][i%3]}`,
          animation:`float ${2+i*.35}s ${i*.25}s ease-in-out infinite, particleRise ${5+i%3}s ${i*.4}s ease-out infinite`,
          opacity:.65, pointerEvents:'none', zIndex:0,
        }} />
      ))}

      {!submitted ? (
        <form ref={formRef} onSubmit={handleSubmit} noValidate
          style={{
            width:'100%', maxWidth:540, position:'relative', zIndex:2, opacity:0,
            background:'linear-gradient(135deg,rgba(0,0,0,.92),rgba(10,5,5,.95))',
            border:'2px solid rgba(255,87,34,.5)',
            borderRadius:14, padding:38,
            boxShadow:'0 0 100px rgba(255,87,34,.2),inset 0 0 30px rgba(255,87,34,.04)',
            backdropFilter:'blur(18px)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{
              fontFamily:'"Press Start 2P", monospace',
              fontSize:'clamp(13px,2.2vw,20px)', color:'#FF5722',
              textShadow:'0 0 28px #FF5722, 0 0 60px rgba(255,87,34,.4)',
              marginBottom:10,
            }}>
              🏰 FINAL BOSS
            </div>
            <div style={{
              fontFamily:'"Press Start 2P", monospace',
              fontSize:7.5, color:'rgba(255,255,255,.55)',
            }}>
              DEFEAT THE BOSS WITH YOUR MESSAGE
            </div>
          </div>

          {/* Fields */}
          {[
            { key:'name',    label:'► PLAYER NAME',   type:'text',  rows:0 },
            { key:'email',   label:'► EMAIL.EXE',     type:'email', rows:0 },
            { key:'message', label:'► YOUR MESSAGE',  type:'text',  rows:4 },
          ].map(({ key, label, type, rows }) => (
            <div key={key} style={{ marginBottom:18 }}>
              <label style={{
                display:'block',
                fontFamily:'"Press Start 2P", monospace',
                fontSize:7.5, color:'#FF5722', marginBottom:7, letterSpacing:.5,
              }}>
                {label}
              </label>
              {rows > 0 ? (
                <textarea
                  rows={rows}
                  value={form[key]}
                  onChange={e => { setForm(p => ({...p,[key]:e.target.value})); if(errors[key]) setErrors(p=>({...p,[key]:''})) }}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                  style={{ ...fieldBase(key), resize:'vertical' }}
                />
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => { setForm(p => ({...p,[key]:e.target.value})); if(errors[key]) setErrors(p=>({...p,[key]:''})) }}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                  style={fieldBase(key)}
                />
              )}
              {errors[key] && (
                <div style={{
                  fontFamily:'"Press Start 2P", monospace',
                  fontSize:6.5, color:'#ef4444', marginTop:5,
                  animation:'slideDown .3s ease-out',
                  display:'flex', alignItems:'center', gap:5,
                }}>
                  ⚠ {errors[key]}
                </div>
              )}
            </div>
          ))}

          {/* Social links */}
          <div style={{
            display:'flex', gap:8, flexWrap:'wrap',
            justifyContent:'center', marginBottom:22,
          }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{
                  padding:'7px 13px', border:`1px solid ${s.color}44`,
                  borderRadius:6, color:s.color,
                  fontFamily:'"Press Start 2P", monospace', fontSize:6.5,
                  textDecoration:'none', background:'rgba(0,0,0,.5)',
                  transition:'all .2s', display:'flex', alignItems:'center', gap:5,
                }}
                onMouseEnter={e => { e.currentTarget.style.background=`${s.color}18`; e.currentTarget.style.borderColor=s.color; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 0 16px ${s.color}44` }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(0,0,0,.5)'; e.currentTarget.style.borderColor=`${s.color}44`; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}
              >
                {s.icon} {s.label}
              </a>
            ))}
          </div>

          <button type="submit" disabled={submitting}
            style={{
              width:'100%', padding:15,
              background: submitting ? 'rgba(30,30,30,.9)' : 'linear-gradient(135deg,#FF5722,#E64A19)',
              border:'none', borderRadius:9, color:'#fff',
              fontFamily:'"Press Start 2P", monospace', fontSize:10,
              cursor: submitting ? 'wait' : 'pointer',
              boxShadow: submitting ? 'none' : '0 0 40px rgba(255,87,34,.6), 0 5px 0 rgba(180,40,10,.6)',
              animation: submitting ? 'shake .12s infinite' : 'none',
              transition:'all .2s',
            }}
            onMouseEnter={e => { if(!submitting) { e.currentTarget.style.transform='translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow='0 0 60px rgba(255,87,34,.8), 0 8px 0 rgba(180,40,10,.6)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=submitting?'none':'0 0 40px rgba(255,87,34,.6), 0 5px 0 rgba(180,40,10,.6)' }}
          >
            {submitting ? '⚔️ DEFEATING BOSS...' : '⚔️ SEND MESSAGE'}
          </button>

          <div style={{
            textAlign:'center', marginTop:14,
            fontFamily:'"Press Start 2P", monospace',
            fontSize:6, color:'rgba(255,255,255,.3)',
          }}>
            OR EMAIL:&nbsp;
            <a href="mailto:aanyaagrawal260304@gmail.com"
              style={{ color:'#FF8F00', textDecoration:'none', borderBottom:'1px solid rgba(255,143,0,.3)' }}
            >
              aanyaagrawal260304@gmail.com
            </a>
          </div>
        </form>
      ) : (
        <div style={{ position:'relative', width:'100%', height:'80vh', overflow:'hidden' }}>
          <Confetti count={70} />
          <div ref={victoryRef} style={{
            position:'absolute', inset:0,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            textAlign:'center', zIndex:2,
            fontFamily:'"Press Start 2P", monospace',
            opacity:0,
          }}>
            <div style={{
              fontSize:90, marginBottom:20,
              filter:'drop-shadow(0 0 30px rgba(255,215,0,.8))',
              animation:'float 2s ease-in-out infinite',
            }}>🏆</div>
            <div style={{
              fontSize:'clamp(16px,3vw,26px)', color:'#FFD700',
              textShadow:'0 0 50px #FFD700, 0 0 100px #FF8C00',
              marginBottom:22, letterSpacing:3,
              animation:'pulseGlow 2s ease-in-out infinite',
            }}>
              BOSS DEFEATED!
            </div>
            <div style={{ color:'#fff', fontSize:9, lineHeight:3.2 }}>
              ★ VICTORY ★<br/>
              MESSAGE DELIVERED!<br/>
              +50 COINS  +100 XP<br/>
              <br/>
              THANKS FOR VISITING,<br/>
              PLAYER ONE! 🍄
            </div>
            <div style={{
              marginTop:28, fontSize:40,
              animation:'rainbow 1.2s linear infinite',
            }}>
              🎆 🌟 🎇 🌟 🎆
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0%{opacity:1;transform:translateY(0) rotate(0deg)}
          100%{opacity:0;transform:translateY(100vh) rotate(720deg)}
        }
        @keyframes pulseGlow {
          0%,100%{filter:brightness(1)}
          50%{filter:brightness(1.5) drop-shadow(0 0 20px #FFD700)}
        }
      `}</style>
    </div>
  )
}
