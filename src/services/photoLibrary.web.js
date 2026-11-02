/**
 * Download the image from the browser instead of trying to use the native
 * photo-library module, which is not available on web.
 * @param {string} uri
 * @returns {Promise<{uri: string, fileName: string, destination: 'download'}>}
 */
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
}
