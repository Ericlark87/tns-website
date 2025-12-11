// ~/TNS/company_site/client/src/pages/Novel.jsx

import React from "react";

export default function Novel() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        {/* Label */}
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-3">
          Fiction
        </p>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
          Crown of Silence
        </h1>

        {/* Tagline */}
        <p className="text-slate-300 mb-6 max-w-2xl">
          A grounded, fantasy-tilted story about loss, memory, and trying to
          carry the people you love through a world that keeps breaking.
        </p>

        {/* Coming soon card */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg shadow-black/40">
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Coming soon
          </h2>
          <p className="text-sm text-slate-300 mb-3">
            <span className="font-medium text-emerald-300">
              Crown of Silence
            </span>{" "}
            is still in active development. The manuscript is being rebuilt,
            edited, and tuned before it ever hits readers’ hands.
          </p>

          <p className="text-sm text-slate-400 mb-4">
            When it&apos;s ready, this page will become the hub for:
          </p>

          <ul className="text-sm text-slate-300 space-y-1 mb-6 list-disc list-inside">
            <li>Book description and teaser chapters</li>
            <li>Character art and world details</li>
            <li>Links to buy or download</li>
            <li>Behind-the-scenes notes from the author</li>
          </ul>

          <p className="text-xs text-slate-500">
            For now, just know this: the same person building{" "}
            <span className="font-medium text-emerald-300">QuitChampion</span>{" "}
            is pouring the same honesty and stubbornness into this story. It&apos;ll
            ship when it&apos;s sharp enough to be worth your time.
          </p>
        </section>
      </div>
    </main>
  );
}
