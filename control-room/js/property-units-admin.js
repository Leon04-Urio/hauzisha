// Property Units Management for Admin
// Handles units configuration in add/edit property modals

let unitCounter = 0;
let editUnitCounter = 0;

// Add unit row for Add Property modal
function addUnitRow(unitType = '', propertyId = '', status = 'available') {
    const container = document.getElementById('unitsContainer');
    const unitId = `unit_${unitCounter++}`;
    
    const unitRow = document.createElement('div');
    unitRow.className = 'col-12 unit-row';
    unitRow.id = unitId;
    
    unitRow.innerHTML = `
        <div class="row g-2 align-items-center p-2 border rounded">
            <div class="col-md-3">
                <label class="form-label small">Unit Type</label>
                <input type="text" class="form-control form-control-sm unit-type-input" 
                       placeholder="e.g., 1br, 2br, studio" value="${unitType}">
            </div>
            <div class="col-md-4">
                <label class="form-label small">Link to Property</label>
                <select class="form-select form-select-sm unit-property-select">
                    <option value="">Select Property</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small">Status</label>
                <select class="form-select form-select-sm unit-status-select">
                    <option value="available" ${status === 'available' ? 'selected' : ''}>✅ Available</option>
                    <option value="unavailable" ${status === 'unavailable' ? 'selected' : ''}>❌ Unavailable</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label small">&nbsp;</label>
                <button type="button" class="btn btn-sm btn-outline-danger d-block" onclick="removeUnitRow('${unitId}')">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(unitRow);
    
    // Load properties for the dropdown
    loadPropertiesForUnit(unitRow.querySelector('.unit-property-select'), propertyId);
    
    // Add event listener for unit type change
    unitRow.querySelector('.unit-type-input').addEventListener('input', function() {
        filterPropertiesByType(this.value, unitRow.querySelector('.unit-property-select'));
    });
}

// Add unit row for Edit Property modal
function addEditUnitRow(unitType = '', propertyId = '', status = 'available') {
    const container = document.getElementById('editUnitsContainer');
    const unitId = `edit_unit_${editUnitCounter++}`;
    
    const unitRow = document.createElement('div');
    unitRow.className = 'col-12 unit-row';
    unitRow.id = unitId;
    
    unitRow.innerHTML = `
        <div class="row g-2 align-items-center p-2 border rounded">
            <div class="col-md-3">
                <label class="form-label small">Unit Type</label>
                <input type="text" class="form-control form-control-sm unit-type-input" 
                       placeholder="e.g., 1br, 2br, studio" value="${unitType}">
            </div>
            <div class="col-md-4">
                <label class="form-label small">Link to Property</label>
                <select class="form-select form-select-sm unit-property-select">
                    <option value="">Select Property</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small">Status</label>
                <select class="form-select form-select-sm unit-status-select">
                    <option value="available" ${status === 'available' ? 'selected' : ''}>✅ Available</option>
                    <option value="unavailable" ${status === 'unavailable' ? 'selected' : ''}>❌ Unavailable</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label small">&nbsp;</label>
                <button type="button" class="btn btn-sm btn-outline-danger d-block" onclick="removeUnitRow('${unitId}')">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(unitRow);
    
    // Load properties for the dropdown
    loadPropertiesForUnit(unitRow.querySelector('.unit-property-select'), propertyId);
    
    // Add event listener for unit type change
    unitRow.querySelector('.unit-type-input').addEventListener('input', function() {
        filterPropertiesByType(this.value, unitRow.querySelector('.unit-property-select'));
    });
}

// Remove unit row
function removeUnitRow(unitId) {
    const unitRow = document.getElementById(unitId);
    if (unitRow) {
        unitRow.remove();
    }
}

