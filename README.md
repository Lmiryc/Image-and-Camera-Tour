# Photo & Camera Tour

A small Expo + React Native project for learning the camera, photo picker, image manipulation, and device photo-library basics. The app is a single screen with local React state and a few small photo-service functions.

## Instructor and student guide

### Starter and completion

- `main` is the student starter. It launches a useful Photo Lab screen, keeps every lesson syntactically valid, and marks unfinished behavior with searchable parts and clear TODO stubs. Feature tests intentionally fail until the matching code is enabled. `npm run check-progress:report` reports unfinished parts but exits successfully for starter CI; `npm run check-progress` exits nonzero until all six parts are complete.
- The GitHub Action reports progress and runs infrastructure-only tests on `main`. On `complete` it runs full verification; on other branches it runs full verification so student work receives red-to-green feedback.
- Full local verification is `npm run verify`. It runs the progress checker, lint, typecheck, and mocked test suite. Run `npm test` after each lesson to see which feature behaviors remain.

The starter deliberately has unfinished behavior. A `main` CI pass means its structure and progress reporting work, not that the tour is complete. Full completion is confirmed when `npm run verify` passes locally or on a student/reference branch.

## Setup

```sh
npm install
npm start
```

Use a physical iOS or Android device for camera capture. The iOS Simulator has no camera. The Expo SDK 57 versions of `expo-camera`, `expo-image-picker`, `expo-image-manipulator`, and `expo-media-library` are installed in the starter; they are included in Expo Go. Use `npx expo install` if you add or change Expo SDK modules.

No `.env` file, API key, endpoint, Firebase project, or network connection is needed for the local tour. `.env.example` contains placeholders for a possible future Firebase Storage extension only. Copy it to `.env` only if you are experimenting with that extension. `EXPO_PUBLIC_*` settings are embedded in the client app and are not secrets; never put a private server key in them.

## The tour

Complete **Parts 1–6 in order**. Search for the exact `PART N — ...` heading. Every part includes why the concept matters, a product question, exact file and code-block instructions, a quick verification, and the next heading. If a DO instruction says to uncomment a block, remove its opening `/*` and closing `*/` markers together; do not uncomment unrelated parts early.

After each part, run:

```sh
npm run check-progress
npm test
```

The progress checker parses active JavaScript with Babel. It ignores commented code, so a lesson only counts after the behavior is enabled.

### PART 1 — PHOTO LAB STARTER

- **WHY:** A useful static starting screen gives us a known-good app before adding device APIs.
- **PRODUCT QUESTION:** What should a photo journal show before a person has added their first picture?
- **DO:** Open `App.js`. Confirm `SafeAreaProvider` wraps `SafeAreaView`, and the collection uses a `FlatList` as its vertical scrolling container.
- **VERIFY:** Run `npm start`; the Photo Lab screen and empty collection should appear.
- **NEXT:** Search for `PART 2 — PICK A PHOTO` in `src/services/photoService.js`.

### PART 2 — PICK A PHOTO

- **WHY:** The system picker gives the person control over which photo the app receives.
- **PRODUCT QUESTION:** Does this screen need to read every photo on the device, or just the one selected?
- **DO:** In `src/services/photoService.js`, remove the `/*` and `*/` markers around the Part 2 `ImagePicker` import and the Part 2 implementation inside `pickPhoto()`. Keep the other service imports and functions commented/stubbed.
- **VERIFY:** Choose a photo, then open the picker again and cancel. The app should remain usable.
- **NEXT:** Search for `PART 3 — SHOW THE LIVE CAMERA` in `src/components/CameraPanel.js`.

### PART 3 — SHOW THE LIVE CAMERA

- **WHY:** A live preview lets people frame a photo before capture; camera permission belongs at the moment the feature is used.
- **PRODUCT QUESTION:** Should the shutter work before the preview is ready?
- **DO:** In `src/components/CameraPanel.js`, remove the comment markers around the Expo Camera import and the component block. In `src/services/photoService.js`, uncomment the Part 3 implementation in `capturePhoto()`.
- **VERIFY:** On a physical device, grant camera permission, wait for the preview, and capture. The screen should report the temporary cache capture.
- **NEXT:** Search for `PART 4 — BUILD A PHOTO COLLECTION` in `App.js`.

### PART 4 — BUILD A PHOTO COLLECTION

- **WHY:** The app can display and manage selected images without treating the device’s original library as its own database.
- **PRODUCT QUESTION:** Should removing a card from this screen delete the device’s original photo?
- **DO:** In `App.js`, uncomment both add blocks in `importPhoto()` and `captureFromCamera()`, and the removal block in `removePhoto()`. Remove the marked Part 4 starter-status line from `removePhoto()` after enabling the removal block.
- **VERIFY:** Add one library photo and one camera photo; remove one card and confirm the other remains. This collection is session-only, and removal only affects this app.
- **NEXT:** Search for `PART 5 — ROTATE A COPY` in `src/services/photoService.js`.

### PART 5 — ROTATE A COPY

- **WHY:** A transformation should create an edited result without destroying the source image.
- **PRODUCT QUESTION:** Should Reset restore the original, even after an edit?
- **DO:** In `src/services/photoService.js`, uncomment the Part 5 `ImageManipulator` import and the implementation in `rotatePhoto()`.
- **VERIFY:** Select a photo, rotate it, then Reset. The preview should return to the original URI.
- **NEXT:** Search for `PART 6 — SAVE TO THE DEVICE PHOTO LIBRARY` in `src/services/photoService.js`.

### PART 6 — SAVE TO THE DEVICE PHOTO LIBRARY

- **WHY:** Camera and image-manipulator results can be temporary cache files; a system-library copy is a way to keep a photo beyond the app session.
- **PRODUCT QUESTION:** Which permission is needed to save a photo without browsing the person’s full library?
- **DO:** In `src/services/photoService.js`, uncomment the Part 6 `MediaLibrary` import and the implementation in `savePhoto()`. The code requests write-only photo access.
- **VERIFY:** Save an image and confirm it appears in Photos/Gallery. Deny permission once and confirm the app displays an error.
- **NEXT:** Run `npm run verify` and review the privacy notes below.

The URI returned from a camera capture or image transform may refer to a temporary cache file. Saving through MediaLibrary creates a copy in the system photo library. The app does not delete originals from the device.

## Testing and progress

Tests mock Expo services. They make no network calls, do not require device permissions or `.env`, and never write to a real photo library. Coverage includes picker cancellation, camera readiness/capture, adding/removing photos, rotate/reset behavior, write-only save permission, and progress/infrastructure checks.

On the starter branch, use:

```sh
npm run check-progress:report
npm run test:infrastructure
```

After completing the tour, use `npm run verify`. The feature tests are expected to name missing behavior while lessons are unfinished; import and test setup failures are not expected.

## Optional future extension: Firebase Storage

Cloud upload is intentionally outside the core lessons. A safe extension should use Firebase Authentication and Storage Security Rules that scope each user's uploads to their UID. Firebase’s Web SDK uses project configuration rather than a separate endpoint setting. Client Firebase API keys are configuration, not secrets; private service-account credentials must stay on a server. Keep network calls mocked in the unit suite.

## Expo references (SDK 57)

- [Camera](https://docs.expo.dev/versions/v57.0.0/sdk/camera.md)
- [ImagePicker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker.md)
- [ImageManipulator](https://docs.expo.dev/versions/v57.0.0/sdk/imagemanipulator.md)
- [MediaLibrary](https://docs.expo.dev/versions/v57.0.0/sdk/media-library.md)
