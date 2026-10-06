/**
 * LOFT³ Tour Template Generator and Error Reporting System
 * Provides functionality to generate metadata templates and validate tour data
 */

class LoftTourTemplateGenerator {
    constructor() {
        this.schema = null;
        this.validationErrors = [];
        this.validationWarnings = [];
        this.loadSchema();
    }

    /**
     * Load the JSON schema for validation
     */
    async loadSchema() {
        try {
            const response = await fetch('/loft-tour/templates/metadata-schema.json');
            this.schema = await response.json();
        } catch (error) {
            console.warn('Could not load metadata schema:', error);
        }
    }

    /**
     * Generate a basic metadata template
     * @param {Object} options - Template generation options
     * @returns {Object} Generated metadata template
     */
    generateBasicTemplate(options = {}) {
        const {
            tourName = 'New Tour',
            description = 'A beautiful property walkthrough',
            nodeCount = 3,
            includeLayerExamples = false,
            propertyType = 'residential'
        } = options;

        const template = {
            "$schema": "https://loft-tour.schema.json",
            "version": "1.0",
            "tourName": tourName,
            "description": description,
            "metadata": {
                "created": new Date().toISOString().split('T')[0],
                "author": "LOFT³ System",
                "propertyType": propertyType,
                "totalNodes": nodeCount,
                "estimatedDuration": this.estimateDuration(nodeCount)
            },
            "settings": {
                "autoAdvance": false,
                "showProgress": true,
                "enableGyroscope": true,
                "defaultTransitionDuration": 1200
            },
            "nodes": []
        };

        // Generate nodes
        for (let i = 0; i < nodeCount; i++) {
            const isLast = i === nodeCount - 1;
            const nodeId = this.generateNodeId(i);
            const nextNodeId = isLast ? null : this.generateNodeId(i + 1);

            const node = {
                "id": nodeId,
                "label": this.generateNodeLabel(i),
                "description": this.generateNodeDescription(i),
                "image": `${nodeId}.jpg`,
                "nextNode": nextNodeId,
                "rotationLimits": { "h": 30, "v": 10 },
                "initialYaw": 0,
                "initialPitch": 0,
                "nodeOrder": i
            };

            // Add layer examples if requested
            if (includeLayerExamples && i < 2) {
                node.layers = this.generateSampleLayers(nodeId);
            }

            template.nodes.push(node);
        }

        return template;
    }

    /**
     * Generate a CSV template
     * @param {Object} options - Template generation options
     * @returns {string} CSV template content
     */
    generateCSVTemplate(options = {}) {
        const { nodeCount = 3 } = options;

        let csv = '# CSV Metadata Template for LOFT³ Tours\n';
        csv += '# Note: CSV format does not support layers - use JSON format for layer support\n';
        csv += '# Required: node_id, label, image\n';
        csv += '# Optional: next_node, rotation_h, rotation_v, initial_yaw, initial_pitch, order, description\n\n';
        csv += 'node_id,label,image,next_node,rotation_h,rotation_v,initial_yaw,initial_pitch,order,description\n';

        for (let i = 0; i < nodeCount; i++) {
            const isLast = i === nodeCount - 1;
            const nodeId = this.generateNodeId(i);
            const nextNodeId = isLast ? '' : this.generateNodeId(i + 1);
            const label = this.generateNodeLabel(i);
            const description = this.generateNodeDescription(i);

            csv += `${nodeId},"${label}",${nodeId}.jpg,${nextNodeId},30,10,0,0,${i},"${description}"\n`;
        }

        return csv;
    }

    /**
     * Validate metadata against schema and business rules
     * @param {Object} metadata - Metadata to validate
     * @returns {Object} Validation result
     */
    validateMetadata(metadata) {
        this.validationErrors = [];
        this.validationWarnings = [];

        // Basic structure validation
        this.validateBasicStructure(metadata);

        // Node validation
        if (metadata.nodes && Array.isArray(metadata.nodes)) {
            this.validateNodes(metadata.nodes);
        }

        // Cross-reference validation
        this.validateNodeReferences(metadata.nodes || []);

        // Business rule validation
        this.validateBusinessRules(metadata);

        return {
            isValid: this.validationErrors.length === 0,
            errors: [...this.validationErrors],
            warnings: [...this.validationWarnings],
            summary: this.generateValidationSummary()
        };
    }

