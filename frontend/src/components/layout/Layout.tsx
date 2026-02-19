import { type ReactNode } from 'react'
import { Header } from './Header'

interface LayoutProps {
    children: ReactNode
    fullWidth?: boolean
}

export function Layout({ children, fullWidth = false }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className={`${fullWidth ? 'w-full max-w-[1920px] mx-auto' : 'container mx-auto'} px-4 py-8 flex-grow`}>
                {children}
            </main>
            <footer className="border-t border-white/10 mt-auto">
                <div className="container mx-auto px-4 py-6">
                    <p className="text-center text-sm text-gray-400">
                        © 2026 Sistema de Gestão de Turmas de IA. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    )
}
