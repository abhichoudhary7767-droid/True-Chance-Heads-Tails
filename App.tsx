
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Coin from './components/Coin';
import { EntropyEngine } from './services/EntropyEngine';
import { AudioService } from './services/AudioService';
import { HapticService } from './services/HapticService';
import { AppState, TossResult } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<TossResult>(null);
  const [duration, setDuration] = useState(2.0);
  const [tossCount, setTossCount] = useState(0);

  useEffect(() => {
    EntropyEngine.init();
  }, []);

  const handleFlip = useCallback(async () => {
    if (status === AppState.FLIPPING || status === AppState.SETTLING) return;

    // Trigger Initial Haptic & Sound
    HapticService.triggerToss();
    AudioService.playToss();

    // Reset UI state
    setStatus(AppState.FLIPPING);
    setResult(null);

    // 1. Generate Result with Entropy
    const { result: tossResult } = await EntropyEngine.getResult();
    
    // 2. Randomized Duration (1.8s - 2.4s)
    const randomDuration = 1.8 + (Math.random() * 0.6);
    setDuration(randomDuration);
    setResult(tossResult);

    // 3. Coordinate State Phases
    // Transition to SETTLING when the flip duration ends
    setTimeout(() => {
      setStatus(AppState.SETTLING);
      
      // Physical Landing Feedback
      HapticService.triggerImpact();
      AudioService.playImpact();
      
      // Secondary Wobble Haptics
      setTimeout(() => HapticService.triggerWobble(), 200);

      // Transition to RESULT after the settling wobble completes (0.8s)
      setTimeout(() => {
        setStatus(AppState.RESULT);
        setTossCount(prev => prev + 1);
        
        // Final "Candy Crush" Result Reveal Feedback
        HapticService.triggerResult();
        AudioService.playResult();
        
      }, 800);

    }, randomDuration * 1000);

  }, [status]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-between p-8 overflow-hidden touch-none selection:none">
      
      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-8 space-y-1"
      >
        <h1 className="text-4xl font-serif font-bold tracking-tight text-amber-500/90">TrueChance</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Entropy Verified RNG</p>
      </motion.div>

      {/* Main Interaction Area */}
      <div 
        className="flex-1 w-full flex flex-col items-center justify-center relative cursor-pointer"
        onClick={handleFlip}
      >
        <div className="relative z-10 flex items-center justify-center h-full">
           <Coin status={status} result={result} duration={duration} />
        </div>

        {/* Dynamic Shadow */}
        <motion.div 
          animate={{
            scale: status === AppState.FLIPPING ? [1, 0.4, 1] : 1,
            opacity: status === AppState.FLIPPING ? [0.3, 0.05, 0.3] : 0.3
          }}
          transition={{ duration: duration, times: [0, 0.5, 1] }}
          className="absolute bottom-1/4 w-48 h-12 bg-black blur-2xl rounded-full"
        />
      </div>

      {/* Footer / Controls */}
      <div className="w-full flex flex-col items-center pb-12 h-32">
        <AnimatePresence mode="wait">
          {status === AppState.IDLE && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-white/40 text-sm font-medium animate-pulse">Tap screen to toss</p>
            </motion.div>
          )}

          {status === AppState.FLIPPING && (
            <motion.div
              key="flipping"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-amber-500/60 text-sm font-bold tracking-widest uppercase italic">Defying Fate...</p>
            </motion.div>
          )}

          {status === AppState.RESULT && (
            <motion.div
              key="result"
              initial={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              className="text-center space-y-2 relative"
            >
              {/* Candy Crush Style Sparkle Ring Burst */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ 
                    x: Math.cos(i * 45 * Math.PI / 180) * 80, 
                    y: Math.sin(i * 45 * Math.PI / 180) * 80, 
                    opacity: 0, 
                    scale: 0 
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute left-1/2 top-1/2 w-2 h-2 rounded-full ${result === 'HEADS' ? 'bg-amber-400' : 'bg-slate-200'} blur-[1px]`}
                />
              ))}

              <motion.div 
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className={`absolute inset-0 rounded-full border-2 ${result === 'HEADS' ? 'border-amber-400' : 'border-slate-300'} blur-sm`}
              />
              
              <h2 className={`text-7xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] ${result === 'HEADS' ? 'text-amber-400' : 'text-slate-300'}`}>
                {result}
              </h2>
              <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">
                Toss #{tossCount} &bull; Tap to retry
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default App;
