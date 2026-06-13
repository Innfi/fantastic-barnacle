import { useEffect, useRef, useState, type RefObject } from 'react'

interface Props {
  containerRef: RefObject<HTMLDivElement | null>
}

interface Cursor { cx: number; cy: number }

export default function SceneCrosshair({ containerRef }: Props) {
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
