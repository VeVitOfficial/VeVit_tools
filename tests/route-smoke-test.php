<?php
$base = rtrim(getenv('VEVIT_TEST_BASE_URL') ?: 'http://127.0.0.1:3940', '/');
$manifest = json_decode((string)file_get_contents(__DIR__ . '/tool-manifest.json'), true, 512, JSON_THROW_ON_ERROR);
$context = stream_context_create(['http' => ['ignore_errors' => true, 'timeout' => 10, 'header' => "Accept: text/html\r\n"]]);
$failures = [];
foreach ($manifest['tools'] as $tool) {
    $body = @file_get_contents($base . $tool['route'], false, $context);
    $headers = $http_response_header ?? [];
    $status = $headers[0] ?? '';
    if (!str_contains($status, ' 200 ') || $body === false || str_contains($body, 'Fatal error') || !str_contains($body, '<title>') || (!str_contains($body, 'id="tool-root"') && !str_contains($body, 'tool-placeholder'))) {
        $failures[] = $tool['slug'] . ' (' . $status . ')';
    }
}
if ($failures) throw new RuntimeException('Route smoke failures: ' . implode(', ', $failures));
echo 'route smoke tests: PASS (' . count($manifest['tools']) . " routes)\n";
