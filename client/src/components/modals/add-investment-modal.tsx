import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { compoundFutureValue, formatProjectionYears, sipFutureValue, toNumber } from "@/lib/investment-calculations";

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type InvestmentType = "pf" | "mutual-fund" | "stock" | "fd" | "crypto" | "gold" | "other";

const investmentTypeOptions: { value: InvestmentType; label: string }[] = [
  { value: "pf", label: "PF (Provident Fund)" },
  { value: "mutual-fund", label: "MF (Mutual Fund)" },
  { value: "stock", label: "Stocks" },
  { value: "fd", label: "Fixed Deposit (FD)" },
  { value: "crypto", label: "Crypto" },
  { value: "gold", label: "Gold" },
  { value: "other", label: "Other Investments" },
];

const defaultForm = {
  employerName: "",
  pfAccountNumber: "",
  employeeMonthlyContribution: "",
  employerMonthlyContribution: "",
  contributionStartDate: "",
  currentBalance: "",
  interestRate: "8.25",
  fundName: "",
  fundType: "",
  mfInvestmentType: "sip",
  sipAmount: "",
  sipFrequency: "monthly",
  startDate: "",
  navAtPurchase: "",
  expectedAnnualReturn: "12",
  investmentPlatform: "",
  stockName: "",
  quantity: "",
  buyPrice: "",
  buyDate: "",
  exchange: "NSE",
  stockExpectedGrowth: "11",
  investmentName: "",
  category: "",
  amountInvested: "",
  investmentDate: "",
  expectedReturn: "10",
  maturityDate: "",
  notes: "",
};

