import { create, StateCreator } from "zustand";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

type UserPersist = (
  config: StateCreator<UserState>,
  options: PersistOptions<UserState, Partial<UserState>>
) => StateCreator<UserState>;

export const useUserStore = create<UserState>()(
  (persist as UserPersist)(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
