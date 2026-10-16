import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-white pb-20">
            <header className="bg-spent-violet p-6 text-white shadow-md">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-spent-violet-light">Your money at a glance</p>
            </header>

            <main className="p-6">
                <div className="bg-spent-violet-bg p-6 rounded-xl shadow-sm border border-spent-violet-light mb-6">
                    <h2 className="text-lg text-gray-700 font-semibold mb-2">Total Balance</h2>
                    <p className="text-4xl font-bold text-spent-violet-dark">$0.00</p>
                </div>

                <h3 className="font-bold text-gray-800 text-lg mb-4">Recent Transactions</h3>
                <p className="text-gray-500 italic">No transactions yet. Start logging!</p>
            </main>

            {/* Placeholder for Bottom Navigation Bar */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-4">
                <div className="text-spent-violet font-bold">Home</div>
                <div className="w-12 h-12 bg-spent-yellow rounded-full flex items-center justify-center -mt-6 shadow-lg border-4 border-white text-spent-violet-dark text-2xl font-bold cursor-pointer">+</div>
                <div className="text-gray-400">Settings</div>
            </nav>
        </div>
    );
}