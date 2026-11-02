// ======================================================
// PHOTO SERVICE — SMALL WRAPPERS AROUND EXPO MODULES
//
// Uncomment the imports and the matching implementation block as each part
// directs you. Every starter stub throws an actionable message so unfinished
// work is visible without breaking app startup or module resolution.
// ======================================================
// PART 2 — remove these markers to enable the picker import.
import * as ImagePicker from 'expo-image-picker';
// PART 5 — remove these markers to enable the image-manipulator import.
import * as ImageManipulator from 'expo-image-manipulator';

import { savePhoto } from './photoLibrary';

export { savePhoto };

// ======================================================
// PART 2 — PICK A PHOTO
//
// WHY: The system picker gives people control over which image the app sees.
// PRODUCT QUESTION: Does this screen need access to every photo on the device?
// DO: Uncomment the ImagePicker import above and the implementation below.
// VERIFY: Pick an image, then cancel once and confirm the app stays usable.
// NEXT: Search for "PART 3 — SHOW THE LIVE CAMERA" in CameraPanel.js.
// ======================================================
/** @returns {Promise<{assetId?: string | null, uri: string} | null>} */
export async function pickPhoto() {
  
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  if (result.canceled) return null;
  return result.assets[0];
  
  throw new Error('PART 2 is not complete: open the system photo picker.');
}

// ======================================================
// PART 3 — CAPTURE A PHOTO
//
// WHY: takePictureAsync returns a local image URI from the camera preview.
// PRODUCT QUESTION: Should capture be available before the preview is ready?
// DO: Uncomment the implementation below; CameraPanel passes its camera ref.
// VERIFY: Capture one photo after the preview reports that it is ready.
// NEXT: Search for "PART 4 — BUILD A PHOTO COLLECTION" in App.js.
// ======================================================
/** @returns {Promise<{uri: string}>} */
export async function capturePhoto(cameraRef) {
  
  if (!cameraRef?.current) {
    throw new Error('Wait for the camera preview before taking a photo.');
  }
  return cameraRef.current.takePictureAsync({ quality: 0.85 });
  throw new Error('PART 3 is not complete: capture a photo from the camera preview.');
}

// ======================================================
// PART 5 — ROTATE A COPY
//
// WHY: ImageManipulator can create a transformed file without replacing input.
// PRODUCT QUESTION: Should editing destroy the original image?
// DO: Uncomment the ImageManipulator import and implementation below.
// VERIFY: Rotate the selected photo and use Reset to return to the original.
// NEXT: Search for "PART 6 — SAVE TO THE DEVICE PHOTO LIBRARY" below.
// ======================================================
/** @returns {Promise<{uri: string}>} */
export async function rotatePhoto(uri) {
  
  const context = ImageManipulator.ImageManipulator.manipulate(uri);
  context.rotate(90);
  const renderedImage = await context.renderAsync();
  return renderedImage.saveAsync({
    compress: 0.85,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  
  throw new Error('PART 5 is not complete: create a rotated copy of the image.');
}

// ======================================================
// PART 6 — SAVE TO THE DEVICE PHOTO LIBRARY
//
// WHY: Camera and edited image URIs may only live in the app cache.
// PRODUCT QUESTION: How should saving differ between a phone and a browser?
// DO: Enable the Part 6 implementations in photoLibrary.native.js and
//     photoLibrary.web.js. Keep expo-media-library out of shared photoService.js.
// VERIFY: Native builds save to Photos/Gallery; web downloads a copy.
// NEXT: Run npm run verify and review the privacy notes in README.md.
// ======================================================
