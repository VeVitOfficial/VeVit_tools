<?php
// api/word-to-html.php
require 'word-base.php';
require 'vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $filePath = handleFileUpload($_FILES['file']);
    if (!$filePath) {
        http_response_code(400);
        echo json_encode(['error' => 'File upload failed']);
        exit;
    }

    try {
        $phpWord = \PhpOffice\PHPWord\IOFactory::load($filePath);
        $htmlWriter = \PhpOffice\PHPWord\IOFactory::createWriter($phpWord, 'HTML');

        // Set content type to HTML for the browser
        header('Content-Type: text/html');
        $htmlWriter->save('php://output');
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    } finally {
        cleanupFile($filePath);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request. Please upload a file.']);
}
?>
