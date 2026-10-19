'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getManilaDate } from '@/lib/date'

// --- HELPER: FIND OR AUTOMATICALLY CREATE CATEGORY ---
async function resolveCategoryId(
    supabase: any,
    userId: string,
    type: 'expense' | 'income',
    categoryId?: string | null,
    newCategoryName?: string | null
): Promise<string> {
    if (categoryId && categoryId.trim() !== '') {
        return categoryId
    }

    const trimmedName = newCategoryName?.trim()
    if (!trimmedName) {
        throw new Error('A category is required. Please select or type a category.')
    }

    // Check if category already exists for this user (case-insensitive)
    const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('type', type)
        .ilike('name', trimmedName)
        .maybeSingle()

    if (existing?.id) {
        return existing.id
    }

    // Automatically insert the new category into Supabase
    const { data: newCat, error } = await supabase
        .from('categories')
        .insert({
            user_id: userId,
            name: trimmedName,
            type,
            icon: type === 'income' ? '💵' : '🏷️',
            color: '#7C3AED',
        })
        .select('id')
        .single()

    if (error || !newCat) {
        console.error('Error auto-creating category in Supabase:', error)
        throw new Error('Failed to create new category in database: ' + error?.message)
    }

    return newCat.id
}

// --- TRANSACTION ACTIONS ---

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const amount = parseFloat(formData.get('amount') as string)
    const type = formData.get('type') as 'expense' | 'income'
    const note = (formData.get('note') as string) || ''
    const transaction_date = (formData.get('transaction_date') as string) || getManilaDate()
    const submittedCategoryId = (formData.get('category_id') as string) || null
    const newCategoryName = (formData.get('new_category_name') as string) || null

    if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
    }

    // Resolve or auto-insert category in Supabase
    const category_id = await resolveCategoryId(
        supabase,
        user.id,
        type,
        submittedCategoryId,
        newCategoryName
    )

    const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount,
        type,
        category_id,
        note,
        transaction_date,
        created_at: new Date().toISOString(),
    })

    if (error) {
        console.error('Error inserting transaction:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
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
    const note = (formData.get('note') as string) || ''
    const transaction_date = (formData.get('transaction_date') as string) || getManilaDate()
    const submittedCategoryId = (formData.get('category_id') as string) || null
    const newCategoryName = (formData.get('new_category_name') as string) || null

    if (!id) {
        throw new Error('Transaction ID is required')
    }

    if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
    }

    const category_id = await resolveCategoryId(
        supabase,
        user.id,
        type,
        submittedCategoryId,
        newCategoryName
    )

    const { error } = await supabase
        .from('transactions')
        .update({
            amount,
            type,
            category_id,
            note,
            transaction_date,
            created_at: new Date().toISOString(),
        })
        .match({ id, user_id: user.id })

    if (error) {
        console.error('Error updating transaction:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
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

// --- SALARY ACTIONS ---

export async function inputSalary(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const amount = parseFloat(formData.get('amount') as string)
    const transaction_date = (formData.get('transaction_date') as string) || getManilaDate()
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
        .update({ note: 'Archived Salary' })
        .eq('user_id', user.id)
        .ilike('note', '%Active Salary%')

    const { error: insertError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            amount,
            type: 'income',
            category_id: category?.id || null,
            note: note.toLowerCase().includes('salary') ? note : `${note} (Salary)`,
            transaction_date,
            created_at: new Date().toISOString(),
        })

    if (insertError) {
        console.error('Error logging salary:', insertError)
        throw new Error(insertError.message)
    }

    revalidatePath('/dashboard')
}

// --- CATEGORY CRUD ACTIONS ---

export async function addCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const name = (formData.get('name') as string)?.trim()
    const type = (formData.get('type') as 'expense' | 'income') || 'expense'
    const icon = (formData.get('icon') as string)?.trim() || (type === 'income' ? '💵' : '🏷️')
    const color = (formData.get('color') as string)?.trim() || '#7C3AED'

    if (!name) {
        throw new Error('Category name is required')
    }

    const { data, error } = await supabase.from('categories').insert({
        user_id: user.id,
        name,
        type,
        icon,
        color,
    }).select().single()

    if (error) {
        console.error('Error adding category:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return data
}

export async function updateCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const id = formData.get('id') as string
    const name = (formData.get('name') as string)?.trim()
    const type = (formData.get('type') as 'expense' | 'income') || 'expense'
    const icon = (formData.get('icon') as string)?.trim() || (type === 'income' ? '💵' : '🏷️')

    if (!id || !name) {
        throw new Error('Category ID and name are required')
    }

    const { error } = await supabase
        .from('categories')
        .update({ name, type, icon })
        .match({ id, user_id: user.id })

    if (error) {
        console.error('Error updating category:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
}

export async function deleteCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const id = formData.get('id') as string

    if (!id) {
        throw new Error('Category ID is required')
    }

    await supabase
        .from('transactions')
        .update({ category_id: null })
        .match({ category_id: id, user_id: user.id })

    const { error } = await supabase
        .from('categories')
        .delete()
        .match({ id, user_id: user.id })

    if (error) {
        console.error('Error deleting category:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
}

// --- DATA CLEAR & AUTH ---

export async function clearAllUserData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)

    if (txError) {
        console.error('Error clearing transactions:', txError)
        throw new Error('Failed to delete transactions: ' + txError.message)
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ salary: 0 })
        .eq('id', user.id)

    if (profileError) {
        console.warn('Profile salary reset warning:', profileError.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
}

export async function clearAllData() {
    return clearAllUserData()
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}