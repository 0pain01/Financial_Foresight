import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, DollarSign } from "lucide-react";

export default function NetWorthProjection() {
  const { data: savingsData, isLoading: savingsLoading } = useQuery({
    queryKey: ["/api/savings-projection"],
  });

  const { data: netWorthData, isLoading: netWorthLoading } = useQuery({
    queryKey: ["/api/net-worth-projection"],
  });

  if (savingsLoading || netWorthLoading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Future Wealth Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white bg-opacity-10 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
                <div className="h-6 bg-white bg-opacity-20 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const savings = savingsData || {};
  const netWorth = netWorthData || {};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const projections = [
    {
      period: "1 Year",
      netWorth: netWorth.projectedNetWorth?.oneYear || 0,
      savings: savings.futureNetWorth?.oneYear || 0,
      icon: Target,
      color: "bg-blue-500"
    },
    {
      period: "5 Years",
      netWorth: netWorth.projectedNetWorth?.fiveYears || 0,
      savings: savings.futureNetWorth?.fiveYears || 0,
      icon: TrendingUp,
      color: "bg-indigo-500"
    },
    {
      period: "10 Years",
      netWorth: netWorth.projectedNetWorth?.tenYears || 0,
      savings: savings.futureNetWorth?.tenYears || 0,
      icon: DollarSign,
      color: "bg-purple-500"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Future Wealth Projection
        </CardTitle>
        <p className="text-emerald-100 text-sm">
          Based on current savings rate: {savings.currentSavingsRate?.toFixed(1) || 0}%
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projections.map((projection, index) => (
            <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${projection.color} rounded-lg flex items-center justify-center mr-3`}>
                    <projection.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{projection.period}</span>
                </div>
              </div>
              <div className="ml-11">
                <p className="text-2xl font-bold">
                  {formatCurrency(projection.netWorth)}
                </p>
                <p className="text-sm text-emerald-100">
                  Total net worth projection
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
          <h4 className="font-medium mb-2">Monthly Progress</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-emerald-100">Monthly Savings</p>
              <p className="font-semibold">{formatCurrency(savings.projectedMonthlySavings || 0)}</p>
            </div>
            <div>
              <p className="text-emerald-100">Investment Target</p>
              <p className="font-semibold">{formatCurrency(savings.recommendedInvestmentAmount || 0)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}