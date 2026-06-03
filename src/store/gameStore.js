import { create } from 'zustand'

const useGameStore = create((set) => ({
  currentWorld: 1,
  coins: 0,
  xp: 0,
  level: 1,
  inventory: [],
  playerPos: { x: 100, y: 300 },
  isJumping: false,
  isSprinting: false,
  activePowerUp: null,
  timeOfDay: 'day',
  weatherEffect: null,
  slowMotion: false,
  secretUnlocked: false,
  konami: [],

  setWorld: (w) => set({ currentWorld: w }),
  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
  addXP: (n) =>
    set((s) => {
      const newXP = s.xp + n
      const newLevel = Math.floor(newXP / 100) + 1
      return { xp: newXP, level: newLevel }
    }),
  setPlayerPos: (pos) => set({ playerPos: pos }),
  setJumping: (v) => set({ isJumping: v }),
  setSprinting: (v) => set({ isSprinting: v }),
  setPowerUp: (p) => set({ activePowerUp: p }),
  addToInventory: (item) => set((s) => ({ inventory: [...s.inventory, item] })),
  setWeather: (w) => set({ weatherEffect: w }),
  toggleSlowMotion: () => set((s) => ({ slowMotion: !s.slowMotion })),
  unlockSecret: () => set({ secretUnlocked: true }),
  pushKonami: (key) =>
    set((s) => {
      const seq = [...s.konami, key].slice(-10)
      const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
      if (JSON.stringify(seq) === JSON.stringify(code)) {
        return { konami: seq, secretUnlocked: true }
      }
      return { konami: seq }
    }),
}))

export default useGameStore
