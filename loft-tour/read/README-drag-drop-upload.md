# LOFT³ Drag & Drop Upload Interface

## Overview

The drag & drop upload interface provides a modern, user-friendly way to upload panoramas, metadata, and layer files for creating immersive 360° tours. This implementation includes real-time progress tracking, thumbnail generation, and comprehensive validation.

## Features Implemented

### ✅ Enhanced Drag & Drop Interface
- **Visual feedback** during drag operations with color-coded validation
- **File type validation** with immediate feedback
- **Multiple file support** for panoramas and layers
- **Processing states** with animated indicators
- **Success/error states** with visual confirmation

### ✅ Real-time Upload Progress
- **Progress bar** with percentage indicator
- **File-by-file processing** with status updates
- **Loading overlay** with descriptive messages
- **Error handling** with user-friendly notifications

### ✅ Thumbnail Generation
- **Automatic thumbnail creation** for all uploaded images
- **Aspect ratio preservation** with smart cropping
- **Optimized file sizes** for fast preview loading
- **High-quality JPEG compression** for thumbnails

### ✅ Image Processing
- **Automatic compression** for files larger than 3MB
- **Quality optimization** maintaining visual fidelity
- **Dimension validation** for panorama aspect ratios (2:1)
- **Format validation** (JPG, PNG for panoramas; PNG for layers)

### ✅ Metadata Validation
- **JSON and CSV support** with comprehensive parsing
- **Schema validation** ensuring required fields
- **Circular reference detection** in node chains
- **Linear path validation** for walkthrough generation
- **Warning system** for non-critical issues

### ✅ Notification System
- **Toast notifications** for success, warning, and error states
- **Auto-dismissing messages** with manual close option
- **Color-coded indicators** for different message types
- **Non-blocking interface** that doesn't interrupt workflow

## File Structure

```
loft-tour/
├── js/
│   ├── loft-tour-editor.js           # Main upload interface logic
│   └── loft-tour-metadata-parser.js  # Metadata validation and parsing
├── css/
│   └── loft-tour.css                 # Enhanced styling for upload interface
├── templates/
│   ├── sample-metadata.json         # Example JSON metadata format
│   └── sample-metadata.csv          # Example CSV metadata format
├── test-drag-drop-upload.html       # Standalone test interface
├── test-upload-functionality.js     # Automated test suite
└── README-drag-drop-upload.md       # This documentation
```

## Usage

### Basic Upload Process

1. **Open the upload interface** (`loft-tour/index.html` or `test-drag-drop-upload.html`)
2. **Drag panorama images** to the first upload zone or click to browse
3. **Upload metadata file** (JSON or CSV) to the second zone
4. **Optionally add layer files** (PNG with transparency) to the third zone
5. **Click "Generate Tour"** once all required files are uploaded

### Supported File Formats

#### Panoramas
- **Formats**: JPG, JPEG, PNG
- **Aspect Ratio**: 2:1 (equirectangular)
- **Recommended Size**: 4096x2048 or higher
- **Max File Size**: 20MB (auto-compressed to ~2.5MB)

#### Metadata
- **JSON Format**: Complete tour structure with nodes and layers
- **CSV Format**: Simplified node definitions (see templates)
- **Required Fields**: node_id, label, image
- **Optional Fields**: next_node, rotation limits, layers

#### Layers
- **Format**: PNG with transparency
- **Usage**: Parallax overlays for depth effects
- **Positioning**: 0-1 coordinate system
- **Parallax Factor**: 0 (static) to 1 (full movement)

## Testing

### Automated Tests

Run the test suite in browser console:

```javascript
// Run all tests
window.testUploadFunctionality.runAllTests();

// Run individual tests
window.testUploadFunctionality.testMetadataParser();
window.testUploadFunctionality.testImageValidation();
window.testUploadFunctionality.testNotifications();
```

### Manual Testing

1. **Open** `test-drag-drop-upload.html` in a browser
2. **Test drag & drop** with various file types
3. **Verify visual feedback** during drag operations
4. **Check progress indicators** during upload
5. **Confirm thumbnail generation** in preview areas
6. **Test error handling** with invalid files

## API Reference

