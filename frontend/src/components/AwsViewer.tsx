import { useState, useRef } from 'react'
import { useAwsResources } from '@/hooks/useAwsResources'
import ResourceBox from './ResourceBox'
import ResourceDetail from './ResourceDetail'
import SceneCrosshair from './SceneCrosshair'
import { Button } from '@/components/ui/button'
import type { AwsResource } from '@/types/aws'

interface PlatformProps {
  label: string
  accent: string
  zOffset: number
  children: React.ReactNode
}

function Platform({ label, accent, zOffset, children }: PlatformProps) {
  return (
    <div style={{ transform: `translateZ(${zOffset}px)`, transformStyle: 'preserve-3d', position: 'relative' }}>
      {/* top face */}
      <div
        style={{
          background: 'rgba(10, 14, 26, 0.97)',
          border: `1px solid ${accent}`,
          borderRadius: '8px',
          padding: '18px 22px 22px',
          boxShadow: `0 0 48px ${accent}22`,
          backgroundImage:
            'repeating-linear-gradient(0deg,rgba(75,85,99,0.08) 0,rgba(75,85,99,0.08) 1px,transparent 0,transparent 40px),' +
            'repeating-linear-gradient(90deg,rgba(75,85,99,0.08) 0,rgba(75,85,99,0.08) 1px,transparent 0,transparent 40px)',
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

export default function AwsViewer() {
  const { topology, loading, error, refetch } = useAwsResources()
  const [selected, setSelected] = useState<AwsResource | null>(null)
  const [rotateZ, setRotateZ] = useState(-35)
  const perspectiveRef = useRef<HTMLDivElement>(null)

  const basis   = topology?.resources.filter(r => r.layer === 'basis')   ?? []
  const compute = topology?.resources.filter(r => r.layer === 'compute') ?? []

  const handleClick = (resource: AwsResource) => {
    setSelected(prev => prev?.id === resource.id ? null : resource)
  }

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{
        backgroundColor: '#060a12',
        backgroundImage:
          'repeating-linear-gradient(0deg,rgba(75,85,99,0.05) 0,rgba(75,85,99,0.05) 1px,transparent 0,transparent 40px),' +
          'repeating-linear-gradient(90deg,rgba(75,85,99,0.05) 0,rgba(75,85,99,0.05) 1px,transparent 0,transparent 40px),' +
          'radial-gradient(ellipse at 50% 30%, #0d1a2e 0%, #060a12 100%)',
      }}
    >
      {/* header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-5">
        <h1 className="text-sm font-semibold tracking-widest text-gray-300 uppercase">AWS Resource Viewer</h1>
        <div className="flex items-center gap-3">
          {topology && (
            <span className="text-xs text-gray-600">
              {topology.region} &middot; {topology.resources.length} resources
            </span>
          )}
          <Button variant="outline" onClick={() => setRotateZ(r => r + 90)}>
            Rotate 90°
          </Button>
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
          }}
        >
          <SceneCrosshair containerRef={perspectiveRef} rotateZ={rotateZ} />

          {/* 3D scene */}
          <div
            style={{
              transform: `rotateX(55deg) rotateZ(${rotateZ}deg)`,
              transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
              transformStyle: 'preserve-3d',
              display: 'flex',
              flexDirection: 'column',
              gap: '48px',
              width: '780px',
            }}
          >
            <Platform label="Compute / Services" accent="rgba(249,115,22,0.65)" zOffset={150}>
              {compute.length === 0
                ? <span style={{ fontSize: '11px', color: '#6b7280' }}>No compute resources</span>
                : compute.map(r => (
                    <ResourceBox key={r.id} resource={r} selected={selected?.id === r.id} onClick={handleClick} />
                  ))
              }
            </Platform>

            <Platform label="Network Basis" accent="rgba(59,130,246,0.55)" zOffset={0}>
              {basis.length === 0
                ? <span style={{ fontSize: '11px', color: '#6b7280' }}>No basis resources</span>
                : basis.map(r => (
                    <ResourceBox key={r.id} resource={r} selected={selected?.id === r.id} onClick={handleClick} />
                  ))
              }
            </Platform>
          </div>
        </div>
      )}

      <ResourceDetail resource={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
