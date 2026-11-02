import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CameraPanel from './src/components/CameraPanel';
import { capturePhoto, pickPhoto, rotatePhoto, savePhoto } from './src/services/photoService';

export default function App() {
  const [photos, setPhotos] = React.useState([]);
  const [selectedPhoto, setSelectedPhoto] = React.useState(null);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState('Choose a photo or open the camera to get started.');

  async function importPhoto() {
    setBusy(true);
    setStatus('');
    try {
      const asset = await pickPhoto();
      if (!asset) {
        setStatus('Photo selection canceled.');
        return;
      }

      const photo = {
        id: asset.assetId || asset.uri,
        uri: asset.uri,
        source: 'Library',
        createdAt: Date.now(),
      };
      setStatus(`PART 4 is next: add the ${photo.source.toLowerCase()} image to your collection.`);

      // PART 4 — Uncomment these lines to add the picked photo to the collection.
      
      setPhotos(currentPhotos => [photo, ...currentPhotos]);
      setSelectedPhoto(photo);
      setStatus('Photo added to your collection.');
      
    } catch (error) {
      setStatus(error.message || 'The photo could not be selected.');
    } finally {
      setBusy(false);
    }
  }

  async function captureFromCamera(cameraRef) {
    setBusy(true);
    setStatus('');
    try {
      const asset = await capturePhoto(cameraRef);
      const photo = {
        id: asset.uri,
        uri: asset.uri,
        source: 'Camera',
        createdAt: Date.now(),
      };
      setCameraOpen(false);
      setStatus('Photo captured to the app cache. Part 4 adds it to your collection.');

      // PART 4 — Uncomment these lines to add the captured photo to the collection.
      
      setPhotos(currentPhotos => [photo, ...currentPhotos]);
      setSelectedPhoto(photo);
      setStatus('Photo added to your collection.');
      
    } catch (error) {
      setStatus(error.message || 'The photo could not be captured.');
    } finally {
      setBusy(false);
    }
  }

  async function rotateSelectedPhoto() {
    if (!selectedPhoto) return;
    setBusy(true);
    setStatus('');
    try {
      const result = await rotatePhoto(selectedPhoto.uri);
      setSelectedPhoto(currentPhoto => ({ ...currentPhoto, editedUri: result.uri }));
      setStatus('Rotated copy ready. The original is unchanged.');
    } catch (error) {
      setStatus(error.message || 'The photo could not be edited.');
    } finally {
      setBusy(false);
    }
  }

  async function saveSelectedPhoto() {
    if (!selectedPhoto) return;
    setBusy(true);
    setStatus('');
    try {
      const savedPhoto = await savePhoto(selectedPhoto.editedUri || selectedPhoto.uri);
      setStatus(savedPhoto.destination === 'download'
        ? 'Downloaded a photo copy.'
        : 'Saved a copy to your photo library.');
    } catch (error) {
      setStatus(error.message || 'The photo could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  function removePhoto(photoToRemove) {
    // PART 4 — Uncomment this block to remove a photo from this app's collection.
    
    setPhotos(currentPhotos => currentPhotos.filter(photo => photo.id !== photoToRemove.id));
    setSelectedPhoto(currentPhoto => currentPhoto?.id === photoToRemove.id ? null : currentPhoto);
    setStatus('Photo removed from this collection. The device original is unchanged.');
    
    // Remove this starter message after enabling the removal block above.
    //setStatus('PART 4 is not complete: remove a photo from the app collection.');
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>EXPO + REACT NATIVE</Text>
            <Text style={styles.heading}>Photo Lab</Text>
            <Text style={styles.copy}>A small, local-first tour of choosing, capturing, editing, and saving photos.</Text>
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={busy} onPress={importPhoto} style={styles.primaryButton}>
              <Text style={styles.primaryText}>{busy ? 'Working…' : 'Choose a photo'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setCameraOpen(open => !open)} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>{cameraOpen ? 'Close camera' : 'Open camera'}</Text>
            </Pressable>
          </View>

          {cameraOpen ? <CameraPanel onCapture={captureFromCamera} onClose={() => setCameraOpen(false)} /> : null}

          {selectedPhoto ? (
            <View style={styles.selectedPanel}>
              <Image
                accessibilityLabel="Selected photo preview"
                source={{ uri: selectedPhoto.editedUri || selectedPhoto.uri }}
                style={styles.preview}
              />
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" disabled={busy} onPress={rotateSelectedPhoto} style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>Rotate 90°</Text>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => setSelectedPhoto(photo => ({ ...photo, editedUri: null }))} style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>Reset</Text>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={busy} onPress={saveSelectedPhoto} style={styles.primaryButton}>
                  <Text style={styles.primaryText}>{Platform.OS === 'web' ? 'Download photo' : 'Save to Photos'}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPreview}>
              <Text style={styles.emptyIcon}>▧</Text>
              <Text style={styles.emptyTitle}>Your next photo goes here</Text>
              <Text style={styles.muted}>Pick an image or take one with the camera.</Text>
            </View>
          )}

          <View style={styles.collectionHeader}>
            <Text style={styles.subheading}>My collection</Text>
            <Text style={styles.muted}>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</Text>
          </View>
          <FlatList
            contentContainerStyle={styles.listContent}
            data={photos}
            keyExtractor={photo => photo.id}
            ListEmptyComponent={<Text style={styles.muted}>Your app collection is empty.</Text>}
            renderItem={({ item }) => (
              <View style={styles.photoRow}>
                <Pressable accessibilityRole="button" onPress={() => setSelectedPhoto(item)} style={styles.photoItem}>
                  <Image source={{ uri: item.editedUri || item.uri }} style={styles.thumbnail} />
                  <View style={styles.photoDetails}>
                    <Text style={styles.photoTitle}>{item.source} photo</Text>
                    <Text style={styles.muted}>Tap to preview</Text>
                  </View>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.source.toLowerCase()} photo`} onPress={() => removePhoto(item)} style={styles.removeButton}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            )}
            style={styles.photoList}
          />

          {status ? <Text accessibilityRole="alert" style={styles.status}>{status}</Text> : null}
          <Text style={styles.footer}>Photos stay on this device unless you choose to save a copy to its photo library.</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  content: { flex: 1, gap: 12, padding: 18, paddingTop: 22 },
  header: { gap: 4 },
  eyebrow: { color: '#5262c4', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  heading: { color: '#19233b', fontSize: 30, fontWeight: '800' },
  copy: { color: '#5f6b83', fontSize: 14, lineHeight: 20 },
  actions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  primaryButton: { alignItems: 'center', backgroundColor: '#465bd4', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderColor: '#465bd4', borderRadius: 10, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10 },
  secondaryText: { color: '#3549bd', fontSize: 13, fontWeight: '700' },
  selectedPanel: { backgroundColor: '#fff', borderRadius: 12, gap: 10, padding: 10 },
  preview: { alignSelf: 'center', backgroundColor: '#e3e7f1', borderRadius: 8, height: 150, width: '100%' },
  emptyPreview: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#dce2ee', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, gap: 5, justifyContent: 'center', minHeight: 120, padding: 14 },
  emptyIcon: { color: '#8490ad', fontSize: 28 },
  emptyTitle: { color: '#26334d', fontSize: 15, fontWeight: '700' },
  collectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  subheading: { color: '#19233b', fontSize: 17, fontWeight: '700' },
  muted: { color: '#65718a', fontSize: 12 },
  photoList: { flex: 1 },
  listContent: { gap: 8, paddingBottom: 6 },
  photoRow: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', gap: 8, padding: 8 },
  photoItem: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 10 },
  thumbnail: { backgroundColor: '#e3e7f1', borderRadius: 7, height: 48, width: 48 },
  photoDetails: { flex: 1, gap: 3 },
  photoTitle: { color: '#26334d', fontSize: 14, fontWeight: '700' },
  removeButton: { padding: 8 },
  removeText: { color: '#a32d32', fontSize: 12, fontWeight: '700' },
  status: { color: '#3549bd', fontSize: 12 },
  footer: { color: '#778198', fontSize: 11, lineHeight: 16 },
});
