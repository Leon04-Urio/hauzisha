/**
 * LOFT³ Metadata Parser
 * Parses JSON/CSV metadata files to generate tour structure
 * Validates nodes, references, and layer definitions
 */

class LoftTourMetadataParser {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Parse metadata file (JSON or CSV)
   * @param {File} file - The metadata file to parse
   * @returns {Promise<Object>} Parsed and validated tour data
   */
  async parseFile(file) {
    this.errors = [];
    this.warnings = [];

    const extension = file.name.split('.').pop().toLowerCase();
    const content = await this.readFileContent(file);

    let data;
    if (extension === 'json') {
      data = this.parseJSON(content);
    } else if (extension === 'csv') {
      data = this.parseCSV(content);
    } else {
      throw new Error('Unsupported file format. Please use JSON or CSV.');
    }

    // Validate the parsed data
    this.validateTourData(data);

    if (this.errors.length > 0) {
      throw new Error(`Validation failed:\n${this.errors.join('\n')}`);
    }

    return {
      data: data,
      warnings: this.warnings
    };
  }

  /**
   * Read file content as text
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse JSON metadata
   */
  parseJSON(content) {
    try {
      const data = JSON.parse(content);
      
      // Ensure nodes array exists
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('JSON must contain a "nodes" array');
      }

      return data;
    } catch (e) {
      throw new Error(`Invalid JSON format: ${e.message}`);
    }
  }

  /**
   * Parse CSV metadata
   */
  parseCSV(content) {
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    // Parse header
    const header = this.parseCSVLine(lines[0]);
    
    // Validate required columns
    const requiredColumns = ['node_id', 'label', 'image'];
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`CSV missing required columns: ${missingColumns.join(', ')}`);
    }

    // Parse data rows
    const nodes = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = this.parseCSVLine(line);
      
      if (values.length !== header.length) {
        this.warnings.push(`Row ${i + 1}: Column count mismatch (expected ${header.length}, got ${values.length})`);
        continue;
      }

      // Create node object
      const node = {};
      header.forEach((col, idx) => {
        node[col] = values[idx];
      });

      // Convert CSV format to JSON format
      const formattedNode = {
        id: node.node_id,
        label: node.label,
        image: node.image,
        nextNode: node.next_node || null,
        rotationLimits: {
          h: parseFloat(node.rotation_h) || 30,
          v: parseFloat(node.rotation_v) || 10
        }
      };

      // Add optional fields
      if (node.initial_yaw) formattedNode.initialYaw = parseFloat(node.initial_yaw);
      if (node.initial_pitch) formattedNode.initialPitch = parseFloat(node.initial_pitch);
      if (node.order) formattedNode.order = parseInt(node.order);

      nodes.push(formattedNode);
    }

    return {
      tourName: 'Imported Tour',
      nodes: nodes
    };
  }

  /**
   * Parse a single CSV line (handles quoted values)
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Validate tour data structure
   */
  validateTourData(data) {
    if (!data.nodes || data.nodes.length === 0) {
      this.errors.push('Tour must contain at least one node');
      return;
    }

    // Validate each node
    const nodeIds = new Set();
    const nextNodeRefs = new Set();

    data.nodes.forEach((node, index) => {
      this.validateNode(node, index, nodeIds, nextNodeRefs);
    });

    // Check for duplicate node IDs
    if (nodeIds.size !== data.nodes.length) {
      this.errors.push('Duplicate node IDs detected');
    }

    // Check for invalid next node references
    nextNodeRefs.forEach(nextId => {
      if (nextId && !nodeIds.has(nextId)) {
        this.errors.push(`Invalid next node reference: "${nextId}" does not exist`);
      }
    });

    // Check for circular references
    this.checkCircularReferences(data.nodes);

    // Validate linear path
    this.validateLinearPath(data.nodes);
  }

  /**
   * Validate individual node
   */
  validateNode(node, index, nodeIds, nextNodeRefs) {
    const nodeLabel = `Node ${index + 1} (${node.id || 'unnamed'})`;

    // Required fields
    if (!node.id) {
      this.errors.push(`${nodeLabel}: Missing required field "id"`);
    } else {
      nodeIds.add(node.id);
    }

    if (!node.label) {
      this.errors.push(`${nodeLabel}: Missing required field "label"`);
    }

    if (!node.image) {
      this.errors.push(`${nodeLabel}: Missing required field "image"`);
    } else {
      // Validate image filename
      const validExtensions = ['.jpg', '.jpeg', '.png'];
      const hasValidExtension = validExtensions.some(ext => 
        node.image.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        this.warnings.push(`${nodeLabel}: Image "${node.image}" should have .jpg, .jpeg, or .png extension`);
      }
    }

    // Track next node references
    if (node.nextNode) {
      nextNodeRefs.add(node.nextNode);
    }

    // Validate rotation limits
    if (node.rotationLimits) {
      if (typeof node.rotationLimits.h !== 'number' || node.rotationLimits.h < 0 || node.rotationLimits.h > 180) {
        this.warnings.push(`${nodeLabel}: Horizontal rotation limit should be between 0 and 180 degrees`);
      }
      if (typeof node.rotationLimits.v !== 'number' || node.rotationLimits.v < 0 || node.rotationLimits.v > 90) {
        this.warnings.push(`${nodeLabel}: Vertical rotation limit should be between 0 and 90 degrees`);
      }
    }

    // Validate layers if present
    if (node.layers && Array.isArray(node.layers)) {
      node.layers.forEach((layer, layerIndex) => {
        this.validateLayer(layer, layerIndex, nodeLabel);
      });
    }
  }

  /**
   * Validate layer definition
   */
  validateLayer(layer, index, nodeLabel) {
    const layerLabel = `${nodeLabel}, Layer ${index + 1}`;

    if (!layer.name) {
      this.warnings.push(`${layerLabel}: Missing layer name`);
    }

    if (!layer.image) {
      this.errors.push(`${layerLabel}: Missing layer image`);
    } else if (!layer.image.toLowerCase().endsWith('.png')) {
      this.warnings.push(`${layerLabel}: Layer images should be PNG format with transparency`);
    }

    if (layer.position) {
      if (typeof layer.position.x !== 'number' || layer.position.x < 0 || layer.position.x > 1) {
        this.warnings.push(`${layerLabel}: Position X should be between 0 and 1`);
      }
      if (typeof layer.position.y !== 'number' || layer.position.y < 0 || layer.position.y > 1) {
        this.warnings.push(`${layerLabel}: Position Y should be between 0 and 1`);
      }
    }

    if (layer.parallaxFactor !== undefined) {
      if (typeof layer.parallaxFactor !== 'number' || layer.parallaxFactor < 0 || layer.parallaxFactor > 1) {
        this.warnings.push(`${layerLabel}: Parallax factor should be between 0 and 1`);
      }
    }

    if (layer.scale !== undefined) {
      if (typeof layer.scale !== 'number' || layer.scale <= 0) {
        this.warnings.push(`${layerLabel}: Scale should be a positive number`);
      }
    }
  }

  /**
   * Check for circular references in node chain
   */
  checkCircularReferences(nodes) {
    const nodeMap = new Map();
    nodes.forEach(node => nodeMap.set(node.id, node));

    nodes.forEach(startNode => {
      const visited = new Set();
      let current = startNode;

      while (current && current.nextNode) {
        if (visited.has(current.id)) {
          this.errors.push(`Circular reference detected in node chain starting from "${startNode.id}"`);
          break;
        }
        
        visited.add(current.id);
        current = nodeMap.get(current.nextNode);
      }
    });
  }

  /**
   * Validate linear path structure
   */
  validateLinearPath(nodes) {
    // Find entry point (node with no incoming references)
    const hasIncoming = new Set();
    nodes.forEach(node => {
      if (node.nextNode) {
        hasIncoming.add(node.nextNode);
      }
    });

    const entryPoints = nodes.filter(node => !hasIncoming.has(node.id));

    if (entryPoints.length === 0) {
      this.errors.push('No entry point found (all nodes have incoming references)');
    } else if (entryPoints.length > 1) {
      this.warnings.push(`Multiple entry points found: ${entryPoints.map(n => n.id).join(', ')}. First node will be used as start.`);
    }

    // Check for orphaned nodes (nodes not in the main chain)
    if (entryPoints.length > 0) {
      const reachable = new Set();
      const nodeMap = new Map();
      nodes.forEach(node => nodeMap.set(node.id, node));

      let current = entryPoints[0];
      while (current) {
        reachable.add(current.id);
        current = current.nextNode ? nodeMap.get(current.nextNode) : null;
      }

      const orphaned = nodes.filter(node => !reachable.has(node.id));
      if (orphaned.length > 0) {
        this.warnings.push(`Orphaned nodes (not in main path): ${orphaned.map(n => n.id).join(', ')}`);
      }
    }
  }

  /**
   * Generate linear walkthrough from metadata
   * Returns ordered array of nodes following the nextNode chain
   */
  generateLinearWalkthrough(data) {
    if (!data.nodes || data.nodes.length === 0) {
      return [];
    }

    const nodeMap = new Map();
    data.nodes.forEach(node => nodeMap.set(node.id, node));

    // Find entry point
    const hasIncoming = new Set();
    data.nodes.forEach(node => {
      if (node.nextNode) {
        hasIncoming.add(node.nextNode);
      }
    });

    const entryPoints = data.nodes.filter(node => !hasIncoming.has(node.id));
    
    if (entryPoints.length === 0) {
      // No clear entry point, use first node
      return data.nodes;
    }

    // Build linear path
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

  /**
   * Create metadata template
   */
  static createJSONTemplate() {
    return {
      tourName: "My Property Tour",
      description: "A beautiful walkthrough of the property",
      nodes: [
        {
          id: "entrance",
          label: "Main Entrance",
          image: "entrance.jpg",
          nextNode: "living_room",
          rotationLimits: { h: 30, v: 10 },
          initialYaw: 0,
          initialPitch: 0,
          layers: [
            {
              name: "welcome_sign",
              image: "welcome_sign.png",
              position: { x: 0.5, y: 0.3 },
              parallaxFactor: 0.5,
              scale: 1.0,
              rotation: 0,
              opacity: 1.0
            }
          ]
        },
        {
          id: "living_room",
          label: "Living Room",
          image: "living_room.jpg",
          nextNode: "bedroom",
          rotationLimits: { h: 45, v: 15 }
        },
        {
          id: "bedroom",
          label: "Master Bedroom",
          image: "bedroom.jpg",
          nextNode: null,
          rotationLimits: { h: 30, v: 10 }
        }
      ]
    };
  }

  /**
   * Create CSV template
   */
  static createCSVTemplate() {
    return `node_id,label,image,next_node,rotation_h,rotation_v,initial_yaw,initial_pitch,order
entrance,Main Entrance,entrance.jpg,living_room,30,10,0,0,0
living_room,Living Room,living_room.jpg,bedroom,45,15,0,0,1
bedroom,Master Bedroom,bedroom.jpg,,30,10,0,0,2`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoftTourMetadataParser;
} else {
  window.LoftTourMetadataParser = LoftTourMetadataParser;
}
