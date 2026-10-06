/**
 * LOFT³ Auto-Hiding UI Verification Script
 * Tests the auto-hiding UI with room/floor labels functionality
 */

class AutoHidingUIVerifier {
    constructor() {
        this.testResults = [];
        this.viewer = null;
        this.startTime = Date.now();
    }
    
    /**
     * Run all verification tests
     */
    async runAllTests() {
        console.log('🧪 Starting Auto-Hiding UI Verification Tests...\n');
        
        try {
            // Test 1: UI Auto-Hide Functionality
            await this.testUIAutoHide();
            
            // Test 2: Room Label Fade In/Out
            await this.testRoomLabelFade();
            
            // Test 3: Floor Label Updates
            await this.testFloorLabelUpdates();
            
            // Test 4: UI Show on Interaction
            await this.testUIShowOnInteraction();
            
            // Test 5: Room Label Hover Effects
            await this.testRoomLabelHover();
            
            // Test 6: Mobile Touch Interactions
            await this.testMobileInteractions();
            
            // Generate final report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
            this.addResult('CRITICAL', 'Verification process failed', false, error.message);
        }
    }
    
    /**
     * Test UI auto-hide functionality
     */
    async testUIAutoHide() {
        console.log('🔍 Testing UI Auto-Hide Functionality...');
        
        try {
            // Check if MatterportUI class exists
            if (typeof MatterportUI === 'undefined') {
                throw new Error('MatterportUI class not found');
            }
            
            // Create mock viewer for testing
            const mockViewer = {
                container: document.createElement('div')
            };
            
            // Initialize UI with short auto-hide delay for testing
            const ui = new MatterportUI(mockViewer, {
                autoHideDelay: 1000, // 1 second for testing
                showRoomLabels: true,
                showDistanceOverlay: true,
                showProgressIndicator: true
            });
            
            // Test initial state
            this.addResult('UI_INIT', 'UI initializes correctly', ui.isUIVisible === true);
            
            // Test auto-hide timing
            ui.showUI();
            const initialVisible = ui.isUIVisible;
            
            // Wait for auto-hide
            await this.wait(1200);
            const afterAutoHide = ui.isUIVisible;
            
            this.addResult('AUTO_HIDE', 'UI auto-hides after delay', 
                initialVisible === true && afterAutoHide === false);
            
            // Test show UI method
            ui.showUI();
            this.addResult('SHOW_UI', 'showUI() method works', ui.isUIVisible === true);
            
            // Test hide UI method
            ui.hideUI();
            this.addResult('HIDE_UI', 'hideUI() method works', ui.isUIVisible === false);
            
            // Cleanup
            ui.destroy();
            
        } catch (error) {
            this.addResult('UI_AUTO_HIDE', 'UI auto-hide test failed', false, error.message);
        }
    }
    
    /**
     * Test room label fade in/out functionality
     */
    async testRoomLabelFade() {
        console.log('🔍 Testing Room Label Fade Functionality...');
        
        try {
            const mockViewer = {
                container: document.createElement('div')
            };
            
            const ui = new MatterportUI(mockViewer, {
                autoHideDelay: 5000,
                showRoomLabels: true
            });
            
            // Test room label visibility state
            this.addResult('LABEL_INIT', 'Room labels initialize as visible', 
                ui.roomLabelsVisible === true);
            
            // Test show room labels
            ui.showRoomLabels();
            this.addResult('SHOW_LABELS', 'showRoomLabels() works', 
                ui.roomLabelsVisible === true);
            
            // Test hide room labels
            ui.hideRoomLabels();
            this.addResult('HIDE_LABELS', 'hideRoomLabels() works', 
                ui.roomLabelsVisible === false);
            
            // Test room label fade delay
            ui.showRoomLabels();
            ui.scheduleRoomLabelFade();
            
            // Check that timeout is set
            this.addResult('LABEL_FADE_SCHEDULE', 'Room label fade is scheduled', 
                ui.roomLabelFadeTimeout !== null);
            
            // Wait for fade
            await this.wait(2200); // Wait for fade delay + buffer
            this.addResult('LABEL_AUTO_FADE', 'Room labels auto-fade after delay', 
                ui.roomLabelsVisible === false);
            
            ui.destroy();
            
        } catch (error) {
            this.addResult('ROOM_LABEL_FADE', 'Room label fade test failed', false, error.message);
        }
    }
    
    /**
     * Test floor label updates
     */
    async testFloorLabelUpdates() {
        console.log('🔍 Testing Floor Label Updates...');
        
        try {
            const mockViewer = {
                container: document.createElement('div')
            };
            
            const ui = new MatterportUI(mockViewer);
            
            // Test floor detection from index
            const groundFloor = ui.getFloorFromIndex(0);
            const secondFloor = ui.getFloorFromIndex(3);
            
            this.addResult('FLOOR_DETECTION', 'Floor detection from index works', 
                groundFloor === 'Ground Floor' && secondFloor === 'Floor 2');
            
            // Test room info update with floor
            const testNode = {
                id: 'test',
                label: 'Test Room',
                description: 'Test Description',
                floor: 'Second Floor'
            };
            
            // Mock the UI elements
            ui.ui.roomLabel = { textContent: '', style: { opacity: '1' } };
            ui.ui.roomSubtitle = { textContent: '', style: { opacity: '1' } };
            ui.ui.floorLabel = { textContent: '', style: { opacity: '1' } };
            
            ui.updateRoomInfo(testNode, 1);
            
            // Wait for fade animations
            await this.wait(300);
            
            this.addResult('FLOOR_LABEL_UPDATE', 'Floor label updates correctly', 
                ui.ui.floorLabel.textContent === 'Second Floor');
            
            ui.destroy();
            
        } catch (error) {
            this.addResult('FLOOR_LABEL', 'Floor label test failed', false, error.message);
        }
    }
    
