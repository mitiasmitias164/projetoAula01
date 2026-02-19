import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MinimalHeader } from '../components/layout/MinimalHeader'
import { FullscreenHero } from '../components/landing/FullscreenHero'
import { InteractiveCarousel } from '../components/landing/InteractiveCarousel'

export default function LandingPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const handleCtaClick = () => {
        if (user) {
            navigate(user.role === 'GESTOR' ? '/gestor' : '/turmas')
        } else {
            navigate('/signup')
        }
    }

    return (
        <div className="min-h-screen bg-background text-gray-100 flex flex-col">
            <MinimalHeader />
            
            <main className="flex-grow">
                <FullscreenHero onCtaClick={handleCtaClick} />
                
                <InteractiveCarousel />

                {/* Final CTA Section */}
                <section className="py-20 lg:py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#00e1ff15,transparent_70%)]" />
                    
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-gradient-to-br from-secondary to-background rounded-3xl p-8 md:p-16 text-center border border-primary/20 shadow-2xl shadow-primary/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                                
                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                                        Pronto para transformar<br />
                                        sua gestão educacional?
                                    </h2>
                                    <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                                        Junte-se a professores e gestores que já estão modernizando suas rotinas com inteligência artificial
                                    </p>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="px-10 py-4 bg-primary text-background font-bold text-lg rounded-xl hover:bg-primary-400 transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105"
                                    >
                                        Criar Conta Gratuita
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-background border-t border-white/10 py-12 relative">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 rounded-full border-2 border-primary/50 flex items-center justify-center bg-primary/10">
                                <span className="font-bold text-primary">IA</span>
                            </div>
                            <span className="font-bold text-lg">ProgramaAulas</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            © {new Date().getFullYear()} ProgramaAulas. Todos os direitos reservados.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
