import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Mic,
  Brain,
  FileText,
  CheckCircle,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Mic,
      title: 'Voice AI & Audio',
      desc: 'Push-to-talk neural speech recognition and high-fidelity text-to-speech audio streaming.',
      tag: 'Real-Time',
    },
    {
      icon: Brain,
      title: 'Smart Memory',
      desc: 'Long-term preference retention and conversation context summarization for personalized assistance.',
      tag: 'Contextual',
    },
    {
      icon: FileText,
      title: 'Document Intelligence',
      desc: 'Upload PDFs, DOCX, and notes. Ask grounded questions with exact source and chunk citations.',
      tag: 'RAG Pipeline',
    },
    {
      icon: CheckCircle,
      title: 'Productivity Suite',
      desc: 'Create notes, organize prioritized tasks, and schedule alerts with APScheduler background worker.',
      tag: 'Integrated',
    },
    {
      icon: Zap,
      title: 'Real-Time Responses',
      desc: 'Ultra-low latency token streaming powered by FastAPI and Socket.IO bidirectional events.',
      tag: 'FastAPI + SIO',
    },
    {
      icon: Layers,
      title: 'Multi-Model AI',
      desc: 'Unified provider abstraction supporting Groq, OpenAI, Anthropic, and local mock fallbacks.',
      tag: 'Multi-Provider',
    },
  ];

  return (
    <div className="min-h-screen bg-jarvis-bg text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 w-full border-b border-cyan-500/10 bg-jarvis-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Adhii Jarvis
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800/60 transition"
            >
              Sign In
            </Link>
            <Link
              to="/chat"
              className="text-sm font-medium text-white px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition active:scale-95"
            >
              Start Jarvis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-8 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Think. Speak. Act.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          YOUR AI WORKSPACE. <br />
          <span className="text-gradient">READY WHEN YOU ARE.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light">
          Talk, type, organize, search, learn and work with one intelligent assistant designed for engineers, students, and professionals.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            to="/chat"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-base shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-95 group"
          >
            <span>START JARVIS</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-medium text-base border border-slate-700/80 transition-all duration-200"
          >
            EXPLORE FEATURES
          </a>
        </div>

        {/* Safe Execution Guarantee Badge */}
        <div className="inline-flex items-center gap-3 p-3 px-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>State modifications require explicit confirmation cards. Zero fake integrations.</span>
        </div>

        {/* Feature Cards Grid */}
        <section id="features" className="w-full pt-24 text-left">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Full-Stack Workspace Architecture
            </h2>
            <p className="text-sm text-slate-400">
              Engineered with FastAPI, React Vite, PostgreSQL Supabase RLS, and Socket.IO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-jarvis-card/70 border border-cyan-500/15 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>Adhii Jarvis — Personal AI Workspace • Designed & Built for Software Engineering Placement Portfolio</p>
      </footer>
    </div>
  );
};
