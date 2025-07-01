// app/utils/loadWeekData.ts

import { weekDataMap } from './weekDataMap';

/**
 * Loads a specific week's curriculum data using the pre-generated static import map.
 */
export async function loadWeekData(week: number): Promise<any> {
  const loader = weekDataMap[week];
  if (!loader) {
    throw new Error(`Week ${week} not found in curriculum`);
  }

  try {
    const module = await loader();
    return module.default;
  } catch (err) {
    console.error(`❌ Failed to load week ${week}:`, err);
    throw new Error('Week data not found');
  }
}
