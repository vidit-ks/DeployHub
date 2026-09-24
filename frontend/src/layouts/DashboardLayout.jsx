import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SettingsModal from '../components/SettingsModal';
import ToastNotification from '../components/ToastNotification';
import AIDiagnosisModal from '../components/AIDiagnosisModal';
import { useApp } from '../context/AppContext';

export default function DashboardLayout() {
  const { aiModalData, setAiModalData } = useApp();

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-pink-600/5 blur-[120px] pointer-events-none" />
          <Outlet />
        </main>
      </div>

      <SettingsModal />
      <ToastNotification />

      {/* Global AI Diagnosis Modal if triggered from table */}
      {aiModalData && (
        <AIDiagnosisModal
          isOpen={Boolean(aiModalData)}
          onClose={() => setAiModalData(null)}
          data={aiModalData}
        />
      )}
    </div>
  );
}
