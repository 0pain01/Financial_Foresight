export interface Transaction {
  id: number;
  userId: number;
  amount: string;
  description: string;
  category: string;
  type: string;
  date: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface Bill {
  id: number;
  userId: number;
  name: string;
  amount: string;
  category: string;
  dueDate: string;
  status: string;
  isRecurring: boolean;
  autoPayEnabled: boolean;
  icon?: string;
  color?: string;
}

export interface Income {
  id: number;
  userId: number;
  source: string;
  amount: string;
  frequency: string;
  isActive: boolean;
}

export interface Investment {
  id: number;
  userId: number;
  symbol: string;
  name: string;
  type: string;
  shares?: string;
  avgCost?: string;
  currentValue?: string;
}

export interface Budget {
  id: number;
  userId: number;
  category: string;
  amount: string;
  period: string;
  spent: string;
}

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  categoryBreakdown: Record<string, number>;
  totalInvestments: number;
  recentTransactions: Transaction[];
}

export interface SavingsData {
  currentSavingsRate: number;
  projectedMonthlySavings: number;
  projectedAnnualSavings: number;
  recommendedInvestmentAmount: number;
  investmentRecommendations: string[];
}

export interface NetWorthData {
  projectedNetWorth: {
    oneYear: number;
    fiveYears: number;
    tenYears: number;
  };
  futureNetWorth: {
    oneYear: number;
    fiveYears: number;
    tenYears: number;
  };
}

export interface InsightsData {
  insights: string[];
  recommendations: string[];
}

export interface CsvImportResponse {
  imported: number;
  total: number;
}