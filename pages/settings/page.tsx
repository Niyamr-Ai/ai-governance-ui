"use client";

import Link from "next/link";
import Head from 'next/head';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <Head>
        <title>Settings</title>
        <meta name="description" content="Manage your account and application settings." />
      </Head>
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">
          Settings are not yet configured here. Please use your profile for available controls.
        </p>
      </div>
    </main>
  );
}
