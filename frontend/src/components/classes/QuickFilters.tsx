import { Clock, CheckCircle2 } from 'lucide-react'

export type QuickFilterValue = 'morning' | 'afternoon' | 'night' | 'available'

interface QuickFiltersProps {
    activeFilters: QuickFilterValue[]
    onToggle: (filter: QuickFilterValue) => void
}

export function QuickFilters({ activeFilters, onToggle }: QuickFiltersProps) {
    const filters: { icon: typeof Clock; label: string; value: QuickFilterValue }[] = [
        { icon: Clock, label: 'Manhã', value: 'morning' },
        { icon: Clock, label: 'Tarde', value: 'afternoon' },
        { icon: Clock, label: 'Noite', value: 'night' },
        { icon: CheckCircle2, label: 'Com vagas', value: 'available' }
    ]

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
                const Icon = filter.icon
                const isActive = activeFilters.includes(filter.value)
                return (
                    <button
                        key={filter.value}
                        onClick={() => onToggle(filter.value)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all group ${isActive
                                ? 'bg-primary/20 border-primary/50 text-white shadow-lg shadow-primary/10'
                                : 'border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 text-gray-300 hover:text-white'
                            }`}
                    >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-primary/70 group-hover:text-primary'}`} />
                        <span>{filter.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
