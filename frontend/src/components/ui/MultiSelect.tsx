
import { cn } from '@/utils/formatters'
import { Check } from 'lucide-react'

interface MultiSelectProps {
    label?: string
    error?: string
    options: string[]
    selected: string[]
    onChange: (selected: string[]) => void
    className?: string
}

export function MultiSelect({
    label,
    error,
    options,
    selected,
    onChange,
    className
}: MultiSelectProps) {
    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option))
        } else {
            onChange([...selected, option])
        }
    }

    return (
        <div className={cn("w-full", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isSelected = selected.includes(option)
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => toggleOption(option)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                                isSelected
                                    ? "bg-primary/20 border-primary text-primary hover:bg-primary/30"
                                    : "bg-secondary/50 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                            )}
                        >
                            {isSelected && <Check className="w-3 h-3" />}
                            {option}
                        </button>
                    )
                })}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}
