// app/utils/weekDataMap.ts

import * as week001 from '../src/data/curriculum/term1/weeks/week001';
import * as week002 from '../src/data/curriculum/term1/weeks/week002';
import * as week003 from '../src/data/curriculum/term1/weeks/week003';
import * as week004 from '../src/data/curriculum/term1/weeks/week004';
import * as week005 from '../src/data/curriculum/term1/weeks/week005';
import * as week006 from '../src/data/curriculum/term1/weeks/week006';
import * as week007 from '../src/data/curriculum/term1/weeks/week007';
import * as week008 from '../src/data/curriculum/term1/weeks/week008';
import * as week009 from '../src/data/curriculum/term1/weeks/week009';
import * as week010 from '../src/data/curriculum/term1/weeks/week010';

import * as week011 from '../src/data/curriculum/term2/weeks/week011';
import * as week012 from '../src/data/curriculum/term2/weeks/week012';
import * as week013 from '../src/data/curriculum/term2/weeks/week013';
import * as week014 from '../src/data/curriculum/term2/weeks/week014';
import * as week015 from '../src/data/curriculum/term2/weeks/week015';
import * as week016 from '../src/data/curriculum/term2/weeks/week016';
import * as week017 from '../src/data/curriculum/term2/weeks/week017';
import * as week018 from '../src/data/curriculum/term2/weeks/week018';
import * as week019 from '../src/data/curriculum/term2/weeks/week019';
import * as week020 from '../src/data/curriculum/term2/weeks/week020';

import * as week021 from '../src/data/curriculum/term3/weeks/week021';
import * as week022 from '../src/data/curriculum/term3/weeks/week022';
import * as week023 from '../src/data/curriculum/term3/weeks/week023';
import * as week024 from '../src/data/curriculum/term3/weeks/week024';
import * as week025 from '../src/data/curriculum/term3/weeks/week025';
import * as week026 from '../src/data/curriculum/term3/weeks/week026';
import * as week027 from '../src/data/curriculum/term3/weeks/week027';
import * as week028 from '../src/data/curriculum/term3/weeks/week028';
import * as week029 from '../src/data/curriculum/term3/weeks/week029';
import * as week030 from '../src/data/curriculum/term3/weeks/week030';

import * as week031 from '../src/data/curriculum/term4/weeks/week031';
import * as week032 from '../src/data/curriculum/term4/weeks/week032';
import * as week033 from '../src/data/curriculum/term4/weeks/week033';
import * as week034 from '../src/data/curriculum/term4/weeks/week034';
import * as week035 from '../src/data/curriculum/term4/weeks/week035';
import * as week036 from '../src/data/curriculum/term4/weeks/week036';
import * as week037 from '../src/data/curriculum/term4/weeks/week037';
import * as week038 from '../src/data/curriculum/term4/weeks/week038';
import * as week039 from '../src/data/curriculum/term4/weeks/week039';
import * as week040 from '../src/data/curriculum/term4/weeks/week040';

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
