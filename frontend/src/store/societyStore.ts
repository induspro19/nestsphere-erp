import { create } from 'zustand';

interface ActiveSociety {
  id: string;
  name: string;
  code: string;
}

interface SocietyState {
  activeSociety: ActiveSociety | null;
  setActiveSociety: (society: ActiveSociety) => void;
}

export const useSocietyStore = create<SocietyState>((set) => ({
  activeSociety: null,
  setActiveSociety: (society) => set({ activeSociety: society }),
}));
