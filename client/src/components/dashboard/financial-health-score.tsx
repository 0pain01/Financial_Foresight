import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, Shield, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function FinancialHealthScore() {
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { data: savingsData } = useQuery({
    queryKey: ["/api/savings-projection"],
  });

  if (!dashboardData || !savingsData) {
    return (
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardHeader>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
              <Heart className="text-white h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold">Financial Health</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-8 bg-white bg-opacity-20 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate financial health score (0-100)
  const savingsRate = savingsData.currentSavingsRate || 0;
  const monthlyIncome = dashboardData.monthlyIncome || 0;
  const monthlyExpenses = dashboardData.monthlyExpenses || 0;
  const totalInvestments = dashboardData.totalInvestments || 0;

  // Health score calculation
  let healthScore = 0;
  
  // Savings rate component (40 points max)
  if (savingsRate >= 20) healthScore += 40;
  else if (savingsRate >= 15) healthScore += 30;
  else if (savingsRate >= 10) healthScore += 20;
  else if (savingsRate >= 5) healthScore += 10;

  // Investment component (30 points max)
  const investmentRatio = totalInvestments / (monthlyIncome * 12);
  if (investmentRatio >= 1) healthScore += 30;
  else if (investmentRatio >= 0.5) healthScore += 20;
  else if (investmentRatio >= 0.25) healthScore += 10;

  // Cash flow component (20 points max)
  const cashFlow = monthlyIncome - monthlyExpenses;
  if (cashFlow > monthlyIncome * 0.3) healthScore += 20;
  else if (cashFlow > monthlyIncome * 0.2) healthScore += 15;
  else if (cashFlow > monthlyIncome * 0.1) healthScore += 10;
  else if (cashFlow > 0) healthScore += 5;

  // Emergency fund component (10 points max)
  const emergencyFund = cashFlow * 6; // Assuming 6 months of positive cash flow
  if (emergencyFund > monthlyExpenses * 6) healthScore += 10;
  else if (emergencyFund > monthlyExpenses * 3) healthScore += 5;

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const metrics = [
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: TrendingUp,
      target: "20%+",
      status: savingsRate >= 20 ? "good" : savingsRate >= 10 ? "fair" : "poor"
    },
    {
      label: "Monthly Cash Flow",
      value: `₹${cashFlow.toLocaleString()}`,
      icon: Shield,
      target: "Positive",
      status: cashFlow > 0 ? "good" : "poor"
    },
    {
      label: "Investment Growth",
      value: `₹${totalInvestments.toLocaleString()}`,
      icon: Target,
      target: "Growing",
      status: totalInvestments > 0 ? "good" : "poor"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
      <CardHeader>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
            <Heart className="text-white h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-semibold">Financial Health</CardTitle>
        </div>
        <p className="text-sm opacity-80">
          Your overall financial wellness score
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Health Score</span>
            <span className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}/100
            </span>
          </div>
          <Progress 
            value={healthScore} 
            className="h-2 bg-white bg-opacity-20"
          />
          <p className="text-xs mt-1 opacity-80">
            {getHealthLabel(healthScore)} financial health
          </p>
        </div>

        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <metric.icon className="h-4 w-4 mr-2" />
                <span className="text-sm">{metric.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{metric.value}</p>
                <p className="text-xs opacity-70">Target: {metric.target}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
          <p className="text-xs">
            {healthScore >= 80 ? "Outstanding! You're on track for financial independence." :
             healthScore >= 60 ? "Good progress! Consider increasing your savings rate." :
             healthScore >= 40 ? "Fair start. Focus on building emergency fund and investments." :
             "Time to take action! Start with a budget and emergency fund."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}