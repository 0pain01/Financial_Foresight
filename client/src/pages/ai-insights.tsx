import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/contexts/CurrencyContext";
import { calculateInsightMetrics, defaultAssumptions } from "@/lib/insights-calculations";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

type InsightKey = "netWorth" | "assets" | "debt" | "savings" | "risk";

export default function InsightsPage() {
  const { formatCurrency } = useCurrency();
  const [assumptions, setAssumptions] = useState(defaultAssumptions);
  const [selectedInsight, setSelectedInsight] = useState<InsightKey | null>(null);

  const { data: investments } = useQuery({ queryKey: ["/api/investments"] });
  const { data: bills } = useQuery({ queryKey: ["/api/bills"] });
  const { data: transactions } = useQuery({ queryKey: ["/api/transactions"] });
  const { data: incomes } = useQuery({ queryKey: ["/api/incomes"] });

  const metrics = useMemo(() => calculateInsightMetrics({
    investments: Array.isArray(investments) ? investments : [],
    bills: Array.isArray(bills) ? bills : [],
    transactions: Array.isArray(transactions) ? transactions : [],
    incomes: Array.isArray(incomes) ? incomes : [],
    assumptions,
  }), [investments, bills, transactions, incomes, assumptions]);

  const cards = [
    { key: "netWorth" as const, title: "📈 Projected Net Worth (1 / 5 / 10 years)", value: `${formatCurrency(metrics.projectedNetWorth.one)} / ${formatCurrency(metrics.projectedNetWorth.five)} / ${formatCurrency(metrics.projectedNetWorth.ten)}` },
    { key: "assets" as const, title: "💰 Total Invested Assets", value: formatCurrency(metrics.totalInvestedAssets) },
    { key: "debt" as const, title: "📉 Expected Debt Reduction Timeline", value: metrics.expectedDebtReductionTimelineMonths ? `${metrics.expectedDebtReductionTimelineMonths} months` : "No debt pressure detected" },
    { key: "savings" as const, title: "💸 Monthly Savings Potential", value: formatCurrency(metrics.monthlySavingsPotential) },
    { key: "risk" as const, title: "⚠️ Risk Exposure Summary", value: `Equity-like ${formatCurrency(metrics.riskExposureSummary.equityLikeAssets)} | Stable ${formatCurrency(metrics.riskExposureSummary.stableAssets)}` },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Insights Section</h1>
            <p className="text-muted-foreground">Transparent projections built from investments, bills/utilities, regular expenses, and incomes.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cards.map((card) => (
              <Card key={card.key} className="cursor-pointer hover:border-primary/60 transition-colors" onClick={() => setSelectedInsight(card.key)}>
                <CardHeader><CardTitle className="text-base">{card.title}</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-semibold">{card.value}</p><p className="text-xs text-muted-foreground mt-1">Click to view data sources, formulas, and assumptions.</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={Boolean(selectedInsight)} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insight Explanation & Assumptions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="rounded-md border p-3 bg-muted/20">
              <p className="font-medium mb-1">A. Data Used</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Investments considered: {Array.isArray(investments) ? investments.length : 0}</li>
                <li>Bills & utilities included: {Array.isArray(bills) ? bills.length : 0}</li>
                <li>Expense transactions included: {Array.isArray(transactions) ? transactions.filter((t: any) => String(t.type).toLowerCase() === "expense").length : 0}</li>
                <li>Income records considered: {Array.isArray(incomes) ? incomes.length : 0}</li>
                <li>Assumptions: return {assumptions.expectedReturn}%, inflation {assumptions.inflation}%, expense growth {assumptions.expenseGrowth}%</li>
              </ul>
            </div>

            <div className="rounded-md border p-3 bg-muted/20">
              <p className="font-medium mb-1">B. Calculation Method</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>SIP future value formula: FV = P × [((1+r)^n - 1)/r] × (1+r).</li>
                <li>Compound interest formula: A = P × (1 + r/n)^(nt).</li>
                <li>Net Worth formula: Total Assets − Total Liabilities.</li>
              </ul>
            </div>

            <div className="rounded-md border p-3 bg-muted/20">
              <p className="font-medium mb-1">C. Step-by-Step Breakdown</p>
              <p className="text-muted-foreground">Total monthly SIP/savings considered = {formatCurrency(metrics.monthlySavingsPotential)}</p>
              <p className="text-muted-foreground">Average return assumed = {assumptions.expectedReturn}%</p>
              <p className="text-muted-foreground">Time period = 10 years</p>
              <p className="text-muted-foreground">Projected corpus = {formatCurrency(metrics.sipCorpusExample)}</p>
            </div>

            <div className="rounded-md border p-3 bg-muted/20 space-y-2">
              <p className="font-medium mb-1">D. Adjustable Assumptions</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><Label>Expected return %</Label><Input type="number" value={assumptions.expectedReturn} onChange={(e) => setAssumptions((prev) => ({ ...prev, expectedReturn: Number(e.target.value) }))} /></div>
                <div><Label>Inflation %</Label><Input type="number" value={assumptions.inflation} onChange={(e) => setAssumptions((prev) => ({ ...prev, inflation: Number(e.target.value) }))} /></div>
                <div><Label>Expense growth rate %</Label><Input type="number" value={assumptions.expenseGrowth} onChange={(e) => setAssumptions((prev) => ({ ...prev, expenseGrowth: Number(e.target.value) }))} /></div>
              </div>
              <Button variant="outline" onClick={() => setSelectedInsight(selectedInsight)}>Recalculate instantly</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
