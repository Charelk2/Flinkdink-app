// app/src/utils/freeContent.ts
export function isWeekFree(term: number, week: number): boolean {
    return term === 1 && week <= 2;
  }
  