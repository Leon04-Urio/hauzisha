<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

try {
    $conn = Database::getInstance();
    $type = $_GET['type'] ?? '';
    $query = $_GET['q'] ?? '';

    if ($type === 'locations') {
        // Get unique locations that match the search query
        $sql = "SELECT DISTINCT location 
                FROM properties 
                WHERE is_deleted = 0 
                AND location IS NOT NULL 
                AND location != ''";

        $params = [];
        if (!empty($query)) {
            $sql .= " AND location LIKE :query";
            $params[':query'] = '%' . $query . '%';
        }

        $sql .= " ORDER BY location ASC LIMIT 10";

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $locations = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            'success' => true,
            'data' => $locations
        ]);

    } elseif ($type === 'names') {
        $sql = "SELECT DISTINCT name FROM properties WHERE is_deleted = 0 AND name IS NOT NULL AND name != ''";
        $params = [];
        if (!empty($query)) {
            $sql .= " AND name LIKE :query";
            $params[':query'] = '%' . $query . '%';
        }
        $sql .= " ORDER BY name ASC LIMIT 8";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $names = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode(['success' => true, 'data' => $names]);

    } elseif ($type === 'property-types') {
        // Get unique property types
        $sql = "SELECT DISTINCT type, COUNT(*) as count
                FROM properties 
                WHERE is_deleted = 0 
                AND type IS NOT NULL 
                AND type != ''
                GROUP BY type
                ORDER BY count DESC, type ASC";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $types = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format for dropdown
        $formattedTypes = array_map(function ($item) {
            return [
                'value' => $item['type'],
                'label' => ucfirst($item['type']) . ' (' . $item['count'] . ')',
                'count' => $item['count']
            ];
        }, $types);

        echo json_encode([
            'success' => true,
            'data' => $formattedTypes
        ]);

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid type parameter. Use "locations" or "property-types"'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>