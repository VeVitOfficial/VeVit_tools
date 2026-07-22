<?php
// Konfigurace webu. Lze přepsat proměnnými prostředí.

// URL lokálního Ollama serveru (viz https://ollama.com). AI asistent volá tento
// proxy endpoint (api/ai/ollama.php), který předává dotaz na Ollamu a streamuje
// odpověď jako NDJSON.
const OLLAMA_URL = 'http://localhost:11434';

// Výchozí model AI asistenta.
const OLLAMA_MODEL = 'llama3.2';

// Vrátí hodnotu z prostředí nebo výchozí konstantu.
function env(string $key, string $default = ''): string {
    $v = getenv($key);
    return ($v === false || $v === '') ? $default : $v;
}

function ollama_url(): string {
    return env('OLLAMA_URL', OLLAMA_URL);
}

function ollama_model(): string {
    return env('OLLAMA_MODEL', OLLAMA_MODEL);
}