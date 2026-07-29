<?php
declare(strict_types=1);
namespace VeVit\App\Auth;

interface AuthProviderInterface {
    public function isAuthenticated(): bool;
    public function identity(): ?array;
    public function status(): string;
}
