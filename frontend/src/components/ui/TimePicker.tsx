import { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/formatters'
import { Clock } from 'lucide-react'

interface TimePickerProps {
    label?: string
    value: string // Expects HH:mm string
    onChange: (value: string) => void
    error?: string
    placeholder?: string
    className?: string
    disabled?: boolean
    required?: boolean
}

export function TimePicker({
    label,
    value,
    onChange,
    error,
    placeholder = '--:--',
    className,
    disabled = false,
    required = false
}: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Parse value
    const [selectedHour, selectedMinute] = value ? value.split(':').map(Number) : [null, null]

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5) // Steps of 5 minutes

    const handleSelect = (h: number | null, m: number | null) => {
        if (h === null && selectedHour !== null) h = selectedHour
        if (m === null && selectedMinute !== null) m = selectedMinute

        if (h === null) h = 12 // Default if nothing selected
        if (m === null) m = 0

        const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        onChange(formatted)
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
                    <span className={cn("block truncate", !value && "text-gray-500")}>
                        {value || placeholder}
                    </span>
                    <Clock className="w-5 h-5 text-gray-400" />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 p-2 bg-gray-950 border border-white/10 rounded-xl shadow-xl w-48 animate-in fade-in zoom-in-95 duration-100 flex gap-2 h-64">
                        {/* Hours Column */}
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pr-1">
                            <div className="text-center text-xs text-gray-500 font-medium py-1 sticky top-0 bg-gray-950 z-10">Horas</div>
                            {hours.map(h => (
                                <button
                                    key={`h-${h}`}
                                    onClick={() => handleSelect(h, null)}
                                    className={cn(
                                        "w-full py-1.5 rounded-lg text-sm transition-colors text-center",
                                        selectedHour === h
                                            ? "bg-primary text-white font-bold"
                                            : "text-gray-400 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {h.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-white/10 my-2" />

                        {/* Minutes Column */}
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pl-1">
                            <div className="text-center text-xs text-gray-500 font-medium py-1 sticky top-0 bg-gray-950 z-10">Min</div>
                            {minutes.map(m => (
                                <button
                                    key={`m-${m}`}
                                    onClick={() => handleSelect(null, m)}
                                    className={cn(
                                        "w-full py-1.5 rounded-lg text-sm transition-colors text-center",
                                        selectedMinute === m
                                            ? "bg-primary text-white font-bold"
                                            : "text-gray-400 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {m.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
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
