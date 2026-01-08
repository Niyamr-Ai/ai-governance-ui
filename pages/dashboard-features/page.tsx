"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardFeaturesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Dashboard</p>
          <h1 className="text-3xl font-bold">Unified AI Governance Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Centralize compliance insights with real-time visibility.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Live compliance posture",
              desc: "See at-a-glance compliance scores, recent mappings, and gaps across all AI systems.",
            },
            {
              title: "Actionable alerts",
              desc: "Flag overdue audits, missing documentation, and failed mappings; route to owners quickly.",
            },
            {
              title: "Reporting-ready",
              desc: "Export views and evidence for regulators and stakeholders with one click.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-2 text-gray-600">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">See it in action</h2>
          <p className="mt-2 text-gray-600">
            Explore the live compliance dashboard, or book a walkthrough.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700"
            >
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
