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
    const category_id = (formData.get('category_id') as string) || null
    const note = (formData.get('note') as string) || ''
    const transaction_date = (formData.get('transaction_date') as string) || new Date().toISOString().split('T')[0]

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

export async function updateTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const id = formData.get('id') as string
    const amount = parseFloat(formData.get('amount') as string)
    const type = formData.get('type') as 'expense' | 'income'
    const category_id = (formData.get('category_id') as string) || null
    const note = (formData.get('note') as string) || ''
    const transaction_date = (formData.get('transaction_date') as string) || new Date().toISOString().split('T')[0]

    if (!id) {
        throw new Error('Transaction ID is required')
    }

    if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
    }

    const { error } = await supabase
        .from('transactions')
        .update({
            amount,
            type,
            category_id,
            note,
            transaction_date,
        })
        .match({ id, user_id: user.id })

    if (error) {
        console.error('Error updating transaction:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
}

export async function deleteTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const id = formData.get('id') as string

    if (!id) {
        throw new Error('Transaction ID is required')
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .match({ id, user_id: user.id })

    if (error) {
        console.error('Error deleting transaction:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
}

export async function inputSalary(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const amount = parseFloat(formData.get('amount') as string)
    const transaction_date = (formData.get('transaction_date') as string) || new Date().toISOString().split('T')[0]
    const note = (formData.get('note') as string) || 'Active Salary'

    if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid salary amount')
    }

    await supabase
        .from('profiles')
        .update({ salary: amount })
        .eq('id', user.id)

    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', '%salary%')
        .maybeSingle()

    await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .ilike('note', '%salary%')

    const { error: insertError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            amount,
            type: 'income',
            category_id: category?.id || null,
            note,
            transaction_date,
            created_at: new Date().toISOString(),
        })

    if (insertError) {
        console.error('Error logging salary:', insertError)
        throw new Error(insertError.message)
    }

    revalidatePath('/dashboard')
}

export async function clearAllData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Delete all transactions (salary entries, expenses, income)
    const { error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)

    if (txError) {
        console.error('Error deleting transactions:', txError)
        throw new Error(txError.message)
    }

    // 2. Reset salary on profile
    await supabase
        .from('profiles')
        .update({ salary: 0 })
        .eq('id', user.id)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}