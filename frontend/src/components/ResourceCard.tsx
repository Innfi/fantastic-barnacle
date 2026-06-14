import type { AwsResource } from '@/types/aws'

const TYPE_LABELS: Record<string, string> = {
  vpc:              'VPC',
  subnet:           'Subnet',
  internet_gateway: 'IGW',
  security_group:   'SG',
  ec2:              'EC2',
  alb:              'ALB',
  rds:              'RDS',
}

const TYPE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  vpc:              { bg: 'rgba(30,58,138,0.35)',  border: '#3b82f6', label: '#93c5fd' },
  subnet:           { bg: 'rgba(30,58,138,0.2)',   border: '#2563eb', label: '#60a5fa' },
  internet_gateway: { bg: 'rgba(88,28,135,0.35)',  border: '#a855f7', label: '#d8b4fe' },
  security_group:   { bg: 'rgba(113,63,18,0.35)',  border: '#d97706', label: '#fbbf24' },
  ec2:              { bg: 'rgba(20,83,45,0.35)',   border: '#22c55e', label: '#86efac' },
  alb:              { bg: 'rgba(124,45,18,0.35)',  border: '#f97316', label: '#fdba74' },
  rds:              { bg: 'rgba(127,29,29,0.35)',  border: '#ef4444', label: '#fca5a5' },
}

const FALLBACK = { bg: 'rgba(31,41,55,0.5)', border: '#4b5563', label: '#9ca3af' }

interface ResourceCardProps {
  resource: AwsResource
  selected: boolean
  onClick: (resource: AwsResource) => void
  children?: React.ReactNode
}

export default function ResourceCard({ resource, selected, onClick, children }: ResourceCardProps) {
  const c = TYPE_COLORS[resource.type] ?? FALLBACK

  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(resource) }}
      style={{
        background: c.bg,
        border: `1px solid ${selected ? '#ffffff' : c.border}`,
        borderRadius: '6px',
        padding: children ? '10px 12px 12px' : '8px 12px',
        minWidth: '160px',
        cursor: 'pointer',
        boxShadow: selected
          ? `0 0 0 2px #ffffff44, 0 0 16px ${c.border}66`
          : `0 0 8px ${c.border}22`,
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {/* type + identifier — top left */}
      <div style={{ marginBottom: children ? '10px' : 0 }}>
        <div style={{
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: c.label,
          fontFamily: 'monospace',
          marginBottom: '2px',
        }}>
          {TYPE_LABELS[resource.type] ?? resource.type}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#e5e7eb',
          fontWeight: 500,
          fontFamily: 'monospace',
          maxWidth: '220px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {resource.name}
        </div>
      </div>

      {children && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {children}
        </div>
      )}
    </div>
  )
}
