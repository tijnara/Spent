'use client'

import ActiveCycleExpensesList from '@/components/features/ActiveCycleExpensesList'
import InputSalaryModal from '@/components/features/InputSalaryModal'
import { formatManilaDateTime } from '@/lib/date'
import { useOfflineTransactions, type OfflineTransaction } from '@/hooks/useOfflineTransactions'
import type { Category } from './EditTransactionModal'

interface RelatedCategoryData {
    id: string
    name: string
    icon: string
    color?: string
}

interface TransactionRecord {
    id: string
    amount: number
    type: 'expense' | 'income'
    note: string | null
    transaction_date: string
    created_at: string
    category_id: string | null
    categories: RelatedCategoryData | RelatedCategory[] | null
    categoryName?: string
    categoryIcon?: string
}

interface ActiveCycleExpense {
    id: string
    amount: number
    type: 'expense' | 'income'
    note: string | null
    transaction_date: string
    created_at?: string
    category_id: string | null
    categories: RelatedCategoryData | RelatedCategory[] | null
    categoryName?: string
    categoryIcon?: string
}

interface DashboardOverviewProps {
    transactions: TransactionRecord[]
    categories: Category[]
    today: string
    totalSalaryInputted: number
    activeSalaryDeducted: number
    activeCycle: {
        createdAt: string
        startDate: string
        note: string
        expenses: ActiveCycleExpense[]
    } | null
}

interface DisplayTransaction {
    id: string
    amount: number
    type: 'expense' | 'income'
    note: string
    transaction_date: string
    created_at: string
    categoryName: string
    categoryIcon: string
    isOffline: boolean
}

function getCategory(transaction: TransactionRecord, categories: Category[]) {
    const related = Array.isArray(transaction.categories)
        ? transaction.categories[0]
        : transaction.categories
    const fallback = categories.find((category) => category.id === transaction.category_id)
    return {
        name: transaction.categoryName || related?.name || fallback?.name || 'Uncategorized',
        icon: transaction.categoryIcon || related?.icon || fallback?.icon || '🏷️',
    }
}

function pendingCategory(transaction: OfflineTransaction, categories: Category[]) {
    const category = categories.find((item) => item.id === transaction.category_id)
    return {
        name: transaction.new_category_name || category?.name || 'Uncategorized',
        icon: category?.icon || '🏷️',
    }
}

