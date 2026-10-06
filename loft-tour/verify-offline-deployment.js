/**
 * LOFT³ Offline Deployment Verification Script
 * Tests the offline packaging functionality programmatically
 */

// Mock tour data for testing
const mockTourData = {
    tour_id: 'test-tour-001',
    tour_name: 'Test Virtual Tour',
    description: 'A test tour for offline packaging verification',
    property_name: 'Test Property',
    nodes: [
        {
            node_id: 'entrance',
            label: 'Main Entrance',
            panorama_url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==',
            next_node: 'living-room',
            layers: [
                {
                    layer_id: 'welcome-sign',
                    name: 'Welcome Sign',
                    image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA4nEKtAAAAABJRU5ErkJggg==',
                    position: { x: 0.5, y: 0.3 },
                    parallax_factor: 0.5,
                    scale: 1.0
                }
            ]
        },
        {
            node_id: 'living-room',
            label: 'Living Room',
            panorama_url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==',
            next_node: 'balcony',
            layers: []
        },
        {
            node_id: 'balcony',
            label: 'Balcony View',
            panorama_url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==',
            next_node: null,
            layers: [
                {
                    layer_id: 'city-view',
                    name: 'City View Overlay',
                    image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA4nEKtAAAAABJRU5ErkJggg==',
                    position: { x: 0.7, y: 0.4 },
                    parallax_factor: 0.8,
                    scale: 1.2
                }
            ]
        }
    ]
};

