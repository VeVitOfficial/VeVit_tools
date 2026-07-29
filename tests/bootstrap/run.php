<?php
declare(strict_types=1);

$tests = [];
ob_start();
function test(string $name, callable $callback): void { global $tests; $tests[] = [$name, $callback]; }
function expect(bool $condition, string $message = 'Expectation failed'): void { if (!$condition) throw new RuntimeException($message); }
function expect_same(mixed $expected, mixed $actual, string $message = 'Values differ'): void { if ($expected !== $actual) throw new RuntimeException($message); }

foreach (glob(__DIR__ . '/../{config,session,http,security}/*-test.php', GLOB_BRACE) ?: [] as $file) require $file;
$failed = 0;
foreach ($tests as [$name, $callback]) {
    try { $callback(); echo "PASS {$name}\n"; }
    catch (Throwable $exception) { $failed++; echo "FAIL {$name}: {$exception->getMessage()}\n"; }
}
echo sprintf("%d tests, %d failures\n", count($tests), $failed);
ob_end_flush();
exit($failed ? 1 : 0);
