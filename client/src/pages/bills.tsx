import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Droplets, Wifi, Car, Phone, Shield, Tv, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddBillModal from "@/components/modals/add-bill-modal";
import EditBillModal from "@/components/modals/edit-bill-modal";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function BillsPage() {
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();

  const { data: bills, isLoading } = useQuery({
    queryKey: ["/api/bills"],
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Bill deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete bill: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleEdit = (bill: any) => {
    setSelectedBill(bill);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      deleteBillMutation.mutate(id);
    }
  };

  // Remove the old formatCurrency function since we're using the context version

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const iconMap: Record<string, any> = {
    "electricity": Zap,
    "water": Droplets,
    "internet": Wifi,
    "car": Car,
    "phone": Phone,
    "insurance": Shield,
    "subscription": Tv
  };

  const colorMap: Record<string, string> = {
    "electricity": "bg-yellow-100 text-yellow-600",
    "water": "bg-blue-100 text-blue-600",
    "internet": "bg-purple-100 text-purple-600",
    "car": "bg-red-100 text-red-600",
    "phone": "bg-green-100 text-green-600",
    "insurance": "bg-orange-100 text-orange-600",
    "subscription": "bg-indigo-100 text-indigo-600"
  };

  const statusColors: Record<string, string> = {
    "paid": "bg-green-100 text-green-800",
    "pending": "bg-yellow-100 text-yellow-800",
    "overdue": "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Bills & Utilities</h1>
          <p className="text-muted-foreground">Manage your recurring bills and subscriptions</p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={() => setIsBillModalOpen(true)} className="bg-finance-blue hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Bill
            </Button>
          </div>
                      <div className="text-sm text-muted-foreground">
            {bills ? `${bills.length} bills` : '0 bills'}
          </div>
        </div>

        {/* Bills Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bills && bills.length > 0 ? (
              bills.map((bill: any) => {
                const IconComponent = iconMap[bill.category.toLowerCase()] || Zap;
                        const iconColorClass = colorMap[bill.category.toLowerCase()] || "bg-muted text-muted-foreground";
        const statusColorClass = statusColors[bill.status] || "bg-muted text-foreground";

                return (
                  <Card key={bill.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${iconColorClass} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={statusColorClass}>
                            {bill.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(bill)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(bill.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-2">{bill.name}</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                                                      <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="font-semibold text-foreground">{formatCurrency(bill.amount)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                                                      <span className="text-sm text-muted-foreground">Due Date</span>
                            <span className="text-sm text-foreground">{formatDate(bill.dueDate)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                                                      <span className="text-sm text-muted-foreground">Recurring</span>
                            <span className="text-sm text-foreground">{bill.isRecurring ? 'Yes' : 'No'}</span>
                        </div>
                        
                        {bill.isRecurring && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Auto-pay</span>
                            <span className="text-sm text-foreground">{bill.autoPayEnabled ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">No bills found. Add your first bill to get started!</p>
                <Button onClick={() => setIsBillModalOpen(true)} className="bg-finance-blue hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bill
                </Button>
              </div>
            )}
          </div>
        )}
        </div>
      </main>

      {/* Modals */}
      <AddBillModal 
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
      />
      <EditBillModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bill={selectedBill}
      />
    </div>
  );
}