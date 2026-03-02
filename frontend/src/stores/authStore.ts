import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { setAuthStore } from "../api/axiosInstance";

interface User {
  firstname: string;
  lastname: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  setAuthenticated: (value: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getUser: () => User | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setToken: (token) => {
        set({ token });
        setAuthStore(get());
      },
      setUser: (user) => set({ user }),
      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        set({
          token: data.data.token,
          user: data.data.user,
          isAuthenticated: true,
        });
        setAuthStore(get());
      },
      logout: () => {
        set({ isAuthenticated: false, token: null, user: null });
        setAuthStore(null);
      },
      getUser: () => get().user,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (rehydratedState, error) => {
        // After hydration from localStorage, update the global auth store reference
        if (!error && rehydratedState?.token) {
          setAuthStore(rehydratedState);
        }
      },
    },
  ),
);

// Subscribe to any future state changes to keep global auth store in sync
useAuthStore.subscribe((state) => {
  setAuthStore(state);
});
