# Release 0, Task 0.1 — Implementation Plan

**Goal:** Add an isolated, WEDOS-compatible security foundation for future
store endpoints without implementing orders, payments, stock or downloads.

**Architecture:** `app/` owns bootstrap, configuration, HTTP, session, CSRF,
auth adapters and redacted logging. `store/` is the only new public module and
exposes only `GET /store/api/health`. Existing tools routing remains untouched
except for one explicit route in Apache and the local development router.

**Stack:** PHP 8.1+ standard library, Apache mod_rewrite, no Composer, no Node.

## Work sequence

1. Add a dependency-free test runner and red tests for configuration, HTTP,
   session, CSRF and logging.
2. Implement configuration/bootstrap/error and HTTP primitives; commit.
3. Add hardened sessions, CSRF and auth provider interfaces; commit.
4. Attach the health endpoint and add route tests; commit.
5. Document the configuration contract, limitations and rollback; commit.

Every implementation step is driven by a previously failing test. No database
connection, Stripe integration, order state or digital-file delivery belongs to
this task.
