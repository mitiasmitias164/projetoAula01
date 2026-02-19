import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'

export default function Login() {
    const navigate = useNavigate()
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const userData = await signIn(email, password)
            navigate(userData.role === 'GESTOR' ? '/gestor' : '/')
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-30" />
            </div>
            <Card className="w-full max-w-md bg-secondary border-white/10">
                <CardBody className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4 text-primary">
                            <span className="font-bold text-2xl">IA</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-gray-400">
                            Entre com suas credenciais
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            type="email"
                            label="E-mail"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-background border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-primary"
                            labelClassName="text-gray-300"
                        />

                        <Input
                            type="password"
                            label="Senha"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-background border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-primary"
                            labelClassName="text-gray-300"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full bg-primary hover:bg-primary-600 text-background font-bold"
                            isLoading={loading}
                        >
                            Entrar
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Não tem uma conta?{' '}
                            <Link
                                to="/signup"
                                className="font-medium text-primary hover:text-primary-400"
                            >
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
