import { supabase, supabaseUrl, supabaseAnonKey, getAccessToken } from '../config/supabase';
// Avoid static import to prevent native module errors when not installed
// We'll require it dynamically inside functions when needed

export interface BabyRow {
  id: string;
  user_id: string;
  name: string;
  birth_date: string | null;
  gender: 'male' | 'female' | 'unspecified' | null;
  notes: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BabyInsertInput {
  userId: string;
  name: string;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'unspecified' | null;
  notes?: string | null;
  avatarUrl?: string | null;
}

export interface BabyUpdateInput {
  name?: string;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'unspecified' | null;
  notes?: string | null;
  avatarUrl?: string | null;
}

export async function listBabies(userId: string): Promise<BabyRow[]> {
  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as BabyRow[];
}

export async function getBaby(id: string): Promise<BabyRow | null> {
  const { data, error } = await supabase.from('babies').select('*').eq('id', id).single();
  if (error) {
    if ((error as any).code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as BabyRow;
}

export async function insertBaby(input: BabyInsertInput): Promise<BabyRow> {
  const { userId, name, birthDate, gender, notes, avatarUrl } = input;
  const { data, error } = await supabase
    .from('babies')
    .insert({ user_id: userId, name, birth_date: birthDate ?? null, gender: gender ?? 'unspecified', notes: notes ?? null, avatar_url: avatarUrl ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as BabyRow;
}

export async function updateBaby(id: string, patch: BabyUpdateInput): Promise<BabyRow> {
  const payload: Partial<BabyRow> = {
    name: patch.name as any,
    birth_date: patch.birthDate ?? null,
    gender: patch.gender ?? undefined,
    notes: patch.notes ?? null,
    avatar_url: patch.avatarUrl ?? undefined,
  };
  const { data, error } = await supabase
    .from('babies')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BabyRow;
}

export async function deleteBaby(id: string): Promise<void> {
  const { error } = await supabase.from('babies').delete().eq('id', id);
  if (error) throw error;
}

// Upload a local image file URI to Supabase Storage and return its public URL
// Uploads and returns the STORAGE PATH (not a public URL), e.g., `${userId}/timestamp.ext`
export async function uploadBabyAvatar(fileUri: string, userId: string): Promise<string> {
  let sourceUri = fileUri;
  // Handle Android content:// URIs by copying to a temporary file first
  if (sourceUri.startsWith('content://')) {
    try {
      // Dynamically require expo-file-system if available
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const FileSystem = require('expo-file-system');
      const extGuess = sourceUri.includes('image') ? 'jpg' : 'bin';
      const dest = `${FileSystem.cacheDirectory}avatar-${Date.now()}.${extGuess}`;
      try {
        await FileSystem.copyAsync({ from: sourceUri, to: dest });
        sourceUri = dest;
      } catch {
        // If copy fails, proceed with original URI; fetch may still work on some devices
      }
    } catch {
      // expo-file-system not available; attempt direct fetch below
    }
  }
  const path = `${userId}/${Date.now()}.jpg`;
  // Try using FileSystem.uploadAsync first (more reliable on Android)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const FileSystem = require('expo-file-system');
    const uploadUrl = `${supabaseUrl}/storage/v1/object/baby-avatars/${encodeURIComponent(path)}`;
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'image/jpeg',
      apikey: supabaseAnonKey,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const result = await FileSystem.uploadAsync(uploadUrl, sourceUri, {
      httpMethod: 'POST',
      headers,
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });
    if (result.status !== 200 && result.status !== 201) {
      throw new Error(`Upload failed with status ${result.status}`);
    }
    return path;
  } catch (e) {
    // Fallback to Storage client using fetch blob
    const res = await fetch(sourceUri);
    const blob = await res.blob();
    const ext = (blob.type?.split('/')?.[1] || 'jpg').toLowerCase();
    const blobPath = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('baby-avatars').upload(blobPath, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    });
    if (upErr) throw upErr;
    return blobPath;
  }
}

// Create a signed URL for a given storage path (valid for `expiresInSec` seconds)
export async function getAvatarSignedUrl(path: string, expiresInSec = 3600): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('baby-avatars').createSignedUrl(path, expiresInSec);
  if (error) return null;
  return data.signedUrl;
}


