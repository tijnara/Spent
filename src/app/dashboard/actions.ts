'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getManilaDate } from '@/lib/date'

interface CategoryData {
    id?: string
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
    categories: CategoryData | CategoryData[] | null
}

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

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const amount = parseFloat(formData.get('amount') as string)
    const type = formData.get('type') as 'expense' | 'income'
    const note = (formData.get('note') as string)?.trim().toUpperCase() || ''
    const transaction_date = (formData.get('transaction_date') as string) || getManilaDate()
    const submittedCategoryId = (formData.get('category_id') as string) || null
    const newCategoryName = (formData.get('new_category_name') as string) || null

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
    revalidatePath('/dashboard/stats')
    revalidatePath('/dashboard/settings')
}

export async function updateTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const id = formData.get('id') as string
    const amount = parseFloat(formData.get('amount') as string)
    const type = formData.get('type') as 'expense' | 'income'
    const note = (formData.get('note') as string)?.trim().toUpperCase() || ''
    const transaction_date = (formData.get('transaction_date') as string) || getManilaDate()
    const submittedCategoryId = (formData.get('category_id') as string) || null
    const newCategoryName = (formData.get('new_category_name') as string) || null

    if (!id) throw new Error('Transaction ID is required')
    if (isNaN(amount) || amount <= 0) throw new Error('Please enter a valid amount')

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
    revalidatePath('/dashboard/stats')
    revalidatePath('/dashboard/settings')
}

export async function deleteTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const id = formData.get('id') as string
    if (!id) throw new Error('Transaction ID is required')

    const { error } = await supabase
        .from('transactions')
        .delete()
        .match({ id, user_id: user.id })

    if (error) {
        console.error('Error deleting transaction:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/stats')
}

export async function inputSalary(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const amount = parseFloat(formData.get('amount') as string)
    const transaction_date = (formData.get('transaction_date') as string) || getManilaDate()
    const note = (formData.get('note') as string)?.trim().toUpperCase() || 'ACTIVE SALARY'

    if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid salary amount')
    }

    // 1. Keep profile baseline salary in sync
    await supabase
        .from('profiles')
        .update({ salary: amount, updated_at: new Date().toISOString() })
        .eq('id', user.id)

    // 2. Fetch the latest salary before inserting the new one to determine the previous cycle boundary
    const { data: previousSalaries } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .ilike('note', '%salary%')
        .order('created_at', { ascending: false })
        .limit(1)

    const prevSalary = previousSalaries?.[0] || null
    const prevSalaryTimestamp = prevSalary ? new Date(prevSalary.created_at).getTime() : 0

    // 3. Locate or auto-create a user-owned 'Salary' category
    let { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', '%salary%')
        .maybeSingle()

    if (!category) {
        const { data: newCat, error: catError } = await supabase
            .from('categories')
            .insert({
                user_id: user.id,
                name: 'Salary',
                type: 'income',
                icon: '💼',
                color: '#34D399',
            })
            .select('id')
            .single()

        if (!catError && newCat) {
            category = newCat
        }
    }

    const newSalaryCreatedAt = new Date().toISOString()
    const newSalaryTimestamp = new Date(newSalaryCreatedAt).getTime()

    // 4. Insert the new active salary
    const { error: insertError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            amount,
            type: 'income',
            category_id: category?.id || null,
            note: note.includes('SALARY') ? note : `${note} (SALARY)`,
            transaction_date,
            created_at: newSalaryCreatedAt,
        })

    if (insertError) {
        console.error('Error logging salary:', insertError)
        throw new Error(insertError.message)
    }

    // 5. Fetch previous cycle's expenses so the modal can display category sums
    const { data: rawExpenses } = await supabase
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
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('created_at', { ascending: false })

    const safeExpenses = (rawExpenses as unknown as TransactionRecord[]) || []

    const lastCycleExpenses = safeExpenses
        .filter((t) => {
            const txTime = new Date(t.created_at).getTime()
            return prevSalaryTimestamp > 0
                ? (txTime >= prevSalaryTimestamp && txTime < newSalaryTimestamp)
                : txTime < newSalaryTimestamp
        })
        .map((t) => {
            const cat = Array.isArray(t.categories) ? t.categories[0] : t.categories
            return {
                id: t.id,
                amount: Number(t.amount),
                note: t.note,
                transaction_date: t.transaction_date,
                created_at: t.created_at,
                categoryName: cat?.name || 'Uncategorized',
                categoryIcon: cat?.icon || '🏷️',
            }
        })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/stats')
    revalidatePath('/dashboard/settings')

    // Returns new salary clean at 0 expenses, while passing previous cycle expenses for category summation
    return {
        success: true,
        salaryAmount: amount,
        note,
        transactionDate: transaction_date,
        totalDeducted: 0,
        remainingSalary: amount,
        percentLeft: 100,
        expenses: lastCycleExpenses,
    }
}

export async function addCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const name = (formData.get('name') as string)?.trim()
    const type = (formData.get('type') as 'expense' | 'income') || 'expense'
    const icon = (formData.get('icon') as string)?.trim() || (type === 'income' ? '💵' : '🏷️')
    const color = (formData.get('color') as string)?.trim() || '#7C3AED'

    if (!name) throw new Error('Category name is required')

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

    if (!user) redirect('/login')

    const id = formData.get('id') as string
    const name = (formData.get('name') as string)?.trim()
    const type = (formData.get('type') as 'expense' | 'income') || 'expense'
    const icon = (formData.get('icon') as string)?.trim() || (type === 'income' ? '💵' : '🏷️')

    if (!id || !name) throw new Error('Category ID and name are required')

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

    if (!user) redirect('/login')

    const id = formData.get('id') as string
    if (!id) throw new Error('Category ID is required')

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

export async function clearAllUserData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

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
    revalidatePath('/dashboard/stats')
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