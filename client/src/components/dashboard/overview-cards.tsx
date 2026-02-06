import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function OverviewCards() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    totalBalance = 0,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    savingsRate = 0
  } = dashboardData || {};

  const cards = [
    {
      title: "Total Balance",
      value: `$${totalBalance.toLocaleString()}`,
      change: "+2.5% from last month",
      icon: Wallet,
      iconBg: "bg-finance-blue bg-opacity-10",
      iconColor: "text-finance-blue",
      changeColor: "text-finance-green"
    },
    {
      title: "Monthly Income",
      value: `$${monthlyIncome.toLocaleString()}`,
      change: "+1.2% from last month",
      icon: TrendingUp,
      iconBg: "bg-finance-green bg-opacity-10",
      iconColor: "text-finance-green",
      changeColor: "text-finance-green"
    },
    {
      title: "Monthly Expenses",
      value: `$${monthlyExpenses.toLocaleString()}`,
      change: "+8.3% from last month",
      icon: TrendingDown,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      changeColor: "text-red-500"
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      change: "+3.1% from last month",
      icon: PiggyBank,
      iconBg: "bg-finance-purple bg-opacity-10",
      iconColor: "text-finance-purple",
      changeColor: "text-finance-green"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
                <p className={`text-sm mt-1 ${card.changeColor}`}>
                  {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`${card.iconColor} h-6 w-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}