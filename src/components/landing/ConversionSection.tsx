import Link from 'next/link'

export default function ConversionSection() {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* Left (7 Cols): Account Creation Entry */}
                <div className="lg:col-span-7 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-xl">
                    <div className="space-y-4">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-3 py-1 rounded-full inline-block">
                            Start in 5 seconds
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Track your next cutoff without friction.
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                            Don&apos;t let setup friction stall your budgeting habit. Calibrate your 15/30 payday runway in seconds with zero financial exposure.
                        </p>
                    </div>

                    <div className="mt-8 space-y-3">
                        {/* Primary Sign Up CTA */}
                        <Link
                            href="/signup"
                            className="w-full py-4 px-6 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B0813] font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
                        >
                            <span>Create Free Account</span>
                            <span className="text-base font-bold">→</span>
                        </Link>

                        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 px-1">
                            <span>Instant setup • No card required</span>
                            <span>•</span>
                            <Link href="/login" className="hover:text-zinc-300 font-semibold transition-colors">
                                Already have an account? Sign In →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right (5 Cols): Local Trust & Privacy Callout */}
                <div className="lg:col-span-5 bg-[#0B0813] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center text-lg">
                            🛡️
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight">
                            Zero Bank Logins. 100% Private.
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Your financial privacy is non-negotiable. Spent operates entirely on manual and offline inputs.
                        </p>
                    </div>

                    <div className="space-y-3 border-t border-white/[0.06] pt-5 text-xs">
                        <div className="flex items-start gap-2.5">
                            <span className="text-[#34D399] font-bold shrink-0">✓</span>
                            <span className="text-zinc-300"><strong className="text-white">No bank credentials</strong> required. No Open Banking syncs.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <span className="text-[#34D399] font-bold shrink-0">✓</span>
                            <span className="text-zinc-300"><strong className="text-white">No SMS scraping</strong>. We never ask for Android SMS read permissions.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <span className="text-[#34D399] font-bold shrink-0">✓</span>
                            <span className="text-zinc-300"><strong className="text-white">Local-first queue</strong>. All numbers are under your explicit manual control.</span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-400 font-medium text-center">
                        🔒 No bank accounts linked. 100% under your control.
                    </div>
                </div>

            </div>
        </section>
    )
}