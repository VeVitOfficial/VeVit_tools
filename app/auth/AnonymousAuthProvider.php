<?php
declare(strict_types=1);
namespace VeVit\App\Auth;

final class AnonymousAuthProvider implements AuthProviderInterface {
    public function isAuthenticated(): bool { return false; }
    public function identity(): ?array { return null; }
    public function status(): string { return 'anonymous'; }
}