export default function AddInvestmentModal({ isOpen, onClose }: AddInvestmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();

  const [selectedType, setSelectedType] = useState<InvestmentType | "">("");
  const [form, setForm] = useState(defaultForm);

  const setValue = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const resetModal = () => {
    setSelectedType("");
    setForm(defaultForm);
  };

  const addInvestmentMutation = useMutation({
    mutationFn: async () => {
      let payload: any = {};

      if (selectedType === "pf") {
        const monthlyContribution = toNumber(form.employeeMonthlyContribution) + toNumber(form.employerMonthlyContribution);
        payload = {
          symbol: form.pfAccountNumber || "PF",
          name: form.employerName || "Provident Fund",
          type: "pf",
          shares: "0",
          avgCost: "0",
          currentValue: String(toNumber(form.currentBalance)),
          purchaseDate: form.contributionStartDate,
          pfCurrentAge: "30",
          pfCurrentCompany: String(monthlyContribution),
          pfPreviousCompany: "0",
        };
      } else if (selectedType === "mutual-fund") {
        const baseAmount = form.mfInvestmentType === "sip" ? toNumber(form.sipAmount) : toNumber(form.amountInvested);
        payload = {
          symbol: (form.fundName || "MF").slice(0, 12),
          name: form.fundName,
          type: "mutual-fund",
          shares: String(baseAmount),
          avgCost: String(toNumber(form.navAtPurchase) || 1),
          currentValue: String(baseAmount),
          purchaseDate: form.startDate,
        };
      } else if (selectedType === "stock") {
        payload = {
          symbol: form.stockName,
          name: form.stockName,
          type: "stock",
          shares: String(toNumber(form.quantity)),
          avgCost: String(toNumber(form.buyPrice)),
          currentValue: String(toNumber(form.quantity) * toNumber(form.buyPrice)),
          purchaseDate: form.buyDate,
        };
      } else {
        payload = {
          symbol: (form.investmentName || selectedType || "INV").slice(0, 12),
          name: form.investmentName || `${selectedType} investment`,
          type: selectedType,
          shares: String(toNumber(form.amountInvested) || 1),
          avgCost: "1",
          currentValue: String(toNumber(form.amountInvested)),
          purchaseDate: form.investmentDate,
        };
      }

      return apiRequest("POST", "/api/investments", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-projection"] });
      toast({ title: "Success", description: "Investment added successfully" });
      resetModal();
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: `Failed to add investment: ${error.message}`, variant: "destructive" });
    },
  });

  const pfPreview = useMemo(() => {
    const annualContribution = (toNumber(form.employeeMonthlyContribution) + toNumber(form.employerMonthlyContribution)) * 12;
    const estimatedCorpus = compoundFutureValue(toNumber(form.currentBalance) + annualContribution, toNumber(form.interestRate), 20);
    return { annualContribution, estimatedCorpus };
  }, [form]);

  const mfPreview = useMemo(() => {
    const rate = toNumber(form.expectedAnnualReturn);
    const principal = form.mfInvestmentType === "sip" ? toNumber(form.sipAmount) : toNumber(form.amountInvested);
    return formatProjectionYears.map((years) => ({
      years,
      value: form.mfInvestmentType === "sip" ? sipFutureValue(principal, rate, years, form.sipFrequency === "quarterly" ? 4 : 12) : compoundFutureValue(principal, rate, years),
    }));
  }, [form]);

  const stockPreview = useMemo(() => {
    const invested = toNumber(form.quantity) * toNumber(form.buyPrice);
    const current = compoundFutureValue(invested, toNumber(form.stockExpectedGrowth), 1);
    return { invested, current, gain: current - invested };
  }, [form]);

  const submitDisabled = !selectedType;

  const renderStepTwoForm = () => {
    if (selectedType === "pf") {
      return <div className="space-y-3">
        <Label>Employer Name</Label><Input value={form.employerName} onChange={(e) => setValue("employerName", e.target.value)} />
        <Label>PF Account Number (optional)</Label><Input value={form.pfAccountNumber} onChange={(e) => setValue("pfAccountNumber", e.target.value)} />
        <Label>Employee Monthly Contribution</Label><Input type="number" value={form.employeeMonthlyContribution} onChange={(e) => setValue("employeeMonthlyContribution", e.target.value)} />
        <Label>Employer Monthly Contribution</Label><Input type="number" value={form.employerMonthlyContribution} onChange={(e) => setValue("employerMonthlyContribution", e.target.value)} />
        <Label>Contribution Start Date</Label><Input type="date" value={form.contributionStartDate} onChange={(e) => setValue("contributionStartDate", e.target.value)} />
        <Label>Current Balance (optional)</Label><Input type="number" value={form.currentBalance} onChange={(e) => setValue("currentBalance", e.target.value)} />
        <Label>Interest Rate (%)</Label><Input type="number" value={form.interestRate} onChange={(e) => setValue("interestRate", e.target.value)} />
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <p>Compounding Frequency: <span className="font-medium">Yearly</span></p>
          <p>Annual Contribution Summary: <span className="font-medium">{formatCurrency(pfPreview.annualContribution)}</span></p>
          <p>Estimated Retirement Corpus (20 years): <span className="font-medium">{formatCurrency(pfPreview.estimatedCorpus)}</span></p>
        </div>
      </div>;
    }

    if (selectedType === "mutual-fund") {
      const peak = Math.max(...mfPreview.map((m) => m.value), 1);
      return <div className="space-y-3">
        <Label>Fund Name</Label><Input value={form.fundName} onChange={(e) => setValue("fundName", e.target.value)} />
        <Label>Fund Type</Label>
        <Select onValueChange={(value) => setValue("fundType", value)}>
          <SelectTrigger><SelectValue placeholder="Equity / Debt / Hybrid / Index" /></SelectTrigger>
          <SelectContent>{["Equity", "Debt", "Hybrid", "Index"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
        </Select>
        <Label>Investment Type</Label>
        <Select defaultValue={form.mfInvestmentType} onValueChange={(value) => setValue("mfInvestmentType", value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="sip">SIP</SelectItem><SelectItem value="lumpsum">Lump Sum</SelectItem></SelectContent>
        </Select>
        {form.mfInvestmentType === "sip" ? <>
          <Label>SIP Amount</Label><Input type="number" value={form.sipAmount} onChange={(e) => setValue("sipAmount", e.target.value)} />
          <Label>SIP Frequency</Label>
          <Select defaultValue={form.sipFrequency} onValueChange={(value) => setValue("sipFrequency", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem></SelectContent>
          </Select>
        </> : <>
          <Label>Lump Sum Amount</Label><Input type="number" value={form.amountInvested} onChange={(e) => setValue("amountInvested", e.target.value)} />
        </>}
        <Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setValue("startDate", e.target.value)} />
        <Label>NAV at Purchase (optional)</Label><Input type="number" value={form.navAtPurchase} onChange={(e) => setValue("navAtPurchase", e.target.value)} />
        <Label>Expected Annual Return (%)</Label><Input type="number" value={form.expectedAnnualReturn} onChange={(e) => setValue("expectedAnnualReturn", e.target.value)} />
        <Label>Investment Platform</Label><Input placeholder="Zerodha / Groww / AMC / Other" value={form.investmentPlatform} onChange={(e) => setValue("investmentPlatform", e.target.value)} />
        <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
          <p>Total Invested Amount: <span className="font-medium">{formatCurrency(form.mfInvestmentType === "sip" ? toNumber(form.sipAmount) : toNumber(form.amountInvested))}</span></p>
          {mfPreview.map((row) => <p key={row.years}>Estimated Value in {row.years} years: <span className="font-medium">{formatCurrency(row.value)}</span></p>)}
          <div className="pt-2">
            <p className="mb-1">Growth Curve Preview</p>
            <div className="flex items-end gap-2 h-20">
              {mfPreview.map((row) => <div key={row.years} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${Math.max((row.value / peak) * 100, 8)}%` }} />)}
            </div>
          </div>
        </div>
      </div>;
    }

    if (selectedType === "stock") {
      return <div className="space-y-3">
        <Label>Stock Name / Ticker</Label><Input value={form.stockName} onChange={(e) => setValue("stockName", e.target.value)} />
        <Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setValue("quantity", e.target.value)} />
        <Label>Buy Price</Label><Input type="number" value={form.buyPrice} onChange={(e) => setValue("buyPrice", e.target.value)} />
        <Label>Buy Date</Label><Input type="date" value={form.buyDate} onChange={(e) => setValue("buyDate", e.target.value)} />
        <Label>Exchange</Label>
        <Select defaultValue={form.exchange} onValueChange={(value) => setValue("exchange", value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="NSE">NSE</SelectItem><SelectItem value="BSE">BSE</SelectItem></SelectContent>
        </Select>
        <Label>Expected Annual Growth %</Label><Input type="number" value={form.stockExpectedGrowth} onChange={(e) => setValue("stockExpectedGrowth", e.target.value)} />
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <p>Invested Value: <span className="font-medium">{formatCurrency(stockPreview.invested)}</span></p>
          <p>Current Value (estimated): <span className="font-medium">{formatCurrency(stockPreview.current)}</span></p>
          <p>Unrealized Gain/Loss: <span className="font-medium">{formatCurrency(stockPreview.gain)}</span></p>
        </div>
      </div>;
    }

    return <div className="space-y-3">
      <Label>Investment Name</Label><Input value={form.investmentName} onChange={(e) => setValue("investmentName", e.target.value)} />
      <Label>Category (custom)</Label><Input value={form.category} onChange={(e) => setValue("category", e.target.value)} />
      <Label>Amount Invested</Label><Input type="number" value={form.amountInvested} onChange={(e) => setValue("amountInvested", e.target.value)} />
      <Label>Investment Date</Label><Input type="date" value={form.investmentDate} onChange={(e) => setValue("investmentDate", e.target.value)} />
      <Label>Expected Return (%)</Label><Input type="number" value={form.expectedReturn} onChange={(e) => setValue("expectedReturn", e.target.value)} />
      <Label>Maturity Date (optional)</Label><Input type="date" value={form.maturityDate} onChange={(e) => setValue("maturityDate", e.target.value)} />
      <Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setValue("notes", e.target.value)} />
      <p className="text-xs text-muted-foreground">This category is treated as a flexible generic asset and projected with compound return assumptions.</p>
    </div>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetModal(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">➕ Add Investment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Step 1: Select Investment Type</Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as InvestmentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose PF, MF, Stocks, FD, Crypto, Gold, or Other" />
              </SelectTrigger>
              <SelectContent>
                {investmentTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div>
              <Label className="mb-2 block">Step 2: Fill {investmentTypeOptions.find((item) => item.value === selectedType)?.label} details</Label>
              {renderStepTwoForm()}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { resetModal(); onClose(); }}>Cancel</Button>
            <Button type="button" disabled={submitDisabled || addInvestmentMutation.isPending} onClick={() => addInvestmentMutation.mutate()} className="bg-finance-blue hover:bg-blue-700">
              {addInvestmentMutation.isPending ? "Adding..." : "Add Investment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
