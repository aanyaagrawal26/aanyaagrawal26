import { useEffect, useState } from 'react'
import useGameStore from '../../store/gameStore'

const WORLDS = [
  { n: 1,  label: 'W·1', name: 'SKY'     },
  { n: 3,  label: 'W·2', name: 'CAVE'    },
  { n: 4,  label: 'W·3', name: 'SKILLS'  },
  { n: 5,  label: 'W·4', name: 'CASTLE'  },
  { n: 6,  label: 'W·5', name: 'MAP'     },
  { n: 7,  label: 'W·6', name: 'CONTACT' },
]

export default function GameHUD({ world, onNavigate }) {
  const { coins, xp, level, currentWorld, activePowerUp, slowMotion } = useGameStore()
  const [levelUp, setLevelUp] = useState(false)
  const [prevLevelState, setPrevLevel] = useState(level)

  useEffect(() => {
    if (level > prevLevelState) {
      setLevelUp(true)
      setPrevLevel(level)
      const t = setTimeout(() => setLevelUp(false), 2000)
      return () => clearTimeout(t)
    }
  }, [level])

  return (
    <>
      {/* ── Main HUD bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 58,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        borderBottom: '2px solid #FFD700',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 16,
        fontFamily: '"Press Start 2P", monospace',
      }}>

        {/* ── Left: player badge ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 5,
          flexShrink: 0, minWidth: 110,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 8, color: '#FFD700',
              textShadow: '0 0 10px #FFD700' }}>★</span>
            <span style={{ fontSize: 8, color: '#fff',
              textShadow: '2px 2px #000', letterSpacing: 1 }}>AANYA</span>
          </div>
          <div style={{ fontSize: 6, color: '#FFD700', letterSpacing: 1 }}>
            LVL {level}
          </div>
          {/* XP bar */}
          <div style={{
            width: 100, height: 5,
            background: '#222', borderRadius: 3,
            border: '1px solid #444', overflow: 'hidden',
          }}>
            <div style={{
              width: `${xp % 100}%`, height: '100%',
              background: 'linear-gradient(90deg, #00ff88, #00ffcc)',
              borderRadius: 3, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* ── Center: world nav ── */}
        <nav style={{
          flex: 1, display: 'flex', justifyContent: 'center',
          gap: 5, flexWrap: 'nowrap', overflow: 'hidden',
        }}>
          {WORLDS.map(({ n, label, name }) => {
            const active = (world ?? currentWorld) === n
            return (
              <button
                key={n}
                onClick={() => onNavigate?.(n)}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  padding: '5px 9px',
                  background: active ? '#FFD700' : 'transparent',
                  color: active ? '#000' : '#FFD700',
                  border: `2px solid ${active ? '#FFD700' : '#FFD70044'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  lineHeight: 2,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s',
                  pointerEvents: 'all',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#FFD70018'
                    e.currentTarget.style.borderColor = '#FFD700'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = '#FFD70044'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <span style={{ display: 'block', fontSize: 6 }}>{label}</span>
                <span style={{ display: 'block', fontSize: 4,
                  color: active ? '#444' : '#666', marginTop: 1 }}>{name}</span>
              </button>
            )
          })}
        </nav>

        {/* ── Right: coins + XP + power-up ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          gap: 4, flexShrink: 0, minWidth: 90,
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 7, color: '#FFD700',
              textShadow: '2px 2px #000', letterSpacing: 1 }}>
              🪙 ×{String(coins).padStart(3, '0')}
            </span>
            <span style={{ fontSize: 7, color: '#aaa', letterSpacing: 1 }}>
              XP {xp}
            </span>
          </div>

          {/* power-up / slow-mo badge */}
          {(activePowerUp || slowMotion) && (
            <div style={{
              fontSize: 5, padding: '2px 6px',
              background: slowMotion ? '#ff00ff22' : '#FFD70022',
              border: `1px solid ${slowMotion ? '#ff00ff' : '#FFD700'}`,
              borderRadius: 3, color: slowMotion ? '#ff00ff' : '#FFD700',
              letterSpacing: 0.5, animation: 'badgePulse 0.8s ease-in-out infinite',
            }}>
              {slowMotion ? '⏱ SLOW-MO' :
               activePowerUp === 'star' ? '⭐ INVINCIBLE' :
               activePowerUp === 'fire' ? '🔥 FIRE MODE' : '🍄 SUPER'}
            </div>
          )}
        </div>
      </div>

      {/* ── Level-up splash ── */}
      {levelUp && (
        <div style={{
          position: 'fixed', top: '42%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          color: '#FFD700', fontSize: 26,
          textShadow: '0 0 24px #FFD700, 0 0 60px #FF8C00',
          zIndex: 99998,
          animation: 'levelUpPop 2s forwards',
          pointerEvents: 'none',
        }}>
          ★ LEVEL UP! ★
        </div>
      )}

      <style>{`
        @keyframes badgePulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        @keyframes levelUpPop {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.6); }
          15%  { opacity: 1; transform: translate(-50%,-50%) scale(1.15); }
          80%  { opacity: 1; transform: translate(-50%,-60%) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-80%) scale(0.9); }
        }
      `}</style>
    </>
  )
}