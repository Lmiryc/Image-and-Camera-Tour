import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';

// ======================================================
// PART 3 — SHOW THE LIVE CAMERA
//
// WHY: A live preview lets people frame a photo before capturing it.
// PRODUCT QUESTION: When should the app ask for camera access?
// DO: Uncomment the Expo Camera import and component block below.
// VERIFY: Open the camera, grant access, and take a photo on a real device.
// NEXT: Search for "PART 4 — BUILD A PHOTO COLLECTION" in App.js.
// ======================================================
export default function CameraPanel({ onCapture, onClose }) {
  const cameraRef = React.useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = React.useState(false);

  if (!permission) {
    return <Text style={styles.message}>Checking camera permission…</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.panel}>
        <Text style={styles.message}>Photo Lab needs camera access to take a picture.</Text>
        <Pressable accessibilityRole="button" onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant camera access</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <CameraView
        onCameraReady={() => setCameraReady(true)}
        ref={cameraRef}
        style={styles.camera}
      />
      <View style={styles.controls}>
        <Pressable accessibilityRole="button" disabled={!cameraReady} onPress={() => onCapture(cameraRef)} style={styles.button}>
          <Text style={styles.buttonText}>{cameraReady ? 'Capture photo' : 'Preparing camera…'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: '#19233b', borderRadius: 12, gap: 10, overflow: 'hidden', padding: 12 },
  camera: { height: 190, width: '100%' },
  controls: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  message: { color: '#fff', fontSize: 13, lineHeight: 19 },
  button: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10 },
  buttonText: { color: '#26334d', fontSize: 13, fontWeight: '700' },
  close: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8 },
  closeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
