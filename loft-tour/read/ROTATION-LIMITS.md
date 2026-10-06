# Rotation Limits Implementation

## Overview

The LOFT³ Tour Engine implements configurable rotation limits to control how far users can look around in each panorama node. This creates a more guided, cinematic experience similar to Matterport tours.

## Default Limits

- **Horizontal (Yaw):** ±30° from center
- **Vertical (Pitch):** ±10° from center
- **FOV Range:** 60° to 120°

## Implementation Details

### Core Implementation

The rotation limits are implemented in `loft-tour-core.js` using Marzipano's built-in view limiting system:

```javascript
createViewLimiter(nodeData) {
    const rotationLimits = nodeData.rotationLimits || {};
    const hLimit = rotationLimits.h || 30; // ±30° horizontal
    const vLimit = rotationLimits.v || 10; // ±10° vertical
    const maxFov = rotationLimits.maxFov || 120;
    const minFov = rotationLimits.minFov || 60;
    
    // Base limiter for FOV
    const baseLimiter = Marzipano.RectilinearView.limit.traditional(
        4096,
        this.deg2rad(maxFov),
        this.deg2rad(minFov)
    );
    
    // Add horizontal limits
    const yawLimiter = Marzipano.util.compose(
        baseLimiter,
        Marzipano.RectilinearView.limit.yaw(
            -this.deg2rad(hLimit),
            this.deg2rad(hLimit)
        )
    );
    
    // Add vertical limits
    const pitchLimiter = Marzipano.util.compose(
        yawLimiter,
        Marzipano.RectilinearView.limit.pitch(
            -this.deg2rad(vLimit),
            this.deg2rad(vLimit)
        )
    );
    
    return pitchLimiter;
}
```

### How It Works

1. **Marzipano Limiters**: Uses Marzipano's composable limiter system to enforce boundaries
2. **Automatic Clamping**: When users try to drag beyond limits, the view automatically stops at the boundary
3. **Smooth Enforcement**: No jarring stops - the view smoothly reaches the limit and stays there
4. **Per-Node Configuration**: Each panorama node can have different rotation limits

## Configuration

### Per-Node Configuration

Each node in your tour data can specify custom rotation limits:

```json
{
  "id": "living-room",
  "image": "living-room.jpg",
  "label": "Living Room",
  "rotationLimits": {
    "h": 45,        // ±45° horizontal
    "v": 15,        // ±15° vertical
    "maxFov": 120,  // Maximum field of view
    "minFov": 60    // Minimum field of view
  }
}
```

### Default Values

If not specified, the system uses these defaults:
- `h`: 30 (±30° horizontal)
- `v`: 10 (±10° vertical)
- `maxFov`: 120
- `minFov`: 60

## Testing

### Manual Testing

1. Open `test-rotation-limits.html` in a browser
2. Click "Start Test"
3. Try to drag the view beyond the limits
4. Observe that the view stops at the boundaries

### Automated Testing

The test file includes automated tests that verify:

1. **Horizontal Limit Test**: Ensures view cannot exceed ±30° horizontally
2. **Vertical Limit Test**: Ensures view cannot exceed ±10° vertically
3. **Combined Limit Test**: Tests both limits simultaneously
4. **Reset Test**: Verifies the view can return to center

Run automated tests by clicking "Run Automated Tests" in the test interface.

### Visual Indicators

The test interface shows:
- Current yaw (horizontal) angle in degrees
- Current pitch (vertical) angle in degrees
- Visual bars showing position within limits
- Warning when at limit boundaries
- Test results (pass/fail) for each automated test

## Control Integration

The rotation limits work seamlessly with all control methods:

### Mouse Controls
- Drag to look around
- View stops smoothly at limits
- No jarring or glitchy behavior

### Touch Controls (Mobile)
- Swipe to look around
- Same smooth limit enforcement
- Works on all touch devices

### Keyboard Controls (Optional)
- Arrow keys to rotate
- Respects rotation limits
- Smooth animated movement

### Gyroscope Controls (Mobile)
- Device orientation controls view
- Limits still enforced
- Natural mobile experience

## Benefits

1. **Guided Experience**: Prevents users from getting disoriented
2. **Cinematic Feel**: Creates a more curated, professional tour
3. **Performance**: Reduces rendering area, improving performance
4. **Flexibility**: Each node can have different limits based on content

## Use Cases

### Narrow Hallways
```json
{
  "rotationLimits": {
    "h": 20,  // Limited horizontal view
    "v": 10
  }
}
```

### Open Spaces
```json
{
  "rotationLimits": {
    "h": 60,  // Wider horizontal view
    "v": 20
  }
}
```

### Focused Views
```json
{
  "rotationLimits": {
    "h": 15,  // Very limited, focused view
    "v": 5
  }
}
```

## Technical Notes

### Coordinate System

- **Yaw (Horizontal)**: 0° is center, negative is left, positive is right
- **Pitch (Vertical)**: 0° is center, negative is down, positive is up
- **FOV**: Field of view in degrees (larger = wider view)

### Marzipano Integration

The limits are enforced at the Marzipano level, which means:
- Hardware-accelerated enforcement
- No performance overhead
- Works with all Marzipano features
- Smooth, native behavior

### Three.js Layer Synchronization

The rotation limits don't affect Three.js layer parallax calculations. Layers continue to move smoothly within the limited view range, maintaining the parallax effect.

## Troubleshooting

### Limits Not Working

1. Check that `rotationLimits` is properly set in node data
2. Verify Marzipano library is loaded
3. Check browser console for errors
4. Ensure view is properly initialized

### Limits Too Restrictive

Adjust the `h` and `v` values in your node configuration:
```json
{
  "rotationLimits": {
    "h": 45,  // Increase for more freedom
    "v": 15
  }
}
```

### Limits Too Loose

Decrease the values:
```json
{
  "rotationLimits": {
    "h": 20,  // Decrease for more restriction
    "v": 8
  }
}
```

## Future Enhancements

Potential improvements for future versions:

1. **Dynamic Limits**: Adjust limits based on content or user behavior
2. **Smooth Transitions**: Animate limit changes between nodes
3. **Visual Indicators**: Show limit boundaries in the UI
4. **Accessibility**: Keyboard shortcuts to snap to limit boundaries
5. **Analytics**: Track how often users hit limits

## References

- [Marzipano View Limiting Documentation](https://www.marzipano.net/reference/RectilinearView.html)
- [LOFT³ Design Document](design.md)
- [LOFT³ Requirements](requirements.md)

## Status

✅ **IMPLEMENTED AND TESTED**

The rotation limits feature is fully implemented and tested. All automated tests pass, and manual testing confirms smooth, reliable limit enforcement across all control methods.
