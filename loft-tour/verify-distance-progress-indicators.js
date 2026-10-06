/**
 * Verification Script for Distance & Progress Indicators
 * Tests the enhanced functionality of distance overlay and progress indicators
 */

class DistanceProgressVerifier {
    constructor() {
        this.testResults = [];
        this.mockViewer = null;
        this.matterportUI = null;
    }
    
    /**
     * Run all verification tests
     */
    async runAllTests() {
        console.log('🧪 Starting Distance & Progress Indicators Verification...\n');
        
        try {
            await this.setupMockEnvironment();
            await this.testDistanceCalculation();
            await this.testProgressIndicators();
            await this.testIconUpdates();
            await this.testTimeEstimates();
            await this.testMilestoneAnimations();
            await this.testResponsiveDesign();
            
            this.printResults();
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
            return false;
        }
        
        return this.testResults.every(result => result.passed);
    }
    
    /**
     * Setup mock environment for testing
     */
    async setupMockEnvironment() {
        console.log('📋 Setting up mock environment...');
        
        // Create mock container
        const container = document.createElement('div');
        container.id = 'test-container';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.position = 'relative';
        document.body.appendChild(container);
        
        // Create mock viewer
        this.mockViewer = {
            container: container,
            toggleFullscreen: () => Promise.resolve(),
            engine: {
                nextNode: () => Promise.resolve(),
                previousNode: () => Promise.resolve()
            }
        };
        
        // Initialize MatterportUI
        if (typeof MatterportUI !== 'undefined') {
            this.matterportUI = new MatterportUI(this.mockViewer, {
                autoHideDelay: 10000,
                showDistanceOverlay: true,
                showProgressIndicator: true
            });
            
            this.addTestResult('Mock Environment Setup', true, 'Environment created successfully');
        } else {
            throw new Error('MatterportUI class not found');
        }
    }
    
    /**
     * Test distance calculation functionality
     */
    async testDistanceCalculation() {
        console.log('📏 Testing distance calculation...');
        
        const testTourData = {
            nodes: [
                { id: 'entrance', label: 'Entrance', type: 'entrance', distanceFromEntrance: 0 },
                { id: 'lobby', label: 'Lobby', type: 'lobby', distanceFromEntrance: 5 },
                { id: 'living', label: 'Living Room', type: 'living', distanceFromEntrance: 12 },
                { id: 'kitchen', label: 'Kitchen', type: 'kitchen', distanceFromEntrance: 18 },
                { id: 'bedroom', label: 'Bedroom', type: 'bedroom', distanceFromEntrance: 25 }
            ]
        };
        
        this.matterportUI.loadTour(testTourData);
        
        // Test distance calculation for each node
        const testCases = [
            { index: 0, expectedDistance: '0m', description: 'Entrance distance' },
            { index: 1, expectedDistance: '5m', description: 'Lobby distance' },
            { index: 2, expectedDistance: '12m', description: 'Living room distance' },
            { index: 3, expectedDistance: '18m', description: 'Kitchen distance' },
            { index: 4, expectedDistance: '25m', description: 'Bedroom distance' }
        ];
        
        let allPassed = true;
        
        for (const testCase of testCases) {
            this.matterportUI.updateRoomInfo(testTourData.nodes[testCase.index], testCase.index);
            
            // Wait for UI update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const distanceElement = document.getElementById('distance-value');
            const actualDistance = distanceElement ? distanceElement.textContent : 'Not found';
            
            const passed = actualDistance === testCase.expectedDistance;
            if (!passed) allPassed = false;
            
            console.log(`  ${passed ? '✅' : '❌'} ${testCase.description}: Expected ${testCase.expectedDistance}, Got ${actualDistance}`);
        }
        
        this.addTestResult('Distance Calculation', allPassed, 
            allPassed ? 'All distance calculations correct' : 'Some distance calculations failed');
    }
    
