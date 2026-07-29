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
| `APP_ENV`, `APP_DEBUG`, `APP_URL`, `APP_KEY` | App mode, safe debug gate, canonical URL and server-only secret. All four bootstrap values are critical. |
| `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` | Reserved server-only PostgreSQL/Supabase connection contract; unused in Task 0.1. |
| `SUPABASE_URL`, `SUPABASE_SERVER_KEY` | Reserved server-only Supabase contract; unused in Task 0.1. |
| `SESSION_COOKIE_NAME`, `SESSION_LIFETIME_SECONDS`, `SESSION_SECURE`, `SESSION_SAME_SITE` | PHP session cookie contract. |
| `TRUSTED_PROXIES`, `ALLOWED_ORIGINS` | Reserved for later proxy/CORS policy; unused in Task 0.1. |
| `LOG_PATH` | Server-only writable log directory. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Placeholders only; no Stripe code reads them. |
| `DIGITAL_FILES_PATH` | Reserved non-public file directory; unused in Task 0.1. |

Missing `APP_ENV`, `APP_URL` or `APP_KEY` causes bootstrap to fail closed with
a generic response. Never place actual secret values in `.env.example`, client
JavaScript or git.

## Security decisions

* Production debug is always disabled, even if `APP_DEBUG=true` is accidentally
  configured.
* Errors receive a correlation/request ID. The client gets a generic JSON error;
  server logs retain the detail and redact password, token, cookie, key, card
  and secret fields.
* Sessions use cookies only, strict mode, no URL session IDs, `HttpOnly`,
  `SameSite=Lax`, host-only scope and production `Secure`. Idle sessions expire
  after the configured lifetime. Call `Session::regenerateForPrivilegeChange()`
  after future login/role changes and `Session::logout()` on logout.
* CSRF tokens are session-bound, generated with `random_bytes` and compared with
  `hash_equals`. Future state-changing browser endpoints must call it. Stripe
  webhooks are expressly excluded; they require signature verification later.
* `VeVitSsoProvider` intentionally reports `not_configured`; no account API
  contract is guessed.
* Apache blocks direct access to new `app/`, `config/` and `storage/` paths.

## Local run and verification

```bash
APP_ENV=development APP_DEBUG=true APP_URL=http://127.0.0.1:3950 \
APP_KEY=local-test-key SESSION_SECURE=false php -S 127.0.0.1:3950 router.php

curl -i http://127.0.0.1:3950/store/api/health
php tests/bootstrap/run.php
find . -name '*.php' -not -path './.git/*' -print0 | xargs -0 -n1 php -l
git diff --check
```

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
