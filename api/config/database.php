<?php

// class Database {
//     private static $conn;

//     public static function getInstance() {
//         if (!isset(self::$conn)) {
//             try {
//                 // Use Railway environment variables
//                 $host = getenv('DB_HOST');
//                 $db   = getenv('DB_NAME');
//                 $user = getenv('DB_USER');
//                 $pass = getenv('DB_PASS');
//                 $port = getenv('DB_PORT') ?: 3306;

//                 self::$conn = new PDO(
//                     "mysql:host={$host};port={$port};dbname={$db};charset=utf8",
//                     $user,
//                     $pass
//                 );

//                 self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//             } catch (PDOException $e) {
//                 die("Database connection failed: " . $e->getMessage());
//             }
//         }
//         return self::$conn;
//     }
// }



class Database {
    private static $conn;

    public static function getInstance() {
        if (!isset(self::$conn)) {
            try {
                $config = parse_ini_file(__DIR__ . '/app.ini');
                self::$conn = new PDO(
                    "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8",
                    $config['db_user'],
                    $config['db_password']
                );
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                die("Database connection failed: " . $e->getMessage());
            }
        }
        return self::$conn;
    }
}
?>
