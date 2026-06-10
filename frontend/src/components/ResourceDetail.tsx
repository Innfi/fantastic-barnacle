import type { AwsResource } from '@/types/aws'

interface ResourceDetailProps {
  resource: AwsResource | null
  onClose: () => void
}

export default function ResourceDetail({ resource, onClose }: ResourceDetailProps) {
  if (!resource) return null

  return (
    <div className="absolute right-4 top-4 w-72 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-10">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-white">{resource.name}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
      </div>
      <div className="space-y-1.5">
        {[
          ['ID', resource.id],
          ['Type', resource.type],
          ['Layer', resource.layer],
          ['Region', resource.region],
          ...(resource.parentId ? [['Parent', resource.parentId]] : []),
          ...Object.entries(resource.metadata),
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2 text-xs">
            <span className="text-gray-500 w-20 shrink-0">{k}</span>
            <span className="text-gray-200 font-mono break-all">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
