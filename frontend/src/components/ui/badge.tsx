import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-gray-800 text-gray-400 border border-gray-700',
        blue:     'bg-blue-900/60 text-blue-300 border border-blue-500',
        green:    'bg-green-900/60 text-green-300 border border-green-500',
        orange:   'bg-orange-900/60 text-orange-300 border border-orange-500',
        red:      'bg-red-900/60 text-red-300 border border-red-500',
        yellow:   'bg-yellow-900/40 text-yellow-300 border border-yellow-600',
        purple:   'bg-purple-900/60 text-purple-300 border border-purple-500',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
