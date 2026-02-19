import { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/formatters'
import { ChevronDown, Check } from 'lucide-react'

interface SelectProps {
    label?: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
    error?: string
    className?: string
    disabled?: boolean
    required?: boolean
}

export function Select({
    label,
    value,
    onChange,
    options,
    placeholder = 'Selecione uma opção',
    error,
    className,
    disabled = false,
    required = false
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (optionValue: string) => {
        onChange(optionValue)
        setIsOpen(false)
    }

    return (
        <div className="w-full" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                    {required && <span className="text-primary ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-left rounded-xl border border-white/10 bg-secondary/50 backdrop-blur-sm transition-all duration-200",
                        "text-white shadow-sm hover:border-white/20 hover:bg-secondary/70",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        disabled && "opacity-50 cursor-not-allowed",
                        error && "border-red-500/50 focus:ring-red-500/50",
                        isOpen && "border-primary ring-2 ring-primary/20",
                        className
                    )}
                >
                    <span className={cn("block", !selectedOption && "text-gray-500")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown
                        className={cn(
                            "w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2",
                            isOpen && "transform rotate-180"
                        )}
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-50 min-w-full w-max mt-2 bg-gray-950 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100 p-1">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Nenhuma opção encontrada
                            </div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors",
                                        "text-gray-300 hover:bg-white/5 hover:text-white",
                                        value === option.value && "bg-primary/10 text-primary hover:bg-primary/20"
                                    )}
                                >
                                    <span className="text-left w-full">{option.label}</span>
                                    {value === option.value && (
                                        <Check className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-red-400 font-medium flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    {error}
                </p>
            )}
        </div>
    )
}