    /**
     * Generate detailed error report
     * @param {Object} validationResult - Result from validateMetadata
     * @returns {string} Formatted error report
     */
    generateErrorReport(validationResult) {
        let report = '=== LOFT³ Tour Metadata Validation Report ===\n\n';
        
        report += `Status: ${validationResult.isValid ? 'VALID' : 'INVALID'}\n`;
        report += `Errors: ${validationResult.errors.length}\n`;
        report += `Warnings: ${validationResult.warnings.length}\n\n`;

        if (validationResult.errors.length > 0) {
            report += '🚨 ERRORS (Must be fixed):\n';
            validationResult.errors.forEach((error, index) => {
                report += `${index + 1}. ${error}\n`;
            });
            report += '\n';
        }

        if (validationResult.warnings.length > 0) {
            report += '⚠️  WARNINGS (Recommended fixes):\n';
            validationResult.warnings.forEach((warning, index) => {
                report += `${index + 1}. ${warning}\n`;
            });
            report += '\n';
        }

        if (validationResult.isValid) {
            report += '✅ Metadata is valid and ready for upload!\n';
        } else {
            report += '❌ Please fix the errors above before uploading.\n';
        }

        report += '\n' + validationResult.summary;

        return report;
    }

    // Private helper methods

    generateNodeId(index) {
        const nodeNames = ['entrance', 'foyer', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'balcony', 'garden'];
        return nodeNames[index] || `node_${index + 1}`;
    }

    generateNodeLabel(index) {
        const labels = ['Main Entrance', 'Grand Foyer', 'Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom', 'Balcony', 'Garden'];
        return labels[index] || `Room ${index + 1}`;
    }

    generateNodeDescription(index) {
        const descriptions = [
            'Welcome to this beautiful property entrance',
            'Spacious foyer with elegant design',
            'Comfortable living area with modern furnishings',
            'Fully equipped kitchen with premium appliances',
            'Relaxing master bedroom with ensuite access',
            'Modern bathroom with luxury fixtures',
            'Private balcony with stunning views',
            'Beautiful garden space for outdoor relaxation'
        ];
        return descriptions[index] || `Beautiful space showcasing quality design`;
    }

    generateSampleLayers(nodeId) {
        const layerExamples = {
            entrance: [
                {
                    "name": "welcome_sign",
                    "description": "Welcome sign with property information",
                    "image": "welcome_sign.png",
                    "position": { "x": 0.5, "y": 0.3 },
                    "parallaxFactor": 0.5,
                    "scale": 1.0,
                    "rotation": 0,
                    "opacity": 1.0,
                    "visible": true,
                    "depthOrder": 1
                }
            ],
            living_room: [
                {
                    "name": "furniture_highlight",
                    "description": "Highlight modern furniture pieces",
                    "image": "furniture_highlight.png",
                    "position": { "x": 0.3, "y": 0.6 },
                    "parallaxFactor": 0.7,
                    "scale": 1.2,
                    "rotation": 0,
                    "opacity": 0.8,
                    "visible": true,
                    "depthOrder": 2
                }
            ]
        };

        return layerExamples[nodeId] || [];
    }

    estimateDuration(nodeCount) {
        const baseTime = 30; // seconds per node
        const totalSeconds = nodeCount * baseTime;
        const minutes = Math.ceil(totalSeconds / 60);
        return `${minutes}-${minutes + 1} minutes`;
    }

    validateBasicStructure(metadata) {
        if (!metadata || typeof metadata !== 'object') {
            this.validationErrors.push('Metadata must be a valid JSON object');
            return;
        }

        if (!metadata.tourName || typeof metadata.tourName !== 'string') {
            this.validationErrors.push('tourName is required and must be a string');
        } else if (metadata.tourName.length > 255) {
            this.validationErrors.push('tourName must be 255 characters or less');
        }

        if (!metadata.nodes || !Array.isArray(metadata.nodes)) {
            this.validationErrors.push('nodes array is required');
        } else if (metadata.nodes.length === 0) {
            this.validationErrors.push('At least one node is required');
        }

        if (metadata.description && metadata.description.length > 1000) {
            this.validationWarnings.push('Description is quite long (>1000 characters). Consider shortening for better readability.');
        }
    }

