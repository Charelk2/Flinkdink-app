import { generateSessionSlides } from '../generateSessionSlides';
import week011 from '../../src/data/curriculum/term2/weeks/week011';
import { ChildProfile } from '../../src/models/types';

jest.mock('../loadWeekData', () => ({
  loadWeekData: jest.fn(() => Promise.resolve(week011)),
}));

jest.mock('../progress', () => ({
  getTodaySessionCount: jest.fn(() => Promise.resolve(0)),
}));

describe('generateSessionSlides', () => {
  const profile: ChildProfile = {
    id: 'test',
    name: 'Test',
    birthday: '2020-01-01',
    avatar: '😀',
    createdAt: Date.now(),
    startDate: '2020-01-01',
  };

  it('includes at least one math slide for week 11', async () => {
    const slides = await generateSessionSlides(11, profile);
    expect(slides.some((s) => s.type === 'math')).toBe(true);
  });
});
