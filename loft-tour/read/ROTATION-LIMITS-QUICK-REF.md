# Rotation Limits - Quick Reference

## ✅ Status: COMPLETE

---

## Quick Facts

| Property | Value |
|----------|-------|
| Default Horizontal | ±30° |
| Default Vertical | ±10° |
| Configurable | Yes (per node) |
| Performance Impact | None (hardware accelerated) |
| Browser Support | All modern browsers |
| Mobile Support | Yes (touch + gyroscope) |

---

## Usage

### Basic (Use Defaults)

```json
{
  "id": "room-1",
  "image": "room-1.jpg",
  "label": "Living Room"
}
```
→ Uses ±30° horizontal, ±10° vertical

### Custom Limits

```json
{
  "id": "room-2",
  "image": "room-2.jpg",
  "label": "Hallway",
  "rotationLimits": {
    "h": 20,
    "v": 8
  }
}
```
→ Uses ±20° horizontal, ±8° vertical

---

## Testing

### Quick Test
```bash
open loft-tour/test-rotation-limits.html
```

### Automated Tests
1. Open test file
2. Click "Start Test"
3. Click "Run Automated Tests"
4. All 4 tests should pass ✅

---

## Files

| File | Purpose |
|------|---------|
| `test-rotation-limits.html` | Interactive testing |
| `verify-rotation-limits.js` | Programmatic verification |
| `ROTATION-LIMITS.md` | Full documentation |
| `ROTATION-LIMITS-IMPLEMENTATION.md` | Implementation details |
| `ROTATION-LIMITS-DIAGRAM.md` | Visual diagrams |

---

## Implementation

**Location:** `loft-tour/js/loft-tour-core.js`

**Method:** `createViewLimiter(nodeData)`

**How it works:**
1. Reads `rotationLimits` from node data
2. Creates Marzipano limiters for yaw and pitch
3. Composes limiters together
4. Returns combined limiter
5. Applied automatically when loading panorama

---

## Common Configurations

### Standard Room
```json
{ "h": 30, "v": 10 }
```

### Narrow Hallway
```json
{ "h": 20, "v": 8 }
```

### Open Space
```json
{ "h": 60, "v": 20 }
```

### Focused View
```json
{ "h": 15, "v": 5 }
```

---

## Troubleshooting

**Limits not working?**
- Check Marzipano is loaded
- Verify `rotationLimits` in node data
- Check browser console for errors

**Too restrictive?**
- Increase `h` and `v` values
- Test with different values

**Too loose?**
- Decrease `h` and `v` values
- Consider use case and space type

---

## Requirements Satisfied

✅ AC-6: Limited Rotation Controls
- Horizontal rotation: ±30° (configurable)
- Vertical tilt: ±10° (configurable)
- Smooth drag-to-look on desktop
- Touch controls on mobile
- Gyroscope support

---

## Next Steps

Feature is complete. Next tasks:
1. Basic scene loading and node switching
2. Mobile optimization
3. Performance tuning

---

**Last Updated:** January 16, 2026  
**Status:** ✅ Complete and Tested
