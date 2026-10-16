import Link from 'next/link';
import { Suspense } from 'react';
import { signup } from '../actions';

async function SignUpForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams;

    return (
        <form action={signup} className="space-y-6">
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
                <label htmlFor="password" className="block text-sm font-semibold mb-2 text-card-foreground">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-3.5 bg-input-bg border border-input-border rounded-xl text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet focus:border-transparent transition-all shadow-sm"
                />
                <p className="mt-2 text-xs font-medium text-muted">
                    Must be at least 8 characters.
                </p>
            </div>

            {params?.error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{params.error}</p>
                </div>
            )}

            <button
                type="submit"
                className="w-full text-center bg-spent-yellow text-spent-violet-dark font-extrabold text-lg py-4 rounded-xl hover:bg-spent-yellow-dark hover:shadow-lg transition-all shadow-md mt-6 cursor-pointer"
            >
                Create Account
            </button>
        </form>
    );
}

export default function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
            <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-card-border">
                <div className="h-2 w-full bg-spent-yellow"></div>

                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <Link href="/" className="w-16 h-16 bg-spent-violet text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-md mb-6 transform -rotate-3 hover:scale-105 transition-transform">
                            S
                        </Link>
                        <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight">
                            Start Tracking
                        </h2>
                        <p className="text-muted font-medium mt-2 text-sm">
                            Join Spent to take control of your daily budget.
                        </p>
                    </div>

                    <Suspense fallback={<div className="py-8 text-center text-spent-violet animate-pulse font-bold">Loading secure form...</div>}>
                        <SignUpForm searchParams={searchParams} />
                    </Suspense>

                    <div className="mt-8 pt-6 border-t border-card-border text-center space-y-3">
                        <p className="text-sm font-medium text-muted">
                            Already have an account?{' '}
                            <Link href="/login" className="text-spent-violet font-extrabold hover:opacity-80 transition-opacity">
                                Sign In
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