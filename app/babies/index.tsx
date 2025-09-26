import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../src/store/auth';
import { listBabies, getAvatarSignedUrl } from '../../src/api/babies';
import { BabyProfile, useBabiesStore } from '../../src/store/babies';

export default function BabiesScreen() {
  const { user } = useAuthStore();
  const { profiles, activeBabyId, remove, setActive, load, setProfiles } = useBabiesStore();

  React.useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      async function sync() {
        if (!user?.id) return;
        try {
          const rows = await listBabies(user.id);
          const mapped: BabyProfile[] = await Promise.all(
            rows.map(async (r) => {
              let signedUrl: string | undefined = undefined;
              if (r.avatar_url) {
                const url = await getAvatarSignedUrl(r.avatar_url, 3600);
                if (url) signedUrl = url;
              }
              return {
                id: r.id,
                name: r.name,
                birthDate: r.birth_date ?? undefined,
                notes: r.notes ?? undefined,
                gender: (r.gender as any) ?? 'unspecified',
                avatarUrl: signedUrl,
              } as BabyProfile;
            })
          );
          if (isActive) await setProfiles(mapped, mapped[0]?.id ?? null);
        } catch {
          // ignore fetch errors; remain on local cache
        }
      }
      sync();
      return () => {
        isActive = false;
      };
    }, [user?.id, setProfiles])
  );

  function handleBack() {
    router.back();
  }

  // Inline add removed; adding is done via /babies/edit screen

  function confirmDelete(profile: BabyProfile) {
    Alert.alert('Delete Profile', `Remove ${profile.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(profile.id) },
    ]);
  }

  const renderItem = ({ item }: { item: BabyProfile }) => {
    const isActive = item.id === activeBabyId;
    return (
      <View className={`rounded-2xl p-4 mb-3 border ${isActive ? 'border-rose-400 bg-rose-50/60' : 'border-rose-100 bg-rose-50/40'}`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity className="flex-1" onPress={() => setActive(item.id)}>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-rose-100 overflow-hidden items-center justify-center">
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} className="w-10 h-10" resizeMode="cover" />
                ) : (
                  <Ionicons name="happy-outline" size={20} color="#9CA3AF" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-neutral-900">{item.name}</Text>
                {!!item.birthDate && <Text className="text-sm text-amber-800 mt-0.5">DOB: {item.birthDate}</Text>}
                {!!item.notes && <Text className="text-sm text-amber-800 mt-0.5" numberOfLines={1}>{item.notes}</Text>}
              </View>
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.push({ pathname: '/babies/edit', params: { id: item.id } })}>
              <Ionicons name="create-outline" size={22} color="#0b0b0b" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item)}>
              <Ionicons name="trash-outline" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-rose-50">
      <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-neutral-900">Baby Profiles</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/babies/edit' })}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6">
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="happy-outline" size={48} color="#9CA3AF" />
              <Text className="text-neutral-500 mt-3">No baby profiles yet. Add one to get started.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}


