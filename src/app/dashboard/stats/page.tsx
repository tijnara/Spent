import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import StatsView from '@/components/features/StatsView'

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

function StatsSkeleton() {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6 animate-pulse">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-card border border-card-border rounded-lg"></div>
                    <div className="h-4 w-64 bg-card border border-card-border rounded-lg"></div>
                </div>
                <div className="h-8 w-32 bg-input-bg border border-input-border rounded-xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[380px] bg-card border border-card-border rounded-3xl p-6"></div>
                <div className="lg:col-span-1 h-[380px] bg-card border border-card-border rounded-3xl p-6"></div>
                <div className="lg:col-span-1 h-[220px] bg-card border border-card-border rounded-3xl p-6"></div>
                <div className="lg:col-span-2 h-[220px] bg-card border border-card-border rounded-3xl p-6"></div>
            </div>
            <div className="h-80 bg-card border border-card-border rounded-3xl p-6"></div>
        </div>
    )
}

async function StatsContent() {
    await connection()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

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

    // 1. Group into Salary Cycles
    const salaryTransactions = safeTransactions
        .filter((t) => t.type === 'income' && (
            (Array.isArray(t.categories) ? t.categories[0]?.name : t.categories?.name)?.toLowerCase().includes('salary') ||
            t.note?.toLowerCase().includes('salary')
        ))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const cycles = salaryTransactions.map((salaryTx, idx) => {
        const startTimestamp = new Date(salaryTx.created_at).getTime()
        const nextSalary = salaryTransactions[idx + 1]
        const endTimestamp = nextSalary ? new Date(nextSalary.created_at).getTime() : Infinity

        const cycleExpenses = safeTransactions.filter((t) => {
            if (t.type !== 'expense') return false
            const txTime = new Date(t.created_at).getTime()
            return txTime >= startTimestamp && txTime < endTimestamp
        })

        return {
            salaryAmount: Number(salaryTx.amount),
            startDate: salaryTx.transaction_date,
            endDate: nextSalary ? nextSalary.transaction_date : 'Present',
            expenses: cycleExpenses,
            totalDeducted: cycleExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0),
        }
    }).reverse()

    const activeCycle = cycles[0]
    const previousCycle = cycles[1]

    let activeCycleStr = 'No Active Cycle'
    let burnRateData: any[] = []
    let topCategories: any[] = []
    let surplusHistory: any[] = []
    let comparison = { percent: 0, isLower: true, prevAmount: 0, nowAmount: 0 }

    if (activeCycle) {
        activeCycleStr = `${activeCycle.startDate} - ${activeCycle.endDate}`

        // Calculate Top Categories for Active Cycle
        const catMap = new Map()
        activeCycle.expenses.forEach(exp => {
            const catName = (Array.isArray(exp.categories) ? exp.categories[0]?.name : exp.categories?.name) || 'Uncategorized'
            const catIcon = (Array.isArray(exp.categories) ? exp.categories[0]?.icon : exp.categories?.icon) || '🏷️'
            const current = catMap.get(catName) || { amount: 0, icon: catIcon }
            catMap.set(catName, { amount: current.amount + Number(exp.amount), icon: catIcon })
        })

        topCategories = Array.from(catMap.entries())
            .map(([name, data]) => ({
                name,
                icon: data.icon,
                amount: data.amount,
                percent: activeCycle.totalDeducted > 0 ? (data.amount / activeCycle.totalDeducted) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4)

        // Surplus History
        surplusHistory = cycles.slice(1).map(c => {
            const surplus = c.salaryAmount - c.totalDeducted
            return {
                cycleStr: `${c.startDate} - ${c.endDate}`,
                surplus,
                status: surplus >= 0 ? 'positive' : 'negative'
            }
        })

        // Comparison Logic
        const nowAmount = activeCycle.totalDeducted
        const prevAmount = previousCycle ? previousCycle.totalDeducted : 0
        const diff = prevAmount > 0 ? ((nowAmount - prevAmount) / prevAmount) * 100 : 0

        comparison = {
            percent: Math.abs(Number(diff.toFixed(1))),
            isLower: nowAmount <= prevAmount,
            prevAmount,
            nowAmount
        }

        // Burn Rate Generation
        let cumulative = 0
        const sortedExpenses = [...activeCycle.expenses].sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())

        const dailySpend = new Map()
        sortedExpenses.forEach(exp => {
            const current = dailySpend.get(exp.transaction_date) || 0
            dailySpend.set(exp.transaction_date, current + Number(exp.amount))
        })

        let dayCounter = 1
        dailySpend.forEach((amount) => {
            cumulative += amount
            burnRateData.push({
                day: `Day ${dayCounter}`,
                actual: cumulative,
                ideal: (activeCycle.salaryAmount / 15) * dayCounter
            })
            dayCounter++
        })
    }

    return (
        <StatsView
            activeCycleStr={activeCycleStr}
            burnRateData={burnRateData}
            topCategories={topCategories}
            surplusHistory={surplusHistory}
            comparison={comparison}
            transactions={safeTransactions}
            categories={categories || []}
        />
    )
}

export default function StatsPage() {
    return (
        <Suspense fallback={<StatsSkeleton />}>
            <StatsContent />
        </Suspense>
    )
}