import { setLastViewedWeek, getLastViewedWeek } from '../progress';

const storage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn((key: string) => Promise.resolve(storage[key] ?? null)),
  },
}));

describe('last viewed week persistence', () => {
  it('stores and retrieves the last viewed week', async () => {
    await setLastViewedWeek('p1', 4);
    const week = await getLastViewedWeek('p1');
    expect(week).toBe(4);
  });

  it('defaults to 1 when no value stored', async () => {
    const week = await getLastViewedWeek('unknown');
    expect(week).toBe(1);
  });
});
