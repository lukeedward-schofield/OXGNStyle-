import { useId } from 'react'
import { FRONT_RATIO, computeBody, type AvatarInput } from './geometry'

export const SKIN_TONES = ['#fde0c8', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21']

const HAIR = '#2b1b12'
const OUTLINE = '#1a1a1a'

export type TopGarment = { color: string; easeCm: number; sleeves: 'short' | 'none' }
export type BottomGarment = { color: string; easeCm: number; hemFraction: number }

export const BASE_TOP: TopGarment = { color: '#9ca3af', easeCm: 6, sleeves: 'short' }
export const BASE_BOTTOM: BottomGarment = { color: '#6b7280', easeCm: 6, hemFraction: 0.74 }

type Props = {
  input: AvatarInput
  skinTone?: string
  top?: TopGarment
  bottom?: BottomGarment
  className?: string
}

const FLOOR = 212
const MAX_FIGURE = 205

// Extra frontal width of a garment: stroke width adds half of itself to each side.
const strokeFor = (easeCm: number) => Math.max(0.8, easeCm * FRONT_RATIO)

// All outlines are painted first, then all fills, so shapes that overlap look like one garment.
function PathLayer({ ds, color, width }: { ds: string[]; color: string; width: number }) {
  return (
    <>
      {ds.map((d, i) => (
        <path key={`o${i}`} d={d} fill={OUTLINE} stroke={OUTLINE} strokeWidth={width + 1.2} strokeLinejoin="round" />
      ))}
      {ds.map((d, i) => (
        <path key={`f${i}`} d={d} fill={color} stroke={color} strokeWidth={width} strokeLinejoin="round" />
      ))}
    </>
  )
}

function LineLayer({
  line,
  color,
  width,
}: {
  line: { x1: number; y1: number; x2: number; y2: number }
  color: string
  width: number
}) {
  return (
    <>
      <line {...line} stroke={OUTLINE} strokeWidth={width + 1.2} strokeLinecap="round" />
      <line {...line} stroke={color} strokeWidth={width} strokeLinecap="round" />
    </>
  )
}

export function Avatar({ input, skinTone = SKIN_TONES[1], top = BASE_TOP, bottom = BASE_BOTTOM, className }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const b = computeBody(input)
  const { h, headR, y } = b

  const scale = Math.min(1, MAX_FIGURE / h)
  const topWidth = strokeFor(top.easeCm)
  const bottomWidth = strokeFor(bottom.easeCm)

  const topFrom = y.shoulder - 0.016 * h
  const sleeveEnd = y.shoulder + 0.15 * h
  const bottomFrom = y.waist + 0.01 * h
  const bottomHem = bottom.hemFraction * h

  const skin = { fill: skinTone, stroke: OUTLINE, strokeWidth: 0.7, strokeLinejoin: 'round' as const }

  return (
    <svg
      viewBox="-70 0 140 220"
      className={className}
      role="img"
      aria-label="Illustrated avatar based on your measurements"
    >
      <defs>
        <clipPath id={`${id}-torso`}>
          <rect x={-70} y={topFrom} width={140} height={y.hip - topFrom} />
        </clipPath>
        <clipPath id={`${id}-sleeves`}>
          <rect x={-70} y={topFrom} width={140} height={sleeveEnd - topFrom} />
        </clipPath>
        <clipPath id={`${id}-bottom`}>
          <rect x={-70} y={bottomFrom} width={140} height={bottomHem - bottomFrom} />
        </clipPath>
      </defs>

      <g transform={`translate(0 ${FLOOR - h * scale}) scale(${scale})`}>
        {/* long hair sits behind the body */}
        {input.sizing === 'ladies' && (
          <rect
            x={-headR * 1.12}
            y={headR * 0.35}
            width={headR * 2.24}
            height={headR * 2.5}
            rx={headR * 0.9}
            fill={HAIR}
            stroke={OUTLINE}
            strokeWidth={0.7}
          />
        )}

        {/* body */}
        {b.legPaths.map((d, i) => (
          <path key={i} d={d} {...skin} />
        ))}
        {b.feet.map((f, i) => (
          <ellipse key={i} cx={f.cx} cy={f.cy} rx={f.rx} ry={f.ry} {...skin} />
        ))}
        <rect
          x={-b.neckW / 2}
          y={headR * 1.7}
          width={b.neckW}
          height={y.shoulder - headR * 1.7 + 2}
          rx={b.neckW * 0.3}
          {...skin}
        />
        <path d={b.torsoPath} {...skin} />
        {b.arms.map((a, i) => (
          <LineLayer key={i} line={a} color={skinTone} width={b.armW} />
        ))}

        {/* clothing */}
        <g clipPath={`url(#${id}-bottom)`}>
          <PathLayer ds={[b.torsoPath, ...b.legPaths]} color={bottom.color} width={bottomWidth} />
        </g>
        <g clipPath={`url(#${id}-torso)`}>
          <PathLayer ds={[b.torsoPath]} color={top.color} width={topWidth} />
        </g>
        {top.sleeves === 'short' && (
          <g clipPath={`url(#${id}-sleeves)`}>
            {b.arms.map((a, i) => (
              <LineLayer key={i} line={a} color={top.color} width={b.armW + topWidth} />
            ))}
          </g>
        )}

        {/* head */}
        <circle cx={0} cy={headR} r={headR} {...skin} />
        <path
          d={`M ${-headR} ${headR} A ${headR} ${headR} 0 0 1 ${headR} ${headR} Q 0 ${headR * 0.45} ${-headR} ${headR} Z`}
          fill={HAIR}
          stroke={OUTLINE}
          strokeWidth={0.7}
          strokeLinejoin="round"
        />
        <circle cx={-headR * 0.38} cy={headR * 1.05} r={headR * 0.09} fill={OUTLINE} />
        <circle cx={headR * 0.38} cy={headR * 1.05} r={headR * 0.09} fill={OUTLINE} />
        <path
          d={`M ${-headR * 0.3} ${headR * 1.5} Q 0 ${headR * 1.75} ${headR * 0.3} ${headR * 1.5}`}
          fill="none"
          stroke={OUTLINE}
          strokeWidth={headR * 0.06}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}