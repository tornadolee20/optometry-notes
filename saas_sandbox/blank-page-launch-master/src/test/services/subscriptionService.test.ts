import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateSubscriptionStatus } from '@/services/subscriptionService';

const future = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString();
const past = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

describe('evaluateSubscriptionStatus', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const cases: Array<{
    name: string;
    status: string | null;
    expiresAt: string | null;
    expected: boolean;
    warns?: boolean;
  }> = [
    {
      name: 'active + future expires_at → true',
      status: 'active',
      expiresAt: future(30),
      expected: true,
    },
    {
      name: 'active + past expires_at 2 days → true with warning',
      status: 'active',
      expiresAt: past(2),
      expected: true,
      warns: false, // <7 days, no warning
    },
    {
      name: 'active + past expires_at 10 days → true with warning',
      status: 'active',
      expiresAt: past(10),
      expected: true,
      warns: true,
    },
    {
      name: 'trial + future expires_at → true',
      status: 'trial',
      expiresAt: future(5),
      expected: true,
    },
    {
      name: 'trial + past expires_at → false',
      status: 'trial',
      expiresAt: past(1),
      expected: false,
    },
    {
      name: 'past_due + future expires_at → false',
      status: 'past_due',
      expiresAt: future(10),
      expected: false,
    },
    {
      name: 'canceled + future expires_at → false',
      status: 'canceled',
      expiresAt: future(30),
      expected: false,
    },
    {
      name: 'expired + future expires_at → false',
      status: 'expired',
      expiresAt: future(5),
      expected: false,
    },
    {
      name: 'expired + past expires_at → false',
      status: 'expired',
      expiresAt: past(5),
      expected: false,
    },
    {
      name: 'null status + future expires_at → false with warning',
      status: null,
      expiresAt: future(10),
      expected: false,
      warns: true,
    },
    {
      name: 'unknown status + future expires_at → false with warning',
      status: 'something_random',
      expiresAt: future(10),
      expected: false,
      warns: true,
    },
    {
      name: 'null status + null expires_at → false',
      status: null,
      expiresAt: null,
      expected: false,
    },
  ];

  cases.forEach(({ name, status, expiresAt, expected, warns }) => {
    it(name, () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = evaluateSubscriptionStatus(status, expiresAt);
      expect(result).toBe(expected);

      if (warns) {
        expect(warnSpy).toHaveBeenCalled();
      }
    });
  });
});