    validateNodes(nodes) {
        const nodeIds = new Set();
        const duplicateIds = new Set();

        nodes.forEach((node, index) => {
            const nodePrefix = `Node ${index + 1}`;

            // Required fields
            if (!node.id || typeof node.id !== 'string') {
                this.validationErrors.push(`${nodePrefix}: id is required and must be a string`);
            } else {
                // Check for duplicates
                if (nodeIds.has(node.id)) {
                    duplicateIds.add(node.id);
                    this.validationErrors.push(`${nodePrefix}: Duplicate node ID '${node.id}'`);
                } else {
                    nodeIds.add(node.id);
                }

                // Validate ID format
                if (!/^[a-zA-Z0-9_-]+$/.test(node.id)) {
                    this.validationErrors.push(`${nodePrefix}: ID '${node.id}' contains invalid characters. Use only letters, numbers, hyphens, and underscores.`);
                }
            }

            if (!node.label || typeof node.label !== 'string') {
                this.validationErrors.push(`${nodePrefix}: label is required and must be a string`);
            }

            if (!node.image || typeof node.image !== 'string') {
                this.validationErrors.push(`${nodePrefix}: image is required and must be a string`);
            } else if (!/\.(jpg|jpeg|png)$/i.test(node.image)) {
                this.validationErrors.push(`${nodePrefix}: image '${node.image}' must be a JPG or PNG file`);
            }

            // Optional field validation
            if (node.rotationLimits) {
                this.validateRotationLimits(node.rotationLimits, nodePrefix);
            }

            if (node.initialYaw !== undefined && (node.initialYaw < -180 || node.initialYaw > 180)) {
                this.validationWarnings.push(`${nodePrefix}: initialYaw should be between -180 and 180 degrees`);
            }

            if (node.initialPitch !== undefined && (node.initialPitch < -90 || node.initialPitch > 90)) {
                this.validationWarnings.push(`${nodePrefix}: initialPitch should be between -90 and 90 degrees`);
            }

            // Validate layers
            if (node.layers && Array.isArray(node.layers)) {
                this.validateLayers(node.layers, nodePrefix);
            }
        });
    }

    validateRotationLimits(limits, nodePrefix) {
        if (typeof limits !== 'object') {
            this.validationErrors.push(`${nodePrefix}: rotationLimits must be an object`);
            return;
        }

        if (limits.h !== undefined) {
            if (typeof limits.h !== 'number' || limits.h < 0 || limits.h > 180) {
                this.validationErrors.push(`${nodePrefix}: rotationLimits.h must be a number between 0 and 180`);
            }
        }

        if (limits.v !== undefined) {
            if (typeof limits.v !== 'number' || limits.v < 0 || limits.v > 90) {
                this.validationErrors.push(`${nodePrefix}: rotationLimits.v must be a number between 0 and 90`);
            }
        }
    }

    validateLayers(layers, nodePrefix) {
        const layerNames = new Set();

        layers.forEach((layer, index) => {
            const layerPrefix = `${nodePrefix}, Layer ${index + 1}`;

            if (!layer.name || typeof layer.name !== 'string') {
                this.validationErrors.push(`${layerPrefix}: name is required and must be a string`);
            } else {
                if (layerNames.has(layer.name)) {
                    this.validationErrors.push(`${layerPrefix}: Duplicate layer name '${layer.name}' in node`);
                } else {
                    layerNames.add(layer.name);
                }
            }

            if (!layer.image || typeof layer.image !== 'string') {
                this.validationErrors.push(`${layerPrefix}: image is required and must be a string`);
            } else if (!/\.png$/i.test(layer.image)) {
                this.validationErrors.push(`${layerPrefix}: image '${layer.image}' must be a PNG file`);
            }

            if (!layer.position || typeof layer.position !== 'object') {
                this.validationErrors.push(`${layerPrefix}: position is required and must be an object with x and y coordinates`);
            } else {
                if (typeof layer.position.x !== 'number' || layer.position.x < 0 || layer.position.x > 1) {
                    this.validationErrors.push(`${layerPrefix}: position.x must be a number between 0 and 1`);
                }
                if (typeof layer.position.y !== 'number' || layer.position.y < 0 || layer.position.y > 1) {
                    this.validationErrors.push(`${layerPrefix}: position.y must be a number between 0 and 1`);
                }
            }

            // Optional field validation
            if (layer.parallaxFactor !== undefined && (typeof layer.parallaxFactor !== 'number' || layer.parallaxFactor < 0 || layer.parallaxFactor > 1)) {
                this.validationWarnings.push(`${layerPrefix}: parallaxFactor should be a number between 0 and 1`);
            }

            if (layer.scale !== undefined && (typeof layer.scale !== 'number' || layer.scale < 0.1 || layer.scale > 10)) {
                this.validationWarnings.push(`${layerPrefix}: scale should be a number between 0.1 and 10`);
            }

            if (layer.opacity !== undefined && (typeof layer.opacity !== 'number' || layer.opacity < 0 || layer.opacity > 1)) {
                this.validationWarnings.push(`${layerPrefix}: opacity should be a number between 0 and 1`);
            }
        });
    }

