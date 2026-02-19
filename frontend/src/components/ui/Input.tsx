import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/formatters'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    labelClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, labelClassName, type = 'text', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className={cn("block text-sm font-medium text-gray-300 mb-1", labelClassName)}>
                        {label}
                        {props.required && <span className="text-primary ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        'w-full px-3 py-2 border rounded-lg shadow-sm bg-secondary/50 text-white placeholder-gray-500',
                        'border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                        'transition-all duration-200',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
