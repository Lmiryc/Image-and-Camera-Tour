const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const root = path.resolve(__dirname, '..');
const reportOnly = process.argv.includes('--report-only');

function parse(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  return parser.parse(source, {
    sourceType: 'module',
    plugins: ['jsx'],
  });
}

function callName(node) {
  if (!node || node.type !== 'CallExpression') return '';
  if (node.callee.type === 'Identifier') return node.callee.name;
  if (node.callee.type === 'MemberExpression' && !node.callee.computed) {
    return node.callee.property.name || '';
  }
  return '';
}

function hasCall(ast, name) {
  let found = false;
  traverse(ast, {
    CallExpression(pathRef) {
      if (callName(pathRef.node) === name) found = true;
    },
  });
  return found;
}

function hasMember(ast, objectName, propertyName) {
  let found = false;
  traverse(ast, {
    MemberExpression(pathRef) {
      const { object, property } = pathRef.node;
      if (object.type === 'Identifier' && object.name === objectName && property.name === propertyName) {
        found = true;
      }
    },
  });
  return found;
}

function hasIdentifier(ast, name) {
  let found = false;
  traverse(ast, {
    Identifier(pathRef) {
      if (pathRef.node.name === name) found = true;
    },
  });
  return found;
}

function hasJsxElement(ast, name) {
  let found = false;
  traverse(ast, {
    JSXOpeningElement(pathRef) {
      if (pathRef.node.name.type === 'JSXIdentifier' && pathRef.node.name.name === name) found = true;
    },
  });
  return found;
}

function hasJsxAttribute(ast, name) {
  let found = false;
  traverse(ast, {
    JSXAttribute(pathRef) {
      if (pathRef.node.name.name === name) found = true;
    },
  });
  return found;
}

function checkProgress() {
  const app = parse('App.js');
  const camera = parse('src/components/CameraPanel.js');
  const service = parse('src/services/photoService.js');
  const photoLibrary = parse('src/services/photoLibrary.native.js');
  const checks = [
    {
      title: 'PART 1: Runnable starter screen and safe-area root',
      complete: hasJsxElement(app, 'SafeAreaProvider')
        && hasJsxElement(app, 'SafeAreaView')
        && hasJsxElement(app, 'FlatList')
        && fs.readFileSync(path.join(root, 'App.js'), 'utf8').includes('Photo Lab'),
      guidance: 'Keep the Photo Lab starter screen useful and wrap SafeAreaView in SafeAreaProvider in App.js.',
    },
    {
      title: 'PART 2: System photo picker handles selection and cancellation',
      complete: hasCall(service, 'launchImageLibraryAsync')
        && hasMember(service, 'result', 'canceled')
        && hasMember(service, 'result', 'assets'),
      guidance: 'In src/services/photoService.js, use launchImageLibraryAsync(), return null when result.canceled, and return the selected asset.',
    },
    {
      title: 'PART 3: Camera permission, preview readiness, and capture',
      complete: hasJsxElement(camera, 'CameraView')
        && hasCall(camera, 'useCameraPermissions')
        && hasJsxAttribute(camera, 'onCameraReady')
        && hasCall(service, 'takePictureAsync'),
      guidance: 'Enable the CameraPanel block, gate it on useCameraPermissions(), wait for onCameraReady, and capture with takePictureAsync().',
    },
    {
      title: 'PART 4: Photos enter and can be removed from the app collection',
      complete: hasCall(app, 'setPhotos') && hasCall(app, 'filter') && hasJsxElement(app, 'FlatList'),
      guidance: 'In App.js, enable the state updates that add picked/captured photos and filter a removed photo out of the collection.',
    },
    {
      title: 'PART 5: Rotate creates a separate edited image',
      complete: hasCall(service, 'manipulate')
        && hasCall(service, 'rotate')
        && hasCall(service, 'renderAsync')
        && hasCall(service, 'saveAsync'),
      guidance: 'In rotatePhoto(), use ImageManipulator.manipulate(), rotate(90), renderAsync(), and saveAsync() to create a copy.',
    },
    {
      title: 'PART 6: Photo is saved with write-only library permission',
      complete: hasCall(photoLibrary, 'requestPermissionsAsync')
        && hasCall(photoLibrary, 'create')
        && hasMember(photoLibrary, 'MediaLibrary', 'Asset'),
      guidance: 'In src/services/photoLibrary.native.js, request write-only photo permission, reject denied access, and create a media-library asset from the URI.',
    },
  ];

  return checks;
}

try {
  const checks = checkProgress();
  const completed = checks.filter(check => check.complete).length;
  console.log('Photo & Camera Tour Progress\n');
  checks.forEach(check => {
    console.log(`${check.complete ? '✓' : '✗'} ${check.title}`);
    if (!check.complete) console.log(`  Next: ${check.guidance}`);
  });
  console.log(`\n${completed} of ${checks.length} parts complete`);
  if (reportOnly && completed !== checks.length) {
    console.log('Report-only mode: incomplete lesson steps do not fail this command.');
  } else if (completed !== checks.length) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error('Progress checker could not parse or inspect the project files.');
  console.error(error.stack || error.message);
  process.exitCode = 2;
}
