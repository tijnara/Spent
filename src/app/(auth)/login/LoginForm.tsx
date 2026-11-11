'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(searchParams.get('error') || '')
    const [loading, setLoading] = useState(false)
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        const updateStatus = () => setIsOffline(!navigator.onLine)
        updateStatus()
        window.addEventListener('online', updateStatus)
        window.addEventListener('offline', updateStatus)
        return () => {
            window.removeEventListener('online', updateStatus)
            window.removeEventListener('offline', updateStatus)
        }
    }, [])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const supabase = createClient()
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
            if (signInError) {
                setError(signInError.message)
                return
            }

            router.replace('/dashboard')
            router.refresh()
        } catch (cause) {
            const message = cause instanceof Error ? cause.message : ''
            if (!navigator.onLine || /network|fetch|offline|failed to fetch/i.test(message)) {
                setIsOffline(true)
                setError('Sign in needs an internet connection. You can keep logging expenses in offline mode.')
            } else {
                setError(message || 'We could not sign you in. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2 text-card-foreground">
                    Email address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full px-4 py-3.5 bg-input-bg border border-input-border rounded-xl text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet focus:border-transparent transition-all shadow-sm"
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
                    {(isOffline || /internet connection|offline mode/i.test(error)) && (
                        <Link href="/offline.html" className="mt-2 inline-block text-sm font-bold text-spent-violet underline">
                            Open offline mode
                        </Link>
                    )}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full text-center bg-spent-violet text-white font-extrabold text-lg py-4 rounded-xl hover:bg-spent-violet-dark hover:shadow-lg transition-all shadow-md mt-6 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
                {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <Link href="/offline.html" className="block text-center text-sm font-bold text-spent-violet hover:underline">
                Continue in offline mode
            </Link>
        </form>
    )
}
