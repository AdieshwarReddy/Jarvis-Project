import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AmbientVoiceModal } from '../components/AmbientVoiceModal';
import { useSocket } from '../context/SocketContext';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isVoiceHudOpen, closeVoiceHud, activeConversationId, sendChatMessage } = useSocket();

  return (
    <div className="min-h-screen bg-jarvis-bg text-slate-100 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto md:ml-64 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Global Fullscreen Stark Arc Core Jarvis Voice HUD */}
      <AmbientVoiceModal
        conversationId={activeConversationId}
        isOpen={isVoiceHudOpen}
        onClose={closeVoiceHud}
        onSendMessage={(text, voiceReply) => {
          sendChatMessage(activeConversationId, text, voiceReply ?? true);
        }}
      />
    </div>
  );
};
