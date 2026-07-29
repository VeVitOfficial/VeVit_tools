#!/usr/bin/env php
<?php
/** Export the canonical PHP registry to deterministic public JSON. */
require_once __DIR__ . '/../includes/registry.php';

function export_fail(string $message): void {
    fwrite(STDERR, "Registry export failed: {$message}\n");
    exit(1);
}

function validate_tool(array $tool, array &$seen): void {
    $required = ['slug', 'name', 'description', 'category', 'processing_location', 'icon', 'new', 'keywords', 'status', 'availability', 'requirements', 'privacy_note', 'declared_test_target', 'verified_test_level'];
    foreach ($required as $field) if (!array_key_exists($field, $tool)) export_fail("{$tool['slug']}: missing {$field}");
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $tool['slug'])) export_fail("invalid slug {$tool['slug']}");
    if (isset($seen[$tool['slug']])) export_fail("duplicate slug {$tool['slug']}");
    $seen[$tool['slug']] = true;
    if (!in_array($tool['category'], CATEGORY_ORDER, true)) export_fail("{$tool['slug']}: unknown category");
    if (!in_array($tool['processing_location'], ['client', 'vevit_server', 'external_ai'], true)) export_fail("{$tool['slug']}: invalid processing location");
    if (!in_array($tool['status'], TOOL_STATUSES, true) || !in_array($tool['availability'], TOOL_AVAILABILITY, true)) export_fail("{$tool['slug']}: invalid status or availability");
    if ($tool['status'] === 'working' && $tool['availability'] === 'not_implemented') export_fail("{$tool['slug']}: working cannot be not_implemented");
    if ($tool['status'] === 'coming_soon' && !in_array($tool['availability'], ['not_implemented', 'requires_external_service'], true)) export_fail("{$tool['slug']}: coming_soon availability mismatch");
    if ($tool['status'] === 'unavailable_on_wedos' && $tool['availability'] !== 'unavailable_on_wedos') export_fail("{$tool['slug']}: WEDOS availability mismatch");
    if ($tool['status'] === 'broken' && $tool['availability'] === 'available') export_fail("{$tool['slug']}: broken cannot be available");
    if (!in_array($tool['declared_test_target'], TOOL_TEST_TARGETS, true) || !in_array($tool['verified_test_level'], ['none', 'structural', 'browser_smoke', 'happy_path'], true)) export_fail("{$tool['slug']}: invalid test level");
    if ($tool['verified_test_level'] === 'happy_path') export_fail("{$tool['slug']}: happy_path belongs to generated test report, not registry");
    foreach (['browser_features', 'local_assets', 'php_extensions', 'external_services', 'hosting_constraints'] as $key) {
        if (!isset($tool['requirements'][$key]) || !is_array($tool['requirements'][$key])) export_fail("{$tool['slug']}: invalid requirements.{$key}");
    }
}

$tools = all_tools();
$seen = [];
foreach ($tools as $tool) validate_tool($tool, $seen);
usort($tools, fn(array $a, array $b): int => strcmp($a['slug'], $b['slug']));
$payload = [
    'schema_version' => 1,
    'generated_at' => gmdate('Y-m-d\\TH:i:s\\Z', (int)(getenv('SOURCE_DATE_EPOCH') ?: 0)),
    'categories' => array_map(fn(string $id): array => ['id' => $id, 'name' => CATEGORY_LABELS[$id], 'description' => CATEGORY_DESCRIPTIONS[$id], 'color' => CATEGORY_COLORS[$id]], CATEGORY_ORDER),
    'tools' => array_map('public_tool_metadata', $tools),
];
if (($argv[1] ?? '') === '--generator') {
    require_once __DIR__ . '/../includes/icons.php';
    $iconNames = ['Box', 'ChevronDown', 'LogIn', 'Wrench', 'Zap', 'ShieldCheck', 'Gift', 'Search', 'ArrowLeft', 'Bug', 'Send', 'Server', 'Sparkles'];
    foreach ($tools as $tool) $iconNames[] = $tool['icon'];
    $payload['icons'] = [];
    foreach (array_values(array_unique($iconNames)) as $name) $payload['icons'][$name] = icon_svg($name, 24);
}
$json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_INVALID_UTF8_SUBSTITUTE);
if ($json === false) export_fail('JSON encoding failed');

if (in_array(($argv[1] ?? ''), ['--stdout', '--generator'], true)) {
    echo $json . "\n";
    exit(0);
}
$target = __DIR__ . '/../assets/data/tools.json';
$directory = dirname($target);
if (!is_dir($directory) && !mkdir($directory, 0755, true)) export_fail('cannot create output directory');
$temporary = tempnam($directory, '.tools-');
if ($temporary === false || file_put_contents($temporary, $json . "\n", LOCK_EX) === false || !rename($temporary, $target)) {
    if ($temporary && is_file($temporary)) unlink($temporary);
    export_fail('atomic write failed');
}
