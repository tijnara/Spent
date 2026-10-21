'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type CutoffPreset = '15_30' | '10_25' | 'weekly_friday' | 'custom'

interface CategoryChip {
    id: string
    name: string
    icon: string
    selected: boolean
}

const DEFAULT_CATEGORY_OPTIONS: CategoryChip[] = [
    { id: '1', name: 'Commute / Angkas / MRT', icon: '🛵', selected: true },
    { id: '2', name: 'Food & Carinderia', icon: '🍱', selected: true },
    { id: '3', name: 'Groceries & Wet Market', icon: '🛒', selected: true },
    { id: '4', name: 'Utilities & Wi-Fi', icon: '⚡', selected: true },
    { id: '5', name: 'Coffee & Snacks', icon: '☕', selected: true },
    { id: '6', name: 'Health & Pharmacy', icon: '💊', selected: true },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [userName, setUserName] = useState('')

    // Step 1: Pay Schedule State
    const [schedulePreset, setSchedulePreset] = useState<CutoffPreset>('15_30')
    const [customFirstDay, setCustomFirstDay] = useState('5')
    const [customSecondDay, setCustomSecondDay] = useState('20')

    // Step 2: Cutoff Budget State
    const [budgetAmount, setBudgetAmount] = useState('15000')

    // Step 3: Default Categories State
    const [categories, setCategories] = useState<CategoryChip[]>(DEFAULT_CATEGORY_OPTIONS)

    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const storedName = sessionStorage.getItem('spent_user_nickname')
        if (storedName) {
            setUserName(storedName)
        }
    }, [])

    function toggleCategory(id: string) {
        setCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
        )
    }

    async function handleCompleteSetup(skippedBudget = false) {
        setIsSaving(true)

        // Layer 3: Invisible System Defaults (Silent detection)
        const detectedTimezone =
            typeof Intl !== 'undefined' && Intl.DateTimeFormat
                ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila'
                : 'Asia/Manila'

        const payload = {
            cutoffSchedule: {
                preset: schedulePreset,
                customDays:
                    schedulePreset === 'custom'
                        ? [Number(customFirstDay) || 1, Number(customSecondDay) || 15]
                        : null,
            },
            takeHomePay: skippedBudget ? 0 : parseFloat(budgetAmount) || 0,
            selectedCategories: categories.filter((c) => c.selected),
            // Technical Blueprint Invisible Defaults:
            systemDefaults: {
                timezone: detectedTimezone,
                currency: 'PHP',
                currencySymbol: '₱',
                numberFormat: 'en-PH',
            },
        }

        // Integration point: Persist payload to Supabase profiles/settings table
        console.log('Spent Onboarding Config:', payload)

        // Clean up temp session storage
        sessionStorage.removeItem('spent_user_nickname')

        // Drop user directly into the active cutoff dashboard
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen bg-[#0B0813] text-foreground flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#0B0813] font-sans">
            {/* Header with Step Tracker */}
            <header className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FACC15] text-[#0B0813] font-black flex items-center justify-center text-base shadow-sm">
                        S
                    </div>
                    <span className="text-lg font-black text-white tracking-tight">Spent</span>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 mr-2">
                        Step {step} of 3
                    </span>
                    <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 1 ? 'bg-[#FACC15]' : 'bg-white/10'}`} />
                        <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 2 ? 'bg-[#FACC15]' : 'bg-white/10'}`} />
                        <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 3 ? 'bg-[#FACC15]' : 'bg-white/10'}`} />
                    </div>
                </div>
            </header>

            {/* Main Calibration Card */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[600px] h-[380px] sm:h-[600px] bg-spent-violet/15 rounded-full blur-[140px] pointer-events-none -z-10" />

                <div className="w-full max-w-xl bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">

                    {/* -----------------------------------------------------------------
                        STEP 1: Payday Cutoff Schedule
                    ----------------------------------------------------------------- */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-2.5 py-1 rounded-full inline-block">
                                    Step 1 • Salary Cycle
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    When is your payday?
                                </h2>
                                <p className="text-xs sm:text-sm text-zinc-400">
                                    {userName ? `Welcome, ${userName}! ` : ''}Spent resets your runway and daily limit around your actual salary schedule.
                                </p>
                            </div>

                            {/* Preset Options */}
                            <div className="space-y-3">
                                {/* 15th & 30th (Default) */}
                                <button
                                    type="button"
                                    onClick={() => setSchedulePreset('15_30')}
                                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                        schedulePreset === '15_30'
                                            ? 'bg-white/[0.08] border-[#FACC15] text-white shadow-md'
                                            : 'bg-[#0B0813]/60 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-sm sm:text-base text-white">15th and 30th / End of Month</span>
                                            <span className="text-[10px] uppercase font-black bg-[#FACC15]/20 text-[#FACC15] px-2 py-0.5 rounded">Standard PH</span>
                                        </div>
                                        <p className="text-xs text-zinc-500">Most Philippine corporate, government, & BPO cutoffs</p>
                                    </div>
                                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${schedulePreset === '15_30' ? 'border-[#FACC15] bg-[#FACC15] text-[#0B0813] font-black text-xs' : 'border-zinc-600'}`}>
                                        {schedulePreset === '15_30' && '✓'}
                                    </span>
                                </button>

                                {/* 10th & 25th */}
                                <button
                                    type="button"
                                    onClick={() => setSchedulePreset('10_25')}
                                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                        schedulePreset === '10_25'
                                            ? 'bg-white/[0.08] border-[#FACC15] text-white shadow-md'
                                            : 'bg-[#0B0813]/60 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className="space-y-0.5">
                                        <span className="font-extrabold text-sm sm:text-base text-white">10th and 25th</span>
                                        <p className="text-xs text-zinc-500">Common multinational & shared-services cycle</p>
                                    </div>
                                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${schedulePreset === '10_25' ? 'border-[#FACC15] bg-[#FACC15] text-[#0B0813] font-black text-xs' : 'border-zinc-600'}`}>
                                        {schedulePreset === '10_25' && '✓'}
                                    </span>
                                </button>

                                {/* Every Friday / Weekly */}
                                <button
                                    type="button"
                                    onClick={() => setSchedulePreset('weekly_friday')}
                                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                        schedulePreset === 'weekly_friday'
                                            ? 'bg-white/[0.08] border-[#FACC15] text-white shadow-md'
                                            : 'bg-[#0B0813]/60 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className="space-y-0.5">
                                        <span className="font-extrabold text-sm sm:text-base text-white">Every Friday (Weekly)</span>
                                        <p className="text-xs text-zinc-500">Freelance, contract, & agency payouts</p>
                                    </div>
                                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${schedulePreset === 'weekly_friday' ? 'border-[#FACC15] bg-[#FACC15] text-[#0B0813] font-black text-xs' : 'border-zinc-600'}`}>
                                        {schedulePreset === 'weekly_friday' && '✓'}
                                    </span>
                                </button>

                                {/* Custom Dates */}
                                <button
                                    type="button"
                                    onClick={() => setSchedulePreset('custom')}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                        schedulePreset === 'custom'
                                            ? 'bg-white/[0.08] border-[#FACC15] text-white shadow-md'
                                            : 'bg-[#0B0813]/60 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <span className="font-extrabold text-sm sm:text-base text-white">Custom Pay Dates</span>
                                            <p className="text-xs text-zinc-500">Pick any two calendar days of the month</p>
                                        </div>
                                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${schedulePreset === 'custom' ? 'border-[#FACC15] bg-[#FACC15] text-[#0B0813] font-black text-xs' : 'border-zinc-600'}`}>
                                            {schedulePreset === 'custom' && '✓'}
                                        </span>
                                    </div>

                                    {schedulePreset === 'custom' && (
                                        <div className="pt-4 mt-3 border-t border-white/[0.08] flex items-center gap-3">
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">1st Payday</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={customFirstDay}
                                                    onChange={(e) => setCustomFirstDay(e.target.value)}
                                                    className="w-full bg-[#0B0813] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white font-bold tabular-nums focus:outline-none focus:border-[#FACC15]"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">2nd Payday</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={customSecondDay}
                                                    onChange={(e) => setCustomSecondDay(e.target.value)}
                                                    className="w-full bg-[#0B0813] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white font-bold tabular-nums focus:outline-none focus:border-[#FACC15]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full py-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#0B0813] font-black text-sm rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>Continue to Cutoff Budget</span>
                                <span>→</span>
                            </button>
                        </div>
                    )}

                    {/* -----------------------------------------------------------------
                        STEP 2: Cutoff Budget (Take-Home Pay)
                    ----------------------------------------------------------------- */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-2.5 py-1 rounded-full inline-block">
                                    Step 2 • Runway Ceiling
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Estimated take-home pay per cutoff?
                                </h2>
                                <p className="text-xs sm:text-sm text-zinc-400">
                                    Used to calculate your daily runway left until the next salary drop.
                                </p>
                            </div>

                            {/* Numeric Field with Fixed ₱ Prefix */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-500">
                                        ₱
                                    </span>
                                    <input
                                        type="number"
                                        step="100"
                                        min="0"
                                        value={budgetAmount}
                                        onChange={(e) => setBudgetAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-[#0B0813] border border-white/[0.08] focus:border-[#FACC15] rounded-2xl pl-10 pr-4 py-4 text-2xl font-black text-white tabular-nums tracking-tight focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Quick Increment Chips */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {[10000, 15000, 20000, 30000].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setBudgetAmount(amt.toString())}
                                            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-zinc-300 transition-colors tabular-nums cursor-pointer"
                                        >
                                            ₱{amt.toLocaleString('en-PH')}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
                                    💡 You can adjust this anytime, or leave it blank to start at ₱0.00.
                                </p>
                            </div>

                            {/* Dual Action: Continue or Skip */}
                            <div className="space-y-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="w-full py-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#0B0813] font-black text-sm rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>Continue to Categories</span>
                                    <span>→</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setBudgetAmount('0')
                                        setStep(3)
                                    }}
                                    className="w-full py-3 bg-transparent hover:bg-white/[0.04] text-xs font-bold text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                                >
                                    Skip for now (Start at ₱0.00)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* -----------------------------------------------------------------
                        STEP 3: Top Categories Selection
                    ----------------------------------------------------------------- */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20 px-2.5 py-1 rounded-full inline-block">
                                    Step 3 • Zero Friction
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Select your common expenses
                                </h2>
                                <p className="text-xs sm:text-sm text-zinc-400">
                                    We&apos;ll preload these into your 1-tap logging bar. You can add or rename custom tags anytime.
                                </p>
                            </div>

                            {/* Multi-Select Chips */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                            cat.selected
                                                ? 'bg-[#FACC15]/10 border-[#FACC15]/50 text-white shadow-xs'
                                                : 'bg-[#0B0813]/60 border-white/[0.08] text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-xs font-bold">{cat.name}</span>
                                        </div>
                                        <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                                            cat.selected ? 'bg-[#FACC15] text-[#0B0813] font-black border-[#FACC15]' : 'border-zinc-600'
                                        }`}>
                                            {cat.selected && '✓'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Finish Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleCompleteSetup(false)}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#0B0813] font-black text-sm rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <span>{isSaving ? 'Calibrating Runway...' : 'Complete Setup & Launch Dashboard →'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Micro Privacy Reassurance */}
            <footer className="w-full py-4 text-center text-xs text-zinc-600">
                <p>🇵🇭 Asia/Manila (UTC+8) • All calculations stay private & manual</p>
            </footer>
        </div>
    )
}