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
    purchaseDate: ""
  });

  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (investment) {
      setFormData({
        symbol: investment.symbol || "",
        name: investment.name || "",
        type: investment.type || "",
        shares: investment.shares || "",
        avgCost: investment.avgCost || "",
        currentValue: investment.currentValue || "",
        purchaseDate: investment.purchaseDate ? new Date(investment.purchaseDate).toISOString().split('T')[0] : ""
      });
    }
  }, [investment]);

  const updateInvestmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`http://localhost:8080/api/investments/${investment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update investment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Investment updated successfully"
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update investment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvestmentMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange("symbol", e.target.value)}
                placeholder="AAPL"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Apple Inc."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="mutual-fund">Mutual Fund</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shares">Shares</Label>
              <Input
                id="shares"
                type="number"
                step="0.01"
                value={formData.shares}
                onChange={(e) => handleInputChange("shares", e.target.value)}
                placeholder="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgCost">Average Cost</Label>
              <Input
                id="avgCost"
                type="number"
                step="0.01"
                value={formData.avgCost}
                onChange={(e) => handleInputChange("avgCost", e.target.value)}
                placeholder="150.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentValue">Current Value</Label>
            <Input
              id="currentValue"
              type="number"
              step="0.01"
              value={formData.currentValue}
              onChange={(e) => handleInputChange("currentValue", e.target.value)}
              placeholder="1600.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateInvestmentMutation.isPending}>
              {updateInvestmentMutation.isPending ? "Updating..." : "Update Investment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}