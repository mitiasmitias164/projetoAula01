import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Star } from 'lucide-react'
import { turmaService } from '@/services/turma'

interface EvaluationModalProps {
    isOpen: boolean
    onClose: () => void
    turmaId: string
    userId: string
    onSuccess: () => void
}

const CRITERIA = [
    { id: 'conteudo', label: 'Conteúdo' },
    { id: 'didatica', label: 'Didática do Palestrante' },
    { id: 'clareza', label: 'Clareza na Explicação' },
    { id: 'dominio', label: 'Domínio do Assunto' },
    { id: 'material', label: 'Material de Apoio' }
]

export function EvaluationModal({ isOpen, onClose, turmaId, userId, onSuccess }: EvaluationModalProps) {
    const [ratings, setRatings] = useState<Record<string, number>>({})
    const [nps, setNps] = useState<number | null>(null)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleRating = (criteriaId: string, value: number) => {
        setRatings(prev => ({ ...prev, [criteriaId]: value }))
    }

    const isValid = CRITERIA.every(c => ratings[c.id]) && nps !== null

    const handleSubmit = async () => {
        if (!isValid) return

        try {
            setIsSubmitting(true)
            await turmaService.submitEvaluation({
                turma_id: turmaId,
                user_id: userId,
                nps: nps!,
                respostas: ratings,
                comentario: comment
            })
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error submitting evaluation:', error)
            alert('Erro ao enviar avaliação. Tente novamente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Avaliar Turma" size="lg">
            <div className="space-y-8 py-4">
                {/* 5-Star Ratings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Avalie os seguintes critérios</h3>
                    {CRITERIA.map(criterion => (
                        <div key={criterion.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-gray-300 font-medium">{criterion.label}</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => handleRating(criterion.id, star)}
                                        className={`p-1 transition-transform hover:scale-110 focus:outline-none ${(ratings[criterion.id] || 0) >= star
                                            ? 'text-yellow-400'
                                            : 'text-gray-600 hover:text-yellow-400/50'
                                            }`}
                                    >
                                        <Star className="w-6 h-6 fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* NPS */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">
                        De 0 a 10, o quanto você indicaria esta aula?
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center bg-white/5 p-4 rounded-xl border border-white/5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                            <button
                                key={score}
                                onClick={() => setNps(score)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all ${nps === score
                                    ? 'bg-primary text-background scale-110 shadow-lg shadow-primary/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {score}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Comentário ou Sugestão (Opcional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="w-full h-32 bg-secondary border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Conte-nos o que achou..."
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
                        Enviar Avaliação
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
