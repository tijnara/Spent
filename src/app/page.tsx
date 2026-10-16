import Link from 'next/link';

export default function LandingPage() {
  return (
      <div className="min-h-screen flex flex-col bg-spent-violet-bg text-spent-violet-dark">
        <header className="bg-spent-violet text-white p-4 flex justify-between items-center shadow-md">
          <div className="text-2xl font-bold tracking-tight">Spent</div>
          {/* Points to the Login page */}
          <Link
              href="/login"
              className="border border-white px-4 py-2 rounded-md hover:bg-spent-violet-dark transition"
          >
            Sign In
          </Link>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-16 bg-gradient-to-b from-spent-violet to-spent-violet-dark text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Track Every Dollar. <br className="hidden md:block" />
            <span className="text-spent-yellow">Empower Your Wallet.</span>
          </h1>
          <p className="text-lg md:text-xl text-spent-violet-light mb-10 max-w-2xl">
            Spent is the mobile-first budget tracker designed for fast daily entries, offline support, and crystal-clear financial insights.
          </p>
          {/* Points to the Signup page */}
          <Link
              href="/signup"
              className="bg-spent-yellow text-spent-violet-dark font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-spent-yellow-dark transition transform hover:scale-105"
          >
            Start Tracking Now
          </Link>
        </main>

        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-gray-100 rounded-xl shadow-sm">
              <div className="text-spent-violet text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-xl mb-2 text-spent-violet-dark">Lightning Fast</h3>
              <p className="text-gray-600">Log your expenses in under 3 taps with our optimized mobile interface.</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-xl shadow-sm">
              <div className="text-spent-yellow text-4xl mb-4">✈️</div>
              <h3 className="font-bold text-xl mb-2 text-spent-violet-dark">Offline Ready</h3>
              <p className="text-gray-600">Track spending anywhere. As a PWA, Spent works offline and syncs later.</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-xl shadow-sm">
              <div className="text-spent-violet text-4xl mb-4">📊</div>
              <h3 className="font-bold text-xl mb-2 text-spent-violet-dark">Visual Insights</h3>
              <p className="text-gray-600">Understand your habits instantly with beautiful, interactive charts.</p>
            </div>
          </div>
        </section>
      </div>
  );
}