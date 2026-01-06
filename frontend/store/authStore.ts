import { create } from "zustand";
import { UserRole } from "@/types/index";

interface AuthState {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  token?: string;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  selectedRole: null,
  setSelectedRole: (role: UserRole) => set({ selectedRole: role }),
  token: undefined,
  setToken: (token: string) => set({ token }),
}));
