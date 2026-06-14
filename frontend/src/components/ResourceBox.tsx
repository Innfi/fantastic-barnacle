import type { AwsResource } from '@/types/aws'
import { cn } from '@/lib/utils'
import { Badge, type BadgeProps } from '@/components/ui/badge'

type BadgeVariant = BadgeProps['variant']

const TYPE_VARIANTS: Record<string, BadgeVariant> = {
  vpc:              'blue',
  subnet:           'blue',
  internet_gateway: 'purple',
  security_group:   'yellow',
  ec2:              'green',
  alb:              'orange',
  rds:              'red',
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
  const variant = TYPE_VARIANTS[resource.type] ?? 'default'

  return (
    <div
      onClick={() => onClick(resource)}
      className={cn(
        'w-[160px] border rounded-sm px-3 py-2 cursor-pointer select-none transition-all',
        'hover:brightness-125',
        selected && 'ring-2 ring-white ring-offset-1 ring-offset-gray-950',
        // border color matches badge variant
        variant === 'blue'   && 'bg-blue-900/60 border-blue-500',
        variant === 'purple' && 'bg-purple-900/60 border-purple-500',
        variant === 'yellow' && 'bg-yellow-900/40 border-yellow-600',
        variant === 'green'  && 'bg-green-900/60 border-green-500',
        variant === 'orange' && 'bg-orange-900/60 border-orange-500',
        variant === 'red'    && 'bg-red-900/60 border-red-500',
        variant === 'default' && 'bg-gray-800 border-gray-600',
      )}
    >
      <Badge variant={variant}>
        {TYPE_LABELS[resource.type] ?? resource.type}
      </Badge>
      <div className="text-xs text-white font-medium truncate mt-1">
        {resource.name}
      </div>
    </div>
  )
}
