<?php
test('HTTP helper rejects an unallowed method', function (): void {
    require_once __DIR__ . '/../../app/http/Request.php';
    expect_same(false, VeVit\App\Http\Request::methodAllowed('POST', ['GET']));
});

test('HTTP helper rejects invalid JSON and oversized bodies', function (): void {
    require_once __DIR__ . '/../../app/http/Request.php';
    expect_same('invalid_json', VeVit\App\Http\Request::decodeJson('{bad}', 100)['error']);
    expect_same('request_too_large', VeVit\App\Http\Request::decodeJson('{"x":1}', 2)['error']);
});

test('redirect helper allows only same-origin paths', function (): void {
    require_once __DIR__ . '/../../app/http/Redirect.php';
    expect_same('/store', VeVit\App\Http\Redirect::safePath('/store', '/'));
    expect_same('/', VeVit\App\Http\Redirect::safePath('https://evil.example', '/'));
});
