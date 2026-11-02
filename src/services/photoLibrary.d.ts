export function savePhoto(uri: string): Promise<
  | { id: string; destination: 'library' }
  | { uri: string; fileName: string; destination: 'download' }
>;
