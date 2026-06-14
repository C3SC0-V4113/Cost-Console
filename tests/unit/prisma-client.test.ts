import { afterEach, describe, expect, it, vi } from 'vitest';

const constructorSpy = vi.fn();

vi.mock('pg', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention -- mocked module export
  Pool: vi.fn().mockImplementation(function pool() {
    return {};
  }),
}));

vi.mock('@prisma/adapter-pg', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention -- mocked module export
  PrismaPg: vi.fn().mockImplementation(function adapter() {
    return {};
  }),
}));

vi.mock('@/lib/generated/prisma/client', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention -- mocked module export
  PrismaClient: vi.fn().mockImplementation(function client() {
    constructorSpy();
    return { tag: 'prisma-client' };
  }),
}));

describe('prisma client singleton', () => {
  afterEach(() => {
    vi.resetModules();
    delete (globalThis as { prisma?: unknown }).prisma;
    constructorSpy.mockClear();
  });

  it('instantiates the client once', async () => {
    const { prisma } = await import('@/lib/prisma');

    expect(prisma).toBeDefined();
    expect(constructorSpy).toHaveBeenCalledTimes(1);
  });

  it('reuses the cached client across module reloads', async () => {
    const first = (await import('@/lib/prisma')).prisma;

    vi.resetModules();
    const second = (await import('@/lib/prisma')).prisma;

    expect(second).toBe(first);
    expect(constructorSpy).toHaveBeenCalledTimes(1);
  });
});
