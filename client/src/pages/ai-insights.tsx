import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/contexts/CurrencyContext";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function AIInsightsPage() {
  const { formatCurrency } = useCurrency();
  
  const { data: insights } = useQuery({
    queryKey: ["/api/insights"],
  });

  const { data: savingsData } = useQuery({
    queryKey: ["/api/savings-projection"],
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-5 w-5" />;
      case 'goal': return <Target className="h-5 w-5" />;
      case 'tip': return <Lightbulb className="h-5 w-5" />;
      case 'recommendation': return <TrendingUp className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-800';
      case 'goal': return 'bg-green-100 text-green-800';
      case 'tip': return 'bg-yellow-100 text-yellow-800';
      case 'recommendation': return 'bg-blue-100 text-blue-800';
              default: return 'bg-muted text-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Remove the old formatCurrency function since we're using the context version

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
                      <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-muted-foreground">Intelligent analysis of your financial patterns</p>
          </div>

          {/* Financial Health Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Savings Rate</p>
                    <p className="text-2xl font-bold">
                      {savingsData?.currentSavingsRate?.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Monthly Savings</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(savingsData?.projectedMonthlySavings || 0)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Balance</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(dashboardData?.totalBalance || 0)}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Personalized Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights && insights.length > 0 ? (
                  insights.map((insight: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getInsightColor(insight.type)}`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">{insight.title}</h3>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)}`}></div>
                              <Badge variant="secondary" className="text-xs">
                                {insight.priority} priority
                              </Badge>
                            </div>
                          </div>
                                          <p className="text-muted-foreground mb-3">{insight.message}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                            <span className="mr-4">Category: {insight.type}</span>
                            <span>{insight.icon}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No insights available yet. Add more transactions to generate personalized insights!</p>
                  </div>
                )}
              </div>
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

          {/* Investment Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Investment Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savingsData?.investmentRecommendations?.length > 0 ? (
                  savingsData.investmentRecommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">{recommendation}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Build your income and savings profile to receive personalized investment recommendations.</p>
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