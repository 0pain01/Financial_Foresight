import { compoundFutureValue, sipFutureValue, toNumber } from "@/lib/investment-calculations";

export interface InsightAssumptions {
  expectedReturn: number;
  inflation: number;
  expenseGrowth: number;
}

export const defaultAssumptions: InsightAssumptions = {
  expectedReturn: 11,
  inflation: 5,
  expenseGrowth: 6,
};

const yearlyAdjusted = (value: number, annualPercent: number, years: number) => {
  const rate = annualPercent / 100;
  return value * Math.pow(1 + rate, years);
};

export const calculateInsightMetrics = ({
  investments,
  bills,
  transactions,
  incomes,
  assumptions,
}: {
  investments: any[];
  bills: any[];
  transactions: any[];
  incomes: any[];
  assumptions: InsightAssumptions;
}) => {
  const totalInvestedAssets = investments.reduce((sum, inv) => sum + toNumber(inv.currentValue), 0);

  const monthlyIncome = incomes.reduce((sum, i) => sum + toNumber(i.amount), 0);

  const monthlyExpenseFromTransactions = transactions
    .filter((t) => String(t.type).toLowerCase() === "expense")
    .reduce((sum, t) => sum + toNumber(t.amount), 0);

  const monthlyBills = bills
    .filter((b) => String(b.status).toLowerCase() !== "paid")
    .reduce((sum, b) => sum + toNumber(b.amount), 0);

  const monthlyExpenses = monthlyExpenseFromTransactions + monthlyBills;
  const monthlySavingsPotential = Math.max(monthlyIncome - monthlyExpenses, 0);

  const projectedNetWorth = {
    one: compoundFutureValue(totalInvestedAssets, assumptions.expectedReturn, 1) + yearlyAdjusted(monthlySavingsPotential * 12, assumptions.expectedReturn - assumptions.inflation, 1),
    five: compoundFutureValue(totalInvestedAssets, assumptions.expectedReturn, 5) + yearlyAdjusted(monthlySavingsPotential * 12, assumptions.expectedReturn - assumptions.inflation, 5),
    ten: compoundFutureValue(totalInvestedAssets, assumptions.expectedReturn, 10) + yearlyAdjusted(monthlySavingsPotential * 12, assumptions.expectedReturn - assumptions.inflation, 10),
  };

  const expectedDebtReductionTimelineMonths = monthlyBills > 0 ? Math.ceil((monthlyBills * 12) / Math.max(monthlySavingsPotential * 0.4, 1)) : 0;

  const riskExposureSummary = {
    equityLikeAssets: investments
      .filter((inv) => ["stock", "mutual-fund", "crypto"].includes(String(inv.type).toLowerCase()))
      .reduce((sum, inv) => sum + toNumber(inv.currentValue), 0),
    stableAssets: investments
      .filter((inv) => ["fd", "gold", "pf", "other"].includes(String(inv.type).toLowerCase()))
      .reduce((sum, inv) => sum + toNumber(inv.currentValue), 0),
  };

  const sipCorpusExample = sipFutureValue(monthlySavingsPotential, assumptions.expectedReturn, 10);

  return {
    totalInvestedAssets,
    monthlyIncome,
    monthlyExpenses,
    monthlySavingsPotential,
    projectedNetWorth,
    expectedDebtReductionTimelineMonths,
    riskExposureSummary,
    sipCorpusExample,
  };
};
