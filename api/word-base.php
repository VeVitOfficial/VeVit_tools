<?php
// api/word-base.php
function handleFileUpload($fileInput) {
    $targetDir = "temp/word_tools/";
    if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);
    $fileName = uniqid() . "_" . basename($fileInput['name']);
    $targetFilePath = $targetDir . $fileName;
    if (move_uploaded_file($fileInput['tmp_name'], $targetFilePath)) {
        return $targetFilePath;
    }
    return false;
}

function cleanupFile($filePath) {
    if (file_exists($filePath)) unlink($filePath);
}
?>
