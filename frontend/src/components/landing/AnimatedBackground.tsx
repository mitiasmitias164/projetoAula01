export function AnimatedBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Animated gradient orbs */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-40 animate-pulse"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%)',
                    animationDuration: '8s'
                }} />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 animate-pulse"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.08) 50%, transparent 100%)',
                    animationDuration: '10s',
                    animationDelay: '2s'
                }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-35 animate-pulse"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 50%, transparent 100%)',
                    animationDuration: '12s',
                    animationDelay: '4s'
                }} />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d4ff08_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
    )
}
