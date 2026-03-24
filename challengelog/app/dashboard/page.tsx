"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
    const { data: session } = useSession();

    return (
        <div className="p-8 max-w-4xl mx-auto mt-10 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <h1 className="text-3xl font-medium mb-4 text-zinc-900 dark:text-white">Dashboard</h1>
            {session?.user && (
                <div className="mb-6">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Welcome, <span className="font-semibold text-zinc-900 dark:text-white">{session.user.name || session.user.email}</span>!
                    </p>
                </div>
            )}
            <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
                Log out
            </button>
        </div>
    );
}