import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function CategoryBreakdown() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryBreakdown = dashboardData?.categoryBreakdown || {};
  const totalExpenses = Object.values(categoryBreakdown).reduce((sum: number, amount: any) => sum + amount, 0);

  const categories = Object.entries(categoryBreakdown).map(([name, amount]: [string, any]) => ({
    name,
    amount: parseFloat(amount),
    percentage: totalExpenses > 0 ? (parseFloat(amount) / totalExpenses) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  const colors = [
    "bg-finance-blue",
    "bg-finance-green", 
    "bg-finance-purple",
    "bg-finance-amber",
    "bg-gray-400"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No expense data available</p>
          ) : (
            categories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                  <span className="text-sm text-foreground">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">${category.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}