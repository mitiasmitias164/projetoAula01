import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { campusAPI } from '@backend/api/campus'
import type { Campus } from '@backend/types/database.types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'

const TEACHING_LEVELS = ['Fundamental', 'Médio', 'Superior', 'Pós-graduação', 'Mestrado/Doutorado']

export default function Signup() {

    const { signUp } = useAuth()

    // Form State
    const [loading, setLoading] = useState(false)
    const [loadingCampuses, setLoadingCampuses] = useState(true)
    const [campuses, setCampuses] = useState<Campus[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Form Data
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        campus_id: '',
        password: '',
        confirmPassword: ''
    })
    const [selectedLevels, setSelectedLevels] = useState<string[]>([])

    // Fetch Campuses
    useEffect(() => {
        async function fetchCampuses() {
            try {
                const data = await campusAPI.getAll()
                setCampuses(data)
            } catch (error) {
                console.error('Error loading campuses:', error)
            } finally {
                setLoadingCampuses(false)
            }
        }
        fetchCampuses()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
        if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório'
        if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório'
        if (!formData.campus_id) newErrors.campus_id = 'Selecione um campus'
        if (selectedLevels.length === 0) newErrors.levels = 'Selecione pelo menos um nível de ensino'
        if (formData.password.length < 6) newErrors.password = 'A senha deve ter no mínimo 6 caracteres'
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        try {
            await signUp(formData.email, formData.password, {
                nome: formData.nome,
                telefone: formData.telefone,
                campus_id: formData.campus_id,
                niveis_ensino: selectedLevels,
                role: 'PROFESSOR'
            })

            setSuccess(true)
        } catch (error: any) {
            console.error('Signup error:', error)
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Erro ao realizar cadastro. Tente novamente.'
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-30" />
            </div>

            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para o início
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Crie sua conta</h1>
                    <p className="text-gray-400">
                        Junte-se à nossa comunidade de professores de IA
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-secondary/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-xl">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <UserPlus className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Conta criada com sucesso!</h2>
                            <p className="text-gray-300 mb-8">
                                Enviamos um link de confirmação para <strong>{formData.email}</strong>.<br />
                                Por favor, verifique seu e-mail para ativar sua conta antes de fazer login.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200"
                            >
                                Ir para Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errors.submit && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {errors.submit}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nome Completo"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    error={errors.nome}
                                    placeholder="Seu nome"
                                    required
                                />

                                <Input
                                    label="Telefone"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    error={errors.telefone}
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </div>

                            <Input
                                label="E-mail Acadêmico"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                placeholder="seu.email@escola.edu.br"
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Campus"
                                    value={formData.campus_id}
                                    onChange={(value) => setFormData(prev => ({ ...prev, campus_id: value }))}
                                    error={errors.campus_id}
                                    placeholder={loadingCampuses ? "Carregando..." : "Selecione o campus"}
                                    options={campuses.map(c => ({ value: c.id, label: c.nome }))}
                                    disabled={loadingCampuses}
                                    required
                                />

                                <MultiSelect
                                    label="Níveis de Ensino"
                                    options={TEACHING_LEVELS}
                                    selected={selectedLevels}
                                    onChange={setSelectedLevels}
                                    error={errors.levels}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Senha"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />

                                <Input
                                    label="Confirmar Senha"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    placeholder="Confirme sua senha"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center px-4 py-3 bg-primary hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                        Criar Conta
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-gray-400">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-primary hover:text-primary-400 font-medium transition-colors">
                        Fazer login
                    </Link>
                </p>
            </div>
        </div>
    )
}
