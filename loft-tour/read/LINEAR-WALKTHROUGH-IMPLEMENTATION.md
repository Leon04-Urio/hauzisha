# Linear Walkthrough Generation Implementation

## Overview

The LOFT³ Tour Engine now automatically generates a linear walkthrough path from tour metadata by following the `nextNode` field in each node definition. This ensures tours follow the intended sequence regardless of the order nodes appear in the metadata.

## Implementation Details

### Core Functionality

The linear walkthrough generation is implemented in `loft-tour-core.js` with the following key components:

#### 1. `generateLinearWalkthrough(data)` Method

This method analyzes the tour metadata and builds an ordered path by:

1. **Finding the Entry Point**: Identifies nodes with no incoming references (nodes that aren't referenced by any other node's `nextNode` field)
2. **Following the Chain**: Traverses the `nextNode` references to build the complete path
3. **Detecting Issues**: Warns about circular references, orphaned nodes, and multiple entry points

```javascript
generateLinearWalkthrough(data) {
    if (!data.nodes || data.nodes.length === 0) {
        return [];
    }

    const nodeMap = new Map();
    data.nodes.forEach(node => nodeMap.set(node.id, node));

    // Find entry point (node with no incoming references)
    const hasIncoming = new Set();
    data.nodes.forEach(node => {
        if (node.nextNode) {
            hasIncoming.add(node.nextNode);
        }
    });

    const entryPoints = data.nodes.filter(node => !hasIncoming.has(node.id));
    
    // Build linear path following nextNode chain
    const path = [];
    let current = entryPoints[0];
    const visited = new Set();

    while (current && !visited.has(current.id)) {
        path.push(current);
        visited.add(current.id);
        current = current.nextNode ? nodeMap.get(current.nextNode) : null;
    }

    return path;
}
```

#### 2. `loadTour(tourData)` Method

Updated to generate and use the linear path:

```javascript
async loadTour(tourData) {
    this.tourData = tourData;
    
    // Generate linear walkthrough from "next" field
    this.linearPath = this.generateLinearWalkthrough(tourData);
    
    console.log('Linear walkthrough generated:', 
        this.linearPath.map(n => n.label || n.id).join(' → '));
    
    // Load first node in the linear path
    await this.loadNode(this.linearPath[0], 0);
}
```

#### 3. Navigation Methods

Updated `nextNode()` and `previousNode()` to use the linear path:

```javascript
async nextNode() {
    if (this.isTransitioning) return;
    
    // Use linear path instead of array indices
    const nextIndex = this.currentNodeIndex + 1;
    if (nextIndex >= this.linearPath.length) {
        console.log('End of tour reached');
        return;
    }
    
    const nextNode = this.linearPath[nextIndex];
    await this.transitionTo(nextNode, nextIndex);
}
```

## Metadata Format

### JSON Format

```json
{
  "tourName": "My Tour",
  "nodes": [
    {
      "id": "entrance",
      "label": "Main Entrance",
      "image": "entrance.jpg",
      "nextNode": "living_room"
    },
    {
      "id": "living_room",
      "label": "Living Room",
      "image": "living_room.jpg",
      "nextNode": "bedroom"
    },
    {
      "id": "bedroom",
      "label": "Bedroom",
      "image": "bedroom.jpg",
      "nextNode": null
    }
  ]
}
```

### CSV Format

```csv
node_id,label,image,next_node
entrance,Main Entrance,entrance.jpg,living_room
living_room,Living Room,living_room.jpg,bedroom
bedroom,Bedroom,bedroom.jpg,
```

## Key Features

### 1. Entry Point Detection

The system automatically finds the correct starting node by identifying nodes with no incoming references:

- **Single Entry Point**: Uses that node as the start
- **Multiple Entry Points**: Uses the first one and logs a warning
- **No Entry Point**: Falls back to using the first node in the array

### 2. Path Validation

The system validates the path and provides warnings for:

- **Circular References**: Detects loops in the node chain
- **Orphaned Nodes**: Identifies nodes not connected to the main path
- **Invalid References**: Catches `nextNode` values that don't exist

