import type { AwsResource } from '@/types/aws'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  vpc:              'bg-blue-900/60 border-blue-500',
  subnet:           'bg-blue-800/50 border-blue-400',
  internet_gateway: 'bg-purple-900/60 border-purple-500',
  security_group:   'bg-yellow-900/40 border-yellow-600',
  ec2:              'bg-green-900/60 border-green-500',
  alb:              'bg-orange-900/60 border-orange-500',
  rds:              'bg-red-900/60 border-red-500',
}

const TYPE_LABELS: Record<string, string> = {
  vpc:              'VPC',
  subnet:           'Subnet',
  internet_gateway: 'IGW',
  security_group:   'SG',
  ec2:              'EC2',
  alb:              'ALB',
  rds:              'RDS',
}

interface ResourceBoxProps {
  resource: AwsResource
  selected: boolean
  onClick: (resource: AwsResource) => void
}

export default function ResourceBox({ resource, selected, onClick }: ResourceBoxProps) {
  const colorClass = TYPE_COLORS[resource.type] ?? 'bg-gray-800 border-gray-600'

  return (
    <div
      onClick={() => onClick(resource)}
      className={cn(
        'border rounded-sm px-3 py-2 cursor-pointer select-none transition-all',
        'hover:brightness-125',
        colorClass,
        selected && 'ring-2 ring-white ring-offset-1 ring-offset-gray-950',
      )}
    >
      <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
        {TYPE_LABELS[resource.type] ?? resource.type}
      </div>
      <div className="text-xs text-white font-medium truncate max-w-[160px]">
        {resource.name}
      </div>
    </div>
  )
}
