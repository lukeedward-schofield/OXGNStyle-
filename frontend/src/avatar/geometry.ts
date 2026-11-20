export type Sizing = 'mens' | 'ladies'

export type AvatarInput = {
  sizing: Sizing
  height_cm: number
  chest_cm: number
  waist_cm: number
  hips_cm: number
}

type Point = [number, number]

// A torso is roughly an ellipse, so its frontal width is about a third of its circumference.
export const FRONT_RATIO = 0.31

// Smooth closed curve through the points (Catmull-Rom converted to cubic Beziers).
function smoothClosed(points: Point[]): string {
  const n = points.length
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }
  return `${d} Z`
}

// Everything is in centimetres. x = 0 is the body's centre line, y = 0 is the top of the head.
export function computeBody(input: AvatarInput) {
  const h = input.height_cm

  const chestW = input.chest_cm * FRONT_RATIO
  const waistW = input.waist_cm * FRONT_RATIO
  const hipsW = input.hips_cm * FRONT_RATIO
  const shoulderW = chestW + (input.sizing === 'mens' ? 10 : 8)

  const headR = 0.085 * h
  const armW = 0.05 * h
  const neckW = 0.055 * h

  const y = {
    shoulder: 0.21 * h,
    chest: 0.28 * h,
    waist: 0.4 * h,
    hip: 0.49 * h,
    crotch: 0.53 * h,
    knee: 0.74 * h,
    floor: h,
  }

  const right: Point[] = [
    [neckW / 2 + 1, y.shoulder - 0.012 * h],
    [shoulderW / 2 - armW * 0.3, y.shoulder + 0.012 * h],
    [chestW / 2, y.chest],
    [waistW / 2, y.waist],
    [hipsW / 2, y.hip],
    [(hipsW / 2) * 0.97, y.crotch],
  ]
  const left = right.map(([x, yy]): Point => [-x, yy]).reverse()
  const torsoPath = smoothClosed([[0, y.shoulder - 0.014 * h], ...right, [0, y.crotch + 0.01 * h], ...left])

  const footH = 0.016 * h
  const legPaths = ([-1, 1] as const).map((s) => {
    const topCx = (s * hipsW) / 4
    const topHalf = hipsW / 4 - 0.5
    const kneeCx = topCx * 0.9
    const kneeHalf = 0.036 * h
    const ankleCx = topCx * 0.8
    const ankleHalf = 0.024 * h
    const ankleY = y.floor - footH * 2.2
    return smoothClosed([
      [topCx + s * topHalf, y.hip],
      [kneeCx + s * kneeHalf, y.knee],
      [ankleCx + s * ankleHalf, ankleY],
      [ankleCx - s * ankleHalf, ankleY],
      [kneeCx - s * kneeHalf, y.knee],
      [topCx - s * topHalf, y.hip],
    ])
  })

  const feet = ([-1, 1] as const).map((s) => ({
    cx: ((s * hipsW) / 4) * 0.8 + s * 2,
    cy: y.floor - footH,
    rx: 0.045 * h,
    ry: footH,
  }))

  const arms = ([-1, 1] as const).map((s) => ({
    x1: s * (shoulderW / 2 - armW / 2 + 0.5),
    y1: y.shoulder + armW / 2,
    x2: s * (shoulderW / 2 + 3),
    y2: 0.5 * h,
  }))

  return { h, headR, armW, neckW, y, torsoPath, legPaths, feet, arms }
}

export type Body = ReturnType<typeof computeBody>