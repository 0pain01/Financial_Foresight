import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, PieChart, BarChart3, Target, DollarSign } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, ScatterChart, Scatter, ZAxis } from 'recharts';
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function AnalyticsPage() {
  const [duration, setDuration] = useState("6months");
  
  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: bills } = useQuery({
    queryKey: ["/api/bills"],
  });

  const { data: budgets } = useQuery({
    queryKey: ["/api/budgets"],
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  // Calculate spending trends based on duration
  const calculateSpendingTrends = () => {
    if (!transactions) return [];
    
    const now = new Date();
    let monthsBack = 6; // default
    
    switch (duration) {
      case "3months":
        monthsBack = 3;
        break;
      case "6months":
        monthsBack = 6;
        break;
      case "1year":
        monthsBack = 12;
        break;
      default:
        monthsBack = 6;
    }
    
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    
    const filteredTransactions = transactions.filter((transaction: any) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= cutoffDate;
    });
    
    const monthlyData = filteredTransactions.reduce((acc: any, transaction: any) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[monthKey].income += parseFloat(transaction.amount);
      } else {
        acc[monthKey].expenses += parseFloat(transaction.amount);
      }
      
      return acc;
    }, {});
    
    return Object.values(monthlyData).slice(-monthsBack);
  };

  // Calculate category spending
  const calculateCategorySpending = () => {
    if (!transactions) return [];
    
    const categoryData = transactions.reduce((acc: any, transaction: any) => {
      if (transaction.type === 'expense') {
        const category = transaction.category || 'Other';
        if (!acc[category]) {
          acc[category] = { category, amount: 0 };
        }
        acc[category].amount += parseFloat(transaction.amount);
      }
      return acc;
    }, {});
    
    return Object.values(categoryData);
  };

  // Calculate budget progress
  const calculateBudgetProgress = () => {
    if (!budgets || !transactions) return [];
    
    return budgets.map((budget: any) => {
      const spent = transactions
        .filter((t: any) => t.category === budget.category && t.type === 'expense')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
      
      const budgetAmount = parseFloat(budget.amount);
      const progress = (spent / budgetAmount) * 100;
      
      return {
        ...budget,
        spent,
        progress: Math.min(progress, 100),
        remaining: Math.max(budgetAmount - spent, 0)
      };
    });
  };

  const spendingTrends = calculateSpendingTrends();
  const categorySpending = calculateCategorySpending();
  const budgetProgress = calculateBudgetProgress();

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">Deep insights into your financial patterns</p>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="duration">Duration:</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dashboardData?.totalBalance || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dashboardData?.monthlyIncome || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dashboardData?.monthlyExpenses || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData ? 
                        Math.round(((dashboardData.monthlyIncome - dashboardData.monthlyExpenses) / dashboardData.monthlyIncome) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Spending Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Spending Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spendingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Spending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 3D Spending Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                3D Spending Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="amount" name="Amount" />
                  <YAxis type="number" dataKey="category" name="Category" />
                  <ZAxis type="number" dataKey="date" name="Date" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Transactions" data={transactions?.map((t: any) => ({
                    amount: parseFloat(t.amount),
                    category: t.category,
                    date: new Date(t.date).getTime(),
                    type: t.type
                  })) || []} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Budget Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetProgress.length > 0 ? (
                  budgetProgress.map((budget: any) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{budget.category}</h3>
                        <Badge variant={budget.progress > 100 ? "destructive" : budget.progress > 80 ? "default" : "secondary"}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                        </Badge>
                      </div>
                      <Progress value={budget.progress} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{budget.progress.toFixed(1)}% used</span>
                        <span>{formatCurrency(budget.remaining)} remaining</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No budgets set yet. Create your first budget to track spending!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}