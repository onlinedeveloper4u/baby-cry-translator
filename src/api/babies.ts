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

export interface DeleteBabyResult {
  dbDeleted: boolean;
  storageDeleted: boolean;
  dbError?: any;
  storageError?: any;
}

export async function deleteBaby(id: string): Promise<DeleteBabyResult> {
  // Try to fetch avatar path first so we can delete the storage object (best-effort)
  const { data: row, error: fetchErr } = await supabase.from('babies').select('avatar_url').eq('id', id).single();
  if (fetchErr) {
    console.warn('[deleteBaby] fetch row error', fetchErr);
    return { dbDeleted: false, storageDeleted: false, dbError: fetchErr };
  }
  const avatarUrl = (row as any)?.avatar_url as string | null;
  let storageDeleted = false;
  let storageErr: any = null;
  if (avatarUrl) {
    // Determine storage path. If avatarUrl is already a storage path (no protocol), use it.
    let storagePath = avatarUrl;
    if (/^https?:\/\//i.test(storagePath)) {
      try {
        const url = new URL(storagePath);
        // Try to extract path after any occurrence of 'baby-avatars/' in the pathname
        const marker = '/baby-avatars/';
        const idx = url.pathname.indexOf(marker);
        if (idx !== -1) {
          storagePath = decodeURIComponent(url.pathname.slice(idx + marker.length));
        } else {
          // Try common signed-url pattern
          const marker2 = '/object/sign/baby-avatars/';
          const idx2 = url.pathname.indexOf(marker2);
          if (idx2 !== -1) {
            storagePath = decodeURIComponent(url.pathname.slice(idx2 + marker2.length));
          } else {
            // Could not determine storage path from URL; skip deletion
            storagePath = '';
          }
        }
      } catch {
        storagePath = '';
      }
    }

    if (storagePath) {
      try {
        const { error: delErr } = await supabase.storage.from('baby-avatars').remove([storagePath]);
        if (delErr) {
          console.warn('[deleteBaby] storage remove failed', delErr);
          // continue
          storageErr = delErr;
        } else {
          storageDeleted = true;
        }
      } catch (err) {
        console.warn('[deleteBaby] storage remove threw', err);
        storageErr = err;
      }
    }
  }
  // Always attempt to delete the DB row.
  const { data: delData, error: delErr } = await supabase.from('babies').delete().eq('id', id).select();
  if (delErr) {
    console.warn('[deleteBaby] db delete error', delErr);
    return { dbDeleted: false, storageDeleted, dbError: delErr, storageError: storageErr };
  }
  // If delete returned rows, consider it deleted
  const dbDeleted = Array.isArray(delData) ? delData.length > 0 : !!delData;
  console.log('[deleteBaby] deleted rows', delData);
  return { dbDeleted, storageDeleted, storageError: storageErr };
}

// Upload a local image file URI to Supabase Storage and return its public URL
// Uploads and returns the STORAGE PATH (not a public URL), e.g., `${userId}/timestamp.ext`
export async function uploadBabyAvatar(fileUri: string, userId: string): Promise<{ path: string; previewUrl?: string }> {
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
  // Prefer reading file as base64 via expo-file-system and upload via Supabase client
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const FileSystem = require('expo-file-system');
    try {
      const base64 = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
      // Try to decode base64 to a Uint8Array. Prefer Buffer if available.
      let uint8: Uint8Array | null = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Buffer = require('buffer').Buffer;
        const buf = Buffer.from(base64, 'base64');
        uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
      } catch {
        // Fallback to atob if Buffer is not available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const atobFn: any = typeof global.atob === 'function' ? global.atob : undefined;
        if (atobFn) {
          const binary = atobFn(base64);
          const len = binary.length;
          const arr = new Uint8Array(len);
          for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
          uint8 = arr;
        }
      }

      if (!uint8) throw new Error('Unable to decode base64 for upload');

      const contentType = 'image/jpeg';
      const ext = 'jpg';
      const blobPath = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('baby-avatars').upload(blobPath, uint8, {
        contentType,
        upsert: true,
      });
      if (upErr) throw upErr;
      // Try to create a signed URL for preview
      try {
        const { data: signedData, error: signedErr } = await supabase.storage.from('baby-avatars').createSignedUrl(blobPath, 60 * 60);
        if (!signedErr && signedData?.signedUrl) return { path: blobPath, previewUrl: signedData.signedUrl };
      } catch {
        // ignore
      }
      return { path: blobPath };
    } catch (inner) {
      // If reading as base64 fails, fall through to fetch/blob approach
      console.warn('[uploadBabyAvatar] base64 read failed, falling back to fetch blob', inner);
    }
  } catch {
    // expo-file-system not available or failed; fall back below
  }

  // Final fallback: try fetching the URI and upload as blob/arrayBuffer
  try {
    const res = await fetch(sourceUri);
    const arrayBuffer = await res.arrayBuffer();
    const ext = 'jpg';
    const blobPath = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('baby-avatars').upload(blobPath, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (uploadError) throw uploadError;
    // Try to return a signed preview URL
    try {
      const { data: signedData, error: signedErr } = await supabase.storage.from('baby-avatars').createSignedUrl(blobPath, 60 * 60);
      if (!signedErr && signedData?.signedUrl) return { path: blobPath, previewUrl: signedData.signedUrl };
    } catch {
      // ignore
    }
    return { path: blobPath };
  } catch (finalErr) {
    // Surface same error to caller
    throw finalErr;
  }
}

// Create a signed URL for a given storage path (valid for `expiresInSec` seconds)
export async function getAvatarSignedUrl(path: string, expiresInSec = 3600): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('baby-avatars').createSignedUrl(path, expiresInSec);
  if (error) return null;
  return data.signedUrl;
}


