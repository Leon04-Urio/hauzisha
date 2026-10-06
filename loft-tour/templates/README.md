# LOFT³ Metadata Templates

This directory contains sample metadata files that demonstrate the expected format for tour generation.

## Files

- **sample-tour.json** - Complete JSON example with nodes and layers
- **sample-tour.csv** - Simple CSV example with basic node definitions

## JSON Format

The JSON format supports full tour configuration including layers:

```json
{
  "tourName": "Your Tour Name",
  "description": "Optional description",
  "nodes": [
    {
      "id": "unique_node_id",
      "label": "Display Name",
      "image": "panorama.jpg",
      "nextNode": "next_node_id",
      "rotationLimits": { "h": 30, "v": 10 },
      "initialYaw": 0,
      "initialPitch": 0,
      "order": 0,
      "layers": [
        {
          "name": "layer_name",
          "image": "layer.png",
          "position": { "x": 0.5, "y": 0.5 },
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

### Required Fields (JSON)
- `id` - Unique identifier for the node
- `label` - Display name for the node
- `image` - Filename of the panorama image

### Optional Fields (JSON)
- `nextNode` - ID of the next node in sequence (null for last node)
- `rotationLimits` - Camera rotation constraints
  - `h` - Horizontal limit in degrees (default: 30)
  - `v` - Vertical limit in degrees (default: 10)
- `initialYaw` - Starting horizontal rotation (default: 0)
- `initialPitch` - Starting vertical rotation (default: 0)
- `order` - Numeric order for sorting (default: 0)
- `layers` - Array of overlay layers (optional)

### Layer Fields (JSON)
- `name` - Layer identifier
- `image` - PNG filename with transparency
- `position` - X/Y coordinates (0-1 range)
- `parallaxFactor` - Depth effect (0 = static, 1 = full movement)
- `scale` - Size multiplier (default: 1.0)
- `rotation` - Rotation in degrees (default: 0)
- `opacity` - Transparency (0-1, default: 1.0)

## CSV Format

The CSV format is simpler and doesn't support layers:

```csv
node_id,label,image,next_node,rotation_h,rotation_v,initial_yaw,initial_pitch,order
entrance,Main Entrance,entrance.jpg,living_room,30,10,0,0,0
living_room,Living Room,living_room.jpg,bedroom,45,15,0,0,1
bedroom,Master Bedroom,bedroom.jpg,,30,10,0,0,2
```

### Required Columns (CSV)
- `node_id` - Unique identifier
- `label` - Display name
- `image` - Panorama filename

### Optional Columns (CSV)
- `next_node` - Next node ID (empty for last node)
- `rotation_h` - Horizontal rotation limit (default: 30)
- `rotation_v` - Vertical rotation limit (default: 10)
- `initial_yaw` - Starting yaw (default: 0)
- `initial_pitch` - Starting pitch (default: 0)
- `order` - Sort order (default: 0)

## Image Requirements

### Panoramas
- Format: JPG or PNG
- Aspect ratio: 2:1 (equirectangular)
- Recommended resolution: 4096x2048 or higher
- Maximum file size: 20MB (will be compressed to ~3MB)

### Layers
- Format: PNG with transparency
- Position: 0-1 range (0 = left/top, 1 = right/bottom)
- Maximum file size: 5MB

## Validation

The metadata parser validates:
- ✅ Required fields are present
- ✅ Node IDs are unique
- ✅ Next node references exist
- ✅ No circular references
- ✅ Image filenames have valid extensions
- ✅ Rotation limits are within valid ranges
- ✅ Layer positions are in 0-1 range
- ✅ Parallax factors are in 0-1 range

## Testing

Use `test-metadata-parser.html` to validate your metadata files before uploading.

## Tips

1. **Start Simple**: Begin with CSV for basic tours, upgrade to JSON when you need layers
2. **Linear Path**: Ensure nodes form a clear path from entrance to exit
3. **Unique IDs**: Use descriptive, unique IDs like "living_room" not "room1"
4. **Rotation Limits**: Keep horizontal limits 30-60°, vertical 10-20° for best experience
5. **Layer Parallax**: Use 0.2-0.3 for distant objects, 0.6-0.8 for close objects
6. **Image Names**: Match image filenames exactly (case-sensitive)

## Example Workflow

1. Create metadata file (JSON or CSV)
2. Prepare panorama images (2:1 aspect ratio)
3. (Optional) Prepare layer images (PNG with transparency)
4. Test metadata with `test-metadata-parser.html`
5. Upload to admin panel
6. System auto-generates tour following the linear path

## Support

For issues or questions, see the main README.md in the loft-tour directory.
