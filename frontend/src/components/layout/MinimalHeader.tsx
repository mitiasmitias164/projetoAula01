import { Link } from 'react-router-dom'
import { Infinity } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function MinimalHeader() {

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-white/5 transition-all duration-300">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative w-12 h-12 rounded-full border-2 border-primary/50 flex items-center justify-center bg-primary/10 group-hover:bg-primary/30 group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(0,212,255,0.5)] transition-all group-hover:rotate-180 duration-500">
                        <Infinity className="w-6 h-6 text-primary drop-shadow-[0_0_2px_rgba(0,212,255,0.8)]" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight group-hover:text-primary transition-colors duration-300">
                        ProgramaAulas
                    </span>
                </Link>

                <nav className="flex items-center gap-4">
                    <Link to="/login">
                        <Button
                            variant="primary"
                            className="shadow-[0_0_10px_rgba(0,212,255,0.2)] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)]"
                        >
                            Login
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    )
}
