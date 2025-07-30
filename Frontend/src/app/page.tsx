"use client";

import ConnectionStatus from "@/components/ConnectionStatus";
import CommandPalette from "@/components/ui/CommandPalette";
import { StatsSkeleton } from "@/components/ui/LoadingSkeleton";
import StatCard from "@/components/ui/StatCard";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { whatsappApi, WhatsAppSession } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

// Modern card component inspired by reactbits.dev


// Action card component


// Activity indicator component


export default function Dashboard() {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const { toasts, removeToast, success, error: showError } = useToast();

  const loadSessions = useCallback(async () => {
  try {
    if (!loading) setLoading(true);
    setError("");

    const response = await whatsappApi.getAllSessions();

    if (response.success && response.data) {
      setSessions(response.data);
      if (!loading) {
        success("Sessions refreshed", "Data updated successfully");
      }
    } else {
      const errorMsg = response.error || "Failed to load sessions";
      setError(errorMsg);
      showError("Failed to load sessions", errorMsg);
    }
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to load sessions";
    setError(errorMsg);
    showError("Connection error", errorMsg);
  } finally {
    setLoading(false);
  }
}, [loading, success, showError]);

  useEffect(() => {
    loadSessions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getSessionStats = () => {
    const total = sessions.length;
    const ready = sessions.filter((s) => s.status === "ready").length;
    const connecting = sessions.filter(
      (s) => s.status === "qr" || s.status === "initializing"
    ).length;
    const disconnected = sessions.filter(
      (s) => s.status === "disconnected"
    ).length;

    return { total, ready, connecting, disconnected };
  };

  const stats = getSessionStats();

  return (
    <div className="min-h-screen bg-github-canvas">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>

      <div className="relative px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1f6feb] to-[#58a6ff] bg-clip-text text-transparent">
                WhatsApp Dashboard
              </h1>
              <p className="mt-2 text-github-fg-muted">
                Manage your WhatsApp sessions and send messages
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="px-4 py-2 bg-github-canvas-subtle border border-github-border-default rounded-lg text-github-fg-muted hover:text-github-fg-default hover:bg-github-canvas-inset transition-all duration-200 flex items-center gap-2"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Quick Actions</span>
                <kbd className="px-2 py-1 bg-github-canvas-default border border-github-border-muted rounded text-xs">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={loadSessions}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-[#1f6feb] to-[#58a6ff] text-white rounded-lg hover:from-[#1a5feb] hover:to-[#4fa6ff] disabled:opacity-50 transition-all duration-200 hover:shadow-lg hover:shadow-[#1f6feb]/25"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Refreshing...
                  </div>
                ) : (
                  "Refresh"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Sessions"
                value={stats.total}
                icon="📱"
                color="blue"
                change={stats.total > 0 ? 5 : undefined}
                changeLabel="Active connections"
              />
              <StatCard
                title="Ready Sessions"
                value={stats.ready}
                icon="✅"
                color="green"
                change={stats.ready > 0 ? 12 : undefined}
                changeLabel="Ready to send"
              />
              <StatCard
                title="Connecting"
                value={stats.connecting}
                icon="⏳"
                color="yellow"
                change={stats.connecting > 0 ? -3 : undefined}
                changeLabel="Awaiting QR scan"
              />
              <StatCard
                title="Disconnected"
                value={stats.disconnected}
                icon="❌"
                color="red"
                change={stats.disconnected > 0 ? -8 : undefined}
                changeLabel="Need reconnection"
              />
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-[#da3633]/10 border border-[#da3633]/20 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-[#da3633] flex items-center gap-2">
              <span className="text-lg">❌</span>
              {error}
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-github-fg-default mb-6 flex items-center gap-2">
              <span>🚀</span>
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Setup Session Card */}
              <Link href="/setup" className="group block">
                <div className="relative bg-github-canvas-subtle border border-github-border-default rounded-lg p-6 hover:shadow-lg hover:shadow-[#1f6feb]/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1f6feb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#1f6feb] to-[#58a6ff] rounded-lg flex items-center justify-center text-white text-xl mb-4">
                      ➕
                    </div>
                    <h3 className="text-lg font-semibold text-github-fg-default mb-2">
                      Create Session
                    </h3>
                    <p className="text-github-fg-muted text-sm mb-4">
                      Set up a new WhatsApp connection and scan QR code
                    </p>
                    <div className="flex items-center text-[#1f6feb] text-sm font-medium">
                      Get Started
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Send Messages Card */}
              <Link href="/send" className="group block">
                <div className="relative bg-github-canvas-subtle border border-github-border-default rounded-lg p-6 hover:shadow-lg hover:shadow-[#238636]/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#238636]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#238636] to-[#2ea043] rounded-lg flex items-center justify-center text-white text-xl mb-4">
                      💬
                    </div>
                    <h3 className="text-lg font-semibold text-github-fg-default mb-2">
                      Send Messages
                    </h3>
                    <p className="text-github-fg-muted text-sm mb-4">
                      Send text messages and media files to any contact
                    </p>
                    <div className="flex items-center text-[#238636] text-sm font-medium">
                      Start Messaging
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Session Status Card */}
              <Link href="/status" className="group block">
                <div className="relative bg-github-canvas-subtle border border-github-border-default rounded-lg p-6 hover:shadow-lg hover:shadow-[#8b5cf6]/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] rounded-lg flex items-center justify-center text-white text-xl mb-4">
                      📊
                    </div>
                    <h3 className="text-lg font-semibold text-github-fg-default mb-2">
                      Session Status
                    </h3>
                    <p className="text-github-fg-muted text-sm mb-4">
                      Monitor and manage all your active sessions
                    </p>
                    <div className="flex items-center text-[#8b5cf6] text-sm font-medium">
                      View Status
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* API Documentation Card */}
              <a
                href="http://localhost:3001/api-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative bg-github-canvas-subtle border border-github-border-default rounded-lg p-6 hover:shadow-lg hover:shadow-[#f85149]/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f85149]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#f85149] to-[#ff8170] rounded-lg flex items-center justify-center text-white text-xl mb-4">
                      📚
                    </div>
                    <h3 className="text-lg font-semibold text-github-fg-default mb-2">
                      API Documentation
                    </h3>
                    <p className="text-github-fg-muted text-sm mb-4">
                      Explore the API endpoints and integrate with your apps
                    </p>
                    <div className="flex items-center text-[#f85149] text-sm font-medium">
                      View Docs
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-github-fg-default mb-6 flex items-center gap-2">
              <span>⚙️</span>
              Overview
            </h2>

            <div className="bg-github-canvas-subtle border border-github-border-default rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-github-fg-muted">Connection:</span>
                  {sessions.map(session => (
                    <ConnectionStatus key={session.id} session={session} />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-github-fg-muted">Total Sessions:</span>
                  <span className="text-github-fg-default font-medium">
                    {stats.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-github-fg-muted">Ready Sessions:</span>
                  <span className="text-github-fg-default font-medium">
                    {stats.ready}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-github-fg-muted">Disconnected:</span>
                  <span className="text-github-fg-default font-medium">
                    {stats.disconnected}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-github-fg-muted">Last Refresh:</span>
                  <span className="text-github-fg-default font-medium">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="pt-4 border-t border-github-border-muted">
                  <p className="text-sm text-github-fg-muted">
                    Manage your WhatsApp sessions efficiently from this dashboard.
                    Use the quick actions to set up new sessions or send messages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        sessions={sessions.map(s => ({
        id: s.id,
        status: s.status
      }))}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

