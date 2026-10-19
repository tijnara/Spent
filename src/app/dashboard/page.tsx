import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import AddTransactionModal from '@/components/features/AddTransactionModal'
import TransactionList from '@/components/features/TransactionList'
import InputSalaryModal from '@/components/features/InputSalaryModal'
import SalaryHistorySection, { SalaryCycle } from '@/components/features/SalaryHistorySection'

interface CategoryData {
    id: string
    name: string
    icon: string
    color: string
}

interface TransactionRecord {
    id: string
    amount: number
    type: 'expense' | 'income'
    note: string | null
    transaction_date: string
    created_at: string
    category_id: string | null
    categories: CategoryData | CategoryData[] | null
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-32 bg-card border border-card-border rounded-3xl p-5"></div>
                <div className="h-32 bg-card border border-card-border rounded-3xl p-5"></div>
                <div className="h-32 bg-card border border-card-border rounded-3xl p-5"></div>
            </section>
            <section className="h-44 bg-card border border-card-border rounded-3xl p-6"></section>
            <section className="h-64 bg-card border border-card-border rounded-3xl p-6"></section>
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

    // 1. Fetch user profile from Supabase
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    // 2. Fetch categories from Supabase
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    // 3. Fetch transactions from Supabase
    const { data: rawTransactions } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            type,
            note,
            transaction_date,
            created_at,
            category_id,
            categories (
                id,
                name,
                icon,
                color
            )
        `)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })

    const safeTransactions = (rawTransactions as unknown as TransactionRecord[]) || []
    const todayStr = new Date().toISOString().split('T')[0]

    // General Metrics (Lifetime)
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

    // --- SALARY CYCLES & HISTORICAL EXPENSE GROUPING ---
    // Extract all salary records ordered chronologically (oldest to newest)
    const salaryTransactions = safeTransactions
        .filter((t) => {
            if (t.type !== 'income') return false
            const catName = Array.isArray(t.categories) ? t.categories[0]?.name : t.categories?.name
            return catName?.toLowerCase().includes('salary') || t.note?.toLowerCase().includes('salary')
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Group expenses into their respective salary periods
    const salaryCycles: SalaryCycle[] = salaryTransactions.map((salaryTx, idx) => {
        const startTimestamp = new Date(salaryTx.created_at).getTime()
        const nextSalary = salaryTransactions[idx + 1]
        const endTimestamp = nextSalary ? new Date(nextSalary.created_at).getTime() : Infinity
        const isActive = idx === salaryTransactions.length - 1

        const cycleExpenses = safeTransactions
            .filter((t) => {
                if (t.type !== 'expense') return false
                const txTime = new Date(t.created_at).getTime()
                return txTime >= startTimestamp && txTime < endTimestamp
            })
            .map((t) => {
                const cat = Array.isArray(t.categories) ? t.categories[0] : t.categories
                return {
                    id: t.id,
                    amount: Number(t.amount),
                    note: t.note,
                    transaction_date: t.transaction_date,
                    categoryName: cat?.name,
                    categoryIcon: cat?.icon,
                }
            })

        const totalDeducted = cycleExpenses.reduce((acc, exp) => acc + exp.amount, 0)
        const salaryAmount = Number(salaryTx.amount)
        const remainingSalary = salaryAmount - totalDeducted
        const percentLeft = salaryAmount > 0
            ? Math.max(0, Math.min(100, (remainingSalary / salaryAmount) * 100))
            : 0

        return {
            id: salaryTx.id,
            salaryAmount,
            note: salaryTx.note || 'Allocated Salary',
            startDate: salaryTx.transaction_date,
            endDate: nextSalary ? nextSalary.transaction_date : null,
            createdAt: salaryTx.created_at,
            isActive,
            expenses: cycleExpenses,
            totalDeducted,
            remainingSalary,
            percentLeft,
        }
    }).reverse() // Most recent cycle first

    // Active Salary Card Metrics
    const activeCycle = salaryCycles[0] || null
    const totalSalaryInputted = activeCycle ? activeCycle.salaryAmount : (profile?.salary ? Number(profile.salary) : 0)
    const activeSalaryDeducted = activeCycle ? activeCycle.totalDeducted : 0
    const remainingSalary = totalSalaryInputted - activeSalaryDeducted
    const remainingPercent = totalSalaryInputted > 0
        ? Math.max(0, Math.min(100, (remainingSalary / totalSalaryInputted) * 100))
        : 0

    return (
        <div className="space-y-6">
            {/* Overview Metric Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-card-border p-5 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="h-1.5 w-16 bg-spent-yellow rounded-full mb-3"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        Spent Today
                    </span>
                    <p className="text-3xl font-black text-card-foreground mt-1">
                        ₱{spentToday.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs text-muted mt-2 block font-medium">
                        Resets every midnight
                    </span>
                </div>

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
                        All income minus expenses
                    </span>
                </div>

                <div className="bg-card border border-card-border p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        Activity Summary
                    </span>
                    <div className="flex justify-between items-center mt-2">
                        <div>
                            <span className="text-xs text-muted block">Total In</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                +₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-card-border"></div>
                        <div>
                            <span className="text-xs text-muted block">Total Out</span>
                            <span className="font-extrabold text-red-500">
                                -₱{totalExpense.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Active Salary & Expense Deduction Section */}
            <section className="bg-card border border-card-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-card-border mb-6">
                    <div>
                        <h2 className="text-lg font-extrabold text-card-foreground flex items-center gap-2">
                            <span>💼</span>
                            <span>Salary & Expense Deduction</span>
                        </h2>
                        <p className="text-xs text-muted font-medium mt-0.5">
                            Real-time budget deductions for the active salary period
                        </p>
                    </div>
                    <InputSalaryModal />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* LEFT SIDE: Allocated Salary */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-spent-violet"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted">
                                Allocated Salary
                            </span>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-card-foreground">
                            ₱{totalSalaryInputted.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted font-medium">
                            {activeCycle?.startDate
                                ? `Active baseline set on ${activeCycle.startDate}`
                                : 'Tap "Set Salary" to record your starting baseline'}
                        </p>
                    </div>

                    {/* RIGHT SIDE: Remaining Salary after Deductions */}
                    <div className="space-y-3 md:border-l md:border-card-border md:pl-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${remainingSalary >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                                    Remaining Salary
                                </span>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 bg-input-bg border border-input-border rounded-lg text-muted">
                                {remainingPercent.toFixed(1)}% Left
                            </span>
                        </div>

                        <p className={`text-3xl sm:text-4xl font-black ${remainingSalary >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            ₱{remainingSalary.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>

                        <div className="space-y-1.5">
                            <div className="w-full bg-input-bg border border-input-border h-2.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${remainingSalary >= 0 ? 'bg-spent-yellow' : 'bg-red-500'}`}
                                    style={{ width: `${remainingPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-muted font-medium flex justify-between">
                                <span>Total Deducted: -₱{activeSalaryDeducted.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>{totalSalaryInputted > 0 ? `${(100 - remainingPercent).toFixed(1)}% spent` : '0%'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW SECTION: Historical Salary Periods & Grouped Expenses */}
            <SalaryHistorySection cycles={salaryCycles} />

            {/* General Transaction Feed */}
            <section className="bg-card border border-card-border rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold text-card-foreground">
                        Recent Transactions
                    </h2>
                    <span className="text-xs font-bold text-muted">
                        {safeTransactions.length} Total
                    </span>
                </div>

                <TransactionList
                    transactions={safeTransactions as any}
                    categories={categories || []}
                />
            </section>

            {/* Quick Add Floating Action Button & Modal */}
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