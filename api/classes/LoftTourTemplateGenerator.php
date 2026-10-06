<?php

/**
 * LOFT³ Tour Template Generator and Validation System
 * Server-side template generation and metadata validation
 */
class LoftTourTemplateGenerator {
    
    private $validationErrors = [];
    private $validationWarnings = [];
    private $schema = null;

    public function __construct() {
        $this->loadSchema();
    }

    /**
     * Load JSON schema for validation
     */
    private function loadSchema() {
        $schemaPath = __DIR__ . '/../../loft-tour/templates/metadata-schema.json';
        if (file_exists($schemaPath)) {
            $this->schema = json_decode(file_get_contents($schemaPath), true);
        }
    }

    /**
     * Generate a basic JSON metadata template
     * @param array $options Template generation options
     * @return array Generated metadata template
     */
    public function generateBasicTemplate($options = []) {
        $tourName = $options['tourName'] ?? 'New Tour';
        $description = $options['description'] ?? 'A beautiful property walkthrough';
        $nodeCount = $options['nodeCount'] ?? 3;
        $includeLayerExamples = $options['includeLayerExamples'] ?? false;
        $propertyType = $options['propertyType'] ?? 'residential';

        $template = [
            '$schema' => 'https://loft-tour.schema.json',
            'version' => '1.0',
            'tourName' => $tourName,
            'description' => $description,
            'metadata' => [
                'created' => date('Y-m-d'),
                'author' => 'LOFT³ System',
                'propertyType' => $propertyType,
                'totalNodes' => $nodeCount,
                'estimatedDuration' => $this->estimateDuration($nodeCount)
            ],
            'settings' => [
                'autoAdvance' => false,
                'showProgress' => true,
                'enableGyroscope' => true,
                'defaultTransitionDuration' => 1200
            ],
            'nodes' => []
        ];

        // Generate nodes
        for ($i = 0; $i < $nodeCount; $i++) {
            $isLast = $i === $nodeCount - 1;
            $nodeId = $this->generateNodeId($i);
            $nextNodeId = $isLast ? null : $this->generateNodeId($i + 1);

            $node = [
                'id' => $nodeId,
                'label' => $this->generateNodeLabel($i),
                'description' => $this->generateNodeDescription($i),
                'image' => $nodeId . '.jpg',
                'nextNode' => $nextNodeId,
                'rotationLimits' => ['h' => 30, 'v' => 10],
                'initialYaw' => 0,
                'initialPitch' => 0,
                'nodeOrder' => $i
            ];

            // Add layer examples if requested
            if ($includeLayerExamples && $i < 2) {
                $node['layers'] = $this->generateSampleLayers($nodeId);
            }

            $template['nodes'][] = $node;
        }

        return $template;
    }

    /**
     * Generate a CSV template
     * @param array $options Template generation options
     * @return string CSV template content
     */
    public function generateCSVTemplate($options = []) {
        $nodeCount = $options['nodeCount'] ?? 3;

        $csv = "# CSV Metadata Template for LOFT³ Tours\n";
        $csv .= "# Note: CSV format does not support layers - use JSON format for layer support\n";
        $csv .= "# Required: node_id, label, image\n";
        $csv .= "# Optional: next_node, rotation_h, rotation_v, initial_yaw, initial_pitch, order, description\n\n";
        $csv .= "node_id,label,image,next_node,rotation_h,rotation_v,initial_yaw,initial_pitch,order,description\n";

        for ($i = 0; $i < $nodeCount; $i++) {
            $isLast = $i === $nodeCount - 1;
            $nodeId = $this->generateNodeId($i);
            $nextNodeId = $isLast ? '' : $this->generateNodeId($i + 1);
            $label = $this->generateNodeLabel($i);
            $description = $this->generateNodeDescription($i);

            $csv .= sprintf(
                '%s,"%s",%s.jpg,%s,30,10,0,0,%d,"%s"' . "\n",
                $nodeId,
                $label,
                $nodeId,
                $nextNodeId,
                $i,
                $description
            );
        }

        return $csv;
    }

