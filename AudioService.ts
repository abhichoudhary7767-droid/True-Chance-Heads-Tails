export class AudioService {
  private static ctx: AudioContext | null = null
  private static unlocked = false

  private static getContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AC =
          (window as any).AudioContext || (window as any).webkitAudioContext
        if (!AC) return null
        this.ctx = new AC()
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }

      return this.ctx
    } catch {
      return null
    }
  }

  /** Must be called once after first user interaction */
  static unlock() {
    const ctx = this.getContext()
    if (!ctx || this.unlocked) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.01)
    this.unlocked = true
  }

  private static play(cb: (ctx: AudioContext) => void) {
    const ctx = this.getContext()
    if (!ctx || !this.unlocked) return
    try {
      cb(ctx)
    } catch {}
  }

  static playToss() {
    this.play((ctx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    })
  }

  static playImpact() {
    this.play((ctx) => {
      const bufferSize = ctx.sampleRate * 0.2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start()
      noise.stop(ctx.currentTime + 0.25)
    })
  }

  static playResult() {
    this.play((ctx) => {
      const now = ctx.currentTime

      const playNote = (freq: number, delay: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.frequency.setValueAtTime(freq, now + delay)

        gain.gain.setValueAtTime(0, now + delay)
        gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + delay)
        osc.stop(now + delay + 0.6)
      }

      playNote(523.25, 0)
      playNote(659.25, 0.05)
      playNote(783.99, 0.1)
      playNote(1046.5, 0.15)
    })
  }
}
