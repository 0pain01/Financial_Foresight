import { ComponentType, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueries } from "@tanstack/react-query";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Landmark, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Bill, Investment, Transaction } from "@/types/api";

type SummaryCard = {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
  hint?: string;
};

const LIABILITY_KEYWORDS = ["emi", "loan", "credit", "card", "debt", "mortgage"];

const chartColors = ["#2563eb", "#ef4444", "#10b981", "#a855f7", "#f59e0b"];

const parseAmount = (value?: string | null) => {
  if (!value) return 0;
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const isCurrentMonth = (dateStr?: string) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

const isOverdue = (bill: Bill) => {
  if (!bill?.dueDate) return false;
  if (bill.status?.toLowerCase() === "paid") return false;
  return new Date(bill.dueDate) < new Date();
};

const isLiabilityCategory = (category?: string) =>
  LIABILITY_KEYWORDS.some((keyword) => (category || "").toLowerCase().includes(keyword));

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { formatCurrency } = useCurrency();

  const results = useQueries({
    queries: [
      { queryKey: ["/api/transactions"] },
      { queryKey: ["/api/bills"] },
      { queryKey: ["/api/investments"] },
    ],
  });

  const [transactionsQuery, billsQuery, investmentsQuery] = results;
  const transactions = (transactionsQuery.data as Transaction[] | undefined) ?? [];
  const bills = (billsQuery.data as Bill[] | undefined) ?? [];
  const investments = (investmentsQuery.data as Investment[] | undefined) ?? [];

  const anyLoading = results.some((query) => query.isLoading);
  const sourceErrors = [
    transactionsQuery.error ? "Transactions" : null,
    billsQuery.error ? "Bills & Utilities" : null,
    investmentsQuery.error ? "Investments" : null,
  ].filter(Boolean) as string[];

  const aggregated = useMemo(() => {
    const incomeTransactions = transactions.filter((txn) => txn.type?.toLowerCase() === "income");
    const expenseTransactions = transactions.filter((txn) => txn.type?.toLowerCase() === "expense");

    const monthlyIncome = incomeTransactions.filter((txn) => isCurrentMonth(txn.date)).reduce((sum, txn) => sum + parseAmount(txn.amount), 0);
    const monthlyExpenseTransactions = expenseTransactions
      .filter((txn) => isCurrentMonth(txn.date))
      .reduce((sum, txn) => sum + parseAmount(txn.amount), 0);

    const currentInvestmentValue = investments.reduce((sum, investment) => sum + parseAmount(investment.currentValue), 0);

    const totalInvestedAmount = investments.reduce((sum, investment) => {
      const shares = parseAmount(investment.shares);
      const avgCost = parseAmount(investment.avgCost);
      const principal = shares > 0 && avgCost > 0 ? shares * avgCost : parseAmount(investment.currentValue);
      return sum + principal;
    }, 0);

    const cashBalance = transactions.reduce((sum, txn) => {
      const amount = parseAmount(txn.amount);
      return txn.type?.toLowerCase() === "income" ? sum + amount : sum - amount;
    }, 0);

    const totalAssets = currentInvestmentValue + Math.max(cashBalance, 0);

    const liabilityFromTransactions = expenseTransactions
      .filter((txn) => isLiabilityCategory(txn.category) || isLiabilityCategory(txn.description))
      .reduce((sum, txn) => sum + parseAmount(txn.amount), 0);

    const liabilityFromBills = bills
      .filter((bill) => isLiabilityCategory(bill.category) || isLiabilityCategory(bill.name))
      .reduce((sum, bill) => sum + parseAmount(bill.amount), 0);

    const totalLiabilities = liabilityFromTransactions + liabilityFromBills;
    const netWorth = totalAssets - totalLiabilities;

    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const prevMonthIncome = incomeTransactions
      .filter((txn) => {
        const date = new Date(txn.date);
        return date.getMonth() === previousMonth.getMonth() && date.getFullYear() === previousMonth.getFullYear();
      })
      .reduce((sum, txn) => sum + parseAmount(txn.amount), 0);

    const prevMonthExpenses = expenseTransactions
      .filter((txn) => {
        const date = new Date(txn.date);
        return date.getMonth() === previousMonth.getMonth() && date.getFullYear() === previousMonth.getFullYear();
      })
      .reduce((sum, txn) => sum + parseAmount(txn.amount), 0);

    const netWorthTrend = monthlyIncome - monthlyExpenseTransactions - (prevMonthIncome - prevMonthExpenses);

    const investmentAllocationMap = investments.reduce<Record<string, number>>((acc, investment) => {
      const rawType = (investment.type || "Other").toLowerCase();
      const type = rawType.includes("pf")
        ? "PF"
        : rawType.includes("mf") || rawType.includes("mutual")
          ? "MF"
          : rawType.includes("stock")
            ? "Stocks"
            : "Other";
      acc[type] = (acc[type] || 0) + parseAmount(investment.currentValue);
      return acc;
    }, {});

    const investmentAllocation = Object.entries(investmentAllocationMap).map(([name, value]) => ({ name, value }));

    return {
      monthlyIncome,
      monthlyExpenses: monthlyExpenseTransactions,
      totalAssets,
      totalLiabilities,
      netWorth,
      currentInvestmentValue,
      totalInvestedAmount,
      netWorthTrend,
      overdueBills: bills.filter(isOverdue),
      negativeCashFlow: monthlyIncome - monthlyExpenseTransactions < 0,
      investmentAllocation,
    };
  }, [bills, investments, transactions]);

  const summaryCards: SummaryCard[] = [
    {
      title: "Net Worth",
      value: formatCurrency(aggregated.netWorth),
      icon: Wallet,
      onClick: () => navigate("/insights"),
      hint: aggregated.netWorthTrend === 0 ? "No change vs last month" : `${aggregated.netWorthTrend > 0 ? "Up" : "Down"} vs last month`,
    },
    { title: "Total Assets", value: formatCurrency(aggregated.totalAssets), icon: TrendingUp },
    { title: "Total Liabilities", value: formatCurrency(aggregated.totalLiabilities), icon: TrendingDown },
    { title: "Monthly Income", value: formatCurrency(aggregated.monthlyIncome), icon: Landmark },
    {
      title: "Monthly Expenses",
      value: formatCurrency(aggregated.monthlyExpenses),
      icon: ArrowDownRight,
      onClick: () => navigate("/transactions?type=expense"),
    },
    {
      title: "Investments (Current Value)",
      value: formatCurrency(aggregated.currentInvestmentValue),
      icon: ArrowUpRight,
      onClick: () => navigate("/investments"),
    },
    {
      title: "Total Invested Amount",
      value: formatCurrency(aggregated.totalInvestedAmount),
      icon: PiggyBank,
      onClick: () => navigate("/investments"),
    },
  ];

  const incomeExpenseData = [
    { name: "Income", value: aggregated.monthlyIncome },
    { name: "Expense", value: aggregated.monthlyExpenses },
  ];

  const assetsLiabilitiesData = [
    { name: "Assets", value: aggregated.totalAssets },
    { name: "Liabilities", value: aggregated.totalLiabilities },
  ];

  const showEmptyState = !anyLoading && transactions.length === 0 && bills.length === 0 && investments.length === 0;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">A read-only snapshot of your financial heartbeat right now.</p>
          </div>

          {sourceErrors.length > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="p-4 flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Partial data loaded. Could not fetch: {sourceErrors.join(", ")}.
              </CardContent>
            </Card>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {anyLoading
                ? Array.from({ length: 7 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-5 space-y-3">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-3/4" />
                      </CardContent>
                    </Card>
                  ))
                : summaryCards.map((card) => (
                    <Card
                      key={card.title}
                      onClick={card.onClick}
                      className={card.onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{card.title}</p>
                            <p className="text-2xl font-bold">{card.value}</p>
                            {card.hint && <p className="text-xs text-muted-foreground mt-1">{card.hint}</p>}
                          </div>
                          <card.icon className="h-5 w-5 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Visuals</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Income vs Expense (Current Month)</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  {anyLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incomeExpenseData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assets vs Liabilities</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  {anyLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={assetsLiabilitiesData} dataKey="value" nameKey="name" outerRadius={80} label>
                          {assetsLiabilitiesData.map((_, index) => (
                            <Cell key={index} fill={chartColors[index]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investment Allocation</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  {anyLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : aggregated.investmentAllocation.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data available yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={aggregated.investmentAllocation} dataKey="value" nameKey="name" outerRadius={80} label>
                          {aggregated.investmentAllocation.map((_, index) => (
                            <Cell key={index} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Alerts & Warnings</h2>
            {anyLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="space-y-3">
                {aggregated.monthlyExpenses > aggregated.monthlyIncome && (
                  <Badge variant="destructive" className="w-fit">
                    Expense is higher than income this month.
                  </Badge>
                )}
                {aggregated.overdueBills.length > 0 && (
                  <Badge variant="destructive" className="w-fit">
                    {aggregated.overdueBills.length} overdue bill(s) found.
                  </Badge>
                )}
                {aggregated.negativeCashFlow && (
                  <Badge variant="destructive" className="w-fit">
                    Negative cash flow detected this month.
                  </Badge>
                )}
                {aggregated.monthlyExpenses <= aggregated.monthlyIncome &&
                  aggregated.overdueBills.length === 0 &&
                  !aggregated.negativeCashFlow && (
                    <p className="text-sm text-muted-foreground">No active alerts right now.</p>
                  )}
              </div>
            )}
          </section>

          {showEmptyState && <p className="text-sm text-muted-foreground">No data available yet.</p>}
        </div>
      </main>
    </div>
  );
}
