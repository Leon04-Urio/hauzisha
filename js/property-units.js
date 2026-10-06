// Property Units System
// Handles multi-unit buildings (1BR, 2BR, Studio, etc.)

class PropertyUnits {
    constructor() {
        this.currentProperty = null;
        this.init();
    }
    
    init() {
        // Will be called when property details load
        this.renderUnitsSection();
    }
    
    renderUnitsSection() {
        // Try to get property from global scope or wait for it
        const property = window.property || (typeof getProperty === 'function' ? getProperty() : null);
        
        if (!property) {
            console.log('Property data not available yet, retrying...');
            return;
        }
        
        console.log('Checking property for units:', property);
        
        if (!property.units) {
            console.log('No units data found for this property');
            return;
        }
        
        const unitsData = typeof property.units === 'string' 
            ? JSON.parse(property.units) 
            : property.units;
            
        console.log('Units data:', unitsData);
            
        if (!unitsData || (!unitsData.available && !unitsData.unavailable)) {
            console.log('No valid units configuration found');
            return;
        }
        
        // Find where to insert units section (after amenities)
        const facilitiesSection = document.querySelector('.property-facilities');
        if (!facilitiesSection) {
            console.log('Facilities section not found, trying alternative selectors...');
            // Try alternative selectors
            const descriptionSections = document.querySelectorAll('.property-description');
            if (descriptionSections.length >= 2) {
                // Insert after the second description section (usually facilities)
                const targetSection = descriptionSections[1];
                this.insertUnitsSection(targetSection, unitsData);
                return;
            }
            console.log('Could not find suitable location to insert units section');
            return;
        }
        
        this.insertUnitsSection(facilitiesSection, unitsData);
    }
    
    insertUnitsSection(targetSection, unitsData) {
        // Check if units section already exists
        if (document.querySelector('.property-units')) {
            console.log('Units section already exists');
            return;
        }
        
        const unitsSection = document.createElement('div');
        unitsSection.className = 'property-description property-units';
        unitsSection.innerHTML = this.generateUnitsHTML(unitsData);
        
        // Insert after target section
        targetSection.parentNode.insertBefore(unitsSection, targetSection.nextSibling);
        
        console.log('Units section inserted successfully');
        
        // Add click handlers
        this.attachUnitClickHandlers(unitsData);
    }
    
    generateUnitsHTML(unitsData) {
        const available = unitsData.available || [];
        const unavailable = unitsData.unavailable || [];
        const linkedProperties = unitsData.linked_properties || {};
        
        let unitsHTML = '';
        
        // Available units
        available.forEach(unit => {
            const propertyId = linkedProperties[unit];
            unitsHTML += `
                <button class="unit-btn available" 
                        data-unit="${unit}" 
                        data-property-id="${propertyId || ''}"
                        ${!propertyId ? 'disabled' : ''}>
                    <i class="fas fa-info-circle"></i> ${unit.toUpperCase()} Unit
                </button>
            `;
        });
        
        // Unavailable units
        unavailable.forEach(unit => {
            unitsHTML += `
                <button class="unit-btn unavailable" disabled>
                    <i class="fas fa-info-circle"></i> ${unit.toUpperCase()} Unit
                </button>
            `;
        });
        
        return `
            <h3>Units Available</h3>
            <div class="units-container">
                ${unitsHTML}
            </div>
        `;
    }
    
    attachUnitClickHandlers(unitsData) {
        document.querySelectorAll('.unit-btn.available:not([disabled])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propertyId = btn.dataset.propertyId;
                
                if (propertyId) {
                    // Direct navigation to the unit's property page
                    window.location.href = `/hauzisha/property-details.php?id=${propertyId}`;
                }
            });
        });
    }
}

// Initialize when property details load
document.addEventListener('DOMContentLoaded', () => {
    // Don't run if bidirectional units system is active
    if (window.BIDIRECTIONAL_UNITS_ACTIVE) {
        console.log('PropertyUnits: Bidirectional system is active, skipping regular units');
        return;
    }
    
    console.log('PropertyUnits: DOM loaded, waiting for property data...');
    
    // Wait for property data to be available
    const checkProperty = () => {
        if (window.property) {
            console.log('PropertyUnits: Property data found, initializing...');
            new PropertyUnits();
        } else {
            setTimeout(checkProperty, 200);
        }
    };
    
    // Start checking immediately
    checkProperty();
    
    // Also listen for a custom event in case property loads later
    document.addEventListener('propertyLoaded', () => {
        console.log('PropertyUnits: Property loaded event received');
        if (!document.querySelector('.property-units')) {
            new PropertyUnits();
        }
    });
});