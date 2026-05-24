"use client";

export function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.07] dark:bg-white/[0.02] overflow-hidden shadow-sm dark:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.02]">
              {["QR", "Kode", "Mahasiswa", "Fakultas", "Sesi", "Kursi", "Tamu", "Status", "Kehadiran", ""].map((h) => (
                <th key={h} className="py-3 pl-4 text-left">
                  <div className="h-2.5 w-16 rounded-full bg-gray-200 dark:bg-white/[0.05] animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-white/[0.03]">
                <td className="py-3 pl-4 pr-3">
                  <div className="size-9 rounded-md bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
                <td className="py-3 pr-4">
                  <div className="h-2.5 w-24 rounded-full bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
                <td className="py-3 pr-4">
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-32 rounded-full bg-gray-200 dark:bg-white/[0.05] animate-pulse" />
                    <div className="h-2 w-20 rounded-full bg-gray-100 dark:bg-white/[0.03] animate-pulse" />
                  </div>
                </td>
                <td className="py-3 pr-4 hidden lg:table-cell">
                  <div className="h-2.5 w-28 rounded-full bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  <div className="h-2.5 w-20 rounded-full bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
                <td className="py-3 pr-4 hidden xl:table-cell">
                  <div className="h-2.5 w-12 rounded-full bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
                <td className="py-3 pr-4 hidden xl:table-cell">
                  <div className="h-2.5 w-10 rounded-full bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
                <td className="py-3 pr-4">
                  <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
                <td className="py-3 pr-4">
                  <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
