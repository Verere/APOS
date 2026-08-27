const MAX_SYNC_ATTEMPTS = 6;
const DEFAULT_RETRY_DELAYS_MS = [30000, 60000, 120000, 300000, 900000, 1800000];

export function classifySyncError(errorText = '') {
  const message = String(errorText || '').toLowerCase();

  if (!message) return 'TRANSIENT';

  if (
    message.includes('duplicate') ||
    message.includes('already exists') ||
    message.includes('validation failed') ||
    message.includes('invalid') ||
    message.includes('unprocessable') ||
    message.includes('not found') ||
    message.includes('conflict')
  ) {
    return 'CONFLICT';
  }

  if (
    message.includes('db_unavailable') ||
    message.includes('querysrv') ||
    message.includes('eservfail') ||
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('econnreset') ||
    message.includes('temporarily unavailable') ||
    message.includes('429') ||
    message.includes('503') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('504')
  ) {
    return 'TRANSIENT';
  }

  return 'UNKNOWN';
}

export function getRetryDelayMs(attemptNumber = 0) {
  const index = Math.max(0, Math.min(attemptNumber, DEFAULT_RETRY_DELAYS_MS.length - 1));
  return DEFAULT_RETRY_DELAYS_MS[index];
}

export function shouldRetrySync(item, now = Date.now()) {
  if (!item) return false;
  if (item.status === 'SYNCED') return false;

  const attempts = Number(item.attempts || 0);
  if (attempts >= MAX_SYNC_ATTEMPTS) return false;

  if (!item.nextRetryAt) return true;

  const retryAt = new Date(item.nextRetryAt).getTime();
  if (!Number.isFinite(retryAt)) return true;

  return retryAt <= now;
}
