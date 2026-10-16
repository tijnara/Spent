'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function getOrigin() {
    const headersList = await headers()
    const origin = headersList.get('origin')
    if (origin) return origin

    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    return host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const origin = await getOrigin()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (password.length < 8) {
        redirect('/signup?error=Password must be at least 8 characters long.')
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/login?message=Account created! Check your email to verify your account before logging in.')
}