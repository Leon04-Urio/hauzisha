# LOFT³ Tour Node Validation

## Overview

The node validation functionality ensures that tour nodes are properly configured with unique IDs, valid references, and existing image files. This helps prevent broken tours and provides detailed feedback about potential issues.

## Features

### Core Validations

1. **Unique Node IDs**: Ensures no duplicate node IDs exist within a tour
2. **Valid References**: Verifies that `next_node_id` references point to existing nodes
3. **Image Existence**: Checks that all referenced image files exist on the filesystem

### Advanced Analysis

4. **Node Sequence Analysis**: Analyzes tour connectivity and flow
5. **Circular Reference Detection**: Identifies infinite loops in tour paths
6. **Unreachable Node Detection**: Finds nodes that cannot be reached from entry points
7. **Entry Point Analysis**: Validates tour starting points
8. **Property Validation**: Checks rotation limits, angles, and other node properties

## API Usage

### Endpoint
```
POST /api/index.php/validate-tour-nodes
```

### Authentication
Requires admin authentication (session-based).

### Request Body
```json
{
  "tour_id": 123
}
```

### Response Format
```json
{
  "success": true,
  "message": "All validations passed",
  "validation_results": {
    "unique_ids": true,
    "valid_references": true,
    "images_exist": true,
    "errors": [],
    "warnings": [
      "Multiple entry nodes found: entrance, gate. Consider having a single starting point."
    ]
  },
  "node_count": 5,
  "validated_at": "2025-01-17 12:34:56"
}
```

## PHP Usage

```php
require_once 'api/classes/LoftTour.php';

// Initialize with database connection
$loftTour = new LoftTour($conn);

// Validate tour nodes (requires admin authentication)
try {
    $result = $loftTour->validateTourNodes($tourId);
    
    if ($result['success']) {
        echo "Validation passed!";
    } else {
        echo "Validation failed:";
        foreach ($result['validation_results']['errors'] as $error) {
            echo "- " . $error;
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

## Validation Results

### Success Indicators
- `unique_ids`: Boolean indicating if all node IDs are unique
- `valid_references`: Boolean indicating if all next_node_id references are valid
- `images_exist`: Boolean indicating if all referenced images exist

### Error Types
- **Duplicate node IDs**: Multiple nodes with the same ID
- **Invalid references**: next_node_id pointing to non-existent nodes
- **Missing images**: Image files not found at specified paths
- **Missing image URLs**: Nodes without image_url specified

### Warning Types
- **Missing thumbnails**: Thumbnail files not found (non-critical)
- **Multiple entry nodes**: More than one starting point
- **No entry nodes**: All nodes are referenced (no clear start)
- **Unreachable nodes**: Nodes not accessible from entry points
- **Circular references**: Infinite loops in tour path
- **Invalid property values**: Rotation limits, angles outside valid ranges

## Testing

### Verification Script
Run the verification script to test the validation logic:

```bash
php loft-tour/verify-node-validation.php
```

### Full Test Suite
Run the complete test suite (requires database setup):

```bash
php loft-tour/test-node-validation.php
```

## Implementation Details

### Database Tables
- `loft_tours`: Main tour information
- `loft_tour_nodes`: Individual panorama nodes
- `loft_tour_layers`: Parallax layers (optional)

### File Structure
```
uploads/loft-tours/{tour_id}/
├── panoramas/          # Main panorama images
├── thumbnails/         # Generated thumbnails
└── layers/            # Parallax layer images
```

### Validation Process
1. Retrieve all nodes for the specified tour
2. Check for unique node IDs
3. Validate next_node_id references
4. Verify image file existence
5. Analyze node sequence and connectivity
6. Validate node properties and ranges
7. Generate comprehensive report

## Error Handling

The validation system provides detailed error messages and warnings to help identify and fix issues:

- **Errors**: Critical issues that prevent proper tour functionality
- **Warnings**: Non-critical issues that may affect user experience
- **Success**: All validations passed, tour is ready for use

## Integration

This validation functionality integrates with:
- Tour creation workflow
- Metadata processing system
- Admin upload interface
- Tour preview system
- Quality assurance processes

## Best Practices

1. **Run validation after**: 
   - Uploading new panoramas
   - Updating metadata
   - Modifying node sequences

2. **Address errors before**:
   - Publishing tours
   - Sharing tour links
   - Production deployment

3. **Monitor warnings for**:
   - User experience optimization
   - Tour flow improvements
   - Performance considerations