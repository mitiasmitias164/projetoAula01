import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { supabase } from '@backend/config/supabase'
import { campusAPI } from '@backend/api/campus'
import { useAuth } from '@/contexts/AuthContext'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MultiSelect } from '@/components/ui/MultiSelect'
import type { Campus } from '@backend/types/database.types'

const TEACHING_LEVELS = ['Fundamental', 'Médio', 'Superior', 'Pós-graduação', 'Mestrado/Doutorado']

interface ProfileEditModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
    const { user } = useAuth()
    const [saving, setSaving] = useState(false)
    const [campuses, setCampuses] = useState<Campus[]>([])
    const [loadingCampuses, setLoadingCampuses] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        campus_id: '',
    })
    const [selectedLevels, setSelectedLevels] = useState<string[]>([])

    // Load user data into form when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                nome: user.nome || '',
                telefone: user.telefone || '',
                campus_id: user.campus_id || '',
            })
            setSelectedLevels(user.niveis_ensino || [])
            setSuccess(false)
            setError('')
        }
    }, [isOpen, user])

    // Load campuses
    useEffect(() => {
        if (isOpen) {
            campusAPI.getAll()
                .then(setCampuses)
                .catch(console.error)
                .finally(() => setLoadingCampuses(false))
        }
    }, [isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        setError('')
        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    nome: formData.nome,
                    telefone: formData.telefone,
                    campus_id: formData.campus_id || null,
                    niveis_ensino: selectedLevels,
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setSuccess(true)
            setTimeout(() => {
                onClose()
                // Reload to reflect changes in header
                window.location.reload()
            }, 1000)
        } catch (err: any) {
            console.error('Error updating profile:', err)
            setError(err.message || 'Erro ao atualizar perfil')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil" size="lg">
            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                        Perfil atualizado com sucesso!
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Nome Completo"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Seu nome"
                        required
                    />

                    <Input
                        label="Telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="Campus"
                        value={formData.campus_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, campus_id: value }))}
                        placeholder={loadingCampuses ? "Carregando..." : "Selecione o campus"}
                        options={campuses.map(c => ({ value: c.id, label: c.nome }))}
                        disabled={loadingCampuses}
                    />

                    <MultiSelect
                        label="Níveis de Ensino"
                        options={TEACHING_LEVELS}
                        selected={selectedLevels}
                        onChange={setSelectedLevels}
                    />
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-sm text-gray-400">
                        <span className="text-gray-300 font-medium">E-mail:</span> {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        O e-mail não pode ser alterado
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-background bg-primary hover:bg-primary-600 rounded-lg transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Salvar
                    </button>
                </div>
            </div>
        </Modal>
    )
}
