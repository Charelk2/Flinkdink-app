// app/utils/weekDataMap.ts

import * as term1 from '../data/curriculum/term1';
import * as term2 from '../data/curriculum/term2';
import * as term3 from '../data/curriculum/term3';
import * as term4 from '../data/curriculum/term4';

export const weekDataMap: { [key: number]: () => Promise<any> } = {
  // Term 1
  1: async () => term1.week001,
  2: async () => term1.week002,
  3: async () => term1.week003,
  4: async () => term1.week004,
  5: async () => term1.week005,
  6: async () => term1.week006,
  7: async () => term1.week007,
  8: async () => term1.week008,
  9: async () => term1.week009,
  10: async () => term1.week010,

  // Term 2
  11: async () => term2.week011,
  12: async () => term2.week012,
  13: async () => term2.week013,
  14: async () => term2.week014,
  15: async () => term2.week015,
  16: async () => term2.week016,
  17: async () => term2.week017,
  18: async () => term2.week018,
  19: async () => term2.week019,
  20: async () => term2.week020,

  // Term 3
  21: async () => term3.week021,
  22: async () => term3.week022,
  23: async () => term3.week023,
  24: async () => term3.week024,
  25: async () => term3.week025,
  26: async () => term3.week026,
  27: async () => term3.week027,
  28: async () => term3.week028,
  29: async () => term3.week029,
  30: async () => term3.week030,

  // Term 4
  31: async () => term4.week031,
  32: async () => term4.week032,
  33: async () => term4.week033,
  34: async () => term4.week034,
  35: async () => term4.week035,
  36: async () => term4.week036,
  37: async () => term4.week037,
  38: async () => term4.week038,
  39: async () => term4.week039,
  40: async () => term4.week040,
};
