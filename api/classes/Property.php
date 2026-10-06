<?php
class Property {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    
    public function createProperty($data) {
        // Ensure user is logged in
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can create properties.');
        }

        if (empty($data['name']) || empty($data['description']) || empty($data['price']) || empty($data['location'])) {
            throw new Exception('Name, description, price, and location are required.');
        }


        if (empty($data['agent_id'])) {
            throw new Exception('Agent ID is required.');
        }

        $userId = $_SESSION['user_id'];

        $validTypes = ['mansion', 'detached', 'apartment', 'bungalow', 'villa'];
        if (!in_array($data['type'], $validTypes)) {
            throw new Exception('Invalid property type.');
        }


        // ? Required: which agent owns this?
        if (empty($data['agent_id'])) {
            throw new Exception('Agent ID is required.');
        }

        $uploadedImages = [];
        $uploadDir = __DIR__ . '/../../uploads/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB limit

        function handleUpload($inputName, &$uploadedArray, $uploadDir, $allowedTypes, $maxFileSize) {
            if (!empty($_FILES[$inputName]['name'][0])) {
                foreach ($_FILES[$inputName]['name'] as $key => $imageName) {
                    $fileName = uniqid() . '_' . basename($imageName);
                    $targetFilePath = $uploadDir . $fileName;
                    $relativeFilePath = '/uploads/' . $fileName;
                    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

                    if (!in_array(strtolower($fileType), $allowedTypes)) {
                        throw new Exception('Invalid file type for image: ' . $imageName);
                    }

                    if ($_FILES[$inputName]['size'][$key] > $maxFileSize) {
                        throw new Exception('File size too large for: ' . $imageName);
                    }

                    if (move_uploaded_file($_FILES[$inputName]['tmp_name'][$key], $targetFilePath)) {
                        $uploadedArray[] = $relativeFilePath;
                    } else {
                        throw new Exception('Failed to upload image: ' . $imageName);
                    }
                }
            }
        }

        handleUpload('image_url', $uploadedImages, $uploadDir, $allowedTypes, $maxFileSize);

        $imageUrlsJson = json_encode($uploadedImages);

        // $imageUrlsJson = json_encode($data['gallery'] ?? []);

        // ? Handle single hero image upload
        $heroImagePath = null;
        if (!empty($_FILES['hero_image']['name'])) {
            $fileName = uniqid() . '_' . basename($_FILES['hero_image']['name']);
            $targetFilePath = $uploadDir . $fileName;
            $relativeFilePath = '/uploads/' . $fileName;
            $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

            if (!in_array(strtolower($fileType), $allowedTypes)) {
                throw new Exception('Invalid file type for hero image.');
            }

            if ($_FILES['hero_image']['size'] > $maxFileSize) {
                throw new Exception('Hero image exceeds file size limit.');
            }

            if (move_uploaded_file($_FILES['hero_image']['tmp_name'], $targetFilePath)) {
                $heroImagePath = $relativeFilePath;
            } else {
                throw new Exception('Failed to upload hero image.');
            }
        }

        $stmt = $this->conn->prepare("
            INSERT INTO properties (name, type, beds, baths, size, description, facilities, gallery, hero_image, agent_id, tour_link, location, address, price, rating, likes, tags, floor_plan, featured, units, is_deleted)
            VALUES (:name, :type, :beds, :baths, :size, :description, :facilities, :gallery, :hero_image, :agent_id, :tour_link, :location, :address, :price, :rating, :likes, :tags, :floor_plan, :featured, :units, :is_deleted)
        ");

        $facilities = isset($data['facilities']) && is_array($data['facilities']) 
        ? $data['facilities'] 
        : [];

        $tags = is_array($data['tags']) 
        ? $data['tags'] 
        : json_decode($data['tags'], true);

        // Handle units data
        $unitsData = null;
        if (!empty($data['units'])) {
            $unitsData = is_string($data['units']) ? $data['units'] : json_encode($data['units']);
        }

        $stmt->execute([
            ':name' => $data['name'],
            ':type' => $data['type'],
            ':beds' => $data['beds'],
            ':baths' => $data['baths'],
            ':size' => $data['size'],
            ':description' => $data['description'],
            ':facilities' => json_encode($facilities),
            ':gallery' => $imageUrlsJson,
            ':hero_image' => $heroImagePath,
            ':agent_id' => $data['agent_id'],
            ':tour_link' => $data['tour_link'] ?? null,
            ':location' => $data['location'],
            ':address' => $data['address'],
            ':price' => $data['price'],
            ':rating' => $data['rating'] ?? 0,
            ':likes' => $data['likes'] ?? 0,
            ':tags' => json_encode($tags),
            ':floor_plan' => $data['floor_plan'],
            ':featured' => $data['featured'],
            ':units' => $unitsData,
            ':is_deleted' => 0
        ]);

        return ['success' => true, 'message' => 'Property added successfully.'];
    }

