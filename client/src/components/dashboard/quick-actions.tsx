import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Target } from "lucide-react";

interface QuickActionsProps {
  onAddTransaction: () => void;
  onUploadCSV: () => void;
  onSetBudget: () => void;
}

export default function QuickActions({ onAddTransaction, onUploadCSV, onSetBudget }: QuickActionsProps) {
  const actions = [
    {
      title: "Add Transaction",
      description: "Manually add income or expense",
      icon: Plus,
      bgColor: "bg-finance-blue bg-opacity-10",
      iconColor: "text-finance-blue",
      onClick: onAddTransaction
    },
    {
      title: "Import CSV",
      description: "Upload bank statement or transaction file",
      icon: Upload,
      bgColor: "bg-finance-green bg-opacity-10",
      iconColor: "text-finance-green",
      onClick: onUploadCSV
    },
    {
      title: "Set Budget Goals",
      description: "Create spending limits for categories",
      icon: Target,
      bgColor: "bg-finance-purple bg-opacity-10",
      iconColor: "text-finance-purple",
      onClick: onSetBudget
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center mr-4`}>
                <action.icon className={`${action.iconColor} h-5 w-5`} />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}