<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

const STORAGE_FILE = sys_get_temp_dir() . '/wc2026-shared-state.php';
const STORAGE_PREFIX = "<?php exit; ?>\n";

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(loadEnvelope());
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond([
        'ok' => false,
        'error' => 'method_not_allowed',
        'message' => 'Use GET to read or POST to save state.'
    ], 405);
}

$payload = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($payload)) {
    respond([
        'ok' => false,
        'error' => 'invalid_json',
        'message' => 'Request body must be valid JSON.'
    ], 400);
}

$action = (string) ($payload['action'] ?? '');
if ($action !== 'replaceState') {
    respond([
        'ok' => false,
        'error' => 'unsupported_action',
        'message' => 'Only replaceState is supported.'
    ], 400);
}

$baseRevision = isset($payload['baseRevision']) ? (int) $payload['baseRevision'] : 0;
$nextState = sanitizeState($payload['state'] ?? null);
if ($nextState === null) {
    respond([
        'ok' => false,
        'error' => 'invalid_state',
        'message' => 'State payload is missing required collections.'
    ], 400);
}

commitState($nextState, $baseRevision);

function commitState(array $state, int $baseRevision): void
{
    $handle = fopen(STORAGE_FILE, 'c+');
    if ($handle === false) {
        respond([
            'ok' => false,
            'error' => 'storage_unavailable',
            'message' => 'Could not open the shared storage file.'
        ], 500);
    }

    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        respond([
            'ok' => false,
            'error' => 'storage_locked',
            'message' => 'Could not lock the shared storage file.'
        ], 500);
    }

    $currentEnvelope = readEnvelopeFromHandle($handle);
    $currentRevision = (int) ($currentEnvelope['revision'] ?? 0);

    if ($currentEnvelope !== null && $baseRevision !== $currentRevision) {
        flock($handle, LOCK_UN);
        fclose($handle);
        respond([
            'ok' => false,
            'error' => 'revision_conflict',
            'message' => 'The shared state changed before this save completed.',
            'conflict' => true,
            'revision' => $currentRevision,
            'state' => $currentEnvelope['state']
        ], 409);
    }

    $nextEnvelope = [
        'ok' => true,
        'revision' => $currentRevision + 1,
        'updatedAt' => gmdate('c'),
        'state' => $state
    ];

    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, STORAGE_PREFIX . json_encode($nextEnvelope, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    respond($nextEnvelope);
}

function loadEnvelope(): array
{
    if (!is_file(STORAGE_FILE)) {
        return [
            'ok' => true,
            'revision' => 0,
            'updatedAt' => null,
            'state' => null
        ];
    }

    $handle = fopen(STORAGE_FILE, 'r');
    if ($handle === false) {
        return [
            'ok' => false,
            'error' => 'storage_unavailable',
            'message' => 'Could not read the shared storage file.'
        ];
    }

    if (!flock($handle, LOCK_SH)) {
        fclose($handle);
        return [
            'ok' => false,
            'error' => 'storage_locked',
            'message' => 'Could not lock the shared storage file.'
        ];
    }

    $envelope = readEnvelopeFromHandle($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    if ($envelope !== null) {
        return $envelope;
    }

    return [
        'ok' => true,
        'revision' => 0,
        'updatedAt' => null,
        'state' => null
    ];
}

function readEnvelopeFromHandle($handle): ?array
{
    rewind($handle);
    $raw = stream_get_contents($handle);
    if ($raw === false) {
        return null;
    }

    $raw = preg_replace('/^<\?php exit; \?>\s*/', '', $raw) ?? '';
    if (trim($raw) === '') {
        return null;
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded) || !isset($decoded['state'])) {
        return null;
    }

    $decoded['ok'] = true;
    $decoded['revision'] = (int) ($decoded['revision'] ?? 0);
    $decoded['updatedAt'] = isset($decoded['updatedAt']) ? (string) $decoded['updatedAt'] : null;
    return $decoded;
}

function sanitizeState($state): ?array
{
    if (!is_array($state)) {
        return null;
    }

    $requiredArrays = ['players', 'groups', 'matches', 'matchPredictions', 'groupPredictions'];
    foreach ($requiredArrays as $key) {
        if (!array_key_exists($key, $state) || !is_array($state[$key])) {
            return null;
        }
    }

    return [
        'players' => array_values($state['players']),
        'groups' => array_values($state['groups']),
        'matches' => array_values($state['matches']),
        'matchPredictions' => array_values($state['matchPredictions']),
        'groupPredictions' => array_values($state['groupPredictions']),
        'scheduleVersion' => (string) ($state['scheduleVersion'] ?? '')
    ];
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}
