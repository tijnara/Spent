import Link from 'next/link';

export default function LandingPage() {
  return (
      <div className="min-h-screen flex flex-col bg-background text-card-foreground">
        {/* Header */}
        <header className="bg-spent-violet text-white p-4 px-6 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-spent-yellow text-spent-violet-dark rounded-lg flex items-center justify-center font-black text-lg">
              S
            </div>
            <span className="text-2xl font-bold tracking-tight">Spent</span>
          </div>
          <Link
              href="/login"
              className="border border-white/40 hover:border-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-spent-violet via-spent-violet to-spent-violet-dark text-white">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight max-w-3xl leading-tight">
            Track Every Dollar. <br />
            <span className="text-spent-yellow">Empower Your Wallet.</span>
          </h1>
          <p className="text-base sm:text-xl text-spent-violet-light mb-10 max-w-2xl leading-relaxed">
            Spent is the mobile-first budget tracker designed for fast daily entries, offline support, and crystal-clear financial insights.
          </p>
          <Link
              href="/login"
              className="bg-spent-yellow text-spent-violet-dark font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:bg-spent-yellow-dark transition-all transform hover:scale-105 active:scale-95"
          >
            Start Tracking Now
          </Link>
        </main>

        {/* Features Grid */}
        <section className="py-16 px-6 bg-card border-t border-card-border">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-input-bg border border-card-border rounded-2xl shadow-xs">
              <div className="text-spent-violet text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2 text-card-foreground">Lightning Fast</h3>
              <p className="text-muted text-sm leading-relaxed">Log expenses in under 3 taps with an interface optimized for one-handed mobile use.</p>
            </div>
            <div className="p-6 bg-input-bg border border-card-border rounded-2xl shadow-xs">
              <div className="text-spent-yellow text-3xl mb-3">✈️</div>
              <h3 className="font-bold text-lg mb-2 text-card-foreground">Offline Ready</h3>
              <p className="text-muted text-sm leading-relaxed">Track spending anywhere without a connection. As an installable PWA, Spent syncs seamlessly.</p>
            </div>
            <div className="p-6 bg-input-bg border border-card-border rounded-2xl shadow-xs">
              <div className="text-spent-violet text-3xl mb-3">📊</div>
              <h3 className="font-bold text-lg mb-2 text-card-foreground">Visual Insights</h3>
              <p className="text-muted text-sm leading-relaxed">Review daily habits and monthly balances with clean, real-time breakdowns.</p>
            </div>
          </div>
        </section>
      </div>
  );
}