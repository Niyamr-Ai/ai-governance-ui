"use client";

import Link from "next/link";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-4">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600">
          Reports are not yet available here. Use the dashboard for current data.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
