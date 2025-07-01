// app/utils/randomDots.ts
export const MIN_DISTANCE = 8;

type DotPosition = { top: string; left: string };

export const generateDotPositions = (count: number, minDist = MIN_DISTANCE): DotPosition[] => {
  const randomValue = () => 10 + Math.random() * 80;
  const positions: { top: number; left: number }[] = [];
  let attempts = 0;
  const maxAttempts = count * 50;

  while (positions.length < count && attempts < maxAttempts) {
    attempts += 1;
    const candidate = { top: randomValue(), left: randomValue() };
    const valid = positions.every((p) => {
      const dx = p.left - candidate.left;
      const dy = p.top - candidate.top;
      return Math.hypot(dx, dy) >= minDist;
    });
    if (valid) {
      positions.push(candidate);
    }
  }

  return positions.map(({ top, left }) => ({
    top: `${top}%`,
    left: `${left}%`,
  }));
};
