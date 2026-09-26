import type { LucideIcon } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RunLedgerRow {
  icon: LucideIcon;
  title: string;
  detail: string;
  time: string;
  /** Shows a small call waveform under the row. */
  waveform?: boolean;
}

export interface RunLedgerContent {
  /** Caption, e.g. "Example run". */
  title: string;
  /** Status pill shown once every row has appeared. */
  doneLabel: string;
  /** Accessible description of the whole example. */
  description: string;
  rows: RunLedgerRow[];
}

export interface MarketingTextItem {
  title: string;
  body: string;
}

export type OrbColorName = "mint" | "peach" | "lavender" | "sky" | "rose";