    /**
     * Validate metadata against schema and business rules
     * @param array $metadata Metadata to validate
     * @return array Validation result
     */
    public function validateMetadata($metadata) {
        $this->validationErrors = [];
        $this->validationWarnings = [];

        // Basic structure validation
        $this->validateBasicStructure($metadata);

        // Node validation
        if (isset($metadata['nodes']) && is_array($metadata['nodes'])) {
            $this->validateNodes($metadata['nodes']);
        }

        // Cross-reference validation
        $this->validateNodeReferences($metadata['nodes'] ?? []);

        // Business rule validation
        $this->validateBusinessRules($metadata);

        return [
            'isValid' => count($this->validationErrors) === 0,
            'errors' => $this->validationErrors,
            'warnings' => $this->validationWarnings,
            'summary' => $this->generateValidationSummary()
        ];
    }

    /**
     * Generate detailed error report
     * @param array $validationResult Result from validateMetadata
     * @return string Formatted error report
     */
    public function generateErrorReport($validationResult) {
        $report = "=== LOFT³ Tour Metadata Validation Report ===\n\n";
        
        $report .= sprintf("Status: %s\n", $validationResult['isValid'] ? 'VALID' : 'INVALID');
        $report .= sprintf("Errors: %d\n", count($validationResult['errors']));
        $report .= sprintf("Warnings: %d\n\n", count($validationResult['warnings']));

        if (!empty($validationResult['errors'])) {
            $report .= "🚨 ERRORS (Must be fixed):\n";
            foreach ($validationResult['errors'] as $index => $error) {
                $report .= sprintf("%d. %s\n", $index + 1, $error);
            }
            $report .= "\n";
        }

        if (!empty($validationResult['warnings'])) {
            $report .= "⚠️  WARNINGS (Recommended fixes):\n";
            foreach ($validationResult['warnings'] as $index => $warning) {
                $report .= sprintf("%d. %s\n", $index + 1, $warning);
            }
            $report .= "\n";
        }

        if ($validationResult['isValid']) {
            $report .= "✅ Metadata is valid and ready for upload!\n";
        } else {
            $report .= "❌ Please fix the errors above before uploading.\n";
        }

        $report .= "\n" . $validationResult['summary'];

        return $report;
    }

