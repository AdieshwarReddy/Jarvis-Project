import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-jarvis-bg flex flex-col items-center justify-center px-4 text-center">
      <div className="h-16 w-16 rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/10">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">404 — Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        The workspace coordinates you requested do not exist or have been relocated.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
