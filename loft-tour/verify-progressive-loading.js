/**
 * LOFT³ Progressive Loading Verification Script
 * Tests the progressive loading functionality
 */

// Test configuration
const TEST_CONFIG = {
    testImages: [
        'https://picsum.photos/4096/2048?random=1',
        'https://picsum.photos/4096/2048?random=2',
        'https://picsum.photos/4096/2048?random=3'
    ],
    strategies: ['progressive', 'adaptive', 'single'],
    tiers: ['low', 'medium', 'high']
};

class ProgressiveLoadingVerifier {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
        
        this.progressiveLoader = null;
    }
    
    async runAllTests() {
        console.log('🧪 Starting Progressive Loading Verification Tests');
        console.log('='.repeat(60));
        
        try {
            // Initialize progressive loader
            await this.initializeLoader();
            
            // Run test suites
            await this.testLoaderInitialization();
            await this.testDeviceCapabilityDetection();
            await this.testProgressiveStrategy();
            await this.testAdaptiveStrategy();
            await this.testSingleStrategy();
            await this.testCaching();
            await this.testPreloading();
            await this.testErrorHandling();
            
            // Print results
            this.printResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.results.failed++;
        }
        
        return this.results;
    }
    
    async initializeLoader() {
        this.test('Progressive Loader Initialization', () => {
            if (typeof ProgressiveImageLoader === 'undefined') {
                throw new Error('ProgressiveImageLoader class not available');
            }
            
            this.progressiveLoader = new ProgressiveImageLoader({
                strategy: 'adaptive',
                enableCache: true,
                maxCacheSize: 10 * 1024 * 1024, // 10MB for testing
                preloadCount: 2
            });
            
            if (!this.progressiveLoader) {
                throw new Error('Failed to create ProgressiveImageLoader instance');
            }
            
            return true;
        });
    }
    
    async testLoaderInitialization() {
        this.test('Loader Configuration', () => {
            const config = this.progressiveLoader.config;
            
            if (!config.tiers || !config.tiers.low || !config.tiers.medium || !config.tiers.high) {
                throw new Error('Tier configuration missing');
            }
            
            if (!config.strategy || !config.enableCache) {
                throw new Error('Basic configuration missing');
            }
            
            return true;
        });
    }
    
    async testDeviceCapabilityDetection() {
        this.test('Device Capability Detection', () => {
            const capabilities = this.progressiveLoader.deviceCapabilities;
            
            if (!capabilities) {
                throw new Error('Device capabilities not detected');
            }
            
            if (!capabilities.performanceTier || !['low', 'medium', 'high'].includes(capabilities.performanceTier)) {
                throw new Error('Invalid performance tier detected');
            }
            
            if (!this.progressiveLoader.optimalTier || !['low', 'medium', 'high'].includes(this.progressiveLoader.optimalTier)) {
                throw new Error('Invalid optimal tier determined');
            }
            
            console.log(`  📱 Device Tier: ${capabilities.performanceTier}`);
            console.log(`  🎯 Optimal Tier: ${this.progressiveLoader.optimalTier}`);
            
            return true;
        });
    }
    
    async testProgressiveStrategy() {
        await this.test('Progressive Loading Strategy', async () => {
            const testImage = TEST_CONFIG.testImages[0];
            let progressCallbacks = 0;
            
            const result = await this.progressiveLoader.loadImageProgressive(testImage, {
                strategy: 'progressive',
                onProgress: (progress) => {
                    progressCallbacks++;
                    console.log(`    📶 Progress: ${progress.tier} (${progress.tierIndex + 1}/${progress.totalTiers})`);
                }
            });
            
            if (!result || !result.src) {
                throw new Error('Progressive loading failed to return image');
            }
            
            if (progressCallbacks === 0) {
                throw new Error('No progress callbacks received');
            }
            
            console.log(`  ✅ Progressive loading completed with ${progressCallbacks} tiers`);
            return true;
        });
    }
    
    async testAdaptiveStrategy() {
        await this.test('Adaptive Loading Strategy', async () => {
            const testImage = TEST_CONFIG.testImages[1];
            
            const result = await this.progressiveLoader.loadImageProgressive(testImage, {
                strategy: 'adaptive'
            });
            
            if (!result || !result.src) {
                throw new Error('Adaptive loading failed to return image');
            }
            
            console.log(`  🎯 Adaptive loading selected optimal quality`);
            return true;
        });
    }
    
    async testSingleStrategy() {
        await this.test('Single Tier Loading Strategy', async () => {
            const testImage = TEST_CONFIG.testImages[2];
            
            const result = await this.progressiveLoader.loadImageProgressive(testImage, {
                strategy: 'single',
                tier: 'medium'
            });
            
            if (!result || !result.src) {
                throw new Error('Single tier loading failed to return image');
            }
            
            console.log(`  🎯 Single tier loading completed`);
            return true;
        });
    }
    
    async testCaching() {
        await this.test('Image Caching', async () => {
            const testImage = TEST_CONFIG.testImages[0]; // Reuse first image
            
            // Clear cache first
            this.progressiveLoader.clearCache();
            
            // First load (cache miss)
            const startTime1 = Date.now();
            await this.progressiveLoader.loadImageProgressive(testImage, { strategy: 'single' });
            const loadTime1 = Date.now() - startTime1;
            
            // Second load (should be cache hit)
            const startTime2 = Date.now();
            await this.progressiveLoader.loadImageProgressive(testImage, { strategy: 'single' });
            const loadTime2 = Date.now() - startTime2;
            
            const stats = this.progressiveLoader.getStats();
            
            if (stats.cacheHitRate === 0) {
                throw new Error('Cache not working - no cache hits detected');
            }
            
            console.log(`  💾 Cache hit rate: ${stats.cacheHitRate}%`);
            console.log(`  ⚡ Load time improvement: ${loadTime1}ms → ${loadTime2}ms`);
            
            return true;
        });
    }
    
    async testPreloading() {
        await this.test('Image Preloading', async () => {
            const imagesToPreload = TEST_CONFIG.testImages.slice(0, 2);
            
            const results = await this.progressiveLoader.preloadImages(imagesToPreload, {
                count: 2,
                preloadTier: 'low'
            });
            
            if (!results || results.length === 0) {
                throw new Error('Preloading failed to return results');
            }
            
            const successful = results.filter(r => r !== null).length;
            
            if (successful === 0) {
                throw new Error('No images were successfully preloaded');
            }
            
            console.log(`  📦 Preloaded ${successful}/${imagesToPreload.length} images`);
            return true;
        });
    }
    
    async testErrorHandling() {
        await this.test('Error Handling', async () => {
            const invalidImage = 'https://invalid-url-that-does-not-exist.com/image.jpg';
            
            try {
                await this.progressiveLoader.loadImageProgressive(invalidImage, {
                    strategy: 'single',
                    timeout: 2000 // Short timeout for quick test
                });
                
                throw new Error('Expected error for invalid image URL, but loading succeeded');
                
            } catch (error) {
                if (error.message.includes('Expected error')) {
                    throw error;
                }
                
                // Expected error - this is good
                console.log(`  ✅ Properly handled error: ${error.message.substring(0, 50)}...`);
                return true;
            }
        });
    }
    
    test(name, testFunction) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`\n🧪 Testing: ${name}`);
                
                const result = await testFunction();
                
                if (result) {
                    console.log(`✅ PASSED: ${name}`);
                    this.results.passed++;
                    this.results.tests.push({ name, status: 'PASSED' });
                } else {
                    console.log(`❌ FAILED: ${name} - Test returned false`);
                    this.results.failed++;
                    this.results.tests.push({ name, status: 'FAILED', error: 'Test returned false' });
                }
                
                resolve(result);
                
            } catch (error) {
                console.log(`❌ FAILED: ${name} - ${error.message}`);
                this.results.failed++;
                this.results.tests.push({ name, status: 'FAILED', error: error.message });
                resolve(false);
            }
        });
    }
    
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PROGRESSIVE LOADING TEST RESULTS');
        console.log('='.repeat(60));
        
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📊 Total:  ${this.results.passed + this.results.failed}`);
        
        const successRate = this.results.passed + this.results.failed > 0 ? 
            (this.results.passed / (this.results.passed + this.results.failed) * 100).toFixed(1) : 0;
        
        console.log(`🎯 Success Rate: ${successRate}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.tests
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.error}`);
                });
        }
        
        // Print performance stats if available
        if (this.progressiveLoader) {
            const stats = this.progressiveLoader.getStats();
            console.log('\n📈 Performance Statistics:');
            console.log(`  Images Loaded: ${stats.imagesLoaded}`);
            console.log(`  Avg Load Time: ${stats.avgLoadTime}ms`);
            console.log(`  Cache Hit Rate: ${stats.cacheHitRate}%`);
            console.log(`  Cache Size: ${stats.cacheSize}MB`);
            console.log(`  Device Tier: ${stats.deviceTier}`);
            console.log(`  Optimal Tier: ${stats.optimalTier}`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        return this.results.failed === 0;
    }
}

// Export for use in browser or Node.js
if (typeof window !== 'undefined') {
    window.ProgressiveLoadingVerifier = ProgressiveLoadingVerifier;
} else if (typeof module !== 'undefined') {
    module.exports = ProgressiveLoadingVerifier;
}

// Auto-run if loaded directly in browser
if (typeof window !== 'undefined' && window.location) {
    // Wait for DOM and dependencies to load
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(async () => {
            if (typeof ProgressiveImageLoader !== 'undefined') {
                const verifier = new ProgressiveLoadingVerifier();
                await verifier.runAllTests();
            } else {
                console.error('❌ ProgressiveImageLoader not available for testing');
            }
        }, 1000);
    });
}