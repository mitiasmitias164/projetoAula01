import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, Filter, Search, Eraser } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { campusService } from '@/services/campus'
import type { Campus } from '@backend/types/database.types'

export function CampusManager() {
    const [campuses, setCampuses] = useState<Campus[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [currentCampus, setCurrentCampus] = useState<Campus | null>(null)
    const [formData, setFormData] = useState({ nome: '' })
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCampuses = useMemo(() => {
        if (!searchTerm) return campuses
        return campuses.filter(c =>
            c.nome.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [campuses, searchTerm])

    useEffect(() => {
        loadCampuses()
    }, [])

    const loadCampuses = async () => {
        try {
            const data = await campusService.getAll()
            setCampuses(data)
        } catch (err: any) {
            setError('Erro ao carregar campi')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isEditing && currentCampus) {
                await campusService.update(currentCampus.id, formData.nome)
            } else {
                await campusService.create(formData.nome)
            }
            await loadCampuses()
            resetForm()
        } catch (err: any) {
            setError('Erro ao salvar campus')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este campus?')) return

        try {
            await campusService.delete(id)
            await loadCampuses()
        } catch (err: any) {
            setError('Erro ao excluir campus')
            console.error(err)
        }
    }

    const startEdit = (campus: Campus) => {
        setCurrentCampus(campus)
        setFormData({ nome: campus.nome })
        setIsEditing(true)
        setShowForm(true)
    }

    const resetForm = () => {
        setCurrentCampus(null)
        setFormData({ nome: '' })
        setIsEditing(false)
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
                        Novo Campus
                    </Button>
                )}
            </div>

            {/* Search/Filter Bar */}
            {!showForm && (
                <Card className="bg-secondary/30 border-white/5">
                    <CardBody className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filtrar Campus</span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
                                <Input
                                    placeholder="Buscar por nome do campus..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-secondary/50 border-white/10 pl-10"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setSearchTerm('')}
                                className="flex items-center justify-center gap-2 border-white/10 hover:bg-white/5 hover:text-red-400 px-3"
                                disabled={!searchTerm}
                                title="Limpar Filtro"
                            >
                                <Eraser className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {showForm && (
                <Card className="bg-secondary/50 border-white/10">
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h3 className="text-lg font-medium text-white mb-4">
                                {isEditing ? 'Editar Campus' : 'Novo Campus'}
                            </h3>

                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Input
                                        label="Nome do Campus"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        placeholder="Ex: Campus Centro"
                                        required
                                        className="bg-background border-white/10 text-white"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetForm}
                                        className="text-gray-300 border-gray-600 hover:bg-gray-800"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" isLoading={loading}>
                                        {isEditing ? 'Atualizar' : 'Criar'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampuses.map((campus) => (
                    <Card key={campus.id} className="bg-secondary/30 border-white/5 hover:border-primary/50 transition-colors">
                        <CardBody className="flex justify-between items-center p-4">
                            <span className="text-gray-200 font-medium">{campus.nome}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => startEdit(campus)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                    title="Editar"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(campus.id)}
                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                ))}

                {filteredCampuses.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-secondary/20 rounded-lg border border-white/5 border-dashed">
                        {searchTerm ? 'Nenhum campus encontrado com esse filtro' : 'Nenhum campus cadastrado'}
                    </div>
                )}
            </div>
        </div>
    )
}
