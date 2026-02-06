import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import AddInvestmentModal from "@/components/modals/add-investment-modal";
import EditInvestmentModal from "@/components/modals/edit-investment-modal";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

const parseAmount = (value: any) => {
  const n = parseFloat(String(value ?? "0"));
  return Number.isFinite(n) ? n : 0;
};

const getCostBasis = (investment: any) => {
  if (investment.type === "pf") {
    const pfCurrentCompany = parseAmount(investment.pfCurrentCompany);
    const pfPreviousCompany = parseAmount(investment.pfPreviousCompany);
    const contribution = pfCurrentCompany + pfPreviousCompany;
    return contribution > 0 ? contribution : parseAmount(investment.currentValue);
  }
  return parseAmount(investment.shares) * parseAmount(investment.avgCost);
};

export default function InvestmentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [investmentToDelete, setInvestmentToDelete] = useState<any>(null);
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: investments, isLoading } = useQuery({ queryKey: ["/api/investments"] });

  const portfolio = useMemo(() => {
    const items = Array.isArray(investments) ? investments : [];
    const totalValue = items.reduce((sum: number, inv: any) => sum + parseAmount(inv.currentValue), 0);
    const totalCost = items.reduce((sum: number, inv: any) => sum + getCostBasis(inv), 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    return { items, totalValue, totalCost, totalGain, totalGainPercent };
  }, [investments]);

  const getPerformanceColor = (gain: number) => {
    if (gain > 0) return "text-green-600";
    if (gain < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getPerformanceBadge = (gain: number) => {
    if (gain > 0) return "bg-green-100 text-green-800";
    if (gain < 0) return "bg-red-100 text-red-800";
    return "bg-muted text-foreground";
  };

  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:8080/api/investments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (!response.ok) throw new Error("Failed to delete investment");
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) return response.json();
      return { message: "Investment deleted successfully" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-projection"] });
      toast({ title: "Success", description: "Investment deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete investment: ${error.message}`, variant: "destructive" });
    },
  });

  const handleEdit = (investment: any) => {
    setSelectedInvestment(investment);
    setIsEditModalOpen(true);
  };

  const handleDelete = (investment: any) => {
    setInvestmentToDelete(investment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (investmentToDelete) {
      deleteInvestmentMutation.mutate(investmentToDelete.id);
      setIsDeleteDialogOpen(false);
      setInvestmentToDelete(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Investments</h1>
              <p className="text-muted-foreground">Track FD, MF/ETF, PF, and other investment performance with corrected gain calculations.</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-finance-blue hover:bg-blue-700 shadow-sm">
              <Plus className="mr-2 h-4 w-4" />➕ Add Investment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3"><DollarSign className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(portfolio.totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${portfolio.totalGain >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                    {portfolio.totalGain >= 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Gain/Loss</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(portfolio.totalGain)}`}>
                      {portfolio.totalGain >= 0 ? "+" : ""}{formatCurrency(portfolio.totalGain)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3"><Percent className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Portfolio Return</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(portfolio.totalGainPercent)}`}>
                      {portfolio.totalGainPercent >= 0 ? "+" : ""}{portfolio.totalGainPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
              ) : (
                <div className="space-y-4">
                  {portfolio.items.length > 0 ? (
                    portfolio.items.map((investment: any) => {
                      const cost = getCostBasis(investment);
                      const current = parseAmount(investment.currentValue);
                      const gain = current - cost;
                      const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
                      const isPf = investment.type === "pf";
                      const companyType = parseAmount(investment.pfPreviousCompany) > 0 ? "Previous" : "Current";
                      const companyAmount = parseAmount(investment.pfPreviousCompany) > 0
                        ? parseAmount(investment.pfPreviousCompany)
                        : parseAmount(investment.pfCurrentCompany);

                      return (
                        <div key={investment.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">{String(investment.symbol || "NA").substring(0, 2)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-foreground">{investment.symbol}</h3>
                              <Badge variant="secondary">{investment.type}</Badge>
                              {isPf && <Badge className="bg-indigo-100 text-indigo-700">PF @ 8.25%</Badge>}
                            </div>
                            {investment.name && <p className="text-sm text-muted-foreground mt-1">{investment.name}</p>}

                            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                              {isPf ? (
                                <>
                                  <span>{companyType} company contribution: {formatCurrency(companyAmount)}</span>
                                  <span>Current Age: {investment.pfCurrentAge || "-"}</span>
                                  <span>Cost Basis: {formatCurrency(cost)}</span>
                                </>
                              ) : (
                                <>
                                  <span>{investment.shares} units</span>
                                  <span>@ {formatCurrency(investment.avgCost)}</span>
                                  <span>Cost: {formatCurrency(cost)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-foreground">{formatCurrency(current)}</p>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPerformanceBadge(gain)}>{gain >= 0 ? "+" : ""}{formatCurrency(gain)}</Badge>
                              <span className={`text-sm font-medium ${getPerformanceColor(gain)}`}>{gainPercent >= 0 ? "+" : ""}{gainPercent.toFixed(2)}%</span>
                            </div>
                            <div className="flex space-x-1 mt-2 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(investment)} className="h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(investment)} className="h-8 w-8 p-0 text-destructive hover:text-destructive" disabled={deleteInvestmentMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't added any investments yet.</p>
                      <Button onClick={() => setIsAddModalOpen(true)} className="bg-finance-blue hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />➕ Add Investment</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AddInvestmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditInvestmentModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedInvestment(null); }} investment={selectedInvestment} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {investmentToDelete?.symbol} ({investmentToDelete?.name})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
