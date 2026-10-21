import Link from 'next/link'

export default function ConversionSection() {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* Left (7 Cols): Frictionless Auth Entry */}
                <div className="lg:col-span-7 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-xl">
                    <div className="space-y-4">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-3 py-1 rounded-full inline-block">
                            Start in 5 seconds
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Track your next cutoff without password fatigue.
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                            Don&apos;t let sign-up friction stall your budgeting habit. One tap links your account securely without email verification hurdles.
                        </p>
                    </div>

                    <div className="mt-8 space-y-3">
                        {/* 1-Tap Google OAuth Action */}
                        <Link
                            href="/login?provider=google"
                            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-[#0B0813] font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg cursor-pointer"
                        >
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </Link>

                        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 px-1">
                            <span>Instant session setup</span>
                            <span>•</span>
                            <Link href="/login" className="hover:text-zinc-300 font-semibold transition-colors">
                                Use email / Magic link instead →
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