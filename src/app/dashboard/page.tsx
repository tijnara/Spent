import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getManilaDate } from '@/lib/date'
import AddTransactionModal from '@/components/features/AddTransactionModal'
import DashboardOfflineOverview from '@/components/features/DashboardOfflineOverview'
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
            <section className="h-72 bg-card border border-card-border rounded-3xl p-5"></section>
        </div>
    )
}

async function DashboardContent() {
    await connection()

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

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
    const todayStr = getManilaDate()

    // --- SALARY CYCLES ---
    const salaryTransactions = safeTransactions
        .filter((t) => {
            if (t.type !== 'income') return false
            const catName = Array.isArray(t.categories) ? t.categories[0]?.name : t.categories?.name
            return catName?.toLowerCase().includes('salary') || t.note?.toLowerCase().includes('salary')
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const salaryCycles: SalaryCycle[] = salaryTransactions.map((salaryTx, idx) => {
        const isActive = idx === salaryTransactions.length - 1
        const startTimestamp = new Date(salaryTx.created_at).getTime()
        const nextSalary = salaryTransactions[idx + 1]
        const endTimestamp = nextSalary ? new Date(nextSalary.created_at).getTime() : Infinity

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
                    type: t.type,
                    note: t.note,
                    transaction_date: t.transaction_date,
                    created_at: t.created_at,
                    category_id: t.category_id,
                    categories: t.categories,
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
            endCreatedAt: nextSalary ? nextSalary.created_at : null,
            isActive,
            expenses: cycleExpenses,
            totalDeducted,
            remainingSalary,
            percentLeft,
        }
    }).reverse()

    const activeCycle = salaryCycles[0] || null
    // Exclude the currently active cycle from the history list
    const pastCycles = salaryCycles.filter((c) => !c.isActive)

    const totalSalaryInputted = activeCycle ? activeCycle.salaryAmount : (profile?.salary ? Number(profile.salary) : 0)
    const activeSalaryDeducted = activeCycle ? activeCycle.totalDeducted : 0
    const remainingSalary = totalSalaryInputted - activeSalaryDeducted
    const remainingPercent = totalSalaryInputted > 0
        ? Math.max(0, Math.min(100, (remainingSalary / totalSalaryInputted) * 100))
        : 0

    return (
        <div className="space-y-6">
            <DashboardOfflineOverview
                transactions={safeTransactions}
                categories={categories || []}
                today={todayStr}
                totalSalaryInputted={totalSalaryInputted}
                activeSalaryDeducted={activeSalaryDeducted}
                activeCycle={activeCycle}
            />

            {/* Historical Closed Salary Periods */}
            <SalaryHistorySection cycles={pastCycles} categories={categories || []} />

            {/* Floating Add Spent Trigger */}
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