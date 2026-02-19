import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { turmaService as turmasAPI } from '@/services/turma'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    FileText,
    CheckCircle,
    ArrowLeft,
    Share2,
    Download,
    AlertCircle,
    Linkedin,
    Instagram,
    Star
} from 'lucide-react'
import { EvaluationModal } from '@/components/classes/EvaluationModal'


export default function ClassPublicDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()
    const [turma, setTurma] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null)
    const [showEvaluationModal, setShowEvaluationModal] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (id && !authLoading) {
            loadClassDetails()
        }
    }, [id, authLoading, user])

    const loadClassDetails = async () => {
        try {
            setLoading(true)
            const data = user
                ? await turmasAPI.getDetails(id!)
                : await turmasAPI.getPublicDetails(id!)
            setTurma(data)
        } catch (err) {
            console.error('Erro ao carregar turma:', err)
            setError('Turma não encontrada ou erro ao carregar informações.')
        } finally {
            setLoading(false)
        }
    }

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login')
            return
        }

        if (!turma) return

        try {
            setEnrolling(true)
            const result = await turmasAPI.enroll(turma.id, user.id)

            if (result.success) {
                // Reload to update status
                await loadClassDetails()
                alert('Inscrição realizada com sucesso!')
            } else {
                alert(result.message || 'Não foi possível realizar a inscrição')
            }
        } catch (error) {
            console.error('Erro na inscrição:', error)
            alert('Erro ao realizar inscrição. Tente novamente.')
        } finally {
            setEnrolling(false)
        }
    }

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !turma) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-2xl font-bold mb-4">Ops!</h1>
                <p className="text-gray-400 mb-6">{error || 'Turma não encontrada.'}</p>
                <Button onClick={() => navigate('/turmas')} variant="outline">
                    Voltar para Lista
                </Button>
            </div>
        )
    }

    const isEnrolled = turma.inscricoes?.some((i: any) => i.user.id === user?.id && i.status === 'ATIVA')
    const vagasDisponiveis = turma.capacidade - (turma.inscricoes?.filter((i: any) => i.status === 'ATIVA').length || 0)
    const isLotada = vagasDisponiveis <= 0
    const dataLimiteEfetiva = turma.data_limite_inscricao || turma.data
    const classDate = new Date(turma.data)
    const now = new Date()
    // Class is concluded if current time is past class date OR explicitly marked as CONCLUIDA
    // "Se a Data Atual for maior que a Data do Evento" OU "Status = CONCLUIDA"
    const isConcluded = now > classDate || turma.status === 'CONCLUIDA'
    const isPrazoEncerrado = new Date(dataLimiteEfetiva) < new Date(now.toDateString())

    // Evaluation Logic
    // User must be present to evaluate
    const isPresent = turma.presencas?.some((p: any) => p.user_id === user?.id && p.presente)
    // User must not have evaluated yet
    const hasEvaluated = turma.avaliacoes?.some((a: any) => a.user_id === user?.id)
    const canEvaluate = isConcluded && isPresent && !hasEvaluated

    return (
        <div className="min-h-screen bg-background text-white pb-20">
            {/* Container for Content */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/turmas')}
                    className="mb-6 text-gray-300 hover:text-white pl-0 hover:bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Turmas
                </Button>

                {/* Hero Image Banner */}
                <div className="relative h-[400px] w-full rounded-3xl overflow-hidden mb-8 shadow-2xl border border-white/10 group">
                    {turma.foto_capa ? (
                        <img
                            src={turma.foto_capa}
                            alt={turma.nome}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary to-background" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>

                {/* Header Content (Below Image) */}
                <div className="mb-12">
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                            {turma.campus?.nome || 'Campus'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${turma.status === 'ABERTA'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : turma.status === 'CONCLUIDA'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            {turma.status}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        {turma.nome || 'Nome da Turma Indisponível'}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-gray-300 text-base md:text-lg border-t border-white/10 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <span>{new Date(turma.data).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                                <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <span>{turma.hora_inicio?.slice(0, 5)} - {turma.hora_fim?.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <span>{turma.local}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* About Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-8 h-1 bg-primary rounded-full"></span>
                                Sobre a Turma
                            </h2>
                            <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {turma.sobre || 'Nenhuma descrição disponível para esta turma.'}
                            </div>
                        </section>

                        {/* Speakers Section */}
                        {turma.speakers && turma.speakers.length > 0 && (() => {
                            // Deduplicate speakers just in case
                            const uniqueSpeakers = Array.from(new Map(turma.speakers.map((s: any) => [s.id, s])).values()) as any[]
                            console.log('Rendering speakers:', uniqueSpeakers)

                            return (
                                <section className="bg-secondary/30 rounded-2xl p-8 border border-white/5">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        Palestrantes & Convidados
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {uniqueSpeakers.map((speaker: any) => (
                                            <div
                                                key={speaker.id}
                                                onClick={() => setSelectedSpeaker(speaker)}
                                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer group"
                                            >
                                                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                                                    {speaker.avatar_url ? (
                                                        <img src={speaker.avatar_url} alt={speaker.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-primary font-bold text-lg">{speaker.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-white text-lg group-hover:text-primary transition-colors">{speaker.name}</p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        Ver perfil completo
                                                        <ArrowLeft className="w-3 h-3 rotate-180" />
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )
                        })()}

                        {/* Schedule / Material Section */}
                        {turma.pdf_url && (
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="w-8 h-1 bg-primary rounded-full"></span>
                                    Material de Apoio
                                </h2>
                                <div className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-2xl p-1 border border-white/10">
                                    <div className="bg-background/50 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">Cronograma Completo</h3>
                                                <p className="text-sm text-gray-400">Baixe o PDF com todos os detalhes do evento</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => window.open(turma.pdf_url, '_blank')}
                                            className="flex items-center gap-2 min-w-[200px]"
                                            variant="outline"
                                        >
                                            <Download className="w-4 h-4" />
                                            Baixar PDF
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <div className="relative">
                        <div className="sticky top-8 space-y-6">
                            {/* Enrollment Card */}
                            <div className="bg-secondary/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                                <h3 className="text-xl font-bold text-white mb-6">Inscrição</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Vagas Totais</span>
                                        <span className="text-white font-medium">{turma.capacidade}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Disponíveis</span>
                                        <span className={`font-bold ${isLotada ? 'text-red-400' : 'text-green-400'}`}>
                                            {vagasDisponiveis}
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${isLotada ? 'bg-red-500' : 'bg-primary'}`}
                                            style={{ width: `${Math.min(100, (1 - vagasDisponiveis / turma.capacidade) * 100)}%` }}
                                        ></div>
                                    </div>

                                    {/* Deadline Info */}
                                    {turma.data_limite_inscricao && (
                                        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${isPrazoEncerrado
                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                                {isPrazoEncerrado
                                                    ? `Inscrições encerradas em ${new Date(turma.data_limite_inscricao).toLocaleDateString()}`
                                                    : `Inscrições até ${new Date(turma.data_limite_inscricao).toLocaleDateString()}`
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {isEnrolled ? (
                                    <div className="w-full py-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center gap-2 text-green-400 font-bold mb-4">
                                        <CheckCircle className="w-5 h-5" />
                                        Inscrição Confirmada
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                        <Button
                                            className="relative w-full py-8 text-xl font-bold shadow-2xl shadow-green-500/20 bg-gradient-to-r from-green-500 to-emerald-600 hover:to-green-500 border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-white"
                                            onClick={handleEnroll}
                                            disabled={enrolling || isLotada || isPrazoEncerrado || turma.status !== 'ABERTA'}
                                            isLoading={enrolling}
                                        >
                                            {isLotada ? (
                                                'Vagas Esgotadas'
                                            ) : isPrazoEncerrado ? (
                                                'Prazo de Inscrição Encerrado'
                                            ) : !user ? (
                                                <span className="flex items-center gap-3">
                                                    Fazer login para se inscrever
                                                    <CheckCircle className="w-6 h-6" />
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-3">
                                                    Inscrever-se Agora
                                                    <CheckCircle className="w-6 h-6 animate-pulse" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* Evaluation Button */}
                                {canEvaluate && (
                                    <div className="mt-4">
                                        <Button
                                            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:to-yellow-500 text-white shadow-lg shadow-yellow-500/20 animate-pulse"
                                            onClick={() => setShowEvaluationModal(true)}
                                        >
                                            <Star className="w-5 h-5 mr-2" />
                                            Avaliar Turma
                                        </Button>
                                    </div>
                                )}

                                {hasEvaluated && (
                                    <div className="mt-4 w-full py-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center justify-center gap-2 text-yellow-500 font-bold">
                                        <Star className="w-5 h-5 fill-current" />
                                        Avaliação Enviada
                                    </div>
                                )}

                                <p className="text-center text-xs text-gray-500 mt-4">
                                    Ao se inscrever, você concorda com os termos de participação.
                                </p>
                            </div>

                            {/* Share Card */}
                            <div className="bg-secondary/30 rounded-2xl p-6 border border-white/5">
                                <h4 className="font-medium text-white mb-4">Compartilhar</h4>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-white/10 hover:bg-white/5"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href)
                                            alert('Link copiado!')
                                        }}
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Copiar Link
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Speaker Details Modal */}
            <Modal
                isOpen={!!selectedSpeaker}
                onClose={() => setSelectedSpeaker(null)}
                title="Sobre o Palestrante"
            >
                {selectedSpeaker && (
                    <div className="relative">
                        {/* Decorative Background Header */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-t-3xl -mt-6 -mx-6"></div>

                        <div className="relative flex flex-col items-center text-center pt-12">
                            {/* Avatar with ring */}
                            <div className="relative mb-6 group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative w-32 h-32 rounded-full bg-background flex items-center justify-center overflow-hidden ring-4 ring-background">
                                    {selectedSpeaker.avatar_url ? (
                                        <img
                                            src={selectedSpeaker.avatar_url}
                                            alt={selectedSpeaker.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                                            <span className="text-4xl font-bold text-primary">{selectedSpeaker.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name and Role (if we had role) */}
                            <h3 className="text-3xl font-bold text-white mb-2">{selectedSpeaker.name}</h3>
                            <div className="h-1 w-12 bg-primary/50 rounded-full mb-6"></div>

                            {/* Social Media Links */}
                            <div className="flex items-center gap-4 mb-8">
                                {selectedSpeaker.linkedin_url && (
                                    <a
                                        href={selectedSpeaker.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-full bg-white/5 hover:bg-[#0077b5]/20 text-gray-400 hover:text-[#0077b5] border border-white/10 hover:border-[#0077b5]/50 transition-all duration-300 group"
                                        title="LinkedIn"
                                    >
                                        <Linkedin className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                    </a>
                                )}
                                {selectedSpeaker.instagram_url && (
                                    <a
                                        href={selectedSpeaker.instagram_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-full bg-white/5 hover:bg-[#E1306C]/20 text-gray-400 hover:text-[#E1306C] border border-white/10 hover:border-[#E1306C]/50 transition-all duration-300 group"
                                        title="Instagram"
                                    >
                                        <Instagram className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                    </a>
                                )}
                            </div>

                            {/* Bio Section */}
                            <div className="w-full text-left">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    Sobre
                                </h4>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner">
                                    {selectedSpeaker.bio ? (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-base">
                                                {selectedSpeaker.bio}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-center py-4">
                                            Nenhuma biografia disponível.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Evaluation Modal */}
            {turma && user && (
                <EvaluationModal
                    isOpen={showEvaluationModal}
                    onClose={() => setShowEvaluationModal(false)}
                    turmaId={turma.id}
                    userId={user.id}
                    onSuccess={() => {
                        loadClassDetails()
                        alert('Avaliação enviada com sucesso!')
                    }}
                />
            )}
        </div>
    )
}
