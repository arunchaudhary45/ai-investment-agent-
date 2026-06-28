"use client";

// ─────────────────────────────────────────────────────────────
// app/page.tsx — AI Investment Research Agent Dashboard
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { parseResearchResult, DashboardData } from "@/lib/dashboardParser";

export default function Home() {
  // ── State Variables ──────────────────────────────────────────
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [searchedText, setSearchedText] = useState("");

  // ── Format current date for the dashboard header ─────────────
  const [currentDateString, setCurrentDateString] = useState("26 Jun 2026");
  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    setCurrentDateString(new Date().toLocaleDateString('en-GB', options));
  }, []);

  // ── The Research Handler ─────────────────────────────────────
  async function handleResearch(targetCompany: string) {
    const query = targetCompany.trim();
    if (!query || loading) return;

    setLoading(true);
    setError(null);
    setSearchedText(query);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Parse the results into structured dashboard format
      const parsed = parseResearchResult(query, data.result);
      setDashboardData(parsed);
      setRawResult(data.result);
      setIsSimulated(data.simulated || false);
      setIsReportOpen(false); // Reset report collapse state
    } catch (err) {
      setError("Failed to connect to the research agent. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Helper for quick-search
  const triggerQuickSearch = (name: string) => {
    setCompanyName(name);
    handleResearch(name);
  };

  // Reset dashboard state to go home
  const handleGoHome = () => {
    setCompanyName("");
    setDashboardData(null);
    setRawResult(null);
    setError(null);
  };

  // ════════════════════════════════════════════════════════════
  // 1. LANDING PAGE STATE
  // ════════════════════════════════════════════════════════════
  if (!dashboardData && !loading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-deep text-foreground font-sans">
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-red" />
        
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-dark px-4 py-1.5 text-xs font-semibold text-text-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-invest animate-pulse" />
            Investment Intelligence · Real-Time Market Scanning
          </div>

          {/* Logo & Headline */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-accent-blue/10 rounded-2xl border border-accent-blue/30 shadow-lg shadow-accent-blue/5">
                <svg className="h-12 w-12 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-bright">
              AI Research Agent
            </h1>
            <p className="mt-4 max-w-lg mx-auto text-base sm:text-lg text-text-muted leading-relaxed">
              Enter any company name or ticker to analyze market sentiment, evaluate key financials, compare competitors, and receive a clear investment signal.
            </p>
          </div>

          {/* Large Center Search Panel */}
          <div className="w-full max-w-xl bg-surface-card p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </span>
                <input
                  id="company-input"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResearch(companyName)}
                  placeholder="Enter company name, e.g. NVIDIA, Tesla, Apple"
                  className="w-full rounded-2xl border border-border-subtle bg-surface-dark pl-12 pr-4 py-4 text-sm text-text-bright placeholder:text-text-muted
                             outline-none transition-all duration-200 focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10"
                />
              </div>
              <button
                id="research-button"
                onClick={() => handleResearch(companyName)}
                disabled={!companyName.trim()}
                className="rounded-2xl bg-accent-blue hover:bg-blue-600 px-8 py-4 text-sm font-semibold text-white transition-all duration-200
                           active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Research
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl border border-accent-red/20 bg-accent-red/5 text-xs text-accent-red flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Quick Search Suggestions */}
            <div className="mt-6 border-t border-border-subtle pt-5">
              <span className="text-xs text-text-muted font-medium block mb-3">POPULAR RESEARCH TICKERS</span>
              <div className="flex flex-wrap gap-2">
                {["NVIDIA", "Apple", "Tesla", "Microsoft", "Google"].map((ticker) => (
                  <button
                    key={ticker}
                    onClick={() => triggerQuickSearch(ticker)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-surface-dark border border-border-subtle text-text-bright
                               hover:border-accent-blue hover:bg-surface-hover hover:text-accent-blue transition-all cursor-pointer"
                  >
                    {ticker}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <footer className="mt-16 text-center text-xs text-text-muted">
            Powered by LangChain.js &amp; Google Gemini · For educational purposes only
          </footer>
        </main>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 2. LOADING STATE (DASHBOARD SHIMMER SKELETON)
  // ════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep text-foreground p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-surface-card animate-shimmer" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-surface-card animate-shimmer" />
              <div className="h-3.5 w-60 rounded bg-surface-card animate-shimmer" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-lg bg-surface-card animate-shimmer" />
            <div className="h-9 w-28 rounded-lg bg-surface-card animate-shimmer" />
          </div>
        </div>

        {/* 4 Cards Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-card rounded-2xl border border-border-subtle p-5 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="h-3.5 w-24 rounded bg-surface-dark animate-shimmer" />
                <div className="h-4 w-4 rounded-full bg-surface-dark animate-shimmer" />
              </div>
              <div className="space-y-2">
                <div className="h-7 w-20 rounded bg-surface-dark animate-shimmer" />
                <div className="h-3.5 w-16 rounded bg-surface-dark animate-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {/* Mid Section Skeleton (Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-4 bg-surface-card rounded-2xl border border-border-subtle p-6 h-96 flex flex-col justify-between">
            <div className="h-4 w-32 rounded bg-surface-dark animate-shimmer" />
            <div className="space-y-4">
              <div className="h-16 w-32 rounded-lg bg-surface-dark animate-shimmer" />
              <div className="h-8 w-full rounded bg-surface-dark animate-shimmer" />
              <div className="h-2 w-full rounded-full bg-surface-dark animate-shimmer" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded bg-surface-dark animate-shimmer" />
              <div className="h-6 w-16 rounded bg-surface-dark animate-shimmer" />
              <div className="h-6 w-16 rounded bg-surface-dark animate-shimmer" />
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-8 bg-surface-card rounded-2xl border border-border-subtle p-6 h-96 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-36 rounded bg-surface-dark animate-shimmer" />
              <div className="h-8 w-8 rounded bg-surface-dark animate-shimmer" />
            </div>
            <div className="space-y-3 flex-1 justify-center flex flex-col mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                  <div className="h-4 w-12 rounded bg-surface-dark animate-shimmer" />
                  <div className="h-4 w-20 rounded bg-surface-dark animate-shimmer" />
                  <div className="h-6 w-14 rounded-full bg-surface-dark animate-shimmer" />
                  <div className="h-4 w-8 rounded bg-surface-dark animate-shimmer" />
                  <div className="h-4 w-16 rounded bg-surface-dark animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 3. DASHBOARD MAIN STATE
  // ════════════════════════════════════════════════════════════
  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-bg-deep text-foreground font-sans flex flex-col">
      {/* Decorative Top Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-red" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6">
        
        {/* ════════════════════════════════════════════════════════ */}
        {/* HEADER SECTION                                         */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border-subtle pb-5">
          {/* Logo & Agent Branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleGoHome}
              className="p-2.5 bg-accent-blue/10 rounded-xl border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/20 transition-all cursor-pointer"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-text-bright">AI Research Agent</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface-hover text-text-muted font-mono font-bold border border-border-subtle">
                  {dashboardData.ticker}
                </span>
                {isSimulated && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-accent-yellow/10 text-accent-yellow font-bold uppercase border border-accent-yellow/20">
                    Offline Sandbox
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted">
                Investment Intelligence · {dashboardData.companyName} Research · real-time
              </p>
            </div>
          </div>

          {/* Quick Header Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResearch(companyName)}
                placeholder="Search other company..."
                className="w-full rounded-xl border border-border-subtle bg-surface-card pl-9 pr-3 py-2 text-xs text-text-bright placeholder:text-text-muted
                           outline-none transition-all duration-200 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/15"
              />
            </div>
            
            {/* Control Badges */}
            <div className="flex gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-surface-card border border-border-subtle px-3 py-2 text-xs font-semibold text-text-muted">
                <svg className="h-3.5 w-3.5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {currentDateString}
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-surface-card border border-border-subtle px-3 py-2 text-xs font-semibold text-text-bright">
                <span className="inline-block h-2 w-2 rounded-full bg-invest animate-pulse-glow" />
                active - v2.4
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* ROW 1: KEY CARDS (METRICS)                              */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Coverage */}
          <div className="bg-surface-card rounded-2xl border border-border-subtle p-5 hover:border-accent-blue/30 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Coverage</span>
              <svg className="h-4 w-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-text-bright">{dashboardData.totalCoverage}</span>
                <div className="text-[11px] font-bold text-invest flex items-center gap-0.5 mt-0.5">
                  <span>↑</span>
                  <span>{dashboardData.totalCoverageChange}</span>
                </div>
              </div>
              {/* Sparkline Curve */}
              <div className="w-24 h-10">
                <svg viewBox="0 0 100 30" className="w-full h-full text-accent-blue">
                  <path
                    d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="animate-draw"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Sentiment Score */}
          <div className="bg-surface-card rounded-2xl border border-border-subtle p-5 hover:border-accent-purple/30 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Sentiment Score</span>
              <svg className="h-4 w-4 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-text-bright">{dashboardData.sentimentScore.toFixed(1)}</span>
                <div className={`text-[11px] font-bold flex items-center gap-0.5 mt-0.5 ${dashboardData.sentimentChangeDir === 'up' ? 'text-invest' : 'text-pass'}`}>
                  <span>{dashboardData.sentimentChangeDir === 'up' ? '↑' : '↓'}</span>
                  <span>{dashboardData.sentimentChange}</span>
                </div>
              </div>
              {/* Sparkline Curve */}
              <div className="w-24 h-10">
                <svg viewBox="0 0 100 30" className="w-full h-full text-accent-purple">
                  <path
                    d="M0,20 Q15,28 30,12 T60,18 T90,5 T100,15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="animate-draw"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: AI Confidence */}
          <div className="bg-surface-card rounded-2xl border border-border-subtle p-5 hover:border-accent-yellow/30 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Confidence</span>
              <svg className="h-4 w-4 text-accent-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-text-bright">{dashboardData.aiConfidence}%</span>
                <div className="text-[11px] font-bold text-invest flex items-center gap-0.5 mt-0.5">
                  <span>↑</span>
                  <span>{dashboardData.aiConfidenceChange}</span>
                </div>
              </div>
              {/* Sparkline Curve */}
              <div className="w-24 h-10">
                <svg viewBox="0 0 100 30" className="w-full h-full text-accent-yellow">
                  <path
                    d="M0,15 Q20,5 40,25 T80,10 T100,12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="animate-draw"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 4: Agent Verdict */}
          <div className={`bg-surface-card rounded-2xl border p-5 transition-all duration-300 ${dashboardData.verdict === 'INVEST' ? 'border-invest/30 hover:border-invest/50' : 'border-pass/30 hover:border-pass/50'}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Verdict</span>
              <span className="text-sm">★</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className={`text-2xl font-bold uppercase tracking-wide ${dashboardData.verdict === 'INVEST' ? 'text-invest' : 'text-pass'}`}>
                  {dashboardData.verdict}
                </span>
                <div className={`text-[11px] font-bold flex items-center gap-0.5 mt-0.5 ${dashboardData.priceChangeDir === 'up' ? 'text-invest' : 'text-pass'}`}>
                  <span>{dashboardData.priceChangeDir === 'up' ? '↑' : '↓'}</span>
                  <span>{dashboardData.currentPrice} ({dashboardData.priceChange})</span>
                </div>
              </div>
              {/* Dynamic Verdict Sparkline Curve */}
              <div className="w-24 h-10">
                {dashboardData.verdict === "INVEST" ? (
                  <svg viewBox="0 0 100 30" className="w-full h-full text-invest">
                    <path
                      d="M0,28 Q20,20 40,12 T80,5 T100,2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="animate-draw"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 100 30" className="w-full h-full text-pass">
                    <path
                      d="M0,2 Q20,10 40,18 T80,25 T100,28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="animate-draw"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* MIDDLE GRID: MARKET SENTIMENT & TOP PICKS TABLE          */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Market Sentiment */}
          <div className="lg:col-span-5 bg-surface-card rounded-2xl border border-border-subtle p-6 flex flex-col justify-between hover:border-border-glow/20 transition-all duration-300">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-text-bright flex items-center gap-2">
                  <span className="p-1 bg-accent-blue/10 rounded text-accent-blue text-xs">💬</span>
                  {dashboardData.ticker} Sentiment
                </h3>
                <button title="Sentiment indicator represents global aggregated AI analysis of media, financials, and reports." className="text-text-muted hover:text-text-bright text-xs border border-border-subtle rounded px-2 py-0.5 bg-surface-dark cursor-pointer">
                  ⓘ
                </button>
              </div>

              {/* Big Score Panel */}
              <div className="flex items-baseline gap-2.5 mb-6">
                <span className={`text-5xl font-black ${dashboardData.verdict === 'INVEST' ? 'text-invest' : 'text-pass'}`}>
                  {dashboardData.sentimentScore}
                </span>
                <span className="text-sm font-bold text-text-muted px-2 py-0.5 rounded bg-surface-hover font-mono">
                  {dashboardData.marketSentimentLabel}
                </span>
              </div>

              {/* AI Brief Alert */}
              <div className="border-l-3 border-accent-blue bg-accent-blue/5 rounded-r-xl p-3.5 text-xs text-foreground/90 leading-relaxed mb-6">
                ✨ <span className="font-semibold text-text-bright">AI:</span> {dashboardData.sentimentBrief}
              </div>

              {/* Progress Sentiment Bar */}
              <div className="space-y-2 mb-6">
                <div className="w-full bg-surface-dark rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${dashboardData.verdict === 'INVEST' ? 'bg-invest' : 'bg-pass'}`}
                    style={{ width: `${dashboardData.sentimentScore}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-muted font-bold">
                  <span>last update: 14:32 UTC</span>
                  <span>{dashboardData.modelAgreement}% model agreement</span>
                </div>
              </div>
            </div>

            {/* Sector Sentiment Badges */}
            <div className="border-t border-border-subtle pt-4">
              <span className="text-[10px] text-text-muted font-bold block mb-3 uppercase tracking-wider">Research Drivers</span>
              <div className="flex flex-wrap gap-2">
                {dashboardData.sectors.map((sector, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-dark border border-border-subtle text-text-bright"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${sector.isPositive ? 'bg-invest' : 'bg-pass'}`} />
                    <span className="opacity-80 font-mono text-[11px]">{sector.name}:</span>
                    <span className={sector.isPositive ? 'text-invest' : 'text-pass'}>{sector.value}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Card 2: Competitor Peers / Top Picks Table */}
          <div className="lg:col-span-7 bg-surface-card rounded-2xl border border-border-subtle p-6 hover:border-border-glow/20 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-text-bright flex items-center gap-2">
                  <span className="p-1 bg-accent-yellow/10 rounded text-accent-yellow text-xs">🏆</span>
                  Industry Peer Analysis
                </h3>
                <button
                  onClick={() => handleResearch(searchedText)}
                  className="p-1 text-text-muted hover:text-text-bright border border-border-subtle bg-surface-dark rounded hover:bg-surface-hover transition-all cursor-pointer"
                  title="Reload current company analysis"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-text-muted border-b border-border-subtle font-bold uppercase text-[10px] tracking-wider pb-3">
                      <th className="pb-3 pr-2">Ticker</th>
                      <th className="pb-3">Company</th>
                      <th className="pb-3 text-center">Signal</th>
                      <th className="pb-3 text-center">AI Score</th>
                      <th className="pb-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {dashboardData.peers.map((peer, i) => {
                      const isCurrent = peer.ticker === dashboardData.ticker;
                      return (
                        <tr
                          key={i}
                          onClick={() => triggerQuickSearch(peer.ticker)}
                          className={`hover:bg-surface-hover transition-all duration-150 cursor-pointer group ${isCurrent ? 'bg-accent-blue/5 border-x border-accent-blue/20' : ''}`}
                        >
                          <td className={`py-3.5 pl-2 font-mono font-bold ${isCurrent ? 'text-accent-blue' : 'text-text-bright'}`}>
                            {peer.ticker}
                          </td>
                          <td className="py-3.5 text-text-bright font-medium opacity-90 group-hover:opacity-100">
                            {peer.name} {isCurrent && <span className="text-[10px] ml-1 text-accent-blue font-bold">(Active)</span>}
                          </td>
                          <td className="py-3.5 text-center">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                              peer.signal === "BUY" ? "bg-invest-bg border-invest/35 text-invest" :
                              peer.signal === "HOLD" ? "bg-accent-yellow/5 border-accent-yellow/35 text-accent-yellow" :
                              "bg-pass-bg border-pass/35 text-pass"
                            }`}>
                              {peer.signal}
                            </span>
                          </td>
                          <td className="py-3.5 text-center">
                            <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                peer.score > 80 ? 'bg-invest' :
                                peer.score > 55 ? 'bg-accent-yellow' : 'bg-pass'
                              }`} />
                              {peer.score}
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-mono font-bold text-text-bright pr-2">
                            {peer.price}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* view links */}
            <div className="border-t border-border-subtle pt-4 flex justify-between items-center text-xs">
              <span className="text-text-muted">Sector: Tech &amp; Hardware</span>
              <button 
                onClick={handleGoHome}
                className="text-accent-blue hover:text-blue-400 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                🏠 Return to search
              </button>
            </div>

          </div>

        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* BOTTOM GRID: AI INSIGHTS & WATCHLIST                    */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: AI Insights */}
          <div className="lg:col-span-8 bg-surface-card rounded-2xl border border-border-subtle p-6 hover:border-border-glow/20 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-text-bright flex items-center gap-2">
                  <span className="p-1 bg-accent-purple/10 rounded text-accent-purple text-xs">💡</span>
                  AI Insights &amp; Catalyst Feeds
                </h3>
                <span className="text-xs text-text-muted">...</span>
              </div>

              {/* Insights List */}
              <div className="space-y-4">
                {dashboardData.insights.map((insight, i) => {
                  let icon = "🌐";
                  let bgStyle = "bg-accent-blue/10 text-accent-blue border-accent-blue/20";
                  if (insight.category === "tech") {
                    icon = "⚡";
                    bgStyle = "bg-accent-blue/10 text-accent-blue border-accent-blue/25";
                  } else if (insight.category === "macro") {
                    icon = "⚖️";
                    bgStyle = "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/25";
                  } else if (insight.category === "sector") {
                    icon = "⭕";
                    bgStyle = "bg-accent-purple/10 text-accent-purple border-accent-purple/25";
                  }
                  
                  return (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-border-subtle bg-surface-dark/40 hover:bg-surface-dark transition-all duration-200">
                      <div className={`p-2.5 h-10 w-10 flex items-center justify-center rounded-lg border font-bold text-sm shrink-0 ${bgStyle}`}>
                        {icon}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-text-bright leading-relaxed font-semibold">
                          {insight.text}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold font-mono">
                          <span>{insight.time}</span>
                          <span>·</span>
                          <span className="uppercase text-[9px]">{insight.category} catalyst</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t border-border-subtle pt-4 mt-6 flex justify-between items-center text-xs text-text-muted">
              <span>Auto-curated analysis from Tavily search index</span>
              <span className="font-semibold text-text-bright">Confidence: 94%</span>
            </div>

          </div>

          {/* Card 2: Watchlist */}
          <div className="lg:col-span-4 bg-surface-card rounded-2xl border border-border-subtle p-6 hover:border-border-glow/20 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-text-bright flex items-center gap-2">
                  <span className="p-1 bg-accent-blue/10 rounded text-accent-blue text-xs">👁️</span>
                  Market Watchlist
                </h3>
                <span className="text-text-muted">→</span>
              </div>

              {/* Watchlist items */}
              <div className="space-y-3.5">
                {dashboardData.watchlist.map((stock, i) => (
                  <div
                    key={i}
                    onClick={() => triggerQuickSearch(stock.ticker)}
                    className="flex justify-between items-center p-2.5 rounded-lg hover:bg-surface-hover border border-transparent hover:border-border-subtle transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-mono font-bold text-text-bright group-hover:text-accent-blue transition-colors">
                      {stock.ticker}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold text-text-bright opacity-95">
                        {stock.price}
                      </span>
                      <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${
                        stock.isPositive ? 'bg-invest-bg border-invest/35 text-invest' : 'bg-pass-bg border-pass/35 text-pass'
                      }`}>
                        {stock.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4 mt-6 text-center">
              <button 
                onClick={handleGoHome}
                className="text-xs text-accent-blue hover:text-blue-400 font-bold cursor-pointer"
              >
                + Customize watchlist (Go home)
              </button>
            </div>

          </div>

        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* ROW 3: DETAILED AGENT REPORT PANEL (ACCORDION)          */}
        {/* ════════════════════════════════════════════════════════ */}
        {rawResult && (
          <div className="bg-surface-card rounded-2xl border border-border-subtle overflow-hidden hover:border-border-glow/15 transition-all duration-300">
            {/* Header Accordion Bar */}
            <button
              onClick={() => setIsReportOpen(!isReportOpen)}
              className="w-full flex justify-between items-center p-5 bg-surface-dark/60 hover:bg-surface-dark text-left font-bold text-xs cursor-pointer border-b border-border-subtle transition-all duration-200"
            >
              <span className="flex items-center gap-2 text-text-bright">
                <span>📄</span>
                <span>Full Agent Research &amp; Recommendation Report</span>
              </span>
              <span className={`text-text-muted text-base transition-transform duration-300 ${isReportOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* Collapsible Content */}
            {isReportOpen && (
              <div className="p-4 sm:p-6 bg-surface-dark/30 border-t border-border-subtle max-h-[750px] overflow-y-auto">
                <AgentReport rawResult={rawResult} companyName={dashboardData.companyName} />
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* FOOTER                                                 */}
        {/* ════════════════════════════════════════════════════════ */}
        <footer className="mt-10 py-6 text-center text-xs text-text-muted border-t border-border-subtle/50">
          Built with Next.js, LangChain.js &amp; LangGraph · AI-generated analysis is for educational purposes only · Real-time market scanning active.
        </footer>

      </main>
    </div>
  );
}

// ── AgentReport Component for Professional PDF-Style Layout ─────
interface BulletPoint {
  label: string;
  text: string;
}

interface Section {
  title: string;
  icon: string;
  paragraphs: string[];
  bullets: BulletPoint[];
}

function parseMarkdownToReact(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="text-text-bright font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx} className="italic text-text-muted">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="bg-surface-dark/80 text-accent-blue border border-border-subtle px-1.5 py-0.5 rounded font-mono text-[11px]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

interface AgentReportProps {
  rawResult: string;
  companyName: string;
}

function AgentReport({ rawResult, companyName }: AgentReportProps) {
  const [copied, setCopied] = useState(false);

  // Parse lines
  const lines = rawResult.split("\n");
  let reportTitle = `INVESTMENT ANALYSIS: ${companyName.toUpperCase()}`;
  let reportTicker = "";
  let verdict: "INVEST" | "PASS" | "HOLD" | "NEUTRAL" = "NEUTRAL";
  
  const sections: Section[] = [];
  const reasoning: BulletPoint[] = [];
  
  let currentSection: Section | null = null;
  let inReasoning = false;
  
  // Custom Verdict matching from rawResult
  if (/verdict:\s*invest/i.test(rawResult) || /\binvest\b/i.test(rawResult)) {
    verdict = "INVEST";
  } else if (/verdict:\s*pass/i.test(rawResult) || /\bpass\b/i.test(rawResult)) {
    verdict = "PASS";
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Title Match
    if ((line.startsWith("# ") || line.startsWith("## ")) && line.toUpperCase().includes("ANALYSIS")) {
      reportTitle = line.replace(/^#+\s*/, "").replace(/\*\*?/g, "").trim();
      const tickerMatch = line.match(/\(([^)]+)\)/);
      if (tickerMatch) {
        reportTicker = tickerMatch[1];
      }
      continue;
    }

    // Verdict Match
    if (line.toUpperCase().includes("VERDICT:")) {
      if (line.toUpperCase().includes("INVEST")) {
        verdict = "INVEST";
      } else if (line.toUpperCase().includes("PASS")) {
        verdict = "PASS";
      } else if (line.toUpperCase().includes("HOLD")) {
        verdict = "HOLD";
      }
      continue;
    }

    // Reasoning Match
    if (line.toUpperCase().includes("REASONING:") || line.toUpperCase().includes("**REASONING:**")) {
      inReasoning = true;
      currentSection = null;
      continue;
    }

    // Section Match
    if (line.startsWith("###")) {
      inReasoning = false;
      const titleText = line.replace(/^###+\s*/, "").replace(/\*\*?/g, "").trim();
      let icon = "📊";
      
      if (titleText.toLowerCase().includes("position") || titleText.toLowerCase().includes("sentiment") || titleText.includes("1")) {
        icon = "🌐";
      } else if (titleText.toLowerCase().includes("financial") || titleText.toLowerCase().includes("health") || titleText.includes("2")) {
        icon = "💵";
      } else if (titleText.toLowerCase().includes("risk") || titleText.includes("3")) {
        icon = "⚠️";
      }
      
      currentSection = {
        title: titleText,
        icon,
        paragraphs: [],
        bullets: []
      };
      sections.push(currentSection);
      continue;
    }

    // Bullets & Paragraphs
    if (inReasoning) {
      if (line.startsWith("*") || line.startsWith("-")) {
        const cleanLine = line.replace(/^[\s*-]+/, "").trim();
        const boldMatch = cleanLine.match(/^\*\*([^*]+)\*\*:(.*)$/);
        if (boldMatch) {
          reasoning.push({ label: boldMatch[1].trim(), text: boldMatch[2].trim() });
        } else {
          reasoning.push({ label: "", text: cleanLine });
        }
      }
    } else if (currentSection) {
      if (line.startsWith("*") || line.startsWith("-")) {
        const cleanLine = line.replace(/^[\s*-]+/, "").trim();
        const boldMatch = cleanLine.match(/^\*\*([^*]+)\*\*:(.*)$/);
        if (boldMatch) {
          currentSection.bullets.push({ label: boldMatch[1].trim(), text: boldMatch[2].trim() });
        } else {
          currentSection.bullets.push({ label: "", text: cleanLine });
        }
      } else {
        currentSection.paragraphs.push(line);
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rawResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const hasParsedData = sections.length > 0;

  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-2xl hover:border-border-glow/10 transition-all duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-surface-dark/80 border-b border-border-subtle gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-blue/10 rounded-lg text-accent-blue border border-accent-blue/20">
            <svg className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-bright tracking-tight">
              Research Agent Intelligence Report
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-mono">
              GENERATED BY INVESTMENT RESEARCH AI AGENT
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-dark hover:bg-surface-hover border border-border-subtle text-text-bright hover:text-accent-blue transition-all cursor-pointer flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <span className="text-invest">✓</span>
                <span className="text-invest text-xs">Copied!</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>Copy Raw</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-dark hover:bg-surface-hover border border-border-subtle text-text-bright hover:text-accent-blue transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Body */}
      <div className="p-6 sm:p-8 space-y-8 bg-gradient-to-b from-surface-dark/10 to-surface-deep/30">
        
        {/* Cover Block */}
        <div className="border-b border-border-subtle/80 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] text-accent-blue font-mono font-bold tracking-widest block uppercase">
              INSTITUTIONAL GRADE RESEARCH
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-text-bright tracking-tight">
              {reportTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-muted font-mono font-semibold">
              <span>SOURCE: MULTI-SOURCE WEB SCAN</span>
              <span>•</span>
              <span>STATUS: COMPLETE</span>
              {reportTicker && (
                <>
                  <span>•</span>
                  <span className="text-text-bright bg-surface-dark px-2 py-0.5 rounded border border-border-subtle">
                    {reportTicker}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Large Verdict Badge */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 shrink-0 w-full md:w-auto shadow-lg ${
            verdict === "INVEST" 
              ? "bg-invest-bg border-invest/35 text-invest shadow-invest/5" 
              : "bg-pass-bg border-pass/35 text-pass shadow-pass/5"
          }`}>
            <div className="space-y-0.5">
              <span className="text-[9px] text-text-muted font-bold tracking-widest uppercase block">
                RECOMMENDATION
              </span>
              <span className="text-2xl font-black tracking-widest uppercase block">
                {verdict}
              </span>
            </div>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 border ${
              verdict === "INVEST" 
                ? "bg-invest/10 border-invest/25" 
                : "bg-pass/10 border-pass/25"
            }`}>
              {verdict === "INVEST" ? "✓" : "✗"}
            </div>
          </div>
        </div>

        {hasParsedData ? (
          /* Structured Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side: Detailed Analysis */}
            <div className={reasoning.length > 0 ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
              {sections.map((section, idx) => (
                <div 
                  key={idx} 
                  className="bg-surface-dark/40 border border-border-subtle/85 rounded-xl p-5 hover:border-border-glow/5 transition-all duration-200"
                >
                  <h4 className="text-sm font-bold text-text-bright flex items-center gap-2.5 border-b border-border-subtle/50 pb-3 mb-4">
                    <span className="p-1.5 bg-surface-hover border border-border-subtle rounded-lg text-sm flex items-center justify-center">
                      {section.icon}
                    </span>
                    {section.title}
                  </h4>
                  
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4 last:mb-0">
                      {parseMarkdownToReact(p)}
                    </p>
                  ))}

                  {section.bullets.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 mt-4">
                      {section.bullets.map((bullet, bIdx) => (
                        <div 
                          key={bIdx} 
                          className="flex flex-col gap-1 p-3 rounded-lg bg-surface-dark/30 border border-border-subtle/40 hover:bg-surface-dark/60 hover:border-border-subtle transition-all duration-150"
                        >
                          {bullet.label && (
                            <span className="text-xs font-bold text-text-bright font-sans flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
                              {bullet.label}
                            </span>
                          )}
                          <span className="text-xs sm:text-sm text-text-muted leading-relaxed">
                            {parseMarkdownToReact(bullet.text)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side: Verdict Reasoning */}
            {reasoning.length > 0 && (
              <div className="lg:col-span-4 space-y-6">
                {/* Reasoning Block */}
                <div className={`border rounded-xl p-5 ${
                  verdict === "INVEST" 
                    ? "bg-invest-bg border-invest/25" 
                    : "bg-pass-bg border-pass/25"
                }`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-bright mb-4 flex items-center gap-2">
                    <span>📋</span>
                    Decision Rationale
                  </h4>
                  <div className="space-y-4">
                    {reasoning.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className={`mt-1 h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          verdict === "INVEST" 
                            ? "bg-invest/15 text-invest border border-invest/20" 
                            : "bg-pass/15 text-pass border border-pass/20"
                        }`}>
                          {verdict === "INVEST" ? "✓" : "✗"}
                        </div>
                        <div className="space-y-1">
                          {item.label && (
                            <p className="text-xs font-extrabold text-text-bright font-sans leading-tight">
                              {item.label}
                            </p>
                          )}
                          <p className="text-xs text-text-muted leading-relaxed">
                            {parseMarkdownToReact(item.text)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Fallback Elegant Markdown Renderer for arbitrary structured reports */
          <div className="bg-surface-dark/40 border border-border-subtle rounded-xl p-6">
            <div className="space-y-6">
              {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                
                // Render headers
                if (trimmed.startsWith("# ")) {
                  return (
                    <h1 key={idx} className="text-lg font-extrabold text-text-bright border-b border-border-subtle/50 pb-2 mt-4">
                      {parseMarkdownToReact(trimmed.slice(2))}
                    </h1>
                  );
                }
                if (trimmed.startsWith("## ")) {
                  return (
                    <h2 key={idx} className="text-md font-bold text-text-bright border-b border-border-subtle/30 pb-2 mt-4">
                      {parseMarkdownToReact(trimmed.slice(3))}
                    </h2>
                  );
                }
                if (trimmed.startsWith("### ")) {
                  return (
                    <h3 key={idx} className="text-sm font-bold text-text-bright mt-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
                      {parseMarkdownToReact(trimmed.slice(4))}
                    </h3>
                  );
                }
                
                // Render list items
                if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                  const content = trimmed.slice(2);
                  const boldMatch = content.match(/^\*\*([^*]+)\*\*:(.*)$/);
                  return (
                    <div key={idx} className="pl-4 border-l-2 border-border-subtle/80 py-1 my-1 text-xs sm:text-sm text-text-muted leading-relaxed">
                      {boldMatch ? (
                        <>
                          <strong className="text-text-bright font-bold mr-1">{boldMatch[1]}:</strong>
                          {parseMarkdownToReact(boldMatch[2])}
                        </>
                      ) : (
                        parseMarkdownToReact(content)
                      )}
                    </div>
                  );
                }

                // Normal Paragraph
                return (
                  <p key={idx} className="text-xs sm:text-sm text-text-muted leading-relaxed my-2">
                    {parseMarkdownToReact(trimmed)}
                  </p>
                );
              })}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
