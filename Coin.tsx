
import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { TossResult, AppState } from './types';

interface CoinProps {
  status: AppState;
  result: TossResult;
  duration: number;
}

const Coin: React.FC<CoinProps> = ({ status, result, duration }) => {
  const controls = useAnimation();

  // We keep track of the absolute rotation to ensure it always spins forward
  // but lands precisely on the correct face (0/360 for Heads, 180/540 for Tails).
  const totalRotation = React.useRef(0);

  React.useEffect(() => {
    if (status === AppState.FLIPPING && result) {
      animateFlip();
    }
  }, [status, result]);

  const animateFlip = async () => {
    // 1. Calculate the absolute target rotation.
    // We want to complete at least 8 full rotations from where we currently are.
    // Heads = absolute rotation is a multiple of 360.
    // Tails = absolute rotation is (multiple of 360) + 180.
    const currentRot = totalRotation.current;
    const minExtraRotations = 8;
    const randomExtra = Math.floor(Math.random() * 4);
    
    // Calculate the next "base" multiple of 360 that is far enough away
    const baseRotation = (Math.floor(currentRot / 360) + minExtraRotations + randomExtra) * 360;
    
    // Adjust target based on desired result
    const target = baseRotation + (result === 'TAILS' ? 180 : 0);
    
    // Update ref for the next flip
    totalRotation.current = target;

    // 2. Main Flip Animation (Height + Rotation)
    await Promise.all([
      // Height arc: moves up then back to center
      controls.start({
        y: [-400, 0],
        transition: { 
          duration: duration, 
          times: [0, 1],
          ease: "easeOut"
        }
      }),
      // Rotation: spins to the exact target
      controls.start({
        rotateX: target,
        transition: { 
          duration: duration, 
          ease: [0.45, 0.05, 0.55, 0.95]
        }
      }),
      // Scaling for perspective: grows as it gets "closer" to the camera
      controls.start({
        scale: [1, 1.4, 1],
        transition: { duration: duration, times: [0, 0.5, 1] }
      })
    ]);

    // 3. Settle Wobble
    // Rapid dampening oscillation to look like it's settling on a surface
    await controls.start({
      rotateX: [
        target + 15, 
        target - 10, 
        target + 5, 
        target - 2, 
        target
      ],
      rotateY: [10, -8, 5, -2, 0],
      rotateZ: [5, -4, 2, -1, 0],
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    });
  };

  const coinFaceCommon = "absolute inset-0 rounded-full border-4 border-opacity-30 flex items-center justify-center backface-hidden shadow-2xl overflow-hidden";

  return (
    <div className="coin-container relative w-64 h-64 select-none">
      <motion.div
        animate={controls}
        initial={{ rotateX: 0, y: 0, scale: 1 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full relative"
      >
        {/* Heads Side (Gold) - Faces forward when rotateX is 0, 360, etc. */}
        <div 
          className={`${coinFaceCommon} bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 border-amber-300`}
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(2px)' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]" />
          <div className="text-amber-100 flex flex-col items-center">
             <div className="w-40 h-40 rounded-full border-2 border-amber-200 flex items-center justify-center opacity-80">
                <span className="text-6xl font-serif font-bold text-shadow-lg">H</span>
             </div>
             <span className="mt-2 text-xs font-bold tracking-widest uppercase opacity-60">Liberty</span>
          </div>
        </div>

        {/* Tails Side (Silver) - Faces forward when rotateX is 180, 540, etc. */}
        <div 
          className={`${coinFaceCommon} bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 border-slate-300`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg) translateZ(2px)' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]" />
           <div className="text-slate-100 flex flex-col items-center">
             <div className="w-40 h-40 rounded-full border-2 border-slate-200 flex items-center justify-center opacity-80">
                <span className="text-6xl font-serif font-bold text-shadow-lg">T</span>
             </div>
             <span className="mt-2 text-xs font-bold tracking-widest uppercase opacity-60">Trust</span>
          </div>
        </div>

        {/* Coin Edge (Thickness) */}
        <div 
          className="absolute inset-0 bg-amber-900/40 rounded-full"
          style={{ transform: 'translateZ(0px) rotateX(90deg)', height: '8px', top: 'calc(50% - 4px)' }}
        />
      </motion.div>
    </div>
  );
};

export default Coin;
