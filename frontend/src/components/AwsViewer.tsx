import { useState } from 'react'
import { useAwsResources } from '@/hooks/useAwsResources'
import ResourceBox from './ResourceBox'
import ResourceDetail from './ResourceDetail'
import type { AwsResource } from '@/types/aws'

export default function AwsViewer() {
  const { topology, loading, error, refetch } = useAwsResources()
  const [selected, setSelected] = useState<AwsResource | null>(null)

  const basis   = topology?.resources.filter(r => r.layer === 'basis')   ?? []
  const compute = topology?.resources.filter(r => r.layer === 'compute') ?? []

  const handleClick = (resource: AwsResource) => {
    setSelected(prev => prev?.id === resource.id ? null : resource)
  }

  return (
    <div className="relative flex flex-col h-screen p-6 gap-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-wide">AWS Resource Viewer</h1>
        <div className="flex items-center gap-3">
          {topology && (
            <span className="text-xs text-gray-500">
              {topology.region} &middot; {topology.resources.length} resources
            </span>
          )}
          <button
            onClick={refetch}
            className="text-xs px-3 py-1 rounded border border-gray-700 hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Loading…
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
          Error: {error}
        </div>
      )}

      {!loading && !error && topology && (
        <div className="flex-1 relative overflow-auto">
          {/* background lattice */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, #4b5563 0, #4b5563 1px, transparent 0, transparent 50%),' +
                'repeating-linear-gradient(90deg, #4b5563 0, #4b5563 1px, transparent 0, transparent 50%)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative flex flex-col gap-6 p-4">
            {/* compute layer */}
            <section>
              <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
                Compute / Services
              </div>
              <div className="flex flex-wrap gap-3">
                {compute.length === 0 ? (
                  <span className="text-xs text-gray-600">No compute resources</span>
                ) : (
                  compute.map(r => (
                    <ResourceBox
                      key={r.id}
                      resource={r}
                      selected={selected?.id === r.id}
                      onClick={handleClick}
                    />
                  ))
                )}
              </div>
            </section>

            {/* divider */}
            <div className="border-t border-dashed border-gray-700" />

            {/* basis layer */}
            <section>
              <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
                Network Basis
              </div>
              <div className="flex flex-wrap gap-3">
                {basis.length === 0 ? (
                  <span className="text-xs text-gray-600">No basis resources</span>
                ) : (
                  basis.map(r => (
                    <ResourceBox
                      key={r.id}
                      resource={r}
                      selected={selected?.id === r.id}
                      onClick={handleClick}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      <ResourceDetail resource={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
