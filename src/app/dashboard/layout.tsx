import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'

async function UserProfileHeader() {
    await connection()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    return (
        <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-medium text-muted">
                {user.email}
            </span>
            <Link
                href="/dashboard/settings"
                className="text-xs sm:text-sm font-semibold text-muted hover:text-card-foreground transition-colors py-1.5 px-3 rounded-lg border border-card-border hover:border-spent-violet/40 flex items-center gap-1.5"
            >
                <span>⚙️</span>
                <span className="hidden sm:inline">Settings</span>
            </Link>
            <form action={signOut}>
                <button
                    type="submit"
                    className="text-xs sm:text-sm font-semibold text-muted hover:text-red-500 transition-colors py-1.5 px-3 rounded-lg border border-card-border hover:border-red-500/30 cursor-pointer"
                >
                    Sign Out
                </button>
            </form>
        </div>
    )
}

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-between">
            {/* Top Navbar */}
            <header className="sticky top-0 z-30 bg-card border-b border-card-border px-4 py-3 sm:px-8">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-spent-violet text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                            S
                        </div>
                        <span className="text-xl font-extrabold text-card-foreground tracking-tight">
                            Spent
                        </span>
                    </Link>

                    <Suspense fallback={<div className="h-8 w-24 bg-input-bg rounded-lg animate-pulse" />}>
                        <UserProfileHeader />
                    </Suspense>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 pb-28 sm:pb-12">
                {children}
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-card-border px-6 py-2 flex items-center justify-around">
                <Link
                    href="/dashboard"
                    className="flex flex-col items-center gap-1 text-spent-violet dark:text-spent-violet-light font-bold text-xs"
                >
                    <span className="text-xl">🏠</span>
                    <span>Home</span>
                </Link>
                <Link
                    href="/dashboard#analytics"
                    className="flex flex-col items-center gap-1 text-muted hover:text-card-foreground font-medium text-xs transition-colors"
                >
                    <span className="text-xl">📊</span>
                    <span>Stats</span>
                </Link>
                <Link
                    href="/dashboard/settings"
                    className="flex flex-col items-center gap-1 text-muted hover:text-card-foreground font-medium text-xs transition-colors"
                >
                    <span className="text-xl">⚙️</span>
                    <span>Settings</span>
                </Link>
            </nav>
        </div>
    )
}