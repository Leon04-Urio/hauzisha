# Layer Metadata Processing Implementation

## ✅ Task Completed: Layer Metadata Processing (Position, Scale, Parallax Factors)

**Date:** January 17, 2026  
**Status:** Complete and Tested  
**Task:** Layer metadata processing (position, scale, parallax factors)

---

## What Was Implemented

### 1. Enhanced Backend Processing (`LoftTour.php`)

**New Methods Added:**

#### `processNodeLayers($nodeId, $layersData, $nodeIdString)`
- Processes layer definitions from metadata
- Validates layer properties and applies range constraints
- Inserts layer records into `loft_tour_layers` table
- Handles both JSON and CSV metadata formats

#### `updateLayerImageUrl($layerId, $imageUrl)`
- Updates layer image URL after file upload
- Admin-only access with authentication check

#### `getLayersByNodeId($nodeId)`
- Retrieves all layers for a specific node
- Ordered by depth and creation order

#### `updateLayerProperties($layerId, $layerData)`
- Updates layer properties with validation
- Supports partial updates of layer attributes

**Enhanced Methods:**

#### `processMetadataArray($tourId, $data)`
- Now processes layer definitions from metadata
- Supports both JSON format (`id`, `layers`) and CSV format (`node_id`)
- Automatic transaction handling for data integrity
- Returns count of processed layers

---

## 2. Layer Property Processing

### Supported Layer Properties

| Property | Type | Range/Validation | Default | Description |
|----------|------|------------------|---------|-------------|
| `name` | string | Required | - | Layer identifier |
| `image` | string | Required | - | PNG image filename |
| `position.x` | float | 0.0 - 1.0 | 0.5 | Horizontal position (normalized) |
| `position.y` | float | 0.0 - 1.0 | 0.5 | Vertical position (normalized) |
| `parallaxFactor` | float | 0.0 - 1.0 | 0.5 | Parallax movement intensity |
| `scale` | float | 0.1 - 10.0 | 1.0 | Layer scale factor |
| `rotation` | float | Any | 0.0 | Rotation in degrees |
| `opacity` | float | 0.0 - 1.0 | 1.0 | Layer transparency |
| `depthOrder` | integer | Any | 0 | Z-index for layer sorting |
| `visible` | boolean | true/false | true | Layer visibility |

### Automatic Value Clamping

The system automatically clamps invalid values to valid ranges:

```php
// Position clamping (0-1 range)
$positionX = max(0, min(1, $positionX));
$positionY = max(0, min(1, $positionY));

// Parallax factor clamping (0-1 range)
$parallaxFactor = max(0, min(1, $parallaxFactor));

// Scale factor clamping (reasonable limits)
$scaleFactor = max(0.1, min(10.0, $scaleFactor));

// Opacity clamping (0-1 range)
$opacity = max(0, min(1, $opacity));
```

---

## 3. Database Schema

### `loft_tour_layers` Table Structure

```sql
CREATE TABLE `loft_tour_layers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) NOT NULL,
  `layer_name` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `position_x` decimal(5,4) NOT NULL,
  `position_y` decimal(5,4) NOT NULL,
  `scale_factor` decimal(5,4) DEFAULT 1.0000,
  `parallax_factor` decimal(5,4) DEFAULT 0.5000,
  `rotation` decimal(8,4) DEFAULT 0.0000,
  `opacity` decimal(3,2) DEFAULT 1.00,
  `depth_order` int(11) DEFAULT 0,
  `visible` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `node_id` (`node_id`),
  CONSTRAINT `loft_tour_layers_ibfk_1` FOREIGN KEY (`node_id`) REFERENCES `loft_tour_nodes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

---

## 4. Metadata Format Support

### JSON Format with Layers

```json
{
  "tourName": "Villa Walkthrough",
  "nodes": [
    {
      "id": "entrance",
      "label": "Main Entrance",
      "image": "entrance.jpg",
      "nextNode": "living_room",
      "rotationLimits": { "h": 30, "v": 10 },
      "layers": [
        {
          "name": "welcome_sign",
          "image": "welcome_sign.png",
          "position": { "x": 0.5, "y": 0.3 },
          "parallaxFactor": 0.5,
          "scale": 1.2,
          "rotation": 0,
          "opacity": 1.0,
          "visible": true
        },
        {
          "name": "security_camera",
          "image": "security_camera.png",
          "position": { "x": 0.85, "y": 0.25 },
          "parallaxFactor": 0.3,
          "scale": 0.8,
          "rotation": 15,
          "opacity": 0.9
        }
      ]
    }
  ]
}
```

### CSV Format (No Layer Support)

CSV format processes nodes only. Layers must be added separately through the visual editor or API.

```csv
node_id,label,image,next_node,rotation_h,rotation_v
entrance,Main Entrance,entrance.jpg,living_room,30,10
living_room,Living Room,living_room.jpg,,45,15
```

---

## 5. API Integration

### Existing Endpoint Enhanced

**`POST /api/index.php/process-tour-metadata`** (Admin only)

Now processes layer metadata automatically:

```javascript
// Frontend usage
const formData = new FormData();
formData.append('tour_id', tourId);
formData.append('metadata', jsonFile); // File with layer definitions

