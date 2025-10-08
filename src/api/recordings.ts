import { supabase } from '../config/supabase';

export interface SaveRecordingInput {
  userId: string;
  babyId: string;
  fileUri: string;
  notes?: string;
  meta?: Record<string, any>;
}

export async function getRecordings(userId: string, babyId?: string) {
  let query = supabase
    .from('recordings')
    .select('*, babies(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (babyId) {
    query = query.eq('baby_id', babyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function deleteRecording(recordingId: string) {
  const { error } = await supabase
    .from('recordings')
    .delete()
    .eq('id', recordingId);
  if (error) throw error;
  return true;
}

export async function uploadAudioAndCreateRecording(input: SaveRecordingInput) {
  const { userId, babyId, fileUri, notes, meta } = input;

  // Determine file extension and content type based on the actual file
  const FileSystem = require('expo-file-system');
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  const fileExtension = fileInfo.uri?.split('.').pop()?.toLowerCase() || 'm4a';
  const fileName = `${userId}/${Date.now()}.${fileExtension}`;
  const contentType = fileExtension === 'wav' ? 'audio/wav' : 'audio/m4a';

  try {
    // Get file info to check if it exists and has content
    console.log('Audio file info before upload:', {
      exists: fileInfo.exists,
      size: fileInfo.size,
      uri: fileUri,
      extension: fileExtension,
      contentType
    });

    if (!fileInfo.exists || fileInfo.size < 1024) { // Minimum 1KB for valid audio
      console.warn('Audio file too small or missing:', fileInfo);
      throw new Error('Audio file is too small or corrupted');
    }

    console.log(`Uploading file (${fileInfo.size} bytes) to storage...`);

    // Upload file directly from URI (React Native compatible approach)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, fileUri, {
        contentType,
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);
    console.log('File uploaded successfully. Public URL:', publicUrl);

    // Verify the URL is accessible
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      console.log('Public URL accessibility check:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        url: publicUrl,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });
    } catch (urlError) {
      console.warn('Error checking public URL accessibility:', urlError);
    }

    // Save recording metadata to database
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        user_id: userId,
        baby_id: babyId,
        url: publicUrl,
        notes: notes?.trim() || null,
        meta: meta || {}
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
