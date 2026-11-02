jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(),
  Asset: { create: jest.fn() },
}));

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { capturePhoto, pickPhoto, rotatePhoto, savePhoto } from '../src/services/photoService';

beforeEach(() => {
  ImagePicker.launchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [{ assetId: 'library-1', uri: 'file:///library-photo.jpg' }],
  });
  MediaLibrary.requestPermissionsAsync.mockResolvedValue({ granted: true });
  MediaLibrary.Asset.create.mockResolvedValue({ id: 'saved-1' });
});

test('photo picker returns the chosen asset and treats cancel as no selection', async () => {
  await expect(pickPhoto()).resolves.toEqual({ assetId: 'library-1', uri: 'file:///library-photo.jpg' });
  expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({ mediaTypes: ['images'], quality: 1 });

  ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true, assets: null });
  await expect(pickPhoto()).resolves.toBeNull();
});

test('capture waits for and captures from the mounted camera ref', async () => {
  const capture = jest.fn().mockResolvedValue({ uri: 'file:///camera-photo.jpg' });
  await expect(capturePhoto({ current: { takePictureAsync: capture } }))
    .resolves.toEqual({ uri: 'file:///camera-photo.jpg' });
  expect(capture).toHaveBeenCalledWith({ quality: 0.85 });
  await expect(capturePhoto(null)).rejects.toThrow('Wait for the camera preview');
});

test('rotation runs the new ImageManipulator context API and saves a copy', async () => {
  const rendered = { saveAsync: jest.fn().mockResolvedValue({ uri: 'file:///rotated.jpg' }) };
  const context = { rotate: jest.fn(), renderAsync: jest.fn().mockResolvedValue(rendered) };
  ImageManipulator.ImageManipulator.manipulate.mockReturnValue(context);

  await expect(rotatePhoto('file:///original.jpg')).resolves.toEqual({ uri: 'file:///rotated.jpg' });
  expect(ImageManipulator.ImageManipulator.manipulate).toHaveBeenCalledWith('file:///original.jpg');
  expect(context.rotate).toHaveBeenCalledWith(90);
  expect(rendered.saveAsync).toHaveBeenCalledWith({ compress: 0.85, format: 'jpeg' });
});

test('saving requests write-only photo access and creates an asset', async () => {
  await expect(savePhoto('file:///photo.jpg')).resolves.toEqual({ id: 'saved-1' });
  expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith(true, ['photo']);
  expect(MediaLibrary.Asset.create).toHaveBeenCalledWith('file:///photo.jpg');

  MediaLibrary.requestPermissionsAsync.mockResolvedValueOnce({ granted: false });
  await expect(savePhoto('file:///private.jpg')).rejects.toThrow('Allow photo saving');
  expect(MediaLibrary.Asset.create).toHaveBeenCalledTimes(1);
});
