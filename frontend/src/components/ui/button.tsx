import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded text-xs font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:  'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline:  'border border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200',
        ghost:    'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
        destructive: 'bg-red-900 text-red-100 hover:bg-red-800',
      },
      size: {
        default: 'h-7 px-3 py-1',
        sm:      'h-6 px-2',
        lg:      'h-9 px-4',
        icon:    'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