// Load properties for unit dropdown
async function loadPropertiesForUnit(selectElement, selectedId = '') {
    try {
        const response = await fetch('/hauzisha/api/index.php/properties');
        const data = await response.json();
        
        if (data.success && data.data) {
            selectElement.innerHTML = '<option value="">Select Property</option>';
            
            data.data.forEach(property => {
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = `${property.id} - ${property.name} (${property.type})`;
                if (property.id == selectedId) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load properties:', error);
    }
}

// Filter properties by type when unit type is entered
async function filterPropertiesByType(unitType, selectElement) {
    if (!unitType.trim()) {
        loadPropertiesForUnit(selectElement);
        return;
    }
    
    try {
        const response = await fetch('/hauzisha/api/index.php/properties');
        const data = await response.json();
        
        if (data.success && data.data) {
            selectElement.innerHTML = '<option value="">Select Property</option>';
            
            // Filter properties that match the unit type
            const filteredProperties = data.data.filter(property => {
                const propertyType = property.type.toLowerCase();
                const searchType = unitType.toLowerCase();
                
                // Match unit types like "1br" with "apartment", "studio" with "studio", etc.
                if (searchType.includes('br') && propertyType === 'apartment') return true;
                if (searchType.includes('studio') && propertyType === 'studio') return true;
                if (searchType.includes('office') && propertyType === 'office') return true;
                if (searchType.includes('villa') && propertyType === 'villa') return true;
                
                // Also match by name
                return property.name.toLowerCase().includes(searchType);
            });
            
            filteredProperties.forEach(property => {
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = `${property.id} - ${property.name} (${property.type})`;
                selectElement.appendChild(option);
            });
            
            // If no filtered results, show all
            if (filteredProperties.length === 0) {
                data.data.forEach(property => {
                    const option = document.createElement('option');
                    option.value = property.id;
                    option.textContent = `${property.id} - ${property.name} (${property.type})`;
                    selectElement.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Failed to filter properties:', error);
    }
}

// Collect units data from form
function collectUnitsData(containerId) {
    const container = document.getElementById(containerId);
    const unitRows = container.querySelectorAll('.unit-row');
    
    const available = [];
    const unavailable = [];
    const linkedProperties = {};
    
    unitRows.forEach(row => {
        const unitType = row.querySelector('.unit-type-input').value.trim();
        const propertyId = row.querySelector('.unit-property-select').value;
        const status = row.querySelector('.unit-status-select').value;
        
        if (unitType) {
            if (status === 'available' && propertyId) {
                available.push(unitType);
                linkedProperties[unitType] = parseInt(propertyId);
            } else if (status === 'unavailable') {
                unavailable.push(unitType);
            }
        }
    });
    
    // Return null if no units configured
    if (available.length === 0 && unavailable.length === 0) {
        return null;
    }
    
    return {
        available,
        unavailable,
        linked_properties: linkedProperties
    };
}

// Load units data into form (for edit mode)
function loadUnitsData(unitsData, containerId) {
    if (!unitsData) return;
    
    const container = document.getElementById(containerId);
    
    // Clear existing units
    container.querySelectorAll('.unit-row').forEach(row => row.remove());
    
    // Reset counter
    if (containerId === 'editUnitsContainer') {
        editUnitCounter = 0;
    } else {
        unitCounter = 0;
    }
    
    // Load available units
    if (unitsData.available) {
        unitsData.available.forEach(unitType => {
            const propertyId = unitsData.linked_properties ? unitsData.linked_properties[unitType] : '';
            if (containerId === 'editUnitsContainer') {
                addEditUnitRow(unitType, propertyId, 'available');
            } else {
                addUnitRow(unitType, propertyId, 'available');
            }
        });
    }
    
    // Load unavailable units
    if (unitsData.unavailable) {
        unitsData.unavailable.forEach(unitType => {
            if (containerId === 'editUnitsContainer') {
                addEditUnitRow(unitType, '', 'unavailable');
            } else {
                addUnitRow(unitType, '', 'unavailable');
            }
        });
    }
}

// Make functions globally available
window.addUnitRow = addUnitRow;
window.addEditUnitRow = addEditUnitRow;
window.removeUnitRow = removeUnitRow;
window.collectUnitsData = collectUnitsData;
window.loadUnitsData = loadUnitsData;