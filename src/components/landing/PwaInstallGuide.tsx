'use client'

import { useState } from 'react'

export default function PwaInstallGuide() {
    const [platform, setPlatform] = useState<'ios' | 'android'>('ios')

    return (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
            <div className="bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
                {/* Ambient glow accent */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-spent-violet/15 rounded-full blur-[100px] pointer-events-none -z-10" />

                <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-3.5 py-1.5 rounded-full inline-block">
                        Zero App Store Friction
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Install Spent directly to your home screen.
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        No 100MB downloads or Apple/Google account friction. Install Spent as an ultra-light PWA with offline caching and instant full-screen launch.
                    </p>

                    {/* Platform Selector Tabs */}
                    <div className="pt-2 flex justify-center">
                        <div className="inline-flex p-1 rounded-2xl bg-[#0B0813] border border-white/[0.08]">
                            <button
                                type="button"
                                onClick={() => setPlatform('ios')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    platform === 'ios'
                                        ? 'bg-[#1A1433] text-white shadow-sm border border-white/[0.08]'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <span className="text-sm">🍎</span>
                                <span>iPhone / iOS (Safari)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlatform('android')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    platform === 'android'
                                        ? 'bg-[#1A1433] text-white shadow-sm border border-white/[0.08]'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <span className="text-sm">🤖</span>
                                <span>Android (Chrome)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Step Cards Grid */}
                {platform === 'ios' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-200">
                        <div className="bg-[#0B0813]/60 border border-white/[0.08] rounded-2xl p-5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-black text-[#FACC15]">
                                01
                            </div>
                            <h3 className="font-extrabold text-sm text-white">Open in Safari</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Launch Safari on your iPhone and visit <span className="text-[#FACC15] font-semibold">spent-wave.vercel.app</span>.
                            </p>
                            <div className="pt-2 text-xs text-zinc-500 font-mono">
                                🌐 Browser URL Bar
                            </div>
                        </div>

                        <div className="bg-[#0B0813]/60 border border-white/[0.08] rounded-2xl p-5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-black text-[#FACC15]">
                                02
                            </div>
                            <h3 className="font-extrabold text-sm text-white">Tap the Share Icon</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Tap the square <span className="text-white font-bold">Share icon with an arrow pointing up (⎋)</span> on the bottom navigation bar.
                            </p>
                            <div className="pt-2 text-xs text-zinc-500 font-mono">
                                📤 Share Toolbar Sheet
                            </div>
                        </div>

                        <div className="bg-[#0B0813]/60 border border-white/[0.08] rounded-2xl p-5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-black text-[#34D399]">
                                03
                            </div>
                            <h3 className="font-extrabold text-sm text-white">Add to Home Screen</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Scroll down the actions list and tap <span className="text-white font-bold">&quot;Add to Home Screen&quot;</span>. Launches full screen with no browser chrome.
                            </p>
                            <div className="pt-2 text-xs text-[#34D399] font-mono">
                                📲 Instant Icon Installed
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-200">
                        <div className="bg-[#0B0813]/60 border border-white/[0.08] rounded-2xl p-5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-black text-[#FACC15]">
                                01
                            </div>
                            <h3 className="font-extrabold text-sm text-white">Open in Chrome</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Open Google Chrome on Android and navigate to <span className="text-[#FACC15] font-semibold">spent.ph</span>.
                            </p>
                            <div className="pt-2 text-xs text-zinc-500 font-mono">
                                🌐 Mobile Chrome
                            </div>
                        </div>

                        <div className="bg-[#0B0813]/60 border border-white/[0.08] rounded-2xl p-5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-black text-[#FACC15]">
                                02
                            </div>
                            <h3 className="font-extrabold text-sm text-white">Tap Menu or Banner</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Tap the <span className="text-white font-bold">Three Dots (⋮)</span> in the top right corner, or look for the bottom &quot;Install App&quot; banner.
                            </p>
                            <div className="pt-2 text-xs text-zinc-500 font-mono">
                                ⋮ Chrome Options
                            </div>
                        </div>

                        <div className="bg-[#0B0813]/60 border border-white/[0.08] rounded-2xl p-5 space-y-3">
                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-black text-[#34D399]">
                                03
                            </div>
                            <h3 className="font-extrabold text-sm text-white">Install App</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Tap <span className="text-white font-bold">&quot;Install app&quot;</span> or &quot;Add to Home screen&quot;. An app icon is pinned instantly with zero overhead.
                            </p>
                            <div className="pt-2 text-xs text-[#34D399] font-mono">
                                ⚡ Standalone Native Shell
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}