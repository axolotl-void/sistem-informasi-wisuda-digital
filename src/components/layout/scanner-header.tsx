"use client";

import { GraduationCap, LogOut, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useScannerStore } from "@/store/scanner.store";

export function ScannerHeader() {
  const { user, logout } = useAuth();
  const { isConnected, totalScanned } = useScannerStore();

  return (
    <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-5 w-5 text-blue-400" />
        <span className="font-semibold text-white text-sm">Scanner Wisuda</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 text-xs">
          {isConnected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Terhubung</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-400">Offline</span>
            </>
          )}
        </div>

        {/* Scan count */}
        <div className="text-xs text-gray-400">
          <span className="text-white font-medium">{totalScanned}</span> scan
        </div>

        {/* User & logout */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">
            {user?.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-gray-400 hover:text-white h-8 w-8"
            aria-label="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
