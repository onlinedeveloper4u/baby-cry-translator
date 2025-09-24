import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BabyProfile, useBabiesStore } from '../../src/store/babies';

export default function BabiesScreen() {
  const { profiles, activeBabyId, add, update, remove, setActive, load } = useBabiesStore();
  const [isAdding, setIsAdding] = React.useState(false);
  const [name, setName] = React.useState('');
  const [birthDate, setBirthDate] = React.useState('');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    load();
  }, [load]);

  function handleBack() {
    router.back();
  }

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await add({ name: trimmed, birthDate: birthDate || undefined, notes: notes || undefined, gender: 'unspecified' });
    setName('');
    setBirthDate('');
    setNotes('');
    setIsAdding(false);
  }

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
            <Text className="text-lg font-semibold text-neutral-900">{item.name}</Text>
            {!!item.birthDate && <Text className="text-sm text-amber-800 mt-1">DOB: {item.birthDate}</Text>}
            {!!item.notes && <Text className="text-sm text-amber-800 mt-1" numberOfLines={2}>{item.notes}</Text>}
          </TouchableOpacity>
          <View className="flex-row items-center gap-3">
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
        <View style={{ width: 24 }} />
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
        ) : (
          <TouchableOpacity className="bg-red-500 rounded-2xl px-4 py-3 mb-4 self-start" onPress={() => setIsAdding(true)}>
            <View className="flex-row items-center gap-2">
              <Ionicons name="add" size={18} color="#fff" />
              <Text className="text-white font-semibold">Add Baby</Text>
            </View>
          </TouchableOpacity>
        )}

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


