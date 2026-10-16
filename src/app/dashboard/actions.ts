'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const amount = parseFloat(formData.get('amount') as string)
    const type = formData.get('type') as 'expense' | 'income'
    const category_id = formData.get('category_id') as string || null
    const note = formData.get('note') as string || ''
    const transaction_date = formData.get('transaction_date') as string || new Date().toISOString().split('T')[0]

    if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
    }

    const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount,
        type,
        category_id,
        note,
        transaction_date,
    })

    if (error) {
        console.error('Error inserting transaction:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}