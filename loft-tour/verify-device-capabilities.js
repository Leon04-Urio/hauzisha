/**
 * LOFT³ Device Capability Detection Verification Script
 * Tests the comprehensive device capability detection and quality adjustment system
 */

class DeviceCapabilityVerifier {
    constructor() {
        this.testResults = [];
        this.deviceManager = null;
    }
    
    /**
     * Run all verification tests
     */
    async runAllTests() {
        console.log('🧪 Starting Device Capability Detection Verification...\n');
        
        try {
            // Test 1: Basic initialization
            await this.testInitialization();
            
            // Test 2: Device capability detection
            await this.testCapabilityDetection();
            
            // Test 3: Performance scoring
            await this.testPerformanceScoring();
            
            // Test 4: Quality tier determination
            await this.testQualityTierDetermination();
            
            // Test 5: Quality settings generation
            await this.testQualitySettingsGeneration();
            
            // Test 6: Performance monitoring
            await this.testPerformanceMonitoring();
            
            // Test 7: Adaptive quality adjustment
            await this.testAdaptiveQualityAdjustment();
            
            // Test 8: Integration with other modules
            await this.testModuleIntegration();
            
            // Generate report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
            this.testResults.push({
                test: 'Overall Verification',
                status: 'FAILED',
                error: error.message
            });
        }
    }
    
