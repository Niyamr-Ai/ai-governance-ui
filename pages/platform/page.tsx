"use client";

import Link from "next/link";

export default function PlatformPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Platform</p>
          <h1 className="text-3xl font-bold">Platform overview</h1>
          <p className="text-gray-600">
            Explore compliance features from the live pages below.
          </p>
        </header>
        <div className="flex gap-3">
          <Link href="/assessment" className="text-blue-600 hover:underline">
            Compliance
          </Link>
        </div>
      </div>
    </main>
  );
}
