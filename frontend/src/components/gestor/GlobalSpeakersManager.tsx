import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Trash2, Plus, Upload, Loader2, User as UserIcon, Check, Pencil, X, Instagram, Linkedin, Filter, Search, Eraser } from 'lucide-react'
import type { Speaker } from '@backend/types/database.types'

export function GlobalSpeakersManager() {
    const [speakers, setSpeakers] = useState<Speaker[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Form State
    const [showForm, setShowForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentSpeakerId, setCurrentSpeakerId] = useState<string | null>(null)
    const [speakerName, setSpeakerName] = useState('')
    const [speakerBio, setSpeakerBio] = useState('')
    const [instagramUrl, setInstagramUrl] = useState('')
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredSpeakers = useMemo(() => {
        if (!searchTerm) return speakers
        const term = searchTerm.toLowerCase()
        return speakers.filter(s =>
            s.name.toLowerCase().includes(term) ||
            (s.bio && s.bio.toLowerCase().includes(term))
        )
    }, [speakers, searchTerm])

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchSpeakers()
    }, [])

    const fetchSpeakers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('speakers')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setSpeakers(data || [])
        } catch (error) {
            console.error('Error fetching speakers:', error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setSpeakerName('')
        setSpeakerBio('')
        setInstagramUrl('')
        setLinkedinUrl('')
        setAvatarUrl('')
        setCurrentSpeakerId(null)
        setIsEditing(false)
        setShowForm(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleEditClick = (speaker: Speaker) => {
        setSpeakerName(speaker.name)
        setSpeakerBio(speaker.bio || '')
        setInstagramUrl(speaker.instagram_url || '')
        setLinkedinUrl(speaker.linkedin_url || '')
        setAvatarUrl(speaker.avatar_url || '')
        setCurrentSpeakerId(speaker.id)
        setIsEditing(true)
        setShowForm(true)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `speaker_${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        setUploading(true)

        try {
            const { error: uploadError } = await supabase.storage
                .from('class-materials')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('class-materials')
                .getPublicUrl(filePath)

            setAvatarUrl(data.publicUrl)
        } catch (error) {
            console.error('Error uploading speaker photo:', error)
            alert('Erro ao fazer upload da foto')
        } finally {
            setUploading(false)
        }
    }

    const handleSaveSpeaker = async () => {
        if (!speakerName.trim()) return

        setActionLoading(true)
        try {
            const speakerData = {
                name: speakerName,
                bio: speakerBio,
                instagram_url: instagramUrl,
                linkedin_url: linkedinUrl,
                avatar_url: avatarUrl
            }

            if (isEditing && currentSpeakerId) {
                // Update
                const { error } = await supabase
                    .from('speakers')
                    .update(speakerData)
                    .eq('id', currentSpeakerId)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase
                    .from('speakers')
                    .insert(speakerData)

                if (error) throw error
            }

            await fetchSpeakers()
            resetForm()
        } catch (error) {
            console.error('Error saving speaker:', error)
            alert('Erro ao salvar palestrante')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteSpeaker = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este palestrante? Isso pode afetar turmas que o utilizam.')) return

        try {
            const { error } = await supabase
                .from('speakers')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchSpeakers()
        } catch (error) {
            console.error('Error deleting speaker:', error)
            alert('Erro ao excluir palestrante. Verifique se ele não está vinculado a alguma turma.')
        }
    }

    return (
        <div className="space-y-8">
            {/* Filter Bar + Add Button */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 bg-secondary/30 border border-white/5 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filtrar Palestrantes</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
                            <Input
                                placeholder="Buscar por nome ou cargo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-secondary/50 border-white/10 pl-10"
                            />
                        </div>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="p-2.5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={!searchTerm}
                            title="Limpar Filtro"
                        >
                            <Eraser className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowForm(true) }}
                    className="flex items-center gap-2 self-start"
                >
                    <Plus className="w-4 h-4" />
                    Novo Palestrante
                </Button>
            </div >

            {/* Modal Popup */}
            {
                showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={resetForm}
                        />
                        {/* Modal Content */}
                        <div className="relative bg-secondary border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-semibold text-white">
                                    {isEditing ? 'Editar Palestrante' : 'Adicionar Novo Palestrante'}
                                </h4>
                                <button
                                    onClick={resetForm}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                                        <Input
                                            placeholder="Nome do Palestrante"
                                            value={speakerName}
                                            onChange={(e) => setSpeakerName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Bio / Cargo</label>
                                        <Input
                                            placeholder="Ex: Especialista em IA"
                                            value={speakerBio}
                                            onChange={(e) => setSpeakerBio(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                                            <Instagram className="w-4 h-4" />
                                            Instagram
                                        </label>
                                        <Input
                                            placeholder="https://instagram.com/..."
                                            value={instagramUrl}
                                            onChange={(e) => setInstagramUrl(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                                            <Linkedin className="w-4 h-4" />
                                            LinkedIn
                                        </label>
                                        <Input
                                            placeholder="https://linkedin.com/in/..."
                                            value={linkedinUrl}
                                            onChange={(e) => setLinkedinUrl(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Foto</label>
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-full bg-primary/20 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-8 h-8 text-primary/50" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
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
                                                >
                                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                    Upload Foto
                                                </Button>
                                                {avatarUrl && (
                                                    <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        OK
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">Recomendado: JPG ou PNG quadrados.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={resetForm}
                                    className="text-gray-300 border-gray-600 hover:bg-gray-800"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSaveSpeaker}
                                    disabled={!speakerName.trim() || actionLoading || uploading}
                                    isLoading={actionLoading}
                                    className="min-w-[150px]"
                                >
                                    {isEditing ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Salvar Alterações
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Adicionar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpeakers.map((speaker) => (
                    <div key={speaker.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:border-white/20 transition-all">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {speaker.avatar_url ? (
                                <img src={speaker.avatar_url} alt={speaker.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-primary font-bold">{speaker.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{speaker.name}</h4>
                            <p className="text-sm text-gray-400 truncate mb-2">{speaker.bio || 'Sem descrição'}</p>

                            <div className="flex items-center gap-2">
                                {speaker.instagram_url && (
                                    <a
                                        href={speaker.instagram_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-pink-500 transition-colors"
                                    >
                                        <Instagram className="w-4 h-4" />
                                    </a>
                                )}
                                {speaker.linkedin_url && (
                                    <a
                                        href={speaker.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEditClick(speaker)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteSpeaker(speaker.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredSpeakers.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        {searchTerm ? 'Nenhum palestrante encontrado com esse filtro.' : 'Nenhum palestrante cadastrado.'}
                    </div>
                )}
            </div>
        </div>
    )
}
