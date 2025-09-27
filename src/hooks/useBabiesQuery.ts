import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listBabies, BabyRow, getAvatarSignedUrl } from '../api/babies';
import { useAuthStore } from '../store/auth';
import { useBabiesStore } from '../store/babies';

export default function useBabiesQuery() {
  const user = useAuthStore((s) => s.user);
  const setProfiles = useBabiesStore((s) => s.setProfiles);

  const query = useQuery<BabyRow[], Error>({
    queryKey: ['babies', user?.id],
    queryFn: async (): Promise<BabyRow[]> => {
      if (!user?.id) return [];
      return await listBabies(user.id);
    },
    enabled: !!user?.id,
  });

  React.useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      (async () => {
        const profiles = await Promise.all(
          query.data.map(async (r: BabyRow) => {
            let signed: string | null = null;
            try {
              if (r.avatar_url) signed = await getAvatarSignedUrl(r.avatar_url);
            } catch (e) {
              // ignore signing errors; fall back to raw value
            }
            return {
              id: r.id,
              name: r.name,
              birthDate: r.birth_date ?? undefined,
              gender: (r.gender as any) ?? 'unspecified',
              notes: r.notes ?? undefined,
              avatarUrl: signed ?? r.avatar_url ?? undefined,
            };
          })
        );
        // Preserve existing active selection if present. If none, and profiles
        // exist, pick the first profile so there is always an active when any
        // profiles are available.
        const currentActive = useBabiesStore.getState().activeBabyId;
        const activeToSet = currentActive && profiles.find((p) => p.id === currentActive)
          ? currentActive
          : profiles.length > 0
          ? profiles[0].id
          : null;
        setProfiles(profiles, activeToSet);
      })();
    }
  }, [query.data, setProfiles]);

  return query;
}
