import Link from 'next/link';
import { Suspense } from 'react';
import { login } from '../actions';

async function LoginForm({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
    const params = await searchParams;

    return (
        <form action={login} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2 text-card-foreground">
                    Email address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-3.5 bg-input-bg border border-input-border rounded-xl text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet focus:border-transparent transition-all shadow-sm"
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-card-foreground">
                        Password
                    </label>
                </div>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3.5 bg-input-bg border border-input-border rounded-xl text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet focus:border-transparent transition-all shadow-sm"
                />
            </div>

            {/* Error Banner */}
            {params?.error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{params.error}</p>
                </div>
            )}

            {/* Info / Email Sent Banner */}
            {params?.message && (
                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">{params.message}</p>
                </div>
            )}

            <button
                type="submit"
                className="w-full text-center bg-spent-violet text-white font-extrabold text-lg py-4 rounded-xl hover:bg-spent-violet-dark hover:shadow-lg transition-all shadow-md mt-6 cursor-pointer"
            >
                Sign In
            </button>
        </form>
    );
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
            <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-card-border">
                {/* Brand Accent Bar */}
                <div className="h-2 w-full bg-spent-yellow"></div>

                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <Link href="/" className="w-16 h-16 bg-spent-violet text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-md mb-6 transform -rotate-3 hover:scale-105 transition-transform">
                            S
                        </Link>
                        <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-muted font-medium mt-2 text-sm">
                            Enter your credentials to access your daily budget.
                        </p>
                    </div>

                    <Suspense fallback={<div className="py-8 text-center text-spent-violet animate-pulse font-bold">Loading secure form...</div>}>
                        <LoginForm searchParams={searchParams} />
                    </Suspense>

                    <div className="mt-8 pt-6 border-t border-card-border text-center space-y-3">
                        <p className="text-sm font-medium text-muted">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-spent-violet font-extrabold hover:opacity-80 transition-opacity">
                                Create Account
                            </Link>
                        </p>
                        <div>
                            <Link href="/" className="text-xs text-muted hover:text-card-foreground transition-colors">
                                ← Back to landing page
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}