const response = await fetch('/api/index.php/process-tour-metadata', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(`Processed ${result.processed_count} nodes and ${result.layers_processed} layers`);
```

### Response Format

```json
{
  "success": true,
  "message": "Processed 3 nodes and 5 layers",
  "processed_count": 3,
  "layers_processed": 5,
  "errors": []
}
```

---

## 6. Frontend Integration

### Metadata Parser Support

The existing `LoftTourMetadataParser` already validates layer properties:

```javascript
const parser = new LoftTourMetadataParser();
const result = await parser.parseFile(metadataFile);

// Validation includes:
// - Required layer fields (name, image)
// - Position range validation (0-1)
// - Parallax factor range validation (0-1)
// - Scale factor validation (positive numbers)
// - PNG format recommendation for layers
```

### Layer Validation Rules

```javascript
// Position validation
if (layer.position.x < 0 || layer.position.x > 1) {
  warnings.push(`Position X should be between 0 and 1`);
}

// Parallax factor validation
if (layer.parallaxFactor < 0 || layer.parallaxFactor > 1) {
  warnings.push(`Parallax factor should be between 0 and 1`);
}

// Scale validation
if (layer.scale <= 0) {
  warnings.push(`Scale should be a positive number`);
}
```

---

## 7. Testing Results

### Backend Test Results

```
✓ Test tour created with ID: 4
✓ Metadata processed successfully
  - Nodes processed: 3
  - Layers processed: 3
✓ Tour retrieved with 3 nodes
  Node: entrance (Main Entrance)
    Layers: 2
      - welcome_sign: pos(0.5000,0.3000) parallax(0.5000) scale(1.2000)
      - security_camera: pos(0.8500,0.2500) parallax(0.3000) scale(0.8000)
  Node: living_room (Living Room)
    Layers: 1
      - sofa_highlight: pos(0.3000,0.6000) parallax(0.7000) scale(1.5000)
  Node: bedroom (Master Bedroom)
    No layers
✓ CSV format processed (no layers expected)
  - Nodes processed: 1
  - Layers processed: 0
✓ Test tour deleted
=== ALL TESTS PASSED ===
```

### Frontend Test Results

- ✅ JSON parsing with layer definitions
- ✅ Layer property validation
- ✅ Position range validation (0-1)
- ✅ Parallax factor validation (0-1)
- ✅ Scale factor validation
- ✅ Required field validation
- ✅ PNG format recommendations

---

## 8. Usage Examples

### Complete Workflow

1. **Create Metadata with Layers**
```json
{
  "tourName": "My Property Tour",
  "nodes": [
    {
      "id": "room1",
      "label": "Living Room",
      "image": "living_room.jpg",
      "layers": [
        {
          "name": "sofa_highlight",
          "image": "sofa.png",
          "position": { "x": 0.3, "y": 0.6 },
          "parallaxFactor": 0.7,
          "scale": 1.5
        }
      ]
    }
  ]
}
```

2. **Upload via API**
```javascript
const formData = new FormData();
formData.append('tour_id', tourId);
formData.append('metadata', metadataFile);

await fetch('/api/index.php/process-tour-metadata', {
  method: 'POST',
  body: formData
});
```

3. **Retrieve Tour with Layers**
```javascript
const response = await fetch(`/api/index.php/get-loft-tour?id=${tourId}`);
const tour = await response.json();

tour.tour.nodes.forEach(node => {
  console.log(`Node: ${node.label}`);
  node.layers.forEach(layer => {
    console.log(`  Layer: ${layer.layer_name} at (${layer.position_x}, ${layer.position_y})`);
  });
});
```

---

## 9. Error Handling

### Validation Errors

```php
// Missing required fields
"Node entrance, Layer 0: Missing layer name"
"Node entrance, Layer 1: Missing layer image"

// Invalid ranges (automatically corrected)
// Position X: 1.5 → 1.0 (clamped to max)
// Position Y: -0.5 → 0.0 (clamped to min)
// Parallax factor: 2.0 → 1.0 (clamped to max)
// Scale: -1.0 → 0.1 (clamped to min)
```

### Database Errors

```php
// Transaction rollback on failure
try {
  $this->conn->beginTransaction();
  // Process nodes and layers
  $this->conn->commit();
} catch (Exception $e) {
  $this->conn->rollBack();
  throw new Exception('Failed to process metadata: ' . $e->getMessage());
}
```

---

## 10. Performance Considerations

### Batch Processing

- All layers for a node are processed in a single transaction
- Existing layers are cleared before inserting new ones
- Foreign key constraints ensure data integrity

### Memory Usage

- Layers are processed one node at a time
- No large data structures held in memory
- Automatic cleanup of temporary files

### Database Optimization

- Indexed foreign key relationships
- Efficient queries with proper WHERE clauses
- Cascade delete for data consistency

---

## 11. Future Enhancements

### Planned Improvements

1. **Layer Image Upload Integration**
   - Automatic layer image processing during metadata upload
   - Image validation and compression
   - Thumbnail generation for layer previews

2. **Visual Layer Editor**
   - Drag-and-drop layer positioning
   - Real-time parallax preview
   - Layer property controls

3. **Layer Templates**
   - Reusable layer definitions
   - Layer library management
   - Cross-tour layer sharing

---

## 12. File Structure

```
api/classes/
└── LoftTour.php                    ← Enhanced with layer processing

loft-tour/
├── js/
│   └── loft-tour-metadata-parser.js ← Already supports layer validation
├── test-layer-metadata-processing.php ← Backend test
├── test-frontend-backend-integration.html ← Integration test
└── read/
    └── LAYER-METADATA-PROCESSING.md ← This documentation
```

---

## Conclusion

Layer metadata processing is **fully implemented and tested**. The system now supports:

- ✅ **Complete layer property processing** (position, scale, parallax factors)
- ✅ **Automatic value validation and clamping**
- ✅ **Database storage with proper relationships**
- ✅ **JSON and CSV metadata format support**
- ✅ **Frontend-backend integration**
- ✅ **Comprehensive error handling**
- ✅ **Transaction-safe processing**

**Status:** ✅ Ready for production use

---

**Implemented By:** Kiro AI  
**Date:** January 17, 2026  
**Version:** 1.0