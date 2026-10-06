# LOFT³ Metadata Quick Reference

## 📋 Quick Format Guide

### JSON Format (Full Features)

```json
{
  "tourName": "Tour Name",
  "nodes": [
    {
      "id": "node_id",
      "label": "Display Name",
      "image": "panorama.jpg",
      "nextNode": "next_id",
      "rotationLimits": { "h": 30, "v": 10 },
      "layers": [
        {
          "name": "layer_name",
          "image": "layer.png",
          "position": { "x": 0.5, "y": 0.5 },
          "parallaxFactor": 0.5,
          "scale": 1.0
        }
      ]
    }
  ]
}
```

### CSV Format (Simple Tours)

```csv
node_id,label,image,next_node,rotation_h,rotation_v
entrance,Main Entrance,entrance.jpg,living_room,30,10
living_room,Living Room,living_room.jpg,bedroom,45,15
bedroom,Master Bedroom,bedroom.jpg,,30,10
```

---

## ✅ Required Fields

| Field | JSON | CSV | Description |
|-------|------|-----|-------------|
| Node ID | `id` | `node_id` | Unique identifier |
| Label | `label` | `label` | Display name |
| Image | `image` | `image` | Panorama filename |

---

## 🎯 Optional Fields

| Field | JSON | CSV | Default | Range |
|-------|------|-----|---------|-------|
| Next Node | `nextNode` | `next_node` | null | Valid node ID |
| Horizontal Rotation | `rotationLimits.h` | `rotation_h` | 30 | 0-180° |
| Vertical Rotation | `rotationLimits.v` | `rotation_v` | 10 | 0-90° |
| Initial Yaw | `initialYaw` | `initial_yaw` | 0 | -180 to 180° |
| Initial Pitch | `initialPitch` | `initial_pitch` | 0 | -90 to 90° |
| Order | `order` | `order` | 0 | Any integer |

---

## 🎨 Layer Fields (JSON Only)

| Field | Required | Default | Range | Description |
|-------|----------|---------|-------|-------------|
| `name` | ✅ | - | - | Layer identifier |
| `image` | ✅ | - | - | PNG filename |
| `position.x` | ❌ | 0.5 | 0-1 | Horizontal position |
| `position.y` | ❌ | 0.5 | 0-1 | Vertical position |
| `parallaxFactor` | ❌ | 0.5 | 0-1 | Depth effect |
| `scale` | ❌ | 1.0 | >0 | Size multiplier |
| `rotation` | ❌ | 0 | 0-360° | Rotation angle |
| `opacity` | ❌ | 1.0 | 0-1 | Transparency |

---

## 📐 Value Ranges

### Rotation Limits
- **Horizontal:** 0-180° (recommended: 30-60°)
- **Vertical:** 0-90° (recommended: 10-20°)

### Layer Position
- **X/Y:** 0-1 (0 = left/top, 1 = right/bottom)
- **Example:** `{ "x": 0.5, "y": 0.5 }` = center

### Parallax Factor
- **0:** Static (no movement)
- **0.2-0.3:** Distant objects
- **0.5:** Medium depth
- **0.6-0.8:** Close objects
- **1.0:** Full movement

---

## 🖼️ Image Requirements

### Panoramas
- **Format:** JPG or PNG
- **Aspect Ratio:** 2:1 (equirectangular)
- **Resolution:** 2048x1024 to 8192x4096
- **Max Size:** 20MB (compressed to ~3MB)

### Layers
- **Format:** PNG with transparency
- **Max Size:** 5MB
- **Recommended:** Optimize before upload

---

## ✅ Validation Checklist

- [ ] All nodes have unique IDs
- [ ] All nodes have labels and images
- [ ] Next node references exist
- [ ] No circular references
- [ ] Image filenames have valid extensions
- [ ] Rotation limits are in valid ranges
- [ ] Layer positions are 0-1
- [ ] Parallax factors are 0-1
- [ ] At least one entry point exists

---

## 🚀 Quick Start

1. **Download Template**
   - Open `test-metadata-parser.html`
   - Click "Download JSON Template" or "Download CSV Template"

2. **Edit Template**
   - Replace node IDs, labels, and image filenames
   - Set rotation limits as needed
   - Add layers (JSON only)

3. **Validate**
   - Open `test-metadata-parser.html`
   - Drag & drop your file
   - Fix any errors or warnings

4. **Upload**
   - Use admin panel to upload metadata
   - Upload corresponding panorama images
   - Upload layer images (if any)

---

## 💡 Tips

### Node IDs
- ✅ Use descriptive names: `living_room`, `master_bedroom`
- ❌ Avoid generic names: `node1`, `room2`

### Linear Path
- First node should have no incoming references
- Last node should have `nextNode: null` (JSON) or empty (CSV)
- Each node should connect to the next

### Rotation Limits
- Tighter limits (30°) = guided tour
- Wider limits (60°) = free exploration
- Balance between control and freedom

### Layers
- Use PNG with transparency
- Position relative to panorama (0-1 range)
- Lower parallax = distant, higher = close
- Test in viewer to fine-tune

---

## 🐛 Common Errors

### "Missing required field"
→ Add the missing field (id, label, or image)

### "Invalid next node reference"
→ Check node ID spelling and case

### "Circular reference detected"
→ Ensure last node has no nextNode

### "Duplicate node IDs"
→ Make all node IDs unique

### "No entry point found"
→ Ensure first node isn't referenced by others

---

## 📚 Full Documentation

- **[read/METADATA-PARSER.md](./read/METADATA-PARSER.md)** - Complete API reference
- **[templates/README.md](./templates/README.md)** - Detailed format specs
- **[test-metadata-parser.html](./test-metadata-parser.html)** - Interactive validator

---

**Need Help?** Test your metadata with `test-metadata-parser.html` for instant validation!
