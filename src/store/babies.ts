import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listBabies, insertBaby, updateBaby as apiUpdateBaby, deleteBaby as apiDeleteBaby, BabyRow } from '../api/babies';
import { useAuthStore } from './auth';

export interface BabyProfile {
  id: string;
  name: string;
  birthDate?: string; // ISO date
  gender?: 'male' | 'female' | 'unspecified';
  notes?: string;
  avatarUrl?: string;
}

interface BabiesState {
  profiles: BabyProfile[];
  activeBabyId: string | null;
  setActiveLocalOnly: (id: string | null) => void;
  setProfiles: (profiles: BabyProfile[], activeId?: string | null) => Promise<void>;
  load: () => Promise<void>;
  add: (profile: Omit<BabyProfile, 'id'>) => Promise<void>;
  update: (id: string, profile: Partial<Omit<BabyProfile, 'id'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setActive: (id: string | null) => Promise<void>;
}

export const useBabiesStore = create<BabiesState>((set, get) => ({
  profiles: [],
  activeBabyId: null,
  setActiveLocalOnly: (id) => {
    // Do not allow clearing active when there are profiles present.
    const profiles = get().profiles;
    const nextId = id === null && profiles.length > 0 ? get().activeBabyId ?? profiles[0]?.id ?? null : id;
    set({ activeBabyId: nextId });
    // persist active id for app-level behavior
    (async () => {
      try {
        if (nextId) await AsyncStorage.setItem('activeBabyId', nextId);
        else await AsyncStorage.removeItem('activeBabyId');
      } catch (e) {
        // ignore
      }
    })();
  },

  setProfiles: async (profiles, activeId) => {
    // Determine the active id to set while enforcing the invariant that
    // if there are profiles, one of them should be active.
    const currentActive = get().activeBabyId;
    let activeToUse: string | null | undefined = typeof activeId !== 'undefined' ? activeId : currentActive;

    if ((activeToUse === null || typeof activeToUse === 'undefined') && profiles.length > 0) {
      // Prefer preserving an existing active if it exists in the new list,
      // otherwise fall back to the first profile.
      activeToUse = currentActive && profiles.find((p) => p.id === currentActive) ? currentActive : profiles[0].id;
    }

    set({ profiles, activeBabyId: activeToUse ?? null });

    // Persist active id if provided (app-level setting)
    if (typeof activeId !== 'undefined') {
      (async () => {
        try {
          if (activeToUse) await AsyncStorage.setItem('activeBabyId', activeToUse);
          else await AsyncStorage.removeItem('activeBabyId');
        } catch {}
      })();
    }
  },

  load: async () => {
    // Load profiles from Supabase when authenticated; otherwise keep in-memory (no AsyncStorage)
    try {
      const user = useAuthStore.getState().user;
      if (!user?.id) {
        // guest or unauthenticated: keep current in-memory profiles (no persistence)
        return;
      }
      const rows: BabyRow[] = await listBabies(user.id);
      // Resolve avatar storage paths to signed URLs where possible
      const profiles = await Promise.all(rows.map(async (r) => {
        let signed: string | null = null;
        try {
          // lazy import to avoid cycles
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { getAvatarSignedUrl } = require('../api/babies');
          if (r.avatar_url) signed = await getAvatarSignedUrl(r.avatar_url);
        } catch {
          signed = null;
        }
        return ({
          id: r.id,
          name: r.name,
          birthDate: r.birth_date ?? undefined,
          gender: (r.gender as any) ?? 'unspecified',
          notes: r.notes ?? undefined,
          avatarUrl: signed ?? r.avatar_url ?? undefined,
        });
      }));
      // Preserve existing active selection only if it still exists in the loaded profiles.
      // If there is no active selection, but profiles exist, pick the first profile
      // so that one baby is always selected when any profiles exist.
      const currentActive = get().activeBabyId;
      const activeToSet = currentActive && profiles.find((p) => p.id === currentActive)
        ? currentActive
        : profiles.length > 0
        ? profiles[0].id
        : null;
      set({ profiles, activeBabyId: activeToSet });
    } catch (err) {
      // If fetching fails, leave in-memory state as-is.
      console.warn('[babiesStore] load failed', err);
    }
  },

  add: async (profile) => {
    // If authenticated, insert via Supabase and use returned id
    const user = useAuthStore.getState().user;
    if (user?.id) {
      try {
        const row = await insertBaby({ userId: user.id, name: profile.name, birthDate: profile.birthDate ?? null, gender: profile.gender ?? 'unspecified', notes: profile.notes ?? null, avatarUrl: profile.avatarUrl ?? null });
        const nextProfiles = [...get().profiles, { id: row.id, name: row.name, birthDate: row.birth_date ?? undefined, gender: (row.gender as any) ?? 'unspecified', notes: row.notes ?? undefined, avatarUrl: row.avatar_url ?? undefined }];
        // Do not automatically make a newly added baby active. Keep current active selection.
        set({ profiles: nextProfiles, activeBabyId: get().activeBabyId });
        return;
      } catch (err) {
        console.warn('[babiesStore] insert failed', err);
        throw err;
      }
    }
    // Guest / unauthenticated: keep in-memory only (no AsyncStorage persistence)
  const id = `${Date.now()}`;
  const nextProfiles = [...get().profiles, { ...profile, id }];
  // For guests, also don't auto-select the newly created profile.
  set({ profiles: nextProfiles, activeBabyId: get().activeBabyId });
  },

  update: async (id, profile) => {
    const user = useAuthStore.getState().user;
    if (user?.id) {
      try {
        const patch = {
          name: profile.name,
          birthDate: profile.birthDate ?? null,
          gender: profile.gender ?? undefined,
          notes: profile.notes ?? null,
          avatarUrl: profile.avatarUrl ?? undefined,
        };
        const updated = await apiUpdateBaby(id, patch as any);
        const nextProfiles = get().profiles.map((p) => (p.id === id ? { id: updated.id, name: updated.name, birthDate: updated.birth_date ?? undefined, gender: (updated.gender as any) ?? 'unspecified', notes: updated.notes ?? undefined, avatarUrl: updated.avatar_url ?? undefined } : p));
        set({ profiles: nextProfiles, activeBabyId: get().activeBabyId });
        return;
      } catch (err) {
        console.warn('[babiesStore] update failed', err);
        throw err;
      }
    }
    // guest: update in-memory only
    const nextProfiles = get().profiles.map((p) => (p.id === id ? { ...p, ...profile } : p));
    set({ profiles: nextProfiles, activeBabyId: get().activeBabyId });
  },

  remove: async (id) => {
    const user = useAuthStore.getState().user;
    if (user?.id) {
      try {
        const res = await apiDeleteBaby(id);
        if (res.dbDeleted) {
          const nextProfiles = get().profiles.filter((p) => p.id !== id);
          // If the deleted baby was active, pick a fallback (first remaining) so
          // that one baby is still selected when profiles remain. If no profiles
          // remain, active can be null.
          const nextActive = get().activeBabyId === id ? (nextProfiles[0]?.id ?? null) : get().activeBabyId;
          set({ profiles: nextProfiles, activeBabyId: nextActive });
        } else {
          console.warn('[babiesStore] remote delete failed', res.dbError ?? res);
          throw res.dbError ?? new Error('Failed to delete baby on server');
        }
        return;
      } catch (err) {
        console.warn('[babiesStore] delete failed', err);
        throw err;
      }
    }
    // guest: remove from memory only. Use setProfiles to enforce the invariant
    // that one profile remains active when profiles exist and to persist the
    // active id consistently.
    const nextProfiles = get().profiles.filter((p) => p.id !== id);
    const nextActive = get().activeBabyId === id ? (nextProfiles[0]?.id ?? null) : get().activeBabyId;
    // use setProfiles to ensure persistence behavior matches authenticated flow
    await get().setProfiles(nextProfiles, nextActive);
  },

  setActive: async (id) => {
    // Do not allow unselecting when there are profiles. If id is null and
    // there are profiles, ignore the request. Otherwise set and persist.
    const profiles = get().profiles;
    if (id === null && profiles.length > 0) return;
    const next = { profiles, activeBabyId: id };
    set(next);
    (async () => {
      try {
        if (id) await AsyncStorage.setItem('activeBabyId', id);
        else await AsyncStorage.removeItem('activeBabyId');
      } catch {}
    })();
  },
}));

// Hydrate persisted active baby id (app-level setting)
(async () => {
  try {
    const id = await AsyncStorage.getItem('activeBabyId');
    if (id) {
      useBabiesStore.setState({ activeBabyId: id });
    }
  } catch (e) {
    // ignore
  }
})();


