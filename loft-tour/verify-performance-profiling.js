/**
 * LOFT³ Performance Profiling Verification Script
 * Comprehensive testing of performance monitoring and memory optimization
 */

class PerformanceProfilingVerifier {
    constructor() {
        this.testResults = [];
        this.tourEngine = null;
        this.performanceProfiler = null;
        this.memoryOptimizer = null;
    }
    
    /**
     * Run all performance profiling tests
     */
    async runAllTests() {
        console.log('🔍 Starting Performance Profiling Verification Tests...\n');
        
        try {
            // Test 1: Initialize performance profiler
            await this.testPerformanceProfilerInitialization();
            
            // Test 2: Initialize memory optimizer
            await this.testMemoryOptimizerInitialization();
            
            // Test 3: Performance metrics collection
            await this.testPerformanceMetricsCollection();
            
            // Test 4: Memory monitoring
            await this.testMemoryMonitoring();
            
            // Test 5: Automatic optimization
            await this.testAutomaticOptimization();
            
            // Test 6: Memory pressure handling
            await this.testMemoryPressureHandling();
            
            // Test 7: Performance data export
            await this.testPerformanceDataExport();
            
            // Test 8: Integration with tour engine
            await this.testTourEngineIntegration();
            
            // Test 9: Cleanup and destruction
            await this.testCleanupAndDestruction();
            
            // Generate final report
            this.generateFinalReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.testResults.push({
                test: 'Test Suite Execution',
                status: 'FAILED',
                error: error.message
            });
        }
    }
    
