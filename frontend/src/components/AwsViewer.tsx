import { useState, useRef, useEffect, useCallback } from 'react'
import { useAwsResources } from '@/hooks/useAwsResources'
import ResourceCard from './ResourceCard'
import ResourceDetail from './ResourceDetail'
import SceneCrosshair from './SceneCrosshair'
import { Button } from '@/components/ui/button'
import type { AwsResource } from '@/types/aws'

const DEPTH_META = [
  { label: 'Network Layer', desc: 'VPC · Subnet · IGW · NAT · Security Group', accent: 'rgba(59,130,246,0.55)' },
  { label: 'Compute Layer', desc: 'EC2 · RDS · ALB · ECS · Lambda',            accent: 'rgba(249,115,22,0.65)' },
]

interface PlatformProps {
  label: string
  accent: string
  zOffset: number
  active: boolean
  children: React.ReactNode
}

function Platform({ label, accent, zOffset, active, children }: PlatformProps) {
  return (
    <div
      style={{
        transform: `translateZ(${zOffset}px)`,
        transformStyle: 'preserve-3d',
        position: 'relative',
        opacity: active ? 1 : 0.45,
        transition: 'opacity 0.3s',
      }}
    >
      <div
        style={{
          background: active ? 'rgba(18, 26, 48, 0.98)' : 'rgba(10, 14, 26, 0.97)',
          border: `1px solid ${accent}`,
          borderRadius: '8px',
          padding: '18px 22px 22px',
          boxShadow: active ? `0 0 80px ${accent}55, 0 0 24px ${accent}33` : `0 0 16px ${accent}11`,
          transition: 'box-shadow 0.3s, background 0.3s',
        }}
      >
        <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, marginBottom: '14px' }}>
          {label}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {children}
        </div>
      </div>
      {/* front slab wall */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: '18px',
          background: 'rgba(4, 7, 15, 0.98)',
          borderLeft: `1px solid ${accent}55`,
          borderRight: `1px solid ${accent}55`,
          borderBottom: `1px solid ${accent}33`,
          transform: 'rotateX(-90deg)',
          transformOrigin: 'bottom',
        }}
      />
    </div>
  )
}

function buildChildMap(resources: AwsResource[]) {
  const byId = new Map(resources.map(r => [r.id, r]))
  const map = new Map<string, AwsResource[]>()
  for (const r of resources) {
    const parent = r.parentId ? byId.get(r.parentId) : undefined
    if (parent && parent.layer === r.layer) {
      if (!map.has(r.parentId!)) map.set(r.parentId!, [])
      map.get(r.parentId!)!.push(r)
    }
  }
  return { byId, childMap: map }
}

function renderTree(
  resources: AwsResource[],
  childMap: Map<string, AwsResource[]>,
  selected: AwsResource | null,
  onClick: (r: AwsResource) => void,
): React.ReactNode {
  return resources.map(r => (
    <ResourceCard key={r.id} resource={r} selected={selected?.id === r.id} onClick={onClick}>
      {childMap.has(r.id) && renderTree(childMap.get(r.id)!, childMap, selected, onClick)}
    </ResourceCard>
  ))
}

type DragMode = 'pan' | 'rotate'

interface DragState {
  startX: number
  startY: number
  panX: number
  panY: number
  rotateZ: number
}

