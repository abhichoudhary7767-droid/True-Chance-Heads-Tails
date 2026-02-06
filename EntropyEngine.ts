import { EntropyData, TossResult } from '../types'

export class EntropyEngine {
  private static lastAccel = { x: 0, y: 0, z: 0 }
  private static listening = false

  static init() {
    if (this.listening) return
    this.listening = true

    if (typeof window === 'undefined') return

    if ('DeviceMotionEvent' in window) {
      try {
        window.addEventListener(
          'devicemotion',
          (event) => {
            const a = event.acceleration
            if (!a) return

            this.lastAccel = {
              x: a.x || 0,
              y: a.y || 0,
              z: a.z || 0
            }
          },
          { passive: true }
        )
      } catch {
        // Ignore — no motion support
      }
    }
  }

  static async getResult(): Promise<{ result: TossResult; entropy: EntropyData }> {
    const timestamp = Date.now()

    // Secure randomness (guarded)
    let randomValues: number[] = []

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(4)
      crypto.getRandomValues(arr)
      randomValues = Array.from(arr)
    } else {
      // Fallback (still unpredictable)
      for (let i = 0; i < 4; i++) {
        randomValues.push(Math.floor(Math.random() * 2 ** 32))
      }
    }

    const accel = { ...this.lastAccel }

    // Combine entropy
    let combined = 0
    for (const v of randomValues) combined ^= v

    combined += timestamp
    combined += Math.floor((accel.x + accel.y + accel.z) * 1_000_000)

    const result: TossResult = combined % 2 === 0 ? 'HEADS' : 'TAILS'

    return {
      result,
      entropy: {
        timestamp,
        randomValues,
        accel:
          accel.x === 0 && accel.y === 0 && accel.z === 0 ? undefined : accel
      }
    }
  }
}
