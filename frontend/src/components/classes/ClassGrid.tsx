import { Calendar, Clock, MapPin, Users, CalendarCheck } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime } from '@/utils/formatters'
import type { TurmaDisponivel } from '@backend/types/database.types'

interface ClassGridProps {
    turmas: TurmaDisponivel[]
    enrolling: string | null
}

export function ClassGrid({ turmas, enrolling }: Omit<ClassGridProps, 'onViewDetails'>) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turmas.map((turma) => (
                <Card
                    key={turma.id}
                    className="group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                >
                    {/* Cover Image */}
                    <div className="relative h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary overflow-hidden">
                        {turma.foto_capa ? (
                            <img
                                src={turma.foto_capa}
                                alt={turma.nome || 'Capa da Turma'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,225,255,0.1),transparent_70%)]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-12 h-12 text-primary/40 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 font-mono">Presencial</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Vacancy Badge */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-white/10 shadow-lg">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-semibold text-white">
                                {turma.vagas_disponiveis} vagas
                            </span>
                        </div>
                    </div>

                    <CardBody className="p-6 space-y-4">
                        {/* Campus Badge */}
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                            {turma.campus_nome}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                            {turma.nome || `Turma de IA - ${new Date(turma.data).getHours() < 12 ? 'Manhã' : new Date(turma.data).getHours() < 18 ? 'Tarde' : 'Noite'}`}
                        </h3>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                                <Calendar className="w-4 h-4 text-primary/70" />
                                <span>{formatDate(turma.data)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Clock className="w-4 h-4 text-primary/70" />
                                <span>{formatTime(turma.hora_inicio)} - {formatTime(turma.hora_fim)}</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300">
                                <MapPin className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{turma.local}</span>
                            </div>
                            {(() => {
                                const deadlineDate = turma.data_limite_inscricao || turma.data
                                const isPast = new Date(deadlineDate) < new Date(new Date().toDateString())
                                return (
                                    <div className={`flex items-center gap-2 ${isPast ? 'text-red-400' : 'text-yellow-400'}`}>
                                        <CalendarCheck className={`w-4 h-4 ${isPast ? 'text-red-400/70' : 'text-yellow-400/70'}`} />
                                        <span>
                                            Inscrições até {formatDate(deadlineDate)}
                                            {isPast && ' (Encerrada)'}
                                        </span>
                                    </div>
                                )
                            })()}
                        </div>

                        {/* Action Button */}
                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                className="w-full group/btn"
                                onClick={() => window.open(`/turmas/${turma.id}`, '_blank')}
                                disabled={enrolling !== null}
                            >
                                Ver Detalhes
                                <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    )
}
