import { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Trash2, Calendar, MapPin, Users, Clock, Eye, Filter, Eraser, Upload, CheckCircle, Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { TimePicker } from '@/components/ui/TimePicker'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { Select } from '@/components/ui/Select'
import { turmaService } from '@/services/turma'
import { campusService } from '@/services/campus'
import { ClassDetails } from './ClassDetails'
import type { Turma, Campus } from '@backend/types/database.types'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

// Add campus_nome to Turma type for display
interface TurmaWithCampus extends Turma {
    campus: { nome: string } | null
}

export function TurmaManager() {
    const [turmas, setTurmas] = useState<TurmaWithCampus[]>([])
    const [campuses, setCampuses] = useState<Campus[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)

    // Filters State
    // Filters State
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCampus, setFilterCampus] = useState('')
    const [filterDataInicio, setFilterDataInicio] = useState('')
    const [filterDataFim, setFilterDataFim] = useState('')
    const [filterTurno, setFilterTurno] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    // Details Modal State
    const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null)

    // Form State
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
    const [selectedCampusNames, setSelectedCampusNames] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    const filteredTurmas = useMemo(() => {
        return turmas.filter(turma => {
            const matchesCampus = filterCampus ? turma.campus?.nome === filterCampus : true

            // Date Range Filter
            let matchesData = true
            if (filterDataInicio || filterDataFim) {
                const turmaDate = new Date(turma.data)
                if (filterDataInicio) {
                    matchesData = matchesData && turmaDate >= new Date(filterDataInicio)
                }
                if (filterDataFim) {
                    matchesData = matchesData && turmaDate <= new Date(filterDataFim)
                }
            }

            // Shift Filter
            let matchesTurno = true
            if (filterTurno) {
                const hour = parseInt(turma.hora_inicio.split(':')[0])
                if (filterTurno === 'MANHA') matchesTurno = hour >= 6 && hour < 12
                if (filterTurno === 'TARDE') matchesTurno = hour >= 12 && hour < 18
                if (filterTurno === 'NOITE') matchesTurno = hour >= 18
            }

            // Status filter uses effective status (considers deadline)
            let matchesStatus = true
            if (filterStatus) {
                const dl = turma.data_limite_inscricao || turma.data
                const efetivamentoFechada = turma.status !== 'ABERTA' || new Date(dl) < new Date(new Date().toDateString())
                const statusEfetivo = efetivamentoFechada ? 'FECHADA' : 'ABERTA'
                matchesStatus = statusEfetivo === filterStatus
            }
            const matchesSearch = searchTerm
                ? (turma.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
                : true

            return matchesCampus && matchesData && matchesTurno && matchesStatus && matchesSearch
        })
    }, [turmas, filterCampus, filterDataInicio, filterDataFim, filterTurno, filterStatus, searchTerm])

    const resetFilters = () => {
        setSearchTerm('')
        setFilterCampus('')
        setFilterDataInicio('')
        setFilterDataFim('')
        setFilterTurno('')
        setFilterStatus('')
    }

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [turmasData, campusData] = await Promise.all([
                turmaService.getAll(),
                campusService.getAll()
            ])
            setTurmas(turmasData as any) // Type assertion due to join format
            setCampuses(campusData)
        } catch (err) {
            console.error(err)
            setError('Erro ao carregar dados')
        } finally {
            setLoading(false)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedCampusNames.length === 0) {
            setError('Selecione pelo menos um campus')
            return
        }

        setError('')
        setLoading(true)

        try {
            // Create a class for each selected campus
            const promises = selectedCampusNames.map(campusName => {
                const campus = campuses.find(c => c.nome === campusName)
                if (!campus) throw new Error(`Campus ${campusName} não encontrado`)

                return turmaService.create({
                    campus_id: campus.id,
                    nome: formData.nome,
                    sobre: formData.sobre,
                    pdf_url: formData.pdf_url,
                    foto_capa: formData.foto_capa,
                    palestrantes: formData.palestrantes,
                    data: formData.data,
                    data_limite_inscricao: formData.data_limite_inscricao || undefined,
                    hora_inicio: formData.hora_inicio,
                    hora_fim: formData.hora_fim,
                    local: formData.local,
                    capacidade: formData.capacidade
                })
            })

            await Promise.all(promises)
            await loadData()
            resetForm()
        } catch (err: any) {
            console.error(err)
            setError('Erro ao criar turmas')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta turma?')) return

        try {
            await turmaService.delete(id)
            setTurmas(prev => prev.filter(t => t.id !== id))
        } catch (err) {
            console.error(err)
            setError('Erro ao excluir turma')
        }
    }

    const resetForm = () => {
        setFormData({
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
        setSelectedCampusNames([])
        setShowForm(false)
        setError('')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center mb-6">
                {!showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Turma
                    </Button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {showForm && (
                <Card className="bg-secondary/50 border-white/10">
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-lg font-medium text-white mb-4">Nova Turma</h3>

                            <div className="space-y-4">
                                <Input
                                    label="Nome da Turma"
                                    value={formData.nome || ''}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: Inteligência Artificial Avançada"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Sobre a Turma
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none h-24"
                                        value={formData.sobre || ''}
                                        onChange={e => setFormData({ ...formData, sobre: e.target.value })}
                                        placeholder="Descrição breve sobre o conteúdo e objetivos da turma..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Cronograma (PDF)
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            ref={fileInputRef}
                                            disabled={uploading}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="flex items-center gap-2"
                                        >
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {uploading ? 'Enviando...' : 'Escolher Arquivo'}
                                        </Button>

                                        {formData.pdf_url && (
                                            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-2 rounded-lg border border-green-400/20">
                                                <CheckCircle className="w-3 h-3" />
                                                <span className="truncate max-w-[200px]">
                                                    {formData.pdf_url.split('/').pop()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Foto de Capa
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverUpload}
                                            className="hidden"
                                            ref={coverInputRef}
                                            disabled={uploadingCover}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => coverInputRef.current?.click()}
                                            disabled={uploadingCover}
                                            className="flex items-center gap-2"
                                        >
                                            {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {uploadingCover ? 'Enviando...' : 'Escolher Imagem'}
                                        </Button>

                                        {formData.foto_capa && (
                                            <div className="relative h-10 w-16 rounded overflow-hidden border border-white/10">
                                                <img
                                                    src={formData.foto_capa}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Input
                                    label="Palestrantes / Convidados"
                                    value={formData.palestrantes || ''}
                                    onChange={e => setFormData({ ...formData, palestrantes: e.target.value })}
                                    placeholder="Ex: Dr. Fulano, Dra. Ciclana..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DatePicker
                                    label="Data"
                                    value={formData.data}
                                    onChange={value => setFormData({ ...formData, data: value })}
                                    required
                                    minDate={new Date().toISOString().split('T')[0]}
                                />
                                <DatePicker
                                    label="Data Limite para Inscrição"
                                    value={formData.data_limite_inscricao}
                                    onChange={value => setFormData({ ...formData, data_limite_inscricao: value })}
                                    minDate={new Date().toISOString().split('T')[0]}
                                    placeholder="Sem limite (opcional)"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <TimePicker
                                        label="Início"
                                        value={formData.hora_inicio}
                                        onChange={value => setFormData({ ...formData, hora_inicio: value })}
                                        required
                                    />
                                    <TimePicker
                                        label="Fim"
                                        value={formData.hora_fim}
                                        onChange={value => setFormData({ ...formData, hora_fim: value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Local"
                                    value={formData.local}
                                    onChange={e => setFormData({ ...formData, local: e.target.value })}
                                    placeholder="Ex: Laboratório 1"
                                    required
                                />
                                <Input
                                    label="Capacidade"
                                    type="number"
                                    value={formData.capacidade}
                                    onChange={e => setFormData({ ...formData, capacidade: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            <MultiSelect
                                label="Campi (A turma será criada em todos os selecionados)"
                                options={campuses.map(c => c.nome)}
                                selected={selectedCampusNames}
                                onChange={setSelectedCampusNames}
                                error={selectedCampusNames.length === 0 && showForm ? 'Selecione pelo menos um campus' : undefined}
                            />

                            <div className="flex gap-2 justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="text-gray-300 border-gray-600 hover:bg-gray-800"
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={loading}>
                                    Criar Turmas
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )
            }

            {/* Filters */}
            {
                !showForm && (
                    <Card className="bg-secondary/30 border-white/5">
                        <CardBody className="p-4 space-y-4">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <Filter className="w-4 h-4" />
                                <span className="text-sm font-medium">Filtrar Turmas</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-12 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
                                    <Input
                                        placeholder="Buscar por nome da turma..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-secondary/50 border-white/10 pl-10"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <Select
                                        value={filterCampus}
                                        onChange={setFilterCampus}
                                        options={[
                                            { value: '', label: 'Todos os Campus' },
                                            ...campuses.map(c => ({ value: c.nome, label: c.nome }))
                                        ]}
                                        placeholder="Todos os Campus"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <DatePicker
                                        value={filterDataInicio}
                                        onChange={setFilterDataInicio}
                                        placeholder="De (Início)"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <DatePicker
                                        value={filterDataFim}
                                        onChange={setFilterDataFim}
                                        placeholder="Até (Fim)"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Select
                                        value={filterTurno}
                                        onChange={setFilterTurno}
                                        options={[
                                            { value: '', label: 'Turnos' },
                                            { value: 'MANHA', label: 'Manhã' },
                                            { value: 'TARDE', label: 'Tarde' },
                                            { value: 'NOITE', label: 'Noite' }
                                        ]}
                                        placeholder="Turno"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Select
                                        value={filterStatus}
                                        onChange={setFilterStatus}
                                        options={[
                                            { value: '', label: 'Status' },
                                            { value: 'ABERTA', label: 'Aberta' },
                                            { value: 'FECHADA', label: 'Fechada' }
                                        ]}
                                        placeholder="Status"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <Button
                                        variant="outline"
                                        onClick={resetFilters}
                                        className="w-full h-full flex items-center justify-center gap-2 border-white/10 hover:bg-white/5 hover:text-red-400 px-2"
                                        disabled={!searchTerm && !filterCampus && !filterDataInicio && !filterDataFim && !filterTurno && !filterStatus}
                                        title="Limpar Filtros"
                                    >
                                        <Eraser className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )
            }

            <div className="space-y-4">
                {filteredTurmas.map((turma) => {
                    const deadlineEfetiva = turma.data_limite_inscricao || turma.data
                    const isFechada = turma.status !== 'ABERTA' || new Date(deadlineEfetiva) < new Date(new Date().toDateString())
                    const statusLabel = isFechada ? 'FECHADA' : 'ABERTA'

                    return (
                        <Card key={turma.id} className="bg-secondary/30 border-white/5 hover:border-primary/50 transition-colors group">
                            <CardBody className="flex flex-col md:flex-row justify-between gap-4 p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary border border-primary/20">
                                            {turma.campus?.nome || 'Campus Desconhecido'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${!isFechada
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {statusLabel}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white">
                                        {turma.nome || 'Turma sem nome'}
                                    </h3>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-primary/70" />
                                            <span className="text-gray-200">
                                                {new Date(turma.data).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-primary/70" />
                                            <span>{turma.hora_inicio.slice(0, 5)} - {turma.hora_fim.slice(0, 5)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-primary/70" />
                                            <span>{turma.local}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-primary/70" />
                                            <span>{turma.capacidade} vagas</span>
                                        </div>
                                        {turma.data_limite_inscricao ? (
                                            <div className={`flex items-center gap-1.5 ${new Date(turma.data_limite_inscricao) < new Date() ? 'text-red-400' : 'text-yellow-400'}`}>
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Inscrições até {new Date(turma.data_limite_inscricao).toLocaleDateString()}</span>
                                            </div>
                                        ) : new Date(turma.data) < new Date() ? (
                                            <div className="flex items-center gap-1.5 text-red-400">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Inscrições encerradas</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedTurmaId(turma.id)}
                                        className="flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Detalhes
                                    </Button>
                                    <button
                                        onClick={() => handleDelete(turma.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors bg-white/5 rounded-lg hover:bg-white/10"
                                        title="Excluir Turma"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </CardBody>
                        </Card>
                    )
                })}

                {filteredTurmas.length === 0 && !loading && (
                    <div className="py-12 text-center text-gray-500 bg-secondary/20 rounded-lg border border-white/5 border-dashed">
                        {filterCampus || filterDataInicio || filterDataFim || filterTurno || filterStatus
                            ? 'Nenhuma turma encontrada com os filtros selecionados'
                            : 'Nenhuma turma cadastrada'
                        }
                    </div>
                )}
            </div>

            <ClassDetails
                turmaId={selectedTurmaId}
                isOpen={!!selectedTurmaId}
                onClose={() => setSelectedTurmaId(null)}
                onUpdate={loadData}
            />
        </div >
    )
}
