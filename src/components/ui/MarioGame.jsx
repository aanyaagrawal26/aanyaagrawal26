import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════
   MARIO MINI-GAME  —  Play to unlock the portfolio
   • Arrow Right / D  = run right
   • Space / Arrow Up = jump
   • Collect 5 coins OR reach the flag to win
   • 3 lives, avoid Goombas
   Full canvas game loop at 60fps
═══════════════════════════════════════════════════════════════ */

const W = 900, H = 420
const GROUND = H - 60
const GRAVITY = 0.55
const JUMP_FORCE = -13
const MARIO_W = 36, MARIO_H = 44
const GOOMBA_W = 34, GOOMBA_H = 32
const COIN_R = 10
const BLOCK_SIZE = 48
const FLAG_X = W * 3.2  // in world coords

// ── Pixel palettes ──────────────────────────────────────────
const MARIO_SPRITE = [
  '....RRRR....',
  '...RRRRRR...',
  '...BBSSBBS..',
  '..BSSSSSBS..',
  '..BSSSSSSS..',
  '....SSSSS...',
  '..RROORRR...',
  '.RRROORRRR..',
  'RRRROORRRRR.',
  'BBRGOOBGRBB.',
  '.BOOOOOOB...',
  '..BOSOOB....',
  '..BB..BB....',
  '.BBB..BBB...',
  '.BB....BB...',
]
const MARIO_PAL = {'.':null,R:'#E84A23',S:'#FDB97D',B:'#8B4513',O:'#5B6DEE',G:'#FFD700'}

const GOOMBA_SPRITE = [
  '..BBBBBB..',
  '.BBBBBBBB.',
  'BBSSBSSBB.',
  'BSDDBSDDB.',
  'BSSSSSSBB.',
  '.BBWWWBB..',
  'BBBBBBBBBB',
  'BBBBBBBBB.',
  '.BB....BB.',
]
const GOOMBA_PAL = {'.':null,B:'#8B4513',S:'#D2691E',D:'#000',W:'#fff'}

// Pre-render sprites to offscreen canvases
function makeSprite(rows, pal, pw) {
  const cols = rows[0].length
  const oc = document.createElement('canvas')
  oc.width = cols * pw; oc.height = rows.length * pw
  const ctx = oc.getContext('2d')
  rows.forEach((row, r) => {
    for (let c = 0; c < cols; c++) {
      const col = pal[row[c]]
      if (!col) continue
      ctx.fillStyle = col
      ctx.fillRect(c * pw, r * pw, pw, pw)
    }
  })
  return oc
}

