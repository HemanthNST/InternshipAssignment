"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const router = useRouter();
  const setSelectedRole = useAuthStore(state => state.setSelectedRole);

  const handleRoleSelect = (
    role: "user" | "driver" | "manager" | "superAdmin"
  ) => {
    setSelectedRole(role);
    router.push(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="w-full bg-white rounded-3xl shadow-lg p-6 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login As</h2>
          <p className="text-gray-600">Select your role to continue</p>
        </div>

        <div className="space-y-4">
          {/* User Button */}
          <button
            onClick={() => handleRoleSelect("user")}
            className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3">
            <span className="text-2xl">👤</span>
            <span>User</span>
          </button>

          {/* Manager Button */}
          <button
            onClick={() => handleRoleSelect("manager")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3">
            <span className="text-2xl">🛡️</span>
            <span>Manager</span>
          </button>

          {/* Driver Button */}
          <button
            onClick={() => handleRoleSelect("driver")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3">
            <span className="text-2xl">🚗</span>
            <span>Driver</span>
          </button>

          {/* Super Admin Button */}
          <button
            onClick={() => handleRoleSelect("superAdmin")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3">
            <span className="text-2xl">👑</span>
            <span>Super Admin</span>
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Smart Parking • Premium Solution
        </p>
      </div>
    </div>
  );
}
