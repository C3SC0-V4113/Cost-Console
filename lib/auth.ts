import 'server-only';

import { ApiError } from '@cesco_valle/identity-auth-sdk/user';
import { cookies } from 'next/headers';

import { PROJECT_SLUG, SESSION_COOKIE_NAME } from './auth-shared';
import { getAuthClient } from './identity-client';

export { PROJECT_SLUG } from './auth-shared';
export { getAuthClient } from './identity-client';

import type { ProjectAccessResponse } from '@cesco_valle/identity-contracts/project-admin';
import type { ProjectAuthResponse } from '@cesco_valle/identity-contracts/user';

export function applySetCookies(response: Response, setCookie: string[]): void {
  for (const cookie of setCookie) {
    response.headers.append('set-cookie', cookie);
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    const body = error.body as { error?: { issues?: unknown[] } } | null;

    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          issues: body?.error?.issues,
        },
      },
      { status: error.status }
    );
  }

  return Response.json(
    {
      error: {
        code: 'IDENTITY_UNREACHABLE',
        message: 'Could not reach Identity-Service.',
      },
    },
    { status: 502 }
  );
}

export async function getCurrentUser(): Promise<ProjectAuthResponse | null> {
  const cookieStore = await cookies();
  if (!cookieStore.has(SESSION_COOKIE_NAME)) {
    return null;
  }

  const cookie = cookieStore.toString();
  try {
    return await getAuthClient().getMe(PROJECT_SLUG, { cookie });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function getProjectAccess(): Promise<ProjectAccessResponse | null> {
  const cookieStore = await cookies();
  if (!cookieStore.has(SESSION_COOKIE_NAME)) {
    return null;
  }

  const cookie = cookieStore.toString();
  try {
    return await getAuthClient().getAccess(PROJECT_SLUG, { cookie });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function requireSession(): Promise<Response | null> {
  const cookieStore = await cookies();
  if (!cookieStore.has(SESSION_COOKIE_NAME)) {
    return Response.json(
      { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Sign in required.' } },
      { status: 401 }
    );
  }

  const cookie = cookieStore.toString();
  let isValid = false;
  try {
    isValid = await getAuthClient().hasValidSession(PROJECT_SLUG, { cookie });
  } catch {
    isValid = false;
  }

  if (!isValid) {
    return Response.json(
      { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Sign in required.' } },
      { status: 401 }
    );
  }

  return null;
}

export async function requireAdminAccess(): Promise<Response | null> {
  const sessionGuard = await requireSession();

  if (sessionGuard) {
    return sessionGuard;
  }

  let access = null;

  try {
    access = await getProjectAccess();
  } catch {
    access = null;
  }

  if (!access?.access.isAdmin) {
    return Response.json(
      { error: { code: 'FORBIDDEN', message: 'Admin access required.' } },
      { status: 403 }
    );
  }

  return null;
}
