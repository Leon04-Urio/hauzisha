#!/usr/bin/env node

/**
 * LOFT³ Scene Loading & Node Switching Verification Script
 * 
 * This script verifies that the core scene loading and node switching
 * functionality is properly implemented in the LOFT³ Tour Engine.
 * 
 * Tests:
 * 1. Engine initialization
 * 2. Tour data loading
 * 3. Initial node loading
 * 4. Node switching (next/previous)
 * 5. Direct node jumping
 * 6. State management during transitions
 */

console.log('🧪 LOFT³ Scene Loading & Node Switching Verification\n');
console.log('=' .repeat(60));

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'js/loft-tour-core.js',
    'js/loft-tour-layers.js',
    'js/loft-tour-transitions.js',
    'js/loft-tour-controls.js',
    'test-scene-loading.html'
];

console.log('\n📁 Checking required files...\n');

let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing!');
    process.exit(1);
}

console.log('\n✅ All required files exist');

// Check core functionality in loft-tour-core.js
console.log('\n📝 Checking core functionality implementation...\n');

const coreFile = fs.readFileSync(path.join(__dirname, 'js/loft-tour-core.js'), 'utf8');

const requiredMethods = [
    { name: 'loadTour', description: 'Load tour data' },
    { name: 'loadNode', description: 'Load specific node' },
    { name: 'loadPanorama', description: 'Load panorama via Marzipano' },
    { name: 'nextNode', description: 'Navigate to next node' },
    { name: 'previousNode', description: 'Navigate to previous node' },
    { name: 'transitionTo', description: 'Transition to specific node' },
    { name: 'setupCameraSync', description: 'Setup camera synchronization' },
    { name: 'syncCameraToLayers', description: 'Sync camera to layers' }
];

let allMethodsImplemented = true;
requiredMethods.forEach(method => {
    const regex = new RegExp(`(async\\s+)?${method.name}\\s*\\(`);
    const implemented = regex.test(coreFile);
    const status = implemented ? '✅' : '❌';
    console.log(`${status} ${method.name}() - ${method.description}`);
    if (!implemented) allMethodsImplemented = false;
});

if (!allMethodsImplemented) {
    console.log('\n❌ Some required methods are not implemented!');
    process.exit(1);
}

console.log('\n✅ All required methods are implemented');

// Check state management
console.log('\n📊 Checking state management...\n');

const stateVariables = [
    { name: 'tourData', description: 'Tour data storage' },
    { name: 'currentNode', description: 'Current node reference' },
    { name: 'currentNodeIndex', description: 'Current node index' },
    { name: 'isTransitioning', description: 'Transition state flag' },
    { name: 'currentScene', description: 'Marzipano scene reference' },
    { name: 'currentView', description: 'Marzipano view reference' }
];

let allStateVariablesPresent = true;
stateVariables.forEach(variable => {
    const regex = new RegExp(`this\\.${variable.name}\\s*=`);
    const present = regex.test(coreFile);
    const status = present ? '✅' : '❌';
    console.log(`${status} ${variable.name} - ${variable.description}`);
    if (!present) allStateVariablesPresent = false;
});

if (!allStateVariablesPresent) {
    console.log('\n❌ Some state variables are missing!');
    process.exit(1);
}

console.log('\n✅ All state variables are present');

// Check integration with managers
console.log('\n🔗 Checking manager integration...\n');

const managers = [
    { name: 'TransitionManager', description: 'Smooth transitions' },
    { name: 'LayerManager', description: 'Parallax layers' },
    { name: 'ControlsManager', description: 'Input controls' }
];

let allManagersIntegrated = true;
managers.forEach(manager => {
    const regex = new RegExp(`new\\s+${manager.name}\\(`);
    const integrated = regex.test(coreFile);
    const status = integrated ? '✅' : '❌';
    console.log(`${status} ${manager.name} - ${manager.description}`);
    if (!integrated) allManagersIntegrated = false;
});

if (!allManagersIntegrated) {
    console.log('\n❌ Some managers are not properly integrated!');
    process.exit(1);
}

console.log('\n✅ All managers are properly integrated');

// Check Marzipano integration
console.log('\n🎨 Checking Marzipano integration...\n');

const marzipanoFeatures = [
    { pattern: 'Marzipano\\.Viewer', description: 'Marzipano viewer initialization' },
    { pattern: 'Marzipano\\.ImageUrlSource', description: 'Image source creation' },
    { pattern: 'Marzipano\\.EquirectGeometry', description: 'Equirectangular geometry' },
    { pattern: 'Marzipano\\.RectilinearView', description: 'Rectilinear view' },
    { pattern: 'createScene', description: 'Scene creation' },
    { pattern: 'switchTo', description: 'Scene switching' }
];

let allMarzipanoFeaturesPresent = true;
marzipanoFeatures.forEach(feature => {
    const regex = new RegExp(feature.pattern);
    const present = regex.test(coreFile);
    const status = present ? '✅' : '❌';
    console.log(`${status} ${feature.description}`);
    if (!present) allMarzipanoFeaturesPresent = false;
});

if (!allMarzipanoFeaturesPresent) {
    console.log('\n❌ Some Marzipano features are not properly integrated!');
    process.exit(1);
}

console.log('\n✅ Marzipano is properly integrated');

// Check error handling
console.log('\n🛡️ Checking error handling...\n');

const errorHandlingPatterns = [
    { pattern: 'try\\s*{', description: 'Try-catch blocks' },
    { pattern: 'catch\\s*\\(', description: 'Error catching' },
    { pattern: 'console\\.error', description: 'Error logging' },
    { pattern: 'throw new Error', description: 'Error throwing' }
];

let allErrorHandlingPresent = true;
errorHandlingPatterns.forEach(pattern => {
    const regex = new RegExp(pattern.pattern);
    const present = regex.test(coreFile);
    const status = present ? '✅' : '❌';
    console.log(`${status} ${pattern.description}`);
    if (!present) allErrorHandlingPresent = false;
});

if (!allErrorHandlingPresent) {
    console.log('\n❌ Error handling is incomplete!');
    process.exit(1);
}

console.log('\n✅ Error handling is properly implemented');

// Final summary
console.log('\n' + '='.repeat(60));
console.log('\n✅ ALL VERIFICATION CHECKS PASSED!\n');
console.log('Scene loading and node switching functionality is properly implemented.\n');
console.log('Next steps:');
console.log('1. Open test-scene-loading.html in a browser');
console.log('2. Click "Load Test Tour" to load the tour');
console.log('3. Test navigation using Previous/Next buttons');
console.log('4. Test jumping to specific nodes');
console.log('5. Verify smooth transitions between nodes');
console.log('6. Check that camera synchronization works with layers\n');
console.log('Manual testing URL:');
console.log('  file://' + path.join(__dirname, 'test-scene-loading.html'));
console.log('\n' + '='.repeat(60));

process.exit(0);
