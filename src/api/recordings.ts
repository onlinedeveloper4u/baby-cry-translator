import { supabase } from '../config/supabase';

export interface SaveRecordingInput {
  userId: string;
  babyId: string;
  fileUri: string;
  notes?: string;
  meta?: Record<string, any>;
}

export async function uploadAudioAndCreateRecording(input: SaveRecordingInput) {
  const { userId, babyId, fileUri, notes, meta } = input;
  const fileName = `${userId}/${Date.now()}.m4a`;
  const arrayBuffer = await (await fetch(fileUri)).arrayBuffer();
  const { error: uploadError } = await supabase.storage.from('audio').upload(fileName, arrayBuffer, {
    contentType: 'audio/m4a',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('recordings')
    .insert({ user_id: userId, baby_id: babyId, url: publicUrl, notes: notes ?? null, meta: meta ?? {} })
    .select()
    .single();
  if (error) throw error;
  return data;
}


