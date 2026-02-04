
export class HapticService {
  /**
   * Crisp tap for mechanical feel.
   */
  static triggerToss() {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }

  /**
   * Heavy impact for the landing.
   */
  static triggerImpact() {
    if ('vibrate' in navigator) {
      // One solid hit
      navigator.vibrate(40);
    }
  }

  /**
   * Final heavy buzz for the result reveal.
   */
  static triggerResult() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100]);
    }
  }

  /**
   * Small ticks for the settling wobble.
   */
  static triggerWobble() {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]);
    }
  }
}
