const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');

test('starter has ignored local env config, documented placeholders, and verification commands', () => {
  const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  expect(gitignore.split(/\r?\n/)).toContain('.env');
  expect(envExample).toContain('EXPO_PUBLIC_FIREBASE_API_KEY=');
  expect(envExample).toContain('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=');
  expect(packageJson.scripts['check-progress:report']).toBeDefined();
  expect(packageJson.scripts['test:infrastructure']).toBeDefined();
  expect(packageJson.scripts.verify).toContain('check-progress');
});

test('progress checker parses starter source and reports each searchable lesson part', () => {
  const output = execFileSync(process.execPath, ['scripts/check-progress.js', '--report-only'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(output).toContain('Photo & Camera Tour Progress');
  expect(output).toContain('PART 2: System photo picker handles selection and cancellation');
  expect(output).toContain('PART 6: Photo is saved with write-only library permission');
  expect(output).toMatch(/\d of 6 parts complete/);
});

test('main-branch CI reports progress and runs starter infrastructure checks', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/test.yml'), 'utf8');
  expect(workflow).toContain('check-progress:report');
  expect(workflow).toContain('test:infrastructure');
  expect(workflow).toContain('npm run verify');
});

test('shared and web photo services do not import the native media-library module', () => {
  const sharedService = fs.readFileSync(path.join(root, 'src/services/photoService.js'), 'utf8');
  const webService = fs.readFileSync(path.join(root, 'src/services/photoLibrary.web.js'), 'utf8');
  expect(sharedService).not.toMatch(/import\s+.*from\s+['"]expo-media-library['"]/);
  expect(webService).not.toMatch(/import\s+.*from\s+['"]expo-media-library['"]/);
});
