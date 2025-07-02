// app/utils/loadWeekData.ts
import { weekDataMap } from './weekDataMap';

export async function loadWeekData(week: number): Promise<any> {
  const loader = weekDataMap[week];
  if (!loader) {
    throw new Error(`Week ${week} not found in curriculum`);
  }

  try {
    const module = await loader();
    // Normalize both web (bundled) and native (Metro) behavior
    // by returning the object's default export when present.
    return (module as any).default ?? module;
  } catch (err) {
    console.error(`❌ Failed to load week ${week}:`, err);
    throw new Error('Week data not found');
  }
}
