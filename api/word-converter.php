<?php
// api/word-converter.php
require 'word-base.php';
require 'vendor/autoload.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $targetFormat = $_POST['format'] ?? '';

    if ($action === 'convert') {
        if (!isset($_FILES['file'])) {
            echo json_encode(['error' => 'No file uploaded']);
            exit;
        }

        $filePath = handleFileUpload($_FILES['file']);
        if (!$filePath) {
            echo json_encode(['error' => 'File upload failed']);
            exit;
        }

        try {
            $phpWord = \PhpOffice\PHPWord\IOFactory::load($filePath);
            $outputFile = str_replace('.docx', '.' . $targetFormat, $filePath);

            switch ($targetFormat) {
                case 'pdf':
                    $pdfWriter = \PhpOffice\PHPWord\IOFactory::createWriter($phpWord, 'PDF');
                    $pdfWriter->save($outputFile);
                    break;
                case 'html':
                    $htmlWriter = \PhpOffice\PHPWord\IOFactory::createWriter($phpWord, 'HTML');
                    $htmlWriter->save($outputFile);
                    break;
                case 'rtf':
                    $rtfWriter = \PhpOffice\PHPWord\IOFactory::createWriter($phpWord, 'RTF');
                    $rtfWriter->save($outputFile);
                    break;
                case 'txt':
                    $txtWriter = \PhpOffice\PHPWord\IOFactory::createWriter($phpWord, 'Text');
                    $txtWriter->save($outputFile);
                    break;
                default:
                    cleanupFile($filePath);
                    echo json_encode(['error' => 'Unsupported target format: ' . $targetFormat]);
                    exit;
            }

            echo json_encode([
                'success' => true,
                'download_url' => $outputFile,
                'format' => $targetFormat
            ]);

            // We don't cleanup the output file here so the user can download it.
            // The input file should be cleaned up.
            cleanupFile($filePath);

        } catch (\Exception $e) {
            cleanupFile($filePath);
            echo json_encode(['error' => 'Conversion failed: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Invalid action']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
