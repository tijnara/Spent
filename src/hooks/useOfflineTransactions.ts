'use client'

import { useEffect, useState } from 'react'

export interface OfflineTransaction extends Record<string, string> {
    queue_id: string
    type: 'expense' | 'income'
    amount: string
    transaction_date: string
    created_at: string
}

const OFFLINE_QUEUE_KEY = 'spent_offline_queue'
const QUEUE_UPDATED_EVENT = 'spent:offline-queue-updated'

export function readOfflineTransactions(): OfflineTransaction[] {
    try {
        const stored = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
        if (!Array.isArray(stored)) return []
        return stored.filter((item): item is OfflineTransaction =>
            item && typeof item === 'object' &&
            typeof item.queue_id === 'string' &&
            typeof item.type === 'string' &&
            typeof item.amount === 'string'
        )
    } catch {
        return []
    }
}

export function saveOfflineTransaction(formData: FormData): OfflineTransaction {
    let queue = readOfflineTransactions()
    const transaction = Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
    ) as Record<string, string>

    const saved: OfflineTransaction = {
        ...transaction,
        queue_id: Date.now() + '-' + Math.random().toString(36).slice(2),
        created_at: new Date().toISOString(),
    }

    queue = [...queue, saved]
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
    window.dispatchEvent(new Event(QUEUE_UPDATED_EVENT))
    return saved
}

export function useOfflineTransactions(): OfflineTransaction[] {
    const [transactions, setTransactions] = useState<OfflineTransaction[]>([])

    useEffect(() => {
        const refresh = () => setTransactions(readOfflineTransactions())
        refresh()
        window.addEventListener(QUEUE_UPDATED_EVENT, refresh)
        window.addEventListener('storage', refresh)
        return () => {
            window.removeEventListener(QUEUE_UPDATED_EVENT, refresh)
            window.removeEventListener('storage', refresh)
        }
    }, [])

    return transactions
}
