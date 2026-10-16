import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import AddTransactionModal from '@/components/features/AddTransactionModal'

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-32 bg-card border border-card-border rounded-3xl p-5"></div>
                <div className="h-32 bg-card border border-card-border rounded-3xl p-5"></div>
                <div className="h-32 bg-card border border-card-border rounded-3xl p-5"></div>
            </section>
            <section className="h-72 bg-card border border-card-border rounded-3xl p-5"></section>
        </div>
    )
}

async function DashboardContent() {
    await connection()

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 1. Fetch user categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    // 2. Fetch user transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            type,
            note,
            transaction_date,
            created_at,
            categories (
                id,
                name,
                icon,
                color
            )
        `)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })

    const safeTransactions = transactions || []
    const todayStr = new Date().toISOString().split('T')[0]

    // Calculate Metrics
    const spentToday = safeTransactions
        .filter((t) => t.type === 'expense' && t.transaction_date === todayStr)
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const totalExpense = safeTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const totalIncome = safeTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const netBalance = totalIncome - totalExpense

    return (
        <div className="space-y-6">
            {/* Overview Metric Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Spent Today Card */}
                <div className="bg-card border border-card-border p-5 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="h-1.5 w-16 bg-spent-yellow rounded-full mb-3"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        Spent Today
                    </span>
                    <p className="text-3xl font-black text-card-foreground mt-1">
                        ₱{spentToday.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs text-muted mt-2 block font-medium">
                        Daily tracker limit resets at midnight
                    </span>
                </div>

                {/* Net Balance Card */}
                <div className="bg-card border border-card-border p-5 rounded-3xl shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        Net Balance
                    </span>
                    <p
                        className={`text-3xl font-black mt-1 ${
                            netBalance >= 0 ? 'text-card-foreground' : 'text-red-500'
                        }`}
                    >
                        ₱{netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs text-muted mt-2 block font-medium">
                        Income minus expenses
                    </span>
                </div>

                {/* Activity Summary Card */}
                <div className="bg-card border border-card-border p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        Activity Summary
                    </span>
                    <div className="flex justify-between items-center mt-2">
                        <div>
                            <span className="text-xs text-muted block">Income</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                +₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-card-border"></div>
                        <div>
                            <span className="text-xs text-muted block">Expenses</span>
                            <span className="font-extrabold text-red-500">
                                -₱{totalExpense.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transaction Feed */}
            <section className="bg-card border border-card-border rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold text-card-foreground">
                        Recent Transactions
                    </h2>
                    <span className="text-xs font-bold text-muted">
                        {safeTransactions.length} Total
                    </span>
                </div>

                {safeTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-spent-violet/10 flex items-center justify-center text-2xl text-spent-violet">
                            💸
                        </div>
                        <p className="font-bold text-card-foreground">No transactions logged yet</p>
                        <p className="text-xs text-muted mt-1">
                            Tap the yellow + button to record your first daily expense!
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-card-border">
                        {safeTransactions.map((tx) => {
                            const categoryData = Array.isArray(tx.categories)
                                ? tx.categories[0]
                                : tx.categories

                            return (
                                <div
                                    key={tx.id}
                                    className="py-3.5 flex items-center justify-between hover:bg-input-bg/40 px-2 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-input-bg border border-input-border flex items-center justify-center text-xl shadow-xs">
                                            {categoryData?.icon || (tx.type === 'income' ? '💵' : '💳')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-card-foreground">
                                                {tx.note || categoryData?.name || 'General Expense'}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                                                <span>{tx.transaction_date}</span>
                                                {categoryData?.name && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{categoryData.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <span
                                        className={`font-black text-sm sm:text-base ${
                                            tx.type === 'income'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-card-foreground'
                                        }`}
                                    >
                                        {tx.type === 'income' ? '+₱' : '-₱'}
                                        {Number(tx.amount).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Floating Action Button & Modal */}
            <AddTransactionModal categories={categories || []} />
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    )
}