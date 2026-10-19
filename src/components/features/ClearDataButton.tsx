'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearAllUserData } from '../../app/dashboard/actions'

export default function ClearDataButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [isClearing, setIsClearing] = useState(false)
    const router = useRouter()

    async function handleClearData() {
        if (confirmText.trim().toUpperCase() !== 'CLEAR') {
            alert('Please type "CLEAR" to proceed.')
            return
        }

        setIsClearing(true)
        try {
            // 1. Purge local offline queue
            localStorage.removeItem('spent_offline_queue')

            // 2. Clear database records via Server Action
            await clearAllUserData()

            setIsOpen(false)
            setConfirmText('')
            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('An error occurred while clearing your data. Please try again.')
        } finally {
            setIsClearing(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm border border-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
                <span>🗑️</span>
                <span>Reset & Clear All Data</span>
            </button>

            {/* Confirmation Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md bg-card border border-card-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mx-auto">
                            ⚠️
                        </div>

                        <div className="text-center space-y-1.5">
                            <h3 className="text-xl font-extrabold text-card-foreground">
                                Clear All Account Data?
                            </h3>
                            <p className="text-xs text-muted leading-relaxed">
                                This will permanently delete your <strong>allocated salary</strong>, <strong>salary history</strong>, and <strong>all expense and income records</strong>. This action cannot be reversed.
                            </p>
                        </div>

                        <div className="bg-input-bg border border-input-border rounded-2xl p-4 text-xs space-y-2">
                            <label className="block text-muted font-bold uppercase tracking-wider">
                                Type <span className="text-red-500 font-extrabold">CLEAR</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="CLEAR"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-input-border text-input-text font-bold text-center uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isClearing}
                                onClick={() => {
                                    setIsOpen(false)
                                    setConfirmText('')
                                }}
                                className="w-full py-3 rounded-xl border border-card-border text-muted hover:text-card-foreground font-bold text-sm transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isClearing || confirmText.trim().toUpperCase() !== 'CLEAR'}
                                onClick={handleClearData}
                                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-extrabold text-sm transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isClearing ? 'Purging...' : 'Delete Everything'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}