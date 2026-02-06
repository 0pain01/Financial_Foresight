import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Download, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import EditTransactionModal from "@/components/modals/edit-transaction-modal";
import CSVUploadModal from "@/components/modals/csv-upload-modal";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function TransactionsPage() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete transaction: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || !selectedCategory || transaction.category === selectedCategory;
    const matchesType = selectedType === "all" || !selectedType || transaction.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  const categories = ["Food & Dining", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Healthcare", "Housing", "Income", "Other"];

  // Remove the old formatCurrency function since we're using the context version

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
              "Other": "bg-muted text-foreground"
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
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
            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
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
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{transaction.description}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className={getCategoryColor(transaction.category)}>
                            {transaction.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(transaction.date)}</span>
                          {transaction.paymentMethod && (
                            <span className="text-sm text-muted-foreground">• {transaction.paymentMethod}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`text-lg font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {transactions && transactions.length > 0 
                        ? "No transactions match your search criteria." 
                        : "No transactions found. Add your first transaction to get started!"
                      }
                    </p>
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
      <EditTransactionModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={selectedTransaction}
      />
      <CSVUploadModal 
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
      />
    </div>
  );
}