// ── Level layout (world coords) ──────────────────────────────
function buildLevel() {
  const platforms = [
    // [x, y, w, h]
    { x: 320,  y: GROUND-100, w: 144, h: BLOCK_SIZE },
    { x: 520,  y: GROUND-160, w: 96,  h: BLOCK_SIZE },
    { x: 700,  y: GROUND-110, w: 192, h: BLOCK_SIZE },
    { x: 960,  y: GROUND-140, w: 96,  h: BLOCK_SIZE },
    { x: 1100, y: GROUND-100, w: 144, h: BLOCK_SIZE },
    { x: 1380, y: GROUND-160, w: 96,  h: BLOCK_SIZE },
    { x: 1560, y: GROUND-110, w: 192, h: BLOCK_SIZE },
    { x: 1820, y: GROUND-140, w: 144, h: BLOCK_SIZE },
    { x: 2000, y: GROUND-100, w: 96,  h: BLOCK_SIZE },
    { x: 2200, y: GROUND-160, w: 144, h: BLOCK_SIZE },
    { x: 2440, y: GROUND-120, w: 192, h: BLOCK_SIZE },
    { x: 2700, y: GROUND-150, w: 96,  h: BLOCK_SIZE },
  ]

  const coins = [
    220, 350, 400, 540, 580, 730, 800, 980, 1120, 1200,
    1400, 1600, 1700, 1850, 2020, 2220, 2350, 2470, 2600, 2720,
  ].map((x, i) => ({
    id: i, x, y: GROUND - 90 - (i % 3) * 30, collected: false,
  }))

  const gaps = [
    { x: 480, w: 60 },
    { x: 1050, w: 70 },
    { x: 1700, w: 80 },
    { x: 2300, w: 60 },
  ]

  const goombas = [
    { id: 0, x: 420,  y: GROUND - GOOMBA_H, vx: -1.2, alive: true },
    { id: 1, x: 680,  y: GROUND - GOOMBA_H, vx: -1.4, alive: true },
    { id: 2, x: 950,  y: GROUND - GOOMBA_H, vx: -1.1, alive: true },
    { id: 3, x: 1250, y: GROUND - GOOMBA_H, vx: -1.3, alive: true },
    { id: 4, x: 1600, y: GROUND - GOOMBA_H, vx: -1.5, alive: true },
    { id: 5, x: 1900, y: GROUND - GOOMBA_H, vx: -1.2, alive: true },
    { id: 6, x: 2200, y: GROUND - GOOMBA_H, vx: -1.4, alive: true },
    { id: 7, x: 2550, y: GROUND - GOOMBA_H, vx: -1.6, alive: true },
  ]

  const questionBlocks = [
    { id: 0, x: 350,  y: GROUND-160, hit: false },
    { id: 1, x: 545,  y: GROUND-200, hit: false },
    { id: 2, x: 1120, y: GROUND-200, hit: false },
    { id: 3, x: 1850, y: GROUND-180, hit: false },
    { id: 4, x: 2460, y: GROUND-200, hit: false },
  ]

  return { platforms, coins, gaps, goombas, questionBlocks }
}

