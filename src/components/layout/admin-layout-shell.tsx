"use client";

import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { PageTransition } from "./page-transition";

/**
 * Client-side wrapper for admin layout.
 * Menambahkan animasi transisi halaman yang smooth 60fps
 * tanpa mengubah server component layout.tsx
 */
export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#e4ecf8] dark:bg-[#07111F]">
      {/* Floating glass sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
