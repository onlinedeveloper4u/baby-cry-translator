import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { BabyProfile, useBabiesStore } from '../../src/store/babies';
import { useAuthStore } from '../../src/store/auth';
import useToastStore from '../../src/store/toast';
import useBabiesQuery from '../../src/hooks/useBabiesQuery';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listBabies, insertBaby, deleteBaby, BabyRow } from '../../src/api/babies';

export default function BabiesScreen() {
  const { profiles, activeBabyId, add, update, remove, setActive, load } = useBabiesStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Kick off React Query fetch which will sync into Zustand via the hook
  useBabiesQuery();

  const setProfiles = useBabiesStore((s) => s.setProfiles);
  const showToast = useToastStore((s) => s.show);

  const insertMutation = useMutation<BabyRow, any, Parameters<typeof insertBaby>[0]>({
    mutationFn: (input) => insertBaby(input),
    onMutate: async (input) => {
      // optimistic add to Zustand
      const prev = useBabiesStore.getState().profiles;
      const tempId = `temp-${Date.now()}`;
      const next = [...prev, { id: tempId, name: input.name, birthDate: input.birthDate ?? undefined, notes: input.notes ?? undefined, gender: (input.gender as any) ?? 'unspecified', avatarUrl: input.avatarUrl ?? undefined }];
      const prevActive = useBabiesStore.getState().activeBabyId;
      await setProfiles(next, prevActive);
      return { prevProfiles: prev, tempId, prevActive };
    },
    onError: (err, _variables, context: any) => {
      // rollback
      if (context?.prevProfiles) setProfiles(context.prevProfiles, context.prevActive ?? context.prevProfiles[0]?.id ?? null);
      console.warn('[babies] insert failed, rolled back', err);
      showToast('Failed to add baby', 'error');
    },
    onSuccess: async (data, _variables, context: any) => {
      // replace temp id with real id
      if (context?.tempId) {
        const current = useBabiesStore.getState().profiles;
        const updated = current.map((p) => (p.id === context.tempId ? { id: data.id, name: data.name, birthDate: data.birth_date ?? undefined, notes: data.notes ?? undefined, gender: (data.gender as any) ?? 'unspecified', avatarUrl: data.avatar_url ?? undefined } : p));
        // If there were no profiles before (this is the first), auto-select the new one.
        const wasEmptyBefore = Array.isArray(context?.prevProfiles) ? context.prevProfiles.length === 0 : false;
        await setProfiles(updated, wasEmptyBefore ? data.id : useBabiesStore.getState().activeBabyId);
      }
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] });
      showToast('Baby added', 'success');
    },
  });

  const deleteMutation = useMutation<any, any, string>({
    mutationFn: (id) => deleteBaby(id),
    onMutate: async (id) => {
      const prev = useBabiesStore.getState().profiles;
      const next = prev.filter((p) => p.id !== id);
      // If the deleted id was active, pick a fallback active (first remaining)
      // so we never end up with no active while profiles exist.
      const currentActive = useBabiesStore.getState().activeBabyId;
      const nextActive = currentActive === id ? next[0]?.id ?? null : currentActive;
      await setProfiles(next, nextActive);
      return { prevProfiles: prev, prevActive: currentActive };
    },
    onError: (err, _variables, context: any) => {
      if (context?.prevProfiles) setProfiles(context.prevProfiles, context.prevActive ?? context.prevProfiles[0]?.id ?? null);
      console.warn('[babies] delete failed, rolled back', err);
      showToast('Failed to delete baby', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] });
      showToast('Baby deleted', 'success');
    },
  });
  const [isAdding, setIsAdding] = React.useState(false);
  const [name, setName] = React.useState('');
  const [birthDate, setBirthDate] = React.useState('');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    // For guests we keep the in-memory load; for authenticated users React Query will fetch
    if (!user?.id) load();
  }, [load]);

  function handleBack() {
    router.back();
  }

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (user?.id) {
      await insertMutation.mutateAsync({ userId: user.id, name: trimmed, birthDate: birthDate || null, gender: 'unspecified', notes: notes || null, avatarUrl: null });
    } else {
      await add({ name: trimmed, birthDate: birthDate || undefined, notes: notes || undefined, gender: 'unspecified' });
    }
    setName('');
    setBirthDate('');
    setNotes('');
    setIsAdding(false);
  }

  function confirmDelete(profile: BabyProfile) {
    Alert.alert('Delete Profile', `Remove ${profile.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (user?.id) {
            try {
              await deleteMutation.mutateAsync(profile.id);
            } catch (e) {
              console.warn('[Babies] delete failed', e);
              Alert.alert('Delete failed', (e as any)?.message ?? 'Please try again.');
            }
          } else {
            await remove(profile.id);
          }
        },
      },
    ]);
  }

  const renderItem = ({ item }: { item: BabyProfile }) => {
    const isActive = item.id === activeBabyId;
    return (
      <View className={`rounded-2xl p-4 mb-3 border ${isActive ? 'border-rose-400 bg-rose-50/60' : 'border-rose-100 bg-rose-50/40'}`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="flex-row items-center flex-1"
            onPress={() => {
              setActive(item.id);
              router.push(`/babies/${item.id}`);
            }}
          >
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} className="w-12 h-12 rounded-full mr-3" />
            ) : (
              <View className="w-12 h-12 rounded-full bg-rose-200 mr-3 items-center justify-center">
                <Ionicons name="person-outline" size={18} color="#fff" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-semibold text-neutral-900">{item.name}</Text>
              {!!item.birthDate && <Text className="text-sm text-amber-800 mt-1">DOB: {item.birthDate}</Text>}
              {!!item.notes && <Text className="text-sm text-amber-800 mt-1" numberOfLines={2}>{item.notes}</Text>}
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={async () => {
                // Do not allow unselecting the current active baby. To change the
                // active baby user must explicitly select another one.
                if (isActive) {
                  showToast('Select another baby to change the active profile', 'info');
                  return;
                }
                try {
                  await setActive(item.id);
                  showToast(`${item.name} selected for analysis`, 'success');
                } catch (e) {
                  console.warn('[Babies] setActive failed', e);
                  showToast('Failed to change active baby', 'error');
                }
              }}
            >
              <Ionicons name={isActive ? 'radio-button-on' : 'radio-button-off'} size={20} color={isActive ? '#ef4444' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/babies/edit?id=${item.id}`)}>
              <Ionicons name="create-outline" size={20} color="#9CA3AF" />
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
        <TouchableOpacity onPress={() => router.push('/babies/edit')}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6">
        {isAdding ? (
          <View className="rounded-2xl p-4 mb-4 border border-rose-200 bg-rose-50">
            <Text className="text-base font-semibold text-neutral-900 mb-2">Add Baby</Text>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              className="border border-rose-200 rounded-xl px-3 py-2 bg-white mb-2"
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              placeholder="Birth date (YYYY-MM-DD)"
              value={birthDate}
              onChangeText={setBirthDate}
              className="border border-rose-200 rounded-xl px-3 py-2 bg-white mb-2"
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TextInput
              placeholder="Notes"
              value={notes}
              onChangeText={setNotes}
              className="border border-rose-200 rounded-xl px-3 py-2 bg-white mb-3"
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <View className="flex-row gap-3">
              <TouchableOpacity className="bg-red-500 rounded-xl px-4 py-2" onPress={handleAdd}>
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-white border border-rose-200 rounded-xl px-4 py-2" onPress={() => setIsAdding(false)}>
                <Text className="text-neutral-900 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

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