export default function MarioGame({ onComplete }) {
  const canvasRef   = useRef(null)
  const stateRef    = useRef(null)   // mutable game state (no re-renders mid-loop)
  const rafRef      = useRef(null)
  const keysRef     = useRef({})
  const spritesRef  = useRef({})

  const [lives,     setLives]     = useState(3)
  const [score,     setScore]     = useState(0)
  const [coinsGot,  setCoinsGot]  = useState(0)
  const [gameOver,  setGameOver]  = useState(false)
  const [won,       setWon]       = useState(false)
  const [started,   setStarted]   = useState(false)
  const [showTip,   setShowTip]   = useState(true)

  // ── Init sprites once ──────────────────────────────────────
  useEffect(() => {
    spritesRef.current.mario  = makeSprite(MARIO_SPRITE,  MARIO_PAL,  3)
    spritesRef.current.goomba = makeSprite(GOOMBA_SPRITE, GOOMBA_PAL, 3)
  }, [])

  // ── Input ──────────────────────────────────────────────────
  useEffect(() => {
    const down = e => { keysRef.current[e.code] = true }
    const up   = e => { keysRef.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // ── Mobile jump button ─────────────────────────────────────
  const mobileJump  = useCallback(() => { keysRef.current['Space'] = true;  setTimeout(() => { keysRef.current['Space'] = false }, 100) }, [])
  const mobileRight = useCallback(() => { keysRef.current['ArrowRight'] = true }, [])
  const mobileStop  = useCallback(() => { keysRef.current['ArrowRight'] = false; keysRef.current['ArrowLeft'] = false }, [])
  const mobileLeft  = useCallback(() => { keysRef.current['ArrowLeft'] = true }, [])

  // ── Start game ─────────────────────────────────────────────
  const startGame = useCallback(() => {
    setStarted(true)
    setShowTip(false)
    setLives(3); setScore(0); setCoinsGot(0); setGameOver(false); setWon(false)

    const level = buildLevel()
    stateRef.current = {
      mario: { x: 80, y: GROUND - MARIO_H, vx: 0, vy: 0, onGround: false, facingRight: true, dead: false, deathTimer: 0, frame: 0 },
      camera: { x: 0 },
      lives: 3,
      score: 0,
      coinsGot: 0,
      ...level,
      particles: [],
      flagReached: false,
      invincible: 0,
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  // ── Collision helpers ──────────────────────────────────────
  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by
  }

  // ── Game loop ──────────────────────────────────────────────
  const loop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !stateRef.current) return
    const ctx   = canvas.getContext('2d')
    const S     = stateRef.current
    const keys  = keysRef.current
    const m     = S.mario

    // ── Physics ──
    if (!m.dead) {
      const speed = 4.2
      if (keys['ArrowRight'] || keys['KeyD']) { m.vx = speed;  m.facingRight = true  }
      else if (keys['ArrowLeft']  || keys['KeyA']) { m.vx = -speed; m.facingRight = false }
      else m.vx *= 0.8

      if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && m.onGround) {
        m.vy = JUMP_FORCE
        m.onGround = false
      }

      m.vy += GRAVITY
      m.x  += m.vx
      m.y  += m.vy
      m.frame = (m.frame + 0.2) % 4

      // ── Ground ──
      m.onGround = false
      if (m.y + MARIO_H >= GROUND) {
        m.y = GROUND - MARIO_H
        m.vy = 0
        m.onGround = true
      }

      // ── Platform collision ──
      for (const p of S.platforms) {
        if (rectsOverlap(m.x, m.y, MARIO_W, MARIO_H, p.x, p.y, p.w, p.h)) {
          // land on top
          if (m.vy > 0 && m.y + MARIO_H - m.vy <= p.y + 4) {
            m.y = p.y - MARIO_H
            m.vy = 0
            m.onGround = true
          }
          // bump head
          else if (m.vy < 0 && m.y >= p.y + p.h - 4) {
            m.y = p.y + p.h
            m.vy = 0
          }
        }
      }

      // ── Question block collision ──
      for (const b of S.questionBlocks) {
        if (!b.hit && rectsOverlap(m.x, m.y, MARIO_W, MARIO_H, b.x, b.y, BLOCK_SIZE, BLOCK_SIZE)) {
          if (m.vy < 0 && m.y >= b.y + BLOCK_SIZE - 4) {
            b.hit = true
            m.vy = 2
            S.score += 100
            S.coinsGot += 1
            // spawn coin particle
            S.particles.push({ x: b.x + BLOCK_SIZE/2, y: b.y - 10, vy: -6, life: 40, type: 'coin' })
          }
          else if (m.vy > 0 && m.y + MARIO_H - m.vy <= b.y + 4) {
            m.y = b.y - MARIO_H; m.vy = 0; m.onGround = true
          }
        }
      }

      // ── Coin collection ──
      for (const c of S.coins) {
        if (!c.collected && rectsOverlap(m.x, m.y, MARIO_W, MARIO_H, c.x - COIN_R, c.y - COIN_R, COIN_R*2, COIN_R*2)) {
          c.collected = true
          S.score += 200
          S.coinsGot += 1
          S.particles.push({ x: c.x, y: c.y, vy: -5, life: 30, type: 'coin' })
        }
      }

      // ── Gap / fall-off ──
      if (m.y > H + 60) killMario(S)

      // ── Goomba collision ──
      if (S.invincible <= 0) {
        for (const g of S.goombas) {
          if (!g.alive) continue
          if (rectsOverlap(m.x+4, m.y, MARIO_W-8, MARIO_H, g.x, g.y, GOOMBA_W, GOOMBA_H)) {
            // stomp from above
            if (m.vy > 0 && m.y + MARIO_H <= g.y + 12) {
              g.alive = false
              m.vy = -8
              S.score += 100
              S.particles.push({ x: g.x + GOOMBA_W/2, y: g.y, vy: -4, life: 25, type: 'stomp' })
            } else {
              killMario(S)
            }
          }
        }
      }
      if (S.invincible > 0) S.invincible--

      // ── Flag ──
      if (!S.flagReached && m.x + S.camera.x > FLAG_X - 30) {
        S.flagReached = true
        S.score += 5000
      }
    } else {
      // dead animation
      m.y += m.vy
      m.vy += GRAVITY * 0.5
      m.deathTimer++
      if (m.deathTimer > 90) respawn(S)
    }

    // ── Goomba AI ──
    for (const g of S.goombas) {
      if (!g.alive) continue
      g.x += g.vx
      if (g.x < -100) g.x = W + S.camera.x + 200
      if (g.y + GOOMBA_H < GROUND) { g.vy = (g.vy || 0) + GRAVITY; g.y += g.vy }
      else { g.y = GROUND - GOOMBA_H; g.vy = 0 }
    }

    // ── Particles ──
    S.particles = S.particles.filter(p => p.life > 0)
    S.particles.forEach(p => { p.y += p.vy; p.vy += 0.3; p.life-- })

    // ── Camera ──
    const targetCam = Math.max(0, m.x - W * 0.35)
    S.camera.x += (targetCam - S.camera.x) * 0.12

    // ── React state sync (throttled) ──
    setScore(S.score)
    setCoinsGot(S.coinsGot)
    setLives(S.lives)

    // ── Win / lose checks ──
    if (S.flagReached) { draw(ctx, S); setWon(true); return }
    if (S.lives <= 0)  { draw(ctx, S); setGameOver(true); return }

    draw(ctx, S)
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  function killMario(S) {
    const m = S.mario
    if (S.invincible > 0) return
    m.dead = true
    m.vy = -14
    m.deathTimer = 0
    S.lives -= 1
    S.invincible = 120
  }

  function respawn(S) {
    S.mario = { x: 80, y: GROUND - MARIO_H, vx: 0, vy: 0, onGround: false, facingRight: true, dead: false, deathTimer: 0, frame: 0 }
    S.camera.x = 0
    S.invincible = 120
  }

  useEffect(() => { return () => cancelAnimationFrame(rafRef.current) }, [])

  // ── Draw ────────────────────────────────────────────────────
  function draw(ctx, S) {
    const cam = S.camera.x
    ctx.clearRect(0, 0, W, H)

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H)
    skyGrad.addColorStop(0,   '#1565C0')
    skyGrad.addColorStop(0.5, '#42A5F5')
    skyGrad.addColorStop(1,   '#90CAF9')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, W, H)

    // Sun
    ctx.save()
    ctx.beginPath()
    ctx.arc(W - 80, 60, 44, 0, Math.PI * 2)
    const sg = ctx.createRadialGradient(W-80, 60, 0, W-80, 60, 44)
    sg.addColorStop(0, '#FFF9C4'); sg.addColorStop(0.5, '#FFD700'); sg.addColorStop(1, '#FF8F00')
    ctx.fillStyle = sg
    ctx.shadowBlur = 40; ctx.shadowColor = '#FFD700'
    ctx.fill(); ctx.restore()

    // Ground
    ctx.fillStyle = '#6D4C41'
    ctx.fillRect(0, GROUND, W, H - GROUND)
    ctx.fillStyle = '#8D6E63'
    ctx.fillRect(0, GROUND, W, 6)

    // Ground tiles
    ctx.fillStyle = 'rgba(255,255,255,.05)'
    for (let i = 0; i < W / 40 + 1; i++) {
      ctx.strokeStyle = 'rgba(255,255,255,.06)'
      ctx.strokeRect((i * 40 - (cam % 40)), GROUND + 6, 38, 36)
    }

    // Gaps — paint black over ground
    for (const gap of S.gaps) {
      const gx = gap.x - cam
      ctx.fillStyle = '#000'
      ctx.fillRect(gx, GROUND - 2, gap.w, H - GROUND + 4)
    }

    // Platforms
    for (const p of S.platforms) {
      const px = p.x - cam
      if (px > W + 10 || px + p.w < -10) continue
      const pg = ctx.createLinearGradient(px, p.y, px, p.y + p.h)
      pg.addColorStop(0, '#A1887F'); pg.addColorStop(1, '#6D4C41')
      ctx.fillStyle = pg
      ctx.fillRect(px, p.y, p.w, p.h)
      ctx.strokeStyle = '#8D6E63'
      ctx.strokeRect(px, p.y, p.w, p.h)
      // brick lines
      ctx.fillStyle = 'rgba(255,255,255,.07)'
      for (let ti = 0; ti < Math.ceil(p.w / 48); ti++) {
        ctx.strokeStyle = 'rgba(255,255,255,.1)'
        ctx.strokeRect(px + ti * 48, p.y, 47, p.h)
      }
    }

    // Question blocks
    for (const b of S.questionBlocks) {
      const bx = b.x - cam
      if (bx > W + 10 || bx < -60) continue
      ctx.fillStyle = b.hit ? '#777' : '#FFD700'
      ctx.fillRect(bx, b.y, BLOCK_SIZE, BLOCK_SIZE)
      ctx.strokeStyle = b.hit ? '#555' : '#8B4513'
      ctx.lineWidth = 3; ctx.strokeRect(bx, b.y, BLOCK_SIZE, BLOCK_SIZE)
      if (!b.hit) {
        ctx.fillStyle = '#8B4513'
        ctx.font = 'bold 22px "Press Start 2P", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('?', bx + BLOCK_SIZE / 2, b.y + BLOCK_SIZE - 10)
      }
      ctx.lineWidth = 1
    }

    // Coins
    for (const c of S.coins) {
      if (c.collected) continue
      const cx = c.x - cam
      if (cx < -20 || cx > W + 20) continue
      const coinGrad = ctx.createRadialGradient(cx, c.y, 1, cx, c.y, COIN_R)
      coinGrad.addColorStop(0, '#FFF9C4'); coinGrad.addColorStop(1, '#FFD700')
      ctx.beginPath()
      ctx.arc(cx, c.y, COIN_R, 0, Math.PI * 2)
      ctx.fillStyle = coinGrad
      ctx.shadowBlur = 10; ctx.shadowColor = '#FFD700'
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Goombas
    const gSprite = spritesRef.current.goomba
    for (const g of S.goombas) {
      if (!g.alive) continue
      const gx = g.x - cam
      if (gx < -50 || gx > W + 50) continue
      if (gSprite) {
        ctx.save()
        if (g.vx > 0) { ctx.translate(gx + GOOMBA_W, g.y); ctx.scale(-1, 1); ctx.drawImage(gSprite, 0, 0, GOOMBA_W, GOOMBA_H) }
        else ctx.drawImage(gSprite, gx, g.y, GOOMBA_W, GOOMBA_H)
        ctx.restore()
      } else {
        ctx.fillStyle = '#8B4513'
        ctx.fillRect(gx, g.y, GOOMBA_W, GOOMBA_H)
      }
    }

    // Mario
    const mx = S.mario.x - cam
    const mSprite = spritesRef.current.mario
    ctx.save()
    if (S.invincible > 0 && Math.floor(S.invincible / 4) % 2 === 0 && !S.mario.dead) {
      ctx.globalAlpha = 0.4
    }
    if (mSprite) {
      if (!S.mario.facingRight) { ctx.translate(mx + MARIO_W, S.mario.y); ctx.scale(-1, 1); ctx.drawImage(mSprite, 0, 0, MARIO_W, MARIO_H) }
      else ctx.drawImage(mSprite, mx, S.mario.y, MARIO_W, MARIO_H)
    }
    ctx.restore()

    // Flag pole
    const fpx = FLAG_X - cam
    ctx.fillStyle = '#9E9E9E'; ctx.fillRect(fpx, GROUND - 160, 4, 160)
    ctx.fillStyle = '#E53935'
    ctx.beginPath(); ctx.moveTo(fpx + 4, GROUND - 160); ctx.lineTo(fpx + 4, GROUND - 132); ctx.lineTo(fpx + 44, GROUND - 145); ctx.closePath(); ctx.fill()

    // Particles
    for (const p of S.particles) {
      if (p.type === 'coin') {
        ctx.beginPath()
        ctx.arc(p.x - cam, p.y, 7, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,215,0,${p.life / 30})`
        ctx.fill()
      } else if (p.type === 'stomp') {
        ctx.fillStyle = `rgba(139,69,19,${p.life / 25})`
        ctx.fillRect(p.x - cam - 8, p.y - 8, 16, 8)
      }
    }

    // HUD overlay
    ctx.fillStyle = 'rgba(0,0,0,.45)'
    ctx.fillRect(0, 0, W, 42)
    ctx.fillStyle = '#FFD700'
    ctx.font = '11px "Press Start 2P", monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`🍄 ×${S.lives}`, 14, 26)
    ctx.textAlign = 'center'
    ctx.fillText(`🪙 ${S.coinsGot}  ·  SCORE ${String(S.score).padStart(6,'0')}`, W / 2, 26)
    ctx.textAlign = 'right'
    ctx.fillText(`REACH THE FLAG! →`, W - 14, 26)
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99998,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Press Start 2P", monospace',
    }}>

      {/* ── Start screen ── */}
      {!started && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(0,0,0,.88)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 24, textAlign: 'center', padding: 32,
        }}>
          <div style={{ fontSize: 'clamp(14px,2.5vw,22px)', color: '#FFD700', textShadow: '0 0 20px #FFD700', letterSpacing: 3 }}>
            🎮 MINI GAME
          </div>
          <div style={{ fontSize: 'clamp(8px,1.4vw,13px)', color: '#fff', lineHeight: 2.4, maxWidth: 500 }}>
            REACH THE FLAG TO UNLOCK<br/>
            <span style={{ color: '#FFD700' }}>AANYA'S PORTFOLIO</span><br/><br/>
            <span style={{ color: '#00ff88' }}>→ / D</span> &nbsp; RUN RIGHT<br/>
            <span style={{ color: '#00ff88' }}>← / A</span> &nbsp; RUN LEFT<br/>
            <span style={{ color: '#00ff88' }}>SPACE / ↑</span> &nbsp; JUMP<br/>
            <span style={{ color: '#ff4444' }}>STOMP GOOMBAS</span> FROM ABOVE<br/>
          </div>
          <button onClick={startGame} style={{
            background: 'linear-gradient(135deg,#FFD700,#FF8C00)',
            border: '3px solid #8B4513', borderRadius: 6,
            color: '#000', padding: '14px 36px',
            fontSize: 'clamp(9px,1.5vw,13px)', cursor: 'pointer',
            fontFamily: '"Press Start 2P", monospace',
            boxShadow: '0 6px 0 #8B4513, 0 0 30px rgba(255,215,0,.5)',
            letterSpacing: 1, transition: 'transform .1s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform='none'}
          >
            ▶ START GAME
          </button>
          <button onClick={onComplete} style={{
            background: 'transparent',
            border: '2px solid rgba(255,255,255,.3)',
            borderRadius: 5, color: 'rgba(255,255,255,.4)',
            padding: '8px 20px', fontSize: 8,
            cursor: 'pointer',
            fontFamily: '"Press Start 2P", monospace',
          }}>
            skip →
          </button>
        </div>
      )}

      {/* ── Win screen ── */}
      {won && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(0,0,0,.9)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20, textAlign: 'center', padding: 32,
          animation: 'fadeInGame .5s ease-out',
        }}>
          <div style={{ fontSize: 64, animation: 'bounceWin 0.6s ease-out infinite alternate' }}>🏆</div>
          <div style={{ fontSize: 'clamp(16px,2.8vw,26px)', color: '#FFD700', textShadow: '0 0 40px #FFD700', letterSpacing: 2 }}>
            YOU WIN!
          </div>
          <div style={{ fontSize: 'clamp(8px,1.3vw,12px)', color: '#fff', lineHeight: 2.4 }}>
            FLAG REACHED!<br/>
            SCORE: <span style={{ color: '#FFD700' }}>{score}</span><br/>
            COINS: <span style={{ color: '#00ff88' }}>{coinsGot}</span> 🪙
          </div>
          <div style={{ fontSize: 'clamp(8px,1.2vw,11px)', color: '#00ffcc', animation: 'blinkGame 1s step-end infinite' }}>
            🍄 PORTFOLIO UNLOCKED! 🍄
          </div>
          <button onClick={onComplete} style={{
            background: 'linear-gradient(135deg,#00ff88,#00aaff)',
            border: '3px solid #006644', borderRadius: 6,
            color: '#000', padding: '14px 36px',
            fontSize: 'clamp(9px,1.5vw,13px)', cursor: 'pointer',
            fontFamily: '"Press Start 2P", monospace',
            boxShadow: '0 6px 0 #006644, 0 0 30px rgba(0,255,136,.5)',
            letterSpacing: 1,
          }}>
            ▶ ENTER PORTFOLIO
          </button>
        </div>
      )}

      {/* ── Game Over screen ── */}
      {gameOver && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(0,0,0,.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20, textAlign: 'center', padding: 32,
        }}>
          <div style={{ fontSize: 'clamp(18px,3vw,30px)', color: '#ff4444', textShadow: '0 0 30px #ff4444', letterSpacing: 2 }}>
            GAME OVER
          </div>
          <div style={{ fontSize: 'clamp(8px,1.3vw,12px)', color: '#fff', lineHeight: 2.4 }}>
            SCORE: <span style={{ color: '#FFD700' }}>{score}</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={startGame} style={{
              background: 'linear-gradient(135deg,#FFD700,#FF8C00)',
              border: '3px solid #8B4513', borderRadius: 6,
              color: '#000', padding: '12px 28px',
              fontSize: 'clamp(8px,1.3vw,11px)', cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
              boxShadow: '0 5px 0 #8B4513',
            }}>▶ TRY AGAIN</button>
            <button onClick={onComplete} style={{
              background: 'transparent',
              border: '2px solid rgba(255,255,255,.3)',
              borderRadius: 5, color: 'rgba(255,255,255,.5)',
              padding: '12px 28px', fontSize: 8,
              cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
            }}>skip →</button>
          </div>
        </div>
      )}

      {/* ── Game canvas ── */}
      <div style={{ position: 'relative', boxShadow: '0 0 60px rgba(255,215,0,.2), 0 0 0 3px #FFD700' }}>
        <canvas
          ref={canvasRef}
          width={W} height={H}
          style={{ display: 'block', maxWidth: '100vw', imageRendering: 'pixelated' }}
        />
      </div>

      {/* ── Mobile controls ── */}
      <div style={{
        display: 'flex', gap: 12, marginTop: 16, zIndex: 5,
      }}>
        {[
          { label: '◀', onStart: mobileLeft,  onEnd: mobileStop },
          { label: '▶', onStart: mobileRight, onEnd: mobileStop },
          { label: '↑ JUMP', onStart: mobileJump, onEnd: () => {} },
        ].map(btn => (
          <button key={btn.label}
            onPointerDown={btn.onStart} onPointerUp={btn.onEnd} onPointerLeave={btn.onEnd}
            style={{
              background: 'rgba(255,215,0,.15)',
              border: '2px solid rgba(255,215,0,.4)',
              borderRadius: 8, color: '#FFD700',
              padding: btn.label.length > 2 ? '12px 18px' : '12px 20px',
              fontSize: btn.label.length > 2 ? 9 : 14,
              cursor: 'pointer', userSelect: 'none',
              fontFamily: '"Press Start 2P", monospace',
              touchAction: 'none',
            }}>
            {btn.label}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeInGame   { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        @keyframes bounceWin    { from{transform:translateY(0)} to{transform:translateY(-12px)} }
        @keyframes blinkGame    { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}
