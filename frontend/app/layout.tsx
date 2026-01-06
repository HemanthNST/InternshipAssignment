"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Car,
  Shield,
  Crown,
  House,
  Ticket,
  Clock,
  Gear,
} from "phosphor-react";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current role based on pathname
  const getCurrentRole = (): "user" | "driver" | "manager" | "superAdmin" => {
    if (pathname.startsWith("/driver")) return "driver";
    if (pathname.startsWith("/manager")) return "manager";
    if (pathname.startsWith("/superAdmin")) return "superAdmin";
    return "user";
  };

  const currentRole = getCurrentRole();

  const handleRoleChange = (
    role: "user" | "driver" | "manager" | "superAdmin"
  ) => {
    router.push(`/${role}`);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <title>Smart Parking</title>
      </head>
      <body className="bg-gray-100 flex items-start justify-center gap-8 pt-4 min-h-screen pb-4">
        {/* Main Content */}
        <div className="w-full max-w-md h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Sidebar Role Switcher */}
        <div className="hidden lg:flex flex-col gap-3 pt-4">
          {/* User Role */}
          <button
            onClick={() => handleRoleChange("user")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 ${
              currentRole === "user"
                ? "bg-blue-500 text-white shadow-lg scale-110"
                : "bg-white text-blue-500 hover:bg-blue-50 shadow"
            }`}
            title="User">
            <User size={28} weight="fill" />
            <span className="text-xs font-semibold whitespace-nowrap">
              User
            </span>
          </button>

          {/* Driver Role */}
          <button
            onClick={() => handleRoleChange("driver")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 ${
              currentRole === "driver"
                ? "bg-orange-500 text-white shadow-lg scale-110"
                : "bg-white text-orange-500 hover:bg-orange-50 shadow"
            }`}
            title="Driver">
            <Car size={28} weight="fill" />
            <span className="text-xs font-semibold whitespace-nowrap">
              Driver
            </span>
          </button>

          {/* Manager Role */}
          <button
            onClick={() => handleRoleChange("manager")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 ${
              currentRole === "manager"
                ? "bg-emerald-500 text-white shadow-lg scale-110"
                : "bg-white text-emerald-500 hover:bg-emerald-50 shadow"
            }`}
            title="Manager">
            <Shield size={28} weight="fill" />
            <span className="text-xs font-semibold whitespace-nowrap">
              Manager
            </span>
          </button>

          {/* Super Admin Role */}
          <button
            onClick={() => handleRoleChange("superAdmin")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 ${
              currentRole === "superAdmin"
                ? "bg-purple-600 text-white shadow-lg scale-110"
                : "bg-white text-purple-600 hover:bg-purple-50 shadow"
            }`}
            title="Super Admin">
            <Crown size={28} weight="fill" />
            <span className="text-xs font-semibold whitespace-nowrap">
              Admin
            </span>
          </button>
        </div>
      </body>
    </html>
  );
}
