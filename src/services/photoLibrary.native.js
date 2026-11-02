import * as MediaLibrary from 'expo-media-library';

/**
 * @param {string} uri
 * @returns {Promise<{id: string, destination: 'library'}>}
 */
export async function savePhoto(uri) {
  const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
  if (!permission.granted) {
    throw new Error('Allow photo saving to continue.');
  }

  const asset = await MediaLibrary.Asset.create(uri);
  return { id: asset.id, destination: 'library' };
}
