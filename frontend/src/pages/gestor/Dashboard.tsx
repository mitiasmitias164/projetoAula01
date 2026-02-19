import { useState } from 'react'
import { CampusManager } from '@/components/gestor/CampusManager'
import { TurmaManager } from '@/components/gestor/TurmaManager'
import { GlobalSpeakersManager } from '@/components/gestor/GlobalSpeakersManager'
import { Building2, Users, GraduationCap, LayoutDashboard } from 'lucide-react'

type ActiveTab = 'campus' | 'turmas' | 'speakers'

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('campus')

    const menuItems = [
        {
            id: 'campus',
            label: 'Gerenciar Campus',
            icon: Building2,
            component: <CampusManager />
        },
        {
            id: 'turmas',
            label: 'Gerenciar Turmas',
            icon: GraduationCap,
            component: <TurmaManager />
        },
        {
            id: 'speakers',
            label: 'Gerenciar Palestrantes',
            icon: Users,
            component: <GlobalSpeakersManager />
        }
    ] as const

    return (
        <div className="w-full">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <LayoutDashboard className="w-8 h-8 text-primary" />
                    Painel do Gestor
                </h1>
                <p className="text-gray-400 mt-2">
                    Gerencie campus, turmas e palestrantes do sistema.
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="flex flex-col gap-2">
                        {menuItems.map((item) => {
                            const isActive = activeTab === item.id
                            const Icon = item.icon

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as ActiveTab)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-primary/20 text-primary border border-primary/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 min-h-[500px]">
                    {menuItems.map((item) => (
                        <div key={item.id} className={activeTab === item.id ? 'block animate-fadeIn' : 'hidden'}>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <item.icon className="w-6 h-6 text-primary" />
                                {item.label}
                            </h2>
                            {item.component}
                        </div>
                    ))}
                </main>
            </div>
        </div>
    )
}
