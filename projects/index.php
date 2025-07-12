<?php
header('Content-Type: application/json');

$PASSWORD = 'yup';
$PROJECTS_FILE = 'projects.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['pwd'])) {
    if (!file_exists($PROJECTS_FILE)) {
        $defaultProjects = [];
        file_put_contents($PROJECTS_FILE, json_encode($defaultProjects, JSON_PRETTY_PRINT));
    }

    $projects = json_decode(file_get_contents($PROJECTS_FILE), true);
    echo json_encode($projects);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['pwd']))) {
    $providedPassword = $_GET['pwd'] ?? '';

    if ($providedPassword !== $PASSWORD) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    } else {

        $projectData = [
            'title' => $_GET['title'] ?? '',
            'description' => $_GET['description'] ?? '',
            'status' => $_GET['status'] ?? 'In Development',
            'image' => $_GET['image'] ?? '',
            'url' => $_GET['url'] ?? ''
        ];
    }

    if (empty($projectData['title']) || empty($projectData['description'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title and description are required']);
        exit;
    }

    if (!file_exists($PROJECTS_FILE)) {
        $projects = [];
    } else {
        $projects = json_decode(file_get_contents($PROJECTS_FILE), true);
        if (!is_array($projects)) {
            $projects = [];
        }
    }

    $newId = 1;
    if (!empty($projects)) {
        $ids = array_column($projects, 'id');
        $newId = max($ids) + 1;
    }

    $newProject = [
        'id' => $newId,
        'title' => $projectData['title'],
        'description' => $projectData['description'],
        'status' => $projectData['status'],
        'image' => $projectData['image'] ?: 'https://via.placeholder.com/140',
        'url' => $projectData['url'] ?: '#'
    ];

    $projects[] = $newProject;

    file_put_contents($PROJECTS_FILE, json_encode($projects, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true, 'project' => $newProject]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