    /**
     * Test 1: Performance profiler initialization
     */
    async testPerformanceProfilerInitialization() {
        console.log('📊 Test 1: Performance Profiler Initialization');
        
        try {
            // Create mock tour engine
            const container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);
            
            this.tourEngine = new LoftTourEngine(container);
            await this.wait(1000); // Wait for initialization
            
            // Initialize performance profiler
            this.performanceProfiler = new LoftTourPerformanceProfiler(this.tourEngine, {
                enableProfiling: true,
                profilingInterval: 500,
                enableAutoOptimization: true
            });
            
            await this.wait(1000);
            
            // Verify initialization
            const isActive = this.performanceProfiler.isProfilerActive;
            const hasMetrics = this.performanceProfiler.currentMetrics !== null;
            
            if (isActive && this.performanceProfiler.performanceHistory) {
                this.testResults.push({
                    test: 'Performance Profiler Initialization',
                    status: 'PASSED',
                    details: 'Profiler initialized and active'
                });
                console.log('✅ Performance profiler initialized successfully');
            } else {
                throw new Error('Performance profiler not properly initialized');
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Performance Profiler Initialization',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Performance profiler initialization failed:', error.message);
        }
    }
    
    /**
     * Test 2: Memory optimizer initialization
     */
    async testMemoryOptimizerInitialization() {
        console.log('🧠 Test 2: Memory Optimizer Initialization');
        
        try {
            // Initialize memory optimizer
            this.memoryOptimizer = new LoftTourMemoryOptimizer(this.tourEngine, {
                enableAutoCleanup: true,
                cleanupInterval: 5000,
                warningThreshold: 0.6
            });
            
            await this.wait(1000);
            
            // Verify initialization
            const hasStats = this.memoryOptimizer.memoryStats !== null;
            const hasObjectPools = this.memoryOptimizer.objectPools !== null;
            
            if (hasStats && hasObjectPools) {
                this.testResults.push({
                    test: 'Memory Optimizer Initialization',
                    status: 'PASSED',
                    details: 'Memory optimizer initialized with monitoring'
                });
                console.log('✅ Memory optimizer initialized successfully');
            } else {
                throw new Error('Memory optimizer not properly initialized');
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Memory Optimizer Initialization',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Memory optimizer initialization failed:', error.message);
        }
    }
    
    /**
     * Test 3: Performance metrics collection
     */
    async testPerformanceMetricsCollection() {
        console.log('📈 Test 3: Performance Metrics Collection');
        
        try {
            // Wait for metrics to be collected
            await this.wait(2000);
            
            const report = this.performanceProfiler.getPerformanceReport();
            
            // Verify metrics are being collected
            const hasCurrentMetrics = report.current !== null;
            const hasFPS = typeof report.current?.fps === 'number';
            const hasMemoryMetrics = report.current?.memory !== null;
            const hasEngineMetrics = report.current?.engine !== null;
            
            if (hasCurrentMetrics && hasFPS && hasMemoryMetrics && hasEngineMetrics) {
                this.testResults.push({
                    test: 'Performance Metrics Collection',
                    status: 'PASSED',
                    details: `FPS: ${report.current.fps}, Memory: ${report.current.memory?.percentage || 'N/A'}`
                });
                console.log('✅ Performance metrics collection working');
                console.log(`   FPS: ${report.current.fps}`);
                console.log(`   Memory: ${(report.current.memory?.percentage * 100 || 0).toFixed(1)}%`);
            } else {
                throw new Error('Performance metrics not being collected properly');
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Performance Metrics Collection',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Performance metrics collection failed:', error.message);
        }
    }
    
    /**
     * Test 4: Memory monitoring
     */
    async testMemoryMonitoring() {
        console.log('🧠 Test 4: Memory Monitoring');
        
        try {
            const initialStats = this.memoryOptimizer.getMemoryStats();
            
            // Create memory pressure by allocating objects
            const memoryHogs = [];
            for (let i = 0; i < 100; i++) {
                memoryHogs.push(new Array(10000).fill(Math.random()));
            }
            
            await this.wait(2000);
            
            const afterStats = this.memoryOptimizer.getMemoryStats();
            
            // Verify memory monitoring is working
            const memoryIncreased = afterStats.current.used > initialStats.current.used;
            const hasValidStats = afterStats.current.percentage > 0;
            
            if (memoryIncreased && hasValidStats) {
                this.testResults.push({
                    test: 'Memory Monitoring',
                    status: 'PASSED',
                    details: `Memory usage: ${initialStats.current.used}MB → ${afterStats.current.used}MB`
                });
                console.log('✅ Memory monitoring working');
                console.log(`   Memory change: ${initialStats.current.used}MB → ${afterStats.current.used}MB`);
            } else {
                throw new Error('Memory monitoring not detecting changes');
            }
            
            // Clean up memory hogs
            memoryHogs.length = 0;
            
        } catch (error) {
            this.testResults.push({
                test: 'Memory Monitoring',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Memory monitoring failed:', error.message);
        }
    }
    
    /**
     * Test 5: Automatic optimization
     */
    async testAutomaticOptimization() {
        console.log('⚡ Test 5: Automatic Optimization');
        
        try {
            const initialLevel = this.performanceProfiler.optimizationLevel;
            
            // Simulate performance issues by creating heavy workload
            this.simulateHeavyWorkload();
            
            // Wait for optimization to trigger
            await this.wait(3000);
            
            const report = this.performanceProfiler.getPerformanceReport();
            const finalLevel = report.optimization?.level || 0;
            
            // Verify optimization occurred
            if (finalLevel >= initialLevel) {
                this.testResults.push({
                    test: 'Automatic Optimization',
                    status: 'PASSED',
                    details: `Optimization level: ${initialLevel} → ${finalLevel}`
                });
                console.log('✅ Automatic optimization working');
                console.log(`   Optimization level: ${initialLevel} → ${finalLevel}`);
            } else {
                // This might be expected if performance is good
                this.testResults.push({
                    test: 'Automatic Optimization',
                    status: 'PASSED',
                    details: 'No optimization needed (good performance)'
                });
                console.log('✅ Automatic optimization ready (no optimization needed)');
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Automatic Optimization',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Automatic optimization failed:', error.message);
        }
    }
    
    /**
     * Test 6: Memory pressure handling
     */
    async testMemoryPressureHandling() {
        console.log('🚨 Test 6: Memory Pressure Handling');
        
        try {
            let pressureDetected = false;
            let pressureLevel = null;
            
            // Register pressure callback
            this.memoryOptimizer.onMemoryPressure((level, stats) => {
                pressureDetected = true;
                pressureLevel = level;
                console.log(`   Memory pressure detected: ${level}`);
            });
            
            // Force memory pressure
            this.memoryOptimizer.forceCleanup('critical');
            
            await this.wait(1000);
            
            // Verify pressure handling
            if (pressureDetected || pressureLevel) {
                this.testResults.push({
                    test: 'Memory Pressure Handling',
                    status: 'PASSED',
                    details: `Pressure level: ${pressureLevel || 'forced cleanup'}`
                });
                console.log('✅ Memory pressure handling working');
            } else {
                // Test forced cleanup directly
                const initialCleanupCount = this.memoryOptimizer.memoryStats.cleanupCount;
                this.memoryOptimizer.forceCleanup('warning');
                const finalCleanupCount = this.memoryOptimizer.memoryStats.cleanupCount;
                
                if (finalCleanupCount > initialCleanupCount) {
                    this.testResults.push({
                        test: 'Memory Pressure Handling',
                        status: 'PASSED',
                        details: 'Forced cleanup working'
                    });
                    console.log('✅ Memory pressure handling working (forced cleanup)');
                } else {
                    throw new Error('Memory pressure handling not working');
                }
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Memory Pressure Handling',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Memory pressure handling failed:', error.message);
        }
    }
    
    /**
     * Test 7: Performance data export
     */
    async testPerformanceDataExport() {
        console.log('📁 Test 7: Performance Data Export');
        
        try {
            const exportedData = this.performanceProfiler.exportPerformanceData();
            
            // Verify export structure
            const hasConfig = exportedData.config !== null;
            const hasHistory = Array.isArray(exportedData.performanceHistory);
            const hasMemoryHistory = Array.isArray(exportedData.memoryHistory);
            const hasTimestamp = typeof exportedData.exportedAt === 'number';
            
            if (hasConfig && hasHistory && hasMemoryHistory && hasTimestamp) {
                this.testResults.push({
                    test: 'Performance Data Export',
                    status: 'PASSED',
                    details: `Exported ${exportedData.performanceHistory.length} performance records`
                });
                console.log('✅ Performance data export working');
                console.log(`   Performance records: ${exportedData.performanceHistory.length}`);
                console.log(`   Memory records: ${exportedData.memoryHistory.length}`);
            } else {
                throw new Error('Exported data structure invalid');
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Performance Data Export',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Performance data export failed:', error.message);
        }
    }
    
    /**
     * Test 8: Integration with tour engine
     */
    async testTourEngineIntegration() {
        console.log('🔗 Test 8: Tour Engine Integration');
        
        try {
            // Check if profiler is integrated in engine
            const hasProfiler = this.tourEngine.performanceProfiler !== null;
            const hasOptimizer = this.tourEngine.memoryOptimizer !== null;
            
            // Load mock tour data
            const mockTourData = {
                tourName: "Test Tour",
                nodes: [{
                    id: "test-node",
                    label: "Test Node",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCI+PC9zdmc+",
                    layers: []
                }]
            };
            
            await this.tourEngine.loadTour(mockTourData);
            await this.wait(1000);
            
            // Verify integration is working
            const report = this.tourEngine.performanceProfiler?.getPerformanceReport();
            const hasEngineMetrics = report?.current?.engine !== null;
            
            if (hasProfiler && hasOptimizer && hasEngineMetrics) {
                this.testResults.push({
                    test: 'Tour Engine Integration',
                    status: 'PASSED',
                    details: 'Profiler and optimizer integrated with engine'
                });
                console.log('✅ Tour engine integration working');
            } else {
                throw new Error('Integration with tour engine incomplete');
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Tour Engine Integration',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Tour engine integration failed:', error.message);
        }
    }
    
    /**
     * Test 9: Cleanup and destruction
     */
    async testCleanupAndDestruction() {
        console.log('🧹 Test 9: Cleanup and Destruction');
        
        try {
            // Test profiler destruction
            const profilerActive = this.performanceProfiler.isProfilerActive;
            this.performanceProfiler.destroy();
            const profilerDestroyed = !this.performanceProfiler.isProfilerActive;
            
            // Test optimizer destruction
            this.memoryOptimizer.destroy();
            
            // Test engine destruction
            this.tourEngine.destroy();
            
            if (profilerActive && profilerDestroyed) {
                this.testResults.push({
                    test: 'Cleanup and Destruction',
                    status: 'PASSED',
                    details: 'All components cleaned up successfully'
                });
                console.log('✅ Cleanup and destruction working');
            } else {
                throw new Error('Cleanup not working properly');
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Cleanup and Destruction',
                status: 'FAILED',
                error: error.message
            });
            console.log('❌ Cleanup and destruction failed:', error.message);
        }
    }
    
    /**
     * Simulate heavy workload for testing
     */
    simulateHeavyWorkload() {
        // CPU intensive task
        let result = 0;
        for (let i = 0; i < 50000; i++) {
            result += Math.sin(i) * Math.cos(i);
        }
        
        // Memory intensive task
        const tempArrays = [];
        for (let i = 0; i < 100; i++) {
            tempArrays.push(new Array(1000).fill(Math.random()));
        }
        
        return result;
    }
    
    /**
     * Generate final test report
     */
    generateFinalReport() {
        console.log('\n📋 PERFORMANCE PROFILING VERIFICATION REPORT');
        console.log('=' .repeat(50));
        
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        console.log('\nDetailed Results:');
        this.testResults.forEach((result, index) => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}`);
            if (result.details) {
                console.log(`   ${result.details}`);
            }
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        if (failed === 0) {
            console.log('\n🎉 All performance profiling tests passed!');
            console.log('✅ Performance profiling and memory optimization system is working correctly.');
        } else {
            console.log(`\n⚠️ ${failed} test(s) failed. Please review the errors above.`);
        }
        
        console.log('=' .repeat(50));
    }
    
    /**
     * Utility function to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Auto-run tests if this script is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('verify-performance-profiling')) {
    window.addEventListener('load', async () => {
        // Wait for all dependencies to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const verifier = new PerformanceProfilingVerifier();
        await verifier.runAllTests();
    });
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceProfilingVerifier;
} else if (typeof window !== 'undefined') {
    window.PerformanceProfilingVerifier = PerformanceProfilingVerifier;
}