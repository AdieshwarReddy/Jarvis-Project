import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Radio,
  LayoutDashboard,
  MessageSquare,
  History,
  FileText,
  StickyNote,
  CheckSquare,
  Clock,
  Activity,
  User,
  Settings,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/command-center', label: 'Command Center', icon: Radio, highlight: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'AI Workspace Chat', icon: MessageSquare },
    { to: '/history', label: 'Conversations', icon: History },
    { to: '/documents', label: 'Documents & RAG', icon: FileText },
    { to: '/notes', label: 'Saved Notes', icon: StickyNote },
    { to: '/tasks', label: 'Tasks & Planner', icon: CheckSquare },
    { to: '/reminders', label: 'Reminders', icon: Clock },
    { to: '/tools', label: 'Tool Activity', icon: Activity },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-cyan-500/10 bg-jarvis-bg/95 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Quick new chat button */}
          <NavLink
            to="/chat"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Chat Session</span>
          </NavLink>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Adhii Jarvis v1.0</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </aside>
    </>
  );
};
