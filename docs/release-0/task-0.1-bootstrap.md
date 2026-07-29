# Release 0 — Task 0.1: secure store bootstrap

## Scope and architecture

This task establishes only a dependency-free PHP security baseline for a future
store module. `app/bootstrap.php` is the single entry point for new store PHP
endpoints. It initializes configuration validation, a request ID, global error
handling, a host-only PHP session and shared HTTP helpers. The public module is
isolated in `store/`; its sole endpoint is `GET /store/api/health`.

No database migration, Supabase query, order, Stripe integration, stock change,
digital-file delivery or VeVit SSO request is implemented.

## Environment contract

Copy `.env.example` for local development only. WEDOS production must set
equivalent environment variables outside the repository.

| Variable | Purpose |
| --- | --- |
| `APP_ENV`, `APP_DEBUG`, `APP_URL`, `APP_KEY` | App mode, safe debug gate, canonical URL and server-only secret. Production requires an HTTPS URL and a non-placeholder key of at least 32 bytes. The key is reserved for a later audited purpose; it is not cryptography in Task 0.1. |
| `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` | Reserved server-only PostgreSQL/Supabase connection contract; unused in Task 0.1. |
| `SUPABASE_URL`, `SUPABASE_SERVER_KEY` | Reserved server-only Supabase contract; unused in Task 0.1. |
| `SESSION_COOKIE_NAME`, `SESSION_LIFETIME_SECONDS`, `SESSION_REGENERATION_INTERVAL_SECONDS`, `SESSION_SECURE`, `SESSION_SAME_SITE` | PHP session cookie contract. Lifetime is 300–86400 seconds; regeneration has a 900-second default. |
| `TRUSTED_PROXIES`, `ALLOWED_ORIGINS` | Reserved for later proxy/CORS policy; unused in Task 0.1. |
| `LOG_PATH` | Server-only writable log directory. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Placeholders only; no Stripe code reads them. |
| `DIGITAL_FILES_PATH` | Reserved non-public file directory; unused in Task 0.1. |

`.env.example` is never parsed automatically. Process environment variables are
the only production source; explicit `Config::fromSources()` overrides exist
solely for deterministic tests and have higher precedence. Missing configuration
is logged as `missing_configuration`; malformed values as
`invalid_configuration`; unsafe production session configuration as
`insecure_production_configuration`. Clients always receive the same generic
error. Never place actual secret values in `.env.example`, client JavaScript or
git.

## Security decisions

* Production debug is always disabled, even if `APP_DEBUG=true` is accidentally
  configured.
* Errors receive a server-generated 24-hex-character request ID in both JSON
  body and `X-Request-ID`. Incoming client request IDs are never trusted.
  The client gets a generic JSON error; logs use recursive redaction and never
  record session contents, full request bodies or full HTTP headers.
* Sessions use cookies only, strict mode, no URL session IDs, `HttpOnly`,
  `SameSite=Lax`, host-only scope and production `Secure`. Idle sessions expire
  after the configured lifetime. Idle timeout is a transition to a new anonymous
  session: identity, roles and the previous CSRF token are removed, the old ID
  is invalidated and a new CSRF token is issued. Regeneration after privilege
  changes and periodically during active sessions also rotates CSRF. Logout
  expires the client cookie with its original security parameters before
  destroying the server session.
* CSRF tokens are session-bound, generated with `random_bytes` and compared with
  `hash_equals`. Future state-changing browser endpoints must call it. Stripe
  webhooks are expressly excluded; they require signature verification later.
* `VeVitSsoProvider` intentionally reports `not_configured`; no account API
  contract is guessed.
* Apache blocks direct access to new `app/`, `config/` and `storage/` paths.

## Local run and verification

```bash
APP_ENV=development APP_DEBUG=true APP_URL=http://127.0.0.1:3950 \
APP_KEY=abcdefghijklmnopqrstuvwxyz123456 SESSION_SECURE=false \
LOG_PATH=storage/logs DIGITAL_FILES_PATH=storage/private php -S 127.0.0.1:3950 router.php

curl -i http://127.0.0.1:3950/store/api/health
php tests/bootstrap/run.php
find . -name '*.php' -not -path './.git/*' -print0 | xargs -0 -n1 php -l
git diff --check
```

## Review verification report

Executed locally on **2026-07-29 02:45 CEST**, PHP 8.5.8 CLI, Linux
7.1.4-arch1-1 x86_64. Automated checks: `php tests/bootstrap/run.php`, PHP
lint over all PHP files, health GET, health POST (405 + exact `Allow`), health
without `Set-Cookie`, and HTTP 404 checks for `app/`, `config/`, `storage/` and
the log path. `git diff --check` requires Git metadata and is not available in
this local snapshot; no manual production deployment test was performed. No database migration or data change
was performed; no real Stripe or Supabase secret was used.

## WEDOS limitations

The implementation uses PHP standard library only: no Composer, Node.js,
long-running process or local service is required. Configure secrets in the
hosting control panel or an out-of-webroot server configuration. If WEDOS cannot
provide environment variables or a non-public writable log directory, do not
enable store endpoints until a safe hosting-specific alternative is configured.

## Deferred work

Task 0.2 and later must separately design database migrations, Supabase access,
authorization, Stripe webhook signature validation, orders, inventory, digital
file authorization, rate limits and CSRF enforcement on each state-changing
endpoint.

## Rollback

Revert this task's commits in reverse order. Delete no data: this task creates
no schema or records. Removing the one Apache/router health route restores the
previous application behavior.
