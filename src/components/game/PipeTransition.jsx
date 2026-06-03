import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function PipeTransition({ onComplete }) {
  const overlayRef = useRef(null)
  const circleRef  = useRef(null)
  const textRef    = useRef(null)
  const ringRef    = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ onComplete })

    tl.fromTo(overlayRef.current,
      { opacity:0 },
      { opacity:1, duration:.3, ease:'power2.in' }
    )
    .fromTo(ringRef.current,
      { scale:0, opacity:0 },
      { scale:3, opacity:.6, duration:.5, ease:'power2.out' }, 0.1
    )
    .fromTo(circleRef.current,
      { scale:0, opacity:0 },
      { scale:22, opacity:1, duration:1, ease:'power3.in' }, 0.15
    )
    .fromTo(textRef.current,
      { opacity:0, scale:.8 },
      { opacity:1, scale:1, duration:.35, ease:'back.out(2)' }, '-=.5'
    )
    .to(overlayRef.current,
      { opacity:0, duration:.4, delay:.3 }
    )
  }, [onComplete])

  return (
    <div ref={overlayRef} style={{
      position:'fixed', inset:0, zIndex:99998,
      background:'#000',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {/* Outer glow ring */}
      <div ref={ringRef} style={{
        position:'absolute',
        width:80, height:80, borderRadius:'50%',
        border:'4px solid #00FF00',
        boxShadow:'0 0 60px #00FF00, inset 0 0 40px rgba(0,255,0,.3)',
        opacity:0,
      }} />
      {/* Main tunnel */}
      <div ref={circleRef} style={{
        width:72, height:72, borderRadius:'50%',
        background:'radial-gradient(circle, #003300 0%, #006400 30%, #00AA00 60%, #000 100%)',
        boxShadow:'0 0 60px #00FF0099, inset 0 0 30px rgba(0,200,0,.5)',
      }} />
      {/* Text */}
      <div ref={textRef} style={{
        position:'absolute',
        fontFamily:'"Press Start 2P", monospace',
        fontSize:13, color:'#00FF00',
        textShadow:'0 0 24px #00FF00, 0 0 50px #00AA00',
        letterSpacing:3, opacity:0, whiteSpace:'nowrap',
      }}>
        WARP ZONE!
      </div>
    </div>
  )
}
