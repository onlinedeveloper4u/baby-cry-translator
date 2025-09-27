import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAvatarSignedUrl, getBaby, insertBaby, updateBaby, uploadBabyAvatar } from '../../src/api/babies';
import { useAuthStore } from '../../src/store/auth';
import { useBabiesStore } from '../../src/store/babies';
import useToastStore from '../../src/store/toast';

export default function EditBabyScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const editingIdRaw = Array.isArray(params.id) ? params.id[0] : params.id;
  const editingId = typeof editingIdRaw === 'string' && editingIdRaw.length > 0 ? decodeURIComponent(editingIdRaw) : undefined;
  const { add, update, profiles } = useBabiesStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [name, setName] = React.useState('');
  const [birthDate, setBirthDate] = React.useState('');
  const [gender, setGender] = React.useState<'male' | 'female' | 'unspecified'>('unspecified');
  const [loading, setLoading] = React.useState(false);
  const [avatarUri, setAvatarUri] = React.useState<string | undefined>(undefined);
  const [datePickerVisible, setDatePickerVisible] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    function hydrateFromLocal(id: string) {
      const p = profiles.find((x) => x.id === id);
      if (p) {
        setName(p.name ?? '');
        setBirthDate(p.birthDate ?? '');
        setGender((p.gender as any) ?? 'unspecified');
        if (p.avatarUrl) setAvatarUri(p.avatarUrl);
        console.log('[EditBaby] hydrated from local store for id', id);
        return true;
      }
      return false;
    }
    async function loadExisting() {
      if (!editingId) {
        // Add mode: nothing to prefill
        setHydrated(true);
        return;
      }
      // If unauthenticated, prefer local immediately
      if (!user?.id) {
        console.log('[EditBaby] unauthenticated, hydrating from local for id', editingId);
        hydrateFromLocal(editingId);
        setHydrated(true);
        return;
      }
      // For authenticated users, we'll let React Query manage fetching elsewhere; keep this as a fallback
      try {
        const row = await getBaby(editingId);
        if (row && mounted) {
          console.log('[EditBaby] fetched from Supabase for id', editingId, !!row);
          setName(row.name ?? '');
          setBirthDate(row.birth_date ?? '');
          setGender((row.gender as any) ?? 'unspecified');
          if (row.avatar_url) {
            try {
              const signed = await getAvatarSignedUrl(row.avatar_url);
              if (signed) setAvatarUri(signed);
              else setAvatarUri(row.avatar_url);
            } catch {
              setAvatarUri(row.avatar_url);
            }
          }
          setHydrated(true);
          return;
        }
        console.log('[EditBaby] not found in Supabase, fallback local for id', editingId);
        hydrateFromLocal(editingId);
        setHydrated(true);
      } catch {
        console.log('[EditBaby] error fetching Supabase, fallback local for id', editingId);
        hydrateFromLocal(editingId);
        setHydrated(true);
      }
    }
    loadExisting();
    return () => {
      mounted = false;
    };
  }, [editingId, profiles, user?.id]);

  const insertMutation = useMutation({
    mutationFn: (input: Parameters<typeof insertBaby>[0]) => insertBaby(input),
    onMutate: async (input) => {
      const prev = useBabiesStore.getState().profiles;
      const tempId = `temp-${Date.now()}`;
      const next = [...prev, { id: tempId, name: input.name, birthDate: input.birthDate ?? undefined, notes: input.notes ?? undefined, gender: (input.gender as any) ?? 'unspecified', avatarUrl: input.avatarUrl ?? undefined }];
      // preserve current active selection (do not auto-select newly added baby)
      await useBabiesStore.getState().setProfiles(next, useBabiesStore.getState().activeBabyId);
      return { prevProfiles: prev, tempId };
    },
    onError: (err, _variables, context: any) => {
      if (context?.prevProfiles) useBabiesStore.getState().setProfiles(context.prevProfiles, context.prevProfiles[0]?.id ?? null);
      console.warn('[edit] insert failed, rolled back', err);
      useToastStore.getState().show('Failed to add baby', 'error');
    },
    onSuccess: (data, _variables, context: any) => {
      if (context?.tempId) {
        const current = useBabiesStore.getState().profiles;
        const updated = current.map((p) => (p.id === context.tempId ? { id: data.id, name: data.name, birthDate: data.birth_date ?? undefined, notes: data.notes ?? undefined, gender: (data.gender as any) ?? 'unspecified', avatarUrl: data.avatar_url ?? undefined } : p));
        // preserve current active selection
        useBabiesStore.getState().setProfiles(updated, useBabiesStore.getState().activeBabyId);
      }
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] });
      useToastStore.getState().show('Baby added', 'success');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; patch: Parameters<typeof updateBaby>[1] }) => updateBaby(payload.id, payload.patch),
    onMutate: async (payload) => {
      const prev = useBabiesStore.getState().profiles;
      const next = prev.map((p) => (p.id === payload.id ? { ...p, ...{ name: payload.patch.name ?? p.name, birthDate: payload.patch.birthDate ?? p.birthDate, gender: (payload.patch.gender as any) ?? p.gender, notes: payload.patch.notes ?? p.notes, avatarUrl: payload.patch.avatarUrl ?? p.avatarUrl } } : p));
      await useBabiesStore.getState().setProfiles(next, useBabiesStore.getState().activeBabyId);
      return { prevProfiles: prev };
    },
    onError: (err, _variables, context: any) => {
      if (context?.prevProfiles) useBabiesStore.getState().setProfiles(context.prevProfiles, context.prevProfiles[0]?.id ?? null);
      console.warn('[edit] update failed, rolled back', err);
      useToastStore.getState().show('Failed to update baby', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] });
      useToastStore.getState().show('Saved', 'success');
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      // Re-run hydration when screen regains focus
      if (!editingId) return;
      // Trigger the effect by updating a noop state or simply call local hydration fast
      // Prefer fast local hydration on focus
      const p = profiles.find((x) => x.id === editingId);
      if (p) {
        setName(p.name ?? '');
        setBirthDate(p.birthDate ?? '');
        setGender((p.gender as any) ?? 'unspecified');
        if (p.avatarUrl) setAvatarUri(p.avatarUrl);
      }
    }, [editingId, profiles])
  );

  async function handleSave() {
    if (loading) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      if (user?.id) {
        let avatarUrlToSave: string | undefined = undefined;
        // Upload if we have a local URI (not already http/https)
        if (avatarUri && !/^https?:\/\//i.test(avatarUri)) {
          try {
            const uploadResult = await uploadBabyAvatar(avatarUri, user.id);
            avatarUrlToSave = uploadResult.path;
            if (uploadResult.previewUrl) setAvatarUri(uploadResult.previewUrl);
          } catch (e: any) {
            console.warn('[Edit Baby] avatar upload failed', e);
            Alert.alert('Avatar upload failed', e?.message ?? 'Please try a different image.');
            setLoading(false);
            return;
          }
        }
        if (editingId) {
          await updateMutation.mutateAsync({ id: editingId, patch: { name: trimmed, birthDate: birthDate || null, gender, notes: null, avatarUrl: avatarUrlToSave } });
        } else {
          await insertMutation.mutateAsync({ userId: user.id, name: trimmed, birthDate: birthDate || null, gender, notes: null, avatarUrl: avatarUrlToSave ?? null });
        }
      } else {
        // Fallback to local store for guests/no auth
        if (editingId) {
          await update(editingId, { name: trimmed, birthDate: birthDate || undefined, gender, avatarUrl: avatarUri });
        } else {
          await add({ name: trimmed, birthDate: birthDate || undefined, gender, notes: undefined, avatarUrl: avatarUri });
        }
      }
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  // Delete button removed — deletion is handled elsewhere (babies list or management UI)

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0]?.uri);
    }
  }

  function openDatePicker() {
    setDatePickerVisible(true);
  }

  function onChangeDate(_e: any, selected?: Date) {
    if (Platform.OS === 'android') setDatePickerVisible(false);
    if (selected) {
      const iso = selected.toISOString().slice(0, 10);
      setBirthDate(iso);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-rose-50">
      {/* Top Bar - Always visible */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-neutral-900">{editingId ? name || 'Baby Profile' : 'Add Baby'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Ionicons name="checkmark" size={24} color={loading ? '#9CA3AF' : '#000'} />
        </TouchableOpacity>
      </View>

      {editingId && !hydrated ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#dc2626" />
          <Text className="text-neutral-500 mt-4">Loading...</Text>
        </View>
      ) : (
        <>
        {/* Avatar + Name Preview */}
        <View className="items-center mt-4">
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7} className="w-28 h-28 rounded-full bg-rose-100 overflow-hidden items-center justify-center">
            <Image
              source={{ uri: avatarUri || 'https://dummyimage.com/200x200/ffe4e6/0b0b0b&text=👶' }}
              className="w-28 h-28"
              resizeMode="cover"
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-neutral-900 mt-3">{name || 'Liam'}</Text>
          {birthDate ? (
            <Text className="text-rose-700 mt-1">Born on {birthDate}</Text>
          ) : (
            <Text className="text-rose-700 mt-1">Born on YYYY-MM-DD</Text>
          )}
        </View>

        {/* Form */}
        <View className="mt-6 px-6 gap-5">
          <View>
            <Text className="text-base font-semibold text-neutral-900 mb-2">Baby's Name</Text>
            <TextInput
              placeholder="Enter name"
              value={name}
              onChangeText={setName}
              className="border border-rose-200 rounded-2xl px-4 py-3 bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-base font-semibold text-neutral-900 mb-2">Date of Birth</Text>
            <TouchableOpacity onPress={openDatePicker} className="border border-rose-200 rounded-2xl px-4 py-3 bg-white">
              <Text className="text-neutral-900">{birthDate || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>
            {datePickerVisible && (
              <DateTimePicker
                value={birthDate ? new Date(birthDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={onChangeDate}
              />
            )}
          </View>

          <View>
            <Text className="text-base font-semibold text-neutral-900 mb-2">Sex (Optional)</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`px-4 py-2 rounded-xl border ${gender === 'male' ? 'bg-rose-100 border-rose-300' : 'bg-white border-rose-200'}`}
                onPress={() => setGender('male')}
              >
                <Text className="text-neutral-900">Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-xl border ${gender === 'female' ? 'bg-rose-100 border-rose-300' : 'bg-white border-rose-200'}`}
                onPress={() => setGender('female')}
              >
                <Text className="text-neutral-900">Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-xl border ${gender === 'unspecified' ? 'bg-rose-100 border-rose-300' : 'bg-white border-rose-200'}`}
                onPress={() => setGender('unspecified')}
              >
                <Text className="text-neutral-900">Unspecified</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer Buttons */}
          <View className="flex-row justify-between items-center px-6 mt-auto mb-6">
            <TouchableOpacity onPress={handleCancel} className="bg-rose-100 rounded-xl px-5 py-3">
              <Text className="text-neutral-900 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={loading} className="bg-red-500 rounded-xl px-6 py-3">
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
          {/* Loading overlay */}
          {loading && (
            <View className="absolute inset-0 bg-black bg-opacity-30 items-center justify-center">
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          </>
        )}
    </SafeAreaView>
  );
}
