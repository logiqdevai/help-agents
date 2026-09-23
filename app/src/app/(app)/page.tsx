import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Metric names follow docs/Product_Specification.md §4 (Dashboard). No real data yet.
const DashboardMetrics = [
  "Calls today",
  "Successful calls",
  "Interested leads",
  "Appointments booked",
  "Average call length",
  "AI cost today",
];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DashboardMetrics.map((label) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl font-light tracking-tight">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
