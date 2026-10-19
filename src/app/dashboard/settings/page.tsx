import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import ClearDataButton from '@/components/features/ClearDataButton'
import ManageCategoriesModal from '@/components/features/ManageCategoriesModal'

function SettingsSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 w-32 bg-card border border-card-border rounded-xl"></div>
            <div className="h-44 bg-card border border-card-border rounded-3xl"></div>
            <div className="h-44 bg-card border border-card-border rounded-3xl"></div>
            <div className="h-56 bg-card border border-card-border rounded-3xl"></div>
        </div>
    )
}

async function SettingsContent() {
    await connection()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { count: txCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // Fetch user categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    const safeCategories = categories || []

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-black text-card-foreground tracking-tight">
                    Settings
                </h1>
                <p className="text-xs text-muted font-medium mt-1">
                    Manage your account preferences, categories, and stored data
                </p>
            </div>

            {/* Account Information Card */}
            <section className="bg-card border border-card-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    <h2 className="text-base font-extrabold text-card-foreground">
                        Account Details
                    </h2>
                </div>

                <div className="divide-y divide-card-border text-sm">
                    <div className="py-2.5 flex justify-between items-center">
                        <span className="text-xs font-bold text-muted uppercase">Email Address</span>
                        <span className="font-semibold text-card-foreground">{user.email}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                        <span className="text-xs font-bold text-muted uppercase">Active Transactions</span>
                        <span className="font-semibold text-card-foreground">{txCount || 0} entries</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                        <span className="text-xs font-bold text-muted uppercase">Timezone</span>
                        <span className="font-semibold text-card-foreground">Asia/Manila (UTC+8)</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                        <span className="text-xs font-bold text-muted uppercase">Currency</span>
                        <span className="font-semibold text-card-foreground">Philippine Peso (₱)</span>
                    </div>
                </div>
            </section>

            {/* Categories Management Section */}
            <section className="bg-card border border-card-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏷️</span>
                        <h2 className="text-base font-extrabold text-card-foreground">
                            Categories
                        </h2>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-input-bg border border-input-border text-muted">
                        {safeCategories.length} Total
                    </span>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                    Personalize your categories, choose custom icons and emojis, or delete categories you no longer need.
                </p>

                <div className="pt-2">
                    <ManageCategoriesModal
                        categories={safeCategories}
                        triggerButton={
                            <button
                                type="button"
                                className="px-5 py-3 rounded-2xl bg-spent-violet/10 hover:bg-spent-violet/20 text-spent-violet dark:text-spent-yellow font-extrabold text-sm border border-spent-violet/20 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <span>⚙️</span>
                                <span>Customize Categories</span>
                            </button>
                        }
                    />
                </div>
            </section>

            {/* Danger Zone: Clear Data */}
            <section className="bg-card border border-red-500/20 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <span className="text-xl">⚠️</span>
                    <h2 className="text-base font-extrabold">
                        Danger Zone
                    </h2>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                    Resetting your account wipes all records permanently. This clears your active allocated salary, entire transaction feed, notes, dates, and reset counters for your account only.
                </p>

                <div className="pt-2">
                    <ClearDataButton />
                </div>
            </section>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <SettingsContent />
        </Suspense>
    )
}