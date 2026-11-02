import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
import CameraPanel from '../src/components/CameraPanel';

jest.mock('expo-camera', () => {
  const ReactForCamera = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    CameraView: ReactForCamera.forwardRef(({ onCameraReady }, ref) => {
      ReactForCamera.useImperativeHandle(ref, () => ({ takePictureAsync: jest.fn() }), []);
      return ReactForCamera.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress: onCameraReady },
        ReactForCamera.createElement(Text, null, 'Camera preview'),
      );
    }),
    useCameraPermissions: jest.fn(),
  };
});

beforeEach(() => {
  useCameraPermissions.mockReset();
});

test('asks for camera permission when access has not been granted', async () => {
  const requestPermission = jest.fn();
  useCameraPermissions.mockReturnValue([{ granted: false }, requestPermission]);
  const screen = await render(<CameraPanel onCapture={jest.fn()} onClose={jest.fn()} />);

  await fireEvent.press(screen.getByRole('button', { name: 'Grant camera access' }));
  expect(requestPermission).toHaveBeenCalledTimes(1);
});

test('does not offer capture until the camera preview is ready', async () => {
  useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
  const onCapture = jest.fn();
  const screen = await render(<CameraPanel onCapture={onCapture} onClose={jest.fn()} />);
  const captureButton = screen.getByRole('button', { name: 'Preparing camera…' });
  expect(captureButton.props.accessibilityState.disabled).toBe(true);

  await fireEvent.press(screen.getByRole('button', { name: 'Camera preview' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Capture photo' }));
  expect(onCapture).toHaveBeenCalledWith(expect.objectContaining({ current: expect.anything() }));
});
