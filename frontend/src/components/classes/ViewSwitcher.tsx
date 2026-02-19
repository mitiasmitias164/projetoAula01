import { LayoutGrid, List } from 'lucide-react'

type ViewType = 'grid' | 'list'

interface ViewSwitcherProps {
    currentView: ViewType
    onViewChange: (view: ViewType) => void
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    const views: { type: ViewType; icon: typeof LayoutGrid; label: string }[] = [
        { type: 'grid', icon: LayoutGrid, label: 'Grid' },
        { type: 'list', icon: List, label: 'Lista' }
    ]

    return (
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-secondary border border-white/10">
            {views.map(({ type, icon: Icon, label }) => (
                <button
                    key={type}
                    onClick={() => onViewChange(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === type
                        ? 'bg-primary text-background shadow-lg shadow-primary/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    )
}
