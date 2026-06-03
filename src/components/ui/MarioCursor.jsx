import { useEffect, useRef, useState } from 'react'

const TRAIL = 14

export default function MarioCursor() {
  const cursorRef   = useRef(null)
  const trailsRef   = useRef([])
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    // Build trail elements
    const trails = Array.from({ length: TRAIL }, (_, i) => {
      const el  = document.createElement('div')
      const pct = 1 - i / TRAIL
      const sz  = Math.max(3, 18 * pct)
      el.style.cssText = `
        position:fixed;
        width:${sz}px;height:${sz}px;
        border-radius:50%;
        pointer-events:none;
        z-index:999998;
        transform:translate(-50%,-50%);
        background:radial-gradient(circle at 35% 35%,#fff9c4,#FFD700,#FF8C00);
        opacity:${pct * 0.7};
        will-change:left,top;
        mix-blend-mode:screen;
      `
      document.body.appendChild(el)
      return el
    })
    trailsRef.current = trails

    let mx = -300, my = -300
    const hist = Array(TRAIL).fill(null).map(() => ({ x:-300, y:-300 }))

    const onMove = e => {
      mx = e.clientX; my = e.clientY
      if (cursorRef.current) {
        cursorRef.current.style.left = `${mx}px`
        cursorRef.current.style.top  = `${my}px`
      }
    }
    const onDown = () => setClicking(true)
    const onUp   = () => setClicking(false)

    let raf
    const tick = () => {
      // Shift history with easing
      for (let i = hist.length - 1; i > 0; i--) {
        hist[i] = { ...hist[i-1] }
      }
      hist[0] = { x: mx, y: my }

      trails.forEach((t, i) => {
        t.style.left = `${hist[i].x}px`
        t.style.top  = `${hist[i].y}px`
      })
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive:true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      cancelAnimationFrame(raf)
      trails.forEach(t => t.remove())
    }
  }, [])

  return (
    <div ref={cursorRef} style={{
      position:'fixed',
      width: clicking ? 28 : 22,
      height: clicking ? 28 : 22,
      borderRadius:'50%',
      pointerEvents:'none',
      zIndex:999999,
      transform:'translate(-50%,-50%)',
      background:'radial-gradient(circle at 32% 32%, #fff9c4, #FFD700 50%, #FF8C00)',
      boxShadow: clicking
        ? '0 0 30px #FFD700, 0 0 60px rgba(255,140,0,.8), 0 0 100px rgba(255,140,0,.4)'
        : '0 0 18px #FFD700, 0 0 36px rgba(255,140,0,.6)',
      mixBlendMode:'screen',
      willChange:'left,top,width,height',
      transition:'width .1s,height .1s,box-shadow .1s',
    }} />
  )
}
