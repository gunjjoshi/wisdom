"use client";

import { useState } from "react";
import AttentionVisualizer from "@/components/AttentionVisualizer";

export default function Home() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, max_tokens: 128 }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch analysis");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="flex-none p-4 border-b border-surface-hover bg-surface flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-primary">
            Wisdom
          </h1>
          <span className="text-lg text-gray-400">Transformer Internals Visualizer</span>
        </div>
        <div className="flex gap-2 w-1/2 max-w-xl">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Enter text to analyze..."
            className="flex-1 bg-background border border-surface-hover rounded-md px-4 py-2 text-base focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-primary hover:bg-[#FEF08A] text-zinc-900 px-5 py-2 rounded-md text-base font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="bg-red-500/10 text-red-500 p-4 rounded-lg border border-red-500/20 max-w-md text-center">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-xs mt-4 text-red-400">Make sure the backend is running on port 8000.</p>
              <button 
                onClick={() => setError(null)}
                className="mt-4 px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30 transition-colors text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {loading && !data && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 animate-pulse">Running model inference...</p>
            </div>
          </div>
        )}

        {data ? (
          <AttentionVisualizer data={data} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center transform rotate-12 opacity-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <p>Enter text above to visualize transformer attention</p>
          </div>
        )}
      </div>
    </main>
  );
}