    public function getAllProperties($filters = []) {
        try {
            // Get the page number from GET (default to page 1)
            $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
            $limit = 1000;
            $offset = ($page - 1) * $limit;

            $sqlCount = "SELECT COUNT(*) as total FROM properties p WHERE p.is_deleted = 0";
            $countParams = [];


            // Count total properties (with the same filters)
            $sqlCount = "SELECT COUNT(*) as total FROM properties p WHERE p.is_deleted = 0";
            $countParams = [];
            if (!empty($filters['location'])) {
                $sqlCount .= " AND p.location LIKE :location";
                $countParams[':location'] = '%' . $filters['location'] . '%';
            }
            if (!empty($filters['type'])) {
                $sqlCount .= " AND LOWER(p.type) = LOWER(:type)";
                $countParams[':type'] = $filters['type'];
            }
            if (!empty($filters['min_price'])) {
                $sqlCount .= " AND p.price >= :min_price";
                $countParams[':min_price'] = $filters['min_price'];
            }
            if (!empty($filters['max_price'])) {
                $sqlCount .= " AND p.price <= :max_price";
                $countParams[':max_price'] = $filters['max_price'];
            }
            if (!empty($filters['size'])) {
                $sqlCount .= " AND p.size >= :size";
                $countParams[':size'] = $filters['size'];
            }
            
            $stmtCount = $this->conn->prepare($sqlCount);
            foreach ($countParams as $key => $value) {
                $stmtCount->bindValue($key, $value, is_numeric($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $stmtCount->execute();
            $countResult = $stmtCount->fetch(PDO::FETCH_ASSOC);
            $total = $countResult['total'];


            $sql = "
            SELECT 
                p.*,
                (SELECT CONCAT('/hauzisha/uploads/properties/', file_base, '-thumb.jpg')
                 FROM property_images 
                 WHERE property_id = p.id AND is_hero = 1 
                 LIMIT 1) AS hero_image,
                CONCAT(
                    '{',
                    '\"id\":', IFNULL(a.id, 'null'), ',',
                    '\"firstname\":\"', IFNULL(a.firstname, ''), '\",',
                    '\"lastname\":\"', IFNULL(a.lastname, ''), '\",',
                    '\"email\":\"', IFNULL(a.email, ''), '\",',
                    '\"phone\":\"', IFNULL(a.phone, ''), '\",',
                    '\"whatsapp\":\"', IFNULL(a.whatsapp_no, ''), '\",',
                    '\"earb_no\":', IFNULL(a.earb_no, 'null'), ',',
                    '\"is_verified\":', IF(a.earb_no IS NOT NULL AND a.earb_no != '', 'true', 'false'), ',',
                    '\"image\":\"', IFNULL(a.image, ''), '\"',
                    '}'
                ) AS agent,
                CASE 
                WHEN COUNT(r.id) = 0 THEN '[]'
                ELSE CONCAT(
                    '[',
                    GROUP_CONCAT(
                        CONCAT(
                            '{',
                            '\"review_id\":', IFNULL(r.id, 'null'), ',',
                            '\"user_id\":', IFNULL(r.user_id, 'null'), ',',
                            '\"text\":\"', REPLACE(IFNULL(r.review, ''), '\"', '\\\"'), '\",',
                            '\"likes\":', IFNULL(r.likes, 0), ',',
                            '\"created_at\":\"', IFNULL(r.created_at, ''), '\",',
                            '\"profile_image\":\"', COALESCE(u.image, 'images/pfp-default.png'), '\"',
                            '}'
                        )
                    ),
                    ']'
                )
            END AS reviews
            FROM properties p
            LEFT JOIN agents a ON p.agent_id = a.id
            LEFT JOIN reviews r ON p.id = r.property_id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE 
                p.is_deleted = 0
                AND (r.is_deleted = 0 OR r.is_deleted IS NULL)
            GROUP BY p.id
            ";
            
            $params = [];


            if (!empty($filters['location'])) {
                $sql .= " AND p.location LIKE :location";
                $params[':location'] = '%' . $filters['location'] . '%';
            }
            if (!empty($filters['type'])) {
                $sql .= " AND LOWER(p.type) = LOWER(:type)";
                $params[':type'] = $filters['type'];
            }
            if (!empty($filters['min_price'])) {
                $sql .= " AND p.price >= :min_price";
                $params[':min_price'] = $filters['min_price'];
            }
            if (!empty($filters['max_price'])) {
                $sql .= " AND p.price <= :max_price";
                $params[':max_price'] = $filters['max_price'];
            }
            if (!empty($filters['size'])) {
                $sql .= " AND p.size >= :size";
                $params[':size'] = $filters['size'];
            }


            // Append LIMIT clause for pagination
            $sql .= " LIMIT :offset, :limit";
            $params[':offset'] = $offset;
            $params[':limit'] = $limit;


            $stmt = $this->conn->prepare($sql);
            foreach ($params as $key => $value) {
                if ($key === ':offset' || $key === ':limit') {
                    $stmt->bindValue($key, $value, PDO::PARAM_INT);
                } else {
                    $stmt->bindValue($key, $value, is_numeric($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
                }        }
            $stmt->execute();
            $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($properties)) {
                throw new Exception('No properties found.');
            }

            foreach ($properties as &$property) {
                // ? Fetch images from property_images table
                $imgStmt = $this->conn->prepare("
                    SELECT id, file_base, category, is_hero, order_index 
                    FROM property_images 
                    WHERE property_id = :property_id 
                    ORDER BY is_hero DESC, order_index ASC
                ");
                $imgStmt->execute([':property_id' => $property['id']]);
                $dbImages = $imgStmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Format images with all size URLs
                $property['images'] = array_map(function($img) {
                    return [
                        'id' => $img['id'],
                        'category' => $img['category'],
                        'is_hero' => (bool)$img['is_hero'],
                        'thumbnail_url' => '/hauzisha/uploads/properties/' . $img['file_base'] . '-thumb.jpg',
                        'urls' => [
                            'thumb' => '/hauzisha/uploads/properties/' . $img['file_base'] . '-thumb.jpg',
                            'md' => '/hauzisha/uploads/properties/' . $img['file_base'] . '-md.jpg',
                            'lg' => '/hauzisha/uploads/properties/' . $img['file_base'] . '-lg.jpg'
                        ]
                    ];
                }, $dbImages);
                
                // Set main_image to hero or first image
                $property['main_image'] = !empty($property['images']) ? $property['images'][0]['urls']['lg'] : '';
                
                // Keep old gallery for backward compatibility
                $images = json_decode($property['gallery'], true);

                // ? Properly decode facilities
                if (!empty($property['facilities'])) {
                    $decoded = json_decode($property['facilities'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        // If still a JSON string inside, decode twice
                        if (is_string($decoded)) {
                            $decoded = json_decode($decoded, true);
                        }
                        $property['facilities'] = $decoded;
                    } else {
                        $property['facilities'] = [];
                    }
                }

                // ? Properly decode tags
                if (!empty($property['tags'])) {
                    $decoded = json_decode($property['tags'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        if (is_string($decoded)) {
                            $decoded = json_decode($decoded, true);
                        }
                        $property['tags'] = $decoded;
                    } else {
                        $property['tags'] = [];
                    }
                }

                if (json_last_error() === JSON_ERROR_NONE) {
                    // Double decode if needed
                    if (is_string($images)) {
                        $images = json_decode($images, true);
                    }
                    $property['gallery'] = $images;
                } else {
                    $property['gallery'] = [];
                }

                $property['profile_image'] = $property['image'] ?? 'images/pfp-default.png';
            }

            return [
                'success' => true,
                'message' => 'Properties retrieved successfully.',
                'data' => $properties,
                'total' => $total,    // total number of records
                'page' => $page,      // current page number
                'limit' => $limit     // items per page
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function getDeletedPropertiesToo($filters = []) {
        try {
            
            $sql = "
                SELECT 
                    p.*,
                    CONCAT(
                        '{',
                        '\"id\":', IFNULL(a.id, 'null'), ',',
                        '\"firstname\":\"', IFNULL(a.firstname, ''), '\",',
                        '\"lastname\":\"', IFNULL(a.lastname, ''), '\",',
                        '\"email\":\"', IFNULL(a.email, ''), '\",',
                        '\"phone\":\"', IFNULL(a.phone, ''), '\",',
                        '\"whatsapp\":\"', IFNULL(a.whatsapp_no, ''), '\",',
                        '\"image\":\"', IFNULL(a.image, ''), '\"',
                        '}'
                    ) AS agent,
                    CASE 
                    WHEN COUNT(r.id) = 0 THEN '[]'
                    ELSE CONCAT(
                        '[',
                        GROUP_CONCAT(
                            CONCAT(
                                '{',
                                '\"review_id\":', IFNULL(r.id, 'null'), ',',
                                '\"user_id\":', IFNULL(r.user_id, 'null'), ',',
                                '\"text\":\"', REPLACE(IFNULL(r.review, ''), '\"', '\\\"'), '\",',
                                '\"likes\":', IFNULL(r.likes, 0), ',',
                                '\"created_at\":\"', IFNULL(r.created_at, ''), '\",',
                                '\"profile_image\":\"', COALESCE(u.image, 'images/pfp-default.png'), '\"',
                                '}'
                            )
                        ),
                        ']'
                    )
                END AS reviews
                FROM properties p
                LEFT JOIN agents a ON p.agent_id = a.id
                LEFT JOIN reviews r ON p.id = r.property_id
                LEFT JOIN users u ON r.user_id = u.id
                
                GROUP BY p.id
                ";
            $params = [];

            if (!empty($filters['location'])) {
                $sql .= " AND p.location LIKE :location";
                $params[':location'] = '%' . $filters['location'] . '%';
            }
            if (!empty($filters['type'])) {
                $sql .= " AND LOWER(p.type) = LOWER(:type)";
                $params[':type'] = $filters['type'];
            }
            if (!empty($filters['min_price'])) {
                $sql .= " AND p.price >= :min_price";
                $params[':min_price'] = $filters['min_price'];
            }
            if (!empty($filters['max_price'])) {
                $sql .= " AND p.price <= :max_price";
                $params[':max_price'] = $filters['max_price'];
            }
            if (!empty($filters['size'])) {
                $sql .= " AND p.size >= :size";
                $params[':size'] = $filters['size'];
            }

            $stmt = $this->conn->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value, is_numeric($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $stmt->execute();

            $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($properties)) {
                throw new Exception('No properties found.');
            }

            foreach ($properties as &$property) {
                $images = json_decode($property['gallery'], true);
                $property['main_image'] = is_array($images) && count($images) > 0 ? $images[0] : '';

                // ? Properly decode facilities
                if (!empty($property['facilities'])) {
                    $decoded = json_decode($property['facilities'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        // If still a JSON string inside, decode twice
                        if (is_string($decoded)) {
                            $decoded = json_decode($decoded, true);
                        }
                        $property['facilities'] = $decoded;
                    } else {
                        $property['facilities'] = [];
                    }
                }

                // ? Properly decode tags
                if (!empty($property['tags'])) {
                    $decoded = json_decode($property['tags'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        if (is_string($decoded)) {
                            $decoded = json_decode($decoded, true);
                        }
                        $property['tags'] = $decoded;
                    } else {
                        $property['tags'] = [];
                    }
                }

                if (json_last_error() === JSON_ERROR_NONE) {
                    // Double decode if needed
                    if (is_string($images)) {
                        $images = json_decode($images, true);
                    }
                    $property['gallery'] = $images;
                } else {
                    $property['gallery'] = [];
                }

                $property['profile_image'] = $property['image'] ?? 'images/pfp-default.png';
            }

            return [
                'success' => true,
                'message' => 'Properties retrieved successfully.',
                'data' => $properties
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function getPropertyById($propertyId) {
        try {
            if (!is_numeric($propertyId)) {
                throw new Exception('Invalid property ID.');
            }

            // if (!isset($_SESSION['user_id'])) {
            //     throw new Exception('No user is logged in.');
            // }

            // $userId = $_SESSION['user_id'];


            $stmt = $this->conn->prepare("
                SELECT p.*, 
                       a.id AS agent_id, 
                       a.firstname AS agent_firstname, 
                       a.lastname AS agent_lastname, 
                       a.image AS agent_image, 
                       a.email AS agent_email,
                       a.phone AS agent_phone,
                       a.whatsapp_no AS agent_whatsapp,
                       a.earb_no AS agent_earb_no,
                       (SELECT CONCAT('/hauzisha/uploads/properties/', file_base, '-thumb.jpg')
                        FROM property_images 
                        WHERE property_id = p.id AND is_hero = 1 
                        LIMIT 1) AS hero_image
                FROM properties p
                JOIN agents a ON p.agent_id = a.id
                WHERE p.id = :property_id AND p.is_deleted = 0
            ");
            $stmt->bindParam(':property_id', $propertyId, PDO::PARAM_INT);
            $stmt->execute();

            $property = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$property) {
                throw new Exception('Property not found.');
            }


            $property['gallery'] = !empty($property['gallery']) ? json_decode($property['gallery'], true) : [];
            $property['tags'] = !empty($property['tags']) ? json_decode($property['tags'], true) : [];
            $property['facilities'] = !empty($property['facilities']) ? json_decode($property['facilities'], true) : [];
            $property['main_image'] = isset($property['gallery'][0]) ? $property['gallery'][0] : '';


            // Fetch reviews
            $stmt = $this->conn->prepare("
                SELECT r.id, r.review, r.likes, r.created_at, u.image AS image, u.firstname AS firstname, u.lastname AS lastname, u.id AS user_id
                FROM reviews r
                JOIN users u ON r.user_id = u.id 
                WHERE r.property_id = :property_id AND r.is_deleted = 0 
                ORDER BY r.created_at DESC
            ");
            $stmt->bindParam(':property_id', $propertyId, PDO::PARAM_INT);
            $stmt->execute();

            $property['reviews'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Restructure agent info for frontend
            $property['agent'] = [
                'id' => $property['agent_id'],
                'firstname' => $property['agent_firstname'],
                'lastname' => $property['agent_lastname'],
                'image' => $property['agent_image'],
                'email' => $property['agent_email'] ?? 'agent@example.com',
                'phone' => $property['agent_phone'] ?? '',
                'whatsapp' => $property['agent_whatsapp'] ?? '',
                'earb_no' => $property['agent_earb_no'] ?? null,
                'is_verified' => !empty($property['agent_earb_no'])
            ];

            // Remove top-level agent columns to avoid redundancy
            unset($property['agent_id'], $property['agent_firstname'], $property['agent_lastname'], $property['agent_image'], $property['agent_email'], $property['agent_phone'], $property['agent_whatsapp'], $property['agent_earb_no']);

            error_log("Fetched property: " . json_encode($property));

            return [
                'success' => true,
                'property' => $property
            ];

        } catch (Exception $e) {
            error_log("Error in getPropertyById: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function getAgentProperties($agentId) {
        $query = "
            SELECT p.*, a.firstname, a.lastname, a.email, a.image,
                   (SELECT CONCAT('/hauzisha/uploads/properties/', file_base, '-thumb.jpg')
                    FROM property_images 
                    WHERE property_id = p.id AND is_hero = 1 
                    LIMIT 1) AS hero_image
            FROM properties p
            JOIN agents a ON p.agent_id = a.id
            WHERE p.agent_id = :agent_id AND p.is_deleted = 0
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':agent_id', $agentId, PDO::PARAM_INT);
        $stmt->execute();

        $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ? Decode JSON fields for clean output
        foreach ($properties as &$property) {
            $property['gallery'] = !empty($property['gallery']) ? json_decode($property['gallery'], true) : [];
            $property['tags'] = !empty($property['tags']) ? json_decode($property['tags'], true) : [];
            $property['facilities'] = !empty($property['facilities']) ? json_decode($property['facilities'], true) : [];
            $property['main_image'] = isset($property['gallery'][0]) ? $property['gallery'][0] : '';
        }

        return $properties;
    }

    public function updateProperty($data, $propertyId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can update properties.');
        }
    
        $setFields = [];
        $params = [];
    
        if (!empty($data['name'])) {
            $setFields[] = "name = :name";
            $params[':name'] = $data['name'];
        }
        if (!empty($data['price'])) {
            $setFields[] = "price = :price";
            $params[':price'] = $data['price'];
        }
        if (!empty($data['location'])) {
            $setFields[] = "location = :location";
            $params[':location'] = $data['location'];
        }
        if (!empty($data['address'])) {
            $setFields[] = "address = :address";
            $params[':address'] = $data['address'];
        }
        if (!empty($data['agent_id'])) {
            $setFields[] = "agent_id = :agent_id";
            $params[':agent_id'] = $data['agent_id'];
        }
        if (!empty($data['beds'])) {
            $setFields[] = "beds = :beds";
            $params[':beds'] = $data['beds'];
        }
        if (!empty($data['baths'])) {
            $setFields[] = "baths = :baths";
            $params[':baths'] = $data['baths'];
        }
        if (!empty($data['size'])) {
            $setFields[] = "size = :size";
            $params[':size'] = $data['size'];
        }
        if (!empty($data['type'])) {
            $setFields[] = "type = :type";
            $params[':type'] = $data['type'];
        }
        if (!empty($data['description'])) {
            $setFields[] = "description = :description";
            $params[':description'] = $data['description'];
        }
        if (!empty($data['facilities'])) {
            $setFields[] = "facilities = :facilities";
            $params[':facilities'] = is_array($data['facilities']) ? json_encode($data['facilities']) : $data['facilities'];
        }
        if (!empty($data['featured'])) {
            $setFields[] = "featured = :featured";
            $params[':featured'] = $data['featured'];
        }
        if (isset($data['tags'])) { 
            $setFields[] = "tags = :tags";
        
            if (is_array($data['tags'])) {
                // Already an array ? safe
                $params[':tags'] = json_encode($data['tags']);
            } else {
                // String input ? turn into JSON array
                $tagsArray = array_map('trim', explode(',', $data['tags']));
                $params[':tags'] = json_encode($tagsArray);
            }
        }        
        if (!empty($data['tour_link'])) {
            $setFields[] = "tour_link = :tour_link";
            $params[':tour_link'] = $data['tour_link'];
        }
        if (!empty($data['floor_plan'])) {
            $setFields[] = "floor_plan = :floor_plan";
            $params[':floor_plan'] = $data['floor_plan'];
        }

        // ? Handle hero image update
        if (!empty($_FILES['hero_image']['name'])) {
            $fileName = uniqid() . '_' . basename($_FILES['hero_image']['name']);
            $targetFilePath = $uploadDir . $fileName;
            $relativeFilePath = '/uploads/' . $fileName;
            $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

            if (!in_array(strtolower($fileType), $allowedTypes)) {
                throw new Exception('Invalid file type for hero image.');
            }

            if ($_FILES['hero_image']['size'] > $maxFileSize) {
                throw new Exception('Hero image exceeds file size limit.');
            }

            if (move_uploaded_file($_FILES['hero_image']['tmp_name'], $targetFilePath)) {
                $setFields[] = "hero_image = :hero_image";
                $params[':hero_image'] = $relativeFilePath;
            } else {
                throw new Exception('Failed to upload hero image.');
            }
        }
    
        // ? Handle gallery update (incremental)
        $uploadDir = __DIR__ . '/../../uploads/';
        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB
    
        function handleUpload($inputName, &$uploadedArray, $uploadDir, $allowedTypes, $maxFileSize) {
            if (!empty($_FILES[$inputName]['name'][0])) {
                foreach ($_FILES[$inputName]['name'] as $key => $imageName) {
                    $fileName = uniqid() . '_' . basename($imageName);
                    $targetFilePath = $uploadDir . $fileName;
                    $relativeFilePath = '/uploads/' . $fileName;
                    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);
    
                    if (!in_array(strtolower($fileType), $allowedTypes)) {
                        throw new Exception('Invalid file type for image: ' . $imageName);
                    }
    
                    if ($_FILES[$inputName]['size'][$key] > $maxFileSize) {
                        throw new Exception('File size too large for: ' . $imageName);
                    }
    
                    if (move_uploaded_file($_FILES[$inputName]['tmp_name'][$key], $targetFilePath)) {
                        $uploadedArray[] = $relativeFilePath;
                    } else {
                        throw new Exception('Failed to upload image: ' . $imageName);
                    }
                }
            }
        }
    
        $newImages = [];
        if (isset($_FILES['gallery'])) {
            handleUpload('gallery', $newImages, $uploadDir, $allowedTypes, $maxFileSize);
        }
    
        if (!empty($newImages) || !empty($data['add_gallery_image']) || !empty($data['remove_gallery_image'])) {
            // 1. Get current gallery
            $stmt = $this->conn->prepare("SELECT gallery FROM properties WHERE id = :id");
            $stmt->bindParam(':id', $propertyId);
            $stmt->execute();
            $currentGallery = $stmt->fetchColumn();
            $galleryArray = !empty($currentGallery) ? json_decode($currentGallery, true) : [];
    
            if (!is_array($galleryArray)) {
                $galleryArray = [];
            }
    
            // 2. Add uploaded files
            foreach ($newImages as $img) {
                $galleryArray[] = $img;
            }
    
            // 3. Add single image path
            if (!empty($data['add_gallery_image'])) {
                $galleryArray[] = $data['add_gallery_image'];
            }
    
            // 4. Remove single image
            if (!empty($data['remove_gallery_image'])) {
                $galleryArray = array_filter($galleryArray, function($img) use ($data) {
                    if ($img === $data['remove_gallery_image']) {
                        $filePath = $_SERVER['DOCUMENT_ROOT'] . $img;
                        if (file_exists($filePath)) {
                            unlink($filePath); // delete from disk
                        }
                        return false; 
                    }
                    return true;
                });
                $galleryArray = array_values($galleryArray);
            }

            $setFields[] = "gallery = :gallery";
            $params[':gallery'] = json_encode($galleryArray);
        }
        
        // Handle units data update
        if (isset($data['units'])) {
            $setFields[] = "units = :units";
            if (empty($data['units'])) {
                $params[':units'] = null;
            } else {
                $params[':units'] = is_string($data['units']) ? $data['units'] : json_encode($data['units']);
            }
        }
    
        if (empty($setFields)) {
            throw new Exception('No fields provided for update.');
        }
    
        $params[':id'] = $propertyId;
    
        $setClause = implode(", ", $setFields);
    
        $stmt = $this->conn->prepare(
            "UPDATE properties 
             SET $setClause 
             WHERE id = :id AND is_deleted = 0"
        );
    
        if ($stmt->execute($params)) {
            return ['success' => true, 'message' => 'Property updated successfully.'];
        } else {
            throw new Exception('Failed to update property.');
        }
    }    

    public function softDeleteProperty($propertyId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admins can delete properties.');
        }
    
        if (empty($propertyId)) {
            throw new Exception('Property ID is required.');
        }
    
        // ? No need to check user_id — admin can delete anything.
        $stmt = $this->conn->prepare(
            "SELECT * FROM properties WHERE id = :id AND is_deleted = 0"
        );
        $stmt->bindParam(':id', $propertyId);
        $stmt->execute();
    
        if ($stmt->rowCount() === 0) {
            throw new Exception('Property not found or already deleted.');
        }
    
        $stmt = $this->conn->prepare(
            "UPDATE properties SET is_deleted = 1 WHERE id = :id"
        );
        $stmt->bindParam(':id', $propertyId);
        $stmt->execute();
    
        return ['success' => true, 'message' => 'Property successfully soft deleted.'];
    }

    public function suspendProperty($data) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        // Only admins can suspend.
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admins can suspend properties.');
        }
    
        if (empty($data['property_id'])) {
            throw new Exception('Property ID is required.');
        }
        if (empty($data['sus_reason'])) {
            throw new Exception('Suspension reason is required.');
        }
    
        // Check if the property exists and is not deleted.
        $stmt = $this->conn->prepare("SELECT * FROM properties WHERE id = :id AND is_deleted = 0");
        $stmt->bindParam(':id', $data['property_id']);
        $stmt->execute();
    
        if ($stmt->rowCount() === 0) {
            throw new Exception('Property not found or already deleted.');
        }
    
        // Suspend it.
        $stmt = $this->conn->prepare("UPDATE properties SET is_suspended = 1, sus_reason = :sus_reason WHERE id = :id");
        $stmt->bindParam(':id', $data['property_id']);
        $stmt->bindParam(':sus_reason', $data['sus_reason']);
        $stmt->execute();
    
        return ['success' => true, 'message' => 'Property successfully suspended with reason.'];
    }

    public function activateProperty($propertyId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admins can activate properties.');
        }
    
        if (empty($propertyId) || !is_numeric($propertyId)) {
            throw new Exception('Valid property ID is required.');
        }
    
        $stmt = $this->conn->prepare("UPDATE properties SET is_suspended = 0, sus_reason = NULL WHERE id = ?");
        if ($stmt->execute([$propertyId])) {
            return ["success" => true, "message" => "Property activated successfully"];
        } else {
            throw new Exception('Failed to activate property.');
        }
    }
    
    public function bulkImportProperties($file) {
        if ($file['type'] !== 'text/csv' && pathinfo($file['name'], PATHINFO_EXTENSION) !== 'csv') {
            throw new Exception('Invalid file type. Only CSV files are allowed.');
        }

        $csv = fopen($file['tmp_name'], 'r');

        if (!$csv) {
            throw new Exception('Failed to open uploaded file.');
        }

        $header = fgetcsv($csv);
        if (!$header) {
            throw new Exception('CSV file is empty or invalid.');
        }

        $imported = 0;
        $failed = 0;
        $failedRows = [];

        while (($row = fgetcsv($csv)) !== false) {
            $data = array_combine($header, $row);

            if (!$data) {
                $failed++;
                $failedRows[] = $row;
                continue;
            }

            try {
                $stmt = $this->conn->prepare("
                    INSERT INTO properties (
                        name, type, beds, baths, size, description,
                        facilities, gallery, agent_id, tour_link, location, address,
                        price, rating, likes, tags, floor_plan, featured, is_deleted
                    )
                    VALUES (
                        :name, :type, :beds, :baths, :size, :description,
                        :facilities, :gallery, :agent_id, :tour_link, :location, :address,
                        :price, :rating, :likes, :tags, :floor_plan, :featured, 0
                    )
                ");

                // Validate and prepare data
                $validTypes = ['mansion', 'detached', 'apartment', 'bungalow', 'villa'];
                if (!in_array($data['type'], $validTypes)) {
                    throw new Exception('Invalid property type: ' . $data['type']);
                }

                $facilities = !empty($data['facilities']) ? json_encode(explode('|', $data['facilities'])) : json_encode([]);
                $gallery = !empty($data['gallery']) ? json_encode(explode('|', $data['gallery'])) : json_encode([]);
                $tags = !empty($data['tags']) ? json_encode(explode('|', $data['tags'])) : json_encode([]);

                $stmt->execute([
                    ':name' => $data['name'],
                    ':type' => $data['type'],
                    ':beds' => $data['beds'],
                    ':baths' => $data['baths'],
                    ':size' => $data['size'],
                    ':description' => $data['description'],
                    ':facilities' => $facilities,
                    ':gallery' => $gallery,
                    ':agent_id' => $data['agent_id'],
                    ':tour_link' => $data['tour_link'] ?? null,
                    ':location' => $data['location'],
                    ':address' => $data['address'],
                    ':price' => $data['price'],
                    ':rating' => $data['rating'] ?? 0,
                    ':likes' => $data['likes'] ?? 0,
                    ':tags' => $tags,
                    ':floor_plan' => $data['floor_plan'] ?? '',
                    ':featured' => $data['featured'] ?? 0
                ]);

                $imported++;
            } catch (Exception $e) {
                $failed++;
                $failedRows[] = ['row' => $row, 'error' => $e->getMessage()];
                continue;
            }
        }

        fclose($csv);

        return [
            'success' => true,
            'message' => "Import completed. ? Imported: $imported, ? Failed: $failed.",
            'errors' => $failedRows
        ];
    }

    public function getPropertyKPIs() {
        try {
            // Total properties
            $stmt = $this->conn->query("SELECT COUNT(*) AS total FROM properties");
            $total = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
            // Active properties
            $stmt = $this->conn->query("SELECT COUNT(*) AS active FROM properties WHERE is_suspended = 0 AND is_deleted = 0");
            $active = (int)$stmt->fetch(PDO::FETCH_ASSOC)['active'];
    
            // Inactive properties
            $stmt = $this->conn->query("SELECT COUNT(*) AS inactive FROM properties WHERE is_suspended = 1 OR is_deleted = 1");
            $inactive = (int)$stmt->fetch(PDO::FETCH_ASSOC)['inactive'];
    
            // Pending properties (adjust your rule if different)
            $stmt = $this->conn->query("SELECT COUNT(*) AS pending FROM properties WHERE featured = 0 AND is_deleted = 0");
            $pending = (int)$stmt->fetch(PDO::FETCH_ASSOC)['pending'];
    
            // New this month
            $stmt = $this->conn->query("
                SELECT COUNT(*) AS newThisMonth 
                FROM properties 
                WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
                  AND YEAR(created_at) = YEAR(CURRENT_DATE())
            ");
            $newThisMonth = (int)$stmt->fetch(PDO::FETCH_ASSOC)['newThisMonth'];
    
            return [
                'total' => $total,
                'active' => $active,
                'inactive' => $inactive,
                'pending' => $pending,
                'newThisMonth' => $newThisMonth,
                'activePercent' => $total > 0 ? round(($active / $total) * 100, 1) : 0,
                'newPercent' => $total > 0 ? round(($newThisMonth / $total) * 100, 1) : 0,
            ];
        } catch (Exception $e) {
            throw new Exception("Error fetching KPIs: " . $e->getMessage());
        }
    }
    
    public function removeGalleryImage($propertyId, $imageUrl) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admins can modify properties.');
        }
    
        // Fetch current gallery
        $stmt = $this->conn->prepare("SELECT gallery FROM properties WHERE id = :id AND is_deleted = 0");
        $stmt->bindParam(':id', $propertyId, PDO::PARAM_INT);
        $stmt->execute();
        $currentGallery = $stmt->fetchColumn();
    
        if ($currentGallery === false) {
            throw new Exception('Property not found.');
        }
    
        $galleryArray = !empty($currentGallery) ? json_decode($currentGallery, true) : [];
        if (!is_array($galleryArray)) $galleryArray = [];
    
        // Remove matching image
        $updatedGallery = array_filter($galleryArray, function($img) use ($imageUrl) {
            return $img !== $imageUrl;
        });
        $updatedGallery = array_values($updatedGallery);
        $galleryJson = json_encode($updatedGallery);
    
        // Save back
        $stmt = $this->conn->prepare("UPDATE properties SET gallery = :gallery WHERE id = :id");
        $stmt->bindParam(':gallery', $galleryJson, PDO::PARAM_STR);
        $stmt->bindParam(':id', $propertyId, PDO::PARAM_INT);
        $stmt->execute();
    
        // Optionally: delete file from disk
        $filePath = $uploadDir . basename($imageUrl);
        if (file_exists($filePath)) {
            unlink($filePath);
        } else {
            error_log("?? File not found for deletion: " . $filePath);
        }
    
        return ['success' => true, 'message' => 'Image removed successfully.', 'gallery' => $updatedGallery];
    }

    public function getSimilarProperties($propertyId, $limit = 6) {
        if (!is_numeric($propertyId)) {
            throw new Exception('Invalid property ID.');
        }
        
        // Get current property details
        $stmt = $this->conn->prepare("SELECT type, location, price FROM properties WHERE id = ? AND is_deleted = 0");
        $stmt->execute([$propertyId]);
        $current = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$current) {
            throw new Exception('Property not found.');
        }
        
        // Find similar properties (same type or location, similar price range)
        $priceMin = $current['price'] * 0.7;
        $priceMax = $current['price'] * 1.3;
        
        $stmt = $this->conn->prepare("
            SELECT * FROM properties 
            WHERE id != ? 
            AND is_deleted = 0 
            AND (
                type = ? 
                OR location = ? 
                OR (price BETWEEN ? AND ?)
            )
            ORDER BY 
                CASE WHEN type = ? THEN 1 ELSE 2 END,
                CASE WHEN location = ? THEN 1 ELSE 2 END,
                ABS(price - ?) ASC
            LIMIT ?
        ");
        $stmt->execute([
            $propertyId, 
            $current['type'], 
            $current['location'], 
            $priceMin, 
            $priceMax,
            $current['type'],
            $current['location'],
            $current['price'],
            $limit
        ]);
        
        $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'properties' => $properties
        ];
    }
    
}
?>


