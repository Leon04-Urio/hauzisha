<?php

class LoftTour
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Admin authentication check
     * Ensures only admins can create/edit tours
     */
    private function requireAdmin()
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            throw new Exception('Authentication required');
        }

        if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Admin access required');
        }

        return $_SESSION['user_id'];
    }

    /**
     * Create a new LOFT³ tour (Admin only)
     */
    public function createTour($data)
    {
        $adminId = $this->requireAdmin();

        // Validate required fields
        if (empty($data['property_id']) || empty($data['tour_name'])) {
            throw new Exception('Property ID and tour name are required');
        }

        // Verify property exists
        $stmt = $this->conn->prepare("SELECT id FROM properties WHERE id = ? AND is_deleted = 0");
        $stmt->execute([$data['property_id']]);
        if (!$stmt->fetch()) {
            throw new Exception('Property not found');
        }

        try {
            $this->conn->beginTransaction();

            // Insert tour
            $stmt = $this->conn->prepare("
                INSERT INTO loft_tours (property_id, tour_name, description, status, created_by) 
                VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $data['property_id'],
                $data['tour_name'],
                $data['description'] ?? '',
                $data['status'] ?? 'draft',
                $adminId
            ]);

            $tourId = $this->conn->lastInsertId();

            $this->conn->commit();

            return [
                'success' => true,
                'message' => 'Tour created successfully',
                'tour_id' => $tourId
            ];

        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception('Failed to create tour: ' . $e->getMessage());
        }
    }

    /**
     * Get tour by ID (Public read access)
     */
    public function getTourById($tourId)
    {
        $stmt = $this->conn->prepare("
            SELECT t.*, p.name as property_name, p.location as property_location,
                   u.firstname, u.lastname
            FROM loft_tours t
            JOIN properties p ON t.property_id = p.id
            JOIN users u ON t.created_by = u.id
            WHERE t.id = ? AND t.deleted_at IS NULL AND p.is_deleted = 0
        ");

        $stmt->execute([$tourId]);
        $tour = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tour) {
            return [
                'success' => false,
                'message' => 'Tour not found'
            ];
        }

        // Get tour nodes
        $nodes = $this->getTourNodes($tourId);

        // Get layers for each node
        foreach ($nodes as &$node) {
            $node['layers'] = $this->getNodeLayers($node['id']);
        }

        $tour['nodes'] = $nodes;

        return [
            'success' => true,
            'tour' => $tour
        ];
    }

    /**
     * Get all tours for a property (Public read access)
     */
    public function getPropertyTours($propertyId)
    {
        $stmt = $this->conn->prepare("
            SELECT t.*, COUNT(n.id) as node_count
            FROM loft_tours t
            LEFT JOIN loft_tour_nodes n ON t.id = n.tour_id
            WHERE t.property_id = ? AND t.deleted_at IS NULL AND t.status = 'active'
            GROUP BY t.id
            ORDER BY t.created_at DESC
        ");

        $stmt->execute([$propertyId]);
        $tours = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'success' => true,
            'tours' => $tours
        ];
    }

    /**
     * Update tour (Admin only)
     */
    public function updateTour($tourId, $data)
    {
        $adminId = $this->requireAdmin();

        // Verify tour exists and admin has access
        $stmt = $this->conn->prepare("SELECT id FROM loft_tours WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$tourId]);
        if (!$stmt->fetch()) {
            throw new Exception('Tour not found');
        }

        $updateFields = [];
        $params = [];

        if (isset($data['tour_name'])) {
            $updateFields[] = "tour_name = ?";
            $params[] = $data['tour_name'];
        }

        if (isset($data['description'])) {
            $updateFields[] = "description = ?";
            $params[] = $data['description'];
        }

        if (isset($data['status'])) {
            $updateFields[] = "status = ?";
            $params[] = $data['status'];
        }

        if (empty($updateFields)) {
            throw new Exception('No fields to update');
        }

        $params[] = $tourId;

        $stmt = $this->conn->prepare("
            UPDATE loft_tours 
            SET " . implode(', ', $updateFields) . ", updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");

        $stmt->execute($params);

        return [
            'success' => true,
            'message' => 'Tour updated successfully'
        ];
    }

    /**
     * Delete tour (Admin only - soft delete)
     */
    public function deleteTour($tourId)
    {
        $adminId = $this->requireAdmin();

        $stmt = $this->conn->prepare("
            UPDATE loft_tours 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND deleted_at IS NULL
        ");

        $stmt->execute([$tourId]);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Tour not found');
        }

        return [
            'success' => true,
            'message' => 'Tour deleted successfully'
        ];
    }

    /**
     * Upload and process panorama image (Admin only)
     */
    public function uploadPanorama($tourId, $nodeData, $imageFile)
    {
        $adminId = $this->requireAdmin();

        // Verify tour exists
        $stmt = $this->conn->prepare("SELECT id FROM loft_tours WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$tourId]);
        if (!$stmt->fetch()) {
            throw new Exception('Tour not found');
        }

        // Validate image
        $allowedTypes = ['image/jpeg', 'image/png'];
        $maxSize = 20 * 1024 * 1024; // 20MB

        if (!in_array($imageFile['type'], $allowedTypes)) {
            throw new Exception('Invalid image type. Only JPEG and PNG allowed');
        }

        if ($imageFile['size'] > $maxSize) {
            throw new Exception('Image too large. Maximum 20MB allowed');
        }

        // Check aspect ratio (should be 2:1 for equirectangular)
        $imageInfo = getimagesize($imageFile['tmp_name']);
        if ($imageInfo === false) {
            throw new Exception('Invalid image file');
        }

        $aspectRatio = $imageInfo[0] / $imageInfo[1];
        if (abs($aspectRatio - 2.0) > 0.1) {
            throw new Exception('Invalid aspect ratio. Panorama should be 2:1 (equirectangular)');
        }

        // Create upload directory
        $uploadDir = __DIR__ . "/../../uploads/loft-tours/{$tourId}/panoramas/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $extension = pathinfo($imageFile['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $nodeData['node_id']) . '.' . $extension;
        $filepath = $uploadDir . $filename;
        $relativeUrl = "/uploads/loft-tours/{$tourId}/panoramas/{$filename}";

        // Move uploaded file
        if (!move_uploaded_file($imageFile['tmp_name'], $filepath)) {
            throw new Exception('Failed to upload image');
        }

        // Compress image if needed
        $this->compressImage($filepath, $maxSize / 4); // Target 5MB max

        // Generate thumbnail
        $thumbnailUrl = $this->generateThumbnail($filepath, $tourId);

        // Save node to database
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO loft_tour_nodes 
                (tour_id, node_id, label, image_url, thumbnail_url, next_node_id, 
                 initial_yaw, initial_pitch, rotation_limit_h, rotation_limit_v, node_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                label = VALUES(label), image_url = VALUES(image_url), 
                thumbnail_url = VALUES(thumbnail_url), next_node_id = VALUES(next_node_id),
                initial_yaw = VALUES(initial_yaw), initial_pitch = VALUES(initial_pitch),
                rotation_limit_h = VALUES(rotation_limit_h), rotation_limit_v = VALUES(rotation_limit_v),
                node_order = VALUES(node_order)
            ");

            $stmt->execute([
                $tourId,
                $nodeData['node_id'],
                $nodeData['label'],
                $relativeUrl,
                $thumbnailUrl,
                $nodeData['next_node_id'] ?? null,
                $nodeData['initial_yaw'] ?? 0,
                $nodeData['initial_pitch'] ?? 0,
                $nodeData['rotation_limit_h'] ?? 30,
                $nodeData['rotation_limit_v'] ?? 10,
                $nodeData['node_order'] ?? 0
            ]);

            return [
                'success' => true,
                'message' => 'Panorama uploaded successfully',
                'image_url' => $relativeUrl,
                'thumbnail_url' => $thumbnailUrl
            ];

        } catch (Exception $e) {
            // Clean up uploaded file on database error
            if (file_exists($filepath)) {
                unlink($filepath);
            }
            throw new Exception('Failed to save panorama: ' . $e->getMessage());
        }
    }

    /**
     * Upload layer image (Admin only)
     */
    public function uploadLayer($nodeId, $layerData, $imageFile)
    {
        $adminId = $this->requireAdmin();

        // Verify node exists
        $stmt = $this->conn->prepare("
            SELECT n.tour_id FROM loft_tour_nodes n 
            JOIN loft_tours t ON n.tour_id = t.id 
            WHERE n.id = ? AND t.deleted_at IS NULL
        ");
        $stmt->execute([$nodeId]);
        $node = $stmt->fetch();
        if (!$node) {
            throw new Exception('Node not found');
        }

        $tourId = $node['tour_id'];

        // Validate image
        if ($imageFile['type'] !== 'image/png') {
            throw new Exception('Layer images must be PNG with transparency');
        }

        if ($imageFile['size'] > 5 * 1024 * 1024) { // 5MB
            throw new Exception('Layer image too large. Maximum 5MB allowed');
        }

        // Create upload directory
        $uploadDir = __DIR__ . "/../../uploads/loft-tours/{$tourId}/layers/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $filename = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $layerData['layer_name']) . '.png';
        $filepath = $uploadDir . $filename;
        $relativeUrl = "/uploads/loft-tours/{$tourId}/layers/{$filename}";

        // Move uploaded file
        if (!move_uploaded_file($imageFile['tmp_name'], $filepath)) {
            throw new Exception('Failed to upload layer image');
        }

        // Save layer to database
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO loft_tour_layers 
                (node_id, layer_name, image_url, position_x, position_y, 
                 scale_factor, parallax_factor, rotation, opacity, depth_order, visible)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $nodeId,
                $layerData['layer_name'],
                $relativeUrl,
                $layerData['position_x'] ?? 0.5,
                $layerData['position_y'] ?? 0.5,
                $layerData['scale_factor'] ?? 1.0,
                $layerData['parallax_factor'] ?? 0.5,
                $layerData['rotation'] ?? 0,
                $layerData['opacity'] ?? 1.0,
                $layerData['depth_order'] ?? 0,
                isset($layerData['visible']) ? (bool) $layerData['visible'] : true
            ]);

            return [
                'success' => true,
                'message' => 'Layer uploaded successfully',
                'layer_id' => $this->conn->lastInsertId(),
                'image_url' => $relativeUrl
            ];

        } catch (Exception $e) {
            // Clean up uploaded file on database error
            if (file_exists($filepath)) {
                unlink($filepath);
            }
            throw new Exception('Failed to save layer: ' . $e->getMessage());
        }
    }

    /**
     * Process metadata JSON/CSV for automatic tour generation (Admin only)
     */
    public function processMetadata($tourId, $metadataFile)
    {
        $adminId = $this->requireAdmin();

        $content = file_get_contents($metadataFile['tmp_name']);
        $extension = pathinfo($metadataFile['name'], PATHINFO_EXTENSION);

        if ($extension === 'json') {
            $data = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON format');
            }
        } elseif ($extension === 'csv') {
            $data = $this->parseCSVMetadata($content);
        } else {
            throw new Exception('Unsupported metadata format. Use JSON or CSV');
        }

        return $this->processMetadataArray($tourId, $data);
    }

    /**
     * Validate tour nodes for unique IDs, valid references, and image existence (Admin only)
     */
    public function validateTourNodes($tourId)
    {
        $adminId = $this->requireAdmin();

        // Verify tour exists
        $stmt = $this->conn->prepare("SELECT id FROM loft_tours WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$tourId]);
        if (!$stmt->fetch()) {
            throw new Exception('Tour not found');
        }

        // Get all nodes for this tour
        $nodes = $this->getTourNodes($tourId);

        if (empty($nodes)) {
            return [
                'success' => true,
                'message' => 'No nodes to validate',
                'validation_results' => [
                    'unique_ids' => true,
                    'valid_references' => true,
                    'images_exist' => true,
                    'errors' => [],
                    'warnings' => []
                ]
            ];
        }

        $validationResults = [
            'unique_ids' => true,
            'valid_references' => true,
            'images_exist' => true,
            'errors' => [],
            'warnings' => []
        ];

        // 1. Check for unique node IDs
        $nodeIds = [];
        $duplicateIds = [];

        foreach ($nodes as $node) {
            $nodeId = $node['node_id'];
            if (in_array($nodeId, $nodeIds)) {
                $duplicateIds[] = $nodeId;
                $validationResults['unique_ids'] = false;
            } else {
                $nodeIds[] = $nodeId;
            }
        }

        if (!empty($duplicateIds)) {
            $validationResults['errors'][] = 'Duplicate node IDs found: ' . implode(', ', array_unique($duplicateIds));
        }

        // 2. Check for valid next_node_id references
        $invalidReferences = [];

        foreach ($nodes as $node) {
            $nextNodeId = $node['next_node_id'];
            if (!empty($nextNodeId) && !in_array($nextNodeId, $nodeIds)) {
                $invalidReferences[] = "Node '{$node['node_id']}' references non-existent next_node_id '{$nextNodeId}'";
                $validationResults['valid_references'] = false;
            }
        }

        if (!empty($invalidReferences)) {
            $validationResults['errors'] = array_merge($validationResults['errors'], $invalidReferences);
        }

        // 3. Check for image existence
        $missingImages = [];
        $missingThumbnails = [];

        foreach ($nodes as $node) {
            // Check main image
            if (!empty($node['image_url'])) {
                $imagePath = $this->getAbsolutePath($node['image_url']);
                if (!file_exists($imagePath)) {
                    $missingImages[] = "Node '{$node['node_id']}': Image not found at {$node['image_url']}";
                    $validationResults['images_exist'] = false;
                }
            } else {
                $missingImages[] = "Node '{$node['node_id']}': No image URL specified";
                $validationResults['images_exist'] = false;
            }

            // Check thumbnail (warning only, not critical)
            if (!empty($node['thumbnail_url'])) {
                $thumbnailPath = $this->getAbsolutePath($node['thumbnail_url']);
                if (!file_exists($thumbnailPath)) {
                    $missingThumbnails[] = "Node '{$node['node_id']}': Thumbnail not found at {$node['thumbnail_url']}";
                }
            }
        }

        if (!empty($missingImages)) {
            $validationResults['errors'] = array_merge($validationResults['errors'], $missingImages);
        }

        if (!empty($missingThumbnails)) {
            $validationResults['warnings'] = array_merge($validationResults['warnings'], $missingThumbnails);
        }

        // 4. Additional validations
        $this->validateNodeSequence($nodes, $validationResults);
        $this->validateNodeProperties($nodes, $validationResults);

        // Determine overall success
        $overallSuccess = $validationResults['unique_ids'] &&
            $validationResults['valid_references'] &&
            $validationResults['images_exist'];

        return [
            'success' => $overallSuccess,
            'message' => $overallSuccess ? 'All validations passed' : 'Validation errors found',
            'validation_results' => $validationResults,
            'node_count' => count($nodes),
            'validated_at' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Update layer image URL after upload
     * @param int $layerId Database ID of the layer
     * @param string $imageUrl New image URL
     * @return array Success response
     */
    public function updateLayerImageUrl($layerId, $imageUrl)
    {
        $adminId = $this->requireAdmin();

        $stmt = $this->conn->prepare("
            UPDATE loft_tour_layers 
            SET image_url = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");

        $stmt->execute([$imageUrl, $layerId]);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Layer not found');
        }

        return [
            'success' => true,
            'message' => 'Layer image URL updated successfully'
        ];
    }

    /**
     * Get layers by node ID for metadata processing
     * @param int $nodeId Database ID of the node
     * @return array Array of layer data
     */
    public function getLayersByNodeId($nodeId)
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM loft_tour_layers 
            WHERE node_id = ? 
            ORDER BY depth_order ASC, id ASC
        ");
        $stmt->execute([$nodeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update layer properties from metadata
     * @param int $layerId Database ID of the layer
     * @param array $layerData Updated layer properties
     * @return array Success response
     */
    public function updateLayerProperties($layerId, $layerData)
    {
        $adminId = $this->requireAdmin();

        $updateFields = [];
        $params = [];

        // Build dynamic update query based on provided data
        if (isset($layerData['layer_name'])) {
            $updateFields[] = "layer_name = ?";
            $params[] = $layerData['layer_name'];
        }

        if (isset($layerData['position_x'])) {
            $updateFields[] = "position_x = ?";
            $params[] = max(0, min(1, (float) $layerData['position_x']));
        }

        if (isset($layerData['position_y'])) {
            $updateFields[] = "position_y = ?";
            $params[] = max(0, min(1, (float) $layerData['position_y']));
        }

        if (isset($layerData['scale_factor'])) {
            $updateFields[] = "scale_factor = ?";
            $params[] = max(0.1, min(10.0, (float) $layerData['scale_factor']));
        }

        if (isset($layerData['parallax_factor'])) {
            $updateFields[] = "parallax_factor = ?";
            $params[] = max(0, min(1, (float) $layerData['parallax_factor']));
        }

        if (isset($layerData['rotation'])) {
            $updateFields[] = "rotation = ?";
            $params[] = (float) $layerData['rotation'];
        }

        if (isset($layerData['opacity'])) {
            $updateFields[] = "opacity = ?";
            $params[] = max(0, min(1, (float) $layerData['opacity']));
        }

        if (isset($layerData['depth_order'])) {
            $updateFields[] = "depth_order = ?";
            $params[] = (int) $layerData['depth_order'];
        }

        if (isset($layerData['visible'])) {
            $updateFields[] = "visible = ?";
            $params[] = (bool) $layerData['visible'] ? 1 : 0;
        }

        if (empty($updateFields)) {
            throw new Exception('No fields to update');
        }

        $params[] = $layerId;

        $stmt = $this->conn->prepare("
            UPDATE loft_tour_layers 
            SET " . implode(', ', $updateFields) . ", updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");

        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Layer not found');
        }

        return [
            'success' => true,
            'message' => 'Layer properties updated successfully'
        ];
    }

    /**
     * Track tour analytics
     */
    public function trackAnalytics($tourId, $eventData)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO loft_tour_analytics 
            (tour_id, node_id, user_id, session_id, event_type, dwell_time, user_agent, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $tourId,
            $eventData['node_id'] ?? null,
            $_SESSION['user_id'] ?? null,
            $eventData['session_id'] ?? session_id(),
            $eventData['event_type'],
            $eventData['dwell_time'] ?? 0,
            $_SERVER['HTTP_USER_AGENT'] ?? '',
            $_SERVER['REMOTE_ADDR'] ?? ''
        ]);

        return ['success' => true];
    }

    /**
     * Generate shareable URL for a tour (Public access)
     */
    public function generateShareableUrl($tourId, $options = [])
    {
        // Verify tour exists and is active
        $stmt = $this->conn->prepare("
            SELECT t.*, p.name as property_name, p.location as property_location
            FROM loft_tours t
            JOIN properties p ON t.property_id = p.id
            WHERE t.id = ? AND t.deleted_at IS NULL AND t.status = 'active' AND p.is_deleted = 0
        ");

        $stmt->execute([$tourId]);
        $tour = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tour) {
            throw new Exception('Tour not found or not active');
        }

        // Build base URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $baseUrl = $protocol . '://' . $host;

        // Generate shareable URL with parameters
        $shareUrl = $baseUrl . '/loft-tour/viewer.html?tour=' . $tourId;

        // Add optional parameters
        if (isset($options['startNode']) && !empty($options['startNode'])) {
            $shareUrl .= '&start=' . urlencode($options['startNode']);
        }

        if (isset($options['autoplay']) && $options['autoplay']) {
            $shareUrl .= '&autoplay=1';
        }

        if (isset($options['hideUI']) && $options['hideUI']) {
            $shareUrl .= '&ui=0';
        }

        if (isset($options['fullscreen']) && $options['fullscreen']) {
            $shareUrl .= '&fullscreen=1';
        }

        // Generate short URL (optional)
        $shortUrl = $this->generateShortUrl($shareUrl);

        return [
            'success' => true,
            'tour_id' => $tourId,
            'tour_name' => $tour['tour_name'],
            'property_name' => $tour['property_name'],
            'share_url' => $shareUrl,
            'short_url' => $shortUrl,
            'qr_code_url' => $this->generateQRCodeUrl($shareUrl),
            'social_preview' => $this->generateSocialPreview($tour),
            'generated_at' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Generate embed code for websites (Public access)
     */
    public function generateEmbedCode($tourId, $options = [])
    {
        // Verify tour exists and is active
        $stmt = $this->conn->prepare("
            SELECT t.*, p.name as property_name
            FROM loft_tours t
            JOIN properties p ON t.property_id = p.id
            WHERE t.id = ? AND t.deleted_at IS NULL AND t.status = 'active' AND p.is_deleted = 0
        ");

        $stmt->execute([$tourId]);
        $tour = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tour) {
            throw new Exception('Tour not found or not active');
        }

        // Build base URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $baseUrl = $protocol . '://' . $host;

        // Default embed options
        $width = $options['width'] ?? '100%';
        $height = $options['height'] ?? '600px';
        $allowFullscreen = $options['allowFullscreen'] ?? true;
        $showUI = $options['showUI'] ?? true;
        $autoplay = $options['autoplay'] ?? false;
        $startNode = $options['startNode'] ?? '';

        // Build embed URL
        $embedUrl = $baseUrl . '/loft-tour/embed.html?tour=' . $tourId;

        if (!$showUI) {
            $embedUrl .= '&ui=0';
        }

        if ($autoplay) {
            $embedUrl .= '&autoplay=1';
        }

        if (!empty($startNode)) {
            $embedUrl .= '&start=' . urlencode($startNode);
        }

        // Generate iframe embed code
        $iframeCode = '<iframe src="' . htmlspecialchars($embedUrl) . '" ' .
            'width="' . htmlspecialchars($width) . '" ' .
            'height="' . htmlspecialchars($height) . '" ' .
            'frameborder="0" ' .
            'scrolling="no" ' .
            ($allowFullscreen ? 'allowfullscreen ' : '') .
            'title="' . htmlspecialchars($tour['tour_name']) . ' - Virtual Tour">' .
            '</iframe>';

        // Generate responsive embed code
        $responsiveCode = '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">' .
            '<iframe src="' . htmlspecialchars($embedUrl) . '" ' .
            'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' .
            'frameborder="0" scrolling="no" ' .
            ($allowFullscreen ? 'allowfullscreen ' : '') .
            'title="' . htmlspecialchars($tour['tour_name']) . ' - Virtual Tour">' .
            '</iframe></div>';

        // Generate JavaScript embed code
        $jsCode = '<script src="' . $baseUrl . '/loft-tour/js/loft-tour-embed.js"></script>' . "\n" .
            '<div id="loft-tour-' . $tourId . '"></div>' . "\n" .
            '<script>' . "\n" .
            'LoftTourEmbed.create({' . "\n" .
            '  container: "#loft-tour-' . $tourId . '",' . "\n" .
            '  tourId: ' . $tourId . ',' . "\n" .
            '  width: "' . $width . '",' . "\n" .
            '  height: "' . $height . '",' . "\n" .
            '  showUI: ' . ($showUI ? 'true' : 'false') . ',' . "\n" .
            '  autoplay: ' . ($autoplay ? 'true' : 'false') . ',' . "\n" .
            '  allowFullscreen: ' . ($allowFullscreen ? 'true' : 'false') . "\n" .
            '});' . "\n" .
            '</script>';

        return [
            'success' => true,
            'tour_id' => $tourId,
            'tour_name' => $tour['tour_name'],
            'embed_url' => $embedUrl,
            'iframe_code' => $iframeCode,
            'responsive_code' => $responsiveCode,
            'javascript_code' => $jsCode,
            'preview_image' => $this->getTourPreviewImage($tourId),
            'generated_at' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Generate offline deployment package (Admin only)
     */
    public function generateOfflinePackage($tourId)
    {
        $adminId = $this->requireAdmin();

        // Get tour data
        $tourResponse = $this->getTourById($tourId);
        if (!$tourResponse['success']) {
            throw new Exception('Tour not found');
        }

        $tour = $tourResponse['tour'];

        // Create package directory
        $packageDir = __DIR__ . "/../../uploads/loft-tours/{$tourId}/offline-package/";
        if (!is_dir($packageDir)) {
            mkdir($packageDir, 0755, true);
        }

        // Copy tour files
        $this->copyTourAssets($tourId, $packageDir);

        // Generate standalone HTML
        $htmlContent = $this->generateStandaloneHTML($tour);
        file_put_contents($packageDir . 'index.html', $htmlContent);

        // Generate package info
        $packageInfo = [
            'tour_id' => $tourId,
            'tour_name' => $tour['tour_name'],
            'generated_at' => date('Y-m-d H:i:s'),
            'files' => $this->getPackageFileList($packageDir)
        ];

        file_put_contents($packageDir . 'package.json', json_encode($packageInfo, JSON_PRETTY_PRINT));

        // Create ZIP archive
        $zipPath = $this->createZipArchive($packageDir, $tourId);

        return [
            'success' => true,
            'tour_id' => $tourId,
            'package_path' => $zipPath,
            'download_url' => '/uploads/loft-tours/' . $tourId . '/offline-package.zip',
            'file_count' => count($packageInfo['files']),
            'generated_at' => date('Y-m-d H:i:s')
        ];
    }

    // Private helper methods

    private function getTourNodes($tourId)
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM loft_tour_nodes 
            WHERE tour_id = ? 
            ORDER BY node_order ASC, id ASC
        ");
        $stmt->execute([$tourId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getNodeLayers($nodeId)
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM loft_tour_layers 
            WHERE node_id = ? AND visible = 1 
            ORDER BY depth_order ASC, id ASC
        ");
        $stmt->execute([$nodeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function compressImage($filepath, $maxSize)
    {
        $imageInfo = getimagesize($filepath);
        if ($imageInfo === false)
            return;

        $currentSize = filesize($filepath);
        if ($currentSize <= $maxSize)
            return;

        // Calculate compression quality
        $quality = max(60, min(95, intval(($maxSize / $currentSize) * 85)));

        switch ($imageInfo[2]) {
            case IMAGETYPE_JPEG:
                $image = imagecreatefromjpeg($filepath);
                imagejpeg($image, $filepath, $quality);
                imagedestroy($image);
                break;
            case IMAGETYPE_PNG:
                // PNG compression is different - reduce colors if needed
                $image = imagecreatefrompng($filepath);
                imagetruecolortopalette($image, false, 256);
                imagepng($image, $filepath, 6);
                imagedestroy($image);
                break;
        }
    }

    private function generateThumbnail($filepath, $tourId)
    {
        $imageInfo = getimagesize($filepath);
        if ($imageInfo === false)
            return null;

        $thumbnailDir = __DIR__ . "/../../uploads/loft-tours/{$tourId}/thumbnails/";
        if (!is_dir($thumbnailDir)) {
            mkdir($thumbnailDir, 0755, true);
        }

        $filename = basename($filepath);
        $thumbnailPath = $thumbnailDir . 'thumb_' . $filename;
        $relativeUrl = "/uploads/loft-tours/{$tourId}/thumbnails/thumb_{$filename}";

        // Create thumbnail (400x200 for 2:1 aspect ratio)
        $thumbWidth = 400;
        $thumbHeight = 200;

        $sourceImage = null;
        switch ($imageInfo[2]) {
            case IMAGETYPE_JPEG:
                $sourceImage = imagecreatefromjpeg($filepath);
                break;
            case IMAGETYPE_PNG:
                $sourceImage = imagecreatefrompng($filepath);
                break;
            default:
                return null;
        }

        if (!$sourceImage)
            return null;

        $thumbnail = imagecreatetruecolor($thumbWidth, $thumbHeight);
        imagecopyresampled(
            $thumbnail,
            $sourceImage,
            0,
            0,
            0,
            0,
            $thumbWidth,
            $thumbHeight,
            $imageInfo[0],
            $imageInfo[1]
        );

        imagejpeg($thumbnail, $thumbnailPath, 80);
        imagedestroy($sourceImage);
        imagedestroy($thumbnail);

        return $relativeUrl;
    }

    private function parseCSVMetadata($content)
    {
        $lines = str_getcsv($content, "\n");
        $header = str_getcsv(array_shift($lines));

        $nodes = [];
        foreach ($lines as $line) {
            $row = str_getcsv($line);
            if (count($row) === count($header)) {
                $nodes[] = array_combine($header, $row);
            }
        }

        return ['nodes' => $nodes];
    }

    private function processMetadataArray($tourId, $data)
    {
        if (!isset($data['nodes']) || !is_array($data['nodes'])) {
            throw new Exception('Metadata must contain nodes array');
        }

        $processed = 0;
        $layersProcessed = 0;
        $errors = [];

        try {
            $this->conn->beginTransaction();

            foreach ($data['nodes'] as $nodeData) {
                try {
                    // Handle different metadata formats (JSON vs CSV)
                    $nodeId = $nodeData['id'] ?? $nodeData['node_id'] ?? null;

                    if (empty($nodeId) || empty($nodeData['label'])) {
                        throw new Exception('Node ID and label are required');
                    }
                    $nextNodeId = $nodeData['next_node'] ?? $nodeData['nextNode'] ?? null;
                    $rotationH = $nodeData['rotation_h'] ?? ($nodeData['rotationLimits']['h'] ?? 30);
                    $rotationV = $nodeData['rotation_v'] ?? ($nodeData['rotationLimits']['v'] ?? 10);
                    $initialYaw = $nodeData['initial_yaw'] ?? $nodeData['initialYaw'] ?? 0;
                    $initialPitch = $nodeData['initial_pitch'] ?? $nodeData['initialPitch'] ?? 0;
                    $nodeOrder = $nodeData['order'] ?? 0;

                    // Insert/update node
                    $stmt = $this->conn->prepare("
                        INSERT INTO loft_tour_nodes 
                        (tour_id, node_id, label, image_url, next_node_id, 
                         initial_yaw, initial_pitch, rotation_limit_h, rotation_limit_v, node_order)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        label = VALUES(label), next_node_id = VALUES(next_node_id),
                        initial_yaw = VALUES(initial_yaw), initial_pitch = VALUES(initial_pitch),
                        rotation_limit_h = VALUES(rotation_limit_h), rotation_limit_v = VALUES(rotation_limit_v),
                        node_order = VALUES(node_order)
                    ");

                    $stmt->execute([
                        $tourId,
                        $nodeId,
                        $nodeData['label'],
                        $nodeData['image'] ?? '', // Will be updated when image is uploaded
                        $nextNodeId,
                        $initialYaw,
                        $initialPitch,
                        $rotationH,
                        $rotationV,
                        $nodeOrder
                    ]);

                    // Get the database node ID for layer processing
                    $dbNodeId = $this->conn->lastInsertId();
                    if ($dbNodeId == 0) {
                        // Node was updated, get existing ID
                        $stmt = $this->conn->prepare("SELECT id FROM loft_tour_nodes WHERE tour_id = ? AND node_id = ?");
                        $stmt->execute([$tourId, $nodeId]);
                        $result = $stmt->fetch();
                        $dbNodeId = $result['id'];
                    }

                    // Process layers if present
                    if (isset($nodeData['layers']) && is_array($nodeData['layers'])) {
                        $layersProcessed += $this->processNodeLayers($dbNodeId, $nodeData['layers'], $nodeId);
                    }

                    $processed++;

                } catch (Exception $e) {
                    $errors[] = "Node {$nodeData['node_id']}: " . $e->getMessage();
                }
            }

            $this->conn->commit();

        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception('Failed to process metadata: ' . $e->getMessage());
        }

        return [
            'success' => true,
            'message' => "Processed {$processed} nodes and {$layersProcessed} layers",
            'processed_count' => $processed,
            'layers_processed' => $layersProcessed,
            'errors' => $errors
        ];
    }

    /**
     * Process layers for a specific node from metadata
     * @param int $nodeId Database ID of the node
     * @param array $layersData Array of layer definitions
     * @param string $nodeIdString String ID of the node for error reporting
     * @return int Number of layers processed
     */
    private function processNodeLayers($nodeId, $layersData, $nodeIdString)
    {
        $processed = 0;

        // Clear existing layers for this node
        $stmt = $this->conn->prepare("DELETE FROM loft_tour_layers WHERE node_id = ?");
        $stmt->execute([$nodeId]);

        foreach ($layersData as $layerIndex => $layerData) {
            try {
                // Validate required layer fields
                if (empty($layerData['name'])) {
                    throw new Exception("Layer {$layerIndex}: Missing layer name");
                }

                if (empty($layerData['image'])) {
                    throw new Exception("Layer {$layerIndex}: Missing layer image");
                }

                // Extract layer properties with defaults
                $layerName = $layerData['name'];
                $imageUrl = $layerData['image']; // Will be updated when actual image is uploaded

                // Position (default to center)
                $positionX = isset($layerData['position']['x']) ? (float) $layerData['position']['x'] : 0.5;
                $positionY = isset($layerData['position']['y']) ? (float) $layerData['position']['y'] : 0.5;

                // Validate position range (0-1)
                $positionX = max(0, min(1, $positionX));
                $positionY = max(0, min(1, $positionY));

                // Scale factor (default 1.0)
                $scaleFactor = isset($layerData['scale']) ? (float) $layerData['scale'] : 1.0;
                $scaleFactor = max(0.1, min(10.0, $scaleFactor)); // Reasonable limits

                // Parallax factor (default 0.5)
                $parallaxFactor = isset($layerData['parallaxFactor']) ? (float) $layerData['parallaxFactor'] : 0.5;
                $parallaxFactor = max(0, min(1, $parallaxFactor)); // 0-1 range

                // Rotation (default 0)
                $rotation = isset($layerData['rotation']) ? (float) $layerData['rotation'] : 0.0;

                // Opacity (default 1.0)
                $opacity = isset($layerData['opacity']) ? (float) $layerData['opacity'] : 1.0;
                $opacity = max(0, min(1, $opacity)); // 0-1 range

                // Depth order (default 0)
                $depthOrder = isset($layerData['depthOrder']) ? (int) $layerData['depthOrder'] : 0;

                // Visibility (default true)
                $visible = isset($layerData['visible']) ? (bool) $layerData['visible'] : true;

                // Insert layer into database
                $stmt = $this->conn->prepare("
                    INSERT INTO loft_tour_layers 
                    (node_id, layer_name, image_url, position_x, position_y, 
                     scale_factor, parallax_factor, rotation, opacity, depth_order, visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");

                $stmt->execute([
                    $nodeId,
                    $layerName,
                    $imageUrl,
                    $positionX,
                    $positionY,
                    $scaleFactor,
                    $parallaxFactor,
                    $rotation,
                    $opacity,
                    $depthOrder,
                    $visible ? 1 : 0
                ]);

                $processed++;

            } catch (Exception $e) {
                throw new Exception("Node {$nodeIdString}, Layer {$layerIndex}: " . $e->getMessage());
            }
        }

        return $processed;
    }

    /**
     * Get absolute file path from relative URL
     */
    private function getAbsolutePath($relativeUrl)
    {
        // Remove leading slash if present
        $relativeUrl = ltrim($relativeUrl, '/');

        // Convert to absolute path
        return __DIR__ . '/../../' . $relativeUrl;
    }

    /**
     * Validate node sequence and connectivity
     */
    private function validateNodeSequence($nodes, &$validationResults)
    {
        if (empty($nodes))
            return;

        $nodeIds = array_column($nodes, 'node_id');
        $nextNodeIds = array_filter(array_column($nodes, 'next_node_id'));

        // Check for orphaned nodes (nodes that are not referenced by any next_node_id)
        $referencedNodes = array_unique($nextNodeIds);
        $orphanedNodes = [];
        $entryNodes = [];

        foreach ($nodeIds as $nodeId) {
            if (!in_array($nodeId, $referencedNodes)) {
                $entryNodes[] = $nodeId;
            }
        }

        // Check for circular references
        $circularPaths = $this->detectCircularReferences($nodes);
        if (!empty($circularPaths)) {
            $validationResults['warnings'][] = 'Circular reference detected in path: ' . implode(' -> ', $circularPaths);
        }

        // Check for unreachable nodes
        $reachableNodes = $this->findReachableNodes($nodes);
        $unreachableNodes = array_diff($nodeIds, $reachableNodes);

        if (!empty($unreachableNodes)) {
            $validationResults['warnings'][] = 'Unreachable nodes found: ' . implode(', ', $unreachableNodes);
        }

        // Validate entry points
        if (count($entryNodes) === 0) {
            $validationResults['warnings'][] = 'No entry node found (all nodes are referenced by next_node_id)';
        } elseif (count($entryNodes) > 1) {
            $validationResults['warnings'][] = 'Multiple entry nodes found: ' . implode(', ', $entryNodes) . '. Consider having a single starting point.';
        }
    }

    /**
     * Validate node properties for consistency
     */
    private function validateNodeProperties($nodes, &$validationResults)
    {
        foreach ($nodes as $node) {
            $nodeId = $node['node_id'];

            // Validate rotation limits
            $rotationH = (int) $node['rotation_limit_h'];
            $rotationV = (int) $node['rotation_limit_v'];

            if ($rotationH < 0 || $rotationH > 180) {
                $validationResults['warnings'][] = "Node '{$nodeId}': Horizontal rotation limit ({$rotationH}°) should be between 0-180°";
            }

            if ($rotationV < 0 || $rotationV > 90) {
                $validationResults['warnings'][] = "Node '{$nodeId}': Vertical rotation limit ({$rotationV}°) should be between 0-90°";
            }

            // Validate yaw and pitch values
            $yaw = (float) $node['initial_yaw'];
            $pitch = (float) $node['initial_pitch'];

            if ($yaw < -180 || $yaw > 180) {
                $validationResults['warnings'][] = "Node '{$nodeId}': Initial yaw ({$yaw}°) should be between -180° and 180°";
            }

            if ($pitch < -90 || $pitch > 90) {
                $validationResults['warnings'][] = "Node '{$nodeId}': Initial pitch ({$pitch}°) should be between -90° and 90°";
            }

            // Validate node order
            $order = (int) $node['node_order'];
            if ($order < 0) {
                $validationResults['warnings'][] = "Node '{$nodeId}': Node order ({$order}) should be non-negative";
            }
        }
    }

    /**
     * Detect circular references in node sequence
     */
    private function detectCircularReferences($nodes)
    {
        $nodeMap = [];
        foreach ($nodes as $node) {
            $nodeMap[$node['node_id']] = $node['next_node_id'];
        }

        foreach ($nodeMap as $startNode => $nextNode) {
            $visited = [];
            $current = $startNode;

            while ($current && !in_array($current, $visited)) {
                $visited[] = $current;
                $current = $nodeMap[$current] ?? null;

                if ($current === $startNode) {
                    return array_merge($visited, [$current]);
                }
            }
        }

        return [];
    }

    /**
     * Find all nodes reachable from entry points
     */
    private function findReachableNodes($nodes)
    {
        $nodeMap = [];
        $allNodeIds = [];
        $referencedNodes = [];

        foreach ($nodes as $node) {
            $nodeId = $node['node_id'];
            $nextNodeId = $node['next_node_id'];

            $allNodeIds[] = $nodeId;
            $nodeMap[$nodeId] = $nextNodeId;

            if ($nextNodeId) {
                $referencedNodes[] = $nextNodeId;
            }
        }

        // Find entry nodes (not referenced by any next_node_id)
        $entryNodes = array_diff($allNodeIds, $referencedNodes);

        $reachableNodes = [];

        foreach ($entryNodes as $entryNode) {
            $visited = [];
            $current = $entryNode;

            while ($current && !in_array($current, $visited)) {
                $visited[] = $current;
                $reachableNodes[] = $current;
                $current = $nodeMap[$current] ?? null;
            }
        }

        return array_unique($reachableNodes);
    }

    /**
     * Generate short URL for sharing
     */
    private function generateShortUrl($longUrl)
    {
        // Simple short URL generation - in production, use a proper service
        $hash = substr(md5($longUrl), 0, 8);
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

        return $protocol . '://' . $host . '/s/' . $hash;
    }

    /**
     * Generate QR code URL with multiple options
     */
    private function generateQRCodeUrl($url)
    {
        $encodedUrl = urlencode($url);

        // Primary option: Use QR Server API (reliable and fast)
        $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&ecc=M&data={$encodedUrl}";

        // Return object with multiple QR code options
        return [
            'primary' => $qrUrl,
            'backup' => "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl={$encodedUrl}",
            'download_url' => $qrUrl . "&download=1",
            'sizes' => [
                'small' => "https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=png&ecc=M&data={$encodedUrl}",
                'medium' => $qrUrl,
                'large' => "https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&ecc=M&data={$encodedUrl}",
                'print' => "https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&ecc=H&data={$encodedUrl}"
            ]
        ];
    }

    /**
     * Generate enhanced social media preview data
     */
    private function generateSocialPreview($tour)
    {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $baseUrl = $protocol . '://' . $host;

        // Get first node image as preview
        $previewImage = $this->getTourPreviewImage($tour['id']);

        // Enhanced description with property details
        $description = $tour['description'] ?: 'Experience every room and detail from the comfort of your home.';
        if (isset($tour['property_location']) && $tour['property_location']) {
            $description = "Located in {$tour['property_location']}. " . $description;
        }

        $tourUrl = $baseUrl . '/loft-tour/viewer.html?tour=' . $tour['id'];

        return [
            // Basic Open Graph
            'title' => $tour['tour_name'] . ' - Virtual Tour',
            'description' => 'Explore this amazing property with our immersive 360° virtual tour. ' . $description,
            'image' => $previewImage,
            'url' => $tourUrl,
            'site_name' => 'LOFT³ Virtual Tours',
            'type' => 'website',

            // Enhanced Open Graph
            'og:locale' => 'en_US',
            'og:image:width' => '1200',
            'og:image:height' => '630',
            'og:image:alt' => $tour['tour_name'] . ' - Virtual Tour Preview',

            // Twitter Card specific
            'twitter:card' => 'summary_large_image',
            'twitter:site' => '@loft3tours',
            'twitter:creator' => '@loft3tours',
            'twitter:title' => $tour['tour_name'] . ' - Virtual Tour',
            'twitter:description' => substr($description, 0, 200) . (strlen($description) > 200 ? '...' : ''),
            'twitter:image' => $previewImage,
            'twitter:image:alt' => $tour['tour_name'] . ' - Virtual Tour Preview',

            // LinkedIn specific
            'linkedin:title' => $tour['tour_name'] . ' - Virtual Tour',
            'linkedin:description' => $description,
            'linkedin:image' => $previewImage,

            // WhatsApp/Telegram specific
            'whatsapp:title' => $tour['tour_name'],
            'whatsapp:description' => 'Check out this amazing virtual tour!',
            'whatsapp:image' => $previewImage,

            // Schema.org structured data
            'schema' => [
                '@context' => 'https://schema.org',
                '@type' => 'VirtualLocation',
                'name' => $tour['tour_name'],
                'description' => $description,
                'image' => $previewImage,
                'url' => $tourUrl,
                'provider' => [
                    '@type' => 'Organization',
                    'name' => 'LOFT³ Virtual Tours',
                    'url' => $baseUrl
                ]
            ],

            // Social sharing URLs
            'sharing_urls' => [
                'facebook' => 'https://www.facebook.com/sharer/sharer.php?u=' . urlencode($tourUrl),
                'twitter' => 'https://twitter.com/intent/tweet?url=' . urlencode($tourUrl) . '&text=' . urlencode('Check out this amazing virtual tour: ' . $tour['tour_name']),
                'linkedin' => 'https://www.linkedin.com/sharing/share-offsite/?url=' . urlencode($tourUrl),
                'whatsapp' => 'https://wa.me/?text=' . urlencode('Check out this amazing virtual tour: ' . $tour['tour_name'] . ' ' . $tourUrl),
                'telegram' => 'https://t.me/share/url?url=' . urlencode($tourUrl) . '&text=' . urlencode('Check out this amazing virtual tour: ' . $tour['tour_name']),
                'pinterest' => 'https://pinterest.com/pin/create/button/?url=' . urlencode($tourUrl) . '&media=' . urlencode($previewImage) . '&description=' . urlencode($tour['tour_name'] . ' - Virtual Tour'),
                'reddit' => 'https://reddit.com/submit?url=' . urlencode($tourUrl) . '&title=' . urlencode($tour['tour_name'] . ' - Virtual Tour')
            ]
        ];
    }

    /**
     * Get tour preview image (first node thumbnail)
     */
    private function getTourPreviewImage($tourId)
    {
        $stmt = $this->conn->prepare("
            SELECT thumbnail_url, image_url 
            FROM loft_tour_nodes 
            WHERE tour_id = ? 
            ORDER BY node_order ASC, id ASC 
            LIMIT 1
        ");
        $stmt->execute([$tourId]);
        $node = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($node) {
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $baseUrl = $protocol . '://' . $host;

            return $baseUrl . ($node['thumbnail_url'] ?: $node['image_url']);
        }

        return null;
    }

    /**
     * Copy tour assets for offline package
     */
    private function copyTourAssets($tourId, $packageDir)
    {
        // Create subdirectories
        $assetsDir = $packageDir . 'assets/';
        $imagesDir = $assetsDir . 'images/';
        $jsDir = $assetsDir . 'js/';
        $cssDir = $assetsDir . 'css/';

        mkdir($assetsDir, 0755, true);
        mkdir($imagesDir, 0755, true);
        mkdir($jsDir, 0755, true);
        mkdir($cssDir, 0755, true);

        // Copy panorama images
        $panoramaDir = __DIR__ . "/../../uploads/loft-tours/{$tourId}/panoramas/";
        if (is_dir($panoramaDir)) {
            $this->copyDirectory($panoramaDir, $imagesDir . 'panoramas/');
        }

        // Copy layer images
        $layersDir = __DIR__ . "/../../uploads/loft-tours/{$tourId}/layers/";
        if (is_dir($layersDir)) {
            $this->copyDirectory($layersDir, $imagesDir . 'layers/');
        }

        // Copy core JavaScript files
        $coreJsFiles = [
            'loft-tour-core.js',
            'loft-tour-layers.js',
            'loft-tour-transitions.js',
            'loft-tour-controls.js',
            'loft-tour-viewer.js'
        ];

        foreach ($coreJsFiles as $jsFile) {
            $sourcePath = __DIR__ . "/../../loft-tour/js/{$jsFile}";
            if (file_exists($sourcePath)) {
                copy($sourcePath, $jsDir . $jsFile);
            }
        }

        // Copy CSS files
        $cssFiles = ['loft-tour.css', 'matterport-ui.css'];
        foreach ($cssFiles as $cssFile) {
            $sourcePath = __DIR__ . "/../../loft-tour/css/{$cssFile}";
            if (file_exists($sourcePath)) {
                copy($sourcePath, $cssDir . $cssFile);
            }
        }

        // Copy libraries
        $libDir = $packageDir . 'lib/';
        mkdir($libDir, 0755, true);

        $libFiles = ['marzipano.min.js'];
        foreach ($libFiles as $libFile) {
            $sourcePath = __DIR__ . "/../../loft-tour/lib/{$libFile}";
            if (file_exists($sourcePath)) {
                copy($sourcePath, $libDir . $libFile);
            }
        }
    }

    /**
     * Generate standalone HTML for offline package
     */
    private function generateStandaloneHTML($tour)
    {
        $tourJson = json_encode($tour, JSON_PRETTY_PRINT);

        return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($tour['tour_name']) . ' - Virtual Tour</title>
    <link rel="stylesheet" href="assets/css/loft-tour.css">
    <link rel="stylesheet" href="assets/css/matterport-ui.css">
</head>
<body>
    <div id="tour-container" class="tour-container">
        <div id="viewer-canvas-container" class="viewer-canvas">
            <canvas id="viewer-canvas"></canvas>
        </div>
    </div>

    <!-- Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="lib/marzipano.min.js"></script>
    
    <!-- Tour Engine -->
    <script src="assets/js/loft-tour-core.js"></script>
    <script src="assets/js/loft-tour-layers.js"></script>
    <script src="assets/js/loft-tour-transitions.js"></script>
    <script src="assets/js/loft-tour-controls.js"></script>
    <script src="assets/js/loft-tour-viewer.js"></script>
    
    <script>
        // Tour data embedded directly
        const tourData = ' . $tourJson . ';
        
        // Initialize tour
        document.addEventListener("DOMContentLoaded", function() {
            const container = document.getElementById("tour-container");
            const engine = new LoftTourEngine(container);
            
            // Load tour data
            engine.loadTour(tourData).then(() => {
                console.log("Offline tour loaded successfully");
            }).catch(error => {
                console.error("Failed to load offline tour:", error);
            });
        });
    </script>
</body>
</html>';
    }

    /**
     * Get list of files in package directory
     */
    private function getPackageFileList($packageDir)
    {
        $files = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($packageDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $relativePath = str_replace($packageDir, '', $file->getPathname());
                $files[] = [
                    'path' => $relativePath,
                    'size' => $file->getSize(),
                    'modified' => date('Y-m-d H:i:s', $file->getMTime())
                ];
            }
        }

        return $files;
    }

    /**
     * Create ZIP archive of offline package
     */
    private function createZipArchive($packageDir, $tourId)
    {
        $zipPath = __DIR__ . "/../../uploads/loft-tours/{$tourId}/offline-package.zip";

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            throw new Exception('Cannot create ZIP archive');
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($packageDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $relativePath = str_replace($packageDir, '', $file->getPathname());
                $zip->addFile($file->getPathname(), $relativePath);
            }
        }

        $zip->close();
        return $zipPath;
    }

    /**
     * Copy directory recursively
     */
    private function copyDirectory($source, $destination)
    {
        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            $target = $destination . DIRECTORY_SEPARATOR . $iterator->getSubPathName();

            if ($item->isDir()) {
                if (!is_dir($target)) {
                    mkdir($target, 0755, true);
                }
            } else {
                copy($item, $target);
            }
        }
    }
}