    /**
     * Test progress indicators functionality
     */
    async testProgressIndicators() {
        console.log('📊 Testing progress indicators...');
        
        const testTourData = {
            nodes: [
                { id: 'node1', label: 'Node 1' },
                { id: 'node2', label: 'Node 2' },
                { id: 'node3', label: 'Node 3' },
                { id: 'node4', label: 'Node 4' }
            ]
        };
        
        this.matterportUI.loadTour(testTourData);
        
        const testCases = [
            { index: 0, expectedProgress: 25, expectedText: '1 of 4' },
            { index: 1, expectedProgress: 50, expectedText: '2 of 4' },
            { index: 2, expectedProgress: 75, expectedText: '3 of 4' },
            { index: 3, expectedProgress: 100, expectedText: '4 of 4' }
        ];
        
        let allPassed = true;
        
        for (const testCase of testCases) {
            this.matterportUI.updateRoomInfo(testTourData.nodes[testCase.index], testCase.index);
            
            // Wait for UI update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const progressFill = document.getElementById('progress-fill');
            const progressCurrent = document.getElementById('progress-current');
            const progressTotal = document.getElementById('progress-total');
            
            const actualProgress = progressFill ? parseFloat(progressFill.style.width) : 0;
            const actualText = progressCurrent && progressTotal ? 
                `${progressCurrent.textContent} of ${progressTotal.textContent}` : 'Not found';
            
            const progressPassed = Math.abs(actualProgress - testCase.expectedProgress) < 1;
            const textPassed = actualText === testCase.expectedText;
            const passed = progressPassed && textPassed;
            
            if (!passed) allPassed = false;
            
            console.log(`  ${passed ? '✅' : '❌'} Node ${testCase.index + 1}: Progress ${actualProgress}% (expected ${testCase.expectedProgress}%), Text "${actualText}"`);
        }
        
        this.addTestResult('Progress Indicators', allPassed, 
            allPassed ? 'All progress indicators working correctly' : 'Some progress indicators failed');
    }
    
    /**
     * Test icon updates based on tour progress
     */
    async testIconUpdates() {
        console.log('🎯 Testing icon updates...');
        
        const testTourData = {
            nodes: [
                { id: 'entrance', label: 'Entrance' },
                { id: 'middle1', label: 'Middle 1' },
                { id: 'middle2', label: 'Middle 2' },
                { id: 'end', label: 'End' }
            ]
        };
        
        this.matterportUI.loadTour(testTourData);
        
        const testCases = [
            { index: 0, expectedIcon: 'fa-door-open', description: 'Entrance icon' },
            { index: 1, expectedIcon: 'fa-map-marker-alt', description: 'Early tour icon' },
            { index: 2, expectedIcon: 'fa-home', description: 'Middle tour icon' },
            { index: 3, expectedIcon: 'fa-flag-checkered', description: 'End tour icon' }
        ];
        
        let allPassed = true;
        
        for (const testCase of testCases) {
            this.matterportUI.updateRoomInfo(testTourData.nodes[testCase.index], testCase.index);
            
            // Wait for UI update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const distanceIcon = document.querySelector('.distance-icon i');
            const actualIcon = distanceIcon ? distanceIcon.className : 'Not found';
            
            const passed = actualIcon.includes(testCase.expectedIcon);
            if (!passed) allPassed = false;
            
            console.log(`  ${passed ? '✅' : '❌'} ${testCase.description}: Expected ${testCase.expectedIcon}, Got ${actualIcon}`);
        }
        
        this.addTestResult('Icon Updates', allPassed, 
            allPassed ? 'All icon updates working correctly' : 'Some icon updates failed');
    }
    
    /**
     * Test time estimates functionality
     */
    async testTimeEstimates() {
        console.log('⏱️ Testing time estimates...');
        
        const testTourData = {
            nodes: [
                { id: 'node1', label: 'Node 1' },
                { id: 'node2', label: 'Node 2' },
                { id: 'node3', label: 'Node 3' },
                { id: 'node4', label: 'Node 4' },
                { id: 'node5', label: 'Node 5' }
            ]
        };
        
        this.matterportUI.loadTour(testTourData);
        
        const testCases = [
            { index: 0, expectedRemaining: 4, description: 'First node time estimate' },
            { index: 2, expectedRemaining: 2, description: 'Middle node time estimate' },
            { index: 4, expectedRemaining: 0, description: 'Last node time estimate' }
        ];
        
        let allPassed = true;
        
        for (const testCase of testCases) {
            this.matterportUI.updateRoomInfo(testTourData.nodes[testCase.index], testCase.index);
            
            // Wait for UI update
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const timeEstimate = document.querySelector('.time-estimate');
            const hasTimeEstimate = !!timeEstimate;
            
            let passed = true;
            if (testCase.expectedRemaining > 0) {
                passed = hasTimeEstimate && timeEstimate.textContent.includes('remaining');
            } else {
                passed = !hasTimeEstimate; // Should not show time estimate for last node
            }
            
            if (!passed) allPassed = false;
            
            console.log(`  ${passed ? '✅' : '❌'} ${testCase.description}: ${hasTimeEstimate ? timeEstimate.textContent : 'No time estimate'}`);
        }
        
        this.addTestResult('Time Estimates', allPassed, 
            allPassed ? 'Time estimates working correctly' : 'Time estimates failed');
    }
    
