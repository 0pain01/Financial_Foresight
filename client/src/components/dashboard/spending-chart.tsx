import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function SpendingChart() {
  const [duration, setDuration] = useState("6months");
  const { formatCurrency } = useCurrency();
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Spending Overview</CardTitle>
            <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Process transactions to create chart data based on duration
  const chartData = transactions ? (() => {
    const now = new Date();
    let monthsBack = 6; // default
    
    switch (duration) {
      case "3months":
        monthsBack = 3;
        break;
      case "6months":
        monthsBack = 6;
        break;
      case "year":
        monthsBack = 12;
        break;
      default:
        monthsBack = 6;
    }
    
    // If no transactions, create empty chart data for the selected period
    if (!transactions || transactions.length === 0) {
      const emptyData = [];
      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        emptyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          expenses: 0,
          income: 0
        });
      }
      return emptyData;
    }
    
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    
    const filteredTransactions = transactions.filter((transaction: any) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= cutoffDate;
    });
    
    const monthlyData: Record<string, { month: string, expenses: number, income: number }> = {};
    
    // Initialize all months in the range with zero values
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = { month: monthKey, expenses: 0, income: 0 };
    }
    
    filteredTransactions.forEach((transaction: any) => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, expenses: 0, income: 0 };
      }
      
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += amount;
      } else {
        monthlyData[monthKey].income += amount;
      }
    });
    
    return Object.values(monthlyData);
  })() : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Spending Overview</CardTitle>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Income"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}