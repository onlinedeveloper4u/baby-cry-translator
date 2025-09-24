import { supabase } from '../config/supabase';

export interface BabyUpsertInput {
  userId: string;
  name: string;
  birthDate?: string | null;
  notes?: string | null;
}

export async function upsertBaby(input: BabyUpsertInput) {
  const { userId, name, birthDate, notes } = input;
  const { data, error } = await supabase
    .from('babies')
    .upsert({ user_id: userId, name, birth_date: birthDate ?? null, notes: notes ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}


