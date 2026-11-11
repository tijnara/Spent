import Link from 'next/link'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
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
                            Welcome Back
                        </h2>
                        <p className="text-muted font-medium mt-2 text-sm">
                            Enter your credentials to access your daily budget.
                        </p>
                    </div>

                    <Suspense fallback={<div className="py-8 text-center text-spent-violet animate-pulse font-bold">Loading secure form...</div>}>
                        <LoginForm />
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
    )
}
