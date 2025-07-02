// app/utils/weekDataMap.ts

import week001 from '../src/data/curriculum/term1/weeks/week001';
import week002 from '../src/data/curriculum/term1/weeks/week002';
import week003 from '../src/data/curriculum/term1/weeks/week003';
import week004 from '../src/data/curriculum/term1/weeks/week004';
import week005 from '../src/data/curriculum/term1/weeks/week005';
import week006 from '../src/data/curriculum/term1/weeks/week006';
import week007 from '../src/data/curriculum/term1/weeks/week007';
import week008 from '../src/data/curriculum/term1/weeks/week008';
import week009 from '../src/data/curriculum/term1/weeks/week009';
import week010 from '../src/data/curriculum/term1/weeks/week010';

import week011 from '../src/data/curriculum/term2/weeks/week011';
import week012 from '../src/data/curriculum/term2/weeks/week012';
import week013 from '../src/data/curriculum/term2/weeks/week013';
import week014 from '../src/data/curriculum/term2/weeks/week014';
import week015 from '../src/data/curriculum/term2/weeks/week015';
import week016 from '../src/data/curriculum/term2/weeks/week016';
import week017 from '../src/data/curriculum/term2/weeks/week017';
import week018 from '../src/data/curriculum/term2/weeks/week018';
import week019 from '../src/data/curriculum/term2/weeks/week019';
import week020 from '../src/data/curriculum/term2/weeks/week020';

import week021 from '../src/data/curriculum/term3/weeks/week021';
import week022 from '../src/data/curriculum/term3/weeks/week022';
import week023 from '../src/data/curriculum/term3/weeks/week023';
import week024 from '../src/data/curriculum/term3/weeks/week024';
import week025 from '../src/data/curriculum/term3/weeks/week025';
import week026 from '../src/data/curriculum/term3/weeks/week026';
import week027 from '../src/data/curriculum/term3/weeks/week027';
import week028 from '../src/data/curriculum/term3/weeks/week028';
import week029 from '../src/data/curriculum/term3/weeks/week029';
import week030 from '../src/data/curriculum/term3/weeks/week030';

import week031 from '../src/data/curriculum/term4/weeks/week031';
import week032 from '../src/data/curriculum/term4/weeks/week032';
import week033 from '../src/data/curriculum/term4/weeks/week033';
import week034 from '../src/data/curriculum/term4/weeks/week034';
import week035 from '../src/data/curriculum/term4/weeks/week035';
import week036 from '../src/data/curriculum/term4/weeks/week036';
import week037 from '../src/data/curriculum/term4/weeks/week037';
import week038 from '../src/data/curriculum/term4/weeks/week038';
import week039 from '../src/data/curriculum/term4/weeks/week039';
import week040 from '../src/data/curriculum/term4/weeks/week040';

export const weekDataMap: Record<number, () => Promise<any>> = {
  1: async () => week001,
  2: async () => week002,
  3: async () => week003,
  4: async () => week004,
  5: async () => week005,
  6: async () => week006,
  7: async () => week007,
  8: async () => week008,
  9: async () => week009,
  10: async () => week010,

  11: async () => week011,
  12: async () => week012,
  13: async () => week013,
  14: async () => week014,
  15: async () => week015,
  16: async () => week016,
  17: async () => week017,
  18: async () => week018,
  19: async () => week019,
  20: async () => week020,

  21: async () => week021,
  22: async () => week022,
  23: async () => week023,
  24: async () => week024,
  25: async () => week025,
  26: async () => week026,
  27: async () => week027,
  28: async () => week028,
  29: async () => week029,
  30: async () => week030,

  31: async () => week031,
  32: async () => week032,
  33: async () => week033,
  34: async () => week034,
  35: async () => week035,
  36: async () => week036,
  37: async () => week037,
  38: async () => week038,
  39: async () => week039,
  40: async () => week040,
};
