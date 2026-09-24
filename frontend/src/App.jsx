import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import ProjectsPage from './pages/ProjectsPage';
import NewProjectWizard from './pages/NewProjectWizard';
import DeploymentDetail from './pages/DeploymentDetail';
import LogsPage from './pages/LogsPage';
import DeploymentHistoryPage from './pages/DeploymentHistoryPage';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import ToastNotification from './components/ToastNotification';

export default function App() {
  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
              <Navbar />
              <LandingPage />
              <SettingsModal />
              <ToastNotification />
            </div>
          }
        />

        {/* Dashboard Shell */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/new" element={<NewProjectWizard />} />
          <Route path="/deployments" element={<DeploymentHistoryPage />} />
          <Route path="/deployments/:id" element={<DeploymentDetail />} />
          <Route path="/logs" element={<LogsPage />} />
        </Route>

        {/* Catch all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
