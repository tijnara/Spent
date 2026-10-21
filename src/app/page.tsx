import type { Metadata } from 'next'
import Link from 'next/link'
import HeroSandbox from '@/components/landing/HeroSandbox'
import BentoGrid from '@/components/landing/BentoGrid'
import PwaInstallGuide from '@/components/landing/PwaInstallGuide'
import ConversionSection from '@/components/landing/ConversionSection'

export const metadata: Metadata = {
  title: 'Spent | Track Every Cents',
  description: 'Budgeting built around your 15/30 cutoff in Philippine Standard Time.',
}

export default function LandingPage() {
  return (
      <div className="min-h-screen bg-[#0B0813] text-foreground flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#0B0813] overflow-x-hidden font-sans">
        {/* Sticky Obsidian Glassmorphism Header */}
        <header className="sticky top-0 z-50 w-full bg-[#0B0813]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-md transition-all contain-card">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            <Link
                href="/"
                title="Spent | Track Every Cents"
                className="flex items-center gap-3 group shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FACC15] text-[#0B0813] font-black flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform shrink-0">
                S
              </div>
              <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white tracking-tight">
                Spent
              </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-400 tracking-tight whitespace-nowrap">
                | Track Every Cents
              </span>
              </div>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                  href="/signup"
                  className="text-xs sm:text-sm font-extrabold bg-[#FACC15] text-[#0B0813] hover:bg-[#EAB308] px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-xs hover:scale-105 active:scale-95 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pt-16 pb-16 sm:pt-24 sm:pb-24 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-spent-violet/20 via-transparent to-transparent">
          <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
            {/* Status Pill Badge */}
            <div className="flex justify-center mt-2 sm:mt-4">
              <div
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    whiteSpace: 'nowrap',
                  }}
                  className="gap-2.5 px-4 py-1.5 rounded-full bg-[#1A1433] border border-white/[0.08] shadow-sm backdrop-blur-md"
              >
              <span
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '8px',
                    height: '8px',
                    minWidth: '8px',
                    minHeight: '8px',
                    flexShrink: 0,
                  }}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]" />
              </span>

                <span className="text-xs font-semibold text-zinc-300">
                Asia/Manila (UTC+8)
              </span>

                <span className="text-zinc-600 text-xs font-black">
                •
              </span>

                <span className="text-xs font-bold text-[#FACC15] tracking-wide">
                15/30 Cutoff Engine
              </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.12]">
              Budgeting built around your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] via-amber-300 to-yellow-400">
              15/30 cutoff
            </span>
              .
            </h1>

            {/* Subheadline */}
            <p className="max-w-xl mx-auto text-sm sm:text-base lg:text-lg text-zinc-400 font-normal leading-relaxed">
              Track daily expenses against your active paycheck in Philippine Standard Time. See exactly what remains before your next payday hits.
            </p>

            {/* Action CTAs: Both direct prospective users to the account creation route */}
            <div className="pt-2 pb-1 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#0B0813] font-black text-base rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Start Tracking Free</span>
                <span className="text-base font-bold">→</span>
              </Link>

              <a
                  href="#demo"
                  className="w-full sm:w-auto px-8 py-4 bg-[#1A1433]/80 hover:bg-[#1A1433] border border-white/[0.08] hover:border-white/20 text-white font-extrabold text-base rounded-2xl backdrop-blur-md transition-all flex items-center justify-center gap-3 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Try Live Demo</span>
                <span className="text-sm">↓</span>
              </a>
            </div>

            {/* Value Props Strip */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs text-zinc-400 font-medium">
              <div className="inline-flex items-center gap-2 shrink-0">
                <span className="text-[#34D399] font-bold">✓</span>
                <span>No bank logins required</span>
              </div>
              <div className="inline-flex items-center gap-2 shrink-0">
                <span className="text-[#34D399] font-bold">✓</span>
                <span>Works offline in transit</span>
              </div>
              <div className="inline-flex items-center gap-2 shrink-0">
                <span className="text-[#34D399] font-bold">✓</span>
                <span>100% private & manual</span>
              </div>
            </div>
          </div>

          {/* Hero Sandbox Preview */}
          <div className="w-full mt-14 sm:mt-20 relative min-h-[580px]">
            <div className="absolute inset-0 bg-[#FACC15]/5 blur-3xl rounded-full -z-10 pointer-events-none transform -translate-y-8" />
            <HeroSandbox />
          </div>

          {/* Bento Grid Feature Presentation */}
          <div className="w-full min-h-[720px]">
            <BentoGrid />
          </div>

          {/* PWA Mobile Installation Guide */}
          <div className="w-full min-h-[380px]">
            <PwaInstallGuide />
          </div>

          {/* Frictionless Conversion & Trust Strip */}
          <div className="w-full min-h-[440px]">
            <ConversionSection />
          </div>
        </main>

        {/* Clean Obsidian Footer */}
        <footer className="w-full border-t border-white/[0.08] py-8 text-center text-xs text-zinc-500 bg-[#0B0813]">
          <p>© 2026 Spent. Built for every centavo.</p>
        </footer>
      </div>
  )
}