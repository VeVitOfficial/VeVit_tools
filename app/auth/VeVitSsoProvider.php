<?php
declare(strict_types=1);
namespace VeVit\App\Auth;

/** Placeholder only: no account API call is defined or attempted in Task 0.1. */
final class VeVitSsoProvider implements AuthProviderInterface {
    public function isAuthenticated(): bool { return false; }
    public function identity(): ?array { return null; }
    public function status(): string { return 'not_configured'; }
}
