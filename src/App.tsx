import React, { Component } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { DashboardView } from "./views/DashboardView";
import { CrmView } from "./views/CrmView";
import { ProjectsView } from "./views/ProjectsView";
import { TasksView } from "./views/TasksView";
import { HrmView } from "./views/HrmView";
import { TeamWorkloadView } from "./views/TeamWorkloadView";
import { DocumentsView } from "./views/DocumentsView";
import { NotesView } from "./views/NotesView";
import { ReportsView } from "./views/ReportsView";
import { AiIntelligenceView } from "./views/AiIntelligenceView";
import { SettingsView } from "./views/SettingsView";
import { AuthView } from "./views/AuthView";
import { GlobalCreateModal } from "./components/modals/GlobalCreateModal";
import { CommandPalette } from "./components/modals/CommandPalette";
import { AiAssistantDrawer } from "./components/ai/AiAssistantDrawer";
import { AiOperationsAuditModal } from "./components/ai/AiOperationsAuditModal";
import { ForceChangePasswordModal } from "./components/modals/ForceChangePasswordModal";
import { JockerControlCenter } from "./views/JockerControlCenter";
import { useEffect, useState } from "react";

const AppContent: React.FC = () => {
  const { currentView, isAuthenticated, currentUser, settings } = useApp();
  const [jockerMode, setJockerMode] = useState<"control-center" | "classic">("control-center");

  const isDark = settings?.theme === "dark";
  const isJocker = currentUser?.id === "jocker" || currentUser?.email === "jocker";

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  // Dedicated Bespoke Master Control Center for Jocker
  if (isJocker && jockerMode === "control-center") {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-slate-950 text-slate-100 font-sans">
        <JockerControlCenter onToggleClassic={() => setJockerMode("classic")} />
        <GlobalCreateModal />
        <CommandPalette />
        <AiAssistantDrawer />
        <AiOperationsAuditModal />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden antialiased font-sans transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Return to Master Control Center Banner for Jocker */}
      {isJocker && jockerMode === "classic" && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 shadow-md z-50">
          <div className="flex items-center gap-2">
            <span>👑</span>
            <span>Viewing Classic Workspace Layout as Supreme Commander</span>
          </div>
          <button
            type="button"
            onClick={() => setJockerMode("control-center")}
            className="px-3.5 py-1 rounded-lg bg-slate-950 text-amber-300 hover:text-white text-xs font-bold shadow transition-all cursor-pointer"
          >
            Return to Master Control Center →
          </button>
        </div>
      )}

      <div className="flex-1 flex min-w-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar />

        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
            isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {currentView === "dashboard" && <DashboardView />}
            {currentView === "crm" && <CrmView />}
            {currentView === "projects" && <ProjectsView />}
            {currentView === "tasks" && <TasksView />}
            {currentView === "hrm" && <HrmView />}
            {(currentView === "workload" || currentView === "team") && <TeamWorkloadView />}
            {currentView === "documents" && <DocumentsView />}
            {currentView === "notes" && <NotesView />}
            {currentView === "reports" && <ReportsView />}
            {currentView === "ai" && <AiIntelligenceView />}
            {currentView === "settings" && <SettingsView />}
          </div>
        </main>
      </div>
      </div>

      {/* Global Overlays & Modals */}
      <GlobalCreateModal />
      <CommandPalette />
      <AiAssistantDrawer />
      <AiOperationsAuditModal />
      {currentUser?.mustChangePassword && <ForceChangePasswordModal />}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Worqester UI Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-400 mb-4">
              An unexpected UI error occurred. Your data has been preserved in your session.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg text-left text-[11px] font-mono text-rose-300 mb-6 overflow-x-auto max-h-32">
              {this.state.error?.message || "Unknown rendering exception"}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Reload & Recover Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
