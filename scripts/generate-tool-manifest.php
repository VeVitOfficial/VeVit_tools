#!/usr/bin/env php
<?php
require_once __DIR__ . '/../includes/registry.php';

$entries = [];
foreach (all_tools() as $tool) {
    $template = 'includes/tools/' . $tool['slug'] . '.php';
    $script = 'assets/js/tools/' . $tool['slug'] . '.js';
    $implemented = is_file(__DIR__ . '/../' . $template) && is_file(__DIR__ . '/../' . $script);
    $entries[] = [
        'slug' => $tool['slug'],
        'category' => $tool['category'],
        'route' => '/tools/' . $tool['slug'],
        'expected_php_template' => $implemented ? $template : null,
        'expected_javascript' => $implemented ? $script : null,
        'required_libraries' => ['assets/js/lib/tool-ui.js'],
        'fixture' => null,
        'basic_test_steps' => ['Open route', 'Verify title and primary workspace or truthful unavailable state', 'Perform no destructive input during smoke test'],
        'expected_result' => $implemented ? 'Route renders the tool workspace without a fatal PHP error.' : 'Route renders an unavailable or coming-soon state without a primary action.',
        'hosting_compatibility' => $tool['availability'],
        'final_status' => $tool['status'],
        'verified_test_level' => 'none',
        'blocker_note' => $tool['note'] ?? null,
    ];
}
usort($entries, fn(array $a, array $b): int => strcmp($a['slug'], $b['slug']));
$json = json_encode(['schema_version' => 1, 'tools' => $entries], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) { fwrite(STDERR, "Cannot encode manifest\n"); exit(1); }
$target = __DIR__ . '/../tests/tool-manifest.json';
$tmp = tempnam(dirname($target), '.manifest-');
if ($tmp === false || file_put_contents($tmp, $json . "\n", LOCK_EX) === false || !rename($tmp, $target)) {
    if ($tmp && is_file($tmp)) unlink($tmp);
    fwrite(STDERR, "Cannot write manifest\n"); exit(1);
}
