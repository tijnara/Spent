import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/') // Redundant auth check, but good practice
    }

    const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div>
            <h1>Welcome back, {user.email}</h1>
            {/* Render your <TransactionList expenses={expenses} /> here */}
        </div>
    )
}