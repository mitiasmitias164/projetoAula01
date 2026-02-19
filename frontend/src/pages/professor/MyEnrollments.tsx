import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, AlertCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { inscricoesAPI } from '@backend/api/inscricoes'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime } from '@/utils/formatters'

// Updated interface to match get_user_inscricoes RPC return structure
interface MyEnrollment {
    inscricao_id: string
    turma_id: string
    campus_nome: string
    data: string
    hora_inicio: string
    hora_fim: string
    local: string
    status: 'ATIVA' | 'CANCELADA'
    created_at: string
}

export default function MyEnrollments() {
    const { user } = useAuth()
    const [enrollments, setEnrollments] = useState<MyEnrollment[]>([])
    const [loading, setLoading] = useState(true)
    const [canceling, setCanceling] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        if (user) {
            loadEnrollments()
        }
    }, [user])

    async function loadEnrollments() {
        if (!user) return
        try {
            setLoading(true)
            const data = await inscricoesAPI.getByUser(user.id)
            console.log('Enrollments data:', data)
            setEnrollments(data)
        } catch (error) {
            console.error('Erro ao carregar inscrições:', error)
            setMessage({ type: 'error', text: 'Não foi possível carregar suas inscrições.' })
        } finally {
            setLoading(false)
        }
    }

    async function handleCancel(inscricaoId: string) {
        if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) return

        setCanceling(inscricaoId)
        setMessage(null)

        try {
            await inscricoesAPI.cancel(inscricaoId)
            setMessage({ type: 'success', text: 'Inscrição cancelada com sucesso.' })
            // Refresh list
            loadEnrollments()
        } catch (error) {
            console.error('Erro ao cancelar:', error)
            setMessage({ type: 'error', text: 'Erro ao cancelar inscrição.' })
        } finally {
            setCanceling(null)
        }
    }

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

    // Filter out canceled enrollments
    const activeEnrollments = enrollments.filter(e => e.status === 'ATIVA')
    const canceledEnrollments = enrollments.filter(e => e.status === 'CANCELADA')

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Minhas Inscrições
                </h1>
                <p className="text-gray-400 text-lg">
                    Gerencie suas presenças e acompanhe seu histórico
                </p>
            </div>

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

            {activeEnrollments.length === 0 && canceledEnrollments.length === 0 ? (
                <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-white/5 border-dashed">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-2xl mb-6 border border-white/10">
                        <Calendar className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Nenhuma inscrição encontrada
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Você ainda não se inscreveu em nenhuma turma.
                    </p>
                    <Link to="/turmas">
                        <Button variant="primary">
                            Explorar Turmas
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeEnrollments.map((inscricao, index) => (
                        <Card
                            key={inscricao.inscricao_id || index}
                            className="group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
                        >
                            <CardBody className="p-6 space-y-4">
                                {/* Header with Campus and Status */}
                                <div className="flex justify-between items-start">
                                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                                        {inscricao.campus_nome || 'Campus'}
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                                        CONFIRMADO
                                    </span>
                                </div>

                                {/* Class Info */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        Turma de IA
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Inscrição #{inscricao.inscricao_id?.slice(0, 8) || 'N/A'}
                                    </p>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <Calendar className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Data</span>
                                            <span className="text-sm font-medium">{formatDate(inscricao.data)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <Clock className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Horário</span>
                                            <span className="text-sm font-medium">
                                                {formatTime(inscricao.hora_inicio)} - {formatTime(inscricao.hora_fim)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <MapPin className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Local</span>
                                            <span className="text-sm font-medium">{inscricao.local}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4">
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                                        onClick={() => handleCancel(inscricao.inscricao_id)}
                                        isLoading={canceling === inscricao.inscricao_id}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancelar Inscrição
                                    </Button>
                                    <p className="text-xs text-center text-gray-500 mt-2">
                                        Cancelamento permitido até 24h antes
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* History Section (Canceled) */}
            {canceledEnrollments.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-gray-500" />
                        Histórico / Canceladas
                    </h2>
                    <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {canceledEnrollments.map((inscricao, index) => (
                                <Card key={inscricao.inscricao_id || index} className="border-white/5 bg-secondary/20">
                                    <CardBody className="p-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-400">{inscricao.campus_nome}</span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">CANCELADA</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatDate(inscricao.data)} • {formatTime(inscricao.hora_inicio)}
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
