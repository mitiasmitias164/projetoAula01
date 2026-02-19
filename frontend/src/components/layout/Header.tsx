import { useState } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { ProfileEditModal } from '@/components/profile/ProfileEditModal'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <>
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-background">
                                <span className="font-bold text-lg">IA</span>
                            </div>
                            <span className="ml-3 text-xl font-bold text-white hidden sm:inline">
                                Gestão de Turmas IA
                            </span>
                        </Link>

                        {/* Desktop: User Profile */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-6">
                                    {user.role !== 'GESTOR' && (
                                        <nav className="flex items-center gap-4">
                                            <Link
                                                to="/minhas-inscricoes"
                                                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                            >
                                                Minhas Inscrições
                                            </Link>
                                        </nav>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setShowProfile(true)}
                                            className="text-right hover:opacity-80 transition-opacity cursor-pointer"
                                            title="Editar perfil"
                                        >
                                            <p className="text-sm font-medium text-white">
                                                {user.nome}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {user.role === 'GESTOR' ? 'Gestor' : 'Professor'}
                                            </p>
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowProfile(true)}
                                                className="p-2 rounded-full bg-secondary border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                                title="Editar perfil"
                                            >
                                                <User className="w-5 h-5 text-gray-300" />
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                                title="Sair"
                                            >
                                                <LogOut className="w-5 h-5 text-gray-400 hover:text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-white/10 rounded-lg transition-colors hover:bg-white/5"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-4 py-2 text-sm font-medium text-background bg-primary hover:bg-primary-600 rounded-lg transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile: Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 text-gray-300" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-white/10 bg-secondary">
                        <div className="px-4 py-3 space-y-2">
                            {user ? (
                                <>
                                    <div className="pb-2 border-b border-white/10">
                                        <p className="text-sm font-medium text-white">{user.nome}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                        <p className="text-xs text-gray-500">
                                            {user.role === 'GESTOR' ? 'Gestor' : 'Professor'}
                                        </p>
                                    </div>

                                    {user.role !== 'GESTOR' && (
                                        <Link
                                            to="/minhas-inscricoes"
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg"
                                        >
                                            Minhas Inscrições
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleSignOut}
                                        className="w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Link
                                        to="/login"
                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="block px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg font-medium"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <ProfileEditModal
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
            />
        </>
    )
}
