import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, AlertTriangle, Target, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AIInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/insights"],
  });

  const { data: savingsData } = useQuery({
    queryKey: ["/api/savings-projection"],
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-finance-purple to-finance-blue text-white">
        <CardHeader>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
              <Calculator className="text-white h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold">Financial Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white bg-opacity-10 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
                <div className="h-3 bg-white bg-opacity-20 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'tip': return <Lightbulb className="h-4 w-4" />;
      case 'recommendation': return <TrendingUp className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-500';
      case 'goal': return 'bg-green-500';
      case 'tip': return 'bg-yellow-500';
      case 'recommendation': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-finance-purple to-finance-blue text-white">
      <CardHeader>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
            <Calculator className="text-white h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-semibold">Financial Analysis</CardTitle>
        </div>
        {savingsData && (
          <p className="text-sm opacity-80">
            Annual savings potential: ${(savingsData.projectedAnnualSavings || 0).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights && insights.length > 0 ? (
            insights.slice(0, 3).map((insight: any, index: number) => (
              <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className={`w-6 h-6 ${getInsightColor(insight.type)} rounded-full flex items-center justify-center mr-2`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <h3 className="font-medium">{insight.title}</h3>
                </div>
                <p className="text-sm opacity-90 ml-8">{insight.message}</p>
              </div>
            ))
          ) : (
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <h3 className="font-medium">Getting Started</h3>
              </div>
              <p className="text-sm opacity-90 ml-8">Add some transactions to see personalized insights and recommendations.</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
          <h4 className="font-medium mb-2">Investment Recommendations</h4>
          <div className="text-sm space-y-1">
            {savingsData?.investmentRecommendations?.slice(0, 2).map((rec: string, index: number) => (
              <p key={index} className="opacity-90">• {rec}</p>
            )) || <p className="opacity-90">Add income data to see recommendations</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
