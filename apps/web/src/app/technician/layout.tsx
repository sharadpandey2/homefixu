"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";

// Navigation items for technician
const NAVIGATION = [
  {
    name: "Dashboard",
    href: "/technician/dashboard",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "Service Requests",
    href: "/technician/requests",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    badge: "5",
  },
  {
    name: "My Schedule",
    href: "/technician/schedule",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: "Completed Jobs",
    href: "/technician/completed",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    name: "Home Health Report",
    href: "/technician/reports",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    highlight: true,
  },
  {
    name: "eKYC Verification",
    href: "/technician/ekyc",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    highlight: true,
  },
];

const BOTTOM_NAVIGATION = [
  {
    name: "Settings",
    href: "/technician/settings",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

interface TechnicianLayoutProps {
  children: ReactNode;
}

export default function TechnicianLayout({ children }: TechnicianLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Don't show sidebar on auth pages
  const isAuthPage =
    pathname === "/technician/login" ||
    pathname === "/technician/register" ||
    pathname === "/technician/forgot-password" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  if (isAuthPage) {
    return <>{children}</>;
  }

  const user = session?.user;
  const technician = {
    name: user?.name || "Technician",
    role:
      (user as any)?.role === "technician" ? "Verified Partner" : "Loading...",
    avatar: user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "T",
    isOnline: true,
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await authClient.signOut();
      router.push("/login");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="relative flex flex-col border-white/[0.06] border-r bg-gradient-to-b from-zinc-900 to-zinc-950"
      >
        {/* Logo */}
        <div className="border-white/[0.06] border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 font-bold text-lg text-white">
              🔧
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-white">Homefixu</h1>
                <p className="text-white/40 text-xs">Technician Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href as never}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActive
                      ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                      : item.highlight
                        ? "border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.icon}
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium text-sm">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 font-bold text-white text-xs">
                          {item.badge}
                        </span>
                      )}
                      {item.highlight && !item.badge && (
                        <span className="ml-auto">
                          <svg
                            className="h-4 w-4 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && item.badge && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                  )}
                  {isSidebarCollapsed && item.highlight && !item.badge && (
                    <span className="absolute top-2 right-2 h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="space-y-1 border-white/[0.06] border-t p-4">
          {BOTTOM_NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href as never}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActive
                      ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.icon}
                  {!isSidebarCollapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="border-white/[0.06] border-t p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-sm text-white">
                {technician.avatar}
              </div>
              {technician.isOnline && (
                <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-900 bg-green-500" />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm text-white">
                  {technician.name}
                </p>
                <p className="truncate text-white/40 text-xs">
                  {technician.role}
                </p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-red-500/10 px-4 py-2 font-medium text-red-400 text-sm transition-all hover:bg-red-500/20"
            >
              Logout
            </button>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-20 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.06] bg-zinc-800 transition-colors hover:bg-zinc-700"
        >
          <svg
            className={`h-3 w-3 text-white transition-transform ${
              isSidebarCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
