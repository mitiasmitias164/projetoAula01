import { useState } from 'react'
import { ChevronLeft, ChevronRight, Users, BarChart3, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const features = [
    {
        icon: Users,
        iconColor: 'text-primary',
        title: 'Gestão Inteligente de Turmas',
        description: 'Acompanhe todas as turmas em tempo real. Visualize métricas de desempenho, presença e engajamento em dashboards interativos.',
        benefits: [
            'Dashboard em tempo real',
            'Relatórios automatizados',
            'Alertas inteligentes'
        ],
        mockup: 'Dashboard Analytics'
    },
    {
        icon: BarChart3,
        iconColor: 'text-green-400',
        title: 'Análises e Relatórios Avançados',
        description: 'Tome decisões baseadas em dados concretos. Gere relatórios detalhados sobre desempenho, frequência e progresso dos alunos.',
        benefits: [
            'Métricas em tempo real',
            'Exportação de dados',
            'Insights automáticos'
        ],
        mockup: 'Reports & Analytics'
    },
    {
        icon: Clock,
        iconColor: 'text-purple-400',
        title: 'Automação que Economiza Tempo',
        description: 'Automatize tarefas repetitivas e foque no que realmente importa: o ensino e aprendizado dos alunos.',
        benefits: [
            'Agendamento automático',
            'Notificações inteligentes',
            'Integração com calendários'
        ],
        mockup: 'Automation Tools'
    }
]

export function InteractiveCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0)

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % features.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + features.length) % features.length)
    }

    const feature = features[currentSlide]
    const Icon = feature.icon

    return (
        <section id="features-carousel" className="py-20 lg:py-32 bg-secondary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,191,255,0.12),transparent_50%)]" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Soluções Completas
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Navegue pelas funcionalidades que transformam a gestão educacional
                    </p>
                </div>

                {/* Carousel Navigation Dots */}
                <div className="flex justify-center gap-2 mb-12">
                    {features.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === currentSlide
                                    ? 'w-12 bg-primary'
                                    : 'w-8 bg-white/20 hover:bg-white/30'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Carousel Content */}
                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Mockup/Visual */}
                    <div className="order-2 lg:order-1">
                        <div className="relative bg-gradient-to-br from-secondary to-background border border-white/10 rounded-2xl p-8 shadow-2xl h-80 flex items-center justify-center group hover:border-primary hover:shadow-[0_0_30px_rgba(0,212,255,0.15)] transition-all duration-500">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,191,255,.08)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer rounded-2xl" />
                            <div className="text-center relative z-10">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4 ${feature.iconColor} group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-500`}>
                                    <Icon className="w-10 h-10" />
                                </div>
                                <p className="text-gray-500 text-sm font-mono group-hover:text-primary/80 transition-colors">
                                    [{feature.mockup}]
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="order-1 lg:order-2 space-y-6">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 ${feature.iconColor} shadow-[0_0_15px_rgba(0,212,255,0.1)]`}>
                            <Icon className="w-8 h-8" />
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-white">
                            {feature.title}
                        </h3>

                        <p className="text-gray-400 text-lg leading-relaxed">
                            {feature.description}
                        </p>

                        <ul className="space-y-3">
                            {feature.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(0,212,255,0.8)]" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            variant="outline"
                            className="border-primary/30 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:text-primary group transition-all duration-300"
                        >
                            Saiba Mais
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex justify-center gap-4 mt-12">
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 rounded-full border-2 border-white/10 hover:border-primary/50 hover:bg-primary/10 flex items-center justify-center text-white transition-all group"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 rounded-full border-2 border-white/10 hover:border-primary/50 hover:bg-primary/10 flex items-center justify-center text-white transition-all group"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    )
}
