# LOFT³ Tour Template System & Error Reporting

## Overview

The LOFT³ Tour Template System provides comprehensive tools for creating, validating, and managing metadata templates for panoramic tours. This system includes both client-side and server-side components for template generation and robust error reporting.

## Features

### ✅ Template Generation
- **Multiple Template Types**: Basic, minimal, and complex templates
- **Format Support**: JSON and CSV formats
- **Customizable Options**: Tour name, description, node count, property type
- **Layer Examples**: Optional parallax layer examples
- **Schema Validation**: JSON Schema compliance

### ✅ Error Reporting & Validation
- **Comprehensive Validation**: Structure, nodes, layers, and references
- **Business Rule Validation**: Entry points, end points, circular references
- **Detailed Error Reports**: Categorized errors and warnings
- **Real-time Validation**: Client-side and server-side validation

### ✅ Template Files Available
- `sample-metadata.json` - Enhanced comprehensive example
- `minimal-metadata.json` - Minimal required fields only
- `complex-metadata.json` - Full-featured luxury villa example
- `sample-metadata.csv` - CSV format with documentation
- `metadata-schema.json` - JSON Schema for validation

## API Endpoints

### Generate Template
```
POST /api/index.php/generate-template
```

**Parameters:**
- `template_type`: 'basic', 'minimal', or 'complex'
- `tour_name`: Name of the tour
- `description`: Tour description
- `node_count`: Number of nodes to generate
- `include_layers`: Include layer examples (checkbox)
- `property_type`: Type of property
- `format`: 'json' or 'csv'

**Response:**
```json
{
  "success": true,
  "template": { ... }
}
```

### Validate Metadata
```
POST /api/index.php/validate-metadata
Content-Type: application/json
```

**Body:** JSON metadata to validate

**Response:**
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "summary": "..."
  },
  "report": "Detailed validation report..."
}
```

### Create Template Files
```
POST /api/index.php/create-template-files
```

**Parameters:**
- `template_type`: Template type to generate
- `tour_name`: Name for the generated tour
- `node_count`: Number of nodes
- `property_type`: Property type

**Response:**
```json
{
  "success": true,
  "message": "Template files created successfully",
  "files": {
    "json": "/path/to/template.json",
    "csv": "/path/to/template.csv"
  }
}
```

## JavaScript Usage

### Template Generator
```javascript
const generator = new LoftTourTemplateGenerator();

// Generate basic template
const template = generator.generateBasicTemplate({
  tourName: 'My Property Tour',
  nodeCount: 5,
  includeLayerExamples: true,
  propertyType: 'luxury_residential'
});

// Validate metadata
const validationResult = generator.validateMetadata(metadata);
if (!validationResult.isValid) {
  console.log('Validation errors:', validationResult.errors);
}

// Generate error report
const report = generator.generateErrorReport(validationResult);
console.log(report);
```

### CSV Template Generation
```javascript
const csvTemplate = generator.generateCSVTemplate({
  nodeCount: 4
});
```

## PHP Usage

### Server-side Template Generation
```php
require_once 'classes/LoftTourTemplateGenerator.php';

$generator = new LoftTourTemplateGenerator();

// Generate template
$template = $generator->generateBasicTemplate([
  'tourName' => 'Server Generated Tour',
  'nodeCount' => 6,
  'includeLayerExamples' => true
]);

// Validate metadata
$validationResult = $generator->validateMetadata($metadata);
if (!$validationResult['isValid']) {
  $report = $generator->generateErrorReport($validationResult);
  echo $report;
}