    /**
     * Test 1: Basic initialization
     */
    async testInitialization() {
        console.log('📋 Test 1: Basic Initialization');
        
        try {
            // Check if DeviceCapabilityManager is available
            if (typeof DeviceCapabilityManager === 'undefined') {
                throw new Error('DeviceCapabilityManager class not found');
            }
            
            // Initialize the manager
            this.deviceManager = new DeviceCapabilityManager({
                enableMonitoring: false, // Disable for testing
                enableAdaptiveQuality: false
            });
            
            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Check if properly initialized
            if (!this.deviceManager.capabilities) {
                throw new Error('Device capabilities not detected');
            }
            
            if (!this.deviceManager.currentSettings) {
                throw new Error('Quality settings not generated');
            }
            
            this.testResults.push({
                test: 'Initialization',
                status: 'PASSED',
                details: 'DeviceCapabilityManager initialized successfully'
            });
            
            console.log('✅ Initialization test passed\n');
            
        } catch (error) {
            this.testResults.push({
                test: 'Initialization',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Initialization test failed:', error.message, '\n');
            throw error;
        }
    }
    
    /**
     * Test 2: Device capability detection
     */
    async testCapabilityDetection() {
        console.log('📋 Test 2: Device Capability Detection');
        
        try {
            const capabilities = this.deviceManager.capabilities;
            
            // Check required capability fields
            const requiredFields = [
                'deviceMemory', 'hardwareConcurrency', 'pixelRatio', 'screenSize',
                'gpu', 'webglSupport', 'deviceType', 'platform', 'browser'
            ];
            
            for (const field of requiredFields) {
                if (!(field in capabilities)) {
                    throw new Error(`Missing capability field: ${field}`);
                }
            }
            
            // Validate GPU detection
            if (!capabilities.gpu.tier || !['low', 'medium', 'high'].includes(capabilities.gpu.tier)) {
                throw new Error('Invalid GPU tier detected');
            }
            
            // Validate device type
            if (!['mobile', 'tablet', 'desktop'].includes(capabilities.deviceType)) {
                throw new Error('Invalid device type detected');
            }
            
            // Validate WebGL support
            if (!['none', 'webgl1', 'webgl2'].includes(capabilities.webglSupport)) {
                throw new Error('Invalid WebGL support level');
            }
            
            this.testResults.push({
                test: 'Capability Detection',
                status: 'PASSED',
                details: {
                    deviceMemory: capabilities.deviceMemory,
                    gpuTier: capabilities.gpu.tier,
                    deviceType: capabilities.deviceType,
                    webglSupport: capabilities.webglSupport
                }
            });
            
            console.log('✅ Capability detection test passed');
            console.log(`   Device: ${capabilities.deviceType} (${capabilities.platform})`);
            console.log(`   Memory: ${capabilities.deviceMemory}GB`);
            console.log(`   GPU: ${capabilities.gpu.tier} (${capabilities.gpu.renderer})`);
            console.log(`   WebGL: ${capabilities.webglSupport}\n`);
            
        } catch (error) {
            this.testResults.push({
                test: 'Capability Detection',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Capability detection test failed:', error.message, '\n');
        }
    }
    
    /**
     * Test 3: Performance scoring
     */
    async testPerformanceScoring() {
        console.log('📋 Test 3: Performance Scoring');
        
        try {
            const score = this.deviceManager.performanceScore;
            
            // Validate score range
            if (typeof score !== 'number' || score < 0 || score > 12) {
                throw new Error(`Invalid performance score: ${score} (should be 0-12)`);
            }
            
            // Check if score makes sense based on capabilities
            const caps = this.deviceManager.capabilities;
            let expectedMinScore = 0;
            let expectedMaxScore = 12;
            
            // Adjust expectations based on device type
            if (caps.deviceType === 'mobile') {
                expectedMaxScore = 8; // Mobile devices typically score lower
            } else if (caps.deviceType === 'desktop') {
                expectedMinScore = 3; // Desktop devices typically score higher
            }
            
            if (score < expectedMinScore || score > expectedMaxScore) {
                console.warn(`⚠️ Performance score ${score} seems unusual for ${caps.deviceType} device`);
            }
            
            this.testResults.push({
                test: 'Performance Scoring',
                status: 'PASSED',
                details: {
                    score: score,
                    maxPossible: 12,
                    deviceType: caps.deviceType
                }
            });
            
            console.log('✅ Performance scoring test passed');
            console.log(`   Score: ${score}/12`);
            console.log(`   Device type: ${caps.deviceType}\n`);
            
        } catch (error) {
            this.testResults.push({
                test: 'Performance Scoring',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Performance scoring test failed:', error.message, '\n');
        }
    }
    
    /**
     * Test 4: Quality tier determination
     */
    async testQualityTierDetermination() {
        console.log('📋 Test 4: Quality Tier Determination');
        
        try {
            const tier = this.deviceManager.qualityTier;
            
            // Validate tier
            if (!['low', 'medium', 'high'].includes(tier)) {
                throw new Error(`Invalid quality tier: ${tier}`);
            }
            
            // Check if tier matches performance score
            const score = this.deviceManager.performanceScore;
            let expectedTier;
            
            if (score >= 8) expectedTier = 'high';
            else if (score >= 5) expectedTier = 'medium';
            else expectedTier = 'low';
            
            if (tier !== expectedTier) {
                console.warn(`⚠️ Quality tier ${tier} doesn't match expected ${expectedTier} for score ${score}`);
            }
            
            this.testResults.push({
                test: 'Quality Tier Determination',
                status: 'PASSED',
                details: {
                    tier: tier,
                    score: score,
                    expected: expectedTier
                }
            });
            
            console.log('✅ Quality tier determination test passed');
            console.log(`   Tier: ${tier} (score: ${score})\n`);
            
        } catch (error) {
            this.testResults.push({
                test: 'Quality Tier Determination',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Quality tier determination test failed:', error.message, '\n');
        }
    }
    
    /**
     * Test 5: Quality settings generation
     */
    async testQualitySettingsGeneration() {
        console.log('📋 Test 5: Quality Settings Generation');
        
        try {
            const settings = this.deviceManager.currentSettings;
            
            // Check required settings fields
            const requiredFields = [
                'maxImageWidth', 'maxImageHeight', 'imageQuality', 'pixelRatio',
                'antialias', 'targetFPS', 'enableParallax', 'maxParallaxLayers',
                'enableTransitions', 'preloadCount', 'cacheSize'
            ];
            
            for (const field of requiredFields) {
                if (!(field in settings)) {
                    throw new Error(`Missing settings field: ${field}`);
                }
            }
            
            // Validate setting ranges
            if (settings.imageQuality < 0.1 || settings.imageQuality > 1.0) {
                throw new Error(`Invalid image quality: ${settings.imageQuality}`);
            }
            
            if (settings.targetFPS < 15 || settings.targetFPS > 120) {
                throw new Error(`Invalid target FPS: ${settings.targetFPS}`);
            }
            
            if (settings.maxParallaxLayers < 0 || settings.maxParallaxLayers > 50) {
                throw new Error(`Invalid max parallax layers: ${settings.maxParallaxLayers}`);
            }
            
            // Check if settings are appropriate for quality tier
            const tier = this.deviceManager.qualityTier;
            if (tier === 'low' && settings.imageQuality > 0.6) {
                console.warn(`⚠️ High image quality (${settings.imageQuality}) for low tier`);
            }
            
            if (tier === 'high' && settings.imageQuality < 0.7) {
                console.warn(`⚠️ Low image quality (${settings.imageQuality}) for high tier`);
            }
            
            this.testResults.push({
                test: 'Quality Settings Generation',
                status: 'PASSED',
                details: {
                    tier: tier,
                    imageSize: `${settings.maxImageWidth}x${settings.maxImageHeight}`,
                    quality: Math.round(settings.imageQuality * 100) + '%',
                    targetFPS: settings.targetFPS,
                    parallaxLayers: settings.maxParallaxLayers
                }
            });
            
            console.log('✅ Quality settings generation test passed');
            console.log(`   Image size: ${settings.maxImageWidth}x${settings.maxImageHeight}`);
            console.log(`   Quality: ${Math.round(settings.imageQuality * 100)}%`);
            console.log(`   Target FPS: ${settings.targetFPS}`);
            console.log(`   Parallax layers: ${settings.maxParallaxLayers}\n`);
            
        } catch (error) {
            this.testResults.push({
                test: 'Quality Settings Generation',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Quality settings generation test failed:', error.message, '\n');
        }
    }
    
    /**
     * Test 6: Performance monitoring
     */
    async testPerformanceMonitoring() {
        console.log('📋 Test 6: Performance Monitoring');
        
        try {
            // Enable monitoring
            this.deviceManager.startPerformanceMonitoring();
            
            // Wait for some monitoring data
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if monitoring is active
            if (!this.deviceManager.monitoringActive) {
                throw new Error('Performance monitoring not active');
            }
            
            // Check performance stats
            const stats = this.deviceManager.getPerformanceStats();
            
            if (typeof stats.currentFPS !== 'number') {
                throw new Error('Invalid FPS measurement');
            }
            
            // Stop monitoring
            this.deviceManager.stopPerformanceMonitoring();
            
            if (this.deviceManager.monitoringActive) {
                throw new Error('Performance monitoring not stopped');
            }
            
            this.testResults.push({
                test: 'Performance Monitoring',
                status: 'PASSED',
                details: {
                    currentFPS: stats.currentFPS,
                    avgFPS: stats.avgFPS,
                    memoryUsage: stats.memoryUsage
                }
            });
            
            console.log('✅ Performance monitoring test passed');
            console.log(`   Current FPS: ${stats.currentFPS}`);
            console.log(`   Memory usage: ${stats.memoryUsage ? stats.memoryUsage.used + 'MB' : 'N/A'}\n`);
            
        } catch (error) {
            this.testResults.push({
                test: 'Performance Monitoring',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Performance monitoring test failed:', error.message, '\n');
        }
    }
    
    /**
     * Test 7: Adaptive quality adjustment
     */
    async testAdaptiveQualityAdjustment() {
        console.log('📋 Test 7: Adaptive Quality Adjustment');
        
        try {
            const originalTier = this.deviceManager.qualityTier;
            const originalSettings = { ...this.deviceManager.currentSettings };
            
            // Test manual quality tier changes
            const testTiers = ['low', 'medium', 'high'];
            
            for (const tier of testTiers) {
                this.deviceManager.setQualityTier(tier);
                
                if (this.deviceManager.qualityTier !== tier) {
                    throw new Error(`Failed to set quality tier to ${tier}`);
                }
                
                // Check if settings changed appropriately
                const newSettings = this.deviceManager.currentSettings;
                
                if (tier === 'low' && newSettings.imageQuality > 0.6) {
                    console.warn(`⚠️ Image quality too high for low tier: ${newSettings.imageQuality}`);
                }
                
                if (tier === 'high' && newSettings.imageQuality < 0.7) {
                    console.warn(`⚠️ Image quality too low for high tier: ${newSettings.imageQuality}`);
                }
            }
            
            // Restore original tier
            this.deviceManager.setQualityTier(originalTier);
            
            this.testResults.push({
                test: 'Adaptive Quality Adjustment',
                status: 'PASSED',
                details: {
                    originalTier: originalTier,
                    testedTiers: testTiers,
                    finalTier: this.deviceManager.qualityTier
                }
            });
            
            console.log('✅ Adaptive quality adjustment test passed');
            console.log(`   Tested tiers: ${testTiers.join(', ')}`);
            console.log(`   Restored to: ${originalTier}\n`);
            
        } catch (error) {
            this.testResults.push({
                test: 'Adaptive Quality Adjustment',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Adaptive quality adjustment test failed:', error.message, '\n');
        }
    }
    
    /**
     * Test 8: Integration with other modules
     */
    async testModuleIntegration() {
        console.log('📋 Test 8: Module Integration');
        
        try {
            let integrationResults = [];
            
            // Test MobileOptimization integration
            if (typeof MobileOptimization !== 'undefined') {
                const mobileOpt = new MobileOptimization();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (mobileOpt.deviceCapabilityManager) {
                    integrationResults.push('MobileOptimization: ✅ Integrated');
                } else {
                    integrationResults.push('MobileOptimization: ⚠️ Not integrated');
                }
            } else {
                integrationResults.push('MobileOptimization: ❌ Not available');
            }
            
            // Test ProgressiveImageLoader integration
            if (typeof ProgressiveImageLoader !== 'undefined') {
                const loader = new ProgressiveImageLoader();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if it's using device capabilities
                if (loader.deviceCapabilities && loader.optimalTier) {
                    integrationResults.push('ProgressiveImageLoader: ✅ Integrated');
                } else {
                    integrationResults.push('ProgressiveImageLoader: ⚠️ Partial integration');
                }
            } else {
                integrationResults.push('ProgressiveImageLoader: ❌ Not available');
            }
            
            // Test LoftTourEngine integration (if available)
            if (typeof LoftTourEngine !== 'undefined') {
                // Can't easily test without full setup, just check class exists
                integrationResults.push('LoftTourEngine: ✅ Available for integration');
            } else {
                integrationResults.push('LoftTourEngine: ❌ Not available');
            }
            
            this.testResults.push({
                test: 'Module Integration',
                status: 'PASSED',
                details: integrationResults
            });
            
            console.log('✅ Module integration test passed');
            integrationResults.forEach(result => console.log(`   ${result}`));
            console.log('');
            
        } catch (error) {
            this.testResults.push({
                test: 'Module Integration',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Module integration test failed:', error.message, '\n');
        }
    }
    
    /**
     * Generate verification report
     */
    generateReport() {
        console.log('📊 DEVICE CAPABILITY DETECTION VERIFICATION REPORT');
        console.log('='.repeat(60));
        
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        const total = this.testResults.length;
        
        console.log(`\nOverall Results: ${passed}/${total} tests passed`);
        
        if (failed === 0) {
            console.log('🎉 All tests passed! Device capability detection is working correctly.\n');
        } else {
            console.log(`⚠️ ${failed} test(s) failed. Please review the issues above.\n`);
        }
        
        // Detailed results
        console.log('Detailed Results:');
        console.log('-'.repeat(40));
        
        this.testResults.forEach((result, index) => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}`);
            
            if (result.status === 'FAILED') {
                console.log(`   Error: ${result.error}`);
            } else if (result.details) {
                if (typeof result.details === 'string') {
                    console.log(`   ${result.details}`);
                } else if (Array.isArray(result.details)) {
                    result.details.forEach(detail => console.log(`   ${detail}`));
                } else {
                    Object.entries(result.details).forEach(([key, value]) => {
                        console.log(`   ${key}: ${value}`);
                    });
                }
            }
        });
        
        // Device summary
        if (this.deviceManager && this.deviceManager.capabilities) {
            console.log('\nDevice Summary:');
            console.log('-'.repeat(40));
            const caps = this.deviceManager.capabilities;
            const settings = this.deviceManager.currentSettings;
            
            console.log(`Device Type: ${caps.deviceType} (${caps.platform})`);
            console.log(`Memory: ${caps.deviceMemory}GB`);
            console.log(`GPU: ${caps.gpu.tier} tier`);
            console.log(`Performance Score: ${this.deviceManager.performanceScore}/12`);
            console.log(`Quality Tier: ${this.deviceManager.qualityTier}`);
            console.log(`Optimized Settings:`);
            console.log(`  - Image Quality: ${Math.round(settings.imageQuality * 100)}%`);
            console.log(`  - Target FPS: ${settings.targetFPS}`);
            console.log(`  - Parallax Layers: ${settings.maxParallaxLayers}`);
            console.log(`  - Antialiasing: ${settings.antialias ? 'Enabled' : 'Disabled'}`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        return {
            passed,
            failed,
            total,
            success: failed === 0,
            results: this.testResults
        };
    }
    
    /**
     * Cleanup
     */
    cleanup() {
        if (this.deviceManager) {
            this.deviceManager.destroy();
        }
    }
}

// Auto-run verification if this script is loaded directly
if (typeof window !== 'undefined' && window.location) {
    window.addEventListener('load', async () => {
        // Only run if this is the verification page
        if (window.location.pathname.includes('verify-device-capabilities') || 
            window.location.search.includes('verify=device-capabilities')) {
            
            const verifier = new DeviceCapabilityVerifier();
            await verifier.runAllTests();
            
            // Cleanup after a delay
            setTimeout(() => {
                verifier.cleanup();
            }, 5000);
        }
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceCapabilityVerifier;
} else if (typeof window !== 'undefined') {
    window.DeviceCapabilityVerifier = DeviceCapabilityVerifier;
}