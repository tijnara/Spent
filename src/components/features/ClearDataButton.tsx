'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearAllData } from '../../app/dashboard/actions'

export default function ClearDataButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [confirmInput, setConfirmInput] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleClear() {
        if (confirmInput.trim().toUpperCase() !== 'RESET') {
            alert('Please type RESET in capital letters to confirm.')
            return
        }

        setLoading(true)

        try {
            // 1. Wipe offline localStorage queue
            if (typeof window !== 'undefined') {
                localStorage.removeItem('spent_offline_queue')
            }

            // 2. Wipe Supabase transactions and reset salary
            await clearAllData()

            setIsOpen(false)
            router.push('/dashboard')
            router.refresh()
        } catch (err) {
            console.error(err)
            alert('Failed to clear data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-extrabold text-sm rounded-2xl border border-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
                <span>⚠️</span>
                <span>Reset & Clear All Data</span>
            </button>

            {/* Confirmation Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md bg-card border border-card-border rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
                        <div className="flex items-center gap-3 text-red-500">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-2xl font-black">
                                🗑️
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-card-foreground">
                                    Clear All Account Data?
                                </h3>
                                <p className="text-xs text-muted font-medium">
                                    This action is permanent and cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="bg-input-bg border border-input-border rounded-2xl p-4 text-xs space-y-2 text-muted">
                            <p className="font-semibold text-card-foreground">
                                This will permanently remove:
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Current allocated salary baseline</li>
                                <li>All recorded salary history</li>
                                <li>All expense logs and transaction history</li>
                                <li>Any offline queued transactions pending sync</li>
                            </ul>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                                Type <span className="text-red-500 font-black">RESET</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                placeholder="RESET"
                                autoFocus
                                className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm font-bold text-input-text focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-muted/60"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => {
                                    setIsOpen(false)
                                    setConfirmInput('')
                                }}
                                className="flex-1 py-3 bg-input-bg hover:bg-input-bg/70 text-card-foreground font-bold text-sm rounded-xl border border-card-border transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={loading || confirmInput.trim().toUpperCase() !== 'RESET'}
                                onClick={handleClear}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? 'Clearing...' : 'Permanently Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}