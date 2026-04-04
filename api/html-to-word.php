<?php
// api/html-to-word.php
require 'word-base.php';
require 'vendor/autoload.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['html'])) {
    try {
        $htmlContent = $_POST['html'];

        $phpWord = new \PhpOffice\PHPWord\PhpWord();
        $section = $phpWord->addSection();

        // Use PHPWord's built-in HTML parser to add content to the section
        \PhpOffice\PHPWord\Element\Text::addHtml($section, $htmlContent);

        $writer = \PhpOffice\PHPWord\IOFactory::createWriter($phpWord, 'Word2007');

        $targetDir = "temp/word_tools/";
        if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);

        $outputFileName = "export_" . uniqid() . ".docx";
        $outputFile = $targetDir . $outputFileName;

        $writer->save($outputFile);

        echo json_encode([
            'success' => true,
            'download_url' => $outputFile
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request. HTML content is required.'
    ]);
}
?>
