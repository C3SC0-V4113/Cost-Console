import type { ProjectAuthResponse } from '@cesco_valle/identity-contracts/user';

export function getRoleCodes(user: ProjectAuthResponse): string[] {
  return user.membership?.roles.map((role) => role.code) ?? [];
}

export function isProjectAdmin(user: ProjectAuthResponse): boolean {
  return getRoleCodes(user).includes('admin');
}

export function canManagePricingSnapshots(user: ProjectAuthResponse): boolean {
  return isProjectAdmin(user);
}
