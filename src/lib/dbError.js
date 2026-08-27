const DB_CONNECTIVITY_PATTERNS = [
  'querysrv eservfail',
  'querysrv etimeout',
  'getaddrinfo enotfound',
  'mongonetworkerror',
  'mongodb connection failed',
  'server selection timed out',
  'eservfail',
  'econnrefused',
  'etimedout',
  'enotfound',
  'db_connect_failed',
];

export function isDatabaseConnectivityError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();

  if (!message && !code) return false;

  return DB_CONNECTIVITY_PATTERNS.some((pattern) => {
    return message.includes(pattern) || code.includes(pattern);
  });
}

export function toClientSafeDbError(error, fallback = 'Database is temporarily unavailable. Please check internet connection and try again.') {
  if (isDatabaseConnectivityError(error)) {
    return {
      error: fallback,
      code: 'DB_UNAVAILABLE',
    };
  }

  return null;
}
