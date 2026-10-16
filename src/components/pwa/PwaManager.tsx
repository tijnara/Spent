'use client'

import { useEffect, useState } from 'react'
import { addTransaction } from '@/app/dashboard/actions'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaManager() {
    const [isOnline, setIsOnline] = useState(true)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallBtn, setShowInstallBtn] = useState(false)
    const [isIos, setIsIos] = useState(false)
    const [showIosPrompt, setShowIosPrompt] = useState(false)
    const [syncCount, setSyncCount] = useState(0)

    // 1. Register Service Worker and listen to connection
    useEffect(() => {
        setIsOnline(navigator.onLine)

        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            navigator.serviceWorker
                .register('/sw.js')
                .catch((err) => console.log('SW registration skipped:', err))
        }

        const handleOnline = () => {
            setIsOnline(true)
            syncOfflineQueue()
        }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Check for iOS (where beforeinstallprompt doesn't fire)
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isAppleDevice = /iphone|ipad|ipod/.test(userAgent)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        if (isAppleDevice && !isStandalone) {
            setIsIos(true)
            setShowInstallBtn(true)
        }

        // Android & Desktop install prompt
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowInstallBtn(true)
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstall)

        // Initial check for queued offline transactions
        syncOfflineQueue()

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        }
    }, [])

    // 2. Offline Sync Function: Flush offline queue to Supabase
    async function syncOfflineQueue() {
        const rawQueue = localStorage.getItem('spent_offline_queue')
        if (!rawQueue) return

        try {
            const queue: Array<Record<string, string>> = JSON.parse(rawQueue)
            if (queue.length === 0) return

            setSyncCount(queue.length)

            for (const item of queue) {
                const formData = new FormData()
                Object.entries(item).forEach(([key, value]) => formData.set(key, value))
                await addTransaction(formData)
            }

            localStorage.removeItem('spent_offline_queue')
            setSyncCount(0)
            window.location.reload()
        } catch (err) {
            console.error('Failed to sync offline items:', err)
        }
    }

    // 3. Trigger Native Install
    async function handleInstallClick() {
        if (isIos) {
            setShowIosPrompt(true)
            return
        }

        if (!deferredPrompt) return
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setShowInstallBtn(false)
        }
        setDeferredPrompt(null)
    }

    return (
        <>
            {/* Offline Alert Banner */}
            {!isOnline && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-stone-900 py-1.5 px-4 text-center text-xs font-black shadow-md flex items-center justify-center gap-2">
                    <span>⚡ You are currently offline.</span>
                    <span className="font-medium">Spent will save transactions locally and sync when reconnected.</span>
                </div>
            )}

            {/* Syncing Toast */}
            {syncCount > 0 && (
                <div className="fixed bottom-20 left-4 z-50 bg-spent-violet text-white py-2 px-4 rounded-xl text-xs font-bold shadow-xl animate-bounce">
                    🔄 Syncing {syncCount} offline transaction{syncCount > 1 ? 's' : ''}...
                </div>
            )}

            {/* Install / Download Button (Shows if app is not yet installed) */}
            {showInstallBtn && (
                <div className="fixed top-3 right-28 sm:right-36 z-40">
                    <button
                        onClick={handleInstallClick}
                        className="flex items-center gap-1.5 bg-spent-yellow text-spent-violet-dark px-3 py-1.5 rounded-xl font-black text-xs shadow-md hover:bg-spent-yellow-dark hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        <span>📥</span>
                        <span>Install App</span>
                    </button>
                </div>
            )}

            {/* iOS Instructions Modal */}
            {showIosPrompt && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-card border border-card-border p-6 rounded-3xl max-w-sm w-full shadow-2xl text-center space-y-4">
                        <div className="w-12 h-12 bg-spent-violet text-white rounded-2xl mx-auto flex items-center justify-center text-2xl font-black">
                            S
                        </div>
                        <h3 className="text-lg font-extrabold text-card-foreground">
                            Install Spent on iPhone / iPad
                        </h3>
                        <ol className="text-left text-xs space-y-2 text-muted font-medium bg-input-bg p-4 rounded-2xl border border-card-border">
                            <li>1. Tap the <strong>Share</strong> button (⎋ with arrow) in Safari.</li>
                            <li>2. Scroll down and tap <strong>Add to Home Screen</strong> (➕).</li>
                            <li>3. Tap <strong>Add</strong> at the top right corner.</li>
                        </ol>
                        <button
                            onClick={() => setShowIosPrompt(false)}
                            className="w-full py-3 bg-spent-yellow text-spent-violet-dark font-extrabold text-sm rounded-xl"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}