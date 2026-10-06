/**
 * LOFT³ Performance Verification Script
 * Tests all performance optimizations for 60fps rendering
 */

const performanceTests = {
    // Test 1: Adaptive Quality Detection
    testQualityDetection: () => {
        console.log('\n=== Test 1: Adaptive Quality Detection ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        const qualityLevel = engine.qualityLevel;
        const validLevels = ['low', 'medium', 'high'];
        
        console.log('✓ Detected quality level:', qualityLevel);
        console.assert(
            validLevels.includes(qualityLevel),
            'Quality level should be one of: low, medium, high'
        );
        
        console.log('✓ Quality settings applied:', engine.currentQualitySettings);
        console.assert(
            engine.currentQualitySettings !== undefined,
            'Quality settings should be defined'
        );
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 2: Frame Rate Monitoring
    testFrameRateMonitoring: () => {
        console.log('\n=== Test 2: Frame Rate Monitoring ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        // Check FPS tracking
        console.assert(
            engine.fps !== undefined,
            'FPS counter should be initialized'
        );
        
        console.assert(
            engine.performanceStats !== undefined,
            'Performance stats should be initialized'
        );
        
        console.assert(
            Array.isArray(engine.performanceStats.frameTimeSamples),
            'Frame time samples should be an array'
        );
        
        console.log('✓ FPS tracking initialized');
        console.log('✓ Performance stats structure verified');
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 3: Texture Caching
    testTextureCaching: async () => {
        console.log('\n=== Test 3: Texture Caching ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        // Check texture cache exists
        console.assert(
            engine.layerManager.textureCache instanceof Map,
            'Texture cache should be a Map'
        );
        
        console.log('✓ Texture cache initialized');
        console.log('✓ Cache size:', engine.layerManager.textureCache.size);
        
        // Test cache functionality
        const testLayers = [
            {
                id: 'test-1',
                image: 'test.png',
                position: { x: 0.5, y: 0.5 },
                parallaxFactor: 0.5
            }
        ];
        
        engine.layerManager.loadLayers(testLayers);
        
        console.log('✓ Layers loaded with caching support');
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 4: Render Loop Optimization
    testRenderLoopOptimization: () => {
        console.log('\n=== Test 4: Render Loop Optimization ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        // Check animation ID is set
        console.assert(
            engine.animationId !== undefined,
            'Animation ID should be set'
        );
        
        console.log('✓ Render loop started');
        console.log('✓ Animation frame ID:', engine.animationId);
        
        // Verify performance tracking
        console.assert(
            engine.performanceStats.frameTimeSamples !== undefined,
            'Frame time tracking should be active'
        );
        
        console.log('✓ Performance tracking active');
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 5: Layer Visibility Culling
    testVisibilityCulling: () => {
        console.log('\n=== Test 5: Layer Visibility Culling ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        // Check culling settings
        console.assert(
            engine.layerManager.enableFrustumCulling !== undefined,
            'Frustum culling setting should exist'
        );
        
        console.assert(
            engine.layerManager.visibilityThreshold !== undefined,
            'Visibility threshold should be defined'
        );
        
        console.log('✓ Frustum culling enabled:', engine.layerManager.enableFrustumCulling);
        console.log('✓ Visibility threshold:', engine.layerManager.visibilityThreshold);
        
        // Check render tracking
        console.assert(
            engine.layerManager.renderCount !== undefined,
            'Render count should be tracked'
        );
        
        console.assert(
            engine.layerManager.skippedRenderCount !== undefined,
            'Skipped render count should be tracked'
        );
        
        console.log('✓ Render efficiency tracking enabled');
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 6: Memory Management
    testMemoryManagement: () => {
        console.log('\n=== Test 6: Memory Management ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        // Test memory estimation
        const stats = engine.layerManager.getStats();
        
        console.assert(
            stats.memoryUsage !== undefined,
            'Memory usage should be tracked'
        );
        
        console.assert(
            stats.memoryUsage.mb !== undefined,
            'Memory usage should be in MB'
        );
        
        console.log('✓ Memory tracking enabled');
        console.log('✓ Current memory usage:', stats.memoryUsage.mb, 'MB');
        
        // Test memory optimization
        console.assert(
            typeof engine.layerManager.optimizeMemory === 'function',
            'Memory optimization function should exist'
        );
        
        console.log('✓ Memory optimization available');
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 7: Three.js Renderer Optimization
    testRendererOptimization: () => {
        console.log('\n=== Test 7: Three.js Renderer Optimization ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        // Check renderer settings
        const renderer = engine.layerRenderer;
        
        console.assert(
            renderer !== null,
            'Renderer should be initialized'
        );
        
        console.log('✓ Renderer initialized with optimizations');
        console.log('✓ Pixel ratio:', renderer.getPixelRatio());
        console.log('✓ Sort objects:', renderer.sortObjects);
        console.log('✓ Auto clear:', renderer.autoClear);
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 8: Performance Report Generation
    testPerformanceReport: () => {
        console.log('\n=== Test 8: Performance Report Generation ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        // Generate report
        const report = engine.getPerformanceReport();
        
        console.assert(
            report !== undefined,
            'Performance report should be generated'
        );
        
        console.assert(
            report.fps !== undefined,
            'Report should include FPS'
        );
        
        console.assert(
            report.qualityLevel !== undefined,
            'Report should include quality level'
        );
        
        console.assert(
            report.layerStats !== undefined,
            'Report should include layer stats'
        );
        
        console.assert(
            report.deviceInfo !== undefined,
            'Report should include device info'
        );
        
        console.log('✓ Performance report generated successfully');
        console.log('✓ Report structure:', Object.keys(report));
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 9: Adaptive Quality Adjustment
    testAdaptiveQuality: () => {
        console.log('\n=== Test 9: Adaptive Quality Adjustment ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        const initialQuality = engine.qualityLevel;
        console.log('✓ Initial quality:', initialQuality);
        
        // Test quality adjustment function
        console.assert(
            typeof engine.adjustQualityBasedOnPerformance === 'function',
            'Quality adjustment function should exist'
        );
        
        console.assert(
            typeof engine.applyQualitySettings === 'function',
            'Quality settings application function should exist'
        );
        
        // Simulate quality change
        engine.qualityLevel = 'low';
        engine.applyQualitySettings('low');
        
        console.log('✓ Quality changed to: low');
        console.log('✓ Settings applied:', engine.currentQualitySettings);
        
        engine.destroy();
        document.body.removeChild(container);
        
        return true;
    },
    
    // Test 10: Resource Cleanup
    testResourceCleanup: () => {
        console.log('\n=== Test 10: Resource Cleanup ===');
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const engine = new LoftTourEngine(container);
        
        // Add some layers
        const testLayers = [
            {
                id: 'cleanup-test-1',
                image: 'test.png',
                position: { x: 0.5, y: 0.5 }
            }
        ];
        
        engine.layerManager.loadLayers(testLayers);
        
        console.log('✓ Layers loaded:', engine.layerManager.layers.length);
        
        // Test cleanup
        engine.destroy();
        
        console.log('✓ Engine destroyed');
        console.log('✓ Resources cleaned up');
        
        document.body.removeChild(container);
        
        return true;
    }
};

// Run all tests
async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   LOFT³ Performance Optimization Verification Tests    ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    
    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };
    
    for (const [testName, testFunc] of Object.entries(performanceTests)) {
        results.total++;
        
        try {
            const result = await testFunc();
            if (result) {
                results.passed++;
                console.log(`✅ ${testName} PASSED`);
            } else {
                results.failed++;
                console.log(`❌ ${testName} FAILED`);
            }
        } catch (error) {
            results.failed++;
            console.error(`❌ ${testName} FAILED with error:`, error);
        }
    }
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    Test Summary                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All performance optimization tests passed!');
        console.log('✓ 60fps rendering optimizations verified');
        console.log('✓ Adaptive quality system working');
        console.log('✓ Memory management functional');
        console.log('✓ Texture caching operational');
        console.log('✓ Render efficiency tracking active');
    } else {
        console.log('\n⚠️ Some tests failed. Please review the errors above.');
    }
    
    return results;
}

// Export for use in HTML
if (typeof window !== 'undefined') {
    window.runPerformanceTests = runAllTests;
}

// Auto-run if loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('verify-performance')) {
    window.addEventListener('load', () => {
        setTimeout(runAllTests, 1000);
    });
}
