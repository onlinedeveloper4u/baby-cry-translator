import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useBabiesStore } from '../../src/store/babies';
import { useAuthStore } from '../../src/store/auth';
import { getAvatarSignedUrl, getBaby } from '../../src/api/babies';

export default function BabyProfileScreen() {
  const params = useLocalSearchParams();
  const id = (params?.id as string) ?? null;
  const profiles = useBabiesStore((s) => s.profiles);
  const [profile, setProfile] = React.useState(() => profiles.find((p) => p.id === id) ?? null);
  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      // If store already has profile, ensure avatar URL is usable
      const fromStore = profiles.find((p) => p.id === id);
      if (fromStore) {
        setProfile(fromStore);
        // If avatarUrl looks like a storage path (no http), try to sign it
        if (fromStore.avatarUrl && !/^https?:\/\//i.test(fromStore.avatarUrl) && user?.id) {
          try {
            const signed = await getAvatarSignedUrl(fromStore.avatarUrl);
            if (signed && mounted) setProfile({ ...fromStore, avatarUrl: signed });
          } catch {
            // ignore
          }
        }
        return;
      }

      // Otherwise attempt to fetch a single baby row from server
      if (user?.id) {
        try {
          const row = await getBaby(id);
          if (!row) return;
          let avatarUrl = row.avatar_url ?? undefined;
          if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) {
            try {
              const signed = await getAvatarSignedUrl(avatarUrl);
              if (signed) avatarUrl = signed;
            } catch {
              // ignore
            }
          }
          if (mounted) setProfile({ id: row.id, name: row.name, birthDate: row.birth_date ?? undefined, gender: (row.gender as any) ?? 'unspecified', notes: row.notes ?? undefined, avatarUrl });
        } catch (err) {
          console.warn('[BabyProfile] fetch failed', err);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, profiles, user]);

  function goBack() {
    router.back();
  }

  function goEdit() {
    if (!id) return;
    router.push(`/babies/edit?id=${id}`);
  }

  if (!id) {
    return (
      <SafeAreaView className="flex-1 bg-rose-50 items-center justify-center">
        <Text className="text-neutral-600">No profile selected</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-rose-50 items-center justify-center">
        <Text className="text-neutral-600">Loading profile…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-rose-50">
      <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-neutral-900">{profile.name}</Text>
        <TouchableOpacity onPress={goEdit}>
          <Ionicons name="create-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="px-6">
        <View className="items-center mt-4">
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} className="w-28 h-28 rounded-full" resizeMode="cover" />
          ) : (
            <View className="w-28 h-28 rounded-full bg-rose-100 overflow-hidden items-center justify-center">
              <Ionicons name="person-outline" size={28} color="#fff" />
            </View>
          )}
          <Text className="text-2xl font-bold text-neutral-900 mt-3">{profile.name}</Text>
        </View>

        <View className="mt-6">
          <View className="flex-row items-center gap-3 bg-rose-100 rounded-2xl px-4 py-3 mb-4">
            <Ionicons name="calendar-outline" size={20} color="#9A3412" />
            <View>
              <Text className="text-sm text-neutral-500">Date of birth</Text>
              <Text className="text-base font-medium text-neutral-900">{profile.birthDate ?? '—'}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 bg-rose-100 rounded-2xl px-4 py-3 mb-4">
            <Ionicons name={profile.gender === 'male' ? 'male' : profile.gender === 'female' ? 'female' : 'help-circle-outline'} size={20} color="#9A3412" />
            <View>
              <Text className="text-sm text-neutral-500">Sex</Text>
              <Text className="text-base font-medium text-neutral-900">{profile.gender ?? 'unspecified'}</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
