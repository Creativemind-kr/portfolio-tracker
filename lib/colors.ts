// Validated categorical palette (light mode), fixed order — see dataviz skill reference/palette.md.
// Used as decorative folder/card accents (wayfinding), not as a data-encoded legend,
// so cycling past 8 items is acceptable here.
export const CATEGORICAL_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export function colorForIndex(index: number): string {
  return CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
}
