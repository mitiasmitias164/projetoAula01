import { useState } from 'react'
import { cn } from '@/utils/formatters'

interface Tab {
    id: string
    label: string
    content: React.ReactNode
}

interface TabsProps {
    tabs: Tab[]
    defaultTab?: string
    className?: string
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id)

    return (
        <div className={cn("w-full", className)}>
            <div className="flex space-x-1 rounded-xl bg-secondary/30 p-1 mb-6 border border-white/5">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200",
                            "focus:outline-none focus:ring-2 ring-primary/50",
                            activeTab === tab.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {tabs.find(t => t.id === activeTab)?.content}
            </div>
        </div>
    )
}
