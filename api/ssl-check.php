<?php
// SSL certifikát info — server-side přes PHP openssl (žádný shell_exec).
// Připojí se TLS ke `domain:443`, získá peer certifikát a rozparsuje openssl_x509_parse.
// Funguje na sdíleném hostingu (stačí PHP openssl rozšíření).

header('Content-Type: application/json; charset=utf-8');

function fail(int $code, string $msg): void {
  http_response_code($code);
  echo json_encode(['message' => $msg]);
  exit;
}

$domain = isset($_GET['domain']) ? trim($_GET['domain']) : '';
if ($domain === '') fail(400, 'Zadejte doménu.');
// očistit: pouze hostname (případně :port)
$domain = preg_replace('#^https?://#i', '', $domain);
$host = parse_url('http://' . $domain, PHP_URL_HOST);
if (!$host || !preg_match('/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i', $host)) {
  fail(400, 'Neplatná doména.');
}
$port = 443;

// SNI + zachycení peer certifikátu
$errNo = 0; $errStr = '';
$ctx = stream_context_create(['ssl' => [
  'capture_peer_cert' => true,
  'capture_peer_cert_chain' => true,
  'verify_peer' => false,
  'verify_peer_name' => false,
  'SNI_enabled' => true,
  'peer_name' => $host,
]]);
$remote = @stream_socket_client('ssl://' . $host . ':' . $port, $errNo, $errStr, 15, STREAM_CLIENT_CONNECT, $ctx);
if (!$remote) fail(502, 'Nepodařilo se připojit k ' . $host . ':443 (' . $errStr . ').');

$params = stream_context_get_params($remote);
$cert = $params['options']['ssl']['peer_certificate'] ?? null;
$chain = $params['options']['ssl']['peer_certificate_chain'] ?? [];
fclose($remote);
if (!$cert) fail(502, 'Certifikát nebylo možné získat.');

$parsed = openssl_x509_parse($cert);
if (!$parsed) fail(502, 'Certifikát se nepodařilo rozparsovat.');

function dt(?array $a, string $k): string {
  if (!$a || !isset($a[$k])) return '—';
  $v = $a[$k];
  if (is_numeric($v)) {
    $d = new DateTime('@' . $v);
    return $d->format('j. n. Y H:i:s');
  }
  return (string)$v;
}

$subject = $parsed['subject'] ?? [];
$issuer = $parsed['issuer'] ?? [];
$validTo = $parsed['validTo_time_t'] ?? 0;
$now = time();
$daysLeft = $validTo ? round(($validTo - $now) / 86400) : null;

$san = [];
if (!empty($parsed['extensions']['subjectAltName'])) {
  preg_match_all('/DNS:([^,]+)/', $parsed['extensions']['subjectAltName'], $m);
  $san = $m[1] ?? [];
}

echo json_encode([
  'subject' => [
    'CN' => $subject['CN'] ?? '—',
    'O' => $subject['O'] ?? '—',
    'OU' => $subject['OU'] ?? '—',
    'C' => $subject['C'] ?? '—',
  ],
  'issuer' => [
    'CN' => $issuer['CN'] ?? '—',
    'O' => $issuer['O'] ?? '—',
    'C' => $issuer['C'] ?? '—',
  ],
  'validFrom' => dt($parsed, 'validFrom_time_t'),
  'validTo' => dt($parsed, 'validTo_time_t'),
  'daysLeft' => $daysLeft,
  'expired' => $validTo ? ($validTo < $now) : null,
  'serialNumber' => $parsed['serialNumber'] ?? '—',
  'version' => isset($parsed['version']) ? (intval($parsed['version']) + 1) : '—',
  'signatureType' => $parsed['signatureTypeSN'] ?? ($parsed['signatureTypeLN'] ?? '—'),
  'san' => $san,
  'chainLength' => count($chain),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);