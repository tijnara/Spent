'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { addTransaction } from '@/app/dashboard/actions'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PAGE_CACHE_NAME = 'spent-pages-v3'
const STATIC_CACHE_NAME = 'spent-static-v3'

async function cacheCurrentPage(pathname: string) {
    if (!navigator.onLine || !('caches' in window)) return

    const pageUrl = new URL(pathname, window.location.origin)
    pageUrl.search = ''
    try {
        const response = await fetch(pageUrl.toString(), {
            cache: 'no-store',
            credentials: 'same-origin',
        })
        if (
            response.ok &&
            !response.redirected &&
            response.headers.get('content-type')?.includes('text/html') &&
            new URL(response.url).pathname === pageUrl.pathname
        ) {
            const pageCache = await caches.open(PAGE_CACHE_NAME)
            await pageCache.put(pageUrl.toString(), response.clone())
        }

        const assetCache = await caches.open(STATIC_CACHE_NAME)
        const assetUrls = Array.from(document.querySelectorAll('script[src], link[href]'))
            .map((element) => element instanceof HTMLScriptElement
                ? element.src
                : (element as HTMLLinkElement).href)
            .filter((assetUrl) => {
                const url = new URL(assetUrl, window.location.origin)
                return url.origin === window.location.origin && url.pathname.startsWith('/_next/static/')
            })

        await Promise.allSettled(assetUrls.map(async (assetUrl) => {
            const cached = await assetCache.match(assetUrl)
            if (cached) return
            const asset = await fetch(assetUrl, { credentials: 'same-origin' })
            if (asset.ok) await assetCache.put(assetUrl, asset.clone())
        }))
    } catch (error) {
        console.warn('Could not cache the current Spent page for offline use:', error)
    }
}

export default function PwaManager() {
    const pathname = usePathname()
    const [isOnline, setIsOnline] = useState(true)
    const [pendingTransactions, setPendingTransactions] = useState<Array<Record<string, string>>>([])
    const [showPendingTransactions, setShowPendingTransactions] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallBtn, setShowInstallBtn] = useState(false)
    const [isIos, setIsIos] = useState(false)
    const [showIosPrompt, setShowIosPrompt] = useState(false)
    const [syncCount, setSyncCount] = useState(0)

    function refreshPendingTransactions() {
        try {
            const queue = JSON.parse(localStorage.getItem('spent_offline_queue') || '[]') as Array<Record<string, string>>
            setPendingTransactions(queue)
        } catch {
            setPendingTransactions([])
        }
    }

    // 1. Register the service worker, cache this page, and listen to connection changes
    useEffect(() => {
        setIsOnline(navigator.onLine)
        refreshPendingTransactions()

        if (process.env.NODE_ENV === 'production') {
            const timer = window.setTimeout(() => {
                void cacheCurrentPage(pathname)
            }, 250)
            return () => window.clearTimeout(timer)
        }
    }, [pathname, isOnline])

    useEffect(() => {
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
        const handleAuthReady = () => syncOfflineQueue()

        const handleQueueUpdated = () => refreshPendingTransactions()
        const handleOfflineAppNavigation = (event: MouseEvent) => {
            if (navigator.onLine || event.defaultPrevented || event.button !== 0 ||
                event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

            const target = event.target
            if (!(target instanceof Element)) return
            const link = target.closest('a[href]') as HTMLAnchorElement | null
            if (!link || link.target || link.hasAttribute('download')) return

            const destination = new URL(link.href, window.location.origin)
            if (destination.origin !== window.location.origin) return

            event.preventDefault()
            window.location.assign(destination.toString())
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        window.addEventListener('spent:offline-queue-updated', handleQueueUpdated)
        window.addEventListener('spent:auth-ready', handleAuthReady)
        document.addEventListener('click', handleOfflineAppNavigation, true)

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
            window.removeEventListener('spent:offline-queue-updated', handleQueueUpdated)
            window.removeEventListener('spent:auth-ready', handleAuthReady)
            document.removeEventListener('click', handleOfflineAppNavigation, true)
        }
    }, [])

    // 2. Offline Sync Function: Flush queued transactions one at a time.
    // Remove an entry only after the server action succeeds so failed syncs never lose data.
    async function syncOfflineQueue() {
        if (!navigator.onLine) return

        const rawQueue = localStorage.getItem('spent_offline_queue')
        if (!rawQueue) return

        try {
            let queue: Array<Record<string, string>> = (JSON.parse(rawQueue) as Array<Record<string, string>>).map((item) => ({
                ...item,
                queue_id: item.queue_id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            }))
            if (queue.length === 0) return

            localStorage.setItem('spent_offline_queue', JSON.stringify(queue))
            setPendingTransactions(queue)
            setSyncCount(queue.length)

            while (queue.length > 0) {
                const [item] = queue
                const formData = new FormData()
                Object.entries(item).forEach(([key, value]) => {
                    if (key !== 'queue_id') formData.set(key, value)
                })
                await addTransaction(formData)

                const latestQueue = JSON.parse(localStorage.getItem('spent_offline_queue') || '[]') as Array<Record<string, string>>
                queue = latestQueue.filter((candidate) => candidate.queue_id !== item.queue_id)
                if (queue.length > 0) {
                    localStorage.setItem('spent_offline_queue', JSON.stringify(queue))
                } else {
                    localStorage.removeItem('spent_offline_queue')
                }
                setPendingTransactions(queue)
                setSyncCount(queue.length)
            }

            window.location.reload()
        } catch (err) {
            refreshPendingTransactions()
            window.dispatchEvent(new Event('spent:offline-queue-updated'))
            console.error('Failed to sync offline items. They remain saved on this device:', err)
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
                <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-stone-900 py-1.5 px-4 text-center text-xs font-black shadow-md flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                    <span>⚡ You are currently offline.</span>
                    <span className="font-medium">You are viewing the last saved page. New transactions will sync when reconnected.</span>
                    {pendingTransactions.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowPendingTransactions(true)}
                            className="rounded-lg bg-stone-900/10 px-2 py-1 font-black underline"
                        >
                            Review {pendingTransactions.length} saved
                        </button>
                    )}
                </div>
            )}

            {showPendingTransactions && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowPendingTransactions(false)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pending-transactions-title"
                        className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-3xl border border-card-border bg-card p-6 text-card-foreground shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 id="pending-transactions-title" className="text-lg font-extrabold">
                                    Saved on this device
                                </h2>
                                <p className="mt-1 text-xs text-muted">
                                    These entries use the same transaction fields and will be added to your account after sync.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPendingTransactions(false)}
                                aria-label="Close saved transactions"
                                className="rounded-lg px-2 py-1 text-xl font-bold text-muted hover:text-card-foreground"
                            >
                                ×
                            </button>
                        </div>
                        <ul className="divide-y divide-card-border">
                            {pendingTransactions.map((item, index) => (
                                <li key={item.queue_id || index} className="flex items-start justify-between gap-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold">
                                            {item.new_category_name || (item.category_id ? 'Selected category' : 'Uncategorized')}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {[item.transaction_date, item.note].filter(Boolean).join(' · ')}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-extrabold tabular-nums">
                                        {item.type === 'income' ? '+' : '−'}₱{Number(item.amount || 0).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() => setShowPendingTransactions(false)}
                            className="mt-5 w-full rounded-xl bg-spent-violet px-4 py-3 text-sm font-extrabold text-white"
                        >
                            Back to dashboard
                        </button>
                    </section>
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