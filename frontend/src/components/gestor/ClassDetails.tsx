import { useState, useEffect, useRef } from 'react'
import { turmasAPI } from '@backend/api/turmas'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { TimePicker } from '@/components/ui/TimePicker'
import { Mail, Phone, Calendar, Clock, XCircle, Users, CheckCircle, FileSpreadsheet, FileText, Loader2, Check, Image, Save, Upload, Mic2, AlertCircle } from 'lucide-react'
import { exportToExcel, exportToPDF } from '@/utils/exportUtils'

import { supabase } from '@/lib/supabase'
import { SpeakersManager, type SpeakersManagerRef } from './SpeakersManager'

interface ClassDetailsProps {
    turmaId: string | null
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
}

export function ClassDetails({ turmaId, isOpen, onClose, onUpdate }: ClassDetailsProps) {
    const [loading, setLoading] = useState(true)
    const [turma, setTurma] = useState<any>(null) // Using any for joined data for now
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)
    const speakersManagerRef = useRef<SpeakersManagerRef>(null)

    // Download Feedback State
    const [downloading, setDownloading] = useState<'excel' | 'pdf' | null>(null)
    const [downloadSuccess, setDownloadSuccess] = useState<'excel' | 'pdf' | null>(null)

    // Edit Form State
    const [formData, setFormData] = useState({
        nome: '',
        sobre: '',
        pdf_url: '',
        foto_capa: '',
        palestrantes: '',
        data: '',
        data_limite_inscricao: '',
        hora_inicio: '',
        hora_fim: '',
        local: '',
        capacidade: 20
    })

    useEffect(() => {
        if (isOpen && turmaId) {
            loadDetails()
        } else {
            setTurma(null)
            setEditing(false)
            setDownloadSuccess(null)
        }
    }, [isOpen, turmaId])

    const loadDetails = async () => {
        if (!turmaId) return
        try {
            setLoading(true)
            const data = await turmasAPI.getDetails(turmaId)
            console.log('Turma Details Loaded:', data)
            console.log('Speakers:', data.speakers)
            setTurma(data)

            // Initialize form data
            setFormData({
                nome: data.nome || '',
                sobre: data.sobre || '',
                pdf_url: data.pdf_url || '',
                foto_capa: data.foto_capa || '',
                palestrantes: data.palestrantes || '',
                data: data.data,
                data_limite_inscricao: data.data_limite_inscricao || '',
                hora_inicio: data.hora_inicio,
                hora_fim: data.hora_fim,
                local: data.local,
                capacidade: data.capacidade
            })
        } catch (error) {
            console.error('Error loading class details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!turmaId) return
        try {
            setSaving(true)

            // Check if there is a pending speaker to add
            if (speakersManagerRef.current?.hasPendingData()) {
                await speakersManagerRef.current.triggerAdd()
            }

            // Prepare update payload, converting empty string to null for optional date
            const updatePayload = {
                ...formData,
                data_limite_inscricao: formData.data_limite_inscricao || undefined
            }

            await turmasAPI.update(turmaId, updatePayload)
            await loadDetails() // Reload to get fresh data
            setEditing(false)
            onUpdate() // Notify parent to refresh list
        } catch (error) {
            console.error('Error updating class:', error)
            alert('Erro ao atualizar turma')
        } finally {
            setSaving(false)
        }
    }

    const handleExportExcel = async () => {
        if (!turma) return
        try {
            setDownloading('excel')
            const data = turma.inscricoes.map((i: any) => ({
                Nome: i.user?.nome,
                Email: i.user?.email,
                Telefone: i.user?.telefone,
                Status: i.status,
                'Data Inscrição': new Date(i.created_at).toLocaleDateString()
            }))

            // Artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800))

            exportToExcel(data, `lista_presenca_${turma.campus?.nome}`)

            setDownloading(null)
            setDownloadSuccess('excel')
            setTimeout(() => setDownloadSuccess(null), 3000)
        } catch (error) {
            console.error('Error exporting Excel:', error)
            setDownloading(null)
        }
    }

    const handleExportPDF = async () => {
        if (!turma) return
        try {
            setDownloading('pdf')

            // Artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800))

            exportToPDF(turma, turma.inscricoes)

            setDownloading(null)
            setDownloadSuccess('pdf')
            setTimeout(() => setDownloadSuccess(null), 3000)
        } catch (error) {
            console.error('Error exporting PDF:', error)
            alert('Erro ao gerar PDF')
            setDownloading(null)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        setUploading(true)

        try {
            const { error: uploadError } = await supabase.storage
                .from('class-materials')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('class-materials')
                .getPublicUrl(filePath)

            setFormData({ ...formData, pdf_url: data.publicUrl })
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Erro ao fazer upload do arquivo')
        } finally {
            setUploading(false)
        }
    }

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `cover_${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        setUploadingCover(true)

        try {
            const { error: uploadError } = await supabase.storage
                .from('class-materials')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('class-materials')
                .getPublicUrl(filePath)

            setFormData({ ...formData, foto_capa: data.publicUrl })
        } catch (error) {
            console.error('Error uploading cover:', error)
            alert('Erro ao fazer upload da capa')
        } finally {
            setUploadingCover(false)
        }
    }

    if (!turma && loading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Carregando..." size="lg">
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Modal>
        )
    }

    if (!turma) return null

    const inscritos = turma.inscricoes || []
    const vagasOcupadas = inscritos.filter((i: any) => i.status === 'ATIVA').length
    const ocupacao = Math.round((vagasOcupadas / turma.capacidade) * 100)

    const deadlineEfetiva = turma.data_limite_inscricao || turma.data
    const isFechada = turma.status !== 'ABERTA' || new Date(deadlineEfetiva) < new Date(new Date().toDateString())
    const statusLabel = isFechada ? 'FECHADA' : 'ABERTA'

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editing ? "Editar Turma" : `Detalhes da Turma - ${turma.campus?.nome}`}
            size="xl"
            className="h-[80vh]" // Fixed height modal
        >
            <div className="space-y-8">
                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-gray-400 text-sm mb-1">Status</div>
                        <div className={`text-lg font-bold ${!isFechada ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {statusLabel}
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-gray-400 text-sm mb-1">Ocupação</div>
                        <div className="text-lg font-bold text-white">
                            {vagasOcupadas} / {turma.capacidade} <span className="text-sm text-gray-500 font-normal">({ocupacao}%)</span>
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 col-span-2">
                        <div className="text-gray-400 text-sm mb-1">Horário</div>
                        <div className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            {turma.hora_inicio.slice(0, 5)} - {turma.hora_fim.slice(0, 5)}
                        </div>
                    </div>
                </div>

                {/* Edit Form or View Details */}
                <div className="bg-secondary/30 rounded-xl p-6 border border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Dados da Turma
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {!editing && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="flex items-center gap-2 min-w-[100px]"
                                        disabled={!!downloading}
                                    >
                                        {downloading === 'excel' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : downloadSuccess === 'excel' ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                        )}
                                        {downloading === 'excel' ? 'Baixando...' : downloadSuccess === 'excel' ? 'Sucesso!' : 'Excel'}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportPDF}
                                        className="flex items-center gap-2 min-w-[100px]"
                                        disabled={!!downloading}
                                    >
                                        {downloading === 'pdf' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : downloadSuccess === 'pdf' ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-red-500" />
                                        )}
                                        {downloading === 'pdf' ? 'Gerando...' : downloadSuccess === 'pdf' ? 'Sucesso!' : 'PDF'}
                                    </Button>

                                    <div className="w-px h-6 bg-white/10 mx-1 hidden md:block"></div>
                                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                                        Editar
                                    </Button>
                                </>
                            )}
                            {editing && (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                                        Cancelar
                                    </Button>
                                    <Button size="sm" onClick={handleSave} isLoading={saving} className="flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        Salvar Alterações
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {editing ? (
                        <div className="space-y-6">
                            <Input
                                label="Nome da Turma"
                                value={formData.nome || ''}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="Nome personalizado da turma"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Sobre a Turma
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none h-24"
                                    value={formData.sobre || ''}
                                    onChange={e => setFormData({ ...formData, sobre: e.target.value })}
                                    placeholder="Descrição sobre a turma..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* PDF Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Cronograma (PDF)
                                    </label>
                                    <div
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                        className={`
                                            relative h-32 w-full group cursor-pointer
                                            border-2 border-dashed rounded-xl p-4
                                            flex flex-col items-center justify-center gap-2
                                            transition-all duration-200
                                            ${formData.pdf_url
                                                ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10'
                                                : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            ref={fileInputRef}
                                            disabled={uploading}
                                        />

                                        {formData.pdf_url ? (
                                            <>
                                                <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="text-center w-full px-2">
                                                    <p className="text-sm font-medium text-green-400 truncate w-full">
                                                        {formData.pdf_url.split('/').pop()}
                                                    </p>
                                                    <p className="text-xs text-green-500/70 mt-1 group-hover:text-green-400 transition-colors">
                                                        Clique para substituir
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2 rounded-full bg-white/5 text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                                        {uploading ? 'Enviando...' : 'Adicionar PDF'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">Carregar cronograma</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Cover Photo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Foto de Capa
                                    </label>
                                    <div
                                        onClick={() => !uploadingCover && coverInputRef.current?.click()}
                                        className={`
                                            relative h-32 w-full rounded-xl overflow-hidden 
                                            border-2 border-dashed border-white/10 
                                            cursor-pointer group hover:border-primary/50 transition-all
                                            flex flex-col items-center justify-center
                                            ${!formData.foto_capa && 'hover:bg-white/5'}
                                        `}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverUpload}
                                            className="hidden"
                                            ref={coverInputRef}
                                            disabled={uploadingCover}
                                        />

                                        {formData.foto_capa ? (
                                            <>
                                                <img
                                                    src={formData.foto_capa}
                                                    alt="Preview"
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Upload className="w-8 h-8 text-white mb-2" />
                                                    <span className="text-sm font-medium text-white shadow-sm">Alterar Capa</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2 rounded-full bg-white/5 text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-2">
                                                    {uploadingCover ? <Loader2 className="w-6 h-6 animate-spin" /> : <Image className="w-6 h-6" />}
                                                </div>
                                                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                                    {uploadingCover ? 'Enviando...' : 'Adicionar Capa'}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Rich Speakers Manager */}
                            <SpeakersManager
                                ref={speakersManagerRef}
                                turmaId={turma.id}
                                speakers={turma.speakers || []}
                                onUpdate={loadDetails}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <DatePicker
                                    label="Data"
                                    value={formData.data}
                                    onChange={value => setFormData({ ...formData, data: value })}
                                />
                                <DatePicker
                                    label="Data Limite para Inscrição"
                                    value={formData.data_limite_inscricao}
                                    onChange={value => setFormData({ ...formData, data_limite_inscricao: value })}
                                    placeholder="Sem limite (opcional)"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <TimePicker
                                        label="Início"
                                        value={formData.hora_inicio}
                                        onChange={value => setFormData({ ...formData, hora_inicio: value })}
                                    />
                                    <TimePicker
                                        label="Fim"
                                        value={formData.hora_fim}
                                        onChange={value => setFormData({ ...formData, hora_fim: value })}
                                    />
                                </div>
                                <Input
                                    label="Local"
                                    value={formData.local}
                                    onChange={e => setFormData({ ...formData, local: e.target.value })}
                                />
                                <Input
                                    label="Capacidade"
                                    type="number"
                                    value={formData.capacidade}
                                    onChange={e => setFormData({ ...formData, capacidade: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {turma.foto_capa && (
                                <div className="rounded-lg overflow-hidden h-48 w-full border border-white/10 shadow-lg">
                                    <img
                                        src={turma.foto_capa}
                                        alt="Capa da Turma"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {turma.nome && (
                                <div>
                                    <h4 className="text-gray-400 text-sm mb-1">Nome da Turma</h4>
                                    <p className="text-white font-medium text-lg">{turma.nome}</p>
                                </div>
                            )}

                            {turma.sobre && (
                                <div>
                                    <h4 className="text-gray-400 text-sm mb-1">Sobre</h4>
                                    <p className="text-white text-sm leading-relaxed text-gray-300">{turma.sobre}</p>
                                </div>
                            )}



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm pt-4 border-t border-white/5">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Data</span>
                                    <span className="text-white font-medium">{new Date(turma.data).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Local</span>
                                    <span className="text-white font-medium">{turma.local}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Capacidade Total</span>
                                    <span className="text-white font-medium">{turma.capacidade} alunos</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Campus</span>
                                    <span className="text-white font-medium">{turma.campus?.nome}</span>
                                </div>
                                {turma.data_limite_inscricao && (
                                    <div className="flex justify-between border-b border-white/5 pb-2 col-span-2">
                                        <span className="text-gray-400 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" />
                                            Limite para Inscrição
                                        </span>
                                        <span className={`font-medium ${new Date(turma.data_limite_inscricao) < new Date() ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {new Date(turma.data_limite_inscricao).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Speakers & Guests Section */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Mic2 className="w-5 h-5 text-primary" />
                        Palestrantes & Convidados
                    </h3>
                    <div className="bg-secondary/30 rounded-xl border border-white/5 p-6 space-y-4">
                        {turma.speakers && turma.speakers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {turma.speakers.map((speaker: any) => (
                                    <div key={speaker.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {speaker.avatar_url ? (
                                                <img src={speaker.avatar_url} alt={speaker.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-primary font-bold">{speaker.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{speaker.name}</p>
                                            <p className="text-sm text-gray-400 line-clamp-1">{speaker.bio || 'Palestrante Convidado'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Nenhum palestrante convidado para esta turma.
                            </div>
                        )}
                    </div>
                </div>

                {/* Participants List */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Participantes Inscritos
                    </h3>

                    <div className="bg-secondary/30 rounded-xl border border-white/5 overflow-hidden">
                        {inscritos.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Nenhum professor inscrito nesta turma.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                                    <tr>
                                        <th className="p-4 font-medium">Nome</th>
                                        <th className="p-4 font-medium">Contato</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Data Inscrição</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {inscritos.map((inscricao: any) => (
                                        <tr key={inscricao.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-white">{inscricao.user?.nome}</div>
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Mail className="w-3 h-3 text-gray-500" />
                                                    {inscricao.user?.email}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3 text-gray-500" />
                                                    {inscricao.user?.telefone}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${inscricao.status === 'ATIVA'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {inscricao.status === 'ATIVA' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {inscricao.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {new Date(inscricao.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}