    /**
     * Test UI show on interaction
     */
    async testUIShowOnInteraction() {
        console.log('🔍 Testing UI Show on Interaction...');
        
        try {
            const container = document.createElement('div');
            const mockViewer = { container };
            
            const ui = new MatterportUI(mockViewer, {
                autoHideDelay: 5000
            });
            
            // Hide UI first
            ui.hideUI();
            this.addResult('UI_HIDDEN', 'UI can be hidden', ui.isUIVisible === false);
            
            // Simulate mouse move
            const mouseMoveEvent = new Event('mousemove');
            container.dispatchEvent(mouseMoveEvent);
            
            this.addResult('MOUSE_INTERACTION', 'UI shows on mouse move', 
                ui.isUIVisible === true);
            
            // Hide UI again
            ui.hideUI();
            
            // Simulate touch
            const touchEvent = new Event('touchstart');
            container.dispatchEvent(touchEvent);
            
            this.addResult('TOUCH_INTERACTION', 'UI shows on touch', 
                ui.isUIVisible === true);
            
            ui.destroy();
            
        } catch (error) {
            this.addResult('UI_INTERACTION', 'UI interaction test failed', false, error.message);
        }
    }
    
    /**
     * Test room label hover effects
     */
    async testRoomLabelHover() {
        console.log('🔍 Testing Room Label Hover Effects...');
        
        try {
            const container = document.createElement('div');
            const mockViewer = { container };
            
            const ui = new MatterportUI(mockViewer);
            
            // Test room label creation
            const testNode = {
                labels: [
                    { x: 0.5, y: 0.5, text: 'Test Label' }
                ]
            };
            
            ui.showRoomLabels(testNode);
            
            const labelMarkers = ui.ui.roomLabelsOverlay.querySelectorAll('.room-label-marker');
            this.addResult('LABEL_CREATION', 'Room labels are created', 
                labelMarkers.length === 1);
            
            // Test label click handler
            const labelMarker = labelMarkers[0];
            if (labelMarker) {
                const clickEvent = new Event('click');
                labelMarker.dispatchEvent(clickEvent);
                
                // Should show UI on label click
                this.addResult('LABEL_CLICK', 'Label click shows UI', 
                    ui.isUIVisible === true);
            }
            
            ui.destroy();
            
        } catch (error) {
            this.addResult('LABEL_HOVER', 'Room label hover test failed', false, error.message);
        }
    }
    
    /**
     * Test mobile interactions
     */
    async testMobileInteractions() {
        console.log('🔍 Testing Mobile Interactions...');
        
        try {
            const container = document.createElement('div');
            const mockViewer = { container };
            
            const ui = new MatterportUI(mockViewer);
            
            // Test orientation change handler
            ui.hideUI();
            
            const orientationEvent = new Event('orientationchange');
            window.dispatchEvent(orientationEvent);
            
            // Wait for timeout
            await this.wait(150);
            
            this.addResult('ORIENTATION_CHANGE', 'UI shows on orientation change', 
                ui.isUIVisible === true);
            
            // Test focus event
            ui.hideUI();
            
            const focusEvent = new Event('focus');
            window.dispatchEvent(focusEvent);
            
            this.addResult('FOCUS_EVENT', 'UI shows on window focus', 
                ui.isUIVisible === true);
            
            ui.destroy();
            
        } catch (error) {
            this.addResult('MOBILE_INTERACTION', 'Mobile interaction test failed', false, error.message);
        }
    }
    
    /**
     * Add test result
     */
    addResult(testId, description, passed, error = null) {
        const result = {
            testId,
            description,
            passed,
            error,
            timestamp: Date.now() - this.startTime
        };
        
        this.testResults.push(result);
        
        const status = passed ? '✅' : '❌';
        const errorMsg = error ? ` (${error})` : '';
        console.log(`${status} ${description}${errorMsg}`);
    }
    
    /**
     * Wait for specified milliseconds
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Generate final test report
     */
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('\n📊 AUTO-HIDING UI VERIFICATION REPORT');
        console.log('=====================================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Total Time: ${Date.now() - this.startTime}ms`);
        
        if (failedTests > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => {
                    console.log(`- ${r.description}: ${r.error || 'Unknown error'}`);
                });
        }
        
        console.log('\n📋 DETAILED RESULTS:');
        this.testResults.forEach(r => {
            const status = r.passed ? '✅' : '❌';
            console.log(`${status} [${r.testId}] ${r.description} (${r.timestamp}ms)`);
        });
        
        // Overall assessment
        if (successRate >= 90) {
            console.log('\n🎉 AUTO-HIDING UI IMPLEMENTATION: EXCELLENT');
        } else if (successRate >= 75) {
            console.log('\n✅ AUTO-HIDING UI IMPLEMENTATION: GOOD');
        } else if (successRate >= 50) {
            console.log('\n⚠️ AUTO-HIDING UI IMPLEMENTATION: NEEDS IMPROVEMENT');
        } else {
            console.log('\n❌ AUTO-HIDING UI IMPLEMENTATION: CRITICAL ISSUES');
        }
        
        return {
            totalTests,
            passedTests,
            failedTests,
            successRate: parseFloat(successRate),
            results: this.testResults
        };
    }
}

// Auto-run verification if this script is loaded directly
if (typeof window !== 'undefined') {
    window.AutoHidingUIVerifier = AutoHidingUIVerifier;
    
    // Auto-run after page load
    window.addEventListener('load', async () => {
        // Wait for other scripts to load
        setTimeout(async () => {
            const verifier = new AutoHidingUIVerifier();
            await verifier.runAllTests();
        }, 1000);
    });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoHidingUIVerifier;
}