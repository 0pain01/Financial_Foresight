import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Utensils, Building, Fuel, ShoppingBag, Car, CreditCard, Receipt, Home } from "lucide-react";
import { Link } from "wouter";

export default function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const iconMap: Record<string, any> = {
    "Food & Dining": Utensils,
    "Transportation": Car,
    "Shopping": ShoppingBag,
    "Bills & Utilities": Receipt,
    "Housing": Home,
    "Income": Building,
    "Entertainment": Utensils,
    "Healthcare": Building,
    "Other": CreditCard
  };

  const colorMap: Record<string, string> = {
    "Food & Dining": "bg-red-100 text-red-600",
    "Transportation": "bg-blue-100 text-blue-600",
    "Shopping": "bg-purple-100 text-purple-600",
    "Bills & Utilities": "bg-yellow-100 text-yellow-600",
    "Housing": "bg-green-100 text-green-600",
    "Income": "bg-emerald-100 text-emerald-600",
    "Entertainment": "bg-pink-100 text-pink-600",
    "Healthcare": "bg-indigo-100 text-indigo-600",
            "Other": "bg-muted text-foreground"
  };

  const recentTransactions = transactions ? transactions.slice(-5).reverse() : [];

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
          <Link href="/transactions" className="text-finance-blue text-sm font-medium hover:text-blue-700">View All</Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {recentTransactions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
            No transactions yet. Start by adding your first transaction!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTransactions.map((transaction: any) => {
              const IconComponent = iconMap[transaction.category] || CreditCard;
              const colorClass = colorMap[transaction.category] || "bg-muted text-foreground";
              const amount = parseFloat(transaction.amount);
              const isIncome = transaction.type === 'income';

              return (
                <div key={transaction.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                                        <h3 className="font-medium text-foreground">{transaction.description}</h3>
                  <p className="text-sm text-muted-foreground">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${isIncome ? 'text-finance-green' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}${amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.paymentMethod || 'Unknown'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}