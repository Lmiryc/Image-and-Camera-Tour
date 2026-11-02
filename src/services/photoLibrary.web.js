// ======================================================
// PART 6 — BROWSER PHOTO DOWNLOAD
//
// WHY: expo-media-library is native-only; web saving should use browser APIs.
// PRODUCT QUESTION: Should browser save invoke a mobile-only permission dialog?
// DO: Uncomment the browser download block in savePhoto().
// VERIFY: Save in a browser and confirm photo-lab.jpg downloads.
// NEXT: Run npm run check-progress and npm test.
// ======================================================
/** @returns {Promise<{uri: string, fileName: string, destination: 'download'}>} */
export async function savePhoto(uri) {
  
  if (typeof document === 'undefined' || !document.body) {
    throw new Error('This browser cannot download the photo from this screen.');
  }

  const fileName = 'photo-lab.jpg';
  const link = document.createElement('a');
  link.href = uri;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { uri, fileName, destination: 'download' };
  
  throw new Error('PART 6 is not complete: download a photo copy in the browser.');
}
