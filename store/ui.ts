// store/ui.ts
import { create } from "zustand";

interface UiState {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
}));
