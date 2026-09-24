export const DiffKinds = {
  SAME: "same",
  ADDED: "added",
  REMOVED: "removed",
} as const;
export type DiffKind = (typeof DiffKinds)[keyof typeof DiffKinds];

export interface DiffLine {
  kind: DiffKind;
  text: string;
}

export interface LineDiff {
  lines: DiffLine[];
  added: number;
  removed: number;
}

// The table below needs (n + 1) * (m + 1) cells; beyond this the comparison is skipped instead of freezing the page.
const MAX_DIFF_CELLS = 4_000_000;

/**
 * Line-by-line comparison of two texts (longest common subsequence).
 * Returns null when the texts are too large to compare cheaply.
 */
export function diffLines(previous: string, next: string): LineDiff | null {
  const a = previous.split("\n");
  const b = next.split("\n");

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  if ((midA.length + 1) * (midB.length + 1) > MAX_DIFF_CELLS) return null;

  const width = midB.length + 1;
  const table = new Uint32Array((midA.length + 1) * width);
  for (let i = midA.length - 1; i >= 0; i--) {
    for (let j = midB.length - 1; j >= 0; j--) {
      table[i * width + j] =
        midA[i] === midB[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }

  const lines: DiffLine[] = a.slice(0, start).map((text) => ({ kind: DiffKinds.SAME, text }));
  let i = 0;
  let j = 0;
  while (i < midA.length && j < midB.length) {
    if (midA[i] === midB[j]) {
      lines.push({ kind: DiffKinds.SAME, text: midA[i] });
      i++;
      j++;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      lines.push({ kind: DiffKinds.REMOVED, text: midA[i++] });
    } else {
      lines.push({ kind: DiffKinds.ADDED, text: midB[j++] });
    }
  }
  while (i < midA.length) lines.push({ kind: DiffKinds.REMOVED, text: midA[i++] });
  while (j < midB.length) lines.push({ kind: DiffKinds.ADDED, text: midB[j++] });
  for (const text of a.slice(endA)) lines.push({ kind: DiffKinds.SAME, text });

  return {
    lines,
    added: lines.filter((line) => line.kind === DiffKinds.ADDED).length,
    removed: lines.filter((line) => line.kind === DiffKinds.REMOVED).length,
  };
}