// Create template files
$result = $generator->createTemplateFiles('complex', [
  'tourName' => 'Luxury Villa',
  'nodeCount' => 8
]);
```

## Validation Rules

### Required Fields
- **Tour Level**: `tourName`, `nodes`
- **Node Level**: `id`, `label`, `image`
- **Layer Level**: `name`, `image`, `position`

### Validation Checks

#### Structure Validation
- Valid JSON format
- Required fields present
- Correct data types
- Field length limits

#### Node Validation
- Unique node IDs
- Valid ID format (alphanumeric, hyphens, underscores)
- Valid image file extensions (.jpg, .jpeg, .png)
- Rotation limits within valid ranges
- Initial yaw/pitch within valid ranges

#### Layer Validation
- Unique layer names within each node
- PNG format for layer images
- Position coordinates in 0-1 range
- Parallax factor in 0-1 range
- Scale factor in 0.1-10 range
- Opacity in 0-1 range

#### Reference Validation
- Valid nextNode references
- No circular references (with warnings)
- Reachable nodes from entry points

#### Business Rules
- Single entry point recommended
- Single end point recommended
- No orphaned nodes
- Consistent metadata counts

## Error Categories

### 🚨 Errors (Must Fix)
- Missing required fields
- Invalid data types
- Duplicate IDs
- Invalid references
- Out-of-range values
- Invalid file formats

### ⚠️ Warnings (Recommended)
- Multiple entry/end points
- Circular references
- Long descriptions
- Unreachable nodes
- Inconsistent metadata
- Suboptimal values

## Template Schema

The system uses JSON Schema for validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://loft-tour.schema.json",
  "title": "LOFT³ Tour Metadata Schema",
  "type": "object",
  "required": ["tourName", "nodes"],
  "properties": {
    "tourName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "nodes": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/definitions/node" }
    }
  }
}
```

## Best Practices

### Template Creation
1. Start with the appropriate template type for your needs
2. Use descriptive node IDs and labels
3. Include descriptions for better user experience
4. Set appropriate rotation limits for each space
5. Use layers sparingly for key highlights

### Validation Workflow
1. Generate template using the system
2. Customize for your specific property
3. Validate before uploading
4. Fix all errors, address warnings
5. Test with actual panorama images

### Error Handling
1. Always validate metadata before processing
2. Provide clear error messages to users
3. Log validation results for debugging
4. Implement client-side validation for better UX

## File Structure

```
loft-tour/
├── templates/
│   ├── sample-metadata.json          # Enhanced comprehensive example
│   ├── minimal-metadata.json         # Minimal required fields
│   ├── complex-metadata.json         # Full-featured example
│   ├── sample-metadata.csv           # CSV format with docs
│   └── metadata-schema.json          # JSON Schema
├── js/
│   └── loft-tour-template-generator.js  # Client-side generator
└── README-template-system.md         # This documentation

api/classes/
└── LoftTourTemplateGenerator.php     # Server-side generator
```

## Integration with Upload System

The template system integrates seamlessly with the existing upload workflow:

1. **Template Generation**: Admin generates appropriate template
2. **Customization**: Admin customizes template for specific property
3. **Validation**: System validates metadata before processing
4. **Upload**: Validated metadata is processed with panorama images
5. **Tour Creation**: System creates tour from validated metadata

## Testing

### Manual Testing
1. Generate templates of different types
2. Validate with various error conditions
3. Test CSV and JSON formats
4. Verify error reporting accuracy

### Automated Testing
```javascript
// Test template generation
const template = generator.generateBasicTemplate();
assert(template.nodes.length > 0);

// Test validation
const result = generator.validateMetadata(invalidMetadata);
assert(!result.isValid);
assert(result.errors.length > 0);
```

## Troubleshooting

### Common Issues

**Template Generation Fails**
- Check admin authentication
- Verify parameters are correct
- Check server logs for PHP errors

**Validation Returns Unexpected Results**
- Ensure metadata is valid JSON
- Check for required fields
- Verify data types match schema

**CSV Templates Missing Features**
- CSV format doesn't support layers
- Use JSON format for full features
- Check CSV parsing for special characters

### Debug Mode
Enable detailed logging by setting debug flags in the generator classes.

## Future Enhancements

- Visual template editor interface
- Template versioning system
- Custom validation rules
- Template sharing between properties
- Automated template suggestions based on property type
- Integration with AI for automatic node naming and descriptions

---

This template system provides a robust foundation for creating and validating LOFT³ tour metadata, ensuring high-quality tour generation with comprehensive error reporting and validation.