# VeVit Tools Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden unsafe public tools and endpoints, create a validated canonical registry with generated public metadata, and establish repeatable structural verification.

**Architecture:** PHP remains the canonical data and server layer. A PHP exporter validates and atomically projects only public tool metadata to JSON; Python renders the static landing from that projection. Public endpoints gain isolated security helpers so deterministic tests can validate policy without network access.

**Tech Stack:** PHP 8.1+, vanilla JavaScript, Python 3, Apache-compatible static output, Node only for development syntax/browser checks.

---

### Task 1: Record design and verify upstream completeness

**Files:**
- Create: `docs/phase-1-technical-design.md`
- Create: `reports/phase-1-test-results.md`
- Test: `tests/phase-1-baseline-test.php`

- [ ] **Step 1: Write the baseline failure test**

```php
foreach ([
  'assets/js/site.js',
  'assets/js/lib/tool-ui.js',
  'assets/js/lib/purify.min.js',
  'assets/js/lib/pdf.worker.min.js',
] as $asset) {
  assert(is_file($root . '/' . $asset), "$asset must be present in upstream");
}
```

- [ ] **Step 2: Run baseline verification**

Run: `php tests/phase-1-baseline-test.php`

Expected: all four upstream assets are reported present.

- [ ] **Step 3: Commit documentation**

```bash
git add docs/phase-1-technical-design.md docs/superpowers/plans/2026-07-29-phase-1-security-registry-tests.md
git commit -m "docs: add phase 1 technical design and implementation plan"
```

### Task 2: Add HTML-to-PDF sanitizer and regression tests

**Files:**
- Create: `assets/js/lib/html-pdf-sanitize.js`
- Modify: `assets/js/tools/html-to-pdf.js`
- Modify: `includes/tools/html-to-pdf.php`
- Create: `tests/html-pdf-sanitize-test.js`

- [ ] **Step 1: Write failing sanitizer tests**

```js
for (const value of [
  '<script>window.__xss=1</script>',
  '<img src=x onerror="window.__xss=1">',
  '<a href="javascript:alert(1)">x</a>',
  '<meta http-equiv="refresh" content="0;url=https://evil.example">',
  '<iframe src="https://evil.example"></iframe><object data="x"></object>',
  '<img src="https://evil.example/a.png">',
  '<link rel="stylesheet" href="https://evil.example/a.css">',
  '<svg onload="window.__xss=1"><a href="javascript:1">x</a></svg>',
  '<p><strong>unclosed'
]) {
  const safe = sanitizeHtmlPdf(value);
  assertNoActiveContent(safe);
}
```

- [ ] **Step 2: Verify the test fails before the helper exists**

Run: `node tests/html-pdf-sanitize-test.js`

Expected: failure because `sanitizeHtmlPdf` does not exist.

- [ ] **Step 3: Implement the static sanitizer and sandbox renderer**

```js
const frame = document.createElement('iframe');
frame.setAttribute('sandbox', '');
frame.srcdoc = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\';">' + safeHtml;
```

The helper must use `DOMParser`, remove active nodes/attributes and allow only
static tags, `data:image/*` images and safe inline styles. The page must not
assign user input to main-document `innerHTML`.

- [ ] **Step 4: Run sanitizer regression test and a browser smoke test**

Run: `node tests/html-pdf-sanitize-test.js`

Expected: every malicious sample is inert and malformed markup is retained as safe static content.

- [ ] **Step 5: Commit security change**

```bash
git add assets/js/lib/html-pdf-sanitize.js assets/js/tools/html-to-pdf.js includes/tools/html-to-pdf.php tests/html-pdf-sanitize-test.js
git commit -m "fix: harden HTML to PDF rendering"
```

### Task 3: Harden SSL checker and cost-sensitive endpoints

**Files:**
- Create: `includes/ssl-checker.php`
- Modify: `api/ssl-check.php`
- Modify: `assets/js/tools/certificate-info.js`
- Modify: `api/feedback.php`
- Modify: `api/ai/ollama.php`
- Create: `tests/ssl-checker-test.php`
- Create: `tests/endpoint-security-test.php`

- [ ] **Step 1: Write failing address-policy tests**

```php
foreach ([
  '127.0.0.1', '10.0.0.1', '169.254.1.1', '224.0.0.1',
  '::1', '::', 'fe80::1', 'fc00::1', '::ffff:127.0.0.1', '2001:db8::1'
] as $ip) {
  assertFalse(ssl_is_public_ip($ip));
}
assertTrue(ssl_is_public_ip('1.1.1.1'));
```

- [ ] **Step 2: Verify policy test fails**

Run: `php tests/ssl-checker-test.php`

Expected: failure because the address policy helper is absent.

- [ ] **Step 3: Implement resolver/transport separation**

```php
$ips = ssl_resolve_host($host, $resolver);
if (!$ips || array_filter($ips, fn(string $ip): bool => !ssl_is_public_ip($ip))) {
    return ssl_result('dns_rejected');
}
$socket = ssl_connect_verified($ips[0], $host, $transport);
```

`ssl_connect_verified` connects directly to the selected IP at port 443 with
original hostname SNI and peer verification. It maps TLS errors to public
statuses without exposing network internals.

