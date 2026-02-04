
import { EntropyData, TossResult } from '../types';

export class EntropyEngine {
  private static lastAccel = { x: 0, y: 0, z: 0 };

  static init() {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', (event) => {
        if (event.acceleration) {
          this.lastAccel = {
            x: event.acceleration.x || 0,
            y: event.acceleration.y || 0,
            z: event.acceleration.z || 0,
          };
        }
      });
    }
  }

  /**
   * Generates a cryptographically secure toss result using multiple entropy sources.
   */
  static async getResult(): Promise<{ result: TossResult; entropy: EntropyData }> {
    // Source 1: CSPRNG
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);

    // Source 2: High-resolution timestamp
    const timestamp = Date.now();

    // Source 3: Device Motion (if available)
    const accel = { ...this.lastAccel };

    // Combine entropy into a single seed-like value
    // We use a XOR/sum approach on the CSPRNG values combined with time and motion
    const combined = array.reduce((acc, val) => acc ^ val, 0) + 
                     timestamp + 
                     Math.floor((accel.x + accel.y + accel.z) * 1000000);

    const result: TossResult = combined % 2 === 0 ? 'HEADS' : 'TAILS';

    return {
      result,
      entropy: {
        timestamp,
        randomValues: array,
        accel: accel.x === 0 && accel.y === 0 && accel.z === 0 ? undefined : accel
      }
    };
  }
}
