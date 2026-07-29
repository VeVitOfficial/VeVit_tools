#!/usr/bin/env php
<?php
if (($argv[1] ?? '') !== '--confirmed-structural') {
    fwrite(STDERR, "Refusing to claim verified test results without --confirmed-structural\n");
    exit(2);
}
require_once __DIR__ . '/../includes/registry.php';

$tools = [];
$counts = array_fill_keys(TOOL_STATUSES, 0);
foreach (all_tools() as $tool) {
    $counts[$tool['status']]++;
    $tools[] = [
        'slug' => $tool['slug'],
        'category' => $tool['category'],
        'status' => $tool['status'],
        'availability' => $tool['availability'],
        'verified_test_level' => 'structural',
        'declared_test_target' => $tool['declared_test_target'],
        'blocker_note' => $tool['note'] ?? null,
    ];
}
usort($tools, fn(array $a, array $b): int => strcmp($a['slug'], $b['slug']));
$report = ['schema_version' => 1, 'total_registered_tools' => count($tools), 'actually_tested_tools' => count($tools), 'test_scope' => 'structural and route smoke only', 'status_counts' => $counts, 'tools' => $tools];
$json = json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) exit(1);
$target = __DIR__ . '/../reports/tool-status.json';
if (!is_dir(dirname($target)) && !mkdir(dirname($target), 0755, true)) exit(1);
$temporary = tempnam(dirname($target), '.tool-status-');
if ($temporary === false || file_put_contents($temporary, $json . "\n", LOCK_EX) === false || !rename($temporary, $target)) {
    if ($temporary && is_file($temporary)) unlink($temporary);
    exit(1);
}
