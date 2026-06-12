import { useEffect, useRef, useState, type RefObject } from 'react'

interface Props {
  containerRef: RefObject<HTMLDivElement | null>
  rotateZ: number
}

interface Cursor { cx: number; cy: number }

function axisAngles(rotateZDeg: number) {
  const rz = (rotateZDeg * Math.PI) / 180
  const rx = (55 * Math.PI) / 180
  const cosRx = Math.cos(rx)

  // project 3D unit vectors through rotateZ then rotateX → screen (x,y)
  const xAxis = { x: Math.cos(rz),  y: -Math.sin(rz) * cosRx }
  const yAxis = { x: -Math.sin(rz), y:  Math.cos(rz) * cosRx }
  const zAxis = { x: 0,             y: -Math.sin(rx) }

  return {
    x: Math.atan2(xAxis.y, xAxis.x),
    y: Math.atan2(yAxis.y, yAxis.x),
    z: Math.atan2(zAxis.y, zAxis.x),
  }
}

const R = 10000

export default function SceneCrosshair({ containerRef, rotateZ }: Props) {
  const [cursor, setCursor] = useState<Cursor | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      setCursor({ cx: e.clientX - rect.left, cy: e.clientY - rect.top })
      setSize({ w: rect.width, h: rect.height })
    }
    const onLeave = () => setCursor(null)

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [containerRef])

  if (!cursor || size.w === 0) return null

  const { cx, cy } = cursor
  const angles = axisAngles(rotateZ)

  const line = (θ: number) => ({
    x1: cx - R * Math.cos(θ),
    y1: cy - R * Math.sin(θ),
    x2: cx + R * Math.cos(θ),
    y2: cy + R * Math.sin(θ),
  })

  const sceneCx = size.w / 2
  const sceneCy = size.h / 2
  const sceneX = Math.round(cx - sceneCx)
  const sceneY = Math.round(cy - sceneCy)

  // label offset — keep inside viewport
  const labelX = cx + (cx > size.w * 0.75 ? -110 : 14)
  const labelY = cy + (cy > size.h * 0.8  ?  -42 : 14)

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* X axis — red */}
      <line {...line(angles.x)} stroke="#ef4444" strokeWidth={1} strokeOpacity={0.5} />
      {/* Y axis — green */}
      <line {...line(angles.y)} stroke="#22c55e" strokeWidth={1} strokeOpacity={0.5} />
      {/* Z axis — blue */}
      <line {...line(angles.z)} stroke="#3b82f6" strokeWidth={1} strokeOpacity={0.5} />

      {/* cursor dot */}
      <circle cx={cx} cy={cy} r={2.5} fill="#ffffff" fillOpacity={0.6} />

      {/* coordinate label */}
      <rect
        x={labelX - 4} y={labelY - 2}
        width={102} height={38}
        rx={3}
        fill="#0a0e1a" fillOpacity={0.85}
        stroke="#374151" strokeWidth={0.5}
      />
      <text x={labelX} y={labelY + 10} fill="#ef4444" fontSize={10} fontFamily="monospace">
        x: {sceneX}
      </text>
      <text x={labelX} y={labelY + 22} fill="#22c55e" fontSize={10} fontFamily="monospace">
        y: {sceneY}
      </text>
      <text x={labelX} y={labelY + 34} fill="#3b82f6" fontSize={10} fontFamily="monospace">
        z: 0
      </text>
    </svg>
  )
}
