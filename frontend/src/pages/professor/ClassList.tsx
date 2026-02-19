import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { turmasAPI } from '@backend/api/turmas'


import { ViewSwitcher } from '@/components/classes/ViewSwitcher'
import { ClassGrid } from '@/components/classes/ClassGrid'
import { MapView } from '@/components/classes/MapView'
import { QuickFilters, type QuickFilterValue } from '@/components/classes/QuickFilters'
import type { TurmaDisponivel } from '@backend/types/database.types'

type ViewType = 'grid' | 'map' | 'list'

export default function ClassList() {
    const [turmas, setTurmas] = useState<TurmaDisponivel[]>([])
    const [loading, setLoading] = useState(true)

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [currentView, setCurrentView] = useState<ViewType>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilters, setActiveFilters] = useState<QuickFilterValue[]>([])

    useEffect(() => {
        loadTurmas()
    }, [])

    async function loadTurmas() {
        try {
            const data = await turmasAPI.getAvailable()
            setTurmas(data)
        } catch (error) {
            console.error('Erro ao carregar turmas:', error)
            setMessage({ type: 'error', text: 'Erro ao carregar turmas disponíveis' })
        } finally {
            setLoading(false)
        }
    }

    const handleToggleFilter = useCallback((filter: QuickFilterValue) => {
        setActiveFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        )
    }, [])

    const filteredTurmas = turmas.filter(turma => {
        // Text search
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase()
            const matchesSearch =
                turma.campus_nome.toLowerCase().includes(searchLower) ||
                (turma.nome && turma.nome.toLowerCase().includes(searchLower)) ||
                (turma.local && turma.local.toLowerCase().includes(searchLower))
            if (!matchesSearch) return false
        }

        // Quick filters
        if (activeFilters.length > 0) {
            // Time-of-day filters (morning/afternoon/night) are OR-combined
            const timeFilters = activeFilters.filter(f => f === 'morning' || f === 'afternoon' || f === 'night')
            if (timeFilters.length > 0) {
                const hour = parseInt(turma.hora_inicio.split(':')[0])
                const matchesTime = timeFilters.some(f => {
                    if (f === 'morning') return hour >= 6 && hour < 12
                    if (f === 'afternoon') return hour >= 12 && hour < 18
                    if (f === 'night') return hour >= 18 || hour < 6
                    return false
                })
                if (!matchesTime) return false
            }

            // "Com vagas" filter
            if (activeFilters.includes('available')) {
                if (turma.vagas_disponiveis <= 0) return false
            }
        }

        return true
    })



    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Descubra Turmas
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Explore turmas por localização e disponibilidade
                    </p>
                </div>

                <ViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                />
            </div>

            {/* Success/Error Messages */}
            {message && (
                <div
                    className={`p-4 rounded-xl border backdrop-blur-sm animate-slide-up ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por campus, data ou localização..."
                    className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
                />
            </div>

            {/* Quick Filters */}
            <QuickFilters activeFilters={activeFilters} onToggle={handleToggleFilter} />

            {/* Content Based on View */}
            {currentView === 'grid' && (
                <ClassGrid
                    turmas={filteredTurmas}
                    enrolling={null}
                />
            )}

            {currentView === 'map' && (
                <div className="grid lg:grid-cols-[1fr,400px] gap-8">
                    <ClassGrid
                        turmas={filteredTurmas}
                        enrolling={null}
                    />
                    <MapView />
                </div>
            )}

            {currentView === 'list' && (
                <div className="bg-secondary border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Campus</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Data</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Horário</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Local</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vagas</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {turmas.map((turma) => (
                                    <tr key={turma.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{turma.campus_nome}</td>
                                        <td className="px-6 py-4 text-gray-300">{new Date(turma.data).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 text-gray-300">{turma.hora_inicio.slice(0, 5)} - {turma.hora_fim.slice(0, 5)}</td>
                                        <td className="px-6 py-4 text-gray-300">{turma.local}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${turma.vagas_disponiveis > 0
                                                ? 'bg-primary/10 text-primary border border-primary/20'
                                                : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                }`}>
                                                {turma.vagas_disponiveis} {turma.vagas_disponiveis === 1 ? 'vaga' : 'vagas'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => window.open(`/turmas/${turma.id}`, '_blank')}
                                                disabled={turma.vagas_disponiveis === 0}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${turma.vagas_disponiveis === 0
                                                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                                    : 'bg-primary text-background hover:bg-primary-400 shadow-lg shadow-primary/20'
                                                    }`}
                                            >
                                                {turma.vagas_disponiveis === 0 ? 'Lotada' : 'Ver Detalhes'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {turmas.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-2xl mb-6 border border-white/10">
                        <Search className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Nenhuma turma disponível
                    </h3>
                    <p className="text-gray-500">
                        Novas turmas serão adicionadas em breve
                    </p>
                </div>
            )}
        </div>
    )
}

