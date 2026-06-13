import { createUserAuthClient } from '@cesco_valle/identity-auth-sdk/user';

import { PROJECT_SLUG } from './auth-shared';

import type { UserAuthClient } from '@cesco_valle/identity-auth-sdk/user';

// No `server-only`: this module is imported by the Next.js proxy too.

let client: UserAuthClient | undefined;

const IDENTITY_REQUEST_TIMEOUT_MS = 5_000;

export function fetchWithIdentityTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(IDENTITY_REQUEST_TIMEOUT_MS),
  });
}

export function getAuthClient(): UserAuthClient {
  if (!client) {
    const baseUrl = process.env.IDENTITY_URL;
    if (!baseUrl) {
      throw new Error('IDENTITY_URL is not configured');
    }
    client = createUserAuthClient({ baseUrl, fetch: fetchWithIdentityTimeout });
  }
  return client;
}

export async function isSessionValid(cookie: string): Promise<boolean> {
  try {
    return await getAuthClient().hasValidSession(PROJECT_SLUG, { cookie });
  } catch {
    return false;
  }
}
