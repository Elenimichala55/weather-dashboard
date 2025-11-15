<?php
header("Content-Type: application/json");

$host = "dbserver.in.cs.ucy.ac.cy";
$user = "student";
$pass = "gtNgMF8pZyZq6l53";
$db = "epl425";

$conn = mysqli_connect($host, $user, $pass, $db);
if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

if ($request_method === 'POST') {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    // Handle Weather Request Insertion
    if (
        !isset($data['address']) || !isset($data['region']) ||
        !isset($data['city']) || !isset($data['country'])
    ) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }
    $username = mysqli_real_escape_string($conn, $data['username']);
    $address = mysqli_real_escape_string($conn, $data['address']);
    $region = mysqli_real_escape_string($conn, $data['region']);
    $city = mysqli_real_escape_string($conn, $data['city']);
    $country = mysqli_real_escape_string($conn, $data['country']);
    $timestamp = time();
    $query = "INSERT INTO requests (username, timestamp, address, region, city, country) 
              VALUES ('$username', '$timestamp', '$address', '$region', '$city', '$country')";
    if (mysqli_query($conn, $query)) {
        http_response_code(201);
        echo json_encode(["message" => "Data inserted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to insert data"]);
    }
    

} elseif ($request_method === 'GET') {
    // Fetch last 5 requests
    if (!isset($_GET['username']) || empty($_GET['username'])) {
        http_response_code(400);
        echo json_encode(["error" => "Username is required"]);
        exit;
    }

    $username = mysqli_real_escape_string($conn, $_GET['username']);
    $query = "SELECT * FROM requests WHERE username = '$username' ORDER BY timestamp DESC LIMIT 5";

    $result = mysqli_query($conn, $query);
    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "Query failed"]);
        exit;
    }

    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }

    echo json_encode($rows);

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

mysqli_close($conn);
?>
