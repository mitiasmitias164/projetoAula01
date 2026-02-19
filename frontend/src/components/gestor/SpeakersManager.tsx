import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Trash2, Plus, Upload, Loader2, User as UserIcon, Check } from 'lucide-react'
import type { Speaker } from '@backend/types/database.types'

export interface SpeakersManagerRef {
    hasPendingData: () => boolean
    triggerAdd: () => Promise<void>
}

interface SpeakersManagerProps {
    turmaId: string
    speakers: Speaker[]
    onUpdate: () => void
}

export const SpeakersManager = forwardRef<SpeakersManagerRef, SpeakersManagerProps>(({ turmaId, speakers, onUpdate }, ref) => {
    const [newSpeakerName, setNewSpeakerName] = useState('')
    const [newSpeakerBio, setNewSpeakerBio] = useState('')
    const [uploading, setUploading] = useState(false)
    const [adding, setAdding] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState('')
    const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null) // Track if an existing speaker is selected

    // Autocomplete State
    const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([])
    const [suggestions, setSuggestions] = useState<Speaker[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
        hasPendingData: () => {
            return newSpeakerName.trim().length > 0
        },
        triggerAdd: async () => {
            await handleAddSpeaker()
        }
    }))

    // Load available speakers for autocomplete
    useEffect(() => {
        const fetchSpeakers = async () => {
            try {
                const { data, error } = await supabase
                    .from('speakers')
                    .select('*')
                    .order('name', { ascending: true })

                if (error) throw error

                if (data) {
                    setAllSpeakers(data)
                }
            } catch (error) {
                console.error('Error fetching speakers for autocomplete:', error)
            }
        }

        fetchSpeakers()
    }, [])

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setNewSpeakerName(value)

        // Reset selected ID if user types something different
        if (selectedSpeakerId && value !== allSpeakers.find(s => s.id === selectedSpeakerId)?.name) {
            setSelectedSpeakerId(null)
        }

        if (value.trim().length > 0) {
            const filtered = allSpeakers.filter(s =>
                s.name.toLowerCase().includes(value.toLowerCase())
            )
            setSuggestions(filtered)
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
        }
    }

    const handleSelectSuggestion = (speaker: Speaker) => {
        setNewSpeakerName(speaker.name)
        setNewSpeakerBio(speaker.bio || '')
        setAvatarUrl(speaker.avatar_url || '')
        setSelectedSpeakerId(speaker.id)
        setShowSuggestions(false)
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

            if (uploadError) {
                throw uploadError
            }

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

    const handleAddSpeaker = async () => {
        if (!newSpeakerName.trim()) return

        setAdding(true)
        try {
            let speakerIdToLink = selectedSpeakerId

            // If no existing speaker selected, crate a new one in the global table
            if (!speakerIdToLink) {
                // Double check if name exists to avoid duplicates (safeguard)
                const existing = allSpeakers.find(s => s.name.toLowerCase() === newSpeakerName.trim().toLowerCase())

                if (existing) {
                    speakerIdToLink = existing.id
                } else {
                    const { data: newSpeaker, error: createError } = await supabase
                        .from('speakers')
                        .insert({
                            name: newSpeakerName,
                            bio: newSpeakerBio,
                            avatar_url: avatarUrl
                        })
                        .select()
                        .single()

                    if (createError) throw createError
                    speakerIdToLink = newSpeaker.id
                    // Add to local list so we don't need to re-fetch
                    setAllSpeakers(prev => [...prev, newSpeaker])
                }
            }

            if (!speakerIdToLink) throw new Error("Failed to resolve speaker ID")

            // Link to the class
            const { error: linkError } = await supabase
                .from('turma_speakers')
                .insert({
                    turma_id: turmaId,
                    speaker_id: speakerIdToLink
                })

            if (linkError) {
                // Ignore unique violation (already linked)
                if (linkError.code !== '23505') throw linkError
            }

            setNewSpeakerName('')
            setNewSpeakerBio('')
            setAvatarUrl('')
            setSelectedSpeakerId(null)
            onUpdate()
        } catch (error) {
            console.error('Error adding speaker:', error)
            alert('Erro ao adicionar palestrante')
        } finally {
            setAdding(false)
        }
    }

    const handleDeleteSpeaker = async (speakerId: string) => {
        if (!confirm('Tem certeza que deseja desvincular este palestrante desta turma?')) return

        try {
            const { error } = await supabase
                .from('turma_speakers')
                .delete()
                .eq('turma_id', turmaId)
                .eq('speaker_id', speakerId)

            if (error) throw error
            onUpdate()
        } catch (error) {
            console.error('Error removing speaker:', error)
            alert('Erro ao remover palestrante')
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Gerenciar Palestrantes
            </h3>

            {/* List Existing Speakers */}
            {speakers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {speakers.map((speaker) => (
                        <div key={speaker.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:border-white/20 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {speaker.avatar_url ? (
                                    <img src={speaker.avatar_url} alt={speaker.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-primary font-bold">{speaker.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">{speaker.name}</h4>
                                <p className="text-sm text-gray-400 truncate">{speaker.bio || 'Sem descrição'}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteSpeaker(speaker.id)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Desvincular"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Speaker Form */}
            <div className="bg-secondary/30 border border-white/5 rounded-xl p-4 md:p-6" ref={wrapperRef}>
                <h4 className="text-sm font-medium text-gray-400 mb-4">Adicionar Novo Palestrante</h4>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Nome do Palestrante"
                                value={newSpeakerName}
                                onChange={handleNameChange}
                                onFocus={() => {
                                    if (newSpeakerName.length > 0) setShowSuggestions(true)
                                }}
                            />

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(s)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {s.avatar_url ? (
                                                    <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-primary font-bold">{s.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{s.name}</p>
                                                {s.bio && <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.bio}</p>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder="Bio / Cargo (ex: Especialista em IA)"
                                value={newSpeakerBio}
                                onChange={(e) => setNewSpeakerBio(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-4 flex-1 w-full">
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
                                className="flex items-center gap-2 w-full md:w-auto justify-center"
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {uploading ? 'Enviando...' : 'Foto do Palestrante'}
                            </Button>

                            {avatarUrl && (
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Foto carregada!
                                    </span>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleAddSpeaker}
                            disabled={!newSpeakerName || adding}
                            isLoading={adding}
                            className="w-full md:w-auto min-w-[120px]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
})
