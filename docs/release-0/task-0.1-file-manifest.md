# Task 0.1 — local file manifest

## New files

| Path | Purpose | HTTP exposure |
| --- | --- | --- |
| `.env.example` | Safe environment-variable contract with placeholders only. | Public text only if web server is misconfigured; it contains no secret. |
| `app/bootstrap.php` | Core bootstrap; optional session initialization. | Must be blocked. |
| `app/config/Config.php` | Deterministic environment loading and production validation. | Must be blocked. |
| `app/http/{Request,JsonResponse,Redirect}.php` | Request parsing, safe JSON responses and redirects. | Must be blocked. |
| `app/session/Session.php` | Session lifecycle, logout, idle expiration and regeneration. | Must be blocked. |
| `app/security/Csrf.php` | CSRF token lifecycle. | Must be blocked. |
| `app/support/{ErrorHandler,Logger}.php` | Generic errors, request IDs and redacted logging. | Must be blocked. |
| `app/auth/*.php` | Anonymous and unconfigured SSO adapter contracts. | Must be blocked. |
| `config/*.php` | Declarative environment-key grouping; no values. | Must be blocked. |
| `store/api/health.php` | Public GET/HEAD diagnostic endpoint. | Public through `/store/api/health` only. |
| `store/index.php` | Explicit non-UI store placeholder. | Public, returns 404. |
| `storage/{logs,private}/.gitkeep` | Empty private storage directories only. | Must be blocked. |
| `app/.htaccess`, `config/.htaccess`, `storage/.htaccess` | Defense-in-depth HTTP denial and no directory listing. | Not public content. |
| `tests/bootstrap/run.php`, `tests/{config,http,security,session}/*-test.php` | Dependency-free Task 0.1 regression runner and tests. | Must not be deployed/public. |
| `docs/release-0/task-0.1-*`, `docs/store-architecture.md` | Task 0.1 architecture, plan, report and this manifest. | Do not expose as application endpoints. |

## Modified files

| Path | Change | Merge status |
| --- | --- | --- |
| `.htaccess` | Store health route; blocks internals, sensitive files and directory listing. | Manually merged from the original local file. |
| `router.php` | Health route and local development denial for internal paths, including decoded URL variants. | Manually merged from the original local file. |

No other pre-existing project file was modified by Task 0.1. `storage/logs` and
`storage/private` are intentionally private; logs, real `.env` files, secrets,
database dumps and backups must never be served over HTTP.
