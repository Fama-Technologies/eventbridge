const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function formatAvailability(activeDays?: number[] | null): string {
  if (!activeDays || activeDays.length === 0) return 'Check availability';

  const uniqueSorted = Array.from(new Set(activeDays))
    .filter((day) => day >= 0 && day <= 6)
    .sort((a, b) => a - b);

  if (uniqueSorted.length === 0) return 'Check availability';
  if (uniqueSorted.length === 7) return 'Mon-Sun';

  let isContiguous = true;
  for (let i = 1; i < uniqueSorted.length; i += 1) {
    if (uniqueSorted[i] !== uniqueSorted[i - 1] + 1) {
      isContiguous = false;
      break;
    }
  }

  if (isContiguous) {
    return `${DAY_LABELS[uniqueSorted[0]]}-${DAY_LABELS[uniqueSorted[uniqueSorted.length - 1]]}`;
  }

  return uniqueSorted.map((day) => DAY_LABELS[day]).join(', ');
}
