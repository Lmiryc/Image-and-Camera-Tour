import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '../App';
import { capturePhoto, pickPhoto, rotatePhoto, savePhoto } from '../src/services/photoService';

jest.mock('../src/services/photoService', () => ({
  capturePhoto: jest.fn(),
  pickPhoto: jest.fn(),
  rotatePhoto: jest.fn(),
  savePhoto: jest.fn(),
}));

jest.mock('../src/components/CameraPanel', () => {
  const ReactForCamera = require('react');
  const { Pressable, Text, View } = require('react-native');
  return function MockCameraPanel({ onCapture, onClose }) {
    return ReactForCamera.createElement(
      View,
      null,
      ReactForCamera.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress: () => onCapture({ current: {} }) },
        ReactForCamera.createElement(Text, null, 'Capture photo'),
      ),
      ReactForCamera.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress: onClose },
        ReactForCamera.createElement(Text, null, 'Close'),
      ),
    );
  };
});

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

beforeEach(() => {
  pickPhoto.mockResolvedValue({ assetId: 'photo-1', uri: 'file:///picked.jpg' });
  capturePhoto.mockResolvedValue({ uri: 'file:///captured.jpg' });
  rotatePhoto.mockResolvedValue({ uri: 'file:///rotated.jpg' });
  savePhoto.mockResolvedValue({ id: 'saved-photo-1', destination: 'library' });
});

test('shows a useful empty Photo Lab starter screen', async () => {
  const screen = await render(<App />);
  expect(screen.getByText('Photo Lab')).toBeTruthy();
  expect(screen.getByText('Your next photo goes here')).toBeTruthy();
  expect(screen.getByText('0 photos')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Choose a photo' })).toBeTruthy();
});

test('picked photos appear in the collection and can be removed from the app', async () => {
  const screen = await render(<App />);
  await fireEvent.press(screen.getByRole('button', { name: 'Choose a photo' }));

  expect(await screen.findByText('1 photo')).toBeTruthy();
  expect(screen.getByText('Library photo')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Remove library photo' }));
  await waitFor(() => expect(screen.getByText('0 photos')).toBeTruthy());
  expect(screen.getByText('Photo removed from this collection. The device original is unchanged.')).toBeTruthy();
});

test('cancelling the system picker leaves the collection unchanged', async () => {
  pickPhoto.mockResolvedValueOnce(null);
  const screen = await render(<App />);
  await fireEvent.press(screen.getByRole('button', { name: 'Choose a photo' }));

  expect(await screen.findByText('Photo selection canceled.')).toBeTruthy();
  expect(screen.getByText('0 photos')).toBeTruthy();
});

test('captured photos can be rotated, reset, and saved to Photos', async () => {
  const screen = await render(<App />);
  await fireEvent.press(screen.getByRole('button', { name: 'Open camera' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Capture photo' }));

  expect(await screen.findByText('1 photo')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Rotate 90°' }));
  await waitFor(() => expect(rotatePhoto).toHaveBeenCalledWith('file:///captured.jpg'));
  expect(screen.getByLabelText('Selected photo preview').props.source.uri).toBe('file:///rotated.jpg');

  await fireEvent.press(screen.getByRole('button', { name: 'Reset' }));
  expect(screen.getByLabelText('Selected photo preview').props.source.uri).toBe('file:///captured.jpg');
  await fireEvent.press(screen.getByRole('button', { name: 'Save to Photos' }));
  await waitFor(() => expect(savePhoto).toHaveBeenCalledWith('file:///captured.jpg'));
  expect(await screen.findByText('Saved a copy to your photo library.')).toBeTruthy();
});

test('reports a download when the browser save implementation is used', async () => {
  savePhoto.mockResolvedValueOnce({ uri: 'data:image/jpeg;base64,photo-data', destination: 'download' });
  const screen = await render(<App />);
  await fireEvent.press(screen.getByRole('button', { name: 'Choose a photo' }));
  expect(await screen.findByText('1 photo')).toBeTruthy();

  await fireEvent.press(screen.getByRole('button', { name: 'Save to Photos' }));
  expect(await screen.findByText('Downloaded a photo copy.')).toBeTruthy();
});
