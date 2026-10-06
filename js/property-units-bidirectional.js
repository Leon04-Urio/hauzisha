// Bidirectional Property Units System
// Automatically creates reverse relationships for linked properties

// Disable regular property units system
window.BIDIRECTIONAL_UNITS_ACTIVE = true;

class BidirectionalUnits {
    constructor() {
        this.currentPropertyId = null;
        this.buildingProperties = [];
        this.init();
    }
    
    async init() {
        // Get current property ID from URL
        const params = new URLSearchParams(window.location.search);
        this.currentPropertyId = params.get("id");
        
        if (!this.currentPropertyId) return;
        
        // Wait for property data
        const checkProperty = () => {
            if (window.property) {
                this.processProperty(window.property);
            } else {
                setTimeout(checkProperty, 200);
            }
        };
        checkProperty();
        
        // Also listen for property loaded event
        document.addEventListener('propertyLoaded', (e) => {
            this.processProperty(e.detail);
        });
    }
    
    async processProperty(property) {
        console.log('Processing bidirectional units for property:', property.id);
        
        // Check if this property is part of a building (has units OR is linked by another property)
        const buildingData = await this.findBuildingRelationships(property.id);
        
        if (buildingData) {
            console.log('Found building relationships:', buildingData);
            this.renderBidirectionalUnits(buildingData, property.id);
        }
    }
    
    async findBuildingRelationships(propertyId) {
        try {
            // Fetch all properties to analyze relationships
            const response = await fetch('/hauzisha/api/index.php/properties');
            const data = await response.json();
            
            if (!data.success || !data.data) return null;
            
            const allProperties = data.data;
            let buildingData = null;
            
            // Method 1: Check if current property has units (it's the parent building)
            const currentProperty = allProperties.find(p => p.id == propertyId);
            if (currentProperty && currentProperty.units) {
                const unitsData = typeof currentProperty.units === 'string' 
                    ? JSON.parse(currentProperty.units) 
                    : currentProperty.units;
                    
                if (unitsData && unitsData.linked_properties) {
                    buildingData = {
                        parentId: propertyId,
                        parentName: currentProperty.name,
                        parentProperty: currentProperty,
                        units: unitsData,
                        allUnits: this.getAllLinkedProperties(unitsData.linked_properties, allProperties)
                    };
                }
            }
            
            // Method 2: Check if current property is linked by another property (it's a unit)
            if (!buildingData) {
                for (const property of allProperties) {
                    if (property.units) {
                        const unitsData = typeof property.units === 'string' 
                            ? JSON.parse(property.units) 
                            : property.units;
                            
                        if (unitsData && unitsData.linked_properties) {
                            const linkedIds = Object.values(unitsData.linked_properties);
                            if (linkedIds.includes(parseInt(propertyId))) {
                                // This property is a unit of another building
                                buildingData = {
                                    parentId: property.id,
                                    parentName: property.name,
                                    parentProperty: property,
                                    units: unitsData,
                                    allUnits: this.getAllLinkedProperties(unitsData.linked_properties, allProperties),
                                    isUnit: true
                                };
                                break;
                            }
                        }
                    }
                }
            }
            
            return buildingData;
            
        } catch (error) {
            console.error('Error finding building relationships:', error);
            return null;
        }
    }
    
    async getPropertyBeds(propertyId) {
        try {
            const response = await fetch(`/hauzisha/api/index.php/properties/${propertyId}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                console.log('Fetched property beds data:', data.data);
                return data.data.beds || data.data.bedrooms || data.data.bedroom || 0;
            }
            return 0;
        } catch (error) {
            console.error('Error fetching property beds:', error);
            return 0;
        }
    }
    
    getAllLinkedProperties(linkedProperties, allProperties) {
        const units = [];
        
        for (const [unitType, propertyId] of Object.entries(linkedProperties)) {
            const property = allProperties.find(p => p.id == propertyId);
            if (property) {
                units.push({
                    unitType,
                    propertyId,
                    property
                });
            }
        }
        
        return units;
    }

    renderBidirectionalUnits(buildingData, currentPropertyId) {
        // Remove any existing units sections to prevent duplicates
        document.querySelectorAll('.property-units').forEach(section => section.remove());
        
        // Find where to insert units section
        const facilitiesSection = document.querySelector('.property-facilities');
        if (!facilitiesSection) {
            console.log('Could not find facilities section for bidirectional units');
            return;
        }
        
        const unitsSection = document.createElement('div');
        unitsSection.className = 'property-description property-units';
        
        // Generate HTML for bidirectional units
        let unitsHTML = '';
        const availableUnits = buildingData.units.available || [];
        const unavailableUnits = buildingData.units.unavailable || [];
        
        // Show available units (excluding current property)
        availableUnits.forEach(unitType => {
            const linkedPropertyId = buildingData.units.linked_properties[unitType];
            const isCurrent = linkedPropertyId == currentPropertyId;
            
            // Skip current property - don't show it in the list
            if (!isCurrent) {
                unitsHTML += `
                    <span class="unit-link available" data-property-id="${linkedPropertyId}">
                        <i class="fa fa-building mb-1 mr-2" aria-hidden="true"></i> ${unitType.toUpperCase()} Unit
                    </span>
                `;
            }
        });
        
        // Show unavailable units
        unavailableUnits.forEach(unitType => {
            unitsHTML += `
                <span class="unit-link unavailable">
                    <i class="fas fa-info-circle"></i> ${unitType.toUpperCase()} Unit
                </span>
            `;
        });
        
        // Add main building as a unit link if this is a unit (use synchronous data)
        if (buildingData.isUnit && buildingData.parentId != currentPropertyId) {
            // Use the bedroom data from the parent property we already have
            const beds = buildingData.parentProperty.beds || 
                        buildingData.parentProperty.bedrooms || 
                        buildingData.parentProperty.bedroom || 
                        'Main';
            
            const bedroomText = beds !== 'Main' ? `${beds}BR` : 'Main';
            
            unitsHTML += `
                <span class="unit-link available" data-property-id="${buildingData.parentId}">
                    <i class="fas fa-info-circle"></i> ${bedroomText} Unit
                </span>
            `;
        }
        
        // Only render if we have units to show
        if (unitsHTML.trim()) {
            unitsSection.innerHTML = `
                <h3>Units</h3>
                <div class="units-container">
                    ${unitsHTML}
                </div>
            `;
            
            // Insert after facilities section
            facilitiesSection.parentNode.insertBefore(unitsSection, facilitiesSection.nextSibling);
            
            // Add click handlers
            this.attachClickHandlers();
            
            console.log('Bidirectional units section rendered successfully');
        }
    }
    
    attachClickHandlers() {
        document.querySelectorAll('.unit-link.available').forEach(link => {
            link.addEventListener('click', () => {
                const propertyId = link.dataset.propertyId;
                if (propertyId) {
                    window.location.href = `/hauzisha/property-details.php?id=${propertyId}`;
                }
            });
        });
    }
}

// Initialize bidirectional units system
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing bidirectional units system...');
    new BidirectionalUnits();
});