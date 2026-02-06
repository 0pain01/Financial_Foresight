import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

const investmentSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  shares: z.string().min(1, "Value is required"),
  avgCost: z.string().min(1, "Value is required"),
  currentValue: z.string().min(1, "Current value is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  pfCurrentAge: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "pf" && !data.pfCurrentAge) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pfCurrentAge"],
      message: "Current age is required for PF projection",
    });
  }
});

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddInvestmentModal({ isOpen, onClose }: AddInvestmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getCurrencySymbol } = useCurrency();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      symbol: "",
      name: "",
      type: "",
      shares: "",
      avgCost: "",
      currentValue: "",
      purchaseDate: "",
      pfCurrentAge: "",
    }
  });

  const selectedType = watch("type");
  const isPfInvestment = selectedType === "pf";

  const addInvestmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof investmentSchema>) => {
      const payload = {
        ...data,
        pfCurrentCompany: data.type === "pf" ? data.avgCost : null,
        pfPreviousCompany: data.type === "pf" ? data.shares : null,
      };
      return apiRequest("POST", "/api/investments", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Investment added successfully"
      });
      reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add investment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof investmentSchema>) => {
    addInvestmentMutation.mutate(data);
  };

  const investmentTypes = [
    { value: "stock", label: "Stock" },
    { value: "etf", label: "ETF" },
    { value: "mutual-fund", label: "Mutual Fund" },
    { value: "bond", label: "Bond" },
    { value: "crypto", label: "Cryptocurrency" },
    { value: "real-estate", label: "Real Estate" },
    { value: "pf", label: "PF Account" },
    { value: "other", label: "Other" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Add Investment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder={isPfInvestment ? "e.g., UAN" : "e.g., AAPL, GOOGL"}
              {...register("symbol")}
              className={errors.symbol ? "border-red-500" : ""}
            />
            {errors.symbol && <p className="text-sm text-red-500 mt-1">{errors.symbol.message}</p>}
          </div>

          <div>
            <Label htmlFor="name">Investment Name</Label>
            <Input
              id="name"
              placeholder={isPfInvestment ? "e.g., Employee Provident Fund" : "e.g., Apple Inc."}
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">Investment Type</Label>
            <Select onValueChange={(value) => setValue("type", value)}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {investmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="shares">{isPfInvestment ? "Previous Company PF Amount" : "Number of Shares"}</Label>
            <Input
              id="shares"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("shares")}
              className={errors.shares ? "border-red-500" : ""}
            />
            {errors.shares && <p className="text-sm text-red-500 mt-1">{errors.shares.message}</p>}
          </div>

          <div>
            <Label htmlFor="avgCost">{isPfInvestment ? "Current Company PF Amount" : "Average Cost per Share"}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">{getCurrencySymbol()}</span>
              <Input
                id="avgCost"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`pl-8 ${errors.avgCost ? "border-red-500" : ""}`}
                {...register("avgCost")}
              />
            </div>
            {errors.avgCost && <p className="text-sm text-red-500 mt-1">{errors.avgCost.message}</p>}
          </div>

          <div>
            <Label htmlFor="currentValue">{isPfInvestment ? "Current PF Balance" : "Current Value"}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">{getCurrencySymbol()}</span>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`pl-8 ${errors.currentValue ? "border-red-500" : ""}`}
                {...register("currentValue")}
              />
            </div>
            {errors.currentValue && <p className="text-sm text-red-500 mt-1">{errors.currentValue.message}</p>}
          </div>

          {isPfInvestment && (
            <div>
              <Label htmlFor="pfCurrentAge">Current Age</Label>
              <Input
                id="pfCurrentAge"
                type="number"
                min="18"
                max="60"
                placeholder="e.g., 32"
                {...register("pfCurrentAge")}
                className={errors.pfCurrentAge ? "border-red-500" : ""}
              />
              {errors.pfCurrentAge && <p className="text-sm text-red-500 mt-1">{errors.pfCurrentAge.message}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              {...register("purchaseDate")}
              className={errors.purchaseDate ? "border-red-500" : ""}
            />
            {errors.purchaseDate && <p className="text-sm text-red-500 mt-1">{errors.purchaseDate.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addInvestmentMutation.isPending}
              className="bg-finance-blue hover:bg-blue-700"
            >
              {addInvestmentMutation.isPending ? "Adding..." : "Add Investment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
