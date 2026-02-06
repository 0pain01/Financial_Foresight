import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

interface EditInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: any;
}

export default function EditInvestmentModal({ isOpen, onClose, investment }: EditInvestmentModalProps) {
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    type: "",
    shares: "",
    avgCost: "",
    currentValue: "",
    purchaseDate: "",
    pfCurrentAge: "",
    pfCompanyType: "current",
    pfCompanyAmount: "",
  });

  const { getCurrencySymbol } = useCurrency();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (investment) {
      const currentAmount = parseFloat(investment.pfCurrentCompany || "0");
      const previousAmount = parseFloat(investment.pfPreviousCompany || "0");
      const companyType = previousAmount > 0 ? "previous" : "current";
      const companyAmount = companyType === "previous" ? previousAmount : currentAmount;

      setFormData({
        symbol: investment.symbol || "",
        name: investment.name || "",
        type: investment.type || "",
        shares: investment.shares || "",
        avgCost: investment.avgCost || "",
        currentValue: investment.currentValue || "",
        purchaseDate: investment.purchaseDate ? new Date(investment.purchaseDate).toISOString().split("T")[0] : "",
        pfCurrentAge: investment.pfCurrentAge || "",
        pfCompanyType: companyType,
        pfCompanyAmount: String(companyAmount || ""),
      });
    }
  }, [investment]);

  const updateInvestmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const isPf = data.type === "pf";
      const isCurrentCompany = data.pfCompanyType === "current";
      const requestPayload = {
        ...data,
        shares: isPf ? "0" : data.shares,
        avgCost: isPf ? "0" : data.avgCost,
        pfCurrentCompany: isPf ? (isCurrentCompany ? data.pfCompanyAmount : "0") : null,
        pfPreviousCompany: isPf ? (isCurrentCompany ? "0" : data.pfCompanyAmount) : null,
      };

      const response = await fetch(`http://localhost:8080/api/investments/${investment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(requestPayload),
      });
      if (!response.ok) {
        throw new Error("Failed to update investment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-projection"] });
      toast({ title: "Success", description: "Investment updated successfully" });
      onClose();
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update investment: ${error.message}`, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvestmentMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isPfInvestment = formData.type === "pf";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" value={formData.symbol} onChange={(e) => handleInputChange("symbol", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="mutual-fund">Mutual Fund</SelectItem>
                <SelectItem value="fd">Fixed Deposit (FD)</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="pf">PF Account</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isPfInvestment ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="pfCompanyType">PF Company Type</Label>
                <Select value={formData.pfCompanyType} onValueChange={(value) => handleInputChange("pfCompanyType", value)}>
                  <SelectTrigger><SelectValue placeholder="Current or previous company" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Company</SelectItem>
                    <SelectItem value="previous">Previous Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfCompanyAmount">Selected Company PF Amount</Label>
                <Input id="pfCompanyAmount" type="number" step="0.01" value={formData.pfCompanyAmount} onChange={(e) => handleInputChange("pfCompanyAmount", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentValue">Current PF Balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getCurrencySymbol()}</span>
                  <Input id="currentValue" type="number" step="0.01" value={formData.currentValue} onChange={(e) => handleInputChange("currentValue", e.target.value)} className="pl-8" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfCurrentAge">Current Age</Label>
                <Input id="pfCurrentAge" type="number" min="18" max="60" value={formData.pfCurrentAge} onChange={(e) => handleInputChange("pfCurrentAge", e.target.value)} required />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shares">Shares/Units</Label>
                  <Input id="shares" type="number" step="0.01" value={formData.shares} onChange={(e) => handleInputChange("shares", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgCost">Average Cost</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getCurrencySymbol()}</span>
                    <Input id="avgCost" type="number" step="0.01" value={formData.avgCost} onChange={(e) => handleInputChange("avgCost", e.target.value)} className="pl-8" required />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentValue">Current Value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getCurrencySymbol()}</span>
                  <Input id="currentValue" type="number" step="0.01" value={formData.currentValue} onChange={(e) => handleInputChange("currentValue", e.target.value)} className="pl-8" required />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input id="purchaseDate" type="date" value={formData.purchaseDate} onChange={(e) => handleInputChange("purchaseDate", e.target.value)} required />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateInvestmentMutation.isPending}>{updateInvestmentMutation.isPending ? "Updating..." : "Update Investment"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