    /**
     * Test milestone animations
     */
    async testMilestoneAnimations() {
        console.log('🎨 Testing milestone animations...');
        
        const testTourData = {
            nodes: [
                { id: 'node1', label: 'Node 1' },
                { id: 'node2', label: 'Node 2' },
                { id: 'node3', label: 'Node 3' },
                { id: 'node4', label: 'Node 4' }
            ]
        };
        
        this.matterportUI.loadTour(testTourData);
        
        // Test different milestone states
        const milestones = [
            { index: 0, expectedClass: null, description: '25% milestone' },
            { index: 1, expectedClass: 'progress-half', description: '50% milestone' },
            { index: 2, expectedClass: 'progress-three-quarter', description: '75% milestone' },
            { index: 3, expectedClass: 'progress-complete', description: '100% milestone' }
        ];
        
        let allPassed = true;
        
        for (const milestone of milestones) {
            this.matterportUI.updateRoomInfo(testTourData.nodes[milestone.index], milestone.index);
            
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const progressFill = document.getElementById('progress-fill');
            const hasExpectedClass = milestone.expectedClass ? 
                progressFill.classList.contains(milestone.expectedClass) : true;
            
            if (!hasExpectedClass) allPassed = false;
            
            console.log(`  ${hasExpectedClass ? '✅' : '❌'} ${milestone.description}: ${milestone.expectedClass || 'No special class'}`);
        }
        
        this.addTestResult('Milestone Animations', allPassed, 
            allPassed ? 'Milestone animations working correctly' : 'Some milestone animations failed');
    }
    
    /**
     * Test responsive design
     */
    async testResponsiveDesign() {
        console.log('📱 Testing responsive design...');
        
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;
        
        try {
            // Test mobile viewport
            Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });
            
            // Trigger resize event
            window.dispatchEvent(new Event('resize'));
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const distanceOverlay = document.querySelector('.distance-overlay');
            const progressIndicator = document.querySelector('.progress-indicator');
            
            const elementsExist = distanceOverlay && progressIndicator;
            const mobileOptimized = elementsExist && 
                window.getComputedStyle(distanceOverlay).position === 'absolute' &&
                window.getComputedStyle(progressIndicator).position === 'absolute';
            
            this.addTestResult('Responsive Design', mobileOptimized, 
                mobileOptimized ? 'Responsive design working correctly' : 'Responsive design issues detected');
            
            console.log(`  ${mobileOptimized ? '✅' : '❌'} Mobile viewport test: Elements positioned correctly`);
            
        } finally {
            // Restore original viewport
            Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalHeight, configurable: true });
            window.dispatchEvent(new Event('resize'));
        }
    }
    
    /**
     * Add test result
     */
    addTestResult(testName, passed, message) {
        this.testResults.push({
            name: testName,
            passed: passed,
            message: message
        });
    }
    
    /**
     * Print test results summary
     */
    printResults() {
        console.log('\n📋 VERIFICATION RESULTS:');
        console.log('========================');
        
        let passedCount = 0;
        let totalCount = this.testResults.length;
        
        this.testResults.forEach(result => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${result.name}: ${result.message}`);
            if (result.passed) passedCount++;
        });
        
        console.log('========================');
        console.log(`📊 Summary: ${passedCount}/${totalCount} tests passed`);
        
        if (passedCount === totalCount) {
            console.log('🎉 All tests passed! Distance & Progress Indicators are working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Please review the implementation.');
        }
    }
    
    /**
     * Cleanup test environment
     */
    cleanup() {
        if (this.matterportUI) {
            this.matterportUI.destroy();
        }
        
        const testContainer = document.getElementById('test-container');
        if (testContainer) {
            testContainer.remove();
        }
    }
}

// Export for use in browser or Node.js
if (typeof window !== 'undefined') {
    window.DistanceProgressVerifier = DistanceProgressVerifier;
    
    // Auto-run verification if this script is loaded directly
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            const verifier = new DistanceProgressVerifier();
            await verifier.runAllTests();
            verifier.cleanup();
        });
    } else {
        // DOM already loaded
        setTimeout(async () => {
            const verifier = new DistanceProgressVerifier();
            await verifier.runAllTests();
            verifier.cleanup();
        }, 100);
    }
} else {
    module.exports = DistanceProgressVerifier;
}