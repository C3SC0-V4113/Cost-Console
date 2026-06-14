import { afterEach, describe, expect, it, vi } from 'vitest';

const LOCAL_DEV_DATABASE_URL = 'postgresql://cost_console:cost_console@localhost:5433/cost_console';

const mocks = vi.hoisted(() => ({
  poolSpy: vi.fn(),
  clientSpy: vi.fn(),
}));

vi.mock('pg', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention -- mocked module export
  Pool: vi.fn().mockImplementation(function pool(config: { connectionString?: string }) {
    mocks.poolSpy(config);
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
    mocks.clientSpy();
    return { tag: 'prisma-client' };
  }),
}));

const originalDatabaseUrl = process.env.DATABASE_URL;

describe('prisma client singleton', () => {
  afterEach(() => {
    vi.resetModules();
    delete (globalThis as { prisma?: unknown }).prisma;
    mocks.poolSpy.mockClear();
    mocks.clientSpy.mockClear();
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('instantiates the client once', async () => {
    const { prisma } = await import('@/lib/prisma');

    expect(prisma).toBeDefined();
    expect(mocks.clientSpy).toHaveBeenCalledTimes(1);
  });

  it('reuses the cached client across module reloads', async () => {
    const first = (await import('@/lib/prisma')).prisma;

    vi.resetModules();
    const second = (await import('@/lib/prisma')).prisma;

    expect(second).toBe(first);
    expect(mocks.clientSpy).toHaveBeenCalledTimes(1);
  });

  it('uses the configured DATABASE_URL when present', async () => {
    process.env.DATABASE_URL = 'postgresql://configured:pw@localhost:9999/db';

    await import('@/lib/prisma');

    expect(mocks.poolSpy).toHaveBeenCalledWith({
      connectionString: 'postgresql://configured:pw@localhost:9999/db',
    });
  });

  it('falls back to the local docker database when DATABASE_URL is unset', async () => {
    delete process.env.DATABASE_URL;

    await import('@/lib/prisma');

    expect(mocks.poolSpy).toHaveBeenCalledWith({ connectionString: LOCAL_DEV_DATABASE_URL });
  });
});
