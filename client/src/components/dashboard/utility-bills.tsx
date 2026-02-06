import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Droplets, Wifi, Car } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UtilityBillsProps {
  onAddBill: () => void;
}

export default function UtilityBills({ onAddBill }: UtilityBillsProps) {
  const { data: bills, isLoading } = useQuery({
    queryKey: ["/api/bills"],
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Utility Bills & Subscriptions</h2>
          <Button onClick={onAddBill} className="bg-finance-blue hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const iconMap: Record<string, any> = {
    "electricity": Zap,
    "water": Droplets,
    "internet": Wifi,
    "car": Car
  };

  const colorMap: Record<string, string> = {
    "electricity": "bg-yellow-100 text-yellow-600",
    "water": "bg-blue-100 text-blue-600",
    "internet": "bg-purple-100 text-purple-600",
    "car": "bg-red-100 text-red-600"
  };

  const statusColors: Record<string, string> = {
    "paid": "bg-green-100 text-green-800",
    "pending": "bg-yellow-100 text-yellow-800",
    "overdue": "bg-red-100 text-red-800"
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Utility Bills & Subscriptions</h2>
        <Button onClick={onAddBill} className="bg-finance-blue hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Bill
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColorClass}`}>
                      {bill.status === 'paid' ? 'Paid' : bill.status === 'pending' ? 'Pending' : 'Overdue'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{bill.name}</h3>
                  <p className="text-2xl font-bold text-foreground mb-2">${parseFloat(bill.amount).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <div className="mt-4 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">75% of monthly budget</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No bills found. Add your first bill to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}