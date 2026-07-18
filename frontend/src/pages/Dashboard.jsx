import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-left w-full">
      <header className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Welcome to your AI Learning Companion.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Active Courses</h3>
          <p className="text-3xl font-bold mt-2 text-violet-600 dark:text-violet-400">4</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Study Streak</h3>
          <p className="text-3xl font-bold mt-2 text-violet-600 dark:text-violet-400">7 Days</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">AI Queries Used</h3>
          <p className="text-3xl font-bold mt-2 text-violet-600 dark:text-violet-400">42 / 100</p>
        </div>
      </div>
    </div>
  );
}
