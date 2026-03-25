import * as FileSystem from 'expo-file-system';
import { api } from './client';
import { API_BASE_URL } from '../constants/config';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadImage(
  uri: string,
  folder: 'profiles' | 'logos' | 'events' | 'content'
): Promise<string> {
  // Validate file extension
  const filename = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Validate file size
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > MAX_FILE_SIZE) {
    throw new Error('File is too large. Maximum size is 10MB.');
  }

  const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const token = await api.getToken();

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type,
  } as any);
  formData.append('folder', folder);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Upload failed');
  }

  const data = await response.json();
  return (data as { url: string }).url;
}
