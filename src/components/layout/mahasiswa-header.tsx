"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/utils/constants";

const navItems = [
  { label: "Dashboard", href: ROUTES.MAHASISWA.DASHBOARD, icon: LayoutDashboard },
  { label: "Undangan Saya", href: ROUTES.MAHASISWA.UNDANGAN, icon: Mail },
];

export function MahasiswaHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center p-1">
              <img src="/img/logo-wusuda-2.png" alt="Logo Wisuda" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Wisuda Digital</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1" aria-label="Navigasi mahasiswa">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:block">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
