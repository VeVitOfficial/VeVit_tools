# Store architecture

Release 0 introduces an isolated PHP foundation under `app/` and `store/`.
Existing VeVit Tools landing, registry and `/tools/<slug>` rendering are not a
dependency of the store module and are not changed by it.

```
store/api/health.php -> app/bootstrap.php
                         ├── config/Config
                         ├── session/Session
                         ├── http/{Request,JsonResponse,Redirect}
                         ├── security/Csrf
                         ├── support/{ErrorHandler,Logger}
                         └── auth/{AnonymousAuthProvider,VeVitSsoProvider}
```

The only routed endpoint in Task 0.1 is `GET /store/api/health`. It reveals a
service name, application environment and random request ID only. It creates
no database connection and makes no outbound request.

Future store tasks may add order, payment, inventory and download endpoints
under `store/` only after their individual contracts, migrations and threat
models are reviewed.
