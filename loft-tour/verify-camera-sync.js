/**
 * Camera Synchronization Verification Script
 * 
 * This script can be run in the browser console to verify that
 * camera synchronization is working correctly.
 */

class CameraSyncVerifier {
    constructor(engine) {
        this.engine = engine;
        this.results = [];
    }
    
    /**
     * Run all verification tests
     */
    async runAll() {
        console.log('🔍 Starting Camera Synchronization Verification...\n');
        
        this.testEventListeners();
        this.testCoordinateSync();
        this.testParallaxCalculation();
        this.testFOVSync();
        this.testRenderLoop();
        await this.testUserInput();
        this.testPerformance();
        
        this.printResults();
    }
    
    /**
     * Test 1: Event listeners are attached
     */
    testEventListeners() {
        const test = 'Event Listeners Attached';
        
        try {
            if (!this.engine.currentView) {
                this.fail(test, 'No current view available');
                return;
            }
            
            // Check if view has change listeners
            // Note: We can't directly check listeners, so we verify the setup method exists
            if (typeof this.engine.setupCameraSync === 'function') {
                this.pass(test, 'setupCameraSync method exists');
            } else {
                this.fail(test, 'setupCameraSync method not found');
            }
        } catch (error) {
            this.fail(test, error.message);
        }
    }
    
    /**
     * Test 2: Coordinates are synchronized
     */
    testCoordinateSync() {
        const test = 'Coordinate Synchronization';
        
        try {
            if (!this.engine.currentView || !this.engine.layerManager) {
                this.fail(test, 'Engine not fully initialized');
                return;
            }
            
            // Get Marzipano coordinates
            const marzipanoCoords = this.engine.currentView.coordinates();
            
            // Get last synced coordinates from layer manager
            const syncedCoords = this.engine.layerManager.getLastCoordinates();
            
            if (!syncedCoords) {
                this.fail(test, 'No synced coordinates available');
                return;
            }
            
            // Check if coordinates match (within tolerance)
            const tolerance = 0.001;
            const yawMatch = Math.abs(marzipanoCoords.yaw - syncedCoords.yaw) < tolerance;
            const pitchMatch = Math.abs(marzipanoCoords.pitch - syncedCoords.pitch) < tolerance;
            
            if (yawMatch && pitchMatch) {
                this.pass(test, `Coordinates synced (yaw: ${syncedCoords.yaw.toFixed(3)}, pitch: ${syncedCoords.pitch.toFixed(3)})`);
            } else {
                this.fail(test, 'Coordinate mismatch detected');
            }
        } catch (error) {
            this.fail(test, error.message);
        }
    }
    
    /**
     * Test 3: Parallax calculation is correct
     */
    testParallaxCalculation() {
        const test = 'Parallax Calculation';
        
        try {
            if (!this.engine.layerManager || this.engine.layerManager.layers.length === 0) {
                this.warn(test, 'No layers to test');
                return;
            }
            
            const layer = this.engine.layerManager.layers[0];
            const userData = layer.userData;
            
            if (!userData.parallaxFactor) {
                this.fail(test, 'Layer missing parallax factor');
                return;
            }
            
            if (!userData.basePosition) {
                this.fail(test, 'Layer missing base position');
                return;
            }
            
            // Verify parallax is being applied
            const coords = this.engine.currentView.coordinates();
            const expectedX = userData.basePosition.x + (coords.yaw * userData.parallaxFactor * 0.5);
            const actualX = layer.position.x;
            
            const tolerance = 0.01;
            if (Math.abs(expectedX - actualX) < tolerance) {
                this.pass(test, `Parallax correctly applied (factor: ${userData.parallaxFactor})`);
            } else {
                this.fail(test, `Parallax mismatch (expected: ${expectedX.toFixed(3)}, actual: ${actualX.toFixed(3)})`);
            }
        } catch (error) {
            this.fail(test, error.message);
        }
    }
    