// Test results
let testResults = {
    componentLoading: false,
    packageCreation: false,
    standalonePackage: false,
    embedPackage: false,
    templateGeneration: false,
    assetCollection: false
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Test 1: Component Loading
function testComponentLoading() {
    log('Testing component loading...');
    
    const requiredComponents = [
        'LoftTourOfflinePackager',
        'LoftTourExportUI'
    ];
    
    const missingComponents = [];
    
    requiredComponents.forEach(component => {
        if (typeof window[component] === 'undefined') {
            missingComponents.push(component);
        }
    });
    
    if (missingComponents.length > 0) {
        log(`Missing components: ${missingComponents.join(', ')}`, 'error');
        return false;
    }
    
    log('All required components loaded successfully', 'success');
    testResults.componentLoading = true;
    return true;
}

// Test 2: Package Creation
async function testPackageCreation() {
    log('Testing package creation...');
    
    try {
        const packager = new LoftTourOfflinePackager();
        
        const result = await packager.createPackage({
            tourData: mockTourData,
            packageType: 'both',
            bundleSize: 'standard',
            includeAnalytics: false,
            optimizeImages: true,
            includeReadme: true,
            filename: 'verification-test-tour'
        });
        
        if (!result.success) {
            throw new Error('Package creation returned unsuccessful result');
        }
        
        if (!result.packages || !result.bundle) {
            throw new Error('Package creation returned incomplete result');
        }
        
        log(`Package creation successful - ${Object.keys(result.packages).length} packages, ${formatFileSize(result.bundle.totalSize)}`, 'success');
        testResults.packageCreation = true;
        return result;
        
    } catch (error) {
        log(`Package creation failed: ${error.message}`, 'error');
        return false;
    }
}

// Test 3: Standalone Package
async function testStandalonePackage() {
    log('Testing standalone package creation...');
    
    try {
        const packager = new LoftTourOfflinePackager();
        
        const result = await packager.createPackage({
            tourData: mockTourData,
            includeStandalone: true,
            includeEmbed: false,
            bundleSize: 'standard',
            includeAnalytics: false,
            optimizeImages: true,
            includeReadme: true,
            filename: 'standalone-test-tour'
        });
        
        if (!result.success || !result.packages.standalone) {
            throw new Error('Standalone package creation failed');
        }
        
        const standalonePackage = result.packages.standalone;
        
        // Validate standalone package structure
        if (!standalonePackage.filename || !standalonePackage.content || !standalonePackage.size) {
            throw new Error('Standalone package missing required properties');
        }
        
        // Check if content contains required elements
        const content = standalonePackage.content;
        const requiredElements = [
            '<!DOCTYPE html>',
            'LOFT_TOUR_DATA',
            'LOFT_TOUR_CONFIG',
            'viewer-canvas-container',
            'tour-controls'
        ];
        
        const missingElements = requiredElements.filter(element => !content.includes(element));
        
        if (missingElements.length > 0) {
            throw new Error(`Standalone package missing elements: ${missingElements.join(', ')}`);
        }
        
        log(`Standalone package created successfully - ${standalonePackage.filename}, ${formatFileSize(standalonePackage.size)}`, 'success');
        testResults.standalonePackage = true;
        return true;
        
    } catch (error) {
        log(`Standalone package test failed: ${error.message}`, 'error');
        return false;
    }
}

// Test 4: Embed Package
async function testEmbedPackage() {
    log('Testing embed package creation...');
    
    try {
        const packager = new LoftTourOfflinePackager();
        
        const result = await packager.createPackage({
            tourData: mockTourData,
            includeStandalone: false,
            includeEmbed: true,
            bundleSize: 'minimal',
            includeAnalytics: false,
            optimizeImages: true,
            includeReadme: false,
            filename: 'embed-test-tour'
        });
        
        if (!result.success || !result.packages.embed) {
            throw new Error('Embed package creation failed');
        }
        
        const embedPackage = result.packages.embed;
        
        // Validate embed package structure
        if (!embedPackage.filename || !embedPackage.content || !embedPackage.size) {
            throw new Error('Embed package missing required properties');
        }
        
        // Check if content contains required elements for embed
        const content = embedPackage.content;
        const requiredElements = [
            '<!DOCTYPE html>',
            'LOFT_TOUR_DATA',
            'LOFT_TOUR_CONFIG',
            'loft-tour-embed',
            'embed-viewer'
        ];
        
        const missingElements = requiredElements.filter(element => !content.includes(element));
        
        if (missingElements.length > 0) {
            throw new Error(`Embed package missing elements: ${missingElements.join(', ')}`);
        }
        
        log(`Embed package created successfully - ${embedPackage.filename}, ${formatFileSize(embedPackage.size)}`, 'success');
        testResults.embedPackage = true;
        return true;
        
    } catch (error) {
        log(`Embed package test failed: ${error.message}`, 'error');
        return false;
    }
}

// Test 5: Template Generation
function testTemplateGeneration() {
    log('Testing template generation...');
    
    try {
        const packager = new LoftTourOfflinePackager();
        
        // Test standalone template
        const standaloneTemplate = packager.getStandaloneTemplate();
        if (!standaloneTemplate || typeof standaloneTemplate !== 'string') {
            throw new Error('Standalone template generation failed');
        }
        
        // Check for template variables
        const standaloneVariables = [
            '{{TOUR_TITLE}}',
            '{{TOUR_DESCRIPTION}}',
            '{{EMBEDDED_CSS}}',
            '{{EMBEDDED_JS}}',
            '{{TOUR_DATA}}',
            '{{TOUR_CONFIG}}'
        ];
        
        const missingStandaloneVars = standaloneVariables.filter(variable => !standaloneTemplate.includes(variable));
        
        if (missingStandaloneVars.length > 0) {
            throw new Error(`Standalone template missing variables: ${missingStandaloneVars.join(', ')}`);
        }
        
        // Test embed template
        const embedTemplate = packager.getEmbedTemplate();
        if (!embedTemplate || typeof embedTemplate !== 'string') {
            throw new Error('Embed template generation failed');
        }
        
        // Check for template variables
        const embedVariables = [
            '{{TOUR_TITLE}}',
            '{{EMBEDDED_CSS}}',
            '{{EMBEDDED_JS}}',
            '{{TOUR_DATA}}',
            '{{TOUR_CONFIG}}'
        ];
        
        const missingEmbedVars = embedVariables.filter(variable => !embedTemplate.includes(variable));
        
        if (missingEmbedVars.length > 0) {
            throw new Error(`Embed template missing variables: ${missingEmbedVars.join(', ')}`);
        }
        
        log('Template generation successful', 'success');
        testResults.templateGeneration = true;
        return true;
        
    } catch (error) {
        log(`Template generation test failed: ${error.message}`, 'error');
        return false;
    }
}

// Test 6: Asset Collection
async function testAssetCollection() {
    log('Testing asset collection...');
    
    try {
        const packager = new LoftTourOfflinePackager();
        
        // Set tour data
        packager.packageData.tourData = mockTourData;
        packager.packageData.config = {
            bundleSize: 'standard',
            includeAnalytics: false
        };
        
        // Test asset collection
        await packager.collectAssets();
        
        const assets = packager.packageData.assets;
        
        // Validate asset structure
        if (!assets.css || !Array.isArray(assets.css)) {
            throw new Error('CSS assets not collected properly');
        }
        
        if (!assets.js || !Array.isArray(assets.js)) {
            throw new Error('JavaScript assets not collected properly');
        }
        
        if (!assets.images || !Array.isArray(assets.images)) {
            throw new Error('Image assets not collected properly');
        }
        
        // Check if images were converted to base64
        const imageAssets = assets.images;
        if (imageAssets.length > 0) {
            const hasBase64 = imageAssets.some(img => img.base64 && img.base64.startsWith('data:'));
            if (!hasBase64) {
                log('Warning: No base64 image data found', 'warning');
            }
        }
        
        log(`Asset collection successful - CSS: ${assets.css.length}, JS: ${assets.js.length}, Images: ${assets.images.length}`, 'success');
        testResults.assetCollection = true;
        return true;
        
    } catch (error) {
        log(`Asset collection test failed: ${error.message}`, 'error');
        return false;
    }
}

// Run all tests
async function runAllTests() {
    log('Starting offline deployment verification tests...');
    
    const tests = [
        { name: 'Component Loading', fn: testComponentLoading },
        { name: 'Template Generation', fn: testTemplateGeneration },
        { name: 'Asset Collection', fn: testAssetCollection },
        { name: 'Package Creation', fn: testPackageCreation },
        { name: 'Standalone Package', fn: testStandalonePackage },
        { name: 'Embed Package', fn: testEmbedPackage }
    ];
    
    let passedTests = 0;
    let failedTests = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passedTests++;
            } else {
                failedTests++;
            }
        } catch (error) {
            log(`Test ${test.name} threw an error: ${error.message}`, 'error');
            failedTests++;
        }
    }
    
    log('='.repeat(60));
    log(`Verification complete: ${passedTests} passed, ${failedTests} failed`);
    
    if (failedTests === 0) {
        log('All tests passed! Offline deployment functionality is working correctly.', 'success');
    } else {
        log(`${failedTests} tests failed. Please check the implementation.`, 'error');
    }
    
    log('Test Results Summary:');
    Object.entries(testResults).forEach(([test, passed]) => {
        log(`  ${test}: ${passed ? 'PASS' : 'FAIL'}`, passed ? 'success' : 'error');
    });
    
    return failedTests === 0;
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testComponentLoading,
        testPackageCreation,
        testStandalonePackage,
        testEmbedPackage,
        testTemplateGeneration,
        testAssetCollection,
        mockTourData
    };
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined') {
    // Wait for DOM and other scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runAllTests, 2000);
        });
    } else {
        setTimeout(runAllTests, 2000);
    }
}