export default function AwsViewer() {
  const { topology, loading, error, refetch } = useAwsResources()
  const [selected, setSelected]     = useState<AwsResource | null>(null)
  const [rotateZ, setRotateZ]       = useState(-35)
  const [depth, setDepth]           = useState(0)
  const [pan, setPan]               = useState({ x: 0, y: 0 })
  const [zoom, setZoom]             = useState(1)
  const [dragMode, setDragMode]     = useState<DragMode>('pan')
  const [isDragging, setIsDragging] = useState(false)
  const perspectiveRef = useRef<HTMLDivElement>(null)
  const dragRef        = useRef<DragState | null>(null)

  const allResources = topology?.resources ?? []
  const { byId, childMap } = buildChildMap(allResources)
  const isNestedChild = (r: AwsResource) => {
    const parent = r.parentId ? byId.get(r.parentId) : undefined
    return !!(parent && parent.layer === r.layer)
  }
  const basis   = allResources.filter(r => r.layer === 'basis'   && !isNestedChild(r))
  const compute = allResources.filter(r => r.layer === 'compute' && !isNestedChild(r))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp')   setDepth(d => Math.min(DEPTH_META.length - 1, d + 1))
      if (e.key === 'ArrowDown') setDepth(d => Math.max(0, d - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!perspectiveRef.current?.contains(e.target as Node)) return
      e.preventDefault()
      setZoom(z => Math.min(3, Math.max(0.25, z * (e.deltaY < 0 ? 1.1 : 0.9))))
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  const onBgMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y, rotateZ }
    setIsDragging(true)
    e.preventDefault()
  }, [pan, rotateZ])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      if (dragMode === 'rotate') {
        setRotateZ(dragRef.current.rotateZ + dx * 0.4)
      } else {
        setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy })
      }
    }
    const onUp = () => {
      dragRef.current = null
      setIsDragging(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragMode])

  const handleClick = (resource: AwsResource) => {
    setSelected(prev => prev?.id === resource.id ? null : resource)
  }

  const cursor = dragMode === 'rotate'
    ? (isDragging ? 'ew-resize' : 'col-resize')
    : (isDragging ? 'grabbing'  : 'grab')

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{ backgroundColor: '#060a12' }}
    >
      {/* header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold tracking-widest text-gray-300 uppercase">AWS Resource Viewer</h1>
          {/* depth indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(10,14,26,0.85)',
              border: `1px solid ${DEPTH_META[depth].accent}`,
              borderRadius: '6px',
              padding: '3px 10px',
              boxShadow: `0 0 12px ${DEPTH_META[depth].accent}33`,
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
          >
            <span style={{ fontSize: '9px', color: '#4b5563', fontFamily: 'monospace' }}>↑↓</span>
            <span style={{ fontSize: '10px', color: DEPTH_META[depth].accent, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
              DEPTH {depth}
            </span>
            <span style={{ fontSize: '10px', color: '#6b7280' }}>
              {DEPTH_META[depth].label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {topology && (
            <span className="text-xs text-gray-600">
              {topology.region} &middot; {topology.resources.length} resources
            </span>
          )}
          {/* drag mode toggle */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(10,14,26,0.9)',
              border: '1px solid #1f2937',
              borderRadius: '6px',
              padding: '2px',
              gap: '2px',
            }}
          >
            {(['pan', 'rotate'] as DragMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setDragMode(mode)}
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  background: dragMode === mode ? '#1e3a5f' : 'transparent',
                  color: dragMode === mode ? '#93c5fd' : '#4b5563',
                }}
              >
                {mode === 'pan' ? '✥ Pan' : '↻ Rotate'}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={refetch}>
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-4/5 text-gray-500 text-sm">Loading…</div>
      )}
      {error && (
        <div className="flex items-center justify-center h-4/5 text-red-400 text-sm">Error: {error}</div>
      )}

      {!loading && !error && topology && (
        <div
          ref={perspectiveRef}
          className="relative flex items-center justify-center"
          style={{
            height: 'calc(100vh - 56px)',
            perspective: '1400px',
            perspectiveOrigin: '50% 10%',
            cursor,
          }}
          onMouseDown={onBgMouseDown}
        >
          <SceneCrosshair containerRef={perspectiveRef} />

          {/* pan + zoom wrapper */}
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            {/* 3D scene — suppress transition while rotate-dragging for immediate feel */}
            <div
              style={{
                transform: `rotateX(55deg) rotateZ(${rotateZ}deg)`,
                transition: isDragging && dragMode === 'rotate' ? 'none' : 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                transformStyle: 'preserve-3d',
                display: 'flex',
                flexDirection: 'column',
                gap: '48px',
                width: '780px',
              }}
            >
              <Platform label="Compute / Services" accent="rgba(249,115,22,0.65)" zOffset={150} active={depth === 1}>
                {compute.length === 0
                  ? <span style={{ fontSize: '11px', color: '#6b7280' }}>No compute resources</span>
                  : renderTree(compute, childMap, selected, handleClick)
                }
              </Platform>

              <Platform label="Network Basis" accent="rgba(59,130,246,0.55)" zOffset={0} active={depth === 0}>
                {basis.length === 0
                  ? <span style={{ fontSize: '11px', color: '#6b7280' }}>No basis resources</span>
                  : renderTree(basis, childMap, selected, handleClick)
                }
              </Platform>
            </div>
          </div>
        </div>
      )}

      <ResourceDetail resource={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