    /**
     * Create template files in the templates directory
     * @param string $templateType Type of template (basic, minimal, complex)
     * @param array $options Template options
     * @return array Result with file paths
     */
    public function createTemplateFiles($templateType = 'basic', $options = []) {
        $templatesDir = __DIR__ . '/../../loft-tour/templates/';
        
        if (!is_dir($templatesDir)) {
            mkdir($templatesDir, 0755, true);
        }

        $results = [];

        switch ($templateType) {
            case 'minimal':
                $template = $this->generateMinimalTemplate();
                $filename = 'generated-minimal-template.json';
                break;
            
            case 'complex':
                $template = $this->generateComplexTemplate($options);
                $filename = 'generated-complex-template.json';
                break;
            
            case 'basic':
            default:
                $template = $this->generateBasicTemplate($options);
                $filename = 'generated-basic-template.json';
                break;
        }

        // Save JSON template
        $jsonPath = $templatesDir . $filename;
        $jsonContent = json_encode($template, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        file_put_contents($jsonPath, $jsonContent);
        $results['json'] = $jsonPath;

        // Save CSV template
        $csvFilename = str_replace('.json', '.csv', $filename);
        $csvPath = $templatesDir . $csvFilename;
        $csvContent = $this->generateCSVTemplate($options);
        file_put_contents($csvPath, $csvContent);
        $results['csv'] = $csvPath;

        return [
            'success' => true,
            'message' => 'Template files created successfully',
            'files' => $results
        ];
    }

    // Private helper methods

    private function generateNodeId($index) {
        $nodeNames = ['entrance', 'foyer', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'balcony', 'garden'];
        return $nodeNames[$index] ?? "node_" . ($index + 1);
    }

    private function generateNodeLabel($index) {
        $labels = ['Main Entrance', 'Grand Foyer', 'Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom', 'Balcony', 'Garden'];
        return $labels[$index] ?? "Room " . ($index + 1);
    }

    private function generateNodeDescription($index) {
        $descriptions = [
            'Welcome to this beautiful property entrance',
            'Spacious foyer with elegant design',
            'Comfortable living area with modern furnishings',
            'Fully equipped kitchen with premium appliances',
            'Relaxing master bedroom with ensuite access',
            'Modern bathroom with luxury fixtures',
            'Private balcony with stunning views',
            'Beautiful garden space for outdoor relaxation'
        ];
        return $descriptions[$index] ?? 'Beautiful space showcasing quality design';
    }

    private function generateSampleLayers($nodeId) {
        $layerExamples = [
            'entrance' => [
                [
                    'name' => 'welcome_sign',
                    'description' => 'Welcome sign with property information',
                    'image' => 'welcome_sign.png',
                    'position' => ['x' => 0.5, 'y' => 0.3],
                    'parallaxFactor' => 0.5,
                    'scale' => 1.0,
                    'rotation' => 0,
                    'opacity' => 1.0,
                    'visible' => true,
                    'depthOrder' => 1
                ]
            ],
            'living_room' => [
                [
                    'name' => 'furniture_highlight',
                    'description' => 'Highlight modern furniture pieces',
                    'image' => 'furniture_highlight.png',
                    'position' => ['x' => 0.3, 'y' => 0.6],
                    'parallaxFactor' => 0.7,
                    'scale' => 1.2,
                    'rotation' => 0,
                    'opacity' => 0.8,
                    'visible' => true,
                    'depthOrder' => 2
                ]
            ]
        ];

        return $layerExamples[$nodeId] ?? [];
    }

    private function estimateDuration($nodeCount) {
        $baseTime = 30; // seconds per node
        $totalSeconds = $nodeCount * $baseTime;
        $minutes = ceil($totalSeconds / 60);
        return $minutes . '-' . ($minutes + 1) . ' minutes';
    }

    private function generateMinimalTemplate() {
        return [
            'tourName' => 'Minimal Tour Example',
            'description' => 'A minimal tour with only required fields',
            'nodes' => [
                [
                    'id' => 'start',
                    'label' => 'Starting Point',
                    'image' => 'start.jpg',
                    'nextNode' => 'end'
                ],
                [
                    'id' => 'end',
                    'label' => 'End Point',
                    'image' => 'end.jpg',
                    'nextNode' => null
                ]
            ]
        ];
    }

    private function generateComplexTemplate($options = []) {
        $nodeCount = $options['nodeCount'] ?? 8;
        $template = $this->generateBasicTemplate(array_merge($options, [
            'tourName' => 'Luxury Villa Complete Tour',
            'description' => 'Comprehensive tour showcasing all LOFT³ features',
            'nodeCount' => $nodeCount,
            'includeLayerExamples' => true,
            'propertyType' => 'luxury_residential'
        ]));

        // Add more complex layer examples
        foreach ($template['nodes'] as &$node) {
            if (isset($node['layers']) && count($node['layers']) > 0) {
                // Add additional layers for complexity
                $node['layers'][] = [
                    'name' => 'ambient_lighting',
                    'description' => 'Ambient lighting effects',
                    'image' => 'ambient_lighting.png',
                    'position' => ['x' => 0.7, 'y' => 0.3],
                    'parallaxFactor' => 0.2,
                    'scale' => 0.8,
                    'rotation' => 0,
                    'opacity' => 0.6,
                    'visible' => true,
                    'depthOrder' => 0
                ];
            }
        }

        return $template;
    }

    private function validateBasicStructure($metadata) {
        if (!is_array($metadata)) {
            $this->validationErrors[] = 'Metadata must be a valid JSON object';
            return;
        }

        if (empty($metadata['tourName']) || !is_string($metadata['tourName'])) {
            $this->validationErrors[] = 'tourName is required and must be a string';
        } elseif (strlen($metadata['tourName']) > 255) {
            $this->validationErrors[] = 'tourName must be 255 characters or less';
        }

        if (!isset($metadata['nodes']) || !is_array($metadata['nodes'])) {
            $this->validationErrors[] = 'nodes array is required';
        } elseif (count($metadata['nodes']) === 0) {
            $this->validationErrors[] = 'At least one node is required';
        }

        if (isset($metadata['description']) && strlen($metadata['description']) > 1000) {
            $this->validationWarnings[] = 'Description is quite long (>1000 characters). Consider shortening for better readability.';
        }
    }

    private function validateNodes($nodes) {
        $nodeIds = [];
        $duplicateIds = [];

        foreach ($nodes as $index => $node) {
            $nodePrefix = "Node " . ($index + 1);

            // Required fields
            if (empty($node['id']) || !is_string($node['id'])) {
                $this->validationErrors[] = "$nodePrefix: id is required and must be a string";
            } else {
                // Check for duplicates
                if (in_array($node['id'], $nodeIds)) {
                    $duplicateIds[] = $node['id'];
                    $this->validationErrors[] = "$nodePrefix: Duplicate node ID '{$node['id']}'";
                } else {
                    $nodeIds[] = $node['id'];
                }

                // Validate ID format
                if (!preg_match('/^[a-zA-Z0-9_-]+$/', $node['id'])) {
                    $this->validationErrors[] = "$nodePrefix: ID '{$node['id']}' contains invalid characters. Use only letters, numbers, hyphens, and underscores.";
                }
            }

            if (empty($node['label']) || !is_string($node['label'])) {
                $this->validationErrors[] = "$nodePrefix: label is required and must be a string";
            }

            if (empty($node['image']) || !is_string($node['image'])) {
                $this->validationErrors[] = "$nodePrefix: image is required and must be a string";
            } elseif (!preg_match('/\.(jpg|jpeg|png)$/i', $node['image'])) {
                $this->validationErrors[] = "$nodePrefix: image '{$node['image']}' must be a JPG or PNG file";
            }

            // Optional field validation
            if (isset($node['rotationLimits'])) {
                $this->validateRotationLimits($node['rotationLimits'], $nodePrefix);
            }

            if (isset($node['initialYaw']) && ($node['initialYaw'] < -180 || $node['initialYaw'] > 180)) {
                $this->validationWarnings[] = "$nodePrefix: initialYaw should be between -180 and 180 degrees";
            }

            if (isset($node['initialPitch']) && ($node['initialPitch'] < -90 || $node['initialPitch'] > 90)) {
                $this->validationWarnings[] = "$nodePrefix: initialPitch should be between -90 and 90 degrees";
            }

            // Validate layers
            if (isset($node['layers']) && is_array($node['layers'])) {
                $this->validateLayers($node['layers'], $nodePrefix);
            }
        }
    }

    private function validateRotationLimits($limits, $nodePrefix) {
        if (!is_array($limits)) {
            $this->validationErrors[] = "$nodePrefix: rotationLimits must be an object";
            return;
        }

        if (isset($limits['h'])) {
            if (!is_numeric($limits['h']) || $limits['h'] < 0 || $limits['h'] > 180) {
                $this->validationErrors[] = "$nodePrefix: rotationLimits.h must be a number between 0 and 180";
            }
        }

        if (isset($limits['v'])) {
            if (!is_numeric($limits['v']) || $limits['v'] < 0 || $limits['v'] > 90) {
                $this->validationErrors[] = "$nodePrefix: rotationLimits.v must be a number between 0 and 90";
            }
        }
    }

    private function validateLayers($layers, $nodePrefix) {
        $layerNames = [];

        foreach ($layers as $index => $layer) {
            $layerPrefix = "$nodePrefix, Layer " . ($index + 1);

            if (empty($layer['name']) || !is_string($layer['name'])) {
                $this->validationErrors[] = "$layerPrefix: name is required and must be a string";
            } else {
                if (in_array($layer['name'], $layerNames)) {
                    $this->validationErrors[] = "$layerPrefix: Duplicate layer name '{$layer['name']}' in node";
                } else {
                    $layerNames[] = $layer['name'];
                }
            }

            if (empty($layer['image']) || !is_string($layer['image'])) {
                $this->validationErrors[] = "$layerPrefix: image is required and must be a string";
            } elseif (!preg_match('/\.png$/i', $layer['image'])) {
                $this->validationErrors[] = "$layerPrefix: image '{$layer['image']}' must be a PNG file";
            }

            if (!isset($layer['position']) || !is_array($layer['position'])) {
                $this->validationErrors[] = "$layerPrefix: position is required and must be an object with x and y coordinates";
            } else {
                if (!is_numeric($layer['position']['x']) || $layer['position']['x'] < 0 || $layer['position']['x'] > 1) {
                    $this->validationErrors[] = "$layerPrefix: position.x must be a number between 0 and 1";
                }
                if (!is_numeric($layer['position']['y']) || $layer['position']['y'] < 0 || $layer['position']['y'] > 1) {
                    $this->validationErrors[] = "$layerPrefix: position.y must be a number between 0 and 1";
                }
            }

            // Optional field validation
            if (isset($layer['parallaxFactor']) && (!is_numeric($layer['parallaxFactor']) || $layer['parallaxFactor'] < 0 || $layer['parallaxFactor'] > 1)) {
                $this->validationWarnings[] = "$layerPrefix: parallaxFactor should be a number between 0 and 1";
            }

            if (isset($layer['scale']) && (!is_numeric($layer['scale']) || $layer['scale'] < 0.1 || $layer['scale'] > 10)) {
                $this->validationWarnings[] = "$layerPrefix: scale should be a number between 0.1 and 10";
            }

            if (isset($layer['opacity']) && (!is_numeric($layer['opacity']) || $layer['opacity'] < 0 || $layer['opacity'] > 1)) {
                $this->validationWarnings[] = "$layerPrefix: opacity should be a number between 0 and 1";
            }
        }
    }

    private function validateNodeReferences($nodes) {
        $nodeIds = array_filter(array_column($nodes, 'id'));
        $invalidReferences = [];

        foreach ($nodes as $node) {
            if (!empty($node['nextNode']) && !in_array($node['nextNode'], $nodeIds)) {
                $invalidReferences[] = "Node '{$node['id']}' references non-existent nextNode '{$node['nextNode']}'";
            }
        }

        if (!empty($invalidReferences)) {
            $this->validationErrors = array_merge($this->validationErrors, $invalidReferences);
        }

        // Check for circular references
        $circularPath = $this->detectCircularReferences($nodes);
        if (!empty($circularPath)) {
            $this->validationWarnings[] = 'Circular reference detected: ' . implode(' → ', $circularPath);
        }
    }

    private function validateBusinessRules($metadata) {
        if (!isset($metadata['nodes'])) return;

        $nodes = $metadata['nodes'];
        $nodeIds = array_column($nodes, 'id');
        $referencedNodes = array_filter(array_column($nodes, 'nextNode'));
        $entryNodes = array_diff($nodeIds, $referencedNodes);

        if (empty($entryNodes)) {
            $this->validationWarnings[] = 'No entry node found. All nodes are referenced by nextNode. Consider having a clear starting point.';
        } elseif (count($entryNodes) > 1) {
            $this->validationWarnings[] = 'Multiple entry nodes found: ' . implode(', ', $entryNodes) . '. Consider having a single starting point for better user experience.';
        }

        // Check for end points
        $endNodes = count(array_filter($nodes, function($n) { return empty($n['nextNode']); }));
        if ($endNodes === 0) {
            $this->validationWarnings[] = 'No end node found. Tour may loop indefinitely.';
        } elseif ($endNodes > 1) {
            $this->validationWarnings[] = "Multiple end nodes found ($endNodes). This may confuse users about tour completion.";
        }

        // Check node count vs estimated duration
        if (isset($metadata['metadata']['totalNodes'])) {
            $actualNodes = count($nodes);
            $declaredNodes = $metadata['metadata']['totalNodes'];
            if ($actualNodes !== $declaredNodes) {
                $this->validationWarnings[] = "Metadata declares $declaredNodes nodes but $actualNodes nodes are defined.";
            }
        }
    }

    private function detectCircularReferences($nodes) {
        $nodeMap = [];
        foreach ($nodes as $node) {
            if (!empty($node['id']) && !empty($node['nextNode'])) {
                $nodeMap[$node['id']] = $node['nextNode'];
            }
        }

        foreach ($nodeMap as $startNode => $nextNode) {
            $visited = [];
            $current = $startNode;

            while ($current && !in_array($current, $visited)) {
                $visited[] = $current;
                $current = $nodeMap[$current] ?? null;

                if ($current === $startNode) {
                    $visited[] = $current;
                    return $visited;
                }
            }
        }

        return [];
    }

    private function generateValidationSummary() {
        $structureErrors = count(array_filter($this->validationErrors, function($e) {
            return !strpos($e, 'Node') && !strpos($e, 'Layer');
        }));
        
        $nodeErrors = count(array_filter($this->validationErrors, function($e) {
            return strpos($e, 'Node') !== false && strpos($e, 'Layer') === false;
        }));
        
        $layerErrors = count(array_filter($this->validationErrors, function($e) {
            return strpos($e, 'Layer') !== false;
        }));
        
        $referenceErrors = count(array_filter($this->validationErrors, function($e) {
            return strpos($e, 'references') !== false;
        }));

        $summary = "Validation Summary:\n";
        $summary .= "- Structure: " . ($structureErrors === 0 ? 'OK' : 'Issues found') . "\n";
        $summary .= "- Nodes: " . ($nodeErrors === 0 ? 'OK' : "$nodeErrors issues") . "\n";
        $summary .= "- Layers: " . ($layerErrors === 0 ? 'OK' : "$layerErrors issues") . "\n";
        $summary .= "- References: " . ($referenceErrors === 0 ? 'OK' : 'Issues found') . "\n";

        return $summary;
    }
}