### LoftTourEditor Class

#### Methods

```javascript
// Handle panorama upload with progress tracking
async handlePanoramaUpload(files)

// Handle metadata upload with validation
async handleMetadataUpload(file)

// Handle layer upload with thumbnail generation
async handleLayerUpload(files)

// Validate panorama image dimensions (2:1 aspect ratio)
async validatePanoramaImage(file)

// Compress image if larger than 3MB
async compressImageIfNeeded(file)

// Generate thumbnail for image preview
async generateThumbnail(file, maxWidth = 150, maxHeight = 100)

// Show upload progress with progress bar
showUploadProgress(message, totalFiles)

// Update progress during file processing
updateUploadProgress(currentFile, totalFiles, message)

// Display success/error/warning notifications
showUploadSuccess(message)
showUploadError(message)
showUploadWarning(message)
```

### LoftTourMetadataParser Class

#### Methods

```javascript
// Parse metadata file (JSON or CSV)
async parseFile(file)

// Generate linear walkthrough from metadata
generateLinearWalkthrough(data)

// Create template files
static createJSONTemplate()
static createCSVTemplate()
```

## Configuration

### Upload Limits

```javascript
const maxFileSize = 3 * 1024 * 1024; // 3MB before compression
const maxThumbnailWidth = 150;
const maxThumbnailHeight = 100;
const compressionQuality = 0.85; // 85% JPEG quality
```

### Validation Rules

```javascript
// Panorama validation
const validPanoramaTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const validAspectRatio = 2.0; // 2:1 ratio
const aspectRatioTolerance = 0.1; // ±10% tolerance

// Layer validation
const validLayerTypes = ['image/png'];

// Metadata validation
const requiredFields = ['node_id', 'label', 'image'];
const optionalFields = ['next_node', 'rotation_h', 'rotation_v'];
```

## Error Handling

### Common Issues and Solutions

1. **"Invalid panorama dimensions"**
   - Ensure images have 2:1 aspect ratio (e.g., 4096x2048)
   - Use equirectangular projection format

2. **"Failed to parse metadata"**
   - Check JSON syntax or CSV format
   - Ensure required fields are present
   - Validate node references

3. **"File too large"**
   - Images over 20MB will be rejected
   - Use automatic compression feature
   - Optimize images before upload

4. **"Circular reference detected"**
   - Check nextNode references in metadata
   - Ensure linear walkthrough path
   - Remove circular dependencies

## Performance Optimizations

### Image Processing
- **Progressive loading** for large files
- **Canvas-based compression** for optimal quality
- **Thumbnail caching** to avoid regeneration
- **Memory cleanup** after processing

### User Experience
- **Non-blocking interface** during uploads
- **Visual feedback** for all operations
- **Graceful error handling** with recovery options
- **Progress indicators** for long operations

## Browser Compatibility

- **Chrome 90+**: Full support
- **Firefox 88+**: Full support
- **Safari 14+**: Full support
- **Edge 90+**: Full support

### Required APIs
- File API for file handling
- Canvas API for image processing
- Drag and Drop API for interface
- Blob API for file creation
- URL.createObjectURL for previews

## Future Enhancements

### Planned Features
- **Batch processing** for multiple tours
- **Cloud storage integration** for large files
- **Advanced image editing** tools
- **Metadata templates** for common scenarios
- **Export/import** of tour configurations

### Performance Improvements
- **Web Workers** for image processing
- **Streaming uploads** for large files
- **Progressive enhancement** for slow connections
- **Offline support** with service workers

## Troubleshooting

### Debug Mode

Enable debug logging:

```javascript
window.loftEditor.debugMode = true;
```

### Console Commands

```javascript
// Check upload status
console.log(window.loftEditor.uploadedPanoramas);
console.log(window.loftEditor.tourMetadata);

// Test specific functionality
window.testUploadFunctionality.runAllTests();

// Clear uploaded files
window.loftEditor.uploadedPanoramas = [];
window.loftEditor.uploadedLayers = [];
window.loftEditor.tourMetadata = null;
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Run automated tests to verify functionality
3. Ensure file formats match requirements
4. Validate metadata structure against templates