    validateNodeReferences(nodes) {
        const nodeIds = new Set(nodes.map(node => node.id).filter(Boolean));
        const invalidReferences = [];

        nodes.forEach(node => {
            if (node.nextNode && !nodeIds.has(node.nextNode)) {
                invalidReferences.push(`Node '${node.id}' references non-existent nextNode '${node.nextNode}'`);
            }
        });

        if (invalidReferences.length > 0) {
            this.validationErrors.push(...invalidReferences);
        }

        // Check for circular references
        const circularPath = this.detectCircularReferences(nodes);
        if (circularPath.length > 0) {
            this.validationWarnings.push(`Circular reference detected: ${circularPath.join(' → ')}`);
        }
    }

    validateBusinessRules(metadata) {
        if (!metadata.nodes) return;

        // Check for entry points
        const nodeIds = new Set(metadata.nodes.map(n => n.id));
        const referencedNodes = new Set(metadata.nodes.map(n => n.nextNode).filter(Boolean));
        const entryNodes = [...nodeIds].filter(id => !referencedNodes.has(id));

        if (entryNodes.length === 0) {
            this.validationWarnings.push('No entry node found. All nodes are referenced by nextNode. Consider having a clear starting point.');
        } else if (entryNodes.length > 1) {
            this.validationWarnings.push(`Multiple entry nodes found: ${entryNodes.join(', ')}. Consider having a single starting point for better user experience.`);
        }

        // Check for end points
        const endNodes = metadata.nodes.filter(n => !n.nextNode).length;
        if (endNodes === 0) {
            this.validationWarnings.push('No end node found. Tour may loop indefinitely.');
        } else if (endNodes > 1) {
            this.validationWarnings.push(`Multiple end nodes found (${endNodes}). This may confuse users about tour completion.`);
        }

        // Check node count vs estimated duration
        if (metadata.metadata && metadata.metadata.totalNodes) {
            const actualNodes = metadata.nodes.length;
            const declaredNodes = metadata.metadata.totalNodes;
            if (actualNodes !== declaredNodes) {
                this.validationWarnings.push(`Metadata declares ${declaredNodes} nodes but ${actualNodes} nodes are defined.`);
            }
        }
    }

    detectCircularReferences(nodes) {
        const nodeMap = new Map();
        nodes.forEach(node => {
            if (node.id && node.nextNode) {
                nodeMap.set(node.id, node.nextNode);
            }
        });

        for (const [startNode, nextNode] of nodeMap) {
            const visited = new Set();
            let current = startNode;

            while (current && !visited.has(current)) {
                visited.add(current);
                current = nodeMap.get(current);

                if (current === startNode) {
                    return [...visited, current];
                }
            }
        }

        return [];
    }

    generateValidationSummary() {
        const totalNodes = this.validationErrors.filter(e => e.includes('Node')).length;
        const totalLayers = this.validationErrors.filter(e => e.includes('Layer')).length;

        let summary = 'Validation Summary:\n';
        summary += `- Structure: ${this.validationErrors.filter(e => !e.includes('Node') && !e.includes('Layer')).length === 0 ? 'OK' : 'Issues found'}\n`;
        summary += `- Nodes: ${totalNodes === 0 ? 'OK' : `${totalNodes} issues`}\n`;
        summary += `- Layers: ${totalLayers === 0 ? 'OK' : `${totalLayers} issues`}\n`;
        summary += `- References: ${this.validationErrors.filter(e => e.includes('references')).length === 0 ? 'OK' : 'Issues found'}\n`;

        return summary;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoftTourTemplateGenerator;
} else if (typeof window !== 'undefined') {
    window.LoftTourTemplateGenerator = LoftTourTemplateGenerator;
}