export default function DashboardOfflineOverview({
    transactions,
    categories,
    today,
    totalSalaryInputted,
    activeSalaryDeducted,
    activeCycle,
}: DashboardOverviewProps) {
    const pending = useOfflineTransactions()
    const displayTransactions: DisplayTransaction[] = [
        ...transactions.map((transaction) => {
            const category = getCategory(transaction, categories)
            return {
                id: transaction.id,
                amount: Number(transaction.amount),
                type: transaction.type,
                note: transaction.note || '',
                transaction_date: transaction.transaction_date,
                created_at: transaction.created_at,
                categoryName: category.name,
                categoryIcon: category.icon,
                isOffline: false,
            }
        }),
        ...pending.map((transaction) => {
            const category = pendingCategory(transaction, categories)
            return {
                id: transaction.queue_id,
                amount: Number(transaction.amount),
                type: transaction.type,
                note: transaction.note || '',
                transaction_date: transaction.transaction_date,
                created_at: transaction.created_at || transaction.transaction_date,
                categoryName: category.name,
                categoryIcon: category.icon,
                isOffline: true,
            }
        }),
    ]

    const spentToday = displayTransactions
        .filter((transaction) => transaction.type === 'expense' && transaction.transaction_date === today)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    const totalExpense = displayTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    const totalIncome = displayTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    const netBalance = totalIncome - totalExpense

    const activePendingExpenses = activeCycle
        ? pending.filter((transaction) => {
            if (transaction.type !== 'expense') return false
            const savedAt = new Date(transaction.created_at || transaction.transaction_date).getTime()
            return savedAt >= new Date(activeCycle.createdAt).getTime()
        })
        : []
    const projectedDeducted = activeSalaryDeducted + activePendingExpenses
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    const remainingSalary = totalSalaryInputted - projectedDeducted
    const remainingPercent = totalSalaryInputted > 0
        ? Math.max(0, Math.min(100, (remainingSalary / totalSalaryInputted) * 100))
        : 0

    const recentTransactions = [...displayTransactions]
        .sort((a, b) => {
            const dateDifference = b.transaction_date.localeCompare(a.transaction_date)
            return dateDifference || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        .slice(0, 10)

    return (
        <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-card-border p-5 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="h-1.5 w-16 bg-spent-yellow rounded-full mb-3"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Spent Today</span>
                    <p className="text-3xl font-black text-card-foreground mt-1 tabular-nums">
                        ₱{spentToday.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs text-muted mt-2 block font-medium">Resets at midnight (Manila Time)</span>
                </div>
                <div className="bg-card border border-card-border p-5 rounded-3xl shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Net Balance</span>
                    <p className={'text-3xl font-black mt-1 tabular-nums ' + (netBalance >= 0 ? 'text-card-foreground' : 'text-red-500')}>
                        ₱{netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs text-muted mt-2 block font-medium">All income minus expenses</span>
                </div>
                <div className="bg-card border border-card-border p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Activity Summary</span>
                    <div className="flex justify-between items-center mt-2">
                        <div>
                            <span className="text-xs text-muted block">Total In</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                +₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-card-border"></div>
                        <div>
                            <span className="text-xs text-muted block">Total Out</span>
                            <span className="font-extrabold text-red-500 tabular-nums">
                                -₱{totalExpense.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-card border border-card-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-card-border mb-6">
                    <div>
                        <h2 className="text-lg font-extrabold text-card-foreground flex items-center gap-2">
                            <span>💼</span><span>Salary &amp; Expense Deduction</span>
                        </h2>
                        <p className="text-xs text-muted font-medium mt-0.5">
                            Real-time budget deductions for the active salary period
                        </p>
                    </div>
                    <InputSalaryModal
                        lastSalaryAmount={totalSalaryInputted}
                        lastSalaryNote={activeCycle?.note || 'ACTIVE SALARY'}
                        lastSalaryDate={activeCycle?.startDate}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-spent-violet"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted">Allocated Salary</span>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-card-foreground tabular-nums">
                            ₱{totalSalaryInputted.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted font-medium">
                            {activeCycle?.createdAt
                                ? 'Active baseline set on ' + formatManilaDateTime(activeCycle.createdAt)
                                : 'Tap "Set Salary" to record your starting baseline'}
                        </p>
                    </div>

                    <div className="space-y-3 md:border-l md:border-card-border md:pl-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={'h-2 w-2 rounded-full ' + (remainingSalary >= 0 ? 'bg-emerald-500' : 'bg-red-500')}></span>
                                <span className="text-xs font-bold uppercase tracking-wider text-muted">Remaining Salary</span>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 bg-input-bg border border-input-border rounded-lg text-muted">
                                {remainingPercent.toFixed(1)}% Left
                            </span>
                        </div>
                        <p className={'text-3xl sm:text-4xl font-black tabular-nums ' + (remainingSalary >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                            ₱{remainingSalary.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className="space-y-1.5">
                            <div className="w-full bg-input-bg border border-input-border h-2.5 rounded-full overflow-hidden">
                                <div
                                    className={'h-full transition-all duration-500 ' + (remainingSalary >= 0 ? 'bg-spent-yellow' : 'bg-red-500')}
                                    style={{ width: remainingPercent + '%' }}
                                ></div>
                            </div>
                            <p className="text-xs text-muted font-medium flex justify-between">
                                <span>Total Deducted: -₱{projectedDeducted.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>{totalSalaryInputted > 0 ? (100 - remainingPercent).toFixed(1) + '% spent' : '0%'}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-5 border-t border-card-border">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                            <span>🧾</span>
                            <span>Expenses Deducted from this Salary ({(activeCycle?.expenses.length || 0) + activePendingExpenses.length})</span>
                        </h3>
                        {activeCycle && (
                            <span className="text-xs font-bold text-red-500 tabular-nums">
                                -₱{projectedDeducted.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                    <ActiveCycleExpensesList expenses={activeCycle?.expenses || []} categories={categories} />
                    {activePendingExpenses.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {activePendingExpenses.map((transaction) => {
                                const category = pendingCategory(transaction, categories)
                                return (
                                    <div key={transaction.queue_id} className="flex items-center justify-between p-3 rounded-2xl bg-input-bg border border-amber-400/40">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-8 h-8 rounded-xl bg-card border border-card-border flex items-center justify-center text-sm shrink-0">
                                                {category.icon}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-extrabold text-sm text-card-foreground">
                                                    {transaction.note || category.name}
                                                </p>
                                                <p className="text-[10px] text-muted font-medium">
                                                    {category.name} · {formatManilaDateTime(transaction.created_at || transaction.transaction_date)} · Saved on this device
                                                </p>
                                            </div>
                                        </div>
                                        <span className="ml-3 shrink-0 font-black text-sm text-red-500 tabular-nums">
                                            -₱{Number(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-card border border-card-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-lg font-extrabold text-card-foreground">Recent Transactions</h2>
                        <p className="text-xs text-muted font-medium mt-0.5">Saved records appear here immediately, including offline entries.</p>
                    </div>
                    {pending.length > 0 && (
                        <span className="shrink-0 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                            {pending.length} waiting to sync
                        </span>
                    )}
                </div>
                {recentTransactions.length === 0 ? (
                    <div className="rounded-2xl bg-input-bg border border-input-border p-5 text-center text-sm text-muted">
                        No transactions recorded yet.
                    </div>
                ) : (
                    <div className="divide-y divide-card-border">
                        {recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between gap-4 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="w-9 h-9 rounded-xl bg-input-bg border border-input-border flex items-center justify-center shrink-0">
                                        {transaction.categoryIcon}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-card-foreground">
                                            {transaction.note || transaction.categoryName}
                                        </p>
                                        <p className="truncate text-xs text-muted">
                                            {transaction.categoryName} · {formatManilaDateTime(transaction.transaction_date)}
                                            {transaction.isOffline ? ' · Saved on this device' : ''}
                                        </p>
                                    </div>
                                </div>
                                <span className={'shrink-0 text-sm font-black tabular-nums ' + (transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                                    {transaction.type === 'income' ? '+' : '−'}₱{transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    )
}
