import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { TossResult, AppState } from './types'

interface CoinProps {
  status: AppState
  result: TossResult
  duration: number
}

const Coin = ({ status, result, duration }: CoinProps) => {
  const controls = useAnimation()
  const totalRotation = useRef(0)
  const animating = useRef(false)

  useEffect(() => {
    if (status === AppState.FLIPPING && result && !animating.current) {
      animating.current = true
      animateFlip().finally(() => {
        animating.current = false
      })
    }

    return () => {
      controls.stop()
    }
  }, [status, result, duration])

  const animateFlip = async () => {
    const currentRot = totalRotation.current
    const minExtraRotations = 8

    // Deterministic randomness based on result + time
    const seed = Date.now() ^ (result === 'TAILS' ? 1 : 0)
    const randomExtra = seed % 4

    const baseRotation =
      (Math.floor(currentRot / 360) + minExtraRotations + randomExtra) * 360

    const target = baseRotation + (result === 'TAILS' ? 180 : 0)
    totalRotation.current = target

    await Promise.all([
      controls.start({
        y: [-400, 0],
        transition: { duration, ease: 'easeOut' }
      }),
      controls.start({
        rotateX: target,
        transition: { duration, ease: [0.45, 0.05, 0.55, 0.95] }
      }),
      controls.start({
        scale: [1, 1.4, 1],
        transition: { duration }
      })
    ])

    await controls.start({
      rotateX: [target + 15, target - 10, target + 5, target - 2, target],
      rotateY: [10, -8, 5, -2, 0],
      rotateZ: [5, -4, 2, -1, 0],
      transition: { duration: 0.8, ease: 'easeOut' }
    })
  }

  const coinFace =
    'absolute inset-0 rounded-full border-4 border-opacity-30 flex items-center justify-center backface-hidden shadow-2xl overflow-hidden'

  return (
    <div className="coin-container relative w-64 h-64 select-none">
      <motion.div
        animate={controls}
        initial={{ rotateX: 0, y: 0, scale: 1 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full relative"
      >
        <div
          className={`${coinFace} bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 border-amber-300`}
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(2px)' }}
        >
          <span className="text-6xl font-serif text-amber-100">H</span>
        </div>

        <div
          className={`${coinFace} bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 border-slate-300`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg) translateZ(2px)'
          }}
        >
          <span className="text-6xl font-serif text-slate-100">T</span>
        </div>
      </motion.div>
    </div>
  )
}

export default Coin
