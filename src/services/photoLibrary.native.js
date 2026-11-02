// ======================================================
// PART 6 — NATIVE PHOTO-LIBRARY SAVE
//
// DO: Uncomment the MediaLibrary import and the implementation in savePhoto().
// VERIFY: Save on an iOS/Android device and confirm Photos/Gallery updates.
// ======================================================

import * as MediaLibrary from 'expo-media-library';


/** @returns {Promise<{id: string, destination: 'library'}>} */
export async function savePhoto(uri) {
  
  const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
  if (!permission.granted) {
    throw new Error('Allow photo saving to continue.');
  }

  const asset = await MediaLibrary.Asset.create(uri);
  return { id: asset.id, destination: 'library' };
  
  throw new Error('PART 6 is not complete: save a copy to the native photo library.');
}