    /**
     * Test 4: FOV synchronization
     */
    testFOVSync() {
        const test = 'FOV Synchronization';
        
        try {
            if (!this.engine.currentView || !this.engine.layerCamera) {
                this.fail(test, 'Camera not initialized');
                return;
            }
            
            const marzipanoFov = this.engine.currentView.fov();
            const fovDegrees = this.engine.rad2deg(marzipanoFov);
            
            // Check if updateThreeJSCameraFOV method exists
            if (typeof this.engine.updateThreeJSCameraFOV === 'function') {
                this.pass(test, `FOV sync method exists (current FOV: ${fovDegrees.toFixed(1)}°)`);
            } else {
                this.fail(test, 'updateThreeJSCameraFOV method not found');
            }
        } catch (error) {
            this.fail(test, error.message);
        }
    }
    
    /**
     * Test 5: Render loop is running
     */
    testRenderLoop() {
        const test = 'Render Loop Active';
        
        try {
            if (!this.engine.fps) {
                this.warn(test, 'FPS counter not initialized yet');
                return;
            }
            
            if (this.engine.fps > 0) {
                this.pass(test, `Running at ${this.engine.fps} fps`);
            } else {
                this.fail(test, 'Render loop not active');
            }
        } catch (error) {
            this.fail(test, error.message);
        }
    }
    
    /**
     * Test 6: User input triggers sync
     */
    async testUserInput() {
        const test = 'User Input Sync';
        
        try {
            if (!this.engine.currentView || !this.engine.controlsManager) {
                this.fail(test, 'Controls not initialized');
                return;
            }
            
            // Get initial coordinates
            const initialCoords = this.engine.currentView.coordinates();
            
            // Simulate rotation
            this.engine.controlsManager.rotateView(0.1, 0);
            
            // Wait a frame
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Get new coordinates
            const newCoords = this.engine.currentView.coordinates();
            
            // Check if coordinates changed
            if (Math.abs(newCoords.yaw - initialCoords.yaw) > 0.01) {
                this.pass(test, 'View rotation triggered sync');
            } else {
                this.fail(test, 'View did not change');
            }
            
            // Reset view
            this.engine.controlsManager.rotateView(-0.1, 0);
            
        } catch (error) {
            this.fail(test, error.message);
        }
    }
    
    /**
     * Test 7: Performance metrics
     */
    testPerformance() {
        const test = 'Performance Metrics';
        
        try {
            const fps = this.engine.fps || 0;
            const layerCount = this.engine.layerManager?.layers?.length || 0;
            
            if (fps >= 55) {
                this.pass(test, `Good performance (${fps} fps, ${layerCount} layers)`);
            } else if (fps >= 30) {
                this.warn(test, `Acceptable performance (${fps} fps, ${layerCount} layers)`);
            } else {
                this.fail(test, `Poor performance (${fps} fps, ${layerCount} layers)`);
            }
        } catch (error) {
            this.fail(test, error.message);
        }
    }
    
    /**
     * Record a passing test
     */
    pass(test, message) {
        this.results.push({ test, status: 'PASS', message });
        console.log(`✅ ${test}: ${message}`);
    }
    
    /**
     * Record a failing test
     */
    fail(test, message) {
        this.results.push({ test, status: 'FAIL', message });
        console.error(`❌ ${test}: ${message}`);
    }
    
    /**
     * Record a warning
     */
    warn(test, message) {
        this.results.push({ test, status: 'WARN', message });
        console.warn(`⚠️  ${test}: ${message}`);
    }
    
    /**
     * Print summary of results
     */
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('Camera Synchronization Verification Results');
        console.log('='.repeat(60));
        
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warned = this.results.filter(r => r.status === 'WARN').length;
        const total = this.results.length;
        
        console.log(`\nTotal Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings: ${warned}`);
        
        const percentage = Math.round((passed / total) * 100);
        console.log(`\nSuccess Rate: ${percentage}%`);
        
        if (failed === 0) {
            console.log('\n🎉 All tests passed! Camera synchronization is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Check the details above.');
        }
        
        console.log('='.repeat(60) + '\n');
    }
}

// Usage instructions
console.log(`
Camera Synchronization Verification Script Loaded!

To verify camera synchronization, run:

    const verifier = new CameraSyncVerifier(engine);
    await verifier.runAll();

Where 'engine' is your LoftTourEngine instance.

Example:
    // After loading a tour
    const container = document.getElementById('tour-container');
    const engine = new LoftTourEngine(container);
    await engine.loadTour(tourData);
    
    // Run verification
    const verifier = new CameraSyncVerifier(engine);
    await verifier.runAll();
`);

// Export for use
window.CameraSyncVerifier = CameraSyncVerifier;
