import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/formatters'

interface CardProps extends HTMLAttributes<HTMLDivElement> { }

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-secondary border border-white/5 shadow-lg rounded-xl',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('p-6 border-b border-white/5', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

CardHeader.displayName = 'CardHeader'

export const CardBody = forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('p-6', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

CardBody.displayName = 'CardBody'

export const CardFooter = forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('p-6 border-t border-white/5', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

CardFooter.displayName = 'CardFooter'
