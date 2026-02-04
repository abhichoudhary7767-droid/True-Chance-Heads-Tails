
export type TossResult = 'HEADS' | 'TAILS' | null;

export interface EntropyData {
  timestamp: number;
  randomValues: Uint32Array;
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
