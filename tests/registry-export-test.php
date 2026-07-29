<?php
require_once __DIR__ . '/../includes/registry.php';

function registry_expect(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}

$tools = all_tools();
registry_expect(count($tools) === 107, 'expected 107 registered tools');
$slugs = array_column($tools, 'slug');
registry_expect(count($slugs) === count(array_unique($slugs)), 'slugs must be unique');
foreach ($tools as $tool) {
    foreach (['slug', 'name', 'description', 'category', 'processing_location', 'icon', 'new', 'keywords', 'status', 'availability', 'requirements', 'privacy_note', 'declared_test_target', 'verified_test_level'] as $field) {
        registry_expect(array_key_exists($field, $tool), $tool['slug'] . ' missing ' . $field);
    }
    registry_expect($tool['verified_test_level'] === 'none', $tool['slug'] . ' must not claim a test result in the registry');
}
registry_expect(get_tool('pdf-password')['status'] === 'unavailable_on_wedos', 'qpdf placeholder must be WEDOS unavailable');
registry_expect(get_tool('ai-image-gen')['availability'] === 'not_implemented', 'image generator must be not implemented');

$command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__DIR__ . '/../scripts/export-tools.php') . ' --stdout';
$json = shell_exec($command);
$dataset = json_decode((string)$json, true, 512, JSON_THROW_ON_ERROR);
registry_expect(count($dataset['tools']) === 107, 'public export count mismatch');
registry_expect(!isset($dataset['tools'][0]['note']), 'public export must not include internal notes');
echo "registry export tests: PASS\n";
