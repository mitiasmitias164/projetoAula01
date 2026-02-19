import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AnimatedBackground } from './AnimatedBackground'

interface FullscreenHeroProps {
    onCtaClick: () => void
}

export function FullscreenHero({ onCtaClick }: FullscreenHeroProps) {
    return (
        <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
            <AnimatedBackground />

            <div className="container mx-auto px-4 py-20 lg:py-32 text-center max-w-5xl relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 backdrop-blur-sm animate-fade-in-up">
                    <Sparkles className="w-4 h-4" />
                    <span>Powered by Tinkery AI</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 text-white leading-tight animate-fade-in-up">
                    Transforme a gestão<br />
                    <span
                        className="inline-block pb-1"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #00D4FF, #4de1ff, #00D4FF)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        educacional com IA
                    </span>

                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Automatize processos, economize tempo e melhore resultados com inteligência artificial aplicada à educação
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={onCtaClick}
                        className="w-full sm:w-auto group shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] hover:bg-primary-400 border border-primary/50 transition-all duration-300"
                    >
                        Começar Agora
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto border-2 border-white/20 hover:border-primary hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all duration-300"
                        onClick={() => {
                            const carousel = document.getElementById('features-carousel')
                            carousel?.scrollIntoView({ behavior: 'smooth' })
                        }}
                    >
                        Ver Demo
                    </Button>
                </div>

                {/* Trust indicators */}
                <div className="mt-16 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <p className="text-sm text-gray-500 mb-4">Confiado por instituições de ensino</p>
                    <div className="flex items-center justify-center gap-8 flex-wrap">
                        <div className="text-gray-600 font-semibold text-sm px-4 py-2 border border-white/5 rounded-lg bg-white/5">
                            500+ Professores
                        </div>
                        <div className="text-gray-600 font-semibold text-sm px-4 py-2 border border-white/5 rounded-lg bg-white/5">
                            10k+ Alunos
                        </div>
                        <div className="text-gray-600 font-semibold text-sm px-4 py-2 border border-white/5 rounded-lg bg-white/5">
                            95% Satisfação
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
