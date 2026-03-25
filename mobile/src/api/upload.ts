import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';

export async function uploadImage(
  uri: string,
  folder: 'profiles' | 'logos' | 'events' | 'content'
): Promise<string> {
  const token = await SecureStore.getItemAsync('glowpass_token');

  const filename = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

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
