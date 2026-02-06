export class HapticService {
  private static vibrate(pattern: number | number[]) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern)
      }
    } catch {
      // Silently ignore – never crash the app
    }
  }

  /** Crisp tap for mechanical feel */
  static triggerToss() {
    this.vibrate(15)
  }

  /** Heavy impact for the landing */
  static triggerImpact() {
    this.vibrate(40)
  }

  /** Final heavy buzz for the result reveal */
  static triggerResult() {
    this.vibrate([100])
  }

  /** Small ticks for the settling wobble */
  static triggerWobble() {
    this.vibrate([10, 30, 10])
  }
}
