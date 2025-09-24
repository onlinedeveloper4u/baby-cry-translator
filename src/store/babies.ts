import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface BabyProfile {
  id: string;
  name: string;
  birthDate?: string; // ISO date
  gender?: 'male' | 'female' | 'unspecified';
  notes?: string;
}

interface BabiesState {
  profiles: BabyProfile[];
  activeBabyId: string | null;
  setActiveLocalOnly: (id: string | null) => void;
  load: () => Promise<void>;
  add: (profile: Omit<BabyProfile, 'id'>) => Promise<void>;
  update: (id: string, profile: Partial<Omit<BabyProfile, 'id'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setActive: (id: string | null) => Promise<void>;
}

const STORAGE_KEY = 'babies_store_v1';

async function saveToStorage(state: Pick<BabiesState, 'profiles' | 'activeBabyId'>) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useBabiesStore = create<BabiesState>((set, get) => ({
  profiles: [],
  activeBabyId: null,
  setActiveLocalOnly: (id) => set({ activeBabyId: id }),

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { profiles: BabyProfile[]; activeBabyId: string | null };
        set({ profiles: parsed.profiles ?? [], activeBabyId: parsed.activeBabyId ?? null });
      }
    } catch {
      // ignore
    }
  },

  add: async (profile) => {
    const id = `${Date.now()}`;
    const nextProfiles = [...get().profiles, { ...profile, id }];
    const next = { profiles: nextProfiles, activeBabyId: get().activeBabyId ?? id };
    set(next);
    await saveToStorage(next);
  },

  update: async (id, profile) => {
    const nextProfiles = get().profiles.map((p) => (p.id === id ? { ...p, ...profile } : p));
    const next = { profiles: nextProfiles, activeBabyId: get().activeBabyId };
    set(next);
    await saveToStorage(next);
  },

  remove: async (id) => {
    const nextProfiles = get().profiles.filter((p) => p.id !== id);
    const nextActive = get().activeBabyId === id ? (nextProfiles[0]?.id ?? null) : get().activeBabyId;
    const next = { profiles: nextProfiles, activeBabyId: nextActive };
    set(next);
    await saveToStorage(next);
  },

  setActive: async (id) => {
    const next = { profiles: get().profiles, activeBabyId: id };
    set(next);
    await saveToStorage(next);
  },
}));