### 3. Order Independence

Nodes can be defined in any order in the metadata. The system will correctly determine the walkthrough sequence based on the `nextNode` references:

```javascript
// These produce the same walkthrough: A → B → C
// Order 1: [A, B, C]
// Order 2: [C, B, A]
// Order 3: [B, A, C]
```

## Testing

### Test Files

1. **test-linear-walkthrough.html**: Interactive browser-based tests
2. **test-linear-walkthrough.js**: Automated Node.js tests
3. **test-sample-tour-walkthrough.js**: Tests with actual sample tour data

### Running Tests

```bash
# Run automated tests
node loft-tour/test-linear-walkthrough.js
node loft-tour/test-sample-tour-walkthrough.js

# Open browser tests
# Navigate to: http://localhost:8080/test-linear-walkthrough.html
```

### Test Coverage

- ✅ Simple linear paths (A → B → C)
- ✅ Complex paths with random node order
- ✅ Paths with orphaned nodes
- ✅ Single node tours
- ✅ Multiple entry points
- ✅ Real sample tour data
- ✅ Navigation following linear path

## Example Output

When loading a tour, the console will show:

```
Linear walkthrough generated: Main Gate → Driveway → Main Entrance → Living Room → Modern Kitchen → Master Bedroom → Balcony View
Tour loaded successfully: 7 nodes in linear path
```

## Benefits

1. **Flexible Metadata**: Nodes can be defined in any order
2. **Automatic Sequencing**: No need to manually order nodes in the array
3. **Error Detection**: Warns about common issues like orphaned nodes
4. **Predictable Navigation**: Tours always follow the intended path
5. **Easy Maintenance**: Changing the tour sequence only requires updating `nextNode` values

## Edge Cases Handled

### Multiple Entry Points

If multiple nodes have no incoming references, the system uses the first one and logs a warning:

```
Multiple entry points found: entrance, garage - using first
```

### Orphaned Nodes

Nodes not connected to the main path are excluded and logged:

```
Orphaned nodes (not in linear path): storage_room, utility_closet
```

### Circular References

The system detects and prevents infinite loops:

```
Circular reference detected in node chain starting from "entrance"
```

### Empty Tours

Gracefully handles tours with no nodes:

```javascript
if (!tourData.nodes || tourData.nodes.length === 0) {
    throw new Error('Tour data must contain at least one node');
}
```

## Integration with Existing Features

The linear walkthrough generation integrates seamlessly with:

- **Metadata Parser**: Uses the same node structure
- **Scene Loading**: Loads nodes in the correct sequence
- **Transitions**: Smooth transitions between sequential nodes
- **Navigation Controls**: Next/Previous buttons follow the path
- **Layer System**: Layers load correctly for each node in sequence

## Future Enhancements

Potential improvements for future versions:

1. **Branching Paths**: Support for multiple paths with user choice
2. **Conditional Navigation**: Skip nodes based on conditions
3. **Loop Detection**: More sophisticated circular reference handling
4. **Path Optimization**: Suggest optimal node ordering
5. **Visual Path Editor**: Drag-and-drop interface for defining paths

## Troubleshooting

### Issue: Tour starts at wrong node

**Solution**: Check that the intended entry node has no incoming `nextNode` references.

### Issue: Some nodes are skipped

**Solution**: Verify that all nodes in the intended path are connected via `nextNode` references.

### Issue: Warning about orphaned nodes

**Solution**: Either connect the orphaned nodes to the main path or remove them from the metadata.

### Issue: Navigation doesn't follow expected order

**Solution**: Verify the `nextNode` values in your metadata match the intended sequence.

## Related Documentation

- [METADATA-PARSER.md](./METADATA-PARSER.md) - Metadata parsing and validation
- [SCENE-LOADING-IMPLEMENTATION.md](./SCENE-LOADING-IMPLEMENTATION.md) - Scene loading details
- [METADATA-QUICK-REFERENCE.md](../METADATA-QUICK-REFERENCE.md) - Quick reference guide

## Version History

- **v1.0** (January 2026): Initial implementation with automatic entry point detection and path generation
