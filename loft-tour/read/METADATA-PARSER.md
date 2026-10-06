# LOFT³ Metadata Parser

## Overview

The metadata parser is a JavaScript module that parses JSON or CSV files to automatically generate tour structures. It validates the data, checks for errors, and creates a linear walkthrough path.

## Features

✅ **Dual Format Support** - Parse both JSON and CSV metadata files  
✅ **Comprehensive Validation** - Checks for missing fields, invalid references, circular dependencies  
✅ **Linear Path Generation** - Automatically orders nodes following the nextNode chain  
✅ **Layer Support** - Full support for parallax layers in JSON format  
✅ **Error Reporting** - Clear error messages with specific node/field information  
✅ **Template Generation** - Built-in templates for quick start  

## Usage

### Basic Usage

```javascript
const parser = new LoftTourMetadataParser();

// Parse a file
const result = await parser.parseFile(file);

// Access parsed data
const tourData = result.data;
const warnings = result.warnings;

// Generate linear walkthrough
const walkthrough = parser.generateLinearWalkthrough(tourData);
```

### In HTML

```html
<script src="js/loft-tour-metadata-parser.js"></script>
<script>
  const parser = new LoftTourMetadataParser();
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    try {
      const result = await parser.parseFile(file);
      console.log('Tour data:', result.data);
      console.log('Warnings:', result.warnings);
    } catch (error) {
      console.error('Parsing failed:', error.message);
    }
  });
</script>
```

## File Formats

### JSON Format

Full-featured format with support for layers:

```json
{
  "tourName": "My Tour",
  "description": "Optional description",
  "nodes": [
    {
      "id": "entrance",
      "label": "Main Entrance",
      "image": "entrance.jpg",
      "nextNode": "living_room",
      "rotationLimits": { "h": 30, "v": 10 },
      "initialYaw": 0,
      "initialPitch": 0,
      "order": 0,
      "layers": [
        {
          "name": "furniture",
          "image": "sofa.png",
          "position": { "x": 0.5, "y": 0.6 },
          "parallaxFactor": 0.5,
          "scale": 1.0,
          "rotation": 0,
          "opacity": 1.0
        }
      ]
    }
  ]
}
```

### CSV Format

Simplified format for basic tours (no layer support):

```csv
node_id,label,image,next_node,rotation_h,rotation_v,initial_yaw,initial_pitch,order
entrance,Main Entrance,entrance.jpg,living_room,30,10,0,0,0
living_room,Living Room,living_room.jpg,bedroom,45,15,0,0,1
bedroom,Master Bedroom,bedroom.jpg,,30,10,0,0,2
```

## Validation

The parser performs comprehensive validation:

### Required Fields
- ✅ `id` - Unique node identifier
- ✅ `label` - Display name
- ✅ `image` - Panorama filename

### Structural Validation
- ✅ Unique node IDs
- ✅ Valid next node references
- ✅ No circular references
- ✅ Valid image file extensions
- ✅ Rotation limits within valid ranges
- ✅ Layer positions in 0-1 range
- ✅ Parallax factors in 0-1 range

### Path Validation
- ✅ Entry point detection
- ✅ Linear path verification
- ✅ Orphaned node detection

## Error Handling

### Errors vs Warnings

**Errors** - Critical issues that prevent tour generation:
- Missing required fields
- Invalid node references
- Circular dependencies
- Malformed JSON/CSV

**Warnings** - Non-critical issues that should be reviewed:
- Invalid file extensions
- Out-of-range values
- Multiple entry points
- Orphaned nodes

### Example Error Output

```javascript
try {
  const result = await parser.parseFile(file);
} catch (error) {
  // Error message includes all validation errors
  console.error(error.message);
  // Output:
  // Validation failed:
  // Node 1 (entrance): Missing required field "image"
  // Invalid next node reference: "nonexistent" does not exist
}
```

## API Reference

### Constructor

```javascript
const parser = new LoftTourMetadataParser();
```

### Methods

#### `parseFile(file)`

Parse a metadata file (JSON or CSV).

**Parameters:**
- `file` (File) - The file to parse

**Returns:** Promise<Object>
```javascript
{
  data: {
    tourName: string,
    description: string,
    nodes: Array<Node>
  },
  warnings: Array<string>
}
```

**Throws:** Error if validation fails

---

#### `generateLinearWalkthrough(data)`

Generate ordered array of nodes following the nextNode chain.

**Parameters:**
- `data` (Object) - Parsed tour data

**Returns:** Array<Node> - Ordered nodes from entry to exit

---

#### `static createJSONTemplate()`

Generate a JSON template.

**Returns:** Object - Template tour data

---