- [ ] **Step 4: Add endpoint constraints**

Require `GET` for SSL, `POST` for feedback/AI, deny rate-limit storage failure
with `503` for all three server-cost endpoints, set `Cache-Control: no-store`,
and reject the AI request `model` field. Select the model only from server
configuration allowlist.

- [ ] **Step 5: Run deterministic endpoint tests**

Run: `php tests/ssl-checker-test.php && php tests/endpoint-security-test.php`

Expected: private/IPv6/documentation fixtures are rejected, public fixture is
accepted, and no test opens an internal network connection.

- [ ] **Step 6: Commit security change**

```bash
git add includes/ssl-checker.php api/ssl-check.php assets/js/tools/certificate-info.js api/feedback.php api/ai/ollama.php tests/ssl-checker-test.php tests/endpoint-security-test.php
git commit -m "fix: harden SSL checks and public endpoints"
```

### Task 4: Migrate and validate canonical tool registry

**Files:**
- Modify: `includes/registry.php`
- Create: `scripts/export-tools.php`
- Create: `assets/data/tools.json`
- Create: `tests/registry-test.php`

- [ ] **Step 1: Write failing registry validation tests**

```php
$result = validate_tools($invalidTools);
assertContains('duplicate slug', $result['errors']);
assertContains('working cannot be not_implemented', $result['errors']);
assertContains('unavailable_on_wedos requires unavailable_on_wedos', $result['errors']);
```

- [ ] **Step 2: Verify test fails**

Run: `php tests/registry-test.php`

Expected: failure because canonical validation/export functions are absent.

- [ ] **Step 3: Implement schema and migration**

Convert all records to the agreed fields. Derive paths from slug convention,
declare only observed assets/features, preserve an explicit `verification` value
for unknown requirements, and classify unavailable tools truthfully.

- [ ] **Step 4: Implement deterministic public export**

```php
$json = json_encode($publicTools, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
$tmp = tempnam(dirname($target), '.tools-');
file_put_contents($tmp, $json . "\n", LOCK_EX);
rename($tmp, $target);
```

The exporter exits `1` after any validation/encoding/write failure and exports
only frontend metadata.

- [ ] **Step 5: Run validator and exporter tests**

Run: `php tests/registry-test.php && php scripts/export-tools.php --check`

Expected: 107 unique records, no invalid status/availability pair and stable JSON.

- [ ] **Step 6: Commit registry change**

```bash
git add includes/registry.php scripts/export-tools.php assets/data/tools.json tests/registry-test.php
git commit -m "feat: add canonical tool registry and generated public dataset"
```

### Task 5: Generate static landing and structural test foundation

**Files:**
- Modify: `scripts/generate-index.py`
- Modify: `tools.php`
- Modify: `README.md`
- Create: `tests/tool-manifest.json`
- Create: `tests/generate-index-test.php`
- Create: `tests/route-smoke-test.php`
- Create: `tests/run-phase-1.sh`
- Create: `reports/tool-status.json`

- [ ] **Step 1: Write failing generator and manifest tests**

```php
assertSame(107, count($manifest['tools']));
assertSame(count($registrySlugs), count(array_unique($registrySlugs)));
foreach ($manifest['tools'] as $tool) {
  assertFileExists($root . '/' . $tool['expected_template']);
}
```

- [ ] **Step 2: Verify test fails**

Run: `php tests/generate-index-test.php && php tests/route-smoke-test.php`

Expected: failure because the manifest and generated-data comparison do not yet exist.

- [ ] **Step 3: Implement generated landing input and placeholders**

Python consumes `assets/data/tools.json`, validates its count against exported
metadata, renders only one card per slug, and injects automatic counts. Replace
the three smart-quote attributes in `tools.php`; render an explicit unavailable
status instead of a false working area.

- [ ] **Step 4: Generate manifest and status report from the same registry**

Each tool includes route, template/script expectations, observed requirements,
fixture intent, test target, hosting compatibility, status and blocker. The
status report sets `verified_test_level` only from commands run in this phase.

- [ ] **Step 5: Run complete phase-one verification**

Run: `bash tests/run-phase-1.sh`

Expected: PHP lint, JavaScript syntax, export, deterministic index generation,
manifest validation, all 107 route checks and `git diff --check` pass.

- [ ] **Step 6: Commit tests and truthful documentation**

```bash
git add scripts/generate-index.py tools.php README.md tests reports assets/data/tools.json
git commit -m "test: add registry, generator and route smoke foundation"
git commit -m "docs: document truthful tool availability and phase 1 results"
```

### Task 6: Publish reviewable handoff

**Files:**
- Modify: `reports/phase-1-test-results.md`

- [ ] **Step 1: Record exact commands, timestamps, outcomes and skipped tests**

The report distinguishes structural, route, browser and happy-path evidence.

- [ ] **Step 2: Run final verification and request review**

Run: `bash tests/run-phase-1.sh && git diff --check`

Expected: zero command failures; unresolved external blockers documented.

- [ ] **Step 3: Push branch and create a draft PR to `main`**

The PR must enumerate security impact, status changes, test evidence, skipped
tests, blockers, rollback, absence of secrets and absence of a Node production
dependency.
