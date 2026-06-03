import { useEffect } from 'react'
import useGameStore from '../store/gameStore'

export default function useKonami() {
  const pushKonami = useGameStore(s => s.pushKonami)
  const secretUnlocked = useGameStore(s => s.secretUnlocked)

  useEffect(() => {
    const handler = (e) => pushKonami(e.key)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return secretUnlocked
}
