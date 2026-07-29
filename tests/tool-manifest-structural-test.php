<?php
$manifest = json_decode((string)file_get_contents(__DIR__ . '/tool-manifest.json'), true, 512, JSON_THROW_ON_ERROR);
if (count($manifest['tools'] ?? []) !== 107) throw new RuntimeException('Manifest must contain 107 tools.');
$seen = [];
foreach ($manifest['tools'] as $tool) {
    if (isset($seen[$tool['slug']])) throw new RuntimeException('Duplicate manifest slug: ' . $tool['slug']);
    $seen[$tool['slug']] = true;
    if ($tool['expected_php_template'] !== null && !is_file(__DIR__ . '/../' . $tool['expected_php_template'])) throw new RuntimeException('Missing template: ' . $tool['slug']);
    if ($tool['expected_javascript'] !== null && !is_file(__DIR__ . '/../' . $tool['expected_javascript'])) throw new RuntimeException('Missing JavaScript: ' . $tool['slug']);
    foreach ($tool['required_libraries'] as $library) if (!is_file(__DIR__ . '/../' . $library)) throw new RuntimeException('Missing library: ' . $library);
    if ($tool['verified_test_level'] !== 'none') throw new RuntimeException('Manifest must not claim an unrecorded test result.');
}
echo "tool manifest structural tests: PASS\n";
