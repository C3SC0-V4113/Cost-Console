'use server';

import { isLocale } from './config';
import { setUserLocale } from './locale';

// eslint-disable-next-line react-doctor/server-auth-actions -- This action only writes a validated, non-sensitive UI locale cookie.
export async function changeLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) {
    return;
  }

  await setUserLocale(locale);
}
