import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Wallet, Landmark } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/contexts/CurrencyContext";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function InsightsPage() {
  const { formatCurrency } = useCurrency();

  const { data: insights } = useQuery({ queryKey: ["/api/insights"] });
  const { data: savingsData } = useQuery({ queryKey: ["/api/savings-projection"] });
  const { data: netWorthData } = useQuery({ queryKey: ["/api/net-worth-projection"] });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertTriangle className="h-5 w-5" />;
      case "goal": return <Target className="h-5 w-5" />;
      case "tip": return <Lightbulb className="h-5 w-5" />;
      case "recommendation": return <TrendingUp className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "alert": return "bg-red-100 text-red-800";
      case "goal": return "bg-green-100 text-green-800";
      case "tip": return "bg-yellow-100 text-yellow-800";
      case "recommendation": return "bg-blue-100 text-blue-800";
      default: return "bg-muted text-foreground";
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Insights & Future Fund Projection</h1>
            <p className="text-muted-foreground">Unified view of savings, investments, PF growth, and debt obligations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"><CardContent className="p-6"><p className="text-sm opacity-90">Savings Rate</p><p className="text-2xl font-bold">{savingsData?.currentSavingsRate?.toFixed(1) || 0}%</p></CardContent></Card>
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"><CardContent className="p-6"><p className="text-sm opacity-90">Monthly Savings</p><p className="text-2xl font-bold">{formatCurrency(netWorthData?.monthlySavings || savingsData?.projectedMonthlySavings || 0)}</p></CardContent></Card>
            <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white"><CardContent className="p-6"><p className="text-sm opacity-90">Monthly Debt/EMI</p><p className="text-2xl font-bold">{formatCurrency(netWorthData?.monthlyDebtObligation || 0)}</p></CardContent></Card>
            <Card className="bg-gradient-to-r from-indigo-500 to-blue-700 text-white"><CardContent className="p-6"><p className="text-sm opacity-90">Current Investment Pool</p><p className="text-2xl font-bold">{formatCurrency(savingsData?.totalInvestments || 0)}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><Landmark className="mr-2 h-5 w-5" />Future Wealth Projection (after debt)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{k:"oneYear", l:"1 Year"},{k:"fiveYears", l:"5 Years"},{k:"tenYears", l:"10 Years"}].map((item) => (
                  <div key={item.k} className="border rounded-lg p-4 bg-muted/20">
                    <p className="text-sm text-muted-foreground">{item.l}</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(netWorthData?.projectedNetWorth?.[item.k] || 0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Debt-adjusted projection from salary + investments</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><Target className="mr-2 h-5 w-5" />PF Retirement Projection</CardTitle></CardHeader>
            <CardContent>
              {savingsData?.pfPrincipal > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Projected using fixed PF interest rate of {savingsData?.pfInterestRate || 8.25}%.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[50, 55, 60].map((age) => (
                      <div key={age} className="rounded-lg border p-4 bg-muted/30">
                        <p className="text-sm text-muted-foreground">At age {age}</p>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(savingsData?.pfRetirementProjection?.[`age${age}`] || 0)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Current PF total considered: {formatCurrency(savingsData?.pfPrincipal || 0)}</p>
                    <p>Current company PF total: {formatCurrency(savingsData?.pfCurrentCompanyTotal || 0)}</p>
                    <p>Previous company PF total: {formatCurrency(savingsData?.pfPreviousCompanyTotal || 0)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Add PF investment entries with current/previous company choice to view age 50-60 retirement projection.</p>
              )}
            </CardContent>
          </Card>


          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                PF Retirement Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savingsData?.pfPrincipal > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Based on your current PF + company contributions and fixed PF interest rate of {savingsData?.pfInterestRate || 8.25}%.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[50, 55, 60].map((age) => (
                      <div key={age} className="rounded-lg border p-4 bg-muted/30">
                        <p className="text-sm text-muted-foreground">At age {age}</p>
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrency(savingsData?.pfRetirementProjection?.[`age${age}`] || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Current PF: {formatCurrency(savingsData?.pfPrincipal || 0)}</p>
                    <p>Current company PF amount: {formatCurrency(savingsData?.pfCurrentCompanyTotal || 0)}</p>
                    <p>Previous company PF amount: {formatCurrency(savingsData?.pfPreviousCompanyTotal || 0)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Add a PF investment with current and previous company details to view retirement projection for ages 50-60.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><Brain className="mr-2 h-5 w-5" />Personalized Insights</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(insights) && insights.length > 0 ? insights.map((insight: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getInsightColor(insight.type)}`}>{getInsightIcon(insight.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{insight.title}</h3>
                          <Badge variant="secondary" className="text-xs">{insight.priority} priority</Badge>
                        </div>
                        <p className="text-muted-foreground">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Add salary, expenses, bills/EMIs, and investment details to generate personalized insights.</p>
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