#### `static createCSVTemplate()`

Generate a CSV template.

**Returns:** string - CSV template content

## Testing

### Interactive Test

Open `test-metadata-parser.html` in a browser:
1. Drag and drop a metadata file
2. View parsing results
3. Check for errors/warnings
4. Download templates

### Automated Tests

Run the Node.js test suite:

```bash
cd loft-tour
node test-parser.js
```

Tests cover:
- ✅ JSON parsing
- ✅ CSV parsing
- ✅ Missing field validation
- ✅ Circular reference detection
- ✅ Invalid reference detection
- ✅ Template generation
- ✅ Linear walkthrough generation

## Examples

### Example 1: Parse JSON with Layers

```javascript
const parser = new LoftTourMetadataParser();
const file = document.getElementById('fileInput').files[0];

try {
  const result = await parser.parseFile(file);
  
  console.log(`Tour: ${result.data.tourName}`);
  console.log(`Nodes: ${result.data.nodes.length}`);
  
  result.data.nodes.forEach(node => {
    console.log(`- ${node.label}`);
    if (node.layers) {
      console.log(`  Layers: ${node.layers.length}`);
    }
  });
  
  if (result.warnings.length > 0) {
    console.warn('Warnings:', result.warnings);
  }
} catch (error) {
  console.error('Failed to parse:', error.message);
}
```

### Example 2: Generate Walkthrough

```javascript
const parser = new LoftTourMetadataParser();
const result = await parser.parseFile(file);

// Get ordered path
const walkthrough = parser.generateLinearWalkthrough(result.data);

// Display path
const path = walkthrough.map(node => node.label).join(' → ');
console.log('Tour path:', path);

// Load first node
loadNode(walkthrough[0]);
```

### Example 3: Validate Before Upload

```javascript
const parser = new LoftTourMetadataParser();

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  
  try {
    const result = await parser.parseFile(file);
    
    // Show success
    showSuccess(`✅ Valid metadata with ${result.data.nodes.length} nodes`);
    
    // Show warnings if any
    if (result.warnings.length > 0) {
      showWarnings(result.warnings);
    }
    
    // Enable upload button
    uploadButton.disabled = false;
    
  } catch (error) {
    // Show errors
    showError(error.message);
    
    // Disable upload button
    uploadButton.disabled = true;
  }
});
```

## Best Practices

### 1. Validate Before Upload
Always validate metadata files before uploading to catch errors early.

### 2. Use Descriptive IDs
Use clear, descriptive node IDs like "living_room" instead of "node1".

### 3. Test Linear Path
Verify the generated walkthrough follows the intended path.

### 4. Check Warnings
Review warnings even if parsing succeeds - they may indicate issues.

### 5. Start Simple
Begin with CSV for basic tours, upgrade to JSON when you need layers.

### 6. Match Image Names
Ensure image filenames in metadata exactly match actual files (case-sensitive).

### 7. Use Templates
Start with provided templates and modify them for your needs.

## Integration with Backend

The parser is designed to work with the backend API:

```javascript
// 1. Parse metadata
const result = await parser.parseFile(metadataFile);

// 2. Upload to backend
const response = await fetch('/api/index.php/process-tour-metadata', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tour_id: tourId,
    metadata: result.data
  })
});

// 3. Upload panorama images
for (const node of result.data.nodes) {
  await uploadPanorama(tourId, node, imageFiles[node.image]);
}

// 4. Upload layer images (if any)
for (const node of result.data.nodes) {
  if (node.layers) {
    for (const layer of node.layers) {
      await uploadLayer(nodeId, layer, layerFiles[layer.image]);
    }
  }
}
```

## Troubleshooting

### "Invalid JSON format"
- Check for syntax errors in JSON file
- Validate JSON at jsonlint.com
- Ensure proper quotes and commas

### "CSV missing required columns"
- Verify header row has: node_id, label, image
- Check for typos in column names
- Ensure no extra spaces in headers

### "Circular reference detected"
- Check nextNode references don't loop back
- Verify the last node has nextNode: null
- Draw out the path to visualize connections

### "Invalid next node reference"
- Ensure all nextNode values match existing node IDs
- Check for typos in node IDs
- Verify case-sensitive matching

### "No entry point found"
- At least one node should have no incoming references
- Check that not all nodes are referenced by nextNode
- Verify the first node isn't referenced by others

## Support

For issues or questions:
1. Test with `test-metadata-parser.html`
2. Check browser console for errors
3. Verify file format matches templates
4. Review validation error messages

## Related Documentation

- [Templates README](../templates/README.md) - Metadata format reference
- [START-HERE.md](./START-HERE.md) - Getting started guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready ✅
