'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

async function getSupabaseServerClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Handled when called from Server Components
                    }
                },
            },
        }
    )
}

async function getSiteUrl() {
    const headerList = await headers()
    const host = headerList.get('x-forwarded-host') || headerList.get('host')
    const proto = headerList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')

    if (host && !host.includes('localhost')) {
        return `${proto}://${host}`
    }

    return process.env.NODE_ENV === 'production'
        ? 'https://spent-wave.vercel.app'
        : 'http://localhost:3000'
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        redirect('/login?error=Please+provide+both+email+and+password')
    }

    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = (formData.get('firstName') as string)?.trim() || null

    if (!email || !password) {
        redirect('/signup?error=Please+provide+both+email+and+password')
    }

    const supabase = await getSupabaseServerClient()
    const siteUrl = await getSiteUrl()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
            data: {
                first_name: firstName,
            },
        },
    })

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    // When "Confirm email" is disabled in Supabase, a session is created immediately
    if (data.session) {
        redirect('/onboarding')
    }

    // When email confirmation is enabled, guide the user to verify their email
    if (data.user && !data.session) {
        redirect('/signup?message=We+sent+a+confirmation+link+to+your+email.+Click+it+to+activate+your+account.')
    }

    redirect('/onboarding')
}

export async function signInWithGoogle() {
    const supabase = await getSupabaseServerClient()
    const siteUrl = await getSiteUrl()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
        },
    })

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function logout() {
    const supabase = await getSupabaseServerClient()
    await supabase.auth.signOut()
    redirect('/login')
}