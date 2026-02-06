
export type TossResult = 'HEADS' | 'TAILS' | null;

export interface EntropyData {
  timestamp: number;

  // Store as number[] so it is serializable, safe for WebView & workers
  randomValues: number[];

  accel?: {
    x: number;
    y: number;
    z: number;
  };
}

export enum AppState {
  IDLE = 'IDLE',
  FLIPPING = 'FLIPPING',
  SETTLING = 'SETTLING',
  RESULT = 'RESULT'
}
