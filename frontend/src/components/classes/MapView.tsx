import { MapPin } from 'lucide-react'

export function MapView() {
    return (
        <div className="sticky top-24 bg-gradient-to-br from-secondary to-background border border-white/10 rounded-2xl shadow-2xl overflow-hidden h-[600px]">
            {/* Map Header */}
            <div className="p-4 border-b border-white/10 bg-secondary/50 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Localização dos Campus
                </h3>
            </div>

            {/* Map Content - Placeholder */}
            <div className="relative h-full bg-[linear-gradient(to_right,#00bfff08_1px,transparent_1px),linear-gradient(to_bottom,#00bfff08_1px,transparent_1px)] bg-[size:3rem_3rem]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                            <MapPin className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-gray-500 font-mono text-sm mb-2">[Interactive Map]</p>
                        <p className="text-gray-600 text-xs max-w-xs mx-auto">
                            Visualização do mapa com marcadores de campus será implementada aqui
                        </p>
                    </div>
                </div>

                {/* Sample Map Markers */}
                <div className="absolute top-1/3 left-1/3 w-8 h-8 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/50 animate-pulse" />
                <div className="absolute top-2/3 right-1/3 w-8 h-8 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/50 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
        </div>
    )
}
