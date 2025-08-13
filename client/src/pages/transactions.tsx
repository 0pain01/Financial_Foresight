import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import CSVUploadModal from "@/components/modals/csv-upload-modal";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function TransactionsPage() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Food & Dining": "bg-orange-100 text-orange-800",
      "Transportation": "bg-blue-100 text-blue-800",
      "Shopping": "bg-purple-100 text-purple-800",
      "Bills & Utilities": "bg-green-100 text-green-800",
      "Entertainment": "bg-pink-100 text-pink-800",
      "Healthcare": "bg-red-100 text-red-800",
      "Housing": "bg-yellow-100 text-yellow-800",
      "Income": "bg-emerald-100 text-emerald-800",
      "Other": "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button onClick={() => setIsTransactionModalOpen(true)} className="bg-finance-blue hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
            <Button onClick={() => setIsCSVModalOpen(true)} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-4 border-b animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{transaction.description}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className={getCategoryColor(transaction.category)}>
                            {transaction.category}
                          </Badge>
                          <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                          {transaction.paymentMethod && (
                            <span className="text-sm text-gray-500">• {transaction.paymentMethod}</span>
                          )}
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions found. Add your first transaction to get started!</p>
                    <Button onClick={() => setIsTransactionModalOpen(true)} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>

      {/* Modals */}
      <AddTransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
      <CSVUploadModal 
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
      />
    </div>
  );
}