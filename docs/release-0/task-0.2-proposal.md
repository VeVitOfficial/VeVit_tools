# Release 0 — Task 0.2 proposal: catalog data foundation

## Exact scope

Task 0.2 should add the **read-only public catalog data model** for the store:
versioned PostgreSQL/Supabase SQL migration files, a minimal server-side
repository interface, and public product-list/detail endpoints. It must not add
checkout, orders, payments, Stripe, stock reservation, file delivery, admin UI
or a production VeVit SSO integration.

## Proposed PostgreSQL schema

The migration is proposed only; it must not run until Task 0.2 is explicitly
approved and a target Supabase project is identified.

```sql
create schema if not exists store;

create type store.product_status as enum ('draft', 'published', 'archived');

create table store.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status store.product_status not null default 'draft',
  name text not null check (char_length(name) between 1 and 160),
  summary text not null check (char_length(summary) <= 1000),
  description text not null default '',
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  unit_amount integer not null check (unit_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table store.product_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references store.products(id) on delete cascade,
  kind text not null check (kind in ('image', 'digital_source')),
  storage_key text not null unique check (storage_key !~ '(^/|\\.\\.)'),
  public boolean not null default false,
  created_at timestamptz not null default now()
);

create index products_public_listing_idx on store.products (status, created_at desc)
  where status = 'published';
create index product_assets_product_idx on store.product_assets (product_id, kind);
```

`digital_source` is private metadata only. Task 0.2 must never return its
`storage_key` to a guest and does not implement download authorization.

## Migration and rollback plan

1. Add immutable, timestamped SQL files under `database/migrations/`; do not
   edit a migration after it has been applied.
2. Run migration first in an identified Supabase staging project with a backup
   and SQL review.
3. Verify schema, constraints, indexes, RLS policies and an empty catalog.
4. Production rollout is a separate approved operation.
5. Rollback before data entry: a paired down migration drops the two tables and
   enum in dependency order. After data entry, rollback is restore/disable only,
   never a destructive automatic drop.

## Endpoint proposal

| Endpoint | Actor | Contract |
| --- | --- | --- |
| `GET /store/api/products` | Guest or authenticated | Published products only; cursor pagination; no private asset metadata. |
| `GET /store/api/products/{slug}` | Guest or authenticated | One published product by validated canonical slug; public image metadata only. |

No endpoint accepts product UUIDs from a guest for private operations. Future
admin endpoints must use server-side authorization, not an incoming role or
user ID. Each resource lookup must scope by the authenticated subject and
allowed product state, preventing IDOR even if a UUID is guessed.

## Guest and authenticated boundary

Guests and authenticated users receive the same public catalog in Task 0.2.
Authentication is optional and uses only the existing anonymous/auth-provider
interface. No production SSO call, session assertion, role mapping or account
API contract is assumed. Authenticated-only ownership, purchase history and
digital download access belong to later, separately reviewed tasks.

## Security boundaries

* Server-side Supabase credentials only; never expose service-role credentials.
* RLS must default to deny. Guest read policy, if used, may select only
  `products.status = 'published'` and public image rows associated with them.
* Validate pagination, slug, response size and JSON output. Use parameterized
  database requests only.
* Private asset paths, database exceptions, row counts and internal IDs stay out
  of public responses unless a later contract requires them.
* No Stripe code or webhook route belongs to Task 0.2.

## Test plan

* SQL migration parse/apply/rollback in an isolated Supabase/PostgreSQL test DB.
* RLS tests: guest cannot read drafts, private assets or any future purchase data.
* Endpoint tests: valid list/detail, malformed slug, missing product, cursor
  limits, empty catalog, JSON error privacy and no service-role key in output.
* IDOR regression tests using guessed product UUIDs and a future second user.
* Existing Task 0.1 bootstrap, production error and health tests remain green.

## Preconditions for implementation

Before Task 0.2 implementation, provide the Supabase project/environment,
migration ownership process, desired product fields/currency policy and an
approved catalog API contract. No database change should occur from this proposal.
