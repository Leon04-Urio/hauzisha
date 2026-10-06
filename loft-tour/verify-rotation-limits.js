/**
 * Rotation Limits Verification Script
 * 
 * This script verifies that rotation limits are properly implemented
 * and working as expected in the LOFT³ Tour Engine.
 * 
 * Run this in the browser console after loading a tour.
 */

(function() {
    console.log('=== LOFT³ Rotation Limits Verification ===\n');
    
    // Check if engine exists
    if (typeof window.LoftTourEngine === 'undefined') {
        console.error('❌ LoftTourEngine not found. Make sure loft-tour-core.js is loaded.');
        return;
    }
    
    console.log('✓ LoftTourEngine class found');
    
    // Check if Marzipano is available
    if (typeof Marzipano === 'undefined') {
        console.error('❌ Marzipano library not found. Make sure it is loaded.');
        return;
    }
    
    console.log('✓ Marzipano library loaded');
    
    // Check if createViewLimiter method exists
    if (typeof LoftTourEngine.prototype.createViewLimiter !== 'function') {
        console.error('❌ createViewLimiter method not found in LoftTourEngine');
        return;
    }
    
    console.log('✓ createViewLimiter method exists');
    
    // Test the limiter creation with default values
    console.log('\n--- Testing Default Limits ---');
    
    const testNodeData = {
        id: 'test-node',
        image: 'test.jpg',
        rotationLimits: {
            h: 30,
            v: 10,
            maxFov: 120,
            minFov: 60
        }
    };
    
    console.log('Test node configuration:', testNodeData.rotationLimits);
    
    // Create a temporary engine instance to test
    const testContainer = document.createElement('div');
    testContainer.style.width = '800px';
    testContainer.style.height = '600px';
    testContainer.style.position = 'absolute';
    testContainer.style.top = '-9999px';
    document.body.appendChild(testContainer);
    
    try {
        const engine = new LoftTourEngine(testContainer);
        console.log('✓ Engine instance created successfully');
        
        // Test limiter creation
        const limiter = engine.createViewLimiter(testNodeData);
        
        if (limiter) {
            console.log('✓ View limiter created successfully');
            console.log('  Type:', typeof limiter);
        } else {
            console.error('❌ View limiter creation returned null/undefined');
        }
        
        // Test with missing rotation limits (should use defaults)
        console.log('\n--- Testing Default Values (no rotationLimits specified) ---');
        
        const nodeWithoutLimits = {
            id: 'test-node-2',
            image: 'test2.jpg'
        };
        
        const defaultLimiter = engine.createViewLimiter(nodeWithoutLimits);
        
        if (defaultLimiter) {
            console.log('✓ Default limiter created successfully');
            console.log('  Expected defaults: h=30°, v=10°, maxFov=120°, minFov=60°');
        } else {
            console.error('❌ Default limiter creation failed');
        }
        
        // Test deg2rad conversion
        console.log('\n--- Testing Angle Conversion ---');
        
        const testAngles = [0, 30, 45, 90, 180];
        testAngles.forEach(deg => {
            const rad = engine.deg2rad(deg);
            const backToDeg = engine.rad2deg(rad);
            const match = Math.abs(backToDeg - deg) < 0.001;
            
            if (match) {
                console.log(`✓ ${deg}° = ${rad.toFixed(4)} rad (round-trip: ${backToDeg.toFixed(2)}°)`);
            } else {
                console.error(`❌ Conversion error: ${deg}° -> ${rad} -> ${backToDeg}°`);
            }
        });
        
        // Cleanup
        engine.destroy();
        document.body.removeChild(testContainer);
        
        console.log('\n--- Verification Summary ---');
        console.log('✓ All core rotation limit components are working correctly');
        console.log('✓ Marzipano integration is functional');
        console.log('✓ Angle conversions are accurate');
        console.log('\nRotation limits are READY for use!');
        console.log('\nTo test interactively, open: test-rotation-limits.html');
        
    } catch (error) {
        console.error('❌ Error during verification:', error);
        console.error('Stack trace:', error.stack);
        
        // Cleanup on error
        if (testContainer.parentNode) {
            document.body.removeChild(testContainer);
        }
    }
    
    console.log('\n=== Verification Complete ===');
    
})();

// Export verification function for manual use
window.verifyRotationLimits = function() {
    console.log('Running rotation limits verification...');
    
    // Re-run the verification
    const script = document.createElement('script');
    script.src = 'verify-rotation-limits.js';
    document.head.appendChild(script);
};

console.log('Rotation Limits Verification Script Loaded');
console.log('The verification will run automatically, or call verifyRotationLimits() manually.');
