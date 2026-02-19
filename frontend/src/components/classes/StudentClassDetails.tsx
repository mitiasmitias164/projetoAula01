import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Calendar, Clock, MapPin, Users, FileText, User } from 'lucide-react'
import type { TurmaDisponivel } from '@backend/types/database.types'

interface StudentClassDetailsProps {
    turma: TurmaDisponivel | null
    isOpen: boolean
    onClose: () => void
    onEnroll: (turmaId: string) => void
    enrolling: boolean
}

export function StudentClassDetails({ turma, isOpen, onClose, onEnroll, enrolling }: StudentClassDetailsProps) {
    if (!turma) return null

    // Determine shift based on hour if not explicit, though we might want to carry over that logic
    const hour = parseInt(turma.hora_inicio.split(':')[0])
    let turno = 'Noite'
    if (hour < 12) turno = 'Manhã'
    else if (hour < 18) turno = 'Tarde'

    // Parse speakers if it's a JSON string, otherwise use as is
    let speakers: string[] = []
    if (turma.palestrantes) {
        try {
            // Try parsing as JSON array
            const parsed = JSON.parse(turma.palestrantes)
            if (Array.isArray(parsed)) speakers = parsed
            else speakers = [turma.palestrantes]
        } catch (e) {
            // Split by comma if simple string
            speakers = turma.palestrantes.split(',').map(s => s.trim())
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Turma"
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Information */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {turma.nome || `Turma de IA - ${turno}`}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-gray-300">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(turma.data).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{turma.hora_inicio.slice(0, 5)} - {turma.hora_fim.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{turma.local} (`{turma.campus_nome}`)</span>
                        </div>
                    </div>
                </div>

                {/* About Selection */}
                {turma.sobre && (
                    <div className="bg-secondary/30 p-4 rounded-xl border border-white/5">
                        <h3 className="text-lg font-semibold text-white mb-2">Sobre a Turma</h3>
                        <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                            {turma.sobre}
                        </p>
                    </div>
                )}

                {/* Speakers */}
                {speakers.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Palestrantes / Convidados
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {speakers.map((speaker, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-secondary/30 p-3 rounded-lg border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {speaker.charAt(0)}
                                    </div>
                                    <span className="text-gray-200">{speaker}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-white font-medium">Vagas Disponíveis:</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${turma.vagas_disponiveis > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {turma.vagas_disponiveis} vagas
                    </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    {turma.pdf_url && (
                        <Button
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={() => window.open(turma.pdf_url, '_blank')}
                        >
                            <FileText className="w-4 h-4" />
                            Ver Cronograma (PDF)
                        </Button>
                    )}

                    <Button
                        className="flex-1"
                        onClick={() => onEnroll(turma.id)}
                        isLoading={enrolling}
                        disabled={turma.vagas_disponiveis === 0}
                    >
                        {turma.vagas_disponiveis === 0 ? 'Lotada' : 'Confirmar Inscrição'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
