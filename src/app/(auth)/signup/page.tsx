import Link from 'next/link';
import { Suspense } from 'react';
import { signup } from '../actions';

async function SignUpForm({
                              searchParams,
                          }: {
    searchParams: Promise<{ error?: string; message?: string }>;
}) {
    const params = await searchParams;

    // Show check-inbox screen once Supabase dispatches confirmation email
    if (params?.message) {
        return (
            <div className="text-center space-y-5 py-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] text-2xl flex items-center justify-center mx-auto shadow-sm">
                    📩
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        Check your email
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
                        {params.message}
                    </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0B0813] border border-white/[0.08] text-[11px] text-zinc-400 space-y-1">
                    <p className="font-semibold text-zinc-300">Target redirect:</p>
                    <p className="font-mono text-[#FACC15] text-[10px] break-all">
                        spent-wave.vercel.app/auth/callback?next=/onboarding
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        href="/login"
                        className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                        Verified? Sign In →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form action={signup} className="space-y-4">
            {/* Optional First Name / Nickname */}
            <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>First Name or Nickname</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Optional</span>
                </label>
                <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="e.g. Carlo, Maria"
                    className="w-full bg-[#0B0813] border border-white/[0.08] focus:border-[#FACC15]/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-zinc-300 block">
                    Email Address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full bg-[#0B0813] border border-white/[0.08] focus:border-[#FACC15]/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold text-zinc-300 block">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-[#0B0813] border border-white/[0.08] focus:border-[#FACC15]/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
                <p className="text-[10px] font-medium text-zinc-500">
                    Must be at least 8 characters.
                </p>
            </div>

            {/* Error Banner */}
            {params?.error && (
                <div className="p-3.5 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] text-xs font-semibold text-center animate-in fade-in">
                    {params.error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full py-3.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#0B0813] font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer mt-2"
            >
                Create Account →
            </button>

            {/* Privacy Guarantee Strip */}
            <div className="pt-2 border-t border-white/[0.06] text-center">
                <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                    <span>🔒</span>
                    <span>No bank credentials or SMS read permissions needed.</span>
                </p>
            </div>
        </form>
    );
}

export default function SignUpPage({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ error?: string; message?: string }>;
}) {
    return (
        <div className="min-h-screen bg-[#0B0813] text-foreground flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#0B0813] font-sans">
            {/* Top Brand Bar */}
            <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-[#FACC15] text-[#0B0813] font-black flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform shrink-0">
                        S
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">Spent</span>
                </Link>

                <p className="text-xs text-zinc-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-white hover:text-[#FACC15] font-bold transition-colors">
                        Sign In
                    </Link>
                </p>
            </header>

            {/* Centered Auth Card Container */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-spent-violet/15 rounded-full blur-[140px] pointer-events-none -z-10" />

                <div className="w-full max-w-md bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                    <div className="text-center space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-2.5 py-1 rounded-full inline-block">
                            Start in 5 seconds
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Create your account
                        </h1>
                        <p className="text-xs text-zinc-400">
                            Track every centavo between your 15/30 paydays.
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="py-8 text-center text-zinc-400 animate-pulse font-bold text-xs">
                                Loading secure form...
                            </div>
                        }
                    >
                        <SignUpForm searchParams={searchParams} />
                    </Suspense>

                    <div className="pt-2 text-center">
                        <Link
                            href="/"
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
                        >
                            <span>←</span>
                            <span>Back to landing page</span>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="w-full py-4 text-center text-xs text-zinc-600">
                <p>© 2026 Spent. 100% private & manual.</p>
            </footer>
        </div>
    );
}