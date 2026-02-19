import { useState, useRef, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/utils/formatters'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DatePickerProps {
    label?: string
    value: string // Expects YYYY-MM-DD string
    onChange: (value: string) => void
    error?: string
    placeholder?: string
    className?: string
    disabled?: boolean
    required?: boolean
    minDate?: string
}

export function DatePicker({
    label,
    value,
    onChange,
    error,
    placeholder = 'Selecione uma data',
    className,
    disabled = false,
    required = false,
    minDate
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const containerRef = useRef<HTMLDivElement>(null)

    // Parse value to Date object if exists
    const selectedDate = value ? new Date(value + 'T00:00:00') : null

    useEffect(() => {
        // Sync calendar view with selected date when opened/changed
        if (selectedDate && !isNaN(selectedDate.getTime())) {
            setCurrentMonth(selectedDate)
        }
    }, [value, isOpen])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handlePreviousMonth = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentMonth(prev => subMonths(prev, 1))
    }

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentMonth(prev => addMonths(prev, 1))
    }

    const handleSelectDate = (date: Date) => {
        // Format as YYYY-MM-DD
        const formatted = format(date, 'yyyy-MM-dd')
        onChange(formatted)
        setIsOpen(false)
    }

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInterval = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Add empty slots for days before start of month (simple approach)
    const startDayOfWeek = monthStart.getDay() // 0 (Sun) to 6 (Sat)
    const emptySlots = Array(startDayOfWeek).fill(null)

    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

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
                        {selectedDate && !isNaN(selectedDate.getTime())
                            ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                            : placeholder}
                    </span>
                    <Calendar className="w-5 h-5 text-gray-400" />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 p-4 bg-gray-950 border border-white/10 rounded-xl shadow-xl w-72 animate-in fade-in zoom-in-95 duration-100">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-white font-medium capitalize">
                                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={handlePreviousMonth}
                                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Week Days */}
                        <div className="grid grid-cols-7 mb-2">
                            {weekDays.map((day, i) => (
                                <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {emptySlots.map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {daysInterval.map((day) => {
                                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                                const isTodayDate = isToday(day)

                                // Disable dates before minDate if provided
                                const isDisabled = minDate && format(day, 'yyyy-MM-dd') < minDate

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => !isDisabled && handleSelectDate(day)}
                                        disabled={!!isDisabled}
                                        className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200",
                                            isSelected
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold"
                                                : "text-gray-300 hover:bg-white/10 hover:text-white",
                                            isTodayDate && !isSelected && "border border-primary/50 text-primary",
                                            isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                )
